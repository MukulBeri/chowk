import Image from "next/image";
import { PRESETS } from "@/lib/design";
import type { GalleryExample } from "@/lib/gallery";
import { UseExample } from "./use-example";
export function GalleryCard({ example }: { example: GalleryExample }) {
  const cover = example.formats[1];
  return <article className="site-gallery-card"><div className="gallery-card-art"><Image src={cover.src} width={cover.width} height={cover.height} alt={`${example.title} — actual ${PRESETS[example.taste].name} local-planner square example`} unoptimized /></div><div className="gallery-card-copy"><p className="site-eyebrow">{example.category} · {PRESETS[example.taste].name}</p><h3>{example.title}</h3><p className="site-caption">{example.provenance}. Synthetic sample brief.</p><UseExample draft={example.draft} /><details><summary>See four formats &amp; exact input</summary><p>{example.draft.topic}</p><p>{example.draft.details}</p><div className="gallery-format-previews">{example.formats.map(f => <figure key={f.id}><Image src={f.src} width={f.width} height={f.height} alt={`${example.title} — ${f.id.replaceAll("-", " ")}`} unoptimized /><figcaption>{f.width} × {f.height}</figcaption></figure>)}</div></details></div></article>;
}
