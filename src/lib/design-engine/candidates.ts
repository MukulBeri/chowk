import { designSchemaV3, type DesignSpecV3 } from "../design";
import type { Recipe } from "./registry";

export type CompositionCandidate = { id: string; recipe: Recipe; kind: "composition"; spec: DesignSpecV3 };
// Adapted from Creative Lab 2's original ranking/filtering foundation. These are
// local composition alternatives, never independent AI concepts or history.
export function compositionCandidates(base: DesignSpecV3): CompositionCandidate[] {
  if (base.artDirection.treatment !== "creative-led" || !base.creativeContent) return [];
  const dense = base.creativeContent.facts.length >= 5 || base.campaign.supportingText.length > 320 || base.campaign.headline.length > 100;
  const art = base.artDirection.visual !== "none";
  const order: Recipe[] = dense ? ["dossier", "manifesto", "editorial"] : !art ? ["manifesto", "dossier", "editorial"] : base.taste === "minimal-swiss" ? ["editorial", "dossier", "signboard"] : ["signboard", "manifesto", "editorial"];
  const ranked = [...new Set([base.artDirection.recipe!, ...order])];
  return ranked.flatMap(recipe => {
    const result = designSchemaV3.safeParse({ ...base, artDirection: { ...base.artDirection, recipe } });
    return result.success && JSON.stringify(result.data.campaign) === JSON.stringify(base.campaign) ? [{ id: `composition-${recipe}`, recipe, kind: "composition" as const, spec: result.data }] : [];
  }).slice(0, 3);
}
