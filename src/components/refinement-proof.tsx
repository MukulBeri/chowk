"use client";
import { useEffect,useRef,type RefObject } from "react";
import type { Format } from "@/lib/design";

// Measured, inert visual proof only. It neither mounts a Poster nor registers an
// artboard/fit callback; all IDs/canonical attributes are stripped before insert.
export function RefinementProof({gallery,revision,ready,format}:{gallery:RefObject<HTMLDivElement|null>;revision:number;ready:boolean;format:Format}){
  const target=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const host=target.current;if(!host)return;host.replaceChildren();
    if(!ready){host.textContent="Measuring the applied revision…";return;}
    const source=gallery.current?.querySelector<HTMLElement>(`[data-poster="${format.id}"]`);
    if(!source||source.dataset.ready!=="true")return;
    const clone=source.cloneNode(true) as HTMLElement;
    for(const element of [clone,...Array.from(clone.querySelectorAll("*"))])for(const attr of [...element.attributes])if(attr.name==="id"||attr.name==="role"||attr.name.startsWith("data-")||attr.name.startsWith("aria-"))element.removeAttribute(attr.name);
    clone.inert=true;clone.style.pointerEvents="none";host.append(clone);
    const update=()=>{const scale=Math.min(host.clientWidth/format.width,128/format.height);Object.assign(clone.style,{position:"absolute",left:`${(host.clientWidth-format.width*scale)/2}px`,top:"0",transform:`scale(${scale})`,transformOrigin:"top left"});host.style.height=`${format.height*scale}px`;};
    const observer=new ResizeObserver(update);observer.observe(host);update();
    return()=>{observer.disconnect();host.replaceChildren();};
  },[gallery,revision,ready,format]);
  return <div ref={target} className="refinement-proof-target" aria-hidden="true"/>;
}
