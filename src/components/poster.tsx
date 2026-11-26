"use client";
import { useEffect, useRef, useState,type ReactNode } from "react";
import { type DesignSpec, type Format } from "@/lib/design";
import { AdvancedPoster, type LayoutReport } from "./advanced-poster";
import { LegacyPosterMarkup } from "./legacy-poster-markup";
import { fitLegacyText } from "@/lib/design-engine/legacy-quality";

function LegacyPoster({ spec, format, onFit }: { spec: Exclude<DesignSpec, { version: 3 }>; format: Format; onFit?: (overflow: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState({ ready: false, overflow: false });
  useEffect(() => {
    let cancelled = false;
    const root = ref.current;
    if (root) root.dataset.ready = "false";
    document.fonts.ready.then(() => {
      if (cancelled || !root) return;
      const overflow = fitLegacyText(root);
      setStatus({ overflow, ready: true });
      onFit?.(overflow);
      root.dataset.ready = "true";
    });
    return () => { cancelled = true; };
  }, [spec, format, onFit]);
  return <LegacyPosterMarkup spec={spec} format={format} status={status} rootRef={ref} />;
}

export function Poster(props: { spec: DesignSpec; format: Format; onFit?: (overflow: boolean) => void; onReport?: (report: LayoutReport) => void }) {
  return props.spec.version === 3 ? <AdvancedPoster key={JSON.stringify(props.spec)} {...props} spec={props.spec} /> : <LegacyPoster {...props} spec={props.spec} />;
}
export function PosterPreview({ spec, format,overlay,fitViewport=false }: { spec: DesignSpec; format: Format;overlay?:ReactNode;fitViewport?:boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  const [overflow, setOverflow] = useState(false);
  const [report, setReport] = useState<LayoutReport | null>(null);
  const [fittedWidth,setFittedWidth]=useState<number|null>(null);
  useEffect(()=>{
    const node=container.current,card=node?.closest('article'),stage=card?.parentElement;
    if(!node||!card||!stage||!fitViewport)return;
    const update=()=>{
      if(!matchMedia('(min-width:1100px)').matches){setFittedWidth(null);return;}
      const used=Array.from(card.children).filter(n=>n!==node&&getComputedStyle(n).position!=='absolute').reduce((sum,n)=>{const css=getComputedStyle(n);return sum+n.getBoundingClientRect().height+parseFloat(css.marginTop||'0')+parseFloat(css.marginBottom||'0');},0);
      const css=getComputedStyle(card),height=stage.clientHeight-used-parseFloat(css.paddingTop||'0')-parseFloat(css.paddingBottom||'0')-parseFloat(css.borderTopWidth||'0')-parseFloat(css.borderBottomWidth||'0')-12;
      setFittedWidth(Math.max(1,height)*format.width/format.height);
    };
    const observer=new ResizeObserver(update);observer.observe(stage);observer.observe(card);for(const child of card.children)if(child!==node)observer.observe(child);
    update();window.addEventListener('resize',update);return()=>{observer.disconnect();window.removeEventListener('resize',update);};
  },[fitViewport,format.width,format.height,report]);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / format.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, [format.width]);
  return <><div ref={container} className="poster-preview" style={{ aspectRatio: `${format.width} / ${format.height}`,...(fitViewport?{maxWidth:fittedWidth??`max(180px,calc((100svh - 330px) * ${format.width/format.height}))`,marginInline:'auto'}:{}) }}>
    <div style={{ width: format.width, height: format.height, transform: `scale(${scale})`, transformOrigin: "top left" }}><Poster spec={spec} format={format} onFit={setOverflow} onReport={setReport} /></div>
    {overflow && <p className="poster-fit-warning" role="alert">{spec.version === 3 ? "This format still cannot fit all copy at readable sizes. Shorten or reorganize it before exporting." : "Copy exceeds this layout. Shorten it before exporting."}</p>}
    {overlay}
  </div>{spec.version === 3 && report && <>{report.warnings?.map((warning) => <p className="poster-quality" role="note" key={warning}>{warning}</p>)}<details className="poster-quality"><summary>Layout and readability</summary><p>{report.issues.length ? "This format needs attention before export." : "All supplied copy fits the checked regions."}</p>{report.corrections.map((correction) => <p key={correction}>{correction}</p>)}<p>{report.sizes.map((size) => `${size.role}: ${size.pixels} native px`).join(" · ")}</p><small>Geometry and basic contrast checks do not certify visual quality or social-scale legibility.</small></details></>}</>;
}
