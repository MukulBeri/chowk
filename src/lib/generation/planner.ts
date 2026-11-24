import { designSchemaV2, designSchemaV3, PRESETS, type DesignSpec } from "../design";
import { creativePlanSchema, legacyCreativePlanSchema, fullBrief, type AdvancedCreativePlan, type CreativePlan, type GenerationRequest } from "./contracts";
import { compatibleDirection, ENGINE_TASTES, localDirection, PALETTES } from "../design-engine/registry";
import { factualIssues } from "./facts";
import { boundedNotes, IncompleteBriefError, interpretBrief } from "./brief";
import { structuralDiagnostics, semanticDiagnostics, type ValidationDiagnostics } from "./diagnostics";

export function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function validatePlan(raw: unknown, request: GenerationRequest): { plan?: CreativePlan; issues: string[]; diagnostics?: ValidationDiagnostics } {
  const advanced = creativePlanSchema.safeParse(raw);
  const parsed = advanced.success ? advanced : legacyCreativePlanSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = !advanced.success && typeof raw === "object" && raw !== null && Object.hasOwn(raw, "artDirection") ? advanced.error.issues : parsed.error.issues;
    return { issues: ["invalid-structure"], diagnostics: structuralDiagnostics(errors) };
  }
  const plan = parsed.data, preset = PRESETS[request.taste];
  const issues: string[] = [];
  if (plan.taste !== request.taste) issues.push("wrong-taste");
  const family = "artDirection" in plan ? ENGINE_TASTES[request.taste].family : preset.typography.family;
  if (plan.typography.family !== family || plan.typography.case !== preset.typography.case || plan.composition.layout !== preset.composition.layout || plan.decoration.motif !== preset.decoration.motif) issues.push("unsupported-taste-combination");
  if ("artDirection" in plan) {
    if (!compatibleDirection(request.taste, plan.artDirection)) issues.push("unsupported-art-direction");
    if (Object.entries(PALETTES[plan.artDirection.palette]).some(([key, value]) => plan.palette[key as keyof typeof plan.palette] !== value)) issues.push("palette-token-mismatch");
    const visual = plan.artDirection.visual;
    if (plan.decoration.illustration !== (visual === "cup" ? "cup" : visual === "none" ? "none" : "abstract")) issues.push("inconsistent-visual-fields");
    if (visual === "cup" && !/\b(chai|tea|coffee|cafe|café)\b/i.test(fullBrief(request))) issues.push("irrelevant-cup");
    if (visual === "circuit" && !/\b(robotics|technical|coding|hackathon|workshop|engineering)\b/i.test(fullBrief(request))) issues.push("irrelevant-technical-visual");
    if (visual === "waves" && !/\b(music|dance|poetry|cultural|concert|wave|water)\b/i.test(fullBrief(request))) issues.push("irrelevant-rhythm-visual");
  }
  if (contrast(plan.palette.ink, plan.palette.background) < 4.5 || contrast(plan.palette.accent, plan.palette.background) < (request.taste === "festive-pop" ? 4.5 : 1.5)) issues.push("insufficient-contrast");
  const input = fullBrief(request), copy = [plan.campaign.eyebrow, plan.campaign.headline, plan.campaign.supportingText, plan.campaign.cta].filter(Boolean).join("\n");
  issues.push(...factualIssues(input, copy));
  if (plan.decoration.illustration === "cup" && !/\b(chai|tea|coffee|cafe|café)\b/i.test(input)) issues.push("irrelevant-cup");
  if (/\bchai\b/i.test(copy) && !/\bchai\b/i.test(input)) issues.push("irrelevant-fixture-copy");
  // Limit new title-cased named entities; ordinary sentence starts remain allowed.
  const ordinary = new Set("a an the your our new next chapter ideas idea action make room for celebration build together campus community workshop event create explore meet share discover join welcome into in focus something worth sharing invitation to".split(" "));
  // This field label is not an invented entity. Only normalize the label before
  // a colon for name detection; original copy still undergoes every fact check.
  const entityCopy = copy.replace(/\bEntry Fee(?=\s*:)/g, "entry fee");
  const entities = entityCopy.match(/\b[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3}\b|\b[A-Z][a-z]+[A-Z][A-Za-z]+\b/g) ?? [];
  if (entities.some((entity) => !input.toLowerCase().includes(entity.toLowerCase()) && entity.toLowerCase().split(/\s+/).some((word) => !ordinary.has(word)))) issues.push("unsupported-named-entity");
  const unique = [...new Set(issues)];
  return { plan: unique.length ? undefined : plan, issues: unique, ...(unique.length ? { diagnostics: semanticDiagnostics(unique) } : {}) };
}
export function planToSpec(plan: CreativePlan, request: GenerationRequest, source: "gemini" | "deterministic-fallback"): DesignSpec {
  if ("artDirection" in plan) return designSchemaV3.parse({ version: 3, provenance: source, campaign: { ...plan.campaign, topic: request.topic }, taste: request.taste,
    palette: plan.palette, typography: plan.typography, composition: plan.composition, decoration: plan.decoration, rationale: plan.rationale, artDirection: plan.artDirection });
  return designSchemaV2.parse({ version: 2, provenance: source, campaign: { ...plan.campaign, topic: request.topic }, taste: request.taste,
    palette: plan.palette, typography: plan.typography, composition: plan.composition, decoration: plan.decoration, rationale: plan.rationale });
}
export function fallbackPlan(request: GenerationRequest): AdvancedCreativePlan {
  const { content, missing, directions } = interpretBrief(request), preset = PRESETS[request.taste];
  const interpretation = {
    objective: "Present the supplied subject without adding facts.",
    audience: /\b(?:campus|students?)\b/i.test(content.join("\n")) ? "The campus community mentioned in the brief." : "Audience unspecified; no demographic assumed.",
    concept: `Give the supplied subject a clear ${preset.name} hierarchy; preserve publishable information.`,
    assumptions: boundedNotes(["No new event, business or product facts have been inferred.", ...directions.map((text) => `Planning instruction: ${text}`)]),
    missingInformation: boundedNotes([...missing, ...(content.length ? ["Confirm any audience, logistical or action details not supplied before publication."] : ["A concrete subject or publishable message has not been supplied."])]),
  };
  if (!content.length) throw new IncompleteBriefError(interpretation);
  const brief = content.join("\n");
  const category = /\b(hackathon|workshop|coding|robotics|technical)\b/i.test(brief) ? "technical"
    : /\b(diwali|festival|cultural|music|dance|celebration)\b/i.test(brief) ? "cultural"
    : /\b(launch|opening|announce|product|stall)\b/i.test(brief) ? "launch" : "general";
  const short = content[0];
  const headlines = { technical: "Ideas into action.", cultural: "Make room for celebration.", launch: "A new chapter begins.", general: "Your idea, in focus." };
  const positiveSubject = /^(?:an? )?[\p{L}\s-]*(?:workshop|hackathon|gathering|festival|concert|poetry circle|cultural evening)\b/iu.test(short) && !/\b(no|not|never|without|cancelled|canceled)\b/i.test(short);
  const conciseSubject = positiveSubject ? short.split(/\s+(?:for|on|at|with)\s+/i)[0].replace(/^an?\s+/i, "").replace(/[.!?]+$/, "") : short;
  const editorial = conciseSubject.charAt(0).toUpperCase() + conciseSubject.slice(1);
  const headline = short.length <= 240 ? (positiveSubject && conciseSubject.length >= 8 ? editorial : short) : headlines[category];
  // Only exact copy repetition is redundant. Do not drop more specific facts
  // merely because they share words with the headline.
  const supportingText = [...new Set(content)].filter((text) => text !== headline).join("\n");
  const direction = localDirection(request.taste, brief, fullBrief(request));
  return creativePlanSchema.parse({
    interpretation,
    taste: request.taste,
    campaign: { eyebrow: category === "technical" ? "An invitation to build" : category === "cultural" ? "An invitation to gather" : "An idea to share", headline, supportingText },
    palette: PALETTES[direction.palette], typography: { ...preset.typography, family: ENGINE_TASTES[request.taste].family }, composition: preset.composition,
    decoration: { ...preset.decoration, illustration: direction.visual === "cup" ? "cup" : direction.visual === "none" ? "none" : "abstract" },
    artDirection: direction,
    rationale: `${preset.name}: ${direction.variant.replaceAll("-", " ")} with ${direction.palette.replaceAll("-", " ")} colours and ${direction.visual} visuals, selected from subject and information density. Publishable copy retained; recognized instructions stay in metadata. Formats resolve their own text/visual regions and measured corrections preserve all supplied copy.`,
  });
}
