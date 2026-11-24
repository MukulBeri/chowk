import { z } from "zod";

export const TASTES = ["bold-street", "minimal-swiss", "festive-pop"] as const;
export const FORMATS = [
  { id: "instagram-portrait", name: "Instagram portrait", width: 1080, height: 1350, ratio: "4:5" },
  { id: "instagram-square", name: "Instagram square", width: 1080, height: 1080, ratio: "1:1" },
  { id: "youtube-thumbnail", name: "YouTube thumbnail", width: 1280, height: 720, ratio: "16:9" },
  { id: "linkedin-landscape", name: "LinkedIn landscape", width: 1910, height: 1000, ratio: "1.91:1" },
] as const;
export type Format = (typeof FORMATS)[number];
export type Taste = (typeof TASTES)[number];
const text = (max: number) => z.string().trim().min(1).max(max);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour.");

export const designSchema = z.strictObject({
  version: z.literal(1),
  provenance: z.enum(["experimental-fixture", "manual-input"]),
  campaign: z.strictObject({ topic: text(240), eyebrow: text(40), headline: text(240), supportingText: z.string().trim().max(180), cta: text(60).optional() }),
  taste: z.enum(TASTES),
  palette: z.strictObject({ background: hex, ink: hex, accent: hex, secondary: hex }),
  typography: z.strictObject({ family: z.enum(["condensed-sans", "neutral-sans", "editorial-serif"]), headlineScale: z.number().min(0.8).max(1.2), case: z.enum(["uppercase", "sentence"]) }),
  composition: z.strictObject({ layout: z.enum(["street-stack", "swiss-grid", "festival-frame"]), spacing: z.number().int().min(40).max(90) }),
  decoration: z.strictObject({ motif: z.enum(["sticker", "orbit", "confetti"]), density: z.number().int().min(1).max(3) }),
  rationale: text(600),
});
export type DesignSpec = z.infer<typeof designSchema>;
export const SAMPLE_TOPIC = "Chai stall opening near campus.";
export const SAMPLE_COPY = {
  topic: SAMPLE_TOPIC, eyebrow: "A campus invitation", headline: "Chai.\nMeet campus.",
  supportingText: "A chai stall is opening near campus. Come say hello.", cta: "See you for chai",
};
export const PRESETS = {
  "bold-street": {
    name: "Bold Street", subtitle: "Loud type. Raw energy.", number: "01",
    palette: { background: "#efe943", ink: "#20231e", accent: "#c84225", secondary: "#fff9e9" },
    typography: { family: "condensed-sans", headlineScale: 1.1, case: "uppercase" },
    composition: { layout: "street-stack", spacing: 60 }, decoration: { motif: "sticker", density: 3 },
    rationale: "Condensed uppercase typography, tight stacked hierarchy, heavy rules and an oversized cup sticker give the invitation street-poster energy. Wide formats split copy and illustration; tall formats stack them.",
  },
  "minimal-swiss": {
    name: "Minimal Swiss", subtitle: "Quiet space. Clear intent.", number: "02",
    palette: { background: "#f2efe7", ink: "#202b28", accent: "#b83a24", secondary: "#dedbd0" },
    typography: { family: "neutral-sans", headlineScale: 0.85, case: "sentence" },
    composition: { layout: "swiss-grid", spacing: 80 }, decoration: { motif: "orbit", density: 1 },
    rationale: "A measured asymmetric grid, neutral sans serif, fine rules and an isolated circular cup motif create an editorial invitation. Generous margins stay consistent; the grid reorganizes for each format.",
  },
  "festive-pop": {
    name: "Festive Pop", subtitle: "Warm colour. Playful rhythm.", number: "03",
    palette: { background: "#762c49", ink: "#fff2cf", accent: "#f2bf57", secondary: "#eaa1ae" },
    typography: { family: "editorial-serif", headlineScale: 1, case: "sentence" },
    composition: { layout: "festival-frame", spacing: 64 }, decoration: { motif: "confetti", density: 3 },
    rationale: "A warm serif headline, a rounded invitation frame, a golden cup and rhythmic confetti create a celebratory personality. Tall layouts center the invitation; wide layouts pair the headline with the cup.",
  },
} as const;
export const inputSchema = z.strictObject({
  taste: z.enum(TASTES), topic: text(240), headline: text(240).optional(),
  supportingText: z.string().trim().max(180).optional(), cta: z.string().trim().max(60).optional(),
});
export type DesignInput = z.infer<typeof inputSchema>;
export function createDesign(input: DesignInput): DesignSpec {
  const parsed = inputSchema.parse(input);
  const preset = PRESETS[parsed.taste];
  const fixture = parsed.topic === SAMPLE_TOPIC && parsed.headline === undefined && parsed.supportingText === undefined && parsed.cta === undefined;
  return designSchema.parse({
    version: 1, provenance: fixture ? "experimental-fixture" : "manual-input",
    campaign: {
      topic: parsed.topic, eyebrow: fixture ? SAMPLE_COPY.eyebrow : "An invitation",
      headline: parsed.headline ?? (fixture ? SAMPLE_COPY.headline : parsed.topic),
      supportingText: parsed.supportingText ?? (fixture ? SAMPLE_COPY.supportingText : ""),
      cta: parsed.cta === "" ? undefined : parsed.cta ?? (fixture ? SAMPLE_COPY.cta : undefined),
    },
    taste: parsed.taste, palette: preset.palette, typography: preset.typography,
    composition: preset.composition, decoration: preset.decoration, rationale: preset.rationale,
  });
}
export const FONT_FAMILIES = {
  "condensed-sans": 'Impact, "Arial Narrow", Arial, sans-serif',
  "neutral-sans": 'Arial, Helvetica, sans-serif',
  "editorial-serif": 'Georgia, "Times New Roman", serif',
};
