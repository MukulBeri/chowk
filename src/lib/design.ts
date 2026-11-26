import { z } from "zod";
import { artDirectionSchema, compatibleDirection, ENGINE_TASTES, PALETTES } from "./design-engine/registry";
import { creativeContentSchema } from "./generation/fact-ledger";
import { assetLayerSchema } from "./design-engine/assets";
import { eligibleAnchorFacts } from "./design-engine/direction";
import {editingSchema} from "./design-engine/editing";

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

export const designSchemaV1 = z.strictObject({
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
// V1 remains unchanged for the deterministic M0 endpoint and existing examples.
// V2 adds honest generation provenance, preserved long briefs and a neutral visual path.
export const ILLUSTRATIONS = ["cup", "abstract", "none"] as const;
export const designSchemaV2 = designSchemaV1.extend({
  version: z.literal(2),
  provenance: z.enum(["gemini", "deterministic-fallback", "manual-input"]),
  campaign: designSchemaV1.shape.campaign.extend({
    topic: text(1200), supportingText: z.string().trim().max(2400),
  }),
  decoration: designSchemaV1.shape.decoration.extend({ illustration: z.enum(ILLUSTRATIONS) }),
});
export const designSchemaV3 = designSchemaV2.extend({
  version: z.literal(3), artDirection: artDirectionSchema,
  creativeContent: creativeContentSchema.optional(),
  assetLayer: assetLayerSchema.optional(),
  editing: editingSchema.optional(),
  typography: designSchemaV2.shape.typography.extend({ family: z.enum(["condensed-sans", "neutral-sans", "editorial-serif", "rounded-sans"]) }),
}).superRefine((spec, ctx) => {
  if (spec.assetLayer && spec.artDirection.treatment !== "creative-led") ctx.addIssue({ code: "custom", message: "Raster layers require explicit creative-led treatment.", path: ["assetLayer"] });
  if ((spec.artDirection.treatment === "creative-led") !== !!spec.creativeContent) ctx.addIssue({ code: "custom", message: "Creative content requires explicit creative-led treatment.", path: ["creativeContent"] });
  if (spec.creativeContent) {
    const visible = [spec.campaign.eyebrow, spec.campaign.headline, spec.campaign.supportingText, spec.campaign.cta].filter(Boolean).join("\n").toLowerCase().replace(/\s+/g, " ");
    if (spec.creativeContent.facts.some(f => !visible.includes(f.text.toLowerCase().replace(/\s+/g, " ")))) ctx.addIssue({ code: "custom", message: "All immutable public factual clauses must remain visible.", path: ["campaign"] });
  }
  if(spec.artDirection.design?.anchorFactId && (!spec.creativeContent || !eligibleAnchorFacts(spec.creativeContent.subject,spec.creativeContent.facts).some(f=>f.id===spec.artDirection.design!.anchorFactId)))ctx.addIssue({code:"custom",message:"Choose an eligible intact supplied anchor fact.",path:["artDirection","design","anchorFactId"]});
  if (!compatibleDirection(spec.taste, spec.artDirection)) ctx.addIssue({ code: "custom", message: "Art direction must belong to the selected taste.", path: ["artDirection"] });
  if (spec.typography.family !== ENGINE_TASTES[spec.taste].family) ctx.addIssue({ code: "custom", message: "Typography must match the taste.", path: ["typography"] });
  if (Object.entries(PALETTES[spec.artDirection.palette]).some(([key, value]) => spec.palette[key as keyof typeof spec.palette] !== value)) ctx.addIssue({ code: "custom", message: "Palette colours must match the selected registry token.", path: ["palette"] });
  const legacy = PRESETS[spec.taste];
  if (spec.composition.layout !== legacy.composition.layout || spec.decoration.motif !== legacy.decoration.motif || spec.typography.case !== legacy.typography.case) ctx.addIssue({ code: "custom", message: "Legacy compatibility fields must match the selected taste.", path: ["composition"] });
  const illustration = spec.artDirection.visual === "cup" ? "cup" : spec.artDirection.visual === "none" ? "none" : "abstract";
  if (spec.decoration.illustration !== illustration) ctx.addIssue({ code: "custom", message: "Visual compatibility fields disagree.", path: ["decoration"] });
});
export const designSchema = z.discriminatedUnion("version", [designSchemaV1, designSchemaV2, designSchemaV3]);
export type DesignSpecV3 = z.infer<typeof designSchemaV3>;
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
  return designSchemaV1.parse({
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
