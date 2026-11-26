import type { Taste } from "../design";
import type { PublicFact } from "../generation/fact-ledger";
import { informationRole } from "./layout";
import type { ArtDirection } from "./registry";

// Complete, short factual clauses only; never extract an unlabelled numeral or
// anchor an exclusion, changed venue, multi-price relationship or sensitive event.
export function eligibleAnchorFacts(subject: string, facts: readonly PublicFact[]) {
  if (/\b(memorial|emergency|medical|bereavement|cancelled|canceled|research|workshop)\b/i.test(subject)) return [];
  return facts.filter(f => f.text.length <= 45 && !/\b(no|not|never|without|changed|original)\b/i.test(f.text)
    && (["entry","when"].includes(informationRole(f.text)) || /[₹$£€]\s*\d/.test(f.text)) && (f.text.match(/(?:₹|\$|£|€)\s*\d/g)?.length ?? 0) <= 1);
}
export function localDesign(taste: Taste, visual: ArtDirection["visual"], subject: string, facts: readonly PublicFact[], alternate = false): NonNullable<ArtDirection["design"]> {
  const anchor = taste === "minimal-swiss" && alternate ? eligibleAnchorFacts(subject,facts)[0] : undefined;
  return { version:1, imageRole: visual === "none" ? "none" : alternate ? "inset" : "oversized",
    typeMode: taste === "minimal-swiss" ? anchor ? "anchor" : "editorial" : taste === "bold-street" ? alternate ? "stagger" : "colossus" : alternate ? "stagger" : "blocks",
    device: taste === "minimal-swiss" ? "axis" : taste === "bold-street" ? "strip" : "orbit", ...(anchor ? {anchorFactId:anchor.id} : {}) };
}
