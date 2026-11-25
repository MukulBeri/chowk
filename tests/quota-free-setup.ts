import { request, type FullConfig } from "@playwright/test";

export default async function quotaFreeSetup(config: FullConfig) {
  const context = await request.newContext({ baseURL: String(config.projects[0].use.baseURL ?? "http://localhost:3000") });
  try {
    // Source-proven provider-independent probe. Never use auto mode to discover
    // whether the server is safe. Fail before any test when policy is unknown.
    const response = await context.post("/api/generate", { data: { topic: "Quota-free test readiness check.", taste: "minimal-swiss", mode: "local" } });
    if (!response.ok() || response.headers()["x-campaign-inference"] !== "disabled") throw new Error("Quota-free tests require the existing local server started with GEMINI_ENABLED=false. No auto/live probe was dispatched.");
    const result = await response.json();
    if (result.metadata.attempts.length || result.metadata.model !== null) throw new Error("Local readiness probe unexpectedly contains provider attempts; stop.");
  } finally { await context.dispose(); }
}
