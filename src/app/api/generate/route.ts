import { generationRequestSchema } from "@/lib/generation/contracts";
import { generationEngine } from "@/server/runtime";
import { IncompleteBriefError } from "@/lib/generation/brief";
// Node.js is the default; an explicit runtime export is incompatible with Cache Components.
export const maxDuration = 45;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!request.headers.get("content-type")?.split(";")[0].trim().match(/^application\/json$/i)) return Response.json({ error: "Send application/json." }, { status: 415, headers });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "A JSON body is required." }, { status: 400, headers });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    let size = 0;
    const read = async () => {
      const chunks: Uint8Array[] = [];
      while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 12288) { void reader.cancel(); return undefined; } chunks.push(value); }
      try { return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)); } catch { return null; }
    };
    const text = await Promise.race([read(), new Promise<never>((_resolve, reject) => { timer = setTimeout(() => { void reader.cancel(); reject(new Error("body-timeout")); }, 2000); })]);
    clearTimeout(timer); timer = undefined;
    if (text === undefined) return Response.json({ error: "Body exceeds 12288 bytes." }, { status: 413, headers });
    if (text === null) return Response.json({ error: "Use valid UTF-8 JSON." }, { status: 400, headers });
    let json: unknown;
    try { json = JSON.parse(text); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400, headers }); }
    const parsed = generationRequestSchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Check the topic, optional details and taste. Combined copy must be at most 2200 characters.", fields: parsed.error.issues.map((issue) => issue.path.join(".")) }, { status: 400, headers });
    const result = await generationEngine().generate(parsed.data);
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof IncompleteBriefError) return Response.json({ code: "brief-incomplete", error: error.message, interpretation: error.interpretation }, { status: 422, headers });
    return Response.json({ error: "The campaign could not be prepared. Your previous result is unchanged. Try again." }, { status: timer ? 408 : 503, headers });
  } finally { if (timer) clearTimeout(timer); }
}
