import "server-only";
import { GenerationEngine, DEFAULT_CONFIG, type EngineConfig } from "./engine";
import { createConfiguredEngine } from "./configured-engine";

function bounded(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name]);
  return process.env[name] === undefined || !Number.isFinite(value) ? fallback : Math.max(min, Math.min(max, Math.floor(value)));
}
export function runtimeConfig(): EngineConfig {
  const model = process.env.GEMINI_MODEL || DEFAULT_CONFIG.model;
  const comparison = /3\.8|4-/.test(model);
  return { ...DEFAULT_CONFIG, model,
    timeoutMs: bounded("GEMINI_TIMEOUT_MS", 18000, 1000, 25000),
    overallMs: bounded("GENERATION_TIMEOUT_MS", 38000, 2000, 40000),
    rpm: bounded("GEMINI_RPM_BUDGET", comparison ? 4 : 8, 0, comparison ? 4 : 12),
    dailyCalls: bounded("GEMINI_DAILY_BUDGET", comparison ? 12 : 100, 0, comparison ? 12 : 400),
    tokensPerMinute: bounded("GEMINI_TPM_BUDGET", 100000, 0, 200000),
    maxOutputTokens: bounded("GEMINI_MAX_OUTPUT_TOKENS", 4096, 1024, 8192),
    concurrency: bounded("GEMINI_CONCURRENCY", 2, 1, 3),
  };
}
let singleton: GenerationEngine | undefined;
export function generationEngine() {
  if (singleton) return singleton;
  singleton = createConfiguredEngine(runtimeConfig(), process.env);
  return singleton;
}
