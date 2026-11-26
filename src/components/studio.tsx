"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Image from "next/image";
import { createDesign, designSchema, FORMATS, PRESETS, SAMPLE_TOPIC, type Taste, type Format, type DesignSpec } from "@/lib/design";
import { ENGINE_TASTES, PALETTES, VISUALS, relevantVisual, type ArtDirection } from "@/lib/design-engine/registry";
import { generationRequestSchema, generationResultSchema, incompleteBriefResponseSchema, type GenerationResult } from "@/lib/generation/contracts";
import { exportHtml, exportPng, saveFile,nativePngBlob } from "@/lib/export";
import { TastePicker } from "./taste-picker";
import { StudioArtboard } from "./studio-artboard";
import { StudioDialog, ArtworkSnapshot } from "./studio-dialog";
import { compositionCandidates } from "@/lib/design-engine/candidates";
import { receiveStudioDraft } from "@/lib/studio-handoff";
import { ChowkLoading } from "./chowk-mark";
import { GALLERY } from "@/lib/gallery";
import { importRaster, type AssetLayer } from "@/lib/design-engine/assets";
import { conceptResponseSchema } from "@/lib/generation/concepts";
import { RefinementProof } from "./refinement-proof";
import { layoutSignals } from "@/lib/design-engine/layout-signals";
import {ElementEditor,type EditSelection} from "./element-editor";
import type {ElementEdit} from "@/lib/design-engine/editing";
import {LocalProjectLibrary} from "./local-project-library";
import {newProject,saveProject,validateProject,type LocalProject} from "@/lib/local-projects";
import {restoredImageCapabilities} from '@/lib/generation/capabilities';
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
    resetSpec?:DesignSpec;
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
export function Studio({ inferenceEnabled = false,metaEnabled=false }: { inferenceEnabled?: boolean;metaEnabled?:boolean }) {
    const [aiText,setAiText]=useState(true),[aiImage,setAiImage]=useState(false),[adult,setAdult]=useState(false),[country,setCountry]=useState('IN');
    const [fitViewport,setFitViewport]=useState(true);
    const [editingEnabled,setEditingEnabled]=useState(false),[editScope,setEditScope]=useState<"format"|"campaign">("format"),[editSelection,setEditSelection]=useState<EditSelection>({format:"instagram-portrait",role:"headline"});
    const history=useRef<{past:Campaign[];future:Campaign[]}>({past:[],future:[]}),[historyState,setHistoryState]=useState({undo:0,redo:0});
    const [projectsOpen,setProjectsOpen]=useState(false),[projectBusy,setProjectBusy]=useState(false),[activeProject,setActiveProject]=useState<LocalProject|null>(null);
    const [inspectionMessage, setInspectionMessage] = useState("");
    const [controlSection, setControlSection] = useState("all");
    const [mobileRegion, setMobileRegion] = useState<"edit" | "preview">("edit");
    const [assetFormat, setAssetFormat] = useState<"all" | Format["id"]>("all");
    const [assetEditing, setAssetEditing] = useState(false);
    const [concepts,setConcepts]=useState<{data:ReturnType<typeof conceptResponseSchema.parse>;input:Draft;elapsedMs:number}|null>(null);
    const [selectedConcept,setSelectedConcept]=useState<string|null>(null);
    const [previewPinned,setPreviewPinned]=useState(true);
    const interactive = useSyncExternalStore(subscribe, () => true, () => false);
    const [draft, setDraft] = useState<Draft>({ topic: "", details: "", taste: "bold-street" });
    const [campaign, setCampaign] = useState<Campaign | null>(null), committed = useRef<Campaign | null>(null);
    const [copy, setCopy] = useState<Copy>({ topic: "", headline: "", supportingText: "", cta: "" });
    const [creationOpen, setCreationOpen] = useState(true), [inspection, setInspection] = useState<Inspection | null>(null);
    const [view, setView] = useState<"all" | Format["id"]>("all"), [exportLabel, setExportLabel] = useState("Preparing your export…");
    function selectElement(selection:EditSelection){setEditSelection(selection);setView(selection.format);}
    const [exportFormat, setExportFormat] = useState<Format["id"] | null>(null);
    const [exporting, setBusy] = useState(false), exportLock = useRef(false), [generating, setGenerating] = useState(false);
    const busy = exporting || assetEditing || projectBusy;
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
    useEffect(() => receiveStudioDraft(input => { setDraft(input); setMessage("Your brief is ready. Choose Generate campaign or use the local planner."); }), []);
    const spec = campaign?.spec;
    const copyDirty = Boolean(spec && Object.entries(copy).some(([k, v]) => v !== (spec.campaign[k as keyof Copy] ?? "")));
    const draftChanged = Boolean(campaign && (draft.topic.trim() !== campaign.input.topic || draft.details.trim() !== campaign.input.details || draft.taste !== campaign.input.taste || draft.treatment !== campaign.input.treatment));
    const allReady = Boolean(campaign && rendered.revision === campaign.revision && FORMATS.every(f => rendered.formats[f.id]));
    function commit(s: DesignSpec, g: GenerationResult | null, input: Draft,newBase=false,resetSpec?:DesignSpec) {
        const previous=committed.current;
        if(newBase){history.current={past:[],future:[]};setActiveProject(null);}else if(previous){history.current.past=[...history.current.past,previous].slice(-30);history.current.future=[];}
        const next = { spec: s, generation: g, input,resetSpec:resetSpec??(newBase?s:previous?.resetSpec??s), revision: (previous?.revision ?? 0) + 1 };
        committed.current = next; setCampaign(next); setCopy(copyOf(s)); setRendered({ revision: next.revision, formats: {} });setHistoryState({undo:history.current.past.length,redo:history.current.future.length});
    }
    function travel(direction:"undo"|"redo"){
        if(!campaign||busy||pending.current||exportLock.current||copyDirty)return;const source=direction==="undo"?history.current.past:history.current.future,target=source.pop();if(!target)return;
        (direction==="undo"?history.current.future:history.current.past).push(campaign);const next={...target,revision:campaign.revision+1};committed.current=next;setCampaign(next);setCopy(copyOf(next.spec));setRendered({revision:next.revision,formats:{}});setHistoryState({undo:history.current.past.length,redo:history.current.future.length});setMessage(`${direction==='undo'?'Undid':'Redid'} local change. Checking the restored revision.`);
    }
    function adjustElement(change:ElementEdit|null,selection=editSelection){
        if(!campaign||campaign.spec.version!==3||busy||pending.current||exportLock.current||copyDirty)return;
        const spec=campaign.spec,editing=structuredClone(spec.editing??{version:1 as const,shared:{},formats:{}}),bucket=editScope==="campaign"?editing.shared:(editing.formats[selection.format]??={});
        if(change===null)delete bucket[selection.role];else bucket[selection.role]={...bucket[selection.role],...change};
        const parsed=designSchema.safeParse({...spec,provenance:"manual-input",editing});if(!parsed.success){setError({kind:"copy",text:"Element adjustment is outside the supported bounds. Your previous layout is preserved."});return;}
        commit(parsed.data,campaign.generation,campaign.input);setMessage(`${editScope==='campaign'?'Shared campaign':FORMATS.find(f=>f.id===selection.format)!.name} element adjusted locally. Format overrides take precedence; export still requires measured checks.`);setError(null);
    }
    function resetComposition(){
        if(!campaign||campaign.spec.version!==3||busy||pending.current||exportLock.current||copyDirty)return;const base=campaign.resetSpec;if(!base||base.version!==3)return;
        const next=designSchema.parse({...campaign.spec,provenance:"manual-input",capabilities:restoredImageCapabilities(campaign.spec.capabilities,base.capabilities,base.assetLayer),editing:undefined,artDirection:base.artDirection,typography:base.typography,composition:base.composition,decoration:base.decoration,palette:base.palette,assetLayer:base.assetLayer});commit(next,campaign.generation,campaign.input);setMessage("Generated composition restored. Applied campaign copy is retained. Undo is available.");setError(null);
    }
    async function saveCurrentProject(name:string){
        const snapshot=committed.current;if(!snapshot||copyDirty||busy||pending.current||exportLock.current)throw Error("Apply pending edits and wait for the current operation before saving.");
        exportLock.current=true;setProjectBusy(true);
        try{
            let thumbnail:string|null=null;const node=nodes()[0];
            if(node?.dataset.ready==='true'&&node.dataset.overflow!=='true')try{const bitmap=await createImageBitmap(await nativePngBlob(node,FORMATS[0])),canvas=document.createElement('canvas');canvas.width=216;canvas.height=270;const ctx=canvas.getContext('2d');if(ctx){ctx.drawImage(bitmap,0,0,216,270);const data=canvas.toDataURL('image/jpeg',.75);if(data.length<=100000)thumbnail=data;}bitmap.close();}catch{/* Save validated state even if only a summary preview is available. */}
            const record=activeProject?validateProject({...activeProject,name,spec:snapshot.spec,resetSpec:snapshot.resetSpec??snapshot.spec,input:snapshot.input,generation:snapshot.generation,thumbnail,revision:activeProject.revision+1,updatedAt:new Date().toISOString()}):newProject(snapshot.spec,snapshot.resetSpec??snapshot.spec,snapshot.input,snapshot.generation,name,thumbnail);
            await saveProject(record,activeProject?.revision);setActiveProject(record);setMessage(`Saved “${record.name}” in this browser only${thumbnail?'':'; artwork thumbnail unavailable, summary retained'}. Download JSON/HTML for backup.`);
        }finally{exportLock.current=false;setProjectBusy(false);}
    }
    function openProject(value:LocalProject){
        if(busy||pending.current||exportLock.current)return;try{const project=validateProject(value);if(campaign&&!window.confirm("Replace the current workspace with this local project? Unsaved changes will be lost."))return;requestId.current++;commit(project.spec,project.generation,project.input,true,project.resetSpec);setActiveProject(project);setDraft(project.input);setConcepts(null);setSelectedConcept(null);setInspection(null);setError(null);setIncomplete(null);setProjectsOpen(false);setMessage(`Opened “${project.name}” from this browser. Fonts, images and layouts are being verified again.`);}catch{setError({kind:"input",text:"Local project refused: invalid or unsupported record. Your current campaign is preserved."});}
    }
    function navigateRegion(region: "edit" | "preview") {
        setMobileRegion(region);
        document.getElementById(region === "edit" ? "creation-controls" : "campaign-gallery")?.scrollIntoView({ block: "start" });
    }
    async function replaceAsset(file: File) {
        if (!campaign || campaign.spec.version !== 3 || campaign.spec.artDirection.treatment !== "creative-led" || pending.current || exportLock.current) return;
        const snapshot = { ...campaign, spec: campaign.spec }, edits = copy;
        exportLock.current = true; setAssetEditing(true); setError(null);
        try {
            const layer = await importRaster(file, snapshot.spec.version === 3 ? snapshot.spec.assetLayer : undefined);
            if (committed.current?.revision !== snapshot.revision) return;
            const next = designSchema.parse({ ...snapshot.spec, provenance: "manual-input", ...(snapshot.spec.capabilities?{capabilities:{...snapshot.spec.capabilities,image:{source:'manual-import',model:null,accepted:false,fallbackReason:'owner-imported'},conceptualImage:false,publication:'private-review'}}:{}), assetLayer: layer, artDirection: { ...snapshot.spec.artDirection, recipe: "editorial", adaptation: "balanced",...(snapshot.spec.artDirection.design?{design:{...snapshot.spec.artDirection.design,imageRole:"immersive"}}:{}) } });
            commit(next, snapshot.generation, snapshot.input); setCopy(edits);
            setMessage("Private local image applied. Rights are unverified; publication requires clearance. No upload or provider call.");
        } catch { setError({ kind: "copy", text: "Image refused. Choose a static PNG up to 8 MB and 2048 × 2048 pixels that fits the offline image budget. Your previous campaign is preserved." }); }
        finally { exportLock.current = false; setAssetEditing(false); }
    }
    function editAsset(crop?: Partial<AssetLayer["crop"]>, remove = false, framing?: AssetLayer["framing"]) {
        if (!campaign || campaign.spec.version !== 3 || !campaign.spec.assetLayer || pending.current || exportLock.current) return;
        const base = campaign.spec, layer = base.assetLayer!, edits = copy;
        const currentCrop = assetFormat === "all" ? layer.crop : layer.placements?.[assetFormat] ?? layer.crop;
        const next = designSchema.parse({ ...base, provenance: "manual-input", ...(remove&&base.capabilities?{capabilities:{...base.capabilities,image:{source:'local',model:null,accepted:false,fallbackReason:'owner-removed'},conceptualImage:false}}:{}), assetLayer: remove ? undefined : { ...layer, ...(framing ? {framing} : {}), revision: layer.revision + 1, ...(assetFormat === "all" ? { crop: { ...layer.crop, ...crop } } : { placements: { ...layer.placements, [assetFormat]: { ...currentCrop, ...crop } } }) } });
        commit(next, campaign.generation, campaign.input); setCopy(edits);
        setMessage(remove ? "Image removed. Local artwork restored." : "Image placement applied locally. Checking the new revision…");
    }
    function changeDraft(change: Partial<Draft>) { if (exportLock.current)
        return; requestId.current++; pending.current?.abort(); pending.current = null; setGenerating(false); setDraft(p => ({ ...p, ...change })); setError(null); setIncomplete(null); setMessage(""); }
    async function exploreConcepts(){
        if(!campaign||campaign.spec.version!==3||campaign.spec.artDirection.treatment!=="creative-led"||pending.current||exportLock.current||copyDirty)return;
        const input=campaign.input,id=++requestId.current,controller=new AbortController(),start=performance.now();
        pending.current=controller;setGenerating(true);setError(null);
        const timer=setTimeout(()=>controller.abort(),15000);
        try{
            const response=await fetch("/api/concepts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...input,mode:"local"}),signal:controller.signal});
            if(!response.ok)throw Error();const data=conceptResponseSchema.parse(await response.json());
            if(id!==requestId.current)return;
            if(data.concepts.some(c=>c.spec.taste!==input.taste||c.spec.campaign.topic!==input.topic))throw Error();
            setConcepts({data,input,elapsedMs:performance.now()-start});setSelectedConcept(null);
            setMessage(`${data.concepts.length} validated local concepts available. Your current artwork is preserved until you select one. No AI request.`);
        }catch{if(id===requestId.current)setError({kind:"generation",text:"Concept exploration could not finish. Your previous campaign is preserved."});}
        finally{clearTimeout(timer);if(id===requestId.current){pending.current=null;setGenerating(false);}}
    }
    function selectConcept(id:string){
        if(!concepts||!campaign||pending.current||exportLock.current||copyDirty)return;
        const choice=concepts.data.concepts.find(c=>c.id===id);if(!choice)return;
        const previous=campaign.generation;
        const result:GenerationResult={spec:choice.spec,interpretation:{objective:previous?.interpretation.objective??"Communicate supplied facts.",audience:previous?.interpretation.audience??"Unspecified",concept:choice.angle,assumptions:["Deterministic local editorial concept selection, not fresh AI."],missingInformation:previous?.interpretation.missingInformation??[]},metadata:{source:"deterministic-fallback",model:null,fallbackReason:"requested-local",totalMs:concepts.elapsedMs,attempts:[],cached:false,warnings:concepts.data.warnings}};
        commit(choice.spec,result,concepts.input,true);setSelectedConcept(id);setMessage("Local creative concept selected. All four formats are being measured; no provider request.");setError(null);
    }
    async function generate(mode: "auto" | "local" = "auto") {
        if (!interactive || exportLock.current || pending.current)
            return;
        const parsed = generationRequestSchema.safeParse({ ...draft, mode,...(metaEnabled&&mode!=='local'?{treatment:'creative-led',ai:{text:aiText,image:aiImage,adult,country,consent:'meta-2026-11'}}:{}) });
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
            const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json",'X-Chowk-Request-Id':crypto.randomUUID() }, body: JSON.stringify(parsed.data), signal: controller.signal });
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
            commit(data.spec, data, { topic: parsed.data.topic, details: parsed.data.details, taste: parsed.data.taste, ...(parsed.data.treatment ? { treatment: parsed.data.treatment } : {}) },true);
            setConcepts(null);setSelectedConcept(null);
            if (window.matchMedia("(max-width:767px)").matches) { setMobileRegion("preview"); document.getElementById("campaign-gallery")?.scrollIntoView({block:"start"}); }
            setMessage(data.metadata.capabilities?`Text: ${data.metadata.capabilities.text.accepted?'Meta Ember':'independent local'}. Image: ${data.metadata.capabilities.image.accepted?'Meta Muse conceptual image':'local artwork'}. Review facts and image use before publishing.`:data.metadata.source === "gemini" ? "AI campaign ready. Review the copy and supplied facts before publishing." : data.metadata.fallbackReason === "requested-local" ? (inferenceEnabled ? "Local planner campaign ready. No AI request." : "Local planner campaign ready. Server-side AI is disabled; no provider request.") : data.metadata.fallbackReason === "disabled" ? "Local planner campaign ready. Server-side AI is disabled; no provider request." : "Local fallback campaign ready. No successful AI generation; supplied copy has been retained conservatively.");
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
        return; const input = { topic: SAMPLE_TOPIC, details: "", taste: draft.taste }; setDraft(input); commit(createDesign({ taste: input.taste, topic: SAMPLE_TOPIC }), null, input,true); setMessage("Sample campaign ready. No AI request."); setError(null); }
    function applyCopy(e: FormEvent) { e.preventDefault(); if (!campaign || exportLock.current || pending.current)
        return; const result = designSchema.safeParse({ ...campaign.spec, provenance: "manual-input", ...(campaign.spec.version===3&&campaign.spec.capabilities?{capabilities:{...campaign.spec.capabilities,text:{source:'manual-import',model:null,accepted:false,fallbackReason:'owner-edited',attemptedModel:campaign.spec.capabilities.text.model}}}:{}), campaign: { ...campaign.spec.campaign, ...copy, cta: copy.cta || undefined } }); if (!result.success) {
        setError({ kind: "copy", text: "Check copy lengths and required fields. Creative-led campaigns must retain all supplied public facts verbatim. No changes were applied." });
        return;
    } commit(result.data, campaign.generation, campaign.input); setMessage("Manual copy applied to all four formats. No AI used."); setError(null); }
    function refine(change: Partial<ArtDirection>, spacing?: number) { if (!campaign || campaign.spec.version !== 3 || exportLock.current || pending.current)
        return; const base = campaign.spec, direction = { ...base.artDirection, ...change }; const result = designSchema.safeParse({ ...base, provenance: "manual-input", artDirection: direction, composition: { ...base.composition, spacing: spacing ?? base.composition.spacing }, decoration: { ...base.decoration, illustration: direction.visual === "cup" ? "cup" : direction.visual === "none" ? "none" : "abstract" }, palette: PALETTES[direction.palette], rationale: `${PRESETS[base.taste].name}: ${(direction.recipe ?? direction.variant).replaceAll("-", " ")} with ${direction.palette.replaceAll("-", " ")} colours. Manual adjustments retain campaign copy; no new AI request.` }); if (!result.success) {
        setError({ kind: "copy", text: "Choose a supported option for the displayed campaign's taste." });
        return;
    } const edits = copy; commit(result.data, campaign.generation, campaign.input); setCopy(edits); setMessage("Design adjusted locally. No AI request."); setError(null); }
    const onReady = useCallback((format: string, revision: number, ready: boolean) => { if (committed.current?.revision !== revision)
        return; setRendered(p => p.revision === revision && p.formats[format] === ready ? p : { revision, formats: { ...(p.revision === revision ? p.formats : {}), [format]: ready } }); }, []);
    function nodes() { return Array.from(gallery.current?.querySelectorAll<HTMLElement>("[data-poster]") ?? []); }
    async function download(format?: Format) { if (exportLock.current || pending.current || !committed.current)
        return; exportLock.current = true; setExportFormat(format?.id ?? null); setExportLabel(format ? "Preparing your image…" : "Preparing your HTML file…"); setBusy(true); setError(null); setMessage(""); const snapshot = committed.current; try {
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
            setInspectionMessage("");
            setInspection({ kind, campaign });
            return;
        }
        const node = nodes().find(n => n.dataset.poster === format?.id);
        if (!node || node.dataset.ready !== "true")
            return;
        const measurements = { signals:layoutSignals(node), fits: node.dataset.overflow !== "true", issues: node.dataset.quality ? JSON.parse(node.dataset.quality) : node.dataset.overflow === "true" ? ["TEXT_OVERFLOW"] : [], corrections: JSON.parse(node.dataset.corrections ?? "[]"), fields: Array.from(node.querySelectorAll<HTMLElement>("[data-fit]")).map(f => ({ role: f.dataset.role ?? (f.tagName === "H2" ? "headline" : "text"), nativePixels: parseFloat(getComputedStyle(f).fontSize), minimum: Number(f.dataset.min), horizontalFit: f.scrollWidth <= f.clientWidth + 1, verticalFit: f.scrollHeight <= f.clientHeight + 1 })) };
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
    const activeCrop = spec?.version === 3 && spec.assetLayer ? (assetFormat === "all" ? spec.assetLayer.crop : spec.assetLayer.placements?.[assetFormat] ?? spec.assetLayer.crop) : undefined;
    const generation = campaign?.generation;
    const origin = !campaign ? "" : !generation ? "Example campaign · no AI" : generation.metadata.source === "gemini" ? `AI · ${generation.metadata.model}${generation.metadata.cached ? " · reused result" : ""}` : generation.metadata.fallbackReason === "requested-local" ? "Local planner · no AI request" : generation.metadata.fallbackReason === "disabled" ? "Local planner · AI disabled" : "Fallback · independent local planner";
    const capability=spec?.version===3?spec.capabilities:undefined;
    const provenance = `${spec?.provenance === "manual-input"?'Manual edits · ':''}${capability?`${capability.text.source==='manual-import'?'Owner-edited text':capability.text.accepted?`AI text · ${capability.text.model}`:'Independent local text'} · ${capability.image.source==='manual-import'?'Owner-imported image':capability.image.accepted?`AI image · ${capability.image.model}`:'Local artwork'}`:spec?.provenance === "manual-input"?'no new AI request':origin}`;
    const status = generating ? `Generating a campaign from your brief…${campaign ? " Previous campaign remains visible." : ""}` : busy ? exportLabel : assetEditing ? "Reading and checking your local PNG…" : error?.text || (campaign && !allReady ? "Measuring layouts and preparing fonts…" : message || (copyDirty ? "Unapplied copy edits. Apply them before exporting." : ""));
    const pendingOperation = generating || busy || assetEditing || Boolean(campaign && !allReady);
    const visuals = spec?.version === 3 ? VISUALS.filter(visual => (visual === spec.artDirection.visual || relevantVisual(visual, spec.creativeContent?.subject ?? spec.campaign.topic)) && designSchema.safeParse({ ...spec, artDirection: { ...spec.artDirection, visual }, decoration: { ...spec.decoration, illustration: visual === "cup" ? "cup" : visual === "none" ? "none" : "abstract" } }).success) : [];
    return <div className="studio-shell" data-control-section={controlSection} onKeyDown={e=>{if(!(e.ctrlKey||e.metaKey)||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||(e.target instanceof HTMLElement&&e.target.isContentEditable))return;if(e.key.toLowerCase()==="z"){e.preventDefault();travel(e.shiftKey?"redo":"undo");}else if(e.key.toLowerCase()==="y"){e.preventDefault();travel("redo");}}}><nav className="mobile-workspace-nav" aria-label="Workspace region"><button aria-pressed={mobileRegion === "edit"} onClick={() => navigateRegion("edit")}>Edit brief &amp; design</button><button aria-pressed={mobileRegion === "preview"} onClick={() => navigateRegion("preview")}>Preview{campaign ? " · 4 formats" : ""}</button></nav>
  {campaign&&mobileRegion==="edit"&&["copy","look","layout"].includes(controlSection)&&<div className={`mobile-refinement-proof ${previewPinned?"is-pinned":""}`}><div><strong>Applied artwork · {view==="all"?"portrait":FORMATS.find(f=>f.id===view)?.name}</strong><button onClick={()=>setPreviewPinned(!previewPinned)} aria-expanded={previewPinned}>{previewPinned?"Hide preview":"Show preview"}</button></div>{previewPinned&&<RefinementProof gallery={gallery} revision={campaign.revision} ready={allReady} format={FORMATS.find(f=>f.id===view)??FORMATS[0]}/>}</div>}
  <main id="main" className="studio-workspace"><aside className="creation-panel" aria-label="Campaign controls">
   <button className="creation-toggle" aria-expanded={creationOpen} aria-controls="creation-controls" onClick={() => setCreationOpen(!creationOpen)}>Brief &amp; taste · {PRESETS[draft.taste].name}<span aria-hidden="true">{creationOpen ? "−" : "+"}</span></button>
   <nav className="control-sections" aria-label="Creation sections">{["all","brief","look","copy","layout"].map(section => <button key={section} aria-pressed={controlSection === section} disabled={!campaign && (section === "copy" || section === "layout")} onClick={() => {setControlSection(section);setCreationOpen(true);}}>{readable(section)}</button>)}</nav>
   <div id="creation-controls" className={`creation-body ${creationOpen ? "" : "is-collapsed"}`}><div className="creation-heading"><h1>Create a campaign</h1><p>Start with an idea and choose its visual voice.</p></div>
    <div id="control-brief" className="control-group"><h2 className="control-group-title">Brief</h2><label htmlFor="topic">What are we creating for?</label><textarea id="topic" maxLength={1200} rows={3} value={draft.topic} disabled={busy || !interactive} onChange={e => changeDraft({ topic: e.target.value })} placeholder="A campus poetry evening, a new café…" aria-describedby="brief-privacy"/>
    <label htmlFor="brief-details">Optional details</label><textarea id="brief-details" maxLength={1200} rows={4} value={draft.details} disabled={busy || !interactive} onChange={e => changeDraft({ details: e.target.value })} placeholder="Audience, exact facts, dates, prices or preferences"/>
    <p id="brief-privacy" className="field-note">AI briefs are sent to the configured provider (Meta or Gemini) only when enabled and permitted. Avoid private information. Local planning makes no AI request. <a href="/api/notices" target="_blank" rel="noopener noreferrer">Licenses and notices</a></p>
    {metaEnabled&&<fieldset className="ai-controls" disabled={busy||generating}><legend>AI capabilities</legend><label><input type="checkbox" checked={aiText} onChange={e=>setAiText(e.target.checked)}/>Meta Ember text planning</label><label><input type="checkbox" checked={aiImage} onChange={e=>setAiImage(e.target.checked)}/>Muse conceptual image</label><label><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/>I am 18 or older, have rights to my input and accept Meta processing for this request.</label><label>My country<select aria-label="AI country" value={country} onChange={e=>setCountry(e.target.value)}><option value="IN">India (initial pilot)</option></select></label><p className="field-note">Eligibility is also checked against platform location. Images are conceptual, not verified product photographs. Never submit confidential information. <a href="/docs#ai">AI and privacy disclosure</a>. Local generation needs no AI eligibility.</p></fieldset>}</div><div id="control-look" className="control-group"><h2 className="control-group-title">Look</h2><TastePicker value={draft.taste} disabled={busy || !interactive} onChange={taste => changeDraft({ taste })}/>
    <label htmlFor="planning-approach">Planning approach</label><select id="planning-approach" value={draft.treatment ?? "standard"} disabled={busy || !interactive} onChange={e => changeDraft({ treatment: e.target.value === "creative-led" ? "creative-led" : undefined })}><option value="standard">Standard</option><option value="creative-led">Creative-led · fact-led recipes</option></select>
    {draft.treatment && <p className="field-note">Separates public facts from creative instructions. Explore local editorial concepts, then refine their compositions.</p>}
    {spec?.version === 3 && <><p className="field-note">Applied result: {PRESETS[spec.taste].name}. These controls refine the current campaign.</p><label htmlFor="palette-choice">Artwork palette</label><select id="palette-choice" value={spec.artDirection.palette} disabled={busy || generating} onChange={e => refine({ palette: e.target.value as ArtDirection["palette"] })}>{ENGINE_TASTES[spec.taste].palettes.map(id => <option key={id} value={id}>{readable(id)}</option>)}</select><div className="palette-tokens" role="group" aria-label="Campaign colour palette">{Object.entries(spec.palette).map(([key, colour]) => <span key={key} title={`${key}: ${colour}`} style={{ background: colour }}/>)}</div><label htmlFor="visual-choice">Visual treatment</label><select id="visual-choice" value={spec.artDirection.visual} disabled={busy || generating} onChange={e => refine({ visual: e.target.value as ArtDirection["visual"] })}>{visuals.map(v => <option key={v} value={v}>{readable(v)}</option>)}</select><p className="field-note">Authored conceptual graphics, not verified product images.</p></>}
    </div>
    {campaign && <><section id="control-copy" className="refinement-panel control-group" aria-label="Refine current result"><h2>Refine current result</h2><p className="field-note">Editing {PRESETS[campaign.spec.taste].name}. Local changes make no new AI request.</p><form onSubmit={applyCopy}><details className="copy-details"><summary>Edit campaign copy</summary>
     <label htmlFor="campaign-topic">Campaign topic</label><textarea id="campaign-topic" maxLength={spec!.version === 1 ? 240 : 1200} rows={2} value={copy.topic} required disabled={busy || generating} onChange={e => setCopy({ ...copy, topic: e.target.value })}/>
     <label htmlFor="headline">Headline <span>up to 240 characters</span></label><textarea id="headline" maxLength={240} rows={3} value={copy.headline} required disabled={busy || generating} onChange={e => setCopy({ ...copy, headline: e.target.value })}/>
     <label htmlFor="supporting">Supporting text</label><textarea id="supporting" maxLength={spec!.version === 1 ? 180 : 2400} rows={4} value={copy.supportingText} disabled={busy || generating} onChange={e => setCopy({ ...copy, supportingText: e.target.value })}/>
     <label htmlFor="cta">Call to action <span>optional</span></label><input id="cta" maxLength={60} value={copy.cta} disabled={busy || generating} onChange={e => setCopy({ ...copy, cta: e.target.value })}/>
     <button className="secondary-action" type="button" disabled={busy || generating || !copyDirty} onClick={() => {setCopy(copyOf(campaign.spec));setMessage("Unapplied copy edits discarded.");}}>Discard copy edits</button><button className="secondary-action apply-button" type="submit" disabled={busy || generating || !copyDirty}>{copyDirty ? "Apply copy to campaign" : "Copy is up to date ✓"}</button></details></form></section>
     {spec?.version === 3 && <div id="control-layout" className="control-group"><h2 className="control-group-title">Layout</h2><label htmlFor="composition-choice">Composition</label><select id="composition-choice" value={spec.artDirection.recipe ?? spec.artDirection.variant} disabled={busy || generating} onChange={e => refine(spec.artDirection.treatment === "creative-led" ? { recipe: e.target.value as ArtDirection["recipe"] } : { variant: e.target.value as ArtDirection["variant"] })}>{spec.artDirection.treatment === "creative-led" ? compositionCandidates(spec).map(c => <option key={c.id} value={c.recipe}>{readable(c.recipe)} · local composition</option>) : ENGINE_TASTES[spec.taste].variants.map(id => <option key={id} value={id}>{readable(id)}</option>)}</select></div>}
    </>}
     {spec?.version === 3 && <details className="direction-details layout-extra"><summary>More art direction</summary><label htmlFor="information-choice">Content arrangement</label><select id="information-choice" value={spec.artDirection.information} disabled={busy || generating} onChange={e => refine({ information: e.target.value as ArtDirection["information"] })}><option value="auto">Automatic grouping</option><option value="grid">Information grid</option><option value="stack">Single column</option></select><label htmlFor="balance-choice">Artwork balance</label><select id="balance-choice" value={spec.artDirection.adaptation} disabled={busy || generating} onChange={e => refine({ adaptation: e.target.value as ArtDirection["adaptation"] })}><option value="balanced">Balanced with artwork</option><option value="type-led">Typography led</option></select><label htmlFor="emphasis-choice">Type hierarchy</label><select id="emphasis-choice" value={spec.artDirection.emphasis} disabled={busy || generating} onChange={e => refine({ emphasis: e.target.value as ArtDirection["emphasis"] })}><option value="display">Display emphasis</option><option value="editorial">Editorial emphasis</option></select><label htmlFor="spacing-choice">Spacing · {spec.composition.spacing}</label><input id="spacing-choice" type="range" min="40" max="90" step="1" value={spec.composition.spacing} disabled={busy || generating} onChange={e => refine({}, Number(e.target.value))} /><p className="field-note">Local changes; dense copy can take priority over artwork.</p></details>}
    {spec?.version === 3 && spec.artDirection.treatment === "creative-led" && <details className="direction-details asset-controls"><summary>Private local image layer</summary><p className="field-note">Static PNG input up to 8 MB. Images over 60 KB are optimized locally into opaque JPEG; originals stay unchanged. Rights unverified; private experiments only. Replaces the illustration, never the HTML text.</p><label htmlFor="asset-file">Add or replace image</label><input id="asset-file" type="file" accept="image/png" disabled={busy || generating || assetEditing} onChange={e => {const file=e.target.files?.[0];e.target.value="";if(file)void replaceAsset(file);}}/>{spec.assetLayer && <fieldset disabled={busy || generating || assetEditing}><legend>Image placement</legend><label htmlFor="asset-framing">Image framing</label><select id="asset-framing" value={spec.assetLayer.framing ?? "panel"} onChange={e=>editAsset(undefined,false,e.target.value as AssetLayer["framing"])}><option value="panel">Framed image</option><option value="edge-to-edge">Bleed to edge; separate text zone</option></select><label htmlFor="asset-format">Image placement format</label><select id="asset-format" value={assetFormat} onChange={e=>setAssetFormat(e.target.value as typeof assetFormat)}><option value="all">Shared default</option>{FORMATS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select><label htmlFor="asset-x">Image horizontal position</label><input id="asset-x" type="range" min="0" max="100" value={activeCrop!.x} onChange={e => editAsset({x:Number(e.target.value)})}/><label htmlFor="asset-y">Image vertical position</label><input id="asset-y" type="range" min="0" max="100" value={activeCrop!.y} onChange={e => editAsset({y:Number(e.target.value)})}/><label htmlFor="asset-zoom">Image zoom</label><input id="asset-zoom" type="range" min="1" max="2" step="0.1" value={activeCrop!.zoom} onChange={e => editAsset({zoom:Number(e.target.value)})}/><label htmlFor="asset-fit">Image crop mode</label><select id="asset-fit" value={activeCrop!.fit} onChange={e=>editAsset({fit:e.target.value as "contain"|"cover"})}><option value="contain">Contain · protect whole object</option><option value="cover">Cover · may crop edges</option></select><button className="secondary-action" onClick={()=>editAsset({x:50,y:50,zoom:1,fit:"contain"})}>Reset image placement</button><button className="secondary-action" onClick={()=>editAsset(undefined,true)}>Remove image</button></fieldset>}</details>}
   {editingEnabled&&spec?.version===3&&<ElementEditor spec={spec} selection={editSelection} scope={editScope} disabled={busy||generating||copyDirty||!allReady} onSelect={selectElement} onScope={setEditScope} onChange={adjustElement} onReset={resetComposition}/>}
   </div><div className="generation-actions"><button className="primary-action" aria-label={inferenceEnabled ? "Generate campaign" : "Generate campaign locally; Use local planner"} disabled={busy || generating || !interactive} onClick={() => generate(inferenceEnabled ? "auto" : "local")}>{generating ? "Building your campaign…" : inferenceEnabled ? "Generate campaign" : "Generate locally"}</button>{inferenceEnabled && <button className="secondary-action local-planner-button" disabled={busy || generating || !interactive} onClick={() => generate("local")}>Use local planner · no AI request</button>}<span className="action-feedback" aria-hidden="true">{generating ? "Building your campaign…" : busy ? exportLabel : campaign && !allReady ? "Checking your artwork…" : inferenceEnabled ? "AI when available; honest local fallback." : "Inference is disabled. No provider request."}</span>{campaign&&<><button className="secondary-action mobile-footer-action" onClick={()=>navigateRegion("preview")} disabled={busy||generating}>Preview</button><button className="secondary-action mobile-footer-action" onClick={()=>{setControlSection("layout");setCreationOpen(true);navigateRegion("edit");}}>Adjust</button><button className="secondary-action mobile-footer-action" aria-label="Export campaign HTML from toolbar" onClick={()=>download()} disabled={busy||generating||copyDirty||!allReady}>Export HTML</button></>}</div></aside>
   <section id="campaign-gallery" className={`campaign-stage ${fitViewport&&view!=="all"?"is-fitted-focus":""}`} aria-label="Campaign outputs" tabIndex={-1}><div className="workspace-tools">{campaign&&<><button className="stage-button" aria-pressed={view!=="all"} disabled={busy||generating} onClick={()=>setView(view==="all"?"instagram-portrait":"all")}>Focus artwork</button><label><input type="checkbox" checked={fitViewport} onChange={e=>setFitViewport(e.target.checked)}/> Fit focused artwork</label>{editingEnabled&&<span className="editing-selection">Editing {editSelection.role} in {FORMATS.find(f=>f.id===editSelection.format)?.name}</span>}</>}<button className="stage-button" disabled={busy||generating} onClick={()=>setProjectsOpen(true)}>Local projects</button>{campaign&&<><button className="stage-button" disabled={busy||generating||copyDirty||!historyState.undo} onClick={()=>travel("undo")}>Undo</button><button className="stage-button" disabled={busy||generating||copyDirty||!historyState.redo} onClick={()=>travel("redo")}>Redo</button>{spec?.version===3&&<button className="stage-button" aria-pressed={editingEnabled} disabled={busy||generating||copyDirty} onClick={()=>{setEditingEnabled(!editingEnabled);setCreationOpen(true);setControlSection("layout");setView(editSelection.format);}}>Edit elements</button>}</>}</div>
    <div className="stage-context" role="region" tabIndex={0} aria-label="Campaign details and controls"><div className={`export-status ${error ? "has-error" : ""}`} role="status" aria-live="polite">{error ? <span role="alert">{status}{error.kind === "generation" && <button className="stage-link" onClick={() => generate(lastMode.current)} disabled={busy || generating}>Retry generation</button>}</span> : pendingOperation ? <ChowkLoading label={status} size="studio" /> : status}</div>
    {campaign ? <><div className="gallery-heading"><div className="campaign-identity"><p>Campaign{!generation&&!capability ? " · imported/example" : ""}</p><h2>{spec!.campaign.headline.replaceAll("\n", " ")}</h2><p data-applied-taste>{PRESETS[spec!.taste].name} · 4 adaptive formats</p></div></div><div className="gallery-actions export-dock"><button className="stage-button" aria-label="Inspect spec" onClick={() => inspect("spec")} disabled={busy}>Design &amp; spec</button><button className="stage-button stage-primary" aria-label="Export HTML" onClick={() => download()} disabled={busy || generating || copyDirty || !allReady}>{exporting && exportFormat === null ? "Preparing HTML…" : "Export HTML ↓"}</button></div>
     {draftChanged && <p className="draft-note" role="note">Draft changed · Showing the previous {PRESETS[spec!.taste].name} campaign. Generate or use the local planner to apply your new brief and taste.</p>}
     <div className="generation-provenance"><div className="provenance-line"><strong><i aria-hidden="true"/>{provenance}</strong><span>{generating ? "Previous result · new brief pending. " : ""}{spec!.provenance === "manual-input" ? `Original capability provenance retained. ` : ""}Review copy and facts before publishing.</span></div>{capability&&<p className="capability-note">{capability.text.fallbackReason?`Text: ${capability.text.fallbackReason.replaceAll("-"," ")}. `:""}{capability.image.fallbackReason&&capability.image.fallbackReason!=="not-requested"?`Image: ${capability.image.fallbackReason.replaceAll("-"," ")}. `:""}{capability.conceptualImage?"AI imagery is conceptual; review use and disclosure before publishing.":""}</p>}{generation && <details><summary>Creative plan and generation details</summary><p>{generation.metadata.fallbackReason ? `Reason: ${generation.metadata.fallbackReason.replaceAll("-", " ")}. ` : ""}{generation.metadata.warnings.join(" ")}</p><pre tabIndex={0}>{JSON.stringify({ interpretation: generation.interpretation, metadata: generation.metadata }, null, 2)}</pre></details>}</div>
    </> : <div className="empty-state"><div className="empty-example-wall">{GALLERY.slice(0, 3).map(e => <Image key={e.id} src={e.formats[0].src} width={e.formats[0].width} height={e.formats[0].height} alt={`Curated local-planner example: ${e.title}`} unoptimized />)}</div><p className="empty-caption">Curated examples · your campaign will appear here</p><h2>One idea. A complete campaign.</h2><p>Describe what you want to share, choose a taste and create four coordinated formats.</p><p>Start with AI when enabled, or use the independent local planner.</p><button className="stage-button" onClick={showExample} disabled={busy || generating || !interactive}>View sample campaign · no AI</button></div>}

    {incomplete && <div className="incomplete-note" role="note" aria-label="Incomplete brief"><strong>Brief needs a subject · no new campaign generated</strong><p>{incomplete.interpretation.missingInformation.join(" ")}</p><details><summary>Brief interpretation</summary><pre tabIndex={0}>{JSON.stringify(incomplete.interpretation, null, 2)}</pre></details></div>}
    {copyDirty && <p className="draft-note" role="note">Unapplied copy edits · exports use applied copy only. Apply your edits before exporting.</p>}
    {campaign&&spec?.version===3&&spec.artDirection.treatment==="creative-led"&&<details className="studio-secondary"><summary>Creative concepts and local variations</summary><section className="concept-explorer" aria-label="Creative concepts"><div><h3>Creative concepts</h3><button className="stage-button" disabled={busy||generating||copyDirty} onClick={exploreConcepts}>Explore concepts locally</button></div><p>Different editorial angles and copy, generated deterministically. Composition refines one angle; the four formats adapt it.</p>{concepts&&<><p>{concepts.data.warnings[0]}</p><div className="concept-options">{concepts.data.concepts.map(c=><button key={c.id} className="stage-button" aria-pressed={selectedConcept===c.id} disabled={busy||generating||copyDirty} onClick={()=>selectConcept(c.id)}><strong>{c.label}</strong><span>{c.spec.campaign.headline}</span><small>{c.angle}</small></button>)}</div></>}</section></details>}
    {campaign && <div className="studio-view-switch" role="group" aria-label="Artwork view"><button aria-pressed={view === "all"} onClick={() => setView("all")} disabled={busy}><span className="desktop-view-label">Side by side</span><span className="mobile-view-label">All formats</span></button>{FORMATS.map(f => <button key={f.id} aria-pressed={view === f.id} onClick={() => setView(f.id)} disabled={busy}>{f.name}</button>)}</div>}
    {campaign && spec?.version === 3 && spec.artDirection.treatment === "creative-led" && <details className="reject-options"><summary>None of these compositions?</summary><p>These are local arrangements of one plan, not separate AI concepts. Identical local inputs are deterministic. Change your brief, taste or layout to explore a different direction. Your current campaign stays until a replacement succeeds.</p><button className="stage-button" onClick={() => {setCreationOpen(true);setControlSection("brief");navigateRegion("edit");requestAnimationFrame(()=>document.getElementById("topic")?.focus());}}>Revise the brief</button></details>}
    </div><div className={`poster-grid ${view !== "all" ? "focused-grid" : ""}`} aria-busy={generating || busy || Boolean(campaign && !allReady)} ref={gallery} data-campaign-revision={campaign?.revision}>{campaign && FORMATS.map(format => <StudioArtboard key={`${campaign.revision}-${format.id}`} campaign={campaign} format={format} focused={view === "all" || view === format.id} fitViewport={fitViewport&&view!=="all"} disabled={busy || generating || copyDirty} exporting={exporting && exportFormat === format.id} onReady={onReady} onExport={() => download(format)} onInspect={kind => inspect(kind, format)} editor={editingEnabled&&spec?.version===3?{selection:editSelection,onSelect:selectElement,onChange:(role,change)=>adjustElement(change,{format:format.id,role})}:undefined}/>)}</div>
   </section>
  </main>
  {projectsOpen&&<StudioDialog title="Local projects" onClose={()=>{if(!projectBusy)setProjectsOpen(false);}}><LocalProjectLibrary canSave={Boolean(campaign)&&!copyDirty&&!busy&&!generating} defaultName={activeProject?.name??campaign?.spec.campaign.headline.replaceAll("\n"," ").slice(0,80)??"Untitled campaign"} onSave={saveCurrentProject} onOpen={openProject} onChanged={(project,id)=>{if(activeProject?.id===id)setActiveProject(project);}}/></StudioDialog>}
  {inspection && <StudioDialog title={inspection.kind === "spec" ? "Design & spec" : `${inspection.format!.name} ${inspection.kind === "checks" ? "layout checks" : "artwork"}`} onClose={() => setInspection(null)}><p className="inspection-note">Snapshot of the displayed campaign when opened.</p>
   {inspection.kind === "artwork" && <ArtworkSnapshot node={inspection.node!} format={inspection.format!}/>}
   {inspection.kind === "checks" && <><p>Measured geometry and font sizes help detect layout problems. They do not certify artistic quality, factual accuracy or social-size legibility.</p><pre tabIndex={0}>{JSON.stringify(inspection.measurements, null, 2)}</pre></>}
   {inspection.kind === "spec" && <section className="spec-panel" aria-label="Intermediate design specification"><h3>Creative rationale</h3><p>{inspection.campaign.spec.rationale}</p><div className="spec-heading"><h3>Design specification · v{inspection.campaign.spec.version}</h3><button className="stage-button" onClick={async () => {try {await navigator.clipboard.writeText(JSON.stringify(inspection.campaign.spec,null,2));setInspectionMessage("Design specification copied.");} catch {setInspectionMessage("Clipboard unavailable. Use Download JSON instead.");}}}>Copy JSON</button><button className="stage-button stage-primary" onClick={() => saveFile(new Blob([JSON.stringify(inspection.campaign.spec, null, 2)], { type: "application/json" }), `${inspection.campaign.spec.taste}-design-spec.json`)}>Download JSON ↓</button></div><p aria-live="polite">{inspectionMessage}</p><pre tabIndex={0}>{JSON.stringify(inspection.campaign.spec, null, 2)}</pre></section>}
  </StudioDialog>}
 </div>;
}
