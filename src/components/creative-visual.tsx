import type { Taste } from "@/lib/design";
import type { ArtDirection } from "@/lib/design-engine/registry";
import { SubjectVisual } from "./subject-visual";

type Props = { kind: ArtDirection["visual"]; taste: Taste; ink: string; accent: string; background: string; secondary: string };
// Original lab-derived illustrations, adapted as trusted JSX. Flat layered
// shading avoids fragment IDs, remote resources and export-sensitive filters.
// Each is a conceptual depiction, never a verified product representation.
export function CreativeVisual(p: Props) {
  const { kind, taste, ink, accent, background: bg, secondary: paper } = p;
  const swiss = taste === "minimal-swiss", pop = taste === "festive-pop";
  if (kind === "tiles") return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%" aria-hidden="true" style={{display:"block"}}>
    {/* Original order/study metaphor: arranged sheets, circular object and bars.
        Abstract primitives, not a verified product image or product interface. */}
    <path d="M0 0H600V600H0Z" fill={paper}/>
    <g transform={`rotate(${swiss?-9:pop?12:-17} 300 300)`} stroke={ink} strokeWidth={swiss?3:7} strokeLinejoin="round">
      <rect x="86" y="103" width="274" height="355" rx={pop?32:3} fill={bg}/>
      <path d="M115 151h208m-208 35h148m-148 153h208m-208 35h208m-208 35h111" fill="none"/>
      <rect x="255" y="250" width="265" height="219" rx={pop?50:14} fill={accent}/>
      <rect x="283" y="278" width="209" height="163" rx={pop?32:5} fill="none" stroke={bg}/>
      <circle cx="378" cy="171" r="82" fill={ink}/><circle cx="378" cy="171" r="57" fill={bg}/>
      <path d="m452 89 15-5 54 168-16 5z" fill={accent}/>
    </g>
    <path d={swiss?"M38 532h524M38 548h148":"M36 528h108m-54-54v108"} fill="none" stroke={ink} strokeWidth="3"/>
  </svg>;
  if (!["cup", "robot", "aroma", "repair", "sky"].includes(kind)) return <SubjectVisual {...p} />;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
    <path d="M0 0H600V600H0Z" fill={paper} />
    {swiss ? <g fill="none" stroke={ink} strokeWidth="1" opacity=".13">{[60,140,220,300,380,460,540].map(n => <path key={n} d={`M${n} 0v600M0 ${n}h600`} />)}</g> : <><circle cx="300" cy="300" r="263" fill={bg} />{pop ? <g fill={accent}>{[[52,74],[529,104],[62,505],[522,498]].map(([x,y],i) => <path key={i} d={`M${x} ${y-20}l7 14 17 6-16 8-8 17-7-17-16-8 17-6Z`} />)}</g> : <g stroke={accent} strokeWidth="3" opacity=".45">{Array.from({length:18},(_,i) => <path key={i} d="M300 8V592" transform={`rotate(${i*10} 300 300)`} />)}</g>}</>}
    {kind === "cup" ? swiss ? <g transform="rotate(-18 300 300)" stroke={ink} strokeWidth="6">
      <ellipse cx="292" cy="315" rx="237" ry="214" fill={bg}/><ellipse cx="292" cy="315" rx="208" ry="186" fill="none" strokeWidth="2"/>
      <path d="M427 246q112-18 121 63 5 88-118 75v-33q87 16 87-41-5-44-90-31Z" fill={paper}/>
      <circle cx="292" cy="315" r="160" fill={bg}/><circle cx="292" cy="315" r="136" fill={accent}/>
      <circle cx="292" cy="315" r="116" fill={ink} opacity=".14" stroke="none"/>
      <path d="M203 338q15-105 119-82t55 110m-145-25q22-67 81-54t38 58" fill="none" stroke={bg} strokeWidth="7" opacity=".65"/>
      <path d="M153 260q28-75 112-100" fill="none" stroke={paper} strokeWidth="9" strokeLinecap="round"/>
    </g> : <g stroke={ink} strokeWidth={pop?8:7} strokeLinejoin="round">
      <g fill="none" strokeLinecap="round"><path d="M209 172c-80-62 58-90 4-145M300 161c-64-80 76-92 21-152M385 174c-56-65 51-81 22-135"/></g>
      <ellipse cx="300" cy="493" rx="223" ry="46" fill={ink}/><ellipse cx="300" cy="475" rx="219" ry="41" fill={bg}/><ellipse cx="300" cy="475" rx="163" ry="24" fill="none" strokeWidth="2"/>
      <path d="M146 235q153-58 308 0l-39 211q-116 65-229 0Z" fill={accent}/><ellipse cx="300" cy="235" rx="154" ry="44" fill={ink}/><ellipse cx="300" cy="232" rx="136" ry="30" fill={accent}/><ellipse cx="273" cy="225" rx="86" ry="12" fill={paper} opacity=".65" stroke="none"/>
      <path d="M156 252q147 60 288 0l-30 193q-112 53-227 0Z" fill={bg} opacity=".15" stroke="none"/>
      {Array.from({length:8},(_,i) => <path key={i} d={`M${179+i*34} 281l${26-i*7} 153`} fill="none" stroke={paper} strokeWidth={i%2?4:7} opacity={i%2?.3:.65}/>) }
      <path d="M194 429q110 42 214 0" fill="none" strokeWidth="3"/>
    </g> : kind === "robot" ? <>
      <g fill="none" stroke={ink} strokeWidth="2"><circle cx="300" cy="300" r="254" strokeDasharray="4 9"/><path d="M28 110h126M91 47v126M400 449h150m-75-58v116"/></g>
      <g stroke={ink} strokeWidth={swiss?6:10} strokeLinejoin="round"><path d="M93 489h306l59 55H47Z" fill={ink}/><path d="m144 485 117-177 77 43-87 134Z" fill={accent}/><path d="m162 478 112-157 20 12-94 145" fill={paper} opacity=".65" stroke="none"/>
        <circle cx="290" cy="320" r="60" fill={bg}/><circle cx="290" cy="320" r="34" fill={accent}/><path d="m290 260 90-166 74 40-84 167Z" fill={accent}/><path d="m313 260 79-148 20 12-73 143" fill={paper} opacity=".65" stroke="none"/>
        <circle cx="416" cy="120" r="46" fill={bg}/><circle cx="416" cy="120" r="23" fill={accent}/><path d="m456 142 60 57-25 57m25-57 45 38-13 47" fill="none" strokeWidth="14"/>
      </g><g fill="none" stroke={ink} strokeWidth="2"><circle cx="290" cy="320" r="78"/><circle cx="416" cy="120" r="64"/><path d="M76 425H31V176h126M366 39h162v95" strokeDasharray="7 8"/></g>
    </> : kind === "repair" ? <>
      <circle cx="300" cy="300" r="245" fill={bg} stroke={ink} strokeWidth="3"/>
      <g transform={`rotate(${swiss?-28:pop?24:-36} 300 300)`} stroke={ink} strokeWidth="10" strokeLinejoin="round"><path d="M273 218v288q27 39 54 0V218" fill={accent}/><path d="M273 218C154 184 178 65 232 48l5 107 62 31 63-31 5-107c57 20 80 137-40 170" fill={accent}/><path d="M287 253v218" fill="none" stroke={paper} strokeWidth="8"/><circle cx="300" cy="491" r="12" fill={ink}/></g>
      <path d="M65 121h83m-41-41v83M455 467h83m-41-41v83" fill="none" stroke={ink} strokeWidth="4"/>
    </> : kind === "sky" ? <>
      {[238,185,130,72].map(r => <circle key={r} cx="300" cy="300" r={r} fill="none" stroke={accent} strokeWidth="2" opacity=".65"/>)}
      {Array.from({length:46},(_,i) => <circle key={i} cx={65+(i*137)%470} cy={65+(i*193)%470} r={i%7===0?5:2} fill={ink}/>)}
      <path d="m132 390 89-166 84 48 76-121 73 159-85 110" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="5 8"/>
    </> : <>
      {/* Scent ribbons deliberately avoid inventing a specific perfume bottle. */}
      <circle cx="300" cy="300" r="222" fill={bg}/>
      <g fill="none" strokeLinecap="round">{Array.from({length:21},(_,i) => <path key={i} d={`M${15+i*16} 552C${545-i*9} ${440-i*11} ${35+i*16} ${271-i*5} ${270+i*14} 32`} stroke={i%4===0?accent:ink} strokeWidth={i%4===0?5:1.8} opacity={.22+i*.027}/>)}</g>
      <circle cx="300" cy="300" r="155" fill="none" stroke={accent} strokeWidth="2"/>
    </>}
  </svg>;
}
