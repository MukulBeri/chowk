import { test, expect } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createGeminiProvider, type ProviderRequest } from "../src/server/gemini";
import { GenerationEngine, DEFAULT_CONFIG } from "../src/server/engine";
import { generationRequestSchema, type GenerationResult } from "../src/lib/generation/contracts";
import { FORMATS } from "../src/lib/design";
import { validatePlan } from "../src/lib/generation/planner";
const cases = [
  { id: "campus-launch", topic: "Chai stall opening near campus.", details: "An invitation for students. No business name, date or price has been supplied.", taste: "bold-street" },
  { id: "technical-workshop", topic: "A campus robotics workshop for first-year engineering students.", details: "Focus on learning together. No schedule or price has been supplied.", taste: "minimal-swiss" },
  { id: "product-announcement", topic: 'Announce a planning notebook called "OrbitPad".', details: "No price, launch date or special product characteristics have been supplied.", taste: "festive-pop" },
  { id: "cultural-evening", topic: "A cultural evening of music and dance for the campus community.", details: "An invitation to gather. Do not invent event logistics.", taste: "bold-street" },
  { id: "vague-brief", topic: "Help me announce something.", details: "I have not supplied what, when or where yet.", taste: "minimal-swiss" },
  { id: "fact-sensitive", topic: "Robotics workshop for 12 teams on 26 November 2026 at 18:30 IST. Entry ₹150.", details: "Venue: Lab A; registration at https://example.org/workshop", taste: "festive-pop" },
];
const dir = "docs/evidence/m1";
const records: unknown[] = [];
for (const model of ["gemini-3.5-flash-lite", "gemini-3.8-flash"]) {
  test(`${model}: six synthetic public briefs, actual REST measurements`, async () => {
    // Only explicit native-provider measurements read the configured server key.
    loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
    const key = process.env.GEMINI_API_KEY?.trim(); expect(Boolean(key), "Configured server-side key required for explicit live evaluation").toBe(true);
    const comparison = model === "gemini-3.8-flash";
    const metadata = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}`, { headers: { "x-goog-api-key": key! }, signal: AbortSignal.timeout(15000) });
    const modelInfo = metadata.ok ? await metadata.json() : {};
    const availability = { model, status: metadata.status, supportsGenerateContent: Array.isArray(modelInfo.supportedGenerationMethods) && modelInfo.supportedGenerationMethods.includes("generateContent") };
    console.log(JSON.stringify({ modelAvailability: availability }));
    if (!metadata.ok || !availability.supportsGenerateContent) { records.push({ availability, skipped: "Model metadata/compatibility unavailable; no silent substitute." }); mkdirSync(dir, { recursive: true }); writeFileSync(`${dir}/live-models.json`, JSON.stringify({ date: "2026-11-24", kind: "live REST evaluation; not mocks", records }, null, 2)); return; }
    let lastStart = 0;
    const transport = createGeminiProvider({ apiKey: key!, model, maxOutputTokens: 4096 });
    const spaced = async (input: ProviderRequest) => {
      const delay = Math.max(0, (comparison ? 16000 : 5000) - (Date.now() - lastStart));
      if (delay) await new Promise<void>((resolve, reject) => { const timer = setTimeout(resolve, delay); input.signal.addEventListener("abort", () => { clearTimeout(timer); reject(new Error("aborted")); }, { once: true }); });
      lastStart = Date.now(); return transport(input);
    };
    const engine = new GenerationEngine({ ...DEFAULT_CONFIG, model, rpm: comparison ? 4 : 8, dailyCalls: comparison ? 12 : 100, timeoutMs: 25000, overallMs: 40000 }, spaced);
    let campaignStart = 0;
    for (const item of cases) {
      const pause = Math.max(0, (comparison ? 32000 : 16000) - (Date.now() - campaignStart));
      if (pause) await new Promise((resolve) => setTimeout(resolve, pause));
      campaignStart = Date.now();
      const request = generationRequestSchema.parse(item.id ? { topic: item.topic, details: item.details, taste: item.taste } : item);
      const result = await engine.generate(request);
      records.push({ id: item.id, availability, request, result, review: "Automated structural/semantic outcome only; human review recorded separately." });
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${dir}/live-models.json`, JSON.stringify({ date: "2026-11-24", kind: "live REST evaluation; synthetic input facts, not real events/products", costObservation: "Owner reports free-tier project; requests returned no bill amount. Dashboard billing not inspected.", records }, null, 2) + "\n");
      console.log(JSON.stringify({ evaluatedModel: model, brief: item.id, ...result.metadata }));
      expect(result.spec.version).toBe(2);
    }
  });
}
test("live browser end-to-end and native PNG/HTML/JSON evidence", async ({ page }, testInfo) => {
  const request = JSON.parse(readFileSync("docs/example-generation-request.json", "utf8"));
  await page.goto("/");
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await page.getByLabel("What are we creating for?").fill(request.topic);
  await page.getByLabel("Optional details").fill(request.details);
  await expect(page.getByLabel("What are we creating for?")).toHaveValue(request.topic);
  const responseEvent = page.waitForResponse((response) => response.url().endsWith("/api/generate") && response.request().method() === "POST", { timeout: 45000 });
  await page.getByRole("button", { name: "Generate campaign" }).click();
  const response = await responseEvent, data = await response.json() as GenerationResult;
  expect(response.request().postDataJSON()).toEqual({ ...request, mode: "auto" });
  expect(response.ok()).toBe(true);
  mkdirSync(dir, { recursive: true });
  const historyPath = `${dir}/live-browser-attempts.json`;
  const history = existsSync(historyPath) ? JSON.parse(readFileSync(historyPath, "utf8")) : [];
  if (!history.length && existsSync(`${dir}/live-browser.json`)) history.push(JSON.parse(readFileSync(`${dir}/live-browser.json`, "utf8")));
  history.push({ date: "2026-11-24", request, result: data });
  writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
  writeFileSync(`${dir}/live-browser.json`, JSON.stringify({ date: "2026-11-24", request, result: data }, null, 2) + "\n");
  console.log(JSON.stringify({ liveBrowser: data.metadata }));
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath(`${data.metadata.source}-studio.png`), fullPage: true });
  for (const format of FORMATS) {
    const event = page.waitForEvent("download"); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
    const download = await event; const path = testInfo.outputPath(download.suggestedFilename()); await download.saveAs(path);
    const png = readFileSync(path); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([format.width, format.height]);
  }
  const html = page.waitForEvent("download"); await page.getByRole("button", { name: "Export HTML" }).click(); const download = await html; await download.saveAs(testInfo.outputPath(download.suggestedFilename()));
  await page.getByRole("button", { name: "Inspect spec" }).click(); const json = page.waitForEvent("download"); await page.getByRole("button", { name: "Download JSON" }).click(); const spec = await json; await spec.saveAs(testInfo.outputPath("live-design-spec.json"));
  expect(data.metadata.source, "A fallback response is not counted as successful live AI").toBe("gemini");
});

test("retained live plan final-guard review without new API calls", () => {
  const matrix = JSON.parse(readFileSync(`${dir}/live-models.json`, "utf8"));
  const reviews = matrix.records.filter((row: { result: GenerationResult }) => row.result?.metadata.source === "gemini").map((row: { id: string; request: unknown; result: GenerationResult }) => {
    const spec = row.result.spec;
    const { topic: _topic, ...campaign } = spec.campaign;
    void _topic;
    const plan = { interpretation: row.result.interpretation, taste: spec.taste, campaign, palette: spec.palette, typography: spec.typography, composition: spec.composition, decoration: spec.decoration, rationale: spec.rationale };
    const result = validatePlan(plan, generationRequestSchema.parse(row.request));
    expect(result.issues, row.id).toEqual(row.id === "product-announcement" ? ["unsupported-timing-claim"] : []);
    return { id: row.id, acceptedAtMeasurement: true, finalGuardIssues: result.issues,
      humanReview: row.id === "product-announcement" ? "Relevant notebook concept/name retained, but unsupplied Coming soon availability was added. Final guard now flags it; no live repair is claimed." : "Relevant copy/taste and explicit facts retained in this synthetic case; modest preset-based style variation. Not an artistic-quality guarantee." };
  });
  writeFileSync(`${dir}/final-review.json`, JSON.stringify({ kind: "Human review plus deterministic final-guard recheck of retained live outputs; no API calls", reviews }, null, 2) + "\n");
  expect(reviews).toHaveLength(4);
});

test("retained live campaigns: three tastes replayed through browser and all native exports (no API calls)", async ({ page }, testInfo) => {
  const matrix = JSON.parse(readFileSync(`${dir}/live-models.json`, "utf8"));
  for (const id of ["technical-workshop", "cultural-evening", "fact-sensitive"]) {
    const row = matrix.records.find((item: { id: string; result: GenerationResult }) => item.id === id && item.result.metadata.source === "gemini");
    await page.route("**/api/generate", (route) => route.fulfill({ json: row.result }));
    await page.goto("/"); await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
    await page.getByLabel("What are we creating for?").fill(row.request.topic); await page.getByLabel("Optional details").fill(row.request.details);
    const names = { "bold-street": "Bold Street", "minimal-swiss": "Minimal Swiss", "festive-pop": "Festive Pop" };
    await page.getByRole("button", { name: new RegExp(names[row.request.taste as keyof typeof names]) }).click();
    await page.getByRole("button", { name: "Generate campaign" }).click();
    await expect(page.getByText(new RegExp(`AI · ${row.result.metadata.model}`))).toBeVisible();
    await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
    await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
    const bounds = await page.locator('[data-poster]').evaluateAll((nodes) => nodes.every((node) => {
      const outer = node.getBoundingClientRect();
      return Array.from(node.querySelectorAll<HTMLElement>('[data-fit]')).every((text) => {
        const r = text.getBoundingClientRect();
        return r.left >= outer.left - 1 && r.right <= outer.right + 1 && r.top >= outer.top - 1 && r.bottom <= outer.bottom + 1 && text.scrollWidth <= text.clientWidth + 1 && text.scrollHeight <= text.clientHeight + 1;
      });
    }));
    expect(bounds).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`replayed-live-${id}-studio.png`), fullPage: true });
    for (const format of FORMATS) {
      const event = page.waitForEvent("download"); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
      const download = await event, path = testInfo.outputPath(`replayed-live-${id}-${format.id}.png`); await download.saveAs(path);
      const png = readFileSync(path); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([format.width, format.height]);
    }
    const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Export HTML" }).click(); const download = await event; await download.saveAs(testInfo.outputPath(`replayed-live-${id}.html`));
    await page.unroute("**/api/generate");
  }
});
