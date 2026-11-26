import type { DesignSpecV3, Format } from "../design";
import type { ResolvedLayout, Rect } from "./layout";
import { hierarchyGroups } from "./subject-layout";

// Compiles the additive grammar into the same measured native roles. No copy is
// fitted by character count here: allocation is a proposal, the DOM fitter decides.
export function resolveArtDirection(spec: DesignSpecV3, format: Format, correction: number): ResolvedLayout {
  const {width:w,height:h}=format, wide=w>h, swiss=spec.taste==="minimal-swiss", pop=spec.taste==="festive-pop";
  const d=spec.artDirection.design!, gap=wide?24:30, m=Math.round(Math.min(w,h)*(swiss?.055:.05)+(spec.composition.spacing-60)/5);
  const x=m, iw=w-2*m, y=m+64, ctaH=spec.campaign.cta?(wide?76:86):0, bottom=h-m-(ctaH?ctaH+gap:0), usable=bottom-y;
  const groups=hierarchyGroups(spec.campaign.supportingText,40), dense=groups.length>=7||spec.campaign.supportingText.length>500;
  const artAllowed=d.imageRole!=="none"&&(!!spec.assetLayer||spec.artDirection.visual!=="none")&&spec.artDirection.recipe!=="manifesto"&&spec.artDirection.adaptation!=="type-led"&&!dense&&correction===0;
  let headline:Rect={x,y,w:iw,h:usable*.60},support:Rect={x,y:y+usable*.60+gap,w:iw,h:usable*.40-gap},art:Rect|undefined,anchor:Rect|undefined;
  let align:ResolvedLayout["align"]="left", kicker:Rect={x,y:m,w:iw,h:38};
  const short=spec.campaign.headline.length<55;
  if (artAllowed) {
    if(wide){
      const left=iw*(swiss?.50:pop?.59:.55);
      headline={x,y,w:left,h:usable*(swiss?.44:short?.54:.60)};
      support={x,y:headline.y+headline.h+gap,w:left,h:bottom-headline.y-headline.h-gap};
      art={x:x+left+gap,y:swiss?0:y,w:w-x-left-gap,h:swiss?h:bottom-y};
      if(pop){
        align="center";headline={x,y,w:iw*.62,h:usable*.48};
        art={x:x+iw*.68,y,w:iw*.32,h:headline.h};
        support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
      }
    }else if(swiss){
      // Broad opening spread and a substantial lower image, instead of a small
      // framed stamp above a bottom-aligned factual footer.
      headline={x,y,w:iw,h:usable*(short?.28:.35)};
      const lower=headline.y+headline.h+gap;
      support={x,y:lower,w:iw*.45,h:bottom-lower};
      art={x:x+iw*.51,y:lower,w:w-x-iw*.51,h:bottom-lower+m};
    }else if(pop){
      align="center";headline={x,y,w:iw,h:usable*(short?.36:.40)};
      const lower=headline.y+headline.h+gap;
      art={x:x+iw*.48,y:lower,w:w-x-iw*.48,h:bottom-lower+m};
      support={x,y:lower,w:iw*.44,h:bottom-lower};
      // Very narrow fact columns are unsuitable for complete logistics.
      if(groups.length>3||spec.campaign.supportingText.length>260){
        art={x:x+iw*.18,y:lower,w:iw*.72,h:usable*.34};
        support={x,y:art.y+art.h+gap,w:iw,h:bottom-art.y-art.h-gap};
      }
    }else{
      headline={x,y,w:iw,h:usable*(short?.44:.48)};
      const lower=headline.y+headline.h+gap;
      art={x:0,y:lower,w:iw*.60,h:bottom-lower+m};
      support={x:x+iw*.62,y:lower,w:iw*.38,h:bottom-lower};
    }
    if(d.imageRole==="inset"||spec.artDirection.recipe==="dossier"){
      // Deliberate alternate relationship: image at opening, full-width facts.
      headline={x,y,w:iw*.61,h:usable*(wide?.48:.46)};
      art={x:x+iw*.67,y,w:iw*.33,h:headline.h};
      support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
    }
    if(spec.artDirection.recipe==="editorial"&&!swiss){
      if(wide){
        art={x:0,y:0,w:w*.39,h};headline={x:w*.44,y,w:w*.56-m,h:usable*.52};
        support={x:headline.x,y:headline.y+headline.h+gap,w:headline.w,h:bottom-headline.y-headline.h-gap};
        kicker={x:headline.x,y:m,w:headline.w,h:38};
      }else{
        headline={x,y,w:iw*.59,h:usable*.47};art={x:x+iw*.64,y,w:iw*.36+m,h:headline.h};
        support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
      }
    }
  }else{
    const share=!spec.campaign.supportingText.trim()? .90 : dense ? (short?.24:.34) : swiss?.54:pop?.62:.66;
    headline={x,y,w:iw,h:usable*share};support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
    align=pop?"center":"left";
    if(swiss&&!dense&&wide){headline={x,y,w:iw*.60,h:usable};support={x:x+iw*.65,y:y+usable*.16,w:iw*.35,h:usable*.84};}
  }
  // A photographic asset occupies roughly half the canvas, with a disjoint
  // opaque text region. There is no unverified photo-luminance overlay claim.
  if(spec.assetLayer&&(spec.assetLayer.framing==="edge-to-edge"||d.imageRole==="immersive")&&artAllowed){
    if(wide){art={x:w*.55,y:0,w:w*.45,h};headline={x,y,w:w*.48-m,h:usable*.48};support={x,y:headline.y+headline.h+gap,w:headline.w,h:bottom-headline.y-headline.h-gap};}
    else{art={x:0,y:0,w,h:h*.48};kicker={x,y:h*.48+18,w:iw,h:38};headline={x,y:h*.48+80,w:iw,h:usable*.23};support={x,y:headline.y+headline.h+gap,w:iw,h:bottom-headline.y-headline.h-gap};}
  }
  if(d.typeMode==="anchor"&&correction===0&&spec.creativeContent){
    const fact=spec.creativeContent.facts.find(f=>f.id===d.anchorFactId);
    if(fact){
      art=undefined;headline={x,y,w:iw,h:usable*.26};
      anchor={x,y:y+headline.h+gap,w:iw,h:usable*.28};
      support={x,y:anchor.y+anchor.h+gap,w:iw,h:bottom-anchor.y-anchor.h-gap};
    }
  }
  if(correction>0){
    art=undefined;anchor=undefined;
    kicker={x,y:m,w:iw,h:38};
    headline={x,y,w:iw,h:usable*(dense?(short?.18:.28):correction>1?.30:.40)};
    support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
  }
  const columns=spec.artDirection.information==="stack"?1:wide&&support.w>1100&&groups.length>=7?3:support.w>750&&groups.length>1?2:1;
  if(wide&&art?.y===0){kicker.x=headline.x;kicker.w=headline.w;}
  return {kicker,headline,support,art,anchor,align,columns,
    cta:{x,y:h-m-ctaH,w:art?.y===0?headline.w:iw,h:ctaH},
    floors:{headline:correction>1?48:dense?(wide?56:64):wide?64:h>w?80:76,support:wide?Math.max(34,Math.round(h/720*32)):34,kicker:26,cta:wide?Math.max(32,Math.round(h/720*30)):34},
    corrections:correction===0?dense&&pop?["Expressive word blocks simplified for complete dense factual information."]:[]:[correction===1?"Image/anchor allocation released before reducing readable factual content.":"Factual space expanded; unresolved geometry still refuses export."]};
}
