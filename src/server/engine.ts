import { createHash } from "node:crypto";
import { fallbackPlan, planToSpec, validatePlan } from "../lib/generation/planner";
import type { Attempt, FallbackReason, GenerationRequest, GenerationResult } from "../lib/generation/contracts";
import { ProviderError, type Provider } from "./gemini";
import { repairGuidance } from "../lib/generation/diagnostics";

export type EngineConfig = { model: string; timeoutMs: number; overallMs: number; rpm: number; dailyCalls: number; tokensPerMinute: number; maxOutputTokens: number; concurrency: number; cacheTtlMs: number; cacheEntries: number };
export const DEFAULT_CONFIG: EngineConfig = { model: "gemini-3.5-flash-lite", timeoutMs: 18000, overallMs: 38000, rpm: 8, dailyCalls: 100, tokensPerMinute: 100000, maxOutputTokens: 4096, concurrency: 2, cacheTtlMs: 120000, cacheEntries: 20 };

export class GenerationEngine {
  private recent: { time: number; tokens: number }[] = [];
  private dayStart = 0;
  private daily = 0;
  private active = 0;
  private cooldownUntil = 0;
  private cache = new Map<string, { time: number; result: GenerationResult }>();
  private inflight = new Map<string, Promise<GenerationResult>>();
  constructor(private config: EngineConfig, private provider?: Provider, private unavailable?: FallbackReason, private now = Date.now) {}

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const start = this.now();
    // Validate local interpretability before spending provider quota. Incomplete
    // input must not become a pretend campaign on either generation path.
    const localPlan = fallbackPlan(request);
    const local = (reason: FallbackReason, attempts: Attempt[] = []): GenerationResult => {
      const plan = localPlan;
      return { spec: planToSpec(plan, request, "deterministic-fallback"), interpretation: plan.interpretation,
        metadata: { source: "deterministic-fallback", model: attempts.length ? this.config.model : null, fallbackReason: reason, totalMs: this.now() - start, attempts, cached: false,
          warnings: ["Local planning separates recognized brief instructions from public copy. Review facts and missing details before publication.", ...plan.interpretation.missingInformation, ...(plan.campaign.supportingText.length > 600 ? ["Detailed copy may exceed a format's readable capacity; exports refuse overflow. Shorten the brief if needed."] : [])] } };
    };
    if (request.mode === "local") return local("requested-local");
    if (!this.provider || this.unavailable) return local(this.unavailable ?? "missing-credentials");
    const key = createHash("sha256").update(JSON.stringify(["gemini", this.config.model, request.topic, request.details, request.taste, request.treatment ?? null])).digest("hex");
    for (const [id, item] of this.cache) if (start - item.time >= this.config.cacheTtlMs) this.cache.delete(id);
    const cached = this.cache.get(key);
    if (cached) return { ...cached.result, metadata: { ...cached.result.metadata, cached: true, totalMs: this.now() - start, attempts: [] } };
    const existing = this.inflight.get(key);
    if (existing) { const result = await existing; return { ...result, metadata: { ...result.metadata, cached: true, totalMs: this.now() - start, attempts: [] } }; }
    if (this.active >= this.config.concurrency) return local("busy");
    this.active++;
    const work = this.run(request, start, local);
    this.inflight.set(key, work);
    try {
      const result = await work;
      if (result.metadata.source === "gemini" && this.config.cacheEntries > 0) {
        while (this.cache.size >= this.config.cacheEntries) this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(key, { time: this.now(), result });
      }
      return result;
    } finally { this.active--; this.inflight.delete(key); }
  }

  private reserve(request: GenerationRequest): FallbackReason | undefined {
    const now = this.now();
    if (now < this.cooldownUntil) return "provider-rate-limit";
    if (now - this.dayStart >= 86400000) { this.dayStart = now; this.daily = 0; }
    this.recent = this.recent.filter((item) => now - item.time < 60000);
    // Conservative character-based reservation includes prompt/schema overhead and the
    // configured maximum output (thinking included). Actual usage is reported separately.
    const tokens = 5000 + Math.ceil((request.topic.length + request.details.length) / 2) + this.config.maxOutputTokens;
    if (this.recent.length >= this.config.rpm || this.daily >= this.config.dailyCalls || this.recent.reduce((n, item) => n + item.tokens, 0) + tokens > this.config.tokensPerMinute) return "local-budget";
    this.daily++; this.recent.push({ time: now, tokens });
  }
  private async run(request: GenerationRequest, start: number, local: (reason: FallbackReason, attempts?: Attempt[]) => GenerationResult): Promise<GenerationResult> {
    const attempts: Attempt[] = []; let repair: string[] | undefined;
    for (let i = 0; i < 2; i++) {
      const remaining = this.config.overallMs - (this.now() - start);
      if (remaining <= 0) return local("timeout", attempts);
      const limited = this.reserve(request); if (limited) return local(limited, attempts);
      const controller = new AbortController(), attemptStart = this.now();
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const timeout = new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { controller.abort(); reject(new ProviderError("timeout")); }, Math.min(remaining, this.config.timeoutMs)); });
        const result = await Promise.race([this.provider!({ request, repair, signal: controller.signal }), timeout]);
        const validated = validatePlan(result.raw, request);
        attempts.push({ outcome: validated.plan ? "accepted" : "validation-failed", elapsedMs: this.now() - attemptStart, usage: result.usage, finishReason: result.finishReason, ...(validated.diagnostics ? { validation: validated.diagnostics } : {}) });
        if (validated.plan) return { spec: planToSpec(validated.plan, request, "gemini"), interpretation: validated.plan.interpretation,
          metadata: { source: "gemini", model: this.config.model, fallbackReason: null, totalMs: this.now() - start, attempts, cached: false,
            warnings: ["Factual safeguards are heuristics; verify copy before publication."] } };
        repair = [...validated.issues, ...(validated.diagnostics ? repairGuidance(validated.diagnostics) : [])];
      } catch (error) {
        const failure = error instanceof ProviderError ? error : new ProviderError("network");
        attempts.push({ outcome: failure.code, elapsedMs: this.now() - attemptStart, usage: failure.usage, finishReason: failure.finishReason, httpStatus: failure.httpStatus });
        if (failure.code === "provider-rate-limit") this.cooldownUntil = this.now() + 60000;
        if (failure.code !== "invalid-output") return local(failure.code, attempts);
        repair = ["invalid-structure"];
      } finally { if (timer) clearTimeout(timer); }
    }
    return local("validation-failed", attempts);
  }
}
