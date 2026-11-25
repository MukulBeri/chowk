import type { DesignSpecV3, Format } from "../design";
import type { Rect, ResolvedLayout } from "./layout";
import { hierarchyGroups } from "./subject-layout";

// Manifesto is deliberately stacked typography. Break only at supplied word
// boundaries; retain explicit line breaks and every word. Final sizes are still
// measured against the same floors, never reduced inside the export operation.
export function manifestoHeadline(text: string, wide = false) {
  const words = text.trim().split(/\s+/);
  if (wide || text.includes("\n") || words.length < 2 || words.length > 6 || text.length > 90) return text;
  let split = 1, difference = Infinity;
  for (let i = 1; i < words.length; i++) {
    const imbalance = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (imbalance < difference) { split = i; difference = imbalance; }
  }
  return words.slice(0, split).join(" ") + "\n" + words.slice(split).join(" ");
}

// Original adaptation of the labs' role allocations. Geometry remains subject
// to the same production fitter, floors and at most three correction passes.
export function resolveCreativeLayout(spec: DesignSpecV3, format: Format, correction: number): ResolvedLayout {
  const { width: w, height: h } = format, wide = w > h, portrait = h > w;
  const swiss = spec.taste === "minimal-swiss", pop = spec.taste === "festive-pop";
  const spacing = (spec.composition.spacing - 60) / 30;
  const margin = Math.round(Math.min(w, h) * (swiss ? .058 : .050)) + Math.round(spacing * 8);
  const x = margin, iw = w - margin * 2, y = margin + (wide ? 60 : 72), gap = Math.round((wide ? 18 : 24) + spacing * 5);
  const ctaH = spec.campaign.cta ? (wide ? 78 : 88) : 0;
  const bottom = h - margin - ctaH - (ctaH ? gap : 0), usable = bottom - y;
  const groups = hierarchyGroups(spec.campaign.supportingText, 40), dense = spec.campaign.supportingText.length > 320 || groups.length >= 6;
  const recipe = spec.artDirection.recipe;
  const noArt = spec.artDirection.visual === "none" || spec.artDirection.adaptation === "type-led" || recipe === "manifesto" || dense || correction > 0;
  const titleShare = !spec.campaign.supportingText ? .90 : dense ? (spec.campaign.headline.length < 40 ? .18 : .30) : spec.campaign.headline.length < 35 ? .32 : .48;
  let headline: Rect = { x, y, w: iw, h: usable * titleShare };
  let support: Rect = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
  let art: Rect | undefined;
  let align: ResolvedLayout["align"] = pop ? "center" : "left";
  if (recipe === "signboard") {
    if (wide) {
      headline = { x, y, w: iw * (noArt ? 1 : .62), h: usable * titleShare };
      if (!noArt) art = { x: x + iw * .68, y, w: iw * .32, h: headline.h };
      support = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
    } else {
      headline.h = usable * (dense ? titleShare : spec.campaign.headline.length < 28 ? .25 : .34);
      const lower = y + headline.h + gap, remaining = bottom - lower;
      if (!noArt) art = { x, y: lower + Math.max(0, (remaining - iw * .46) * .3), w: iw * .46, h: Math.min(remaining, iw * .46) };
      support = { x: noArt ? x : x + iw * .51, y: lower, w: iw * (noArt ? 1 : .49), h: remaining };
    }
  } else if (recipe === "editorial") {
    align = "left";
    if (wide && !noArt) {
      headline = { x, y, w: iw * .49, h: usable * .40 };
      const side = Math.min(iw * .41, usable * .76);
      art = { x: x + iw - side, y: y + (usable - side) / 2, w: side, h: side };
      support = { x, y: y + headline.h + gap, w: headline.w, h: bottom - y - headline.h - gap };
    } else if (!noArt) {
      const side = Math.min(iw * .66, usable * .34);
      art = { x: x + (swiss ? iw - side : (iw - side) / 2), y, w: side, h: side };
      headline = { x, y: y + art.h + gap, w: iw, h: usable * .23 };
      support = { x, y: headline.y + headline.h + gap, w: iw, h: bottom - headline.y - headline.h - gap };
    } else {
      const inset = dense || spec.artDirection.adaptation === "type-led" ? 0 : swiss ? .12 : pop ? .04 : 0;
      headline = { x: x + iw * inset, y, w: iw * (1 - inset), h: usable * titleShare };
      support = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
    }
  } else if (recipe === "dossier") {
    headline = { x, y, w: noArt ? iw : iw * .66, h: usable * (dense ? titleShare + .03 : .33) };
    if (!noArt) art = { x: x + iw * .72, y, w: iw * .28, h: headline.h };
    support = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
    align = pop ? "center" : "left";
  }
  if (correction > 0) {
    // Free the visual region before reducing type. Full factual copy is retained.
    headline = { x, y, w: iw, h: usable * (dense && spec.campaign.headline.length < 40 ? .16 : correction > 1 ? .25 : dense ? .32 : .40) };
    support = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
  }
  // Stacked portrait type includes two lines plus its frame; wide canvases use
  // an intentional single-line title and retain room for the factual columns.
  if (recipe === "manifesto" && spec.campaign.headline.length <= 40) {
    headline.h = Math.max(headline.h, wide && !spec.campaign.headline.includes("\n") ? 112 : 184);
    support = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
  }
  const scale = wide ? Math.min(w / 1280, h / 720) : 1;
  return { kicker: { x, y: margin, w: iw, h: 42 }, headline, support, art, align,
    cta: { x, y: h - margin - ctaH, w: iw, h: ctaH },
    columns: spec.artDirection.information === "stack" ? 1 : wide && dense && groups.length >= 8 && support.w > 1100 ? 3 : groups.length > 1 && support.w > (spec.artDirection.information === "grid" || recipe === "dossier" ? 650 : 800) ? 2 : 1,
    floors: { headline: correction > 1 ? 48 : dense ? (wide ? 56 : 64) : wide ? 64 : portrait ? 80 : 76, support: wide ? Math.max(34, Math.round(32 * scale)) : 34, kicker: 26, cta: wide ? Math.max(32, Math.round(30 * scale)) : 34 },
    corrections: correction === 0 ? [] : correction === 1 ? ["Creative artwork region released for complete readable copy."] : ["Creative hierarchy expanded for dense factual information; all public facts retained."] };
}
