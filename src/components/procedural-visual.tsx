import type { ArtDirection } from "@/lib/design-engine/registry";

// Original bounded SVG. No external assets, filters, masks, blend modes or markup input.
export function ProceduralVisual({ kind, ink, accent, background, density }: { kind: ArtDirection["visual"]; ink: string; accent: string; background: string; density: number }) {
  return <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true" style={{ display: "block", overflow: "hidden" }}>
    {kind === "cup" ? <>
      {(density === 1 ? [200] : density === 2 ? [150,250] : [130,200,270]).map((x) => <path key={x} d={`M${x} 110c-35-35 35-45 0-85`} stroke={accent} strokeWidth="12" fill="none" strokeLinecap="round" />)}
      <path d="M284 155h28c58 0 58 93-18 93" fill="none" stroke={ink} strokeWidth="18" />
      <path d="M71 150h220l-22 170q-90 43-176 0z" fill={accent} stroke={ink} strokeWidth="10" />
      <ellipse cx="181" cy="150" rx="109" ry="25" fill={ink} /><path d="M68 360h230" stroke={ink} strokeWidth="13" />
    </> : kind === "circuit" ? <>
      {Array.from({ length: 3+density }, (_, i) => <path key={i} d={`M${35+i*65} 0v400M0 ${35+i*65}h400`} stroke={ink} strokeWidth="1" opacity=".18" />)}
      <rect x="110" y="110" width="180" height="180" rx="30" fill={accent} stroke={ink} strokeWidth="9" />
      {[140, 200, 260].map((n) => <path key={n} d={`M${n} 60v50M${n} 290v50M60 ${n}h50M290 ${n}h50`} stroke={ink} strokeWidth="9" />)}
      <path d="m210 138-55 74h48l-13 52 58-76h-49z" fill={background} />
    </> : kind === "waves" ? <>
      {Array.from({ length: 3+density }, (_, i) => <path key={i} d={`M10 ${65+i*54} Q105 ${-30+i*54} 200 ${65+i*54} T390 ${65+i*54}`} stroke={i%2 ? ink : accent} strokeWidth={i===2 ? 24 : 12} fill="none" strokeLinecap="round" />)}
    </> : kind === "spark" || kind === "burst" ? <>
      <path d={kind === "spark" ? "M200 18l38 125 131-57-75 115 88 100-141-30-41 115-40-115-142 30 89-100L31 86l131 57z" : "M200 10l30 72 61-55-9 88 85-10-50 65 72 30-72 30 50 65-85-10 9 88-61-55-30 72-30-72-61 55 9-88-85 10 50-65-72-30 72-30-50-65 85 10-9-88 61 55z"} fill={accent} stroke={ink} strokeWidth="5" />
      <circle cx="200" cy="200" r="49" fill={background} /><circle cx="200" cy="200" r="15" fill={ink} />
    </> : <><circle cx="200" cy="200" r="142" fill={accent} /><path d="M90 290 290 90M90 90h200v200" fill="none" stroke={ink} strokeWidth="18" /></>}
  </svg>;
}
