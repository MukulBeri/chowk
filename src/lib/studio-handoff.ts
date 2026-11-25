import { generationRequestSchema } from "./generation/contracts";
import type { Taste } from "./design";
export type StudioDraft = { topic: string; details: string; taste: Taste; treatment?: "creative-led" };
const key = "chowk.draft-handoff.v1";
let memory: StudioDraft | null = null;
export function sendStudioDraft(draft: StudioDraft) {
  const { topic, details, taste, treatment } = generationRequestSchema.parse(draft);
  memory = { topic, details, taste, ...(treatment ? { treatment } : {}) };
  // Session-only, same-origin and one-shot. Nothing enters a URL or server log.
  try { sessionStorage.setItem(key, JSON.stringify({ version: 1, draft: memory })); } catch { /* In-memory handoff remains available for client navigation. */ }
}
export function receiveStudioDraft(callback: (draft: StudioDraft) => void) {
  let cancelled = false;
  queueMicrotask(() => {
    if (cancelled) return;
    let candidate: unknown = memory;
    try { const raw = sessionStorage.getItem(key); if (raw && !candidate) { const parsed = JSON.parse(raw); if (parsed.version === 1) candidate = parsed.draft; } sessionStorage.removeItem(key); } catch { /* Unavailable storage or corrupt data is ignored. */ }
    memory = null;
    const parsed = generationRequestSchema.safeParse(candidate);
    if (!cancelled && parsed.success) { const { topic, details, taste, treatment } = parsed.data; callback({ topic, details, taste, ...(treatment ? { treatment } : {}) }); }
  });
  return () => { cancelled = true; };
}
