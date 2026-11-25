import { GenerationEngine, type EngineConfig } from "./engine";
import { createGeminiProvider, MODELS } from "./gemini";
import type { FallbackReason } from "../lib/generation/contracts";

// The server-only runtime supplies configuration; request data is never consulted.
export function createConfiguredEngine(config: EngineConfig, environment: Record<string, string | undefined>, providerFactory = createGeminiProvider) {
  const apiKey = environment.GEMINI_API_KEY?.trim();
  const unavailable: FallbackReason | undefined = environment.GEMINI_ENABLED !== "true" ? "disabled"
    : !apiKey ? "missing-credentials" : !MODELS.includes(config.model as (typeof MODELS)[number]) ? "configuration" : undefined;
  return new GenerationEngine(config, unavailable ? undefined : providerFactory({ apiKey: apiKey!, model: config.model, maxOutputTokens: config.maxOutputTokens }), unavailable);
}
