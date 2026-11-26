import { GenerationEngine, type EngineConfig } from "./engine";
import { createGeminiProvider, MODELS } from "./gemini";
import type { FallbackReason } from "../lib/generation/contracts";
import {MetaGenerationEngine} from './meta-engine';
import {createSharedUsage} from './shared-usage';

// The server-only runtime supplies configuration; request data is never consulted.
export function createConfiguredEngine(config: EngineConfig, environment: Record<string, string | undefined>, providerFactory = createGeminiProvider) {
  if(environment.CHOWK_AI_KILL_SWITCH==='true')return new GenerationEngine(config,undefined,'disabled');
  if(environment.CHOWK_AI_ENABLED==='true'&&environment.CHOWK_AI_KILL_SWITCH!=='true'){
    const allowed=(environment.CHOWK_AI_ALLOWED_COUNTRIES??'IN').split(',').filter(c=>/^[A-Z]{2}$/.test(c)&&!['AF','BY','KH','CN','HK','MO','CU','ER','ET','HT','IR','IQ','LY','MM','NI','KP','PK','RU','SO','SY','UA','VE','EH'].includes(c));
    const shared=environment.UPSTASH_REDIS_REST_URL&&environment.UPSTASH_REDIS_REST_TOKEN?createSharedUsage({url:environment.UPSTASH_REDIS_REST_URL,token:environment.UPSTASH_REDIS_REST_TOKEN,sourceSecret:environment.CHOWK_SOURCE_HASH_SECRET??'',epoch:environment.CHOWK_AI_BUDGET_EPOCH??'',maximumCalls:Number(environment.CHOWK_AI_MAX_CALLS??0),maximumMicros:Number(environment.CHOWK_AI_MAX_RESERVATION_MICROS??0),perSourceMinute:Number(environment.CHOWK_AI_SOURCE_CALLS_PER_MINUTE??3)}):undefined;
    return new MetaGenerationEngine({enabled:true,key:()=>environment.META_API_KEY,shared,countries:allowed,imagePolicyReviewed:environment.CHOWK_AI_IMAGE_POLICY==='conceptual-2026-11-reviewed'});
  }
  const apiKey = environment.GEMINI_API_KEY?.trim();
  const unavailable: FallbackReason | undefined = environment.GEMINI_ENABLED !== "true" ? "disabled"
    : !apiKey ? "missing-credentials" : !MODELS.includes(config.model as (typeof MODELS)[number]) ? "configuration" : undefined;
  return new GenerationEngine(config, unavailable ? undefined : providerFactory({ apiKey: apiKey!, model: config.model, maxOutputTokens: config.maxOutputTokens }), unavailable);
}
