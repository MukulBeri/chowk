"use client";
import { useState } from "react";
import { GALLERY } from "@/lib/gallery";
import { PRESETS, TASTES, type Taste } from "@/lib/design";
import { GalleryCard } from "./gallery-card";
export function ExploreGallery() {
  const [taste, setTaste] = useState<Taste | "all">("all");
  const visible = GALLERY.filter(e => taste === "all" || e.taste === taste);
  return <><div className="site-filter" role="group" aria-label="Filter examples by taste"><button aria-pressed={taste === "all"} onClick={() => setTaste("all")}>All tastes</button>{TASTES.map(t => <button key={t} aria-pressed={taste === t} onClick={() => setTaste(t)}>{PRESETS[t].name}</button>)}</div><p className="site-caption" aria-live="polite">{visible.length} curated examples · local generation, no live AI claim</p><div className="site-card-grid">{visible.map(example => <GalleryCard key={example.id} example={example} />)}</div></>;
}
