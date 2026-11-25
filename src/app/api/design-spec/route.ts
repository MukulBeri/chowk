import { createDesign, FORMATS, inputSchema } from "@/lib/design";
import { JsonBodyError, readJsonBody } from "@/server/json-body";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const json = await readJsonBody(request, 8192);
    const result = inputSchema.safeParse(json);
    if (!result.success) return Response.json({ error: "Invalid design input.", issues: result.error.issues }, { status: 400, headers });
    const spec = createDesign(result.data);
    return Response.json({ aiUsed: false, mode: spec.provenance, spec, formats: FORMATS }, { headers });
  } catch (error) {
    if (error instanceof JsonBodyError) return Response.json({ error: error.message }, { status: error.status, headers });
    return Response.json({ error: "The design could not be prepared." }, { status: 503, headers });
  }
}
