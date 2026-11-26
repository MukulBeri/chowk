"use client";
import { useState } from "react";
import { GALLERY } from "@/lib/gallery";
import { PRESETS, TASTES, type Taste } from "@/lib/design";
import { GalleryCard } from "./gallery-card";
export function ExploreGallery() {
  const [taste, setTaste] = useState<Taste | "all">("all");
  const [query, setQuery] = useState("");
  const visible = GALLERY.filter(e => (taste === "all" || e.taste === taste) && e.title.toLowerCase().includes(query.trim().toLowerCase()));
  return <><label className="explore-search" htmlFor="example-search">Find an example<input id="example-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search campaign titles"/></label><div className="site-filter" role="group" aria-label="Filter examples by taste"><button aria-pressed={taste === "all"} onClick={() => setTaste("all")}>All tastes</button>{TASTES.map(t => <button key={t} aria-pressed={taste === t} onClick={() => setTaste(t)}>{PRESETS[t].name}</button>)}</div><p className="site-caption" aria-live="polite">{visible.length} curated examples · local generation, no live AI claim</p>{!visible.length && <div role="status"><p>No examples match. Your current filters do not change the catalog.</p><button className="site-button" onClick={()=>{setTaste("all");setQuery("");}}>Reset filters</button></div>}<div className="site-card-grid">{visible.map(example => <GalleryCard key={example.id} example={example} />)}</div></>;
}
