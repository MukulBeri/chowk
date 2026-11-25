"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DesignSpecV3, Format } from "@/lib/design";
import { ENGINE_TASTES } from "@/lib/design-engine/registry";
import { copyGroups, informationRole, resolveLayout, type Rect } from "@/lib/design-engine/layout";
import { fitAndInspect } from "@/lib/design-engine/quality";
import { ProceduralVisual } from "./procedural-visual";
import { SubjectVisual } from "./subject-visual";
import { hierarchyGroups } from "@/lib/design-engine/subject-layout";
import { prepareCampaignFonts, fontFallbackWarnings } from "@/lib/design-engine/fonts";

const rectStyle = (r: Rect): CSSProperties => ({ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: "border-box" });
export type LayoutReport = { issues: string[]; corrections: string[]; sizes: {role: string; pixels: number}[]; warnings?: string[] };
export function AdvancedPoster({ spec, format, onFit, onReport }: { spec: DesignSpecV3; format: Format; onFit?: (overflow: boolean) => void; onReport?: (report: LayoutReport) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [correction, setCorrection] = useState(0);
  const [status, setStatus] = useState({ ready: false, issues: [] as string[] });
  const layout = resolveLayout(spec, format, correction);
  const tokens = ENGINE_TASTES[spec.taste], palette = spec.palette;
  const street = spec.taste === "bold-street", pop = spec.taste === "festive-pop";
  const panel = spec.artDirection.variant === "street-editorial";
  const subjectLed = spec.artDirection.treatment === "subject-led";
  const wide = format.width > format.height;
  const groups = subjectLed ? hierarchyGroups(spec.campaign.supportingText) : copyGroups(spec.campaign.supportingText);
  useEffect(() => {
    const root = ref.current; let cancelled = false;
    if (root) root.dataset.ready = "false";
    prepareCampaignFonts().then(() => {
      if (!root || cancelled) return;
      const issues = fitAndInspect(root);
      if (issues.length && correction < 2) { setCorrection(correction + 1); return; }
      setStatus({ ready: true, issues }); onFit?.(issues.length > 0);
      onReport?.({ issues, corrections: resolveLayout(spec, format, correction).corrections, warnings: fontFallbackWarnings([spec.campaign.headline, spec.campaign.supportingText, spec.campaign.cta].join("\n")), sizes: Array.from(root.querySelectorAll<HTMLElement>("[data-fit]")).map((element) => ({ role: element.dataset.role ?? "text", pixels: parseFloat(getComputedStyle(element).fontSize) })) });
    }).catch(() => { if (!cancelled) { setStatus({ ready: true, issues: ["FONT_UNAVAILABLE"] }); onFit?.(true); onReport?.({ issues: ["FONT_UNAVAILABLE"], corrections: [], sizes: [], warnings: ["An approved font failed loading or integrity verification. Retry when local assets are available."] }); } });
    return () => { cancelled = true; };
  }, [spec, format, correction, onFit, onReport]);
  const text: CSSProperties = { margin: 0, padding: 0, color: palette.ink, fontFamily: '"YarcInter", Arial, Helvetica, sans-serif', whiteSpace: "pre-wrap", overflowWrap: "anywhere" };
  const maximumHeadline = Math.min(format.width * .20, format.height * .28, 240) * spec.typography.headlineScale * (spec.artDirection.emphasis === "editorial" ? .88 : 1);
  return <div ref={ref} data-poster={format.id} data-taste={spec.taste} data-version="3" data-variant={spec.artDirection.variant}
    data-ready={status.ready} data-overflow={status.issues.length > 0} data-quality={JSON.stringify(status.issues)} data-corrections={JSON.stringify(layout.corrections)} data-correction-step={correction}
    role="img" aria-label={`${format.name}: ${spec.campaign.headline.replaceAll("\n", " ")}`}
    style={{ position: "relative", width: format.width, height: format.height, flexShrink: 0, boxSizing: "border-box", overflow: "hidden", isolation: "isolate", background: palette.background, color: palette.ink, fontSynthesis: "none" }}>
    {pop && <div aria-hidden="true" style={{ position: "absolute", inset: 17, border: `${subjectLed ? 7 : 4}px solid ${palette.ink}`, borderRadius: subjectLed ? (wide ? 38 : 64) : tokens.corner }} />}
    <p data-fit data-role="kicker" data-min={layout.floors.kicker} data-max="32" style={{ ...text, ...rectStyle(layout.kicker), fontWeight: 700, lineHeight: 1.1, letterSpacing: street ? "0.11em" : ".06em", textTransform: "uppercase", borderBottom: !pop ? `3px solid ${palette.ink}` : undefined, textAlign: layout.align }}>{spec.campaign.eyebrow}</p>
    <h2 data-fit data-role="headline" data-min={layout.floors.headline} data-max={Math.max(layout.floors.headline, maximumHeadline)} style={{ ...text, ...rectStyle(layout.headline), fontFamily: tokens.font, fontWeight: tokens.weight, letterSpacing: tokens.tracking, lineHeight: tokens.lineHeight,
      textTransform: street ? "uppercase" : "none", textAlign: layout.align, textWrap: "balance", ...(subjectLed ? { overflowWrap: "normal", whiteSpace: "pre-line" } : {}), ...(!spec.campaign.supportingText && !layout.art ? { alignContent: "center" } : {}), ...(panel ? { background: palette.ink, color: palette.background, padding: "12px 20px" } : {}) }}>{spec.campaign.headline}</h2>
    {layout.art && <div data-hero data-decoration={spec.decoration.motif} data-illustration={spec.artDirection.visual} style={{ ...rectStyle(layout.art), padding: pop ? 5 : 0 }}>{subjectLed ? <SubjectVisual kind={spec.artDirection.visual} taste={spec.taste} {...palette} /> : <ProceduralVisual kind={spec.artDirection.visual} ink={palette.ink} accent={palette.accent} background={palette.background} density={spec.decoration.density} />}</div>}
    {spec.campaign.supportingText && <div data-fit data-role="support" data-min={layout.floors.support} data-max={subjectLed ? (wide ? Math.round(format.height / 720 * 46) : 46) : pop ? 44 : 40} style={{ ...text, ...rectStyle(layout.support), fontWeight: spec.artDirection.emphasis === "display" ? 600 : 400, lineHeight: 1.24, display: "grid", gridTemplateColumns: `repeat(${layout.columns},minmax(0,1fr))`, alignContent: "start", gap: layout.columns > 1 ? "20px 32px" : 18, textAlign: layout.align === "center" ? "center" : "left" }}>
      {groups.map((group, index) => {
        const role = subjectLed && /^(?:venue|location) changed\b/i.test(group) ? "where" : informationRole(group), primary = role === "when" || role === "where";
        return <p key={`${index}-${group}`} data-copy-group data-information-role={role} style={{ margin: 0, boxSizing: "border-box", fontWeight: primary ? 700 : role === "entry" ? 600 : 400, fontSize: subjectLed || primary ? "1em" : `max(${layout.floors.support}px, .92em)`, gridColumn: layout.columns > 1 && role === "registration" ? "1 / -1" : undefined, paddingTop: groups.length > 1 ? 12 : 0, borderTop: groups.length > 1 ? `${primary ? 3 : 1}px solid ${palette.accent}` : undefined }}>{group.split(/(https?:\/\/\S+)/g).map((part, partIndex) => /^https?:\/\//.test(part) ? <span key={partIndex}>{part.split(/(?<=\/)/).map((piece, pieceIndex) => <span key={pieceIndex}>{piece}<wbr /></span>)}</span> : part)}</p>;
      })}
    </div>}
    {spec.campaign.cta && <p data-fit data-role="cta" data-min={layout.floors.cta} data-max="40" style={{ ...text, ...rectStyle(layout.cta), background: palette.ink, color: palette.background, borderRadius: pop ? 24 : 0, padding: "10px 18px", fontWeight: 700, lineHeight: 1.15 }}>{spec.campaign.cta}</p>}
    {street && spec.decoration.density > 1 && <svg aria-hidden="true" width="120" height="14" viewBox="0 0 120 14" style={{ position: "absolute", bottom: 12, right: 24 }}>{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={i*10+5} cy="7" r={spec.decoration.density === 3 ? 3 : 2} fill={palette.ink} />)}</svg>}
  </div>;
}
