import { designSchemaV2, PRESETS, type DesignSpec } from "../design";
import { creativePlanSchema, fullBrief, type CreativePlan, type GenerationRequest } from "./contracts";
import { factualIssues } from "./facts";
import { boundedNotes, IncompleteBriefError, interpretBrief } from "./brief";

export function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function validatePlan(raw: unknown, request: GenerationRequest): { plan?: CreativePlan; issues: string[] } {
  const parsed = creativePlanSchema.safeParse(raw);
  if (!parsed.success) return { issues: ["invalid-structure"] };
  const plan = parsed.data, preset = PRESETS[request.taste];
  const issues: string[] = [];
  if (plan.taste !== request.taste) issues.push("wrong-taste");
  if (plan.typography.family !== preset.typography.family || plan.typography.case !== preset.typography.case || plan.composition.layout !== preset.composition.layout || plan.decoration.motif !== preset.decoration.motif) issues.push("unsupported-taste-combination");
  if (contrast(plan.palette.ink, plan.palette.background) < 4.5 || contrast(plan.palette.accent, plan.palette.background) < (request.taste === "festive-pop" ? 4.5 : 1.5)) issues.push("insufficient-contrast");
  const input = fullBrief(request), copy = [plan.campaign.eyebrow, plan.campaign.headline, plan.campaign.supportingText, plan.campaign.cta].filter(Boolean).join("\n");
  issues.push(...factualIssues(input, copy));
  if (plan.decoration.illustration === "cup" && !/\b(chai|tea|coffee|cafe|café)\b/i.test(input)) issues.push("irrelevant-cup");
  if (/\bchai\b/i.test(copy) && !/\bchai\b/i.test(input)) issues.push("irrelevant-fixture-copy");
  // Limit new title-cased named entities; ordinary sentence starts remain allowed.
  const ordinary = new Set("a an the your our new next chapter ideas idea action make room for celebration build together campus community workshop event create explore meet share discover join welcome into in focus something worth sharing invitation to".split(" "));
  const entities = copy.match(/\b[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){1,3}\b|\b[A-Z][a-z]+[A-Z][A-Za-z]+\b/g) ?? [];
  if (entities.some((entity) => !input.toLowerCase().includes(entity.toLowerCase()) && entity.toLowerCase().split(/\s+/).some((word) => !ordinary.has(word)))) issues.push("unsupported-named-entity");
  return { plan: issues.length ? undefined : plan, issues: [...new Set(issues)] };
}
export function planToSpec(plan: CreativePlan, request: GenerationRequest, source: "gemini" | "deterministic-fallback"): DesignSpec {
  return designSchemaV2.parse({ version: 2, provenance: source, campaign: { ...plan.campaign, topic: request.topic }, taste: request.taste,
    palette: plan.palette, typography: plan.typography, composition: plan.composition, decoration: plan.decoration, rationale: plan.rationale });
}
export function fallbackPlan(request: GenerationRequest): CreativePlan {
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
  const headline = short.length <= 240 ? short : headlines[category];
  // Only exact copy repetition is redundant. Do not drop more specific facts
  // merely because they share words with the headline.
  const supportingText = [...new Set(content)].filter((text) => text !== headline).join("\n");
  return creativePlanSchema.parse({
    interpretation,
    taste: request.taste,
    campaign: { eyebrow: category === "technical" ? "An invitation to build" : category === "cultural" ? "An invitation to gather" : "An idea to share", headline, supportingText },
    palette: preset.palette, typography: preset.typography, composition: preset.composition,
    decoration: { ...preset.decoration, illustration: brief.length > 180 ? "none" : /\b(chai|tea|coffee|cafe|café)\b/i.test(brief) ? "cup" : "abstract" },
    rationale: `${preset.name}: ${preset.typography.family.replaceAll("-", " ")} typography and ${preset.composition.layout.replaceAll("-", " ")} composition. Publishable copy retained without repeating the headline; recognized brief instructions stay in interpretation metadata. ${brief.length > 180 ? "Illustration omitted to prioritize detailed copy" : "A restrained supported visual keeps attention on the subject"}.`,
  });
}
