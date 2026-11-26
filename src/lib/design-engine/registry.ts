import { z } from "zod";
import type { Taste } from "../design";

export const VARIANTS = ["street-stack", "street-editorial", "swiss-grid", "swiss-column", "pop-stage", "pop-offset"] as const;
export const RECIPES = ["manifesto", "signboard", "editorial", "dossier"] as const;
export type Recipe = typeof RECIPES[number];
export const VISUALS = ["cup", "circuit", "waves", "spark", "burst", "abstract", "none", "robot", "network", "tiles", "botanical", "aroma", "code", "camera", "repair", "sky"] as const;
export const PALETTES = {
  "street-acid": { background: "#efed50", ink: "#171d1c", accent: "#b6301a", secondary: "#fff9de" },
  "street-cobalt": { background: "#1637bd", ink: "#fff8e9", accent: "#f7ed57", secondary: "#294ccc" },
  "swiss-paper": { background: "#f2efe7", ink: "#202b28", accent: "#ae321e", secondary: "#e3dfd2" },
  "swiss-ice": { background: "#dcecf0", ink: "#163438", accent: "#00616b", secondary: "#bcd9dd" },
  "pop-coral": { background: "#ffd6c5", ink: "#38213e", accent: "#982460", secondary: "#f6b62b" },
  "pop-midnight": { background: "#3b2268", ink: "#fff2d2", accent: "#ffc957", secondary: "#e98dc3" },
} as const;
export const PALETTE_KEYS = Object.keys(PALETTES) as [keyof typeof PALETTES, ...(keyof typeof PALETTES)[]];
export const ENGINE_TASTES = {
  "bold-street": { variants: ["street-stack", "street-editorial"], palettes: ["street-acid", "street-cobalt"], family: "condensed-sans", font: '"YarcAnton", "YarcInter", Arial, sans-serif', weight: 400, tracking: "-0.012em", lineHeight: 1.04, corner: 0 },
  "minimal-swiss": { variants: ["swiss-grid", "swiss-column"], palettes: ["swiss-paper", "swiss-ice"], family: "neutral-sans", font: '"YarcInter", Arial, Helvetica, sans-serif', weight: 700, tracking: "-0.045em", lineHeight: 1.04, corner: 0 },
  "festive-pop": { variants: ["pop-stage", "pop-offset"], palettes: ["pop-coral", "pop-midnight"], family: "rounded-sans", font: '"YarcFredoka", "YarcInter", Arial, sans-serif', weight: 600, tracking: "-0.025em", lineHeight: 1.04, corner: 36 },
} as const satisfies Record<Taste, unknown>;
// Explicit, additive grammar. Absence preserves all historical v3 geometry.
export const designDirectionSchema = z.strictObject({
  version: z.literal(1),
  imageRole: z.enum(["none", "oversized", "inset", "immersive"]),
  typeMode: z.enum(["colossus", "stagger", "editorial", "blocks", "anchor"]),
  device: z.enum(["strip", "axis", "orbit"]),
  anchorFactId: z.string().regex(/^f-(?:topic|details)-\d+$/).optional(),
});
export const artDirectionSchema = z.strictObject({
  variant: z.enum(VARIANTS), palette: z.enum(PALETTE_KEYS), visual: z.enum(VISUALS),
  emphasis: z.enum(["display", "editorial"]), information: z.enum(["auto", "stack", "grid"]),
  adaptation: z.enum(["balanced", "type-led"]),
  // Absent on historical v3 plans: preserve their exact layout/visual path.
  treatment: z.enum(["subject-led", "creative-led"]).optional(),
  recipe: z.enum(RECIPES).optional(),
  design: designDirectionSchema.optional(),
}).superRefine((direction, ctx) => {
  if (["robot", "network", "tiles", "botanical", "aroma", "code", "camera"].includes(direction.visual) && !direction.treatment) ctx.addIssue({ code: "custom", path: ["treatment"], message: "Subject visuals require the implemented subject-led treatment." });
  if ((direction.treatment === "creative-led") !== !!direction.recipe) ctx.addIssue({ code: "custom", path: ["recipe"], message: "A creative recipe requires explicit creative-led treatment and vice versa." });
  if (["repair", "sky"].includes(direction.visual) && direction.treatment !== "creative-led") ctx.addIssue({ code: "custom", path: ["visual"], message: "Creative illustrations require explicit creative-led treatment." });
  if (direction.design && direction.treatment !== "creative-led") ctx.addIssue({code:"custom",path:["design"],message:"Design grammar requires explicit creative-led treatment."});
  if (direction.design && (direction.design.typeMode === "anchor") !== !!direction.design.anchorFactId) ctx.addIssue({code:"custom",path:["design","anchorFactId"],message:"Anchor typography requires an eligible exact fact reference."});
});
export type ArtDirection = z.infer<typeof artDirectionSchema>;
export function compatibleDirection(taste: Taste, direction: ArtDirection) {
  const supported = ENGINE_TASTES[taste];
  const modes = taste === "minimal-swiss" ? ["editorial","anchor"] : taste === "bold-street" ? ["colossus","stagger"] : ["blocks","stagger"];
  return (supported.variants as readonly string[]).includes(direction.variant) && (supported.palettes as readonly string[]).includes(direction.palette)
    && (!direction.design || modes.includes(direction.design.typeMode) && direction.design.device === (taste === "minimal-swiss" ? "axis" : taste === "bold-street" ? "strip" : "orbit"));
}
export function localDirection(taste: Taste, publicCopy: string, preferences = "", subjectLed = false): ArtDirection {
  const technical = /\b(robotics|technical|coding|hackathon|workshop|engineering)\b/i.test(publicCopy);
  const music = /\b(music|dance|poetry|cultural|concert)\b/i.test(publicCopy);
  const drink = /\b(chai|tea|coffee|cafe|café)\b/i.test(publicCopy);
  const dense = publicCopy.length > 250;
  const registry = ENGINE_TASTES[taste];
  const alternative = /\b(blue|cool|midnight|cobalt)\b/i.test(preferences) || technical;
  const legacy: ArtDirection = { variant: registry.variants[dense || technical ? 1 : 0], palette: registry.palettes[alternative ? 1 : 0],
    visual: dense ? "none" : drink ? "cup" : technical ? "circuit" : music ? "waves" : /\b(launch|product|opening)\b/i.test(publicCopy) ? "spark" : "none",
    emphasis: dense ? "editorial" : "display", information: dense ? "grid" : "auto", adaptation: dense ? "type-led" : "balanced" };
  if (!subjectLed) return legacy;
  const visual: ArtDirection["visual"] = dense ? "none" : /\brobotics?\b/i.test(publicCopy) ? "robot"
    : /\b(photography|camera)\b/i.test(publicCopy) ? "camera"
    : /\b(coding|programming|hackathon)\b/i.test(publicCopy) ? "code"
    : /\b(AI|artificial intelligence)\b/.test(publicCopy) ? "network"
    : /\b(plastic|reusable|environment|waste)\b/i.test(publicCopy) ? "botanical"
    : /\b(perfume|fragrance)\b/i.test(publicCopy) ? "aroma"
    : /\b(productivity|planning app|planning notebook)\b/i.test(publicCopy) ? "tiles" : legacy.visual;
  const factual = /\b(venue|entry|teams?|\d{1,2}:\d{2})\b|https?:/i.test(publicCopy);
  return { ...legacy, treatment: "subject-led", visual,
    variant: registry.variants[dense || (taste === "minimal-swiss" && /\b(perfume|fragrance)\b/i.test(publicCopy)) || (taste === "festive-pop" && /\b(coding|contest)\b/i.test(publicCopy)) ? 1 : 0],
    information: factual ? "grid" : "auto", emphasis: dense ? "editorial" : "display" };
}

export function relevantVisual(visual: ArtDirection["visual"], subject: string) {
  const rules: Partial<Record<ArtDirection["visual"], RegExp>> = {
    cup: /\b(chai|tea|coffee|cafe|café)\b/i, circuit: /\b(robotics|technical|coding|hackathon|workshop|engineering)\b/i,
    waves: /\b(music|dance|poetry|cultural|concert|wave|water)\b/i, robot: /\brobotics?\b/i,
    network: /\b(AI|artificial intelligence|computing|technology|network|workshop)\b/i,
    code: /\b(coding|programming|hackathon|software)\b/i, tiles: /\b(productivity|planning|app|notebook|focus|desk accessories|stationery|research[ -]reading|book club|reading group)\b/i,
    botanical: /\b(plastic|reusable|environment|waste|plant|nature|seeds?|gardening|garden|botanical)\b/i, aroma: /\b(perfume|fragrance|scent)\b/i,
    camera: /\b(photography|photographic|camera|photo)\b/i,
    repair: /\b(?:appliances?|mechanical|bicycles?|bikes?|machines?|household (?:items|objects))\b/i, sky: /\b(astronomy|sky|stars|stargazing|space observation)\b/i,
  };
  return !rules[visual] || rules[visual].test(subject);
}
