import type { DesignSpecV3, Format } from "../design";
import type { Rect, ResolvedLayout } from "./layout";
import { copyGroups } from "./layout";

export function hierarchyGroups(text: string, limit = 8) {
  // Split on clause boundaries only. Retain every punctuation-bearing clause,
  // negation and corrected venue, including URL punctuation; never summarize.
  const original=limit === 8 ? copyGroups(text) : text.split(/(?<=[.!?;])\s+|\n/).map(s=>s.trim()).filter(Boolean), split=original.flatMap(group=>group.split(/(?<=;)\s+/)).filter(Boolean);
  // Preserve the existing eight-group bound; unusually segmented copy stays
  // complete in its original groups instead of creating hundreds of DOM nodes.
  return split.length<=limit?split:original;
}

export function resolveSubjectLayout(spec: DesignSpecV3, format: Format, correction: number): ResolvedLayout {
  const {width:w,height:h}=format, wide=w>h, portrait=h>w, street=spec.taste==="bold-street";
  const margin=Math.round(Math.min(w,h)*(street?.055:.065)) + Math.round((spec.composition.spacing-60)/4);
  const x=margin, iw=w-2*margin, y=margin+(wide?68:84), gap=wide?22:30;
  const ctaH=spec.campaign.cta?(wide?82:90):0, bottom=h-margin-ctaH-(ctaH?24:0), usable=bottom-y;
  const groups=hierarchyGroups(spec.campaign.supportingText), dense=spec.campaign.supportingText.length>260;
  const noArt=spec.artDirection.visual==="none"||dense||spec.artDirection.adaptation==="type-led"||correction>0;
  const hasSupport=!!spec.campaign.supportingText, factual=groups.length>=4;
  const scale=wide?Math.min(w/1280,h/720):1;
  const variant=spec.artDirection.variant;
  let headline:Rect={x,y,w:iw,h:usable*(hasSupport?(dense?.32:wide?.49:.45):.83)};
  let support:Rect={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
  let art:Rect|undefined, align:ResolvedLayout["align"]="left";
  if(wide){
    // Landscapes reserve a full-width information band, rather than shrinking a
    // portrait's small lower-right fact block. LinkedIn uses its own scale.
    if(!noArt){headline.w=iw*(variant==="swiss-column"?.64:.64);const side=iw*.29;art={x:x+iw*.71,y,w:side,h:Math.min(side,headline.h)};}
    if(variant==="swiss-column"&&!noArt){art={x,y,w:iw*.23,h:headline.h};headline={...headline,x:x+iw*.30,w:iw*.70};align="right";}
    if(variant==="pop-offset"&&!noArt){art={x,y,w:iw*.27,h:headline.h};headline={...headline,x:x+iw*.34,w:iw*.66};}
    if(variant==="pop-stage")align="center";
    if(!hasSupport&&!noArt){headline.h=usable*.85;art!.h=usable*.8;art!.w=Math.min(iw*.32,usable*.8);}
  }else if(!noArt){
    if(variant==="street-editorial"||variant==="pop-offset"){
      headline={...headline,w:iw*.66,h:usable*(factual?.42:.50)};
      art={x:x+iw*.70,y:y+14,w:iw*.30,h:headline.h};
      support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};
    }else if(variant==="swiss-column"){
      headline={...headline,x:x+iw*.28,w:iw*.72,h:usable*.45};align="right";
      art={x,y,w:iw*.23,h:headline.h};
    }else if(variant==="pop-stage"&&!factual){
      align="center";headline.h=usable*.32;
      const side=Math.min(iw*.62,usable*.40);art={x:x+(iw-side)/2,y:y+headline.h+20,w:side,h:side};
      support={x,y:art.y+side+28,w:iw,h:bottom-art.y-side-28};
    }else{
      if(variant==="pop-stage")align="center";
      headline.h=usable*(portrait?.43:.40);
      const lower=y+headline.h+gap, available=bottom-lower;
      art={x,y:lower+Math.max(0,(available-iw*.37)/2),w:iw*.37,h:Math.min(iw*.37,available)};
      support={x:x+iw*.43,y:lower,w:iw*.57,h:available};
    }
  }else{
    align=variant==="pop-stage"?"center":variant==="swiss-column"?"right":"left";
  }
  if(correction>1){headline={x,y,w:iw,h:Math.max(120,usable*.25)};support={x,y:y+headline.h+gap,w:iw,h:bottom-y-headline.h-gap};}
  return {kicker:{x,y:margin,w:iw,h:42},headline,support,cta:{x,y:h-margin-ctaH,w:iw,h:ctaH},art,align,
    columns:spec.artDirection.information!=="stack"&&groups.length>=2&&support.w>(spec.artDirection.information==="grid"?650:800)?2:1,
    corrections:correction===0?[]:correction===1?["Artwork removed and text expanded to preserve readable copy."]:["Artwork removed and more space allocated to supporting information."],
    floors:{headline:correction>1?48:dense?(wide?56:64):wide?64:portrait?80:76,support:wide?Math.max(34,Math.round(32*scale)):34,kicker:26,cta:wide?Math.max(32,Math.round(30*scale)):34}};
}
