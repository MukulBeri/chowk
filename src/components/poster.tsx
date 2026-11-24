"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FONT_FAMILIES, type DesignSpec, type Format } from "@/lib/design";
import { AdvancedPoster, type LayoutReport } from "./advanced-poster";
const reset: CSSProperties = { margin: 0, padding: 0, boxSizing: "border-box" };

function Cup({ ink, fill, minimal }: { ink: string; fill: string; minimal: boolean }) {
  return <svg viewBox="0 0 360 360" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
    <path d="M132 90 C100 60 153 52 132 25 M186 90 C154 60 207 52 186 25 M240 90 C208 60 261 52 240 25" fill="none" stroke={ink} strokeWidth={minimal ? 5 : 9} strokeLinecap="round" />
    <path d="M268 132 H286 C342 132 340 223 276 227" fill="none" stroke={ink} strokeWidth="15" />
    <path d="M69 117 H274 L250 284 Q172 320 94 284 Z" fill={fill} stroke={ink} strokeWidth={minimal ? 5 : 10} strokeLinejoin="round" />
    <ellipse cx="172" cy="119" rx="103" ry="22" fill={ink} />
    <path d="M67 324 H285" stroke={ink} strokeWidth={minimal ? 5 : 10} strokeLinecap="round" />
    {!minimal && <path d="M116 160 L127 262" stroke={ink} strokeWidth="7" opacity="0.35" />}
  </svg>;
}
function fitText(root: HTMLElement) {
  let overflow = false;
  root.querySelectorAll<HTMLElement>("[data-fit]").forEach((element) => {
    let low = Number(element.dataset.min ?? 22);
    let high = Number(element.dataset.max ?? 150);
    const fits = () => element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1;
    element.style.fontSize = `${low}px`;
    if (!fits()) { overflow = true; return; }
    while (high - low > 0.5) {
      const mid = (high + low) / 2;
      element.style.fontSize = `${mid}px`;
      if (fits()) low = mid; else high = mid;
    }
    element.style.fontSize = `${Math.floor(low)}px`;
  });
  return overflow;
}
function LegacyPoster({ spec, format, onFit }: { spec: Exclude<DesignSpec, { version: 3 }>; format: Format; onFit?: (overflow: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState({ ready: false, overflow: false });
  useEffect(() => {
    let cancelled = false;
    const root = ref.current;
    if (root) root.dataset.ready = "false";
    document.fonts.ready.then(() => {
      if (cancelled || !root) return;
      const overflow = fitText(root);
      setStatus({ overflow, ready: true });
      onFit?.(overflow);
      root.dataset.ready = "true";
    });
    return () => { cancelled = true; };
  }, [spec, format, onFit]);
  const { width: w, height: h } = format;
  const wide = w > h;
  const square = w === h;
  const street = spec.composition.layout === "street-stack";
  const swiss = spec.composition.layout === "swiss-grid";
  const festive = spec.composition.layout === "festival-frame";
  const { background, ink, accent, secondary } = spec.palette;
  const pad = spec.composition.spacing;
  const illustration = spec.version === 2 ? spec.decoration.illustration : "cup";
  const noArt = illustration === "none" || (spec.version === 2 && spec.campaign.supportingText.length > 180);
  const bodyFamily = 'Arial, Helvetica, sans-serif';
  const innerW = w - 2 * pad;
  const headlineW = wide ? Math.min(innerW * 0.6, w - h * 0.62 - 2 * pad - (street ? 70 : 36)) : innerW;
  const headlineH = noArt ? h * (wide ? 0.30 : 0.32) : wide ? h * 0.45 : h * (square ? swiss ? 0.28 : 0.33 : 0.36);
  const titleY = wide ? h * 0.23 : h * (swiss ? 0.18 : 0.14);
  const artSize = wide ? h * 0.62 : h * (square ? 0.29 : 0.27);
  const artLeft = wide ? w - artSize - pad : swiss ? w - artSize - pad : (w - artSize) / 2;
  const artTop = wide ? (h - artSize) / 2 + 16 : h * (square ? 0.5 : 0.54);
  const supportingW = noArt ? innerW : wide ? headlineW : swiss ? innerW * 0.51 : innerW;
  const supportingY = noArt ? titleY + headlineH + 20 : wide ? h * 0.72 : swiss ? h * 0.61 : h * (square ? 0.82 : 0.84);
  const supportingH = noArt ? h - supportingY - pad * 0.7 - 90 : !wide && swiss ? h * 0.18 : wide ? h * 0.12 : h * 0.075;
  const baseText: CSSProperties = { ...reset, position: "absolute", color: ink, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: bodyFamily };
  return <div ref={ref} data-poster={format.id} data-taste={spec.taste} data-ready={status.ready} data-overflow={status.overflow}
    role="img" aria-label={`${format.name}: ${spec.campaign.headline.replaceAll("\n", " ")}`}
    style={{ ...reset, position: "relative", width: w, height: h, flexShrink: 0, background, color: ink, overflow: "hidden", fontFamily: bodyFamily, lineHeight: 1.2, isolation: "isolate" }}>
    {festive && <div style={{ position: "absolute", inset: 24, border: `3px dashed ${secondary}`, borderRadius: wide ? 40 : 90, boxSizing: "border-box" }} />}
    <div style={{ ...baseText, left: pad, right: pad, top: pad, height: 44, fontSize: 22, letterSpacing: swiss ? 3 : 2, fontWeight: 700, textTransform: "uppercase", borderBottom: swiss ? `2px solid ${ink}` : undefined, textAlign: festive && !wide ? "center" : "left" }}>{spec.campaign.eyebrow}</div>
    {street && <div style={{ position: "absolute", width: 90, height: 12, right: pad, top: pad + 7, background: ink, transform: "rotate(-6deg)" }} />}
    <h2 data-fit data-min="24" data-max={Math.min(wide ? h * 0.2 : w * 0.19, 235) * spec.typography.headlineScale}
      style={{ ...baseText, left: pad, top: titleY, width: headlineW, height: headlineH, fontFamily: FONT_FAMILIES[spec.typography.family], fontSize: 80, fontWeight: swiss ? 500 : street ? 400 : 700, lineHeight: street ? 1.05 : 1.08, letterSpacing: street ? "-0.015em" : swiss ? "-0.035em" : "-0.02em", textTransform: spec.typography.case === "uppercase" ? "uppercase" : "none", textAlign: festive && !wide ? "center" : "left" }}>{spec.campaign.headline}</h2>
    {!noArt && <div data-decoration={spec.decoration.motif} data-illustration={illustration} style={{ position: "absolute", left: artLeft, top: artTop, width: artSize, height: artSize, background: swiss || festive ? accent : ink, borderRadius: swiss ? "50%" : festive ? "42% 42% 20% 20%" : "12%", transform: street ? "rotate(-8deg)" : "none", padding: artSize * 0.11, boxSizing: "border-box" }}>
      {illustration === "cup" ? <Cup ink={background} fill={swiss ? background : festive ? secondary : accent} minimal={swiss} /> : <svg viewBox="0 0 360 360" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}><circle cx="180" cy="180" r="118" fill="none" stroke={background} strokeWidth={swiss ? 6 : 20} /><path d="M95 242L242 95M122 95h120v120" fill="none" stroke={background} strokeWidth={swiss ? 8 : 24} strokeLinecap="square" /></svg>}
    </div>}
    {Array.from({ length: spec.decoration.density }).map((_, index) => <div key={index} style={{ position: "absolute", width: festive ? 22 : 10, height: festive ? 48 : 10, background: festive ? secondary : accent, borderRadius: festive ? 12 : 0, left: wide ? w * 0.64 + index * 22 : pad + index * 36, top: wide ? pad + index * 30 : h * 0.53 + index * 20, transform: `rotate(${25 + index * 40}deg)` }} />)}
    <p data-fit data-min="20" data-max={wide ? 32 : 30} style={{ ...baseText, left: pad, top: supportingY, width: supportingW, height: supportingH, fontSize: 28, lineHeight: 1.3, textAlign: festive && !wide ? "center" : "left" }}>{spec.campaign.supportingText}</p>
    <div style={{ position: "absolute", left: pad, right: pad, bottom: pad * 0.7, height: 44, display: "flex", alignItems: "center", borderTop: street ? `5px solid ${ink}` : swiss ? `1px solid ${ink}` : undefined, paddingTop: 12, boxSizing: "content-box" }}>
      {spec.campaign.cta && <p data-fit data-min="18" data-max="24" style={{ ...reset, width: "88%", height: 44, fontFamily: bodyFamily, fontWeight: 700, lineHeight: 1.15, whiteSpace: "pre-wrap", overflowWrap: "anywhere", textAlign: festive && !wide ? "center" : "left", color: festive ? accent : ink }}>{spec.campaign.cta}</p>}
      <span aria-hidden="true" style={{ marginLeft: "auto", fontSize: 32, fontFamily: bodyFamily, color: festive ? accent : ink }}>↗</span>
    </div>
  </div>;
}
export function Poster(props: { spec: DesignSpec; format: Format; onFit?: (overflow: boolean) => void; onReport?: (report: LayoutReport) => void }) {
  return props.spec.version === 3 ? <AdvancedPoster key={JSON.stringify(props.spec)} {...props} spec={props.spec} /> : <LegacyPoster {...props} spec={props.spec} />;
}
export function PosterPreview({ spec, format }: { spec: DesignSpec; format: Format }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const [overflow, setOverflow] = useState(false);
  const [report, setReport] = useState<LayoutReport | null>(null);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / format.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, [format.width]);
  return <><div ref={container} className="poster-preview" style={{ aspectRatio: `${format.width} / ${format.height}` }}>
    <div style={{ width: format.width, height: format.height, transform: `scale(${scale})`, transformOrigin: "top left" }}><Poster spec={spec} format={format} onFit={setOverflow} onReport={setReport} /></div>
    {overflow && <p className="poster-fit-warning" role="alert">{spec.version === 3 ? "This format still cannot fit all copy at readable sizes. Shorten or reorganize it before exporting." : "Copy exceeds this layout. Shorten it before exporting."}</p>}
  </div>{spec.version === 3 && report && <>{report.warnings?.map((warning) => <p className="poster-quality" role="note" key={warning}>{warning}</p>)}<details className="poster-quality"><summary>Layout and readability</summary><p>{report.issues.length ? "This format needs attention before export." : "All supplied copy fits the checked regions."}</p>{report.corrections.map((correction) => <p key={correction}>{correction}</p>)}<p>{report.sizes.map((size) => `${size.role}: ${size.pixels} native px`).join(" · ")}</p><small>Geometry and basic contrast checks do not certify visual quality or social-scale legibility.</small></details></>}</>;
}
