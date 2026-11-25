"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { Format } from "@/lib/design";
import type { Campaign } from "./studio";
import { PosterPreview } from "./poster";
export function StudioArtboard({ campaign, format, disabled, onReady, onExport, onInspect, focused = true }: {
    campaign: Campaign;
    format: Format;
    disabled: boolean;
    onReady: (id: string, revision: number, ready: boolean) => void;
    onExport: () => void;
    onInspect: (kind: "artwork" | "checks") => void;
    focused?: boolean;
}) {
    const root = useRef<HTMLElement>(null), [ready, setReady] = useState(false), description = useId();
    useEffect(() => { const element = root.current; if (!element)
        return; const update = () => { const node = element.querySelector<HTMLElement>("[data-poster]"); const value = node?.dataset.ready === "true"; setReady(value); onReady(format.id, campaign.revision, value); }; const observer = new MutationObserver(update); observer.observe(element, { subtree: true, attributes: true, attributeFilter: ["data-ready"] }); update(); return () => observer.disconnect(); }, [campaign.revision, format.id, onReady]);
    return <article ref={root} className={`format-card format-${format.id} ${focused ? "" : "is-unfocused"}`} aria-hidden={!focused || undefined} inert={!focused} aria-label={format.name} aria-describedby={description}><p id={description} className="sr-only">{[campaign.spec.campaign.eyebrow, campaign.spec.campaign.headline, campaign.spec.campaign.supportingText, campaign.spec.campaign.cta].filter(Boolean).join(" ")}</p><div className="format-card-heading"><h3>{format.name}</h3><span>{format.ratio}</span></div><PosterPreview spec={campaign.spec} format={format}/><div className="format-card-footer"><span>{format.width} × {format.height} px</span><div><button className="stage-link" disabled={disabled || !ready} onClick={() => onInspect("artwork")} aria-label={`View ${format.name} artwork`}>View ↗</button><button className="stage-link" disabled={disabled || !ready} onClick={() => onInspect("checks")} aria-label={`Inspect ${format.name} checks`}>Checks</button><button className="stage-button png-button" disabled={disabled || !ready} onClick={onExport} aria-label={`Export ${format.name} PNG`}>PNG ↓</button></div></div></article>;
}
