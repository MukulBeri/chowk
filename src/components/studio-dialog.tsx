"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Format } from "@/lib/design";
export function StudioDialog({ title, onClose, children }: {
    title: string;
    onClose: () => void;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null), close = useRef<HTMLButtonElement>(null), titleId = useId();
    useEffect(() => { const dialog = ref.current; if (!dialog)
        return; const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null; const previous = document.body.style.overflow; dialog.showModal(); document.body.style.overflow = "hidden"; close.current?.focus(); return () => { dialog.close(); document.body.style.overflow = previous; if (trigger?.isConnected)
        trigger.focus(); }; }, []);
    return <dialog ref={ref} className="inspection-dialog" aria-labelledby={titleId} onKeyDown={e => { if (e.key !== "Tab")
        return; const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')).filter(el => el.getClientRects().length > 0); const first = controls[0], last = controls.at(-1); if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
    } }} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget)
        onClose(); }}><div className="dialog-surface"><div className="dialog-heading"><h2 id={titleId}>{title}</h2><button ref={close} className="stage-button" onClick={onClose} aria-label="Close inspection">Close ✕</button></div>{children}</div></dialog>;
}
// Inert DOM snapshot: no Poster instance, canonical attributes, IDs, refs or
// measurement callbacks. Never queried by export functions.
export function ArtworkSnapshot({ node, format }: {
    node: HTMLElement;
    format: Format;
}) {
    const area = useRef<HTMLDivElement>(null), slot = useRef<HTMLDivElement>(null), [scale, setScale] = useState(.25);
    useEffect(() => { const container = area.current, target = slot.current; if (!container || !target)
        return; target.replaceChildren(node); const update = () => setScale(Math.min(1, container.clientWidth / format.width, window.innerHeight * .73 / format.height)); const observer = new ResizeObserver(update); observer.observe(container); window.addEventListener("resize", update); update(); return () => { observer.disconnect(); window.removeEventListener("resize", update); target.replaceChildren(); }; }, [node, format]);
    return <div ref={area} className="inspection-art"><div className="inspection-art-frame" style={{ width: format.width * scale, height: format.height * scale }}><div ref={slot} data-enlarged-artwork style={{ width: format.width, height: format.height, transform: `scale(${scale})`, transformOrigin: "top left" }}/></div><p>{format.width} × {format.height} native pixels · fitted to this window</p></div>;
}
