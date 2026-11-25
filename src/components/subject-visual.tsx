import type { Taste } from "@/lib/design";
import type { ArtDirection } from "@/lib/design-engine/registry";
import { TablerCamera } from "./tabler-camera";
import { ProceduralVisual } from "./procedural-visual";

// Original controlled geometry plus the separately credited static Tabler camera.
// Conceptual illustrations, not a real product/interface/bottle/person/brand.
// No model-authored markup or runtime asset fetch.
export function SubjectVisual({ kind, taste, ink, accent, background, secondary }: {
  kind: ArtDirection["visual"]; taste: Taste; ink: string; accent: string; background: string; secondary: string;
}) {
  const swiss=taste==="minimal-swiss", pop=taste==="festive-pop", stroke=swiss?5:pop?9:11;
  if(kind==="spark"||kind==="burst"||kind==="abstract")return <ProceduralVisual kind={kind} ink={ink} accent={accent} background={background} density={2}/>;
  return <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true" style={{display:"block",overflow:"hidden"}}>
    {/* Quiet registration grid / cut-paper field / playful moving orbit. */}
    {swiss ? <g stroke={ink} opacity=".12" strokeWidth="1">{[80,160,240,320].map(n=><path key={n} d={`M${n} 20v360M20 ${n}h360`}/>)}</g>
      : pop ? <><ellipse cx="204" cy="205" rx="173" ry="151" fill={secondary} transform="rotate(-17 204 205)"/><path d="m26 85 20-27 12 33m285 243 23-18-2 29" fill="none" stroke={accent} strokeWidth="12" strokeLinecap="round"/></>
      : <><path d="m35 52 323-20-11 327-319 14z" fill={secondary}/><path d="M20 345h360M45 371h289" stroke={ink} strokeWidth="5"/></>}
    <g stroke={ink} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">
      {kind==="camera" ? <TablerCamera ink={ink} weight={swiss?1.2:pop?1.65:1.8}/> : kind==="robot" ? <>
        <path d="M66 305h112l-17 48H49z" fill={ink}/><path d="m119 292 64-87 48 34-66 78" fill={accent}/>
        <circle cx="189" cy="219" r="30" fill={background}/><path d="m198 192 52-75 40 29-52 78" fill={accent}/>
        <circle cx="267" cy="132" r="27" fill={background}/><path d="m285 123 41-33 28 27-17 31m-12-38-12 43 28 27" fill="none"/>
        <path d="M281 309h69v44h-69z" fill={background}/><path d="m281 309 23-20h44l2 20m-35-17v60" fill="none"/>
        <path d="m78 101 12 17m-38 34 21 4m226 80 9 18" stroke={accent}/>
      </> : kind==="network" || kind==="circuit" ? <>
        <path d="M74 90 202 181 326 84M202 181 86 320m116-139 119 136M74 90 86 320m240-236-5 233M86 320h235" fill="none" stroke={accent}/>
        {[[74,90],[326,84],[86,320],[321,317]].map(([x,y],i)=><rect key={i} x={x-24} y={y-24} width="48" height="48" rx={pop?20:2} fill={background}/>)}
        <rect x="148" y="126" width="108" height="108" rx={pop?40:swiss?0:13} fill={accent}/><path d="m174 180 19 20 37-42" fill="none" stroke={background}/>
      </> : kind==="code" ? <>
        <path d="m137 104-87 92 87 91m126-183 87 92-87 91" fill="none" stroke={accent} strokeWidth={swiss?12:25}/>
        <path d="m229 80-64 236" fill="none" strokeWidth={swiss?10:20}/><path d="M66 344h268" fill="none"/>
        {!swiss&&<><circle cx="79" cy="65" r="10" fill={accent}/><path d="m308 326 25 23-25 21" fill="none"/></>}
      </> : kind==="cup" ? <>
        <path d="M128 111c-41-36 35-51 0-88m70 88c-41-36 35-51 0-88m65 88c-41-36 35-51 0-88" fill="none" stroke={accent}/>
        <path d="M280 157h30c66 0 53 99-21 99M68 151h223l-22 169q-89 38-177 0z" fill={accent}/>
        <ellipse cx="180" cy="151" rx="111" ry="23" fill={ink}/><path d="M65 359h237" fill="none"/>
        <path d="m112 185 13 105" stroke={background} fill="none"/>
      </> : kind==="waves" ? <>
        <circle cx="201" cy="210" r="117" fill={accent}/><circle cx="201" cy="210" r="73" fill="none" stroke={background}/><circle cx="201" cy="210" r="25" fill={background}/>
        <path d="M35 169q-32 41 0 82m330-82q32 41 0 82" fill="none"/>
        <path d="M90 110V44l95-17v65M90 73l95-18" fill="none"/><ellipse cx="74" cy="113" rx="18" ry="12" fill={ink}/><ellipse cx="169" cy="94" rx="18" ry="12" fill={ink}/>
        {pop&&<path d="m300 36 11 24 26 6-22 18 2 28-24-15-26 10 6-27-18-20 27-2z" fill={background}/>}
      </> : kind==="botanical" ? <>
        {/* Reusable vessel is symbolic; no statistics, logos or material claims. */}
        <path d="M170 83V52h60v31m-70 2h80v39l22 31v178q-61 29-122 0V155l20-31z" fill={background}/>
        <path d="M151 197h100v104H151z" fill={accent}/><path d="M200 275v-54" fill="none" stroke={background}/>
        <path d="M98 251C24 224 35 131 116 116c21 70 8 103-18 135m0 0 3-92" fill={accent}/>
        <path d="M283 199c70-9 90-71 59-115-68 18-88 70-59 115m0 0 41-83" fill={accent}/>
        <path d="M44 318q37 45 78 34m157 0q47-3 79-42" fill="none" stroke={accent}/>
      </> : kind==="aroma" ? <>
        {/* Scent as movement and spacing; no invented bottle appearance. */}
        <ellipse cx="199" cy="303" rx="112" ry="27" fill="none"/>
        {[0,1,2].map(i=><path key={i} d={`M${139+i*60} 275c-97-82 100-106 0-205`} fill="none" stroke={i===1?accent:ink} strokeWidth={swiss?5:11}/>)}
        <path d="M200 112c-87-12-90-76-66-88 52 18 72 45 66 88m0 0c91-23 96-69 63-81-41 16-63 43-63 81" fill="none" stroke={accent}/>
      </> : kind==="tiles" ? <>
        {/* Focus/order metaphor, deliberately not an alleged product UI. */}
        <path d="m69 116 125-43 43 125-125 43z" fill={accent}/><path d="M188 187h145v145H188z" fill={background}/>
        <circle cx="126" cy="294" r="40" fill={ink}/><path d="m225 253 24 24 47-57" fill="none" stroke={accent}/>
        <path d="m266 66 48 35m-16-53-17 62" fill="none"/>
      </> : <><circle cx="200" cy="200" r="115" fill={accent}/><path d="m100 300 200-200M110 105h185v185" fill="none"/></>}
    </g>
  </svg>;
}
