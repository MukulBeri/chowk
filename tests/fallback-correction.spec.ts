import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { designSchema, FORMATS, TASTES } from "../src/lib/design";
import { fallbackPlan, planToSpec } from "../src/lib/generation/planner";
import { IncompleteBriefError } from "../src/lib/generation/brief";
import { incompleteBriefResponseSchema, type GenerationRequest } from "../src/lib/generation/contracts";
import { factualIssues } from "../src/lib/generation/facts";
import { DEFAULT_CONFIG, GenerationEngine } from "../src/server/engine";

const instructions = [
  "No business name, date or price has been supplied.", "No schedule or price has been supplied.",
  "Do not invent event logistics.", "I have not supplied what, when or where yet.",
];
const input: GenerationRequest = { topic: "A campus robotics workshop for first-year engineering students.", details: "No schedule or price has been supplied. No tickets are required.", taste: "minimal-swiss", mode: "local" };

test("observed instructions stay in metadata, without topic duplication, across all tastes", () => {
  for (const taste of TASTES) for (const details of instructions) {
    const request = { ...input, taste, details }, plan = fallbackPlan(request);
    expect(plan.campaign.headline).toBe("Campus robotics workshop");
    expect(plan.campaign.supportingText).toBe(request.topic);
    expect(`${plan.campaign.headline}\n${plan.campaign.supportingText}`).not.toContain(details);
    expect([...plan.interpretation.assumptions, ...plan.interpretation.missingInformation].join("\n")).toContain(details);
    expect(designSchema.safeParse(planToSpec(plan, request, "deterministic-fallback")).success).toBe(true);
  }
});

test("negative factual statements and specific facts remain public, including mixed missing-info clauses", () => {
  const facts = [
    "No chairs have been supplied.", "No entry fee.", "No tickets are required.", "No parking is available.",
    "The venue is not confirmed.", "The event is not on 26 November 2026.", "Do not park outside the venue.",
    "No refunds after 26 November 2026.", "Product XR-210 has no subscription fee.", "No date changes are permitted.",
    "No business name, date or price has been supplied by the organizer to attendees.",
    "Do not invent event logistics, entry is ₹150.", "Use bold typography for product XR-210.",
  ];
  for (const fact of facts) {
    const request = { ...input, details: fact }, plan = fallbackPlan(request);
    expect(plan.campaign.supportingText, fact).toBe(`${request.topic}\n${fact}`);
    expect(factualIssues(`${request.topic}\n${fact}`, `${plan.campaign.headline}\n${plan.campaign.supportingText}`), fact).toEqual([]);
    expect(fallbackPlan({ ...input, topic: fact, details: "" }).campaign.headline).toBe(fact);
  }
  const mixed = fallbackPlan({ ...input, details: "No schedule or price has been supplied; Entry ₹150. Venue: Lab A; registration at https://example.org/workshop" });
  expect(mixed.campaign.supportingText).toBe(`${input.topic}\nEntry ₹150.\nVenue: Lab A; registration at https://example.org/workshop`);
  expect(mixed.interpretation.missingInformation.join(" ")).toContain("No schedule or price has been supplied");
  const labelled = fallbackPlan({ ...input, details: "Public copy: Do not invent event logistics." });
  expect(labelled.campaign.supportingText).toBe(`${input.topic}\nDo not invent event logistics.`);
});

test("instructions in topic and incomplete requests do not produce pretend campaigns or spend quota", async () => {
  for (const topic of [...instructions, "Help me announce something.", "Create a poster.", "I need a campaign."]) {
    const request = { ...input, topic, details: "" };
    expect(() => fallbackPlan(request)).toThrow(IncompleteBriefError);
    let providerCalls = 0;
    const engine = new GenerationEngine(DEFAULT_CONFIG, async () => { providerCalls++; throw new Error("provider must not run"); });
    await expect(engine.generate({ ...request, mode: "auto" })).rejects.toBeInstanceOf(IncompleteBriefError);
    expect(providerCalls).toBe(0);
  }
  const plan = fallbackPlan({ ...input, topic: "Help me announce something.", details: "A campus poetry circle. No tickets are required." });
  expect(plan.campaign.headline).toBe("Campus poetry circle"); expect(plan.campaign.supportingText).toBe("A campus poetry circle.\nNo tickets are required.");
  expect(fallbackPlan({ ...input, topic: "Create a poster for a robotics workshop.", details: "" }).campaign.headline).toBe("Robotics workshop");
  expect(fallbackPlan({ ...input, details: input.topic }).campaign.supportingText).toBe(input.topic);
  expect(fallbackPlan({ ...input, details: `${input.topic} Entry ₹150.` }).campaign.supportingText).toBe(`${input.topic}\nEntry ₹150.`);
});

test("replay saved pre-correction inputs separately from historical measured evidence", async ({}, testInfo) => {
  const before = JSON.parse(readFileSync("docs/evidence/m1/correction/before.json", "utf8")), records = [];
  for (const record of before.records as { request: GenerationRequest }[]) {
    try {
      const result = await new GenerationEngine(DEFAULT_CONFIG, async () => { throw new Error("no provider calls permitted"); }).generate({ ...record.request, mode: "local" });
      expect(result.metadata.attempts).toEqual([]); expect(result.metadata.source).toBe("deterministic-fallback");
      records.push({ request: record.request, status: "campaign-prepared", result });
    } catch (error) {
      if (!(error instanceof IncompleteBriefError)) throw error;
      records.push({ request: record.request, status: "brief-incomplete", error: error.message, interpretation: error.interpretation });
    }
  }
  expect(records.filter((record) => record.status === "brief-incomplete")).toHaveLength(5);
  writeFileSync(testInfo.outputPath("after.json"), JSON.stringify({ date: "2026-11-24", kind: "Corrected independent local planner replay; zero Gemini calls; historical live records unchanged", records }, null, 2) + "\n");
});

test("actual corrected local API, studio and four native exports preserve facts and warn about missing input", async ({ page }, testInfo) => {
  const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill(input.topic);
  await page.getByLabel("Optional details").fill(input.details); await page.getByRole("button", { name: /Minimal Swiss/ }).click();
  const responseEvent = page.waitForResponse((response) => response.url().endsWith("/api/generate"));
  await page.getByRole("button", { name: "Use local planner" }).click();
  const response = await responseEvent, result = await response.json();
  expect(response.status()).toBe(200); expect(result.metadata.attempts).toEqual([]); expect(result.metadata.fallbackReason).toBe("requested-local");
  expect(result.spec.campaign.supportingText).toBe(`${input.topic}\nNo tickets are required.`);
  await expect(page.getByText("Fallback · independent local planner", { exact: true })).toBeVisible();
  await expect(page.locator(".generation-provenance")).toContainText("No schedule or price has been supplied.");
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4); await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  for (const poster of await page.locator("[data-poster]").all()) {
    await expect(poster).toContainText("No tickets are required."); await expect(poster).not.toContainText("No schedule or price has been supplied.");
  }
  const exports = [];
  for (const format of FORMATS) {
    const event = page.waitForEvent("download"); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
    const download = await event, path = testInfo.outputPath(download.suggestedFilename()); await download.saveAs(path);
    const png = readFileSync(path), dimensions = [png.readUInt32BE(16), png.readUInt32BE(20)]; expect(dimensions).toEqual([format.width, format.height]);
    exports.push({ file: download.suggestedFilename(), dimensions, bytes: png.length });
  }
  const htmlEvent = page.waitForEvent("download"); await page.getByRole("button", { name: "Export HTML" }).click();
  const html = await htmlEvent; await html.saveAs(testInfo.outputPath(html.suggestedFilename()));
  const htmlText = readFileSync(testInfo.outputPath(html.suggestedFilename()), "utf8"); expect(htmlText).toContain("No tickets are required."); expect(htmlText).not.toContain("No schedule or price has been supplied.");
  await page.screenshot({ path: testInfo.outputPath("corrected-local-studio.png"), fullPage: true });
  writeFileSync(testInfo.outputPath("actual-local-result.json"), JSON.stringify({ request: input, status: response.status(), result, exports, html: html.suggestedFilename(), screenshot: "corrected-local-studio.png" }, null, 2) + "\n");
  const previous = await page.locator("[data-poster] h2").first().textContent();
  await page.getByLabel("What are we creating for?").fill("Help me announce something."); await page.getByLabel("Optional details").fill("I have not supplied what, when or where yet.");
  const incompleteEvent = page.waitForResponse((response) => response.url().endsWith("/api/generate")); await page.getByRole("button", { name: "Use local planner" }).click();
  const incomplete = await incompleteEvent; expect(incomplete.status()).toBe(422); expect(incompleteBriefResponseSchema.safeParse(await incomplete.json()).success).toBe(true);
  await expect(page.getByRole("status")).toContainText("Tell us what you are announcing");
  await expect(page.getByRole("note", { name: "Incomplete brief" })).toContainText("I have not supplied what, when or where yet.");
  expect(await page.locator("[data-poster] h2").first().textContent()).toBe(previous); expect(errors).toEqual([]);
});
