import { generationRequestSchema } from "@/lib/generation/contracts";
import { generationEngine } from "@/server/runtime";
import { IncompleteBriefError } from "@/lib/generation/brief";
import { JsonBodyError, readJsonBody } from "@/server/json-body";
// Node.js is the default; an explicit runtime export is incompatible with Cache Components.
export const maxDuration = 45;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Campaign-Inference": process.env.GEMINI_ENABLED === "true" ? "enabled" : "disabled" };
  try {
    const json = await readJsonBody(request, 12288);
    const parsed = generationRequestSchema.safeParse(json);
    if (!parsed.success) return Response.json({ error: "Check the topic, optional details and taste. Combined copy must be at most 2200 characters.", fields: parsed.error.issues.map((issue) => issue.path.join(".")) }, { status: 400, headers });
    const result = await generationEngine().generate(parsed.data);
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof JsonBodyError) return Response.json({ error: error.message }, { status: error.status, headers });
    if (error instanceof IncompleteBriefError) return Response.json({ code: "brief-incomplete", error: error.message, interpretation: error.interpretation }, { status: 422, headers });
    return Response.json({ error: "The campaign could not be prepared. Your previous result is unchanged. Try again." }, { status: 503, headers });
  }
}
