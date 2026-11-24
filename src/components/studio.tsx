"use client";
import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createDesign, FORMATS, PRESETS, SAMPLE_COPY, SAMPLE_TOPIC, TASTES, inputSchema, type Taste, type Format } from "@/lib/design";
import { exportHtml, exportPng, saveFile } from "@/lib/export";
import { PosterPreview } from "./poster";

export function Studio() {
  const [taste, setTaste] = useState<Taste>("bold-street");
  const [copy, setCopy] = useState({ topic: SAMPLE_COPY.topic, headline: SAMPLE_COPY.headline, supportingText: SAMPLE_COPY.supportingText, cta: SAMPLE_COPY.cta });
  const [applied, setApplied] = useState<Partial<typeof copy>>({});
  const [showSpec, setShowSpec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const gallery = useRef<HTMLDivElement>(null);
  const spec = useMemo(() => createDesign({ taste, topic: SAMPLE_TOPIC, ...applied }), [taste, applied]);
  const preset = PRESETS[taste];
  const dirty = Object.entries(copy).some(([key, value]) => value !== (spec.campaign[key as keyof typeof copy] ?? ""));

  function applyCopy(event: FormEvent) {
    event.preventDefault();
    const result = inputSchema.safeParse({ taste, topic: copy.topic, headline: copy.headline, supportingText: copy.supportingText, cta: copy.cta });
    if (!result.success) { setError(result.error.issues.map((issue) => issue.message).join(" ")); return; }
    setApplied(copy);
    setMessage("Manual copy applied to all four formats. No AI used.");
    setError("");
  }
  function nodes() { return Array.from(gallery.current?.querySelectorAll<HTMLElement>("[data-poster]") ?? []); }
  async function download(format?: Format, html = false) {
    setBusy(true); setError(""); setMessage("");
    try {
      if (dirty) throw new Error("Apply your copy before exporting.");
      const posters = nodes();
      if (posters.length !== 4) throw new Error("Previews are still loading. Please try again.");
      if (html) await exportHtml(posters, `${taste}-campaign.html`);
      else {
        const node = posters.find((item) => item.dataset.poster === format?.id);
        if (!node || !format) throw new Error("Select a format to export.");
        await exportPng(node, format, `${taste}-${format.id}-${format.width}x${format.height}.png`);
      }
      setMessage(html ? "Portable HTML downloaded with all four formats." : `${format?.name} PNG downloaded at ${format?.width} × ${format?.height} pixels.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Export failed. Try portable HTML or another browser."); }
    finally { setBusy(false); }
  }
  return <div className="app-shell">
    <header className="topbar">
      <Link className="wordmark" href="/" aria-label="Create Lab home"><span className="brand-symbol">c<span>↗</span></span>create<span className="lab-label">/ lab</span></Link>
      <span className="topbar-caption">A little taste goes a long way.</span>
      <span className="milestone"><span className="status-dot" />M0 · Rendering experiment</span>
    </header>
    <main>
      <section className="intro"><div><p className="eyebrow">ONE IDEA. EVERY FORMAT.</p><h1>Make it feel <em>like you.</em></h1><p className="intro-description">Explore three creative directions. See one campaign find its shape.</p></div><div className="fixture-note"><span className="note-icon">✳</span><div><strong>A workbench, in progress</strong><p>Experimental fixture data. No live AI generation.<br />Create Lab is a working title.</p></div></div></section>
      <div className="workspace">
        <aside className="sidebar" aria-label="Campaign controls">
          <form onSubmit={applyCopy} className="brief-panel">
            <div className="section-label"><span>01 / THE BRIEF</span><span>↙</span></div>
            <label htmlFor="topic">What are we creating for?</label>
            <textarea id="topic" maxLength={240} value={copy.topic} disabled={busy} onChange={(e) => setCopy({ ...copy, topic: e.target.value })} rows={3} required />
            <p className="field-note">The same brief across every direction. Edit copy below to test your own.</p>
            <details className="copy-details"><summary>Edit campaign copy</summary>
              <label htmlFor="headline">Headline <span>up to 240 characters</span></label><textarea id="headline" maxLength={240} rows={3} required disabled={busy} value={copy.headline} onChange={(e) => setCopy({ ...copy, headline: e.target.value })} />
              <label htmlFor="supporting">Supporting text</label><textarea id="supporting" maxLength={180} rows={3} disabled={busy} value={copy.supportingText} onChange={(e) => setCopy({ ...copy, supportingText: e.target.value })} />
              <label htmlFor="cta">Call to action <span>optional</span></label><input id="cta" maxLength={60} disabled={busy} value={copy.cta} onChange={(e) => setCopy({ ...copy, cta: e.target.value })} />
            </details>
            <button className="apply-button" type="submit" disabled={busy || !dirty}>{dirty ? "Apply copy to campaign ↗" : "Copy is up to date ✓"}</button>
          </form>
          <div className="taste-panel"><div className="section-label"><span>02 / YOUR TASTE</span><span>✳</span></div><p className="taste-prompt">Same story. Different energy.</p>
            <div className="taste-options" role="group" aria-label="Taste preset">{TASTES.map((id) => <button key={id} disabled={busy} className={`taste-option ${taste === id ? "selected" : ""}`} aria-pressed={taste === id} onClick={() => { setTaste(id); setMessage(""); setError(""); }}>
              <span className={`taste-swatch swatch-${id}`} style={{ background: PRESETS[id].palette.background, color: PRESETS[id].palette.ink }}>Aa<span>✳</span></span>
              <span className="taste-copy"><strong>{PRESETS[id].name}</strong><small>{PRESETS[id].subtitle}</small></span><span className="taste-check">{taste === id ? "●" : "○"}</span>
            </button>)}</div>
          </div>
          <div className="rationale"><span className="eyebrow">THE CREATIVE LOGIC</span><p>{spec.rationale}</p><div className="palette" aria-label="Campaign colour palette">{Object.entries(spec.palette).map(([key, colour]) => <span key={key} title={`${key}: ${colour}`} style={{ background: colour }} />)}<small>{spec.composition.layout.replaceAll("-", " ")}</small></div></div>
          <div className="pipeline-note"><span>BRIEF</span><i>→</i><span>SPEC</span><i>→</i><span>HTML</span><i>→</i><span>PNG</span></div>
        </aside>
        <section className="canvas-area" aria-label="Campaign outputs">
          <div className="canvas-toolbar"><div><span className="eyebrow">YOUR CAMPAIGN / {preset.number}</span><h2>{preset.name}<span>4 adaptive layouts</span></h2></div><div className="toolbar-actions"><button className="text-button" aria-expanded={showSpec} onClick={() => setShowSpec(!showSpec)}>{"{ }"} {showSpec ? "Hide" : "Inspect"} spec</button><button className="html-button" disabled={busy || dirty} onClick={() => download(undefined, true)}>Export HTML <span>↗</span></button></div></div>
          <div className="export-status" aria-live="polite" role="status">{busy ? "Preparing your export…" : error ? <span className="error">{error}</span> : dirty ? "Unapplied copy edits. Apply your copy before exporting." : message || "HTML-built. Format-aware. Ready to explore."}</div>
          {showSpec && <section className="spec-panel" aria-label="Intermediate design specification"><div><strong>Design specification · v1</strong><button onClick={() => saveFile(new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" }), `${taste}-design-spec.json`)}>Download JSON ↓</button></div><p>{spec.provenance} · Validated with Zod · No AI used</p><pre>{JSON.stringify(spec, null, 2)}</pre></section>}
          <div className="poster-grid" ref={gallery}>{FORMATS.map((format, index) => <article className={`format-card format-${format.id}`} key={`${taste}-${format.id}-${JSON.stringify(applied)}`} aria-label={format.name}>
            <div className="format-card-heading"><span className="format-index">0{index + 1}</span><h3>{format.name}</h3><span className="ratio-label">{format.ratio}</span></div>
            <PosterPreview spec={spec} format={format} />
            <div className="format-card-footer"><span>{format.width} × {format.height} px</span><button disabled={busy || dirty} onClick={() => download(format)} aria-label={`Export ${format.name} PNG`}>PNG <span>↓</span></button></div>
          </article>)}</div>
          <div className="canvas-footnote"><span className="status-dot" /><p>{spec.provenance === "experimental-fixture" ? "Sample campaign" : "Manual copy"} · Deterministic HTML/CSS · Local exports</p><span>No external assets</span></div>
        </section>
      </div>
    </main><footer className="footer"><span>YARC BUILDER FELLOWSHIP / CREATE TRACK</span><span>Engineering foundation · M0 / 2026</span></footer>
  </div>;
}
