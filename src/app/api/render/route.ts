import { generationRequestSchema } from "@/lib/generation/contracts";
import { IncompleteBriefError } from "@/lib/generation/brief";
import { generationEngine } from "@/server/runtime";
import { JsonBodyError, readJsonBody } from "@/server/json-body";
import { renderCampaignDocument } from "@/server/render-document";

export const maxDuration = 45;
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Campaign-Inference": process.env.GEMINI_ENABLED === "true" ? "enabled" : "disabled" };
  try {
    const parsed = generationRequestSchema.safeParse(await readJsonBody(request, 12288));
    if (!parsed.success) return Response.json({ error: "Check the topic, optional details and taste. Combined copy must be at most 2200 characters.", fields: parsed.error.issues.map(issue => issue.path.join(".")) }, { status: 400, headers });
    // One shared engine invocation, never a separate model call per format.
    const result = await generationEngine().generate(parsed.data);
    const document = await renderCampaignDocument(result.spec);
    const body = JSON.stringify({ ...result, ...document });
    if (Buffer.byteLength(body, "utf8") > 2000000) return Response.json({ error: "Campaign response exceeds its resource bound." }, { status: 413, headers });
    return new Response(body, { headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
  } catch (error) {
    if (error instanceof JsonBodyError) return Response.json({ error: error.message }, { status: error.status, headers });
    if (error instanceof IncompleteBriefError) return Response.json({ code: "brief-incomplete", error: error.message, interpretation: error.interpretation }, { status: 422, headers });
    return Response.json({ error: "The campaign HTML could not be prepared. No unverified export is available." }, { status: 503, headers });
  }
}
