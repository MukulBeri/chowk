import type { CSSProperties, Ref } from "react";
import type { DesignSpecV3, Format } from "@/lib/design";
import { ENGINE_TASTES } from "@/lib/design-engine/registry";
import { copyGroups, informationRole, resolveLayout, type Rect } from "@/lib/design-engine/layout";
import { ProceduralVisual } from "./procedural-visual";
import { SubjectVisual } from "./subject-visual";
import { hierarchyGroups } from "@/lib/design-engine/subject-layout";
import { CreativeVisual } from "./creative-visual";
import { manifestoHeadline } from "@/lib/design-engine/creative-layout";
import {elementEdit,type EditableRole} from "@/lib/design-engine/editing";

const rectStyle = (r: Rect): CSSProperties => ({ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: "border-box" });
const isAtomic=(text:string)=>/^(?:[₹$£€]\s*\d+(?:\.\d+)?|\d{1,2}\s?(?:AM|PM)|\d{1,2}:\d{2}(?:\s?(?:AM|PM))?(?:\s?IST)?)$/i.test(text);

// Pure native artwork shared by the measured studio and trusted HTTP renderer.
export function AdvancedPosterMarkup({ spec, format, correction = 0, status = { ready: false, issues: [] }, rootRef }: { spec: DesignSpecV3; format: Format; correction?: number; status?: { ready: boolean; issues: string[] }; rootRef?: Ref<HTMLDivElement> }) {
  const layout = resolveLayout(spec, format, correction);
  const editStyle=(role:EditableRole):CSSProperties=>{const e=elementEdit(spec,format,role);return {...(e.align?{textAlign:e.align}:{}),...(e.tracking!==undefined?{letterSpacing:e.tracking}:{}),...(e.lineHeight!==undefined?{lineHeight:e.lineHeight}:{}),...(e.layer!==undefined?{zIndex:e.layer}:{})};};
  const maximum=(role:EditableRole,value:number,floor:number)=>Math.max(floor,value*(elementEdit(spec,format,role).fontScale??1));
  const tokens = ENGINE_TASTES[spec.taste], palette = spec.palette;
  const street = spec.taste === "bold-street", pop = spec.taste === "festive-pop";
  const creative = spec.artDirection.treatment === "creative-led", recipe = spec.artDirection.recipe;
  const design = spec.artDirection.design;
  const anchorFact = layout.anchor && spec.creativeContent?.facts.find(f=>f.id===design?.anchorFactId);
  const rasterCrop = spec.assetLayer?.placements?.[format.id] ?? spec.assetLayer?.crop;
  const panel = design ? design.typeMode === "blocks" : creative ? recipe === "signboard" && street : spec.artDirection.variant === "street-editorial";
  const subjectLed = spec.artDirection.treatment === "subject-led" || creative;
  const wide = format.width > format.height;
  const headline = creative && (recipe === "manifesto" || design?.typeMode==="colossus") ? manifestoHeadline(spec.campaign.headline, wide) : spec.campaign.headline;
  const groups = (subjectLed ? hierarchyGroups(spec.campaign.supportingText, creative ? 40 : 8) : copyGroups(spec.campaign.supportingText)).filter(group=>!anchorFact||group!==anchorFact.text);
  // Contiguous, balanced columns avoid grid rows borrowing the height of an
  // unrelated longer fact. Preserve DOM reading order and every complete clause.
  let breaks = [0, groups.length], imbalance = Infinity;
  if (creative && layout.columns > 1) {
    const weights = groups.map(s => Math.ceil(s.length / Math.max(18, (layout.support.w / layout.columns - 24) / (layout.floors.support * .55))) + .5);
    const weight = (start: number, end: number) => weights.slice(start, end).reduce((a,b)=>a+b,0);
    for (let i = 1; i < groups.length; i++) for (let j = layout.columns === 3 ? i + 1 : groups.length; j <= (layout.columns === 3 ? groups.length - 1 : groups.length); j++) {
      const points = layout.columns === 3 ? [0,i,j,groups.length] : [0,i,groups.length];
      const sizes = points.slice(1).map((end,k)=>weight(points[k],end));
      const score = Math.max(...sizes) - Math.min(...sizes);
      if (score < imbalance) { breaks = points; imbalance = score; }
    }
  }
  const columns = breaks.slice(1).map((end,i)=>groups.slice(breaks[i],end));
  const groupMarkup = (group: string, index: number) => {
    const role = subjectLed && (/^(?:venue|location) changed\b/i.test(group) || creative && /^The original venue\b/i.test(group)) ? "where" : informationRole(group), primary = role === "when" || role === "where";
    return <p key={`${index}-${group}`} data-copy-group data-information-role={role} style={{ margin: 0, boxSizing: "border-box", fontWeight: primary ? 700 : role === "entry" ? 600 : 400, fontSize: subjectLed || primary ? "1em" : `max(${layout.floors.support}px, .92em)`, gridColumn: layout.columns > 1 && (role === "registration" || creative && primary && group.length > 60) ? "1 / -1" : undefined, paddingTop: groups.length > 1 ? creative ? 7 : 12 : 0, borderTop: groups.length > 1 ? `${design ? 1 : primary ? 3 : 1}px solid ${palette.accent}` : undefined, ...(design?.device==="axis" ? {borderLeft:`2px solid ${palette.accent}`,paddingLeft:18} : design?.device==="orbit" ? {background:palette.ink,borderRadius:22,padding:"12px 16px",color:palette.background,border:`2px solid ${palette.ink}`} : {}) }}>{group.split(/(https?:\/\/\S+)/g).map((part, partIndex) => /^https?:\/\//.test(part) ? <span key={partIndex}>{part.split(/(?<=\/)/).map((piece, pieceIndex) => <span key={pieceIndex}>{piece}<wbr /></span>)}</span> : <span key={partIndex}>{part.split(/((?:[₹$£€]\s*\d+(?:\.\d+)?)|(?:\b\d{1,2}\s?(?:AM|PM)\b)|(?:\b\d{1,2}:\d{2}(?:\s?(?:AM|PM))?(?:\s?IST)?\b))/gi).map((piece,i)=><span key={i} style={design&&isAtomic(piece)?{whiteSpace:"nowrap"}:undefined}>{piece}</span>)}</span>)}</p>;
  };
  // Creative tracking uses native px: measured em tracking reproduced a
  // portable-HTML raster difference after font-size fitting in Chromium.
  // Historical treatment styles and all comparison tolerances stay unchanged.
  const text: CSSProperties = { margin: 0, padding: 0, color: palette.ink, fontFamily: '"YarcInter", Arial, Helvetica, sans-serif', whiteSpace: "pre-wrap", overflowWrap: "anywhere" };
  const maximumHeadline = Math.min(format.width * (design?.typeMode==="colossus"?.32:.20), format.height * (design?.typeMode==="colossus"?.40:.28), design?340:240) * spec.typography.headlineScale * (spec.artDirection.emphasis === "editorial" ? .88 : 1);
  const words=headline.split(/\s+/), minimumWordStack=words.length*(layout.floors.headline*(design?.typeMode==="blocks"?1.16:1.04)+(design?.typeMode==="blocks"?23:5));
  const wordBlocks=design&&["stagger","blocks"].includes(design.typeMode)&&words.length>=2&&words.length<=6&&!words.some(w=>/^(?:a|an|the|and|or|of|to|for|in|on|at|with|by)$/i.test(w))&&headline.length<=65&&groups.length<7&&spec.campaign.supportingText.length<=500&&minimumWordStack<=layout.headline.h;
  return <div ref={rootRef} data-poster={format.id} data-taste={spec.taste} data-version="3" data-variant={spec.artDirection.variant} data-recipe={creative ? recipe : undefined}
    data-design-version={design?.version} data-ready={status.ready} data-overflow={status.issues.length > 0} data-quality={JSON.stringify(status.issues)} data-corrections={JSON.stringify(layout.corrections)} data-correction-step={correction}
    data-provider-xmp={layout.art?spec.assetLayer?.providerMetadata?.xmp:undefined} data-capabilities={spec.capabilities?JSON.stringify(spec.capabilities):undefined}
    role="img" aria-label={`${format.name}: ${spec.campaign.headline.replaceAll("\n", " ")}`}
    // A creative artboard is composited as one surface. This keeps native text
    // antialiasing consistent with its SVG-image export (without changing copy,
    // dimensions, colours, font sizes or the tested legacy rendering path).
    style={{ position: "relative", width: format.width, height: format.height, flexShrink: 0, boxSizing: "border-box", overflow: "hidden", isolation: "isolate", background: palette.background, color: palette.ink, fontSynthesis: "none", ...(creative ? {willChange:"transform"} : {}) }}>
    {pop && !design && <div aria-hidden="true" style={{ position: "absolute", inset: 17, border: `${subjectLed ? 7 : 4}px solid ${palette.ink}`, borderRadius: subjectLed ? (wide ? 38 : 64) : tokens.corner }} />}
    {creative && !design && !pop && recipe === "signboard" && <div aria-hidden="true" style={{position:"absolute",inset:18,border:`2px solid ${palette.ink}`}}/>}
    {design && <div data-design-device={design.device} aria-hidden="true" style={{position:"absolute",boxSizing:"border-box",...(design.device==="axis"?{left:layout.headline.x,top:layout.headline.y-13,width:Math.min(160,layout.headline.w),height:5,background:palette.accent}:design.device==="strip"?{left:0,top:0,width:18,height:format.height,background:palette.ink}:{right:-80,bottom:-70,width:format.width*.45,height:format.width*.45,border:`26px solid ${palette.accent}`,borderRadius:"50%",opacity:.24})}}/>}
    <p data-fit data-role="kicker" data-min={layout.floors.kicker} data-max={maximum("kicker",32,layout.floors.kicker)} style={{ ...text, ...rectStyle(layout.kicker), fontWeight: 700, lineHeight: 1.1, letterSpacing: creative ? (street ? 3 : 2) : street ? "0.11em" : ".06em", textTransform: "uppercase", borderBottom: !pop ? `3px solid ${palette.ink}` : undefined, textAlign: layout.align,...editStyle("kicker") }}>{spec.campaign.eyebrow}</p>
    <h2 data-fit data-role="headline" data-min={layout.floors.headline} data-max={maximum("headline",maximumHeadline,layout.floors.headline)} style={{ ...text, ...rectStyle(layout.headline), fontFamily: tokens.font, fontWeight: tokens.weight, letterSpacing: creative ? (street ? -1 : pop ? -2 : -3) : tokens.tracking, lineHeight: tokens.lineHeight,
      textTransform: street ? "uppercase" : "none", textAlign: layout.align, textWrap: "balance", ...(subjectLed ? { overflowWrap: "normal", whiteSpace: "pre-line" } : {}), ...(creative || !spec.campaign.supportingText && !layout.art ? { alignContent: "center" } : {}), ...(creative && !design && recipe === "manifesto" ? {borderTop:`7px solid ${palette.ink}`,borderBottom:`7px solid ${palette.ink}`,padding:"10px 0",alignContent:"center"} : {}), ...(panel&&!wordBlocks ? { background: palette.ink, color: palette.background, padding: "12px 20px" } : {}),...editStyle("headline") }}>{wordBlocks?words.map((word,i)=><span key={i} style={{display:"block",textAlign:elementEdit(spec,format,"headline").align??(i%2?"right":"left"),...(design?.typeMode==="blocks"?{background:palette.ink,color:palette.background,padding:"2px 16px 16px",lineHeight:elementEdit(spec,format,"headline").lineHeight??1.16,borderRadius:i%2?"32px 4px 32px 4px":"4px 32px 4px 32px",marginBottom:5}:{}),...(design?.typeMode==="stagger"&&i%2?{color:palette.accent}: {})}}>{word}{i<words.length-1?" ":""}</span>):headline}</h2>
    {anchorFact&&layout.anchor&&<p data-fit data-role="anchor" data-min={layout.floors.headline} data-max={maximum("anchor",180,layout.floors.headline)} style={{...text,...rectStyle(layout.anchor),fontFamily:tokens.font,fontWeight:tokens.weight,lineHeight:1.05,color:palette.accent,alignContent:"center",...editStyle("anchor")}}>{anchorFact.text}</p>}
    {layout.art && <div data-hero data-decoration={spec.decoration.motif} data-illustration={spec.assetLayer ? "local-raster" : spec.artDirection.visual} style={{ ...rectStyle(layout.art), padding: pop ? 5 : 0, ...(creative && !design ? {border:`${street ? 4 : 2}px solid ${palette.ink}`,borderRadius:pop?28:0,overflow:"hidden"} : {}), ...(design ? {border:0,borderRadius:pop?"48% 48% 0 0":0,padding:0,overflow:"hidden",background:spec.assetLayer?palette.secondary:undefined} : {}), ...(spec.assetLayer?.framing === "edge-to-edge" ? {border:0,borderRadius:0,padding:0} : {}),...editStyle("art") }}>{spec.assetLayer ? <div data-raster-layer={spec.assetLayer.id} aria-hidden="true" style={{ width:"100%",height:"100%",backgroundColor:palette.secondary,backgroundImage:`url(${spec.assetLayer.dataUrl})`,backgroundRepeat:"no-repeat",backgroundPosition:`${rasterCrop!.x}% ${rasterCrop!.y}%`,backgroundSize:rasterCrop!.zoom === 1 ? rasterCrop!.fit : `${rasterCrop!.zoom * 100}% auto` }}/> : creative ? <div style={{width:"100%",height:"100%",...(design?.imageRole==="oversized"?{transform:`scale(${pop?1.32:1.18})`}: {})}}><CreativeVisual kind={spec.artDirection.visual} taste={spec.taste} {...palette}/></div> : subjectLed ? <SubjectVisual kind={spec.artDirection.visual} taste={spec.taste} {...palette} /> : <ProceduralVisual kind={spec.artDirection.visual} ink={palette.ink} accent={palette.accent} background={palette.background} density={spec.decoration.density} />}</div>}
    {layout.art&&spec.assetLayer?.source==="meta"&&<p data-image-disclosure style={{position:"absolute",left:layout.art.x+8,top:layout.art.y+layout.art.h-42,maxWidth:layout.art.w-16,margin:0,padding:"5px 8px",background:palette.ink,color:palette.background,fontFamily:"YarcInter, Arial, sans-serif",fontSize:26,lineHeight:1.1}}>AI concept</p>}
    {spec.campaign.supportingText && <div data-fit data-role="support" data-min={layout.floors.support} data-max={maximum("support",subjectLed ? (wide ? Math.round(format.height / 720 * 46) : 46) : pop ? 44 : 40,layout.floors.support)} style={{ ...text, ...rectStyle(layout.support), fontWeight: spec.artDirection.emphasis === "display" ? 600 : 400, lineHeight: creative ? 1.2 : 1.24, display: "grid", gridTemplateColumns: `repeat(${layout.columns},minmax(0,1fr))`, alignContent: creative ? "stretch" : "start", gap: creative ? 24 : layout.columns > 1 ? "20px 32px" : 18, textAlign: layout.align === "center" ? "center" : "left",...editStyle("support") }}>
      {creative ? columns.map((items, index) => <div key={index} data-min={layout.floors.support} style={{ minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: spec.engineRevision!==9&&!design && spec.taste === "minimal-swiss" && recipe === "editorial" && !wide ? "flex-end" : undefined, gap: 12 }}>{items.map(groupMarkup)}</div>) : groups.map(groupMarkup)}
    </div>}
    {spec.campaign.cta && <p data-fit data-role="cta" data-min={layout.floors.cta} data-max={maximum("cta",40,layout.floors.cta)} style={{ ...text, ...rectStyle(layout.cta), background: palette.ink, color: palette.background, borderRadius: pop ? 24 : 0, padding: "10px 18px", fontWeight: 700, lineHeight: 1.15,...editStyle("cta") }}>{spec.campaign.cta}</p>}
    {street && spec.decoration.density > 1 && <svg aria-hidden="true" width="120" height="14" viewBox="0 0 120 14" style={{ position: "absolute", bottom: 12, right: 24 }}>{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={i*10+5} cy="7" r={spec.decoration.density === 3 ? 3 : 2} fill={palette.ink} />)}</svg>}
  </div>;
}
