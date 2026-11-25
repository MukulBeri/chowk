import { PRESETS } from "../design";
import { ENGINE_TASTES, localDirection, PALETTES } from "../design-engine/registry";
import { creativeLedPlanSchema, type GenerationRequest } from "./contracts";
import { boundedNotes, IncompleteBriefError } from "./brief";
import { interpretCreativeBrief, subjectIdentity, type CreativeBrief } from "./creative-brief";
import { factualTokens } from "./facts";

export function creativeInterpretation(brief: CreativeBrief) {
  return { objective: `${brief.objective}: communicate the supplied subject and retain every public fact.`,
    audience: brief.audience || "Audience unspecified; no restriction inferred.",
    concept: "A subject-led visual hierarchy with application-owned factual copy and locally derived composition alternatives.",
    assumptions: boundedNotes(["Deterministic editorial interpretation; not independently AI-generated creative concepts.", ...brief.ambiguities, ...brief.directions.map(s => `Planning instruction: ${s}`)]),
    missingInformation: boundedNotes(brief.subject ? brief.missingInformation : ["A concrete subject or publishable message has not been supplied.", ...brief.missingInformation]) };
}

export function creativeFallbackPlan(request: GenerationRequest) {
  const brief = interpretCreativeBrief(request), interpretation = creativeInterpretation(brief);
  if (!brief.subject) throw new IncompleteBriefError(interpretation);
  const first = brief.subject.replace(/[.!]$/, "");
  // Recompose task framing, not the supplied factual clauses. Names, qualifiers,
  // prices and relationships still come from the ledger without summarization.
  const subject = first.replace(/^an?\s+/i, "");
  const identity = subjectIdentity(subject);
  const explicitHeadline = request.topic.match(/^headline:\s*([\s\S]+)$/i)?.[1].trim();
  const contextTitle = subject.split(/\s+(?:for|on|at|with)\s+/i)[0];
  const headline = explicitHeadline ?? (identity.name || (factualTokens(brief.subject).length && brief.subject.length <= 240 ? brief.subject : contextTitle.length >= 8 && contextTitle.length <= 80 && !/\b(no|not|never|without|cancelled|canceled)\b/i.test(subject) ? contextTitle.charAt(0).toUpperCase() + contextTitle.slice(1) : subject.length <= 100 ? subject.charAt(0).toUpperCase() + subject.slice(1) : "In focus"));
  const descriptor = identity.name ? identity.descriptor.replace(/^collection of\s+/i, "") : "";
  const eyebrow = descriptor && descriptor.length <= 40 ? descriptor : ({ launch: "Introducing", invite: "An invitation", awareness: "A shared responsibility", announce: "In focus" } as const)[brief.objective];
  const direction = localDirection(request.taste, brief.publicText, [...brief.directions, brief.tone].join(" "), true);
  let visual = !brief.illustration ? "none" : /\b(repair|mend|broken household)\b/i.test(brief.subject) ? "repair" : /\b(astronomy|sky|stargazing)\b/i.test(brief.subject) ? "sky" : direction.visual;
  if (visual === "circuit" && !/\b(technical|robotics|coding|programming|engineering|electronics|computing)\b/i.test(brief.subject)) visual = "none";
  // Reuse the existing order/focus visual as an explicit abstract object/study
  // metaphor. Never imply a specific product appearance or use it for any workshop.
  if (brief.illustration && /\b(desk accessories|stationery|research[ -]reading|book club|reading group)\b/i.test(brief.subject)) visual = "tiles";
  const veryDense = brief.publicText.length > 700;
  const recipe = veryDense ? "dossier" : request.taste === "minimal-swiss" ? "editorial" : request.taste === "festive-pop" ? "signboard" : visual === "none" ? "manifesto" : "signboard";
  const preset = PRESETS[request.taste];
  return creativeLedPlanSchema.parse({ interpretation, taste: request.taste,
    campaign: { eyebrow, headline, supportingText: "" }, factIds: brief.facts.map(f => f.id),
    artDirection: { ...direction, treatment: "creative-led", recipe, visual, adaptation: visual === "none" ? "type-led" : "balanced" },
    palette: PALETTES[direction.palette], typography: { ...preset.typography, family: ENGINE_TASTES[request.taste].family }, composition: preset.composition,
    decoration: { ...preset.decoration, illustration: visual === "none" ? "none" : visual === "cup" ? "cup" : "abstract" },
    rationale: `${PRESETS[request.taste].name}: ${recipe} composition selected from subject, factual density and visual relevance. Public facts are bound from the application ledger; audience, tone and constraints remain metadata. Local editorial planning, not a live AI result.` });
}
