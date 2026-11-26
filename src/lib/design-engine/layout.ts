import type { DesignSpecV3, Format } from "../design";
import { resolveSubjectLayout } from "./subject-layout";
import { resolveCreativeLayout } from "./creative-layout";
import {applyEditing} from "./editing";

export type Rect = { x: number; y: number; w: number; h: number };
export type ResolvedLayout = { kicker: Rect; headline: Rect; support: Rect; cta: Rect; art?: Rect; anchor?: Rect; align: "left" | "center" | "right"; columns: number; corrections: string[]; floors: { headline: number; support: number; kicker: number; cta: number } };
export function copyGroups(text: string) {
  // Keep every character-bearing clause, including punctuation and negative facts.
  // Only whitespace is rearranged. A URL is never shortened or made executable.
  const groups = text.split(/(?<=[.!?;])\s+|\n/).map((part) => part.trim()).filter(Boolean);
  return groups.length <= 8 ? groups : [text];
}
export function informationRole(text: string): "when" | "where" | "entry" | "registration" | "message" {
  if (/https?:\/\//i.test(text) || /^(?:register|registration|contact)\b/i.test(text)) return "registration";
  if (/^(?:venue|location|address)\s*:/i.test(text)) return "where";
  if (/^(?:entry|price|tickets?|cost|fee)\b/i.test(text)) return "entry";
  if (/\b(?:\d{1,2}:\d{2}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December))\b/i.test(text) || /^date\s*:/i.test(text)) return "when";
  return "message";
}
export function resolveLayout(spec: DesignSpecV3, format: Format, correction = 0): ResolvedLayout {
 return applyEditing(resolveGeneratedLayout(spec,format,correction),spec,format);
}
export function resolveGeneratedLayout(spec: DesignSpecV3, format: Format, correction = 0): ResolvedLayout {
  if (spec.artDirection.treatment === "creative-led") return resolveCreativeLayout(spec, format, correction);
  if (spec.artDirection.treatment === "subject-led") return resolveSubjectLayout(spec, format, correction);
  const { width: w, height: h } = format, wide = w > h, portrait = h > w;
  const margin = Math.round(Math.min(w, h) * (spec.taste === "minimal-swiss" ? .065 : .055)) + Math.round((spec.composition.spacing - 60) / 4);
  const x = margin, iw = w - margin * 2, y = margin + (wide ? 68 : 86);
  const ctaH = spec.campaign.cta ? (wide ? 78 : 88) : 0;
  const mh = h - margin - ctaH - y - (spec.campaign.cta ? 22 : 0), gap = wide ? 24 : 30;
  const dense = spec.campaign.supportingText.length > 260;
  const noArt = spec.artDirection.visual === "none" || dense || spec.artDirection.adaptation === "type-led" || correction > 0;
  const headlineShare = !spec.campaign.supportingText ? .87 : dense ? (wide ? .32 : .34) : wide ? .58 : .53;
  let headline: Rect = { x, y, w: iw, h: Math.round(mh * headlineShare) };
  let support: Rect = { x, y: y + headline.h + gap, w: iw, h: mh - headline.h - gap };
  let art: Rect | undefined;
  let align: ResolvedLayout["align"] = "left";
  const variant = spec.artDirection.variant;
  if (!noArt) {
    if (variant === "street-stack") {
      if (wide) {
        headline = { ...headline, w: iw * .70 };
        art = { x: x + iw * .76, y, w: iw * .24, h: mh * .57 };
      } else {
        art = { x, y: support.y, w: iw * .37, h: support.h };
        support = { ...support, x: x + iw * .43, w: iw * .57 };
      }
    } else if (variant === "street-editorial" || variant === "swiss-grid") {
      headline = { ...headline, w: iw * .62 };
      art = { x: x + iw * .70, y, w: iw * .30, h: headline.h };
      if (variant === "swiss-grid" && !wide) {
        art = { x, y: support.y, w: iw * .28, h: support.h };
        support = { ...support, x: x + iw * .36, w: iw * .64 };
        headline.w = iw;
      }
    } else if (variant === "swiss-column") {
      headline = { ...headline, x: x + iw * .29, w: iw * .71 };
      art = { x, y, w: iw * .23, h: headline.h * .8 };
      align = "right";
    } else if (variant === "pop-stage") {
      align = "center";
      if (wide) {
        headline = { ...headline, w: iw * .72 };
        art = { x: x + iw * .78, y, w: iw * .22, h: headline.h };
      } else {
        headline.h = mh * .46;
        art = { x: x + iw * .35, y: y + mh * .49, w: iw * .30, h: mh * .24 };
        support = { x, y: y + mh * .77, w: iw, h: mh * .23 };
      }
    } else if (variant === "pop-offset") {
      if (wide) {
        art = { x, y, w: iw * .27, h: mh * .82 };
        headline = { ...headline, x: x + iw * .34, w: iw * .66 };
        support = { ...support, x: headline.x, w: headline.w };
      } else {
        headline = { ...headline, w: iw * .67 };
        art = { x: x + iw * .73, y, w: iw * .27, h: headline.h };
      }
    }
  } else {
    // A typography-led campaign uses the full canvas rather than an empty art slot.
    align = variant === "pop-stage" ? "center" : variant === "swiss-column" ? "right" : "left";
    if (variant === "street-editorial" || variant === "pop-offset") {
      headline.h = mh * (dense ? .30 : .47);
      support = { x, y: y + headline.h + gap, w: iw, h: mh - headline.h - gap };
    }
  }
  if (correction > 1) {
    headline.h = Math.max(120, mh * .25);
    support = { x, y: y + headline.h + gap, w: iw, h: mh - headline.h - gap };
  }
  const groups = copyGroups(spec.campaign.supportingText);
  return { kicker: { x, y: margin, w: iw, h: 42 }, headline, support,
    cta: { x, y: h - margin - ctaH, w: iw, h: ctaH }, art, align,
    columns: spec.artDirection.information !== "stack" && groups.length >= 2 && support.w > (spec.artDirection.information === "grid" ? 650 : 800) ? 2 : 1,
    corrections: correction === 0 ? [] : correction === 1 ? ["Artwork removed and text expanded to preserve readable copy."] : ["Artwork removed and more space allocated to supporting information."],
    floors: { headline: correction > 1 ? 48 : dense ? (wide ? 56 : 64) : wide ? 64 : portrait ? 80 : 76, support: wide ? 30 : 32, kicker: 26, cta: wide ? 30 : 32 } };
}
