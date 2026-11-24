import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { generationRequestSchema, creativePlanSchema, type GenerationRequest } from "../src/lib/generation/contracts";
import { designSchema, FORMATS, PRESETS, TASTES } from "../src/lib/design";
import { factualIssues, factualTokens } from "../src/lib/generation/facts";
import { fallbackPlan, planToSpec, validatePlan } from "../src/lib/generation/planner";
import { GenerationEngine, DEFAULT_CONFIG } from "../src/server/engine";
import { createGeminiProvider, ProviderError, type Provider, type ProviderResult } from "../src/server/gemini";

const request: GenerationRequest = { topic: "A robotics workshop for students.", details: "", taste: "minimal-swiss" };
const usage = { inputTokens: 120, outputTokens: 300, thinkingTokens: 0, totalTokens: 420 };
const valid = (input = request): ProviderResult => ({ raw: fallbackPlan(input), usage, finishReason: "STOP" });

test("labelled clean factual cases normalize complete dates, time, currency, identifiers and harmless words", () => {
  const clean = [
    ["date normalization", "Meet on 26 November 2026.", "Meet on 2026-11-26."],
    ["time/currency", "Entry INR 1,200 at 18:30 IST.", "Entry ₹1200 at 6:30 pm IST."],
    ["creative language", "Explore ideas in a workshop.", "Feel free to explore ideas in a workshop."],
    ["harmless substrings", "A gift for the curious.", "A gift for the curious. Discover a discountenance-free creative spirit."],
    ["identifier", "Model XR-210, 12 seats.", "12 seats. Model XR-210."],
  ];
  for (const [label, input, output] of clean) expect(factualIssues(input, output), label).toEqual([]);
  expect(factualTokens("12 seats and 21 teams")).not.toEqual(factualTokens("21 seats and 12 teams, plus 121"));
});

test("labelled violating factual cases reject changed/omitted facts, claims, placeholders and named facts", () => {
  const bad = [
    ["rearranged number", "120 seats.", "210 seats."],
    ["swapped counts", "12 seats and 21 teams.", "21 seats and 12 teams."],
    ["changed date", "26 November 2026.", "2026-11-27."],
    ["changed price", "INR 150.", "₹510."],
    ["altered identifier", "Model AB12.", "Model AB21."],
    ["timezone", "18:30 IST", "18:30 EST"],
    ["invented url", "Robotics workshop.", "Robotics workshop. Visit https://made-up.example"],
    ["omitted fact", "12 seats, entry ₹150.", "12 seats."],
    ["invented offer", "Workshop.", "Workshop. Free entry and guaranteed results."],
    ["unsupported availability", "Announce a planning notebook.", "A planning notebook. Coming soon."],
    ["placeholder", "Event.", "Event at [location], TBD."],
    ["named fact", 'Product name: OrbitPad; launch.', "A new product launch."],
  ];
  for (const [label, input, output] of bad) expect(factualIssues(input, output).length, label).toBeGreaterThan(0);
});

test("fallback is independent, topic-relevant, fact-preserving and renderer-compatible across tastes", () => {
  for (const taste of TASTES) for (const topic of ["A campus poetry circle.", "Launch product XR-210 for ₹1200 on 26 November 2026.", "A Diwali cultural gathering.", "A robotics hackathon with 12 teams.", "No chairs have been supplied.", "<script>alert('x')</script> & a workshop.", "Detailed brief ".repeat(60)]) {
    const input = generationRequestSchema.parse({ topic, taste });
    const plan = fallbackPlan(input), spec = planToSpec(plan, input, "deterministic-fallback");
    expect(designSchema.safeParse(spec).success).toBe(true);
    expect(spec.provenance).toBe("deterministic-fallback");
    expect([spec.campaign.headline, spec.campaign.supportingText].join("\n")).toContain(topic.trim());
    expect(factualTokens(`${spec.campaign.headline}\n${spec.campaign.supportingText}`)).toEqual(factualTokens(topic));
    expect(spec.version).toBe(3);
    if (spec.version === 3) expect(spec.decoration.illustration).not.toBe("cup");
  }
});

test("semantic checks enforce taste, supported combinations, palette, cup relevance and facts", () => {
  const plan = fallbackPlan(request);
  expect(validatePlan(plan, request).issues).toEqual([]);
  expect(validatePlan({ ...plan, taste: "bold-street" }, request).issues).toContain("wrong-taste");
  expect(validatePlan({ ...plan, typography: PRESETS["bold-street"].typography }, request).issues).toContain("unsupported-taste-combination");
  expect(validatePlan({ ...plan, palette: { ...plan.palette, ink: plan.palette.background } }, request).issues).toContain("insufficient-contrast");
  expect(validatePlan({ ...plan, decoration: { ...plan.decoration, illustration: "cup" } }, request).issues).toContain("irrelevant-cup");
  expect(validatePlan({ ...plan, campaign: { ...plan.campaign, headline: "Get 100 free tickets" } }, request).issues.length).toBeGreaterThan(0);
  expect(validatePlan({ ...plan, campaign: { ...plan.campaign, headline: "Welcome to Frost Labs" } }, request).issues).toContain("unsupported-named-entity");
  expect(validatePlan({ html: "<script>" }, request).issues).toEqual(["invalid-structure"]);
  expect(creativePlanSchema.safeParse({ ...plan, composition: { layout: "unknown", spacing: 60 } }).success).toBe(false);
});

test("valid AI, one repair success, repair failure and malformed output have honest provenance", async () => {
  const engine = new GenerationEngine(DEFAULT_CONFIG, async () => valid());
  const ai = await engine.generate(request);
  expect(ai.metadata.source).toBe("gemini"); expect(ai.spec.provenance).toBe("gemini"); expect(ai.metadata.attempts).toHaveLength(1);
  let calls = 0;
  const repaired = await new GenerationEngine(DEFAULT_CONFIG, async ({ repair }) => {
    calls++; if (calls === 1) return { ...valid(), raw: {} };
    expect(repair).toContain("invalid-structure"); return valid();
  }).generate(request);
  expect(repaired.metadata.source).toBe("gemini"); expect(calls).toBe(2);
  calls = 0;
  const failed = await new GenerationEngine(DEFAULT_CONFIG, async () => { calls++; return { ...valid(), raw: {} }; }).generate(request);
  expect(failed.metadata.source).toBe("deterministic-fallback"); expect(failed.metadata.fallbackReason).toBe("validation-failed"); expect(calls).toBe(2);
  const missing = await new GenerationEngine(DEFAULT_CONFIG).generate(request);
  expect(missing.metadata.fallbackReason).toBe("missing-credentials"); expect(missing.metadata.attempts).toEqual([]);
  const explicitLocal = await new GenerationEngine(DEFAULT_CONFIG, async () => { throw new Error("must not call provider"); }).generate({ ...request, mode: "local" });
  expect(explicitLocal.metadata.fallbackReason).toBe("requested-local"); expect(explicitLocal.metadata.attempts).toEqual([]);
});

test("timeout, network, quota and provider failures fall back without retry storms", async () => {
  const timeout = await new GenerationEngine({ ...DEFAULT_CONFIG, timeoutMs: 15, overallMs: 30 }, () => new Promise(() => {})).generate(request);
  expect(timeout.metadata.fallbackReason).toBe("timeout"); expect(timeout.metadata.attempts).toHaveLength(1);
  for (const code of ["network", "provider-rate-limit", "provider-auth", "provider-unavailable", "blocked"] as const) {
    let calls = 0;
    const result = await new GenerationEngine(DEFAULT_CONFIG, async () => { calls++; throw new ProviderError(code); }).generate(request);
    expect(result.metadata.source).toBe("deterministic-fallback"); expect(result.metadata.fallbackReason).toBe(code); expect(calls).toBe(1);
  }
});

test("budgets include repair, duplicate requests coalesce/cache, concurrent capacity is bounded", async () => {
  let calls = 0;
  const repairBudget = await new GenerationEngine({ ...DEFAULT_CONFIG, dailyCalls: 1 }, async () => { calls++; return { ...valid(), raw: {} }; }).generate(request);
  expect(calls).toBe(1); expect(repairBudget.metadata.fallbackReason).toBe("local-budget");
  calls = 0;
  let finish!: (value: ProviderResult) => void;
  const provider: Provider = () => { calls++; return new Promise((resolve) => { finish = resolve; }); };
  const engine = new GenerationEngine({ ...DEFAULT_CONFIG, concurrency: 1 }, provider);
  const first = engine.generate(request), duplicate = engine.generate(request);
  const busy = await engine.generate({ ...request, topic: "Different topic." });
  expect(busy.metadata.fallbackReason).toBe("busy"); expect(calls).toBe(1);
  finish(valid()); await first; expect((await duplicate).metadata.cached).toBe(true);
  expect((await engine.generate(request)).metadata.cached).toBe(true); expect(calls).toBe(1);
  const rpm = new GenerationEngine({ ...DEFAULT_CONFIG, rpm: 1, cacheEntries: 0 }, async ({ request }) => valid(request));
  await rpm.generate(request); expect((await rpm.generate({ ...request, topic: "Different" })).metadata.fallbackReason).toBe("local-budget");
});

test("REST transport uses fixed Google host, header credentials, bounded JSON format and parses actual envelope", async () => {
  const provider = createGeminiProvider({ apiKey: "unit-test-credential", model: DEFAULT_CONFIG.model, maxOutputTokens: 4096,
    fetcher: async (url, options) => {
      expect(String(url)).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent");
      expect((options?.headers as Record<string, string>)["x-goog-api-key"]).toBe("unit-test-credential");
      expect(options?.body).not.toContain("unit-test-credential");
      const body = JSON.parse(String(options?.body));
      expect(body.generationConfig.responseFormat.text.mimeType).toBe("APPLICATION_JSON");
      return Response.json({ candidates: [{ content: { parts: [{ thought: true, text: "not JSON" }, { text: JSON.stringify(fallbackPlan(request)) }] }, finishReason: "STOP" }], usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 300, totalTokenCount: 420 } });
    },
  });
  expect((await provider({ request, signal: new AbortController().signal })).raw).toEqual(fallbackPlan(request));
  for (const [status, code] of [[429, "provider-rate-limit"], [403, "provider-auth"], [500, "provider-unavailable"]] as const) {
    const bad = createGeminiProvider({ apiKey: "unit-test-credential", model: DEFAULT_CONFIG.model, maxOutputTokens: 4096, fetcher: async () => new Response("private provider body", { status }) });
    await expect(bad({ request, signal: new AbortController().signal })).rejects.toThrow(code);
  }
  const malformed = createGeminiProvider({ apiKey: "unit-test-credential", model: DEFAULT_CONFIG.model, maxOutputTokens: 4096, fetcher: async () => Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "not JSON" }] } }] }) });
  await expect(malformed({ request, signal: new AbortController().signal })).rejects.toThrow("invalid-output");
  const echo = createGeminiProvider({ apiKey: "unit-test-credential", model: DEFAULT_CONFIG.model, maxOutputTokens: 4096, fetcher: async () => Response.json({ message: "unit-test-credential" }) });
  await expect(echo({ request, signal: new AbortController().signal })).rejects.toThrow("invalid-output");
});

test("generation HTTP input validation never invokes the provider", async ({ request: http }) => {
  for (const body of [{ topic: " ", taste: "bold-street" }, { topic: "Test", taste: "wrong" }, { topic: "Test", taste: "bold-street", model: "other-provider" }]) expect((await http.post("/api/generate", { data: body })).status()).toBe(400);
  expect((await http.post("/api/generate", { data: "{", headers: { "Content-Type": "application/json" } })).status()).toBe(400);
  expect((await http.post("/api/generate", { data: "x" })).status()).toBe(415);
  expect((await http.post("/api/generate", { data: "x".repeat(13000), headers: { "Content-Type": "application/json" } })).status()).toBe(413);
  const local = await http.post("/api/generate", { data: { ...request, mode: "local" } });
  expect(local.status()).toBe(200);
  const body = await local.json();
  expect(body.metadata.source).toBe("deterministic-fallback"); expect(body.metadata.fallbackReason).toBe("requested-local"); expect(body.metadata.attempts).toEqual([]);
});

test("actual local planner endpoint renders and exports every format without external AI", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await page.getByLabel("What are we creating for?").fill("A campus poetry circle. Everyone is invited to share a poem.");
  await page.getByRole("radio", { name: /Festive Pop/ }).click();
  await page.getByRole("button", { name: "Use local planner" }).click();
  await expect(page.getByText("Local planner · no AI request", { exact: true })).toBeVisible();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  await expect(page.locator('[data-illustration="cup"]')).toHaveCount(0);
  for (const format of FORMATS) {
    const event = page.waitForEvent("download"); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click(); const download = await event;
    const path = testInfo.outputPath(download.suggestedFilename()); await download.saveAs(path);
    const png = readFileSync(path); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([format.width, format.height]);
  }
  const html = page.waitForEvent("download"); await page.getByRole("button", { name: "Export HTML" }).click(); const download = await html; await download.saveAs(testInfo.outputPath(download.suggestedFilename()));
  await page.screenshot({ path: testInfo.outputPath("actual-local-planner-studio.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("studio generation loading, neutral fallback, export, manual provenance and error preservation", async ({ page }, testInfo) => {
  const result = await new GenerationEngine(DEFAULT_CONFIG).generate(request);
  await page.route("**/api/generate", async (route) => { await new Promise((resolve) => setTimeout(resolve, 250)); await route.fulfill({ json: result }); });
  await page.goto("/");
  await page.getByLabel("What are we creating for?").fill(request.topic);
  await page.getByRole("radio", { name: /Minimal Swiss/ }).click();
  await page.getByRole("button", { name: "Generate campaign" }).click();
  await expect(page.getByRole("status")).toContainText("Generating a campaign");
  await expect(page.getByText("Fallback · independent local planner", { exact: true })).toBeVisible();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await expect(page.locator('[data-illustration="cup"]')).toHaveCount(0);
  await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export YouTube thumbnail PNG", exact: true }).click();
  await (await download).saveAs(testInfo.outputPath("fallback-youtube.png"));
  await page.screenshot({ path: testInfo.outputPath("fallback-studio.png"), fullPage: true });
  await page.getByText("Edit campaign copy", { exact: true }).click();
  await page.getByLabel("Call to action", { exact: false }).fill("Come say hello");
  await page.getByRole("button", { name: "Apply copy to campaign" }).click();
  await expect(page.getByText("Manual edits · no new AI request", { exact: true })).toBeVisible();
  const headline = await page.locator("[data-poster] h2").first().textContent();
  await page.unroute("**/api/generate"); await page.route("**/api/generate", (route) => route.fulfill({ status: 503, json: { error: "unavailable" } }));
  await page.getByRole("button", { name: "Generate campaign" }).click();
  await expect(page.getByRole("status")).toContainText("previous campaign is preserved");
  expect(await page.locator("[data-poster] h2").first().textContent()).toBe(headline);
});

test("late generation responses cannot overwrite a newer brief/taste", async ({ page }) => {
  const result = await new GenerationEngine(DEFAULT_CONFIG).generate(request);
  await page.route("**/api/generate", async (route) => { await new Promise((resolve) => setTimeout(resolve, 500)); await route.fulfill({ json: result }).catch(() => {}); });
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill(request.topic);
  await page.getByRole("button", { name: "Generate campaign" }).click();
  await page.getByLabel("What are we creating for?").fill("A newer poetry event.");
  await page.getByRole("radio", { name: /Festive Pop/ }).click();
  await page.waitForTimeout(700);
  await expect(page.getByLabel("What are we creating for?")).toHaveValue("A newer poetry event.");
  await expect(page.getByRole("radio", { name: "Festive Pop" })).toBeChecked();
  await expect(page.locator("[data-poster]")).toHaveCount(0);
  await expect(page.getByText("Fallback · independent local planner", { exact: true })).toHaveCount(0);
});
