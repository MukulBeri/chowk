"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { createDesign, designSchema, FORMATS, PRESETS, SAMPLE_TOPIC, type Taste, type Format, type DesignSpec } from "@/lib/design";
import { ENGINE_TASTES, PALETTES, type ArtDirection } from "@/lib/design-engine/registry";
import { generationRequestSchema, generationResultSchema, incompleteBriefResponseSchema, type GenerationResult } from "@/lib/generation/contracts";
import { exportHtml, exportPng, saveFile } from "@/lib/export";
import { TastePicker } from "./taste-picker";
import { StudioArtboard } from "./studio-artboard";
import { StudioDialog, ArtworkSnapshot } from "./studio-dialog";
import { compositionCandidates } from "@/lib/design-engine/candidates";
const subscribe = () => () => { };
type Draft = {
    topic: string;
    details: string;
    taste: Taste;
    treatment?: "creative-led";
};
type Copy = {
    topic: string;
    headline: string;
    supportingText: string;
    cta: string;
};
export type Campaign = {
    spec: DesignSpec;
    generation: GenerationResult | null;
    input: Draft;
    revision: number;
};
type Inspection = {
    kind: "spec" | "checks" | "artwork";
    campaign: Campaign;
    format?: Format;
    node?: HTMLElement;
    measurements?: object;
};
const copyOf = (s: DesignSpec): Copy => ({ topic: s.campaign.topic, headline: s.campaign.headline, supportingText: s.campaign.supportingText, cta: s.campaign.cta ?? "" });
const readable = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replaceAll("-", " ");
export function Studio() {
    const interactive = useSyncExternalStore(subscribe, () => true, () => false);
    const [draft, setDraft] = useState<Draft>({ topic: "", details: "", taste: "bold-street" });
    const [campaign, setCampaign] = useState<Campaign | null>(null), committed = useRef<Campaign | null>(null);
    const [copy, setCopy] = useState<Copy>({ topic: "", headline: "", supportingText: "", cta: "" });
    const [creationOpen, setCreationOpen] = useState(true), [inspection, setInspection] = useState<Inspection | null>(null);
    const [busy, setBusy] = useState(false), exportLock = useRef(false), [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState(""), [error, setError] = useState<{
        kind: "generation" | "input" | "copy" | "export";
        text: string;
    } | null>(null);
    const [incomplete, setIncomplete] = useState<ReturnType<typeof incompleteBriefResponseSchema.parse> | null>(null);
    const [rendered, setRendered] = useState<{
        revision: number;
        formats: Record<string, boolean>;
    }>({ revision: 0, formats: {} });
    const gallery = useRef<HTMLDivElement>(null), requestId = useRef(0), pending = useRef<AbortController | null>(null), lastMode = useRef<"auto" | "local">("auto");
    useEffect(() => () => { requestId.current++; pending.current?.abort(); }, []);
    const spec = campaign?.spec;
    const copyDirty = Boolean(spec && Object.entries(copy).some(([k, v]) => v !== (spec.campaign[k as keyof Copy] ?? "")));
    const draftChanged = Boolean(campaign && (draft.topic.trim() !== campaign.input.topic || draft.details.trim() !== campaign.input.details || draft.taste !== campaign.input.taste || draft.treatment !== campaign.input.treatment));
    const allReady = Boolean(campaign && rendered.revision === campaign.revision && FORMATS.every(f => rendered.formats[f.id]));
    function commit(s: DesignSpec, g: GenerationResult | null, input: Draft) { const next = { spec: s, generation: g, input, revision: (committed.current?.revision ?? 0) + 1 }; committed.current = next; setCampaign(next); setCopy(copyOf(s)); setRendered({ revision: next.revision, formats: {} }); }
    function changeDraft(change: Partial<Draft>) { if (exportLock.current)
        return; requestId.current++; pending.current?.abort(); pending.current = null; setGenerating(false); setDraft(p => ({ ...p, ...change })); setError(null); setIncomplete(null); setMessage(""); }
    async function generate(mode: "auto" | "local" = "auto") {
        if (!interactive || exportLock.current || pending.current)
            return;
        const parsed = generationRequestSchema.safeParse({ ...draft, mode });
        if (!parsed.success) {
            setError({ kind: "input", text: "Enter a topic. Keep topic/details within 1200 characters each and 2200 combined." });
            return;
        }
        const id = ++requestId.current, controller = new AbortController();
        pending.current = controller;
        lastMode.current = mode;
        setGenerating(true);
        setError(null);
        setMessage("");
        setIncomplete(null);
        const timer = setTimeout(() => controller.abort(), 45000);
        try {
            const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: controller.signal });
            if (response.status === 422) {
                const problem = incompleteBriefResponseSchema.safeParse(await response.json());
                if (problem.success && id === requestId.current) {
                    setIncomplete(problem.data);
                    setError({ kind: "input", text: problem.data.error });
                    return;
                }
            }
            if (!response.ok)
                throw new Error("request-failed");
            const data = generationResultSchema.parse(await response.json());
            if (id !== requestId.current)
                return;
            if (data.spec.version < 2 || data.spec.taste !== parsed.data.taste || data.spec.provenance !== data.metadata.source)
                throw new Error("invalid-response");
            if (Boolean(parsed.data.treatment) !== (data.spec.version === 3 && data.spec.artDirection.treatment === "creative-led"))
                throw new Error("unexpected-treatment");
            commit(data.spec, data, { topic: parsed.data.topic, details: parsed.data.details, taste: parsed.data.taste, ...(parsed.data.treatment ? { treatment: parsed.data.treatment } : {}) });
            setMessage(data.metadata.source === "gemini" ? "AI campaign ready. Review the copy and supplied facts before publishing." : data.metadata.fallbackReason === "requested-local" ? "Local planner campaign ready. No AI request." : data.metadata.fallbackReason === "disabled" ? "Local planner campaign ready. Server-side AI is disabled; no provider request." : "Local fallback campaign ready. No successful AI generation; supplied copy has been retained conservatively.");
        }
        catch {
            if (id === requestId.current)
                setError({ kind: "generation", text: "Generation could not finish. Your previous campaign is preserved. Try again." });
        }
        finally {
            clearTimeout(timer);
            if (id === requestId.current) {
                setGenerating(false);
                pending.current = null;
            }
        }
    }
    function showExample() { if (exportLock.current || pending.current)
        return; const input = { topic: SAMPLE_TOPIC, details: "", taste: draft.taste }; setDraft(input); commit(createDesign({ taste: input.taste, topic: SAMPLE_TOPIC }), null, input); setMessage("Sample campaign ready. No AI request."); setError(null); }
    function applyCopy(e: FormEvent) { e.preventDefault(); if (!campaign || exportLock.current || pending.current)
        return; const result = designSchema.safeParse({ ...campaign.spec, provenance: "manual-input", campaign: { ...campaign.spec.campaign, ...copy, cta: copy.cta || undefined } }); if (!result.success) {
        setError({ kind: "copy", text: "Check copy lengths and required fields. Creative-led campaigns must retain all supplied public facts verbatim. No changes were applied." });
        return;
    } commit(result.data, campaign.generation, campaign.input); setMessage("Manual copy applied to all four formats. No AI used."); setError(null); }
    function refine(change: Partial<ArtDirection>) { if (!campaign || campaign.spec.version !== 3 || exportLock.current || pending.current)
        return; const base = campaign.spec, direction = { ...base.artDirection, ...change }; const result = designSchema.safeParse({ ...base, provenance: "manual-input", artDirection: direction, palette: PALETTES[direction.palette], rationale: `${PRESETS[base.taste].name}: ${direction.variant.replaceAll("-", " ")} with ${direction.palette.replaceAll("-", " ")} colours. Manual adjustments retain campaign copy; no new AI request.` }); if (!result.success) {
        setError({ kind: "copy", text: "Choose a supported option for the displayed campaign's taste." });
        return;
    } const edits = copy; commit(result.data, campaign.generation, campaign.input); setCopy(edits); setMessage("Design adjusted locally. No AI request."); setError(null); }
    const onReady = useCallback((format: string, revision: number, ready: boolean) => { if (committed.current?.revision !== revision)
        return; setRendered(p => p.revision === revision && p.formats[format] === ready ? p : { revision, formats: { ...(p.revision === revision ? p.formats : {}), [format]: ready } }); }, []);
    function nodes() { return Array.from(gallery.current?.querySelectorAll<HTMLElement>("[data-poster]") ?? []); }
    async function download(format?: Format) { if (exportLock.current || pending.current || !committed.current)
        return; exportLock.current = true; setBusy(true); setError(null); setMessage(""); const snapshot = committed.current; try {
        if (copyDirty)
            throw new Error("Apply your copy before exporting.");
        if (gallery.current?.dataset.campaignRevision !== String(snapshot.revision))
            throw new Error("Layout is still settling. Please try again.");
        const posters = nodes();
        if (posters.length !== 4 || posters.some(n => n.dataset.ready !== "true"))
            throw new Error("Layout is still settling. Please try again.");
        if (!format)
            await exportHtml(posters, `${snapshot.spec.taste}-campaign.html`);
        else {
            const node = posters.find(n => n.dataset.poster === format.id);
            if (!node)
                throw new Error("Select a format to export.");
            await exportPng(node, format, `${snapshot.spec.taste}-${format.id}-${format.width}x${format.height}.png`);
        }
        setMessage(format ? `${format.name} PNG downloaded at ${format.width} × ${format.height} pixels.` : "Portable HTML downloaded with all four formats.");
    }
    catch (cause) {
        setError({ kind: "export", text: cause instanceof Error ? cause.message : "Export failed. Try portable HTML or another browser." });
    }
    finally {
        exportLock.current = false;
        setBusy(false);
    } }
    function inspect(kind: Inspection["kind"], format?: Format) {
        if (!campaign || exportLock.current)
            return;
        if (kind === "spec") {
            setInspection({ kind, campaign });
            return;
        }
        const node = nodes().find(n => n.dataset.poster === format?.id);
        if (!node || node.dataset.ready !== "true")
            return;
        const measurements = { fits: node.dataset.overflow !== "true", issues: node.dataset.quality ? JSON.parse(node.dataset.quality) : node.dataset.overflow === "true" ? ["TEXT_OVERFLOW"] : [], corrections: JSON.parse(node.dataset.corrections ?? "[]"), fields: Array.from(node.querySelectorAll<HTMLElement>("[data-fit]")).map(f => ({ role: f.dataset.role ?? (f.tagName === "H2" ? "headline" : "text"), nativePixels: parseFloat(getComputedStyle(f).fontSize), minimum: Number(f.dataset.min), horizontalFit: f.scrollWidth <= f.clientWidth + 1, verticalFit: f.scrollHeight <= f.clientHeight + 1 })) };
        const clone = kind === "artwork" ? node.cloneNode(true) as HTMLElement : undefined;
        if (clone)
            for (const el of [clone, ...Array.from(clone.querySelectorAll("*"))]) {
                el.removeAttribute("id");
                for (const a of Array.from(el.attributes))
                    if (a.name.startsWith("data-"))
                        el.removeAttribute(a.name);
            }
        setInspection({ kind, campaign, format, node: clone, measurements });
    }
    const generation = campaign?.generation;
    const origin = !campaign ? "" : !generation ? "Example campaign · no AI" : generation.metadata.source === "gemini" ? `AI · ${generation.metadata.model}${generation.metadata.cached ? " · reused result" : ""}` : generation.metadata.fallbackReason === "requested-local" ? "Local planner · no AI request" : generation.metadata.fallbackReason === "disabled" ? "Local planner · AI disabled" : "Fallback · independent local planner";
    const provenance = spec?.provenance === "manual-input" ? "Manual edits · no new AI request" : origin;
    const status = generating ? `Generating a campaign from your brief…${campaign ? " Previous campaign remains visible." : ""}` : busy ? "Preparing your export…" : error?.text || (campaign && !allReady ? "Measuring layouts and preparing fonts…" : message || (copyDirty ? "Unapplied copy edits. Apply them before exporting." : ""));
    return <div className="studio-shell">
  <a className="skip-link" href="#campaign-gallery">Skip to campaign</a>
  <header className="studio-header"><Link className="wordmark" href="/" aria-label="Create Studio home"><span className="brand-mark" aria-hidden="true">c.</span>create <span className="brand-divider">/</span> studio</Link><span className="header-caption">One idea. Four formats.</span><span className="workspace-label"><i aria-hidden="true"/><span>Campaign workspace</span></span></header>
  <main className="studio-workspace"><aside className="creation-panel" aria-label="Campaign controls">
   <button className="creation-toggle" aria-expanded={creationOpen} aria-controls="creation-controls" onClick={() => setCreationOpen(!creationOpen)}>Brief &amp; taste · {PRESETS[draft.taste].name}<span aria-hidden="true">{creationOpen ? "−" : "+"}</span></button>
   <div id="creation-controls" className={`creation-body ${creationOpen ? "" : "is-collapsed"}`}><div className="creation-heading"><h1>Create a campaign</h1><p>Start with an idea and choose its visual voice.</p></div>
    <label htmlFor="topic">What are we creating for?</label><textarea id="topic" maxLength={1200} rows={3} value={draft.topic} disabled={busy || !interactive} onChange={e => changeDraft({ topic: e.target.value })} placeholder="A campus poetry evening, a new café…" aria-describedby="brief-privacy"/>
    <label htmlFor="brief-details">Optional details</label><textarea id="brief-details" maxLength={1200} rows={4} value={draft.details} disabled={busy || !interactive} onChange={e => changeDraft({ details: e.target.value })} placeholder="Audience, exact facts, dates, prices or preferences"/>
    <p id="brief-privacy" className="field-note">AI briefs are sent to Google Gemini only when server-side inference is enabled. Avoid private information. Local planning makes no AI request. <a href="/api/notices" target="_blank" rel="noopener noreferrer">Licenses and notices</a></p>
    <TastePicker value={draft.taste} disabled={busy || !interactive} onChange={taste => changeDraft({ taste })}/>
    <label htmlFor="planning-approach">Planning approach</label><select id="planning-approach" value={draft.treatment ?? "standard"} disabled={busy || !interactive} onChange={e => changeDraft({ treatment: e.target.value === "creative-led" ? "creative-led" : undefined })}><option value="standard">Standard</option><option value="creative-led">Creative-led · fact-led recipes</option></select>
    {draft.treatment && <p className="field-note">Separates public facts from creative instructions. Composition alternatives are derived locally from one plan.</p>}
    <button className="primary-action" disabled={busy || generating || !interactive} onClick={() => generate()}>{generating ? "Generating campaign…" : "Generate campaign ↗"}</button><button className="secondary-action local-planner-button" disabled={busy || generating || !interactive} onClick={() => generate("local")}>Use local planner · no AI request</button>
    {campaign && <section className="refinement-panel" aria-label="Refine current result"><h2>Refine current result</h2><p className="field-note">Editing {PRESETS[campaign.spec.taste].name}. Local changes make no new AI request.</p><form onSubmit={applyCopy}><details className="copy-details"><summary>Edit campaign copy</summary>
     <label htmlFor="campaign-topic">Campaign topic</label><textarea id="campaign-topic" maxLength={spec!.version === 1 ? 240 : 1200} rows={2} value={copy.topic} required disabled={busy || generating} onChange={e => setCopy({ ...copy, topic: e.target.value })}/>
     <label htmlFor="headline">Headline <span>up to 240 characters</span></label><textarea id="headline" maxLength={240} rows={3} value={copy.headline} required disabled={busy || generating} onChange={e => setCopy({ ...copy, headline: e.target.value })}/>
     <label htmlFor="supporting">Supporting text</label><textarea id="supporting" maxLength={spec!.version === 1 ? 180 : 2400} rows={4} value={copy.supportingText} disabled={busy || generating} onChange={e => setCopy({ ...copy, supportingText: e.target.value })}/>
     <label htmlFor="cta">Call to action <span>optional</span></label><input id="cta" maxLength={60} value={copy.cta} disabled={busy || generating} onChange={e => setCopy({ ...copy, cta: e.target.value })}/>
     <button className="secondary-action apply-button" type="submit" disabled={busy || generating || !copyDirty}>{copyDirty ? "Apply copy to campaign ↗" : "Copy is up to date ✓"}</button></details></form>
     {spec?.version === 3 && <><label htmlFor="composition-choice">Composition</label><select id="composition-choice" value={spec.artDirection.recipe ?? spec.artDirection.variant} disabled={busy || generating} onChange={e => refine(spec.artDirection.treatment === "creative-led" ? { recipe: e.target.value as ArtDirection["recipe"] } : { variant: e.target.value as ArtDirection["variant"] })}>{spec.artDirection.treatment === "creative-led" ? compositionCandidates(spec).map(c => <option key={c.id} value={c.recipe}>{readable(c.recipe)} · local composition</option>) : ENGINE_TASTES[spec.taste].variants.map(id => <option key={id} value={id}>{readable(id)}</option>)}</select><label htmlFor="palette-choice">Artwork palette</label><select id="palette-choice" value={spec.artDirection.palette} disabled={busy || generating} onChange={e => refine({ palette: e.target.value as ArtDirection["palette"] })}>{ENGINE_TASTES[spec.taste].palettes.map(id => <option key={id} value={id}>{readable(id)}</option>)}</select><div className="palette-tokens" role="group" aria-label="Campaign colour palette">{Object.entries(spec.palette).map(([key, colour]) => <span key={key} title={`${key}: ${colour}`} style={{ background: colour }}/>)}</div></>}
    </section>}
   </div></aside>
   <section id="campaign-gallery" className="campaign-stage" aria-label="Campaign outputs" tabIndex={-1}>
    {campaign ? <><div className="gallery-heading"><div className="campaign-identity"><p>Campaign{!generation ? " · example" : ""}</p><h2>{spec!.campaign.headline.replaceAll("\n", " ")}</h2><p data-applied-taste>{PRESETS[spec!.taste].name} · 4 adaptive formats</p></div><div className="gallery-actions"><button className="stage-button" aria-label="Inspect spec" onClick={() => inspect("spec")} disabled={busy}>Design &amp; spec ↗</button><button className="stage-button stage-primary" onClick={() => download()} disabled={busy || generating || copyDirty || !allReady}>Export HTML ↓</button></div></div>
     {draftChanged && <p className="draft-note" role="note">Draft changed · Showing the previous {PRESETS[spec!.taste].name} campaign. Generate or use the local planner to apply your new brief and taste.</p>}
     <div className="generation-provenance"><div className="provenance-line"><strong><i aria-hidden="true"/>{provenance}</strong><span>{spec!.provenance === "manual-input" ? `Originally ${origin.toLowerCase()}. ` : ""}Review copy and facts before publishing.</span></div>{generation && <details><summary>Creative plan and generation details</summary><p>{generation.metadata.fallbackReason ? `Reason: ${generation.metadata.fallbackReason.replaceAll("-", " ")}. ` : ""}{generation.metadata.warnings.join(" ")}</p><pre tabIndex={0}>{JSON.stringify({ interpretation: generation.interpretation, metadata: generation.metadata }, null, 2)}</pre></details>}</div>
    </> : <div className="empty-state"><div className="empty-artboards" aria-hidden="true"><i /><i /><i /><i /></div><h2>One idea. A complete campaign.</h2><p>Describe what you want to share, choose a taste and create four coordinated formats.</p><p>Start with AI, or use the independent local planner.</p><button className="stage-button" onClick={showExample} disabled={busy || generating || !interactive}>View sample campaign · no AI</button></div>}
    <div className={`export-status ${error ? "has-error" : ""}`} role="status" aria-live="polite">{error ? <span role="alert">{status}{error.kind === "generation" && <button className="stage-link" onClick={() => generate(lastMode.current)} disabled={busy || generating}>Retry generation</button>}</span> : status}</div>
    {incomplete && <div className="incomplete-note" role="note" aria-label="Incomplete brief"><strong>Brief needs a subject · no new campaign generated</strong><p>{incomplete.interpretation.missingInformation.join(" ")}</p><details><summary>Brief interpretation</summary><pre tabIndex={0}>{JSON.stringify(incomplete.interpretation, null, 2)}</pre></details></div>}
    {copyDirty && <p className="draft-note" role="note">Unapplied copy edits · exports use applied copy only. Apply your edits before exporting.</p>}
    <div className="poster-grid" aria-busy={generating || busy || Boolean(campaign && !allReady)} ref={gallery} data-campaign-revision={campaign?.revision}>{campaign && FORMATS.map(format => <StudioArtboard key={`${campaign.revision}-${format.id}`} campaign={campaign} format={format} disabled={busy || generating || copyDirty} onReady={onReady} onExport={() => download(format)} onInspect={kind => inspect(kind, format)}/>)}</div>
   </section>
  </main>
  {inspection && <StudioDialog title={inspection.kind === "spec" ? "Design & spec" : `${inspection.format!.name} ${inspection.kind === "checks" ? "layout checks" : "artwork"}`} onClose={() => setInspection(null)}><p className="inspection-note">Snapshot of the displayed campaign when opened.</p>
   {inspection.kind === "artwork" && <ArtworkSnapshot node={inspection.node!} format={inspection.format!}/>}
   {inspection.kind === "checks" && <><p>Measured geometry and font sizes help detect layout problems. They do not certify artistic quality, factual accuracy or social-size legibility.</p><pre tabIndex={0}>{JSON.stringify(inspection.measurements, null, 2)}</pre></>}
   {inspection.kind === "spec" && <section className="spec-panel" aria-label="Intermediate design specification"><h3>Creative rationale</h3><p>{inspection.campaign.spec.rationale}</p><div className="spec-heading"><h3>Design specification · v{inspection.campaign.spec.version}</h3><button className="stage-button stage-primary" onClick={() => saveFile(new Blob([JSON.stringify(inspection.campaign.spec, null, 2)], { type: "application/json" }), `${inspection.campaign.spec.taste}-design-spec.json`)}>Download JSON ↓</button></div><pre tabIndex={0}>{JSON.stringify(inspection.campaign.spec, null, 2)}</pre></section>}
  </StudioDialog>}
 </div>;
}
