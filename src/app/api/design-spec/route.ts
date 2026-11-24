import { createDesign, FORMATS, inputSchema } from "@/lib/design";
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Send application/json." }, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "A JSON body is required." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 8192) {
      await reader.cancel();
      return Response.json({ error: "Body exceeds 8192 bytes." }, { status: 413 });
    }
    chunks.push(value);
  }
  let json: unknown;
  try { json = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks))); }
  catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const result = inputSchema.safeParse(json);
  if (!result.success) return Response.json({ error: "Invalid design input.", issues: result.error.issues }, { status: 400 });
  const spec = createDesign(result.data);
  return Response.json({ aiUsed: false, mode: spec.provenance, spec, formats: FORMATS });
}
