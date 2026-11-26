import type { DesignSpecV3, Format } from "../design";
import type { Rect, ResolvedLayout } from "./layout";
import { hierarchyGroups } from "./subject-layout";
import { resolveArtDirection } from "./art-direction-layout";

// Manifesto is deliberately stacked typography. Break only at supplied word
// boundaries; retain explicit line breaks and every word. Final sizes are still
// measured against the same floors, never reduced inside the export operation.
export function manifestoHeadline(text: string, wide = false) {
  const words = text.trim().split(/\s+/);
  if (wide || text.includes("\n") || words.length < 2 || words.length > 6 || text.length > 90) return text;
  let split = 1, difference = Infinity;
  for (let i = 1; i < words.length; i++) {
    if([words.slice(0,i),words.slice(i)].some(part=>part.every(word=>/^(a|an|the|and|or|of|to|for|in|on|at|with|by)$/i.test(word))))continue;
    const imbalance = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (imbalance < difference) { split = i; difference = imbalance; }
  }
  return difference===Infinity?text:words.slice(0, split).join(" ") + "\n" + words.slice(split).join(" ");
}

// Original adaptation of the labs' role allocations. Geometry remains subject
// to the same production fitter, floors and at most three correction passes.
export function resolveCreativeLayout(spec: DesignSpecV3, format: Format, correction: number): ResolvedLayout {
  if(spec.engineRevision===9)return refinedLayout(spec,format,correction);
  if(spec.artDirection.design) return resolveArtDirection(spec,format,correction);
  const { width: w, height: h } = format, wide = w > h, portrait = h > w;
  const swiss = spec.taste === "minimal-swiss", pop = spec.taste === "festive-pop";
  const spacing = (spec.composition.spacing - 60) / 30;
  const margin = Math.round(Math.min(w, h) * (swiss ? .058 : .050)) + Math.round(spacing * 8);
  const x = margin, iw = w - margin * 2, y = margin + (wide ? 60 : 72), gap = Math.round((wide ? 18 : 24) + spacing * 5);
  const ctaH = spec.campaign.cta ? (wide ? 78 : 88) : 0;
  const bottom = h - margin - ctaH - (ctaH ? gap : 0), usable = bottom - y;
  const groups = hierarchyGroups(spec.campaign.supportingText, 40), dense = spec.campaign.supportingText.length > 320 || groups.length >= 6;
  const recipe = spec.artDirection.recipe;
  const noArt = (!spec.assetLayer && spec.artDirection.visual === "none") || spec.artDirection.adaptation === "type-led" || recipe === "manifesto" || dense || correction > 0;
  const titleShare = !spec.campaign.supportingText ? .90 : dense ? (spec.campaign.headline.length < 40 ? .18 : .30) : spec.campaign.headline.length < 35 ? .32 : .48;
  let headline: Rect = { x, y, w: iw, h: usable * titleShare };
  let support: Rect = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
  let art: Rect | undefined;
  let align: ResolvedLayout["align"] = pop ? "center" : "left";
  let kicker = { x, y: margin, w: iw, h: 42 }, cta = { x, y: h - margin - ctaH, w: iw, h: ctaH };
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
  // Taste changes content allocation, not just borders/type. Swiss uses an
  // asymmetric opening spread; Pop stages a centred image above a factual band.
  // The same native fitter may release that art region when text needs it.
  if (!noArt && !wide && recipe === "editorial" && swiss) {
    headline = { x, y, w: iw * .55, h: usable * .44 };
    art = { x: x + iw * .60, y: y + usable * .035, w: iw * .40, h: usable * .38 };
    support = { x, y: y + headline.h + gap, w: iw, h: bottom - y - headline.h - gap };
  }
  if (!noArt && !wide && recipe === "signboard" && pop) {
    headline = { x, y, w: iw, h: usable * .27 };
    const side = Math.min(iw * .60, usable * .30);
    art = { x: x + (iw - side) / 2, y: y + headline.h + gap, w: side, h: side };
    const lower = art.y + art.h + gap;
    support = { x, y: lower, w: iw, h: bottom - lower };
  }
  // Actual image-led bleed: the raster reaches native canvas edges while HTML
  // copy retains a disjoint solid-colour safe zone. Contain protects the whole
  // object by default; explicit cover/zoom remains a disclosed user crop.
  if (spec.assetLayer?.framing === "edge-to-edge" && !noArt) {
    if (wide) {
      const safe = iw * .53;
      art = { x: w * .60, y: 0, w: w * .40, h };
      headline = { x, y, w: safe, h: usable * .38 };
      support = { x, y: y + headline.h + gap, w: safe, h: bottom - y - headline.h - gap };
      kicker = { ...kicker, w: safe }; cta = { ...cta, w: safe };
    } else {
      art = { x: w * .60, y: 0, w: w * .40, h: h * .48 };
      headline = { x, y, w: iw * .54, h: usable * .40 };
      const lower = Math.max(y + headline.h + gap, art.h + gap);
      support = { x, y: lower, w: iw, h: bottom - lower };
      kicker = { ...kicker, w: headline.w, h: 56 };
    }
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
  return { kicker, headline, support, art, align, cta,
    columns: spec.artDirection.information === "stack" ? 1 : wide && dense && groups.length >= 8 && support.w > 1100 ? 3 : groups.length > 1 && support.w > (spec.artDirection.information === "grid" || recipe === "dossier" ? 650 : 800) ? 2 : 1,
    floors: { headline: correction > 1 ? 48 : dense ? (wide ? 56 : 64) : wide ? 64 : portrait ? 80 : 76, support: wide ? Math.max(34, Math.round(32 * scale)) : 34, kicker: 26, cta: wide ? Math.max(32, Math.round(30 * scale)) : 34 },
    corrections: correction === 0 ? [] : correction === 1 ? ["Creative artwork region released for complete readable copy."] : ["Creative hierarchy expanded for dense factual information; all public facts retained."] };
}
// Additive revision: historical v3 specifications retain their accepted geometry.
function refinedLayout(spec:DesignSpecV3,format:Format,correction:number):ResolvedLayout{
 const previous=resolveCreativeLayout({...spec,engineRevision:undefined},format,correction);
 if(correction>0)return previous;
 if(previous.anchor)return {...previous,columns:1};
 const {width:w,height:h}=format,wide=w>h,m=Math.round(Math.min(w,h)*.055),gap=24,x=m,iw=w-2*m,y=m+64,bottom=h-m-(spec.campaign.cta?100:0),usable=bottom-y;
 const dense=spec.campaign.supportingText.length>550;
 if(spec.assetLayer&&!dense){
  if(wide){const tw=w*.57-m;return{...previous,kicker:{x,y:m,w:tw,h:38},headline:{x,y,w:tw,h:usable*.28},support:{x,y:y+usable*.28+gap,w:tw,h:usable*.72-gap},art:{x:w*.61,y:0,w:w*.39,h},columns:1,align:'left'};}
  const imageH=h*(h>w?.38:.32),titleH=h*(h>w?.20:.18),start=imageH+24;
  return{...previous,art:{x:0,y:0,w,h:imageH},kicker:{x,y:start,w:iw,h:38},headline:{x,y:start+58,w:iw,h:titleH},support:{x,y:start+58+titleH+gap,w:iw,h:bottom-start-58-titleH-gap},columns:2,align:'left'};
 }
 if(!previous.art&&!dense&&!wide){const share=spec.taste==='festive-pop'?.55:spec.taste==='bold-street'?.57:.46;return{...previous,headline:{x,y,w:iw,h:usable*share},support:{x,y:y+usable*share+gap,w:iw,h:usable*(1-share)-gap},columns:spec.campaign.supportingText.length>170?2:1};}
 return previous;
}
