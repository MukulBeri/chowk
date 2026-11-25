import catalog from "../../public/examples/catalog.json";
import { generationRequestSchema } from "./generation/contracts";
import type { Taste } from "./design";
import type { StudioDraft } from "./studio-handoff";
export type GalleryExample = { id: string; title: string; category: string; taste: Taste; draft: StudioDraft; provenance: string; formats: { id: string; width: number; height: number; src: string }[] };
export const GALLERY: GalleryExample[] = catalog.map(example => ({ ...example, taste: generationRequestSchema.parse(example.draft).taste, draft: generationRequestSchema.parse(example.draft) }));
