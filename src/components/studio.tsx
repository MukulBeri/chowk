"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { createDesign, designSchemaV2, FORMATS, PRESETS, SAMPLE_COPY, SAMPLE_TOPIC, TASTES, inputSchema, type Taste, type Format, type DesignSpec } from "@/lib/design";
import { generationRequestSchema, generationResultSchema, incompleteBriefResponseSchema, type GenerationResult } from "@/lib/generation/contracts";
import { exportHtml, exportPng, saveFile } from "@/lib/export";
import { PosterPreview } from "./poster";
const subscribeHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function Studio() {
  const interactive = useSyncExternalStore(subscribeHydration, clientReady, serverReady);
  const [taste, setTaste] = useState<Taste>("bold-street");
  const [copy, setCopy] = useState({ topic: SAMPLE_COPY.topic, headline: SAMPLE_COPY.headline, supportingText: SAMPLE_COPY.supportingText, cta: SAMPLE_COPY.cta });
  const [applied, setApplied] = useState<Partial<typeof copy>>({});
  const [showSpec, setShowSpec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [incomplete, setIncomplete] = useState<ReturnType<typeof incompleteBriefResponseSchema.parse> | null>(null);
  const [details, setDetails] = useState("");
  const [generated, setGenerated] = useState<GenerationResult | null>(null);
  const [manual, setManual] = useState(false);
  const [generating, setGenerating] = useState(false);
  const generationId = useRef(0);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => { generationId.current++; pending.current?.abort(); }, []);
  const gallery = useRef<HTMLDivElement>(null);
  const spec = useMemo<DesignSpec>(() => {
    if (!generated) return createDesign({ taste, topic: SAMPLE_TOPIC, ...applied });
    const base = generated.spec;
    if (!manual) return base;
    const preset = PRESETS[taste];
    return designSchemaV2.parse({ ...base, version: 2, provenance: "manual-input", taste,
      campaign: { ...base.campaign, ...applied, cta: applied.cta === "" ? undefined : applied.cta ?? base.campaign.cta },
      ...(base.taste !== taste ? { palette: preset.palette, typography: preset.typography, composition: preset.composition,
        decoration: { ...preset.decoration, illustration: base.version === 2 ? base.decoration.illustration : "abstract" },
        rationale: `${preset.name} applied manually to the existing campaign. Copy preserved; no new AI request.` } : {}) });
  }, [taste, applied, generated, manual]);
  const preset = PRESETS[taste];
  const dirty = Object.entries(copy).some(([key, value]) => value !== (spec.campaign[key as keyof typeof copy] ?? ""));

  function invalidateGeneration() {
    generationId.current++; pending.current?.abort(); pending.current = null;
    setGenerating(false);
  }
  async function generate(mode: "auto" | "local" = "auto") {
    const parsed = generationRequestSchema.safeParse({ topic: copy.topic, details, taste, mode });
    if (!parsed.success) { setError("Enter a topic. Keep topic/details within 1200 characters each and 2200 combined."); return; }
    invalidateGeneration();
    const id = generationId.current, controller = new AbortController(); pending.current = controller;
    setGenerating(true); setError(""); setMessage(""); setIncomplete(null);
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: controller.signal });
      if (response.status === 422) {
        const problem = incompleteBriefResponseSchema.safeParse(await response.json());
        if (problem.success && id === generationId.current) { setIncomplete(problem.data); setError(problem.data.error); return; }
      }
      if (!response.ok) throw new Error("request-failed");
      const data = generationResultSchema.parse(await response.json());
      if (id !== generationId.current) return;
      if (data.spec.version !== 2 || data.spec.taste !== parsed.data.taste || data.spec.provenance !== data.metadata.source) throw new Error("invalid-response");
      setGenerated(data); setManual(false); setApplied({});
      setCopy({ topic: data.spec.campaign.topic, headline: data.spec.campaign.headline, supportingText: data.spec.campaign.supportingText, cta: data.spec.campaign.cta ?? "" });
      setMessage(data.metadata.source === "gemini" ? "AI campaign ready. Review the copy and supplied facts before publishing." : "Local fallback campaign ready. No successful AI generation; supplied copy has been retained conservatively.");
    } catch {
      if (id === generationId.current) setError("Generation could not finish. Your previous campaign is preserved. Try again.");
    } finally {
      clearTimeout(timer);
      if (id === generationId.current) { setGenerating(false); pending.current = null; }
    }
  }

  function applyCopy(event: FormEvent) {
    event.preventDefault();
    const result = spec.version === 2 ? designSchemaV2.safeParse({ ...spec, provenance: "manual-input", campaign: { ...spec.campaign, ...copy, cta: copy.cta || undefined } })
      : inputSchema.safeParse({ taste, topic: copy.topic, headline: copy.headline, supportingText: copy.supportingText, cta: copy.cta });
    if (!result.success) { setError(result.error.issues.map((issue) => issue.message).join(" ")); return; }
    setApplied(copy);
    if (generated) setManual(true);
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
      <span className="milestone"><span className="status-dot" />M1 · Creative intelligence</span>
    </header>
    <main>
      <section className="intro"><div><p className="eyebrow">ONE IDEA. EVERY FORMAT.</p><h1>Make it feel <em>like you.</em></h1><p className="intro-description">Describe your idea. Give it a taste. Create one coordinated campaign.</p></div><div className="fixture-note"><span className="note-icon">✳</span><div><strong>{spec.provenance === "gemini" ? "AI-generated campaign" : spec.provenance === "deterministic-fallback" ? "Independent local fallback" : spec.provenance === "manual-input" ? "Manually edited campaign" : "Sample campaign · fixture"}</strong><p>{spec.provenance === "experimental-fixture" ? "Generate to create from your own brief." : "Review copy and facts before publishing."}<br />Create Lab is a working title.</p></div></div></section>
      <div className="workspace">
        <aside className="sidebar" aria-label="Campaign controls">
          <form onSubmit={applyCopy} className="brief-panel">
            <div className="section-label"><span>01 / THE BRIEF</span><span>↙</span></div>
            <label htmlFor="topic">What are we creating for?</label>
            <textarea id="topic" maxLength={1200} value={copy.topic} disabled={busy || !interactive} onChange={(e) => { invalidateGeneration(); setCopy({ ...copy, topic: e.target.value }); }} rows={3} required />
            <label htmlFor="brief-details">Optional details</label><textarea id="brief-details" maxLength={1200} rows={3} disabled={busy || !interactive} value={details} placeholder="Audience, exact facts, dates, prices or creative preferences" onChange={(e) => { invalidateGeneration(); setDetails(e.target.value); }} />
            <p className="field-note">Only include facts you want in the campaign. Missing details stay missing. Briefs are sent to Google Gemini; avoid private information.</p>
            <button className="generate-button" type="button" disabled={busy || generating || !interactive} onClick={() => generate()}>{generating ? "Generating campaign…" : "Generate campaign ↗"}</button>
            <button className="text-button local-planner-button" type="button" disabled={busy || generating || !interactive} onClick={() => generate("local")}>Use local planner · no AI</button>
            <details className="copy-details"><summary>Edit campaign copy</summary>
              <label htmlFor="headline">Headline <span>up to 240 characters</span></label><textarea id="headline" maxLength={240} rows={3} required disabled={busy || generating} value={copy.headline} onChange={(e) => setCopy({ ...copy, headline: e.target.value })} />
              <label htmlFor="supporting">Supporting text</label><textarea id="supporting" maxLength={spec.version === 2 ? 2400 : 180} rows={3} disabled={busy || generating} value={copy.supportingText} onChange={(e) => setCopy({ ...copy, supportingText: e.target.value })} />
              <label htmlFor="cta">Call to action <span>optional</span></label><input id="cta" maxLength={60} disabled={busy || generating} value={copy.cta} onChange={(e) => setCopy({ ...copy, cta: e.target.value })} />
            </details>
            <button className="apply-button" type="submit" disabled={busy || generating || !dirty}>{dirty ? "Apply copy to campaign ↗" : "Copy is up to date ✓"}</button>
          </form>
          <div className="taste-panel"><div className="section-label"><span>02 / YOUR TASTE</span><span>✳</span></div><p className="taste-prompt">Same story. Different energy.</p>
            <div className="taste-options" role="group" aria-label="Taste preset">{TASTES.map((id) => <button key={id} disabled={busy} className={`taste-option ${taste === id ? "selected" : ""}`} aria-pressed={taste === id} onClick={() => { invalidateGeneration(); setTaste(id); if (generated) setManual(true); setMessage(generated ? "Taste applied locally. Generate again for new AI art direction." : ""); setError(""); }}>
              <span className={`taste-swatch swatch-${id}`} style={{ background: PRESETS[id].palette.background, color: PRESETS[id].palette.ink }}>Aa<span>✳</span></span>
              <span className="taste-copy"><strong>{PRESETS[id].name}</strong><small>{PRESETS[id].subtitle}</small></span><span className="taste-check">{taste === id ? "●" : "○"}</span>
            </button>)}</div>
          </div>
          <div className="rationale"><span className="eyebrow">THE CREATIVE LOGIC</span><p>{spec.rationale}</p><div className="palette" aria-label="Campaign colour palette">{Object.entries(spec.palette).map(([key, colour]) => <span key={key} title={`${key}: ${colour}`} style={{ background: colour }} />)}<small>{spec.composition.layout.replaceAll("-", " ")}</small></div></div>
          <div className="pipeline-note"><span>BRIEF</span><i>→</i><span>SPEC</span><i>→</i><span>HTML</span><i>→</i><span>PNG</span></div>
        </aside>
        <section className="canvas-area" aria-label="Campaign outputs">
          <div className="canvas-toolbar"><div><span className="eyebrow">YOUR CAMPAIGN / {preset.number}</span><h2>{preset.name}<span>4 adaptive layouts</span></h2></div><div className="toolbar-actions"><button className="text-button" aria-expanded={showSpec} onClick={() => setShowSpec(!showSpec)}>{"{ }"} {showSpec ? "Hide" : "Inspect"} spec</button><button className="html-button" disabled={busy || generating || dirty} onClick={() => download(undefined, true)}>Export HTML <span>↗</span></button></div></div>
          <div className="export-status" aria-live="polite" role="status">{generating ? "Generating a campaign from your brief…" : busy ? "Preparing your export…" : error ? <span className="error">{error} <button className="text-button" disabled={busy} onClick={() => generate()}>Retry generation</button></span> : message || (dirty ? "Unapplied copy edits. Apply copy or generate a new campaign." : "HTML-built. Format-aware. Ready to explore.")}</div>
          {incomplete && <div className="generation-provenance" role="note" aria-label="Incomplete brief"><strong>Brief needs a subject · no new campaign generated</strong><p>{incomplete.interpretation.missingInformation.join(" ")}</p><details><summary>Brief interpretation</summary><pre>{JSON.stringify(incomplete.interpretation, null, 2)}</pre></details></div>}
          {generated && <div className="generation-provenance"><strong>{spec.provenance === "manual-input" ? "Manual edits · no new AI request" : generated.metadata.source === "gemini" ? `AI · ${generated.metadata.model}${generated.metadata.cached ? " · reused result" : ""}` : "Fallback · independent local planner"}</strong><p>{generated.metadata.fallbackReason ? `Reason: ${generated.metadata.fallbackReason.replaceAll("-", " ")}. ` : ""}{generated.metadata.warnings.join(" ")}</p><details><summary>Creative plan and generation details</summary><pre>{JSON.stringify({ interpretation: generated.interpretation, metadata: generated.metadata }, null, 2)}</pre></details></div>}
          {showSpec && <section className="spec-panel" aria-label="Intermediate design specification"><div><strong>Design specification · v{spec.version}</strong><button onClick={() => saveFile(new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" }), `${taste}-design-spec.json`)}>Download JSON ↓</button></div><p>{spec.provenance} · Validated with Zod</p><pre>{JSON.stringify(spec, null, 2)}</pre></section>}
          <div className="poster-grid" ref={gallery}>{FORMATS.map((format, index) => <article className={`format-card format-${format.id}`} key={`${taste}-${format.id}-${JSON.stringify(applied)}`} aria-label={format.name}>
            <div className="format-card-heading"><span className="format-index">0{index + 1}</span><h3>{format.name}</h3><span className="ratio-label">{format.ratio}</span></div>
            <PosterPreview spec={spec} format={format} />
            <div className="format-card-footer"><span>{format.width} × {format.height} px</span><button disabled={busy || generating || dirty} onClick={() => download(format)} aria-label={`Export ${format.name} PNG`}>PNG <span>↓</span></button></div>
          </article>)}</div>
          <div className="canvas-footnote"><span className="status-dot" /><p>{spec.provenance === "experimental-fixture" ? "Sample campaign" : spec.provenance === "gemini" ? "AI planned" : spec.provenance === "deterministic-fallback" ? "Local fallback" : "Manual copy"} · Deterministic HTML/CSS · Local exports</p><span>No external assets</span></div>
        </section>
      </div>
    </main><footer className="footer"><span>YARC BUILDER FELLOWSHIP / CREATE TRACK</span><span>Engineering foundation · M0 / 2026</span></footer>
  </div>;
}
