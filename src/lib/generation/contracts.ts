import { z } from "zod";
import { designSchema, designSchemaV1, ILLUSTRATIONS, TASTES } from "../design";
import { artDirectionSchema } from "../design-engine/registry";
import { validationDiagnosticsSchema, type ValidationDiagnostics } from "./diagnostics";

export const generationRequestSchema = z.strictObject({
  topic: z.string().trim().min(1, "Enter a topic.").max(1200),
  details: z.string().trim().max(1200).default(""),
  taste: z.enum(TASTES),
  mode: z.enum(["auto", "local"]).optional(),
}).refine((value) => value.topic.length + value.details.length <= 2200, {
  message: "Keep the combined brief and details within 2200 characters.",
});
export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export const interpretationSchema = z.strictObject({
  objective: z.string().trim().min(1).max(180),
  audience: z.string().trim().min(1).max(180),
  concept: z.string().trim().min(1).max(240),
  assumptions: z.array(z.string().trim().min(1).max(180)).max(5),
  missingInformation: z.array(z.string().trim().min(1).max(180)).max(5),
});
export const incompleteBriefResponseSchema = z.strictObject({
  code: z.literal("brief-incomplete"), error: z.string().min(1).max(240), interpretation: interpretationSchema,
});
export const legacyCreativePlanSchema = z.strictObject({
  interpretation: interpretationSchema,
  taste: z.enum(TASTES),
  campaign: designSchemaV1.shape.campaign.omit({ topic: true }).extend({
    supportingText: z.string().trim().max(2400),
  }),
  palette: designSchemaV1.shape.palette,
  typography: designSchemaV1.shape.typography,
  composition: designSchemaV1.shape.composition,
  decoration: designSchemaV1.shape.decoration.extend({ illustration: z.enum(ILLUSTRATIONS) }),
  rationale: designSchemaV1.shape.rationale,
});
export const creativePlanSchema = legacyCreativePlanSchema.extend({
  artDirection: artDirectionSchema,
  typography: legacyCreativePlanSchema.shape.typography.extend({ family: z.enum(["condensed-sans", "neutral-sans", "editorial-serif", "rounded-sans"]) }),
});
export type CreativePlan = z.infer<typeof legacyCreativePlanSchema> | z.infer<typeof creativePlanSchema>;
export type AdvancedCreativePlan = z.infer<typeof creativePlanSchema>;
export const FALLBACK_REASONS = [
  "missing-credentials", "configuration", "disabled", "local-budget", "busy", "provider-rate-limit",
  "provider-auth", "provider-unavailable", "network", "timeout", "blocked", "invalid-output", "validation-failed", "requested-local",
] as const;
export type FallbackReason = (typeof FALLBACK_REASONS)[number];
export type Usage = { inputTokens: number; outputTokens: number; thinkingTokens: number; totalTokens: number };
export type Attempt = { outcome: "accepted" | FallbackReason; elapsedMs: number; usage?: Usage; finishReason?: string; httpStatus?: number; validation?: ValidationDiagnostics };
export type GenerationResult = {
  spec: z.infer<typeof designSchema>;
  interpretation: z.infer<typeof interpretationSchema>;
  metadata: {
    source: "gemini" | "deterministic-fallback";
    model: string | null;
    fallbackReason: FallbackReason | null;
    totalMs: number;
    attempts: Attempt[];
    cached: boolean;
    warnings: string[];
  };
};
// Validate untrusted HTTP responses before replacing a successfully rendered campaign.
export const generationResultSchema = z.object({
  spec: designSchema,
  interpretation: interpretationSchema,
  metadata: z.object({
    source: z.enum(["gemini", "deterministic-fallback"]), model: z.string().nullable(),
    fallbackReason: z.enum(FALLBACK_REASONS).nullable(), totalMs: z.number().nonnegative(),
    attempts: z.array(z.object({ outcome: z.enum(["accepted", ...FALLBACK_REASONS]), elapsedMs: z.number(), usage: z.object({
      inputTokens: z.number(), outputTokens: z.number(), thinkingTokens: z.number(), totalTokens: z.number(),
    }).optional(), finishReason: z.string().optional(), httpStatus: z.number().int().min(100).max(599).optional(), validation: validationDiagnosticsSchema.optional() })).max(2),
    cached: z.boolean(), warnings: z.array(z.string()),
  }),
});
export function fullBrief(request: GenerationRequest) {
  return [request.topic, request.details].filter(Boolean).join("\n");
}
