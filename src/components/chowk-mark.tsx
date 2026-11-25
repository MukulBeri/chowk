// Exact approved refined-mark geometry, from the original Chowk SVG asset.
// Animation acts on enclosing groups so the vermilion tile keeps its tilt.
export function ChowkMark({ animated = false }: { animated?: boolean }) {
  return <svg className={animated ? "chowk-mark is-active" : "chowk-mark"} viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
    <g className="chowk-tile tile-vermilion"><rect x="3" y="3" width="27" height="27" fill="#FF4B1F" transform="rotate(-6 16 16)" /></g>
    <g className="chowk-tile tile-ink"><rect x="35" y="3" width="26" height="27" fill="#14110F" /></g>
    <g className="chowk-tile tile-yellow"><rect x="3" y="35" width="27" height="26" fill="#F4E83A" stroke="#14110F" strokeWidth="3" /></g>
    <g className="chowk-tile tile-open"><rect x="36.5" y="36.5" width="23" height="23" fill="none" stroke="#14110F" strokeWidth="3" strokeDasharray="5 4" /></g>
  </svg>;
}
export function ChowkLoading({ label, size = "inline" }: { label: string; size?: "inline" | "compact" | "studio" | "large" }) {
  return <span className={`chowk-loading loading-${size}`} data-loading="true"><ChowkMark animated /><span>{label}</span></span>;
}
