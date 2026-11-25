import { test, expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { relative } from "node:path";
import { pathToFileURL } from "node:url";
import { FORMATS, PRESETS } from "../src/lib/design";
import { generationResultSchema, type GenerationRequest } from "../src/lib/generation/contracts";
import { factualTokens, factualIssues } from "../src/lib/generation/facts";

const campaigns: (GenerationRequest & { id: string })[] = [
  { id: "A-robotics", topic: "Campus robotics workshop for students.", details: "12 teams. 26 November 2026 at 18:30 IST. Venue: Lab A; Entry ₹150. Register at https://example.org/workshop.", taste: "minimal-swiss", mode: "auto" },
  { id: "B-environment", topic: "Campaign to reduce plastic waste.", details: "Encourage people to bring a reusable bottle. No supplied statistics, organization name or event date.", taste: "bold-street", mode: "auto" },
];
const localPath = (file: string) => relative(process.cwd(), file).replaceAll("\\", "/");
async function difference(page: Page, a: Buffer, b: Buffer, delta: number) {
  return page.evaluate(async ({ first, second, delta }) => {
    const imgs = await Promise.all([first, second].map(async data => { const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode(); return img; }));
    if (imgs[0].width !== imgs[1].width || imgs[0].height !== imgs[1].height) return { ratio: 1, changed: -1, dimensionsMatch: false };
    const bytes = imgs.map(img => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, c.width, c.height).data; });
    let changed = 0; for (let i = 0; i < bytes[0].length; i += 4) if ([0, 1, 2, 3].some(ch => Math.abs(bytes[0][i + ch] - bytes[1][i + ch]) > delta)) changed++;
    return { ratio: changed / (imgs[0].width * imgs[0].height), changed, dimensionsMatch: true };
  }, { first: a.toString("base64"), second: b.toString("base64"), delta });
}

test("exactly two authorized live studio campaigns; never repeat an existing journal", async ({ page, context }, info) => {
  expect(process.env.M4_LIVE_AUTHORIZED).toBe("two-campaigns-four-calls");
  const configuration = readFileSync(".env.local", "utf8");
  const secrets = configuration.split(/\r?\n/).flatMap(line => { const m = line.match(/^\s*[A-Z_]*(?:KEY|TOKEN|SECRET|PASSWORD)\s*=\s*(.+?)\s*$/), value = m?.[1].replace(/^["']|["']$/g, ""); return value && value.length >= 8 ? [value] : []; });
  const model = (configuration.match(/^\s*GEMINI_MODEL\s*=\s*([^\r\n#]+)/m)?.[1] ?? "gemini-3.5-flash-lite").trim().replace(/^["']|["']$/g, "");
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(model)) throw new Error("Configured model identifier withheld: unexpected syntax.");
  const records: Record<string, unknown>[] = [];
  const journal = { date: "2026-11-25", kind: "Fresh actual studio /api/generate requests with unchanged configured provider; no response mocks/replays/retries", phase: "started", configuredModelFromLocalFile: model,
    maximumCampaignRequests: 2, maximumProviderCalls: 4, maximumAttemptsPerCampaign: 2,
    callAccountingBasis: "Audited engine has at most two attempts; each attempt calls a transport with one native fetch and no retry loop. Completed uncached attempt metadata accounts for provider invocations. Unknown/interrupted requests reserve two calls and are never retried.",
    usageLimitation: "Application defaults absent usage counters to zero. Positive counters establish returned values; zero/missing fields are not proof of zero use/cost. Billing/cost is unavailable.",
    records, campaignRequestsDispatched: 0, completedAttemptCalls: 0, conservativeReservedMaximum: 0, unexpectedGenerationRequestsBlocked: 0, completed: false };
  const journalPath = "docs/evidence/m4/live/journal.json";
  mkdirSync("docs/evidence/m4/live", { recursive: true });
  const safeText = (value: unknown) => { const text = JSON.stringify(value, null, 2); if (secrets.some(secret => text.includes(secret))) throw new Error("Sensitive value withheld from verification evidence."); return text + "\n"; };
  writeFileSync(journalPath, safeText(journal), { flag: "wx" });
  const save = () => writeFileSync(journalPath, safeText(journal));
  let active = -1;
  await context.route("**/api/generate", async route => {
    const expected = campaigns[active], body = route.request().postDataJSON();
    if (!expected || route.request().method() !== "POST" || journal.campaignRequestsDispatched >= 2 || body.topic !== expected.topic || body.details !== expected.details || body.taste !== expected.taste || body.mode !== "auto") {
      journal.unexpectedGenerationRequestsBlocked++; save(); await route.abort(); return;
    }
    journal.campaignRequestsDispatched++; journal.conservativeReservedMaximum += 2;
    if (journal.conservativeReservedMaximum > 4) { save(); await route.abort(); throw new Error("Four-call boundary reached; stop."); }
    records[active].dispatch = "Application request dispatched once; do not retry if interrupted"; save(); await route.continue();
  });
  for (let index = 0; index < campaigns.length; index++) {
    const input = campaigns[index]; active = index;
    const record: Record<string, unknown> = { id: input.id, request: input, state: "not dispatched", errors: [] as string[] }; records.push(record); save();
    await page.goto("/"); await page.getByLabel("What are we creating for?").fill(input.topic); await page.getByLabel("Optional details").fill(input.details);
    await page.getByRole("radio", { name: PRESETS[input.taste].name, exact: true }).check();
    const event = page.waitForResponse(r => r.url().endsWith("/api/generate") && r.request().method() === "POST", { timeout: 55_000 });
    const started = Date.now(); record.state = "generation pending"; save();
    await page.getByRole("button", { name: "Generate campaign", exact: false }).click();
    let result;
    try {
      const response = await event; record.httpStatus = response.status(); record.browserResponseWallMs = Date.now() - started;
      const payload = await response.json(); safeText(payload); const parsed = generationResultSchema.safeParse(payload);
      if (!parsed.success) { record.state = "Unexpected application response; raw body withheld; up to two provider calls reserved"; (record.errors as string[]).push("APPLICATION_RESPONSE_INVALID"); save(); continue; }
      result = parsed.data; record.result = result; record.providerCalls = result.metadata.attempts.length;
      journal.completedAttemptCalls += result.metadata.attempts.length;
      expect(result.metadata.attempts.length).toBeLessThanOrEqual(2); expect(journal.completedAttemptCalls).toBeLessThanOrEqual(4);
      record.initialOutcome = result.metadata.attempts[0]?.outcome ?? "no provider attempt";
      record.repairAttempted = result.metadata.attempts.length === 2; record.repairOutcome = result.metadata.attempts[1]?.outcome ?? null;
      record.actualModel = result.metadata.model; record.freshProviderInvoked = !result.metadata.cached && result.metadata.attempts.length > 0;
      record.acceptedFreshModelPlan = !result.metadata.cached && result.metadata.source === "gemini" && result.metadata.attempts.at(-1)?.outcome === "accepted";
      record.state = "Response preserved; no further generation for this campaign"; save();
    } catch { record.state = "Interrupted application response; exact provider count uncertain, two calls reserved; no retry"; (record.errors as string[]).push("APPLICATION_RESPONSE_UNCERTAIN"); save(); continue; }
    const copy = [result.spec.campaign.eyebrow, result.spec.campaign.headline, result.spec.campaign.supportingText, result.spec.campaign.cta ?? ""].join("\n");
    record.copyAssessment = { suppliedTokens: factualTokens(input.topic + "\n" + input.details), outputTokens: factualTokens(copy), safeguardIssues: factualIssues(input.topic + "\n" + input.details, copy),
      missingDeclarationInArtwork: /\bno supplied\b|\b(?:has|have) (?:not )?been (?:supplied|provided)\b|\bdo not invent\b/i.test(copy),
      subjectAndActionManualReviewRequired: true, modelAcceptanceDistinctFromApplicationExport: true };
    const native = new Map<string, Buffer>(); const outputs: Record<string, unknown>[] = []; record.outputs = outputs; save();
    try {
      await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4, { timeout: 30_000 });
      record.readyWallMs = Date.now() - started;
      record.quality = await page.locator("[data-poster]").evaluateAll(nodes => nodes.map(node => {
        const fields = Array.from(node.querySelectorAll<HTMLElement>("[data-fit]"));
        return { format: node.getAttribute("data-poster"), ready: node.getAttribute("data-ready"), overflow: node.getAttribute("data-overflow"), issues: JSON.parse(node.getAttribute("data-quality") ?? "[]"), corrections: JSON.parse(node.getAttribute("data-corrections") ?? "[]"),
          visibleCopy: fields.map(f => f.querySelector("[data-copy-group]") ? Array.from(f.querySelectorAll("[data-copy-group]")).map(p => p.textContent).join("\n") : f.textContent).join("\n"),
          visualPresent: node.querySelector("[data-hero]")?.getAttribute("data-illustration") ?? null, fontsStatus: document.fonts.status,
          fields: fields.map(f => ({ role: f.dataset.role, pixels: parseFloat(getComputedStyle(f).fontSize), minimum: Number(f.dataset.min), horizontalFit: f.scrollWidth <= f.clientWidth + 1, verticalFit: f.scrollHeight <= f.clientHeight + 1, family: getComputedStyle(f).fontFamily })) };
      }));
      record.fontAndFitWarnings = await page.locator(".poster-quality").allTextContents();
      const studio = info.outputPath(`${input.id}-studio.png`); await page.screenshot({ path: studio, fullPage: true }); record.studioScreenshot = localPath(studio);
      for (const format of FORMATS) {
        const node = page.locator(`[data-poster="${format.id}"]`);
        if (await node.getAttribute("data-overflow") === "true") { outputs.push({ format: format.id, refused: true, reason: "Existing measured quality refusal preserved" }); save(); continue; }
        const download = page.waitForEvent("download", { timeout: 20_000 }); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
        const file = info.outputPath(`${input.id}-${format.id}.png`); await (await download).saveAs(file); const bytes = readFileSync(file);
        const dimensions = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]; expect(dimensions).toEqual([format.width, format.height]);
        const output: Record<string, unknown> = { format: format.id, png: localPath(file), dimensions, bytes: bytes.length }; outputs.push(output); save();
        await page.setViewportSize({ width: 2000, height: 1450 });
        await node.evaluate(root => { const clone = root.cloneNode(true) as HTMLElement; clone.dataset.nativeCapture = "true"; Object.assign(clone.style, { position: "fixed", left: "0", top: "0", zIndex: "99999" }); document.body.append(clone); });
        try {
          const file = info.outputPath(`${input.id}-${format.id}-native-dom.png`); const capture = await page.locator('[data-native-capture="true"]').screenshot({ path: file }); native.set(format.id, capture);
          const comparison = await difference(page, capture, bytes, 20); output.nativeDom = localPath(file); output.actualPngVsNativeDom = { ...comparison, maximumRatio: .015, channelDeltaGreaterThan: 20, passed: comparison.ratio <= .015 };
        } finally { await page.locator('[data-native-capture="true"]').evaluate(root => root.remove()); await page.setViewportSize({ width: 1440, height: 900 }); }
        save();
      }
      if (outputs.length === 4 && outputs.every(o => !o.refused)) {
        const event = page.waitForEvent("download", { timeout: 20_000 }); await page.getByRole("button", { name: "Export HTML", exact: false }).click();
        const file = info.outputPath(`${input.id}.html`); await (await event).saveAs(file); record.portableHtml = localPath(file);
        const offline = await context.newPage(); const remote: string[] = []; await offline.route(/https?:\/\//, route => { remote.push(route.request().url()); return route.abort(); });
        try {
          await offline.goto(pathToFileURL(file).href); await offline.evaluate(() => document.fonts.ready); await offline.setViewportSize({ width: 2000, height: 1450 });
          expect(await offline.locator("[data-poster]").count()).toBe(4);
          const comparisons = [];
          for (const format of FORMATS) {
            const node = offline.locator(`[data-poster="${format.id}"]`); await node.evaluate(root => Object.assign((root as HTMLElement).style, { position: "fixed", left: "0", top: "0", zIndex: "99999" }));
            const png = info.outputPath(`${input.id}-${format.id}-offline-dom.png`), capture = await node.screenshot({ path: png });
            const comparison = await difference(page, native.get(format.id)!, capture, 8); comparisons.push({ format: format.id, screenshot: localPath(png), ...comparison, maximumRatio: .001, channelDeltaGreaterThan: 8, passed: comparison.ratio <= .001 });
            await node.evaluate(root => Object.assign((root as HTMLElement).style, { position: "relative", left: "", top: "", zIndex: "" }));
          }
          record.offlineHtml = { externalRequests: remote, comparisons, allFormatsPresent: true, fontsStatus: await offline.evaluate(() => document.fonts.status) };
        } finally { await offline.close(); }
      } else record.portableHtmlRefused = "At least one measured format refuses export; existing safeguards preserved.";
      await page.getByRole("button", { name: "Inspect spec", exact: false }).click();
      const event = page.waitForEvent("download"); await page.getByRole("button", { name: "Download JSON", exact: false }).click();
      const file = info.outputPath(`${input.id}-spec.json`); await (await event).saveAs(file); expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(result.spec); record.downloadedJson = localPath(file);
      await page.getByRole("button", { name: "Close inspection", exact: false }).click();
      await page.setViewportSize({ width: 390, height: 844 }); const fileMobile = info.outputPath(`${input.id}-mobile.png`); await page.screenshot({ path: fileMobile, fullPage: true }); record.mobileScreenshot = localPath(fileMobile); await page.setViewportSize({ width: 1440, height: 900 });
      record.state = "Generation response and actual committed-campaign exports preserved; no manual edits or extra generation";
    } catch { (record.errors as string[]).push("ARTWORK_OR_EXPORT_VERIFICATION_INTERRUPTED"); record.state = "Response and completed exports preserved; no repeat generation"; const file = info.outputPath(`${input.id}-artwork-failure.png`); await page.screenshot({ path: file, fullPage: true }); record.failureScreenshot = localPath(file); }
    save();
  }
  active = -1; journal.phase = "completed; provider-call authorization closed"; journal.completed = true; save();
  expect(journal.campaignRequestsDispatched).toBe(2); expect(journal.completedAttemptCalls).toBeLessThanOrEqual(4); expect(journal.unexpectedGenerationRequestsBlocked).toBe(0);
  // Passing this harness establishes collection/limits, never Gemini acceptance.
});
