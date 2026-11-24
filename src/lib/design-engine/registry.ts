import { z } from "zod";
import type { Taste } from "../design";

export const VARIANTS = ["street-stack", "street-editorial", "swiss-grid", "swiss-column", "pop-stage", "pop-offset"] as const;
export const VISUALS = ["cup", "circuit", "waves", "spark", "burst", "abstract", "none"] as const;
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
export const artDirectionSchema = z.strictObject({
  variant: z.enum(VARIANTS), palette: z.enum(PALETTE_KEYS), visual: z.enum(VISUALS),
  emphasis: z.enum(["display", "editorial"]), information: z.enum(["auto", "stack", "grid"]),
  adaptation: z.enum(["balanced", "type-led"]),
});
export type ArtDirection = z.infer<typeof artDirectionSchema>;
export function compatibleDirection(taste: Taste, direction: ArtDirection) {
  const supported = ENGINE_TASTES[taste];
  return (supported.variants as readonly string[]).includes(direction.variant) && (supported.palettes as readonly string[]).includes(direction.palette);
}
export function localDirection(taste: Taste, publicCopy: string, preferences = ""): ArtDirection {
  const technical = /\b(robotics|technical|coding|hackathon|workshop|engineering)\b/i.test(publicCopy);
  const music = /\b(music|dance|poetry|cultural|concert)\b/i.test(publicCopy);
  const drink = /\b(chai|tea|coffee|cafe|café)\b/i.test(publicCopy);
  const dense = publicCopy.length > 250;
  const registry = ENGINE_TASTES[taste];
  const alternative = /\b(blue|cool|midnight|cobalt)\b/i.test(preferences) || technical;
  return { variant: registry.variants[dense || technical ? 1 : 0], palette: registry.palettes[alternative ? 1 : 0],
    visual: dense ? "none" : drink ? "cup" : technical ? "circuit" : music ? "waves" : /\b(launch|product|opening)\b/i.test(publicCopy) ? "spark" : "none",
    emphasis: dense ? "editorial" : "display", information: dense ? "grid" : "auto", adaptation: dense ? "type-led" : "balanced" };
}
