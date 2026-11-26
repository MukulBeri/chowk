import type { CreativeBrief } from "./creative-brief";
import { subjectIdentity } from "./creative-brief";
import { relevantVisual, type ArtDirection } from "../design-engine/registry";

// A finite visual vocabulary is not open-world recognition. Inspect the subject,
// not a workshop's venue or a stray word in a restriction, before choosing art.
export function subjectStrategy(brief: CreativeBrief, suggested: ArtDirection["visual"]) {
  const identity = subjectIdentity(brief.subject);
  const attributes = identity.descriptor.replace(/[.!]$/, "");
  const mechanical = /\b(appliances?|mechanical|bicycles?|bikes?|machines?|household (?:items|objects))\b/i.test(attributes);
  const textiles = /\b(clothes?|clothing|textiles?|garments?|fabric|sewing|stitch)\b/i.test(attributes);
  let visual = suggested;
  if (/\b(repair|mend|fix)\b/i.test(attributes)) visual = mechanical && !textiles ? "repair" : "none";
  if (!brief.illustration || !relevantVisual(visual, attributes)) visual = "none";
  const specific = !["none","abstract","spark","burst"].includes(visual);
  if (!specific) visual = "none";
  return { identity, attributes, purpose: brief.objective, audience: brief.audience,
    emotionalDirection: brief.tone || "No emotional direction inferred.",
    visual, confidence: specific && visual !== "none" ? "bounded-library-match" as const : "uncertain" as const,
    strategy: visual === "none" ? "typography" as const : "illustration" as const,
    reason: visual === "none" ? "No dependable subject-specific asset: let native typography communicate the subject rather than imply the wrong object." : "An authored conceptual visual matches the subject; it is not a verified depiction of a real product." };
}
