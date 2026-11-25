import { test, expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { pathToFileURL } from "node:url";
import { FORMATS, PRESETS, designSchema } from "../src/lib/design";
import { factualIssues, factualTokens } from "../src/lib/generation/facts";

const cases = [
  { id: "environment", topic: "Campaign to reduce plastic waste.", details: "Encourage people to bring a reusable bottle. No supplied statistics, organization name or event date.", taste: "bold-street" as const },
  { id: "robotics", topic: "Campus robotics workshop for students.", details: "12 teams. 26 November 2026 at 18:30 IST. Venue: Lab A; Entry ₹150. Register at https://example.org/workshop.", taste: "minimal-swiss" as const },
];
const local = (path: string) => relative(process.cwd(), path).replaceAll("\\", "/");
async function difference(page: Page, a: Buffer, b: Buffer, delta: number) {
  return page.evaluate(async ({ first, second, delta }) => {
    const images = await Promise.all([first, second].map(async data => { const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode(); return image; }));
    if (images[0].width !== images[1].width || images[0].height !== images[1].height) return { ratio: 1, dimensionsMatch: false };
    const bytes = images.map(image => { const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height; const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; });
    let changed = 0; for (let i = 0; i < bytes[0].length; i += 4) if ([0, 1, 2, 3].some(channel => Math.abs(bytes[0][i + channel] - bytes[1][i + channel]) > delta)) changed++;
    return { ratio: changed / (images[0].width * images[0].height), dimensionsMatch: true };
  }, { first: a.toString("base64"), second: b.toString("base64"), delta });
}

for (const item of cases) test(`${item.id}: corrected actual local artwork and unchanged export thresholds`, async ({ page, context, browser }, info) => {
  let localRequests = 0;
  await context.route("**/api/generate", async route => {
    const request = route.request().postDataJSON();
    // Defense in depth: this evaluation can never dispatch auto/live generation.
    if (request.mode !== "local" || ++localRequests > 1) { await route.abort(); throw new Error("Only one explicit local request is authorized in this test"); }
    await route.continue();
  });
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill(item.topic); await page.getByLabel("Optional details").fill(item.details);
  await page.getByRole("radio", { name: PRESETS[item.taste].name, exact: true }).check();
  const response = page.waitForResponse(r => r.url().endsWith("/api/generate")); await page.getByRole("button", { name: "Use local planner" }).click();
  const result = await (await response).json(); expect(result.metadata.source).toBe("deterministic-fallback"); expect(result.metadata.fallbackReason).toBe("requested-local"); expect(result.metadata.attempts).toEqual([]); expect(result.metadata.model).toBeNull(); expect(designSchema.safeParse(result.spec).success).toBe(true);
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4); await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  const quality = await page.locator("[data-poster]").evaluateAll(nodes => nodes.map(node => ({
    format: node.getAttribute("data-poster"), issues: JSON.parse(node.getAttribute("data-quality") ?? "[]"), corrections: JSON.parse(node.getAttribute("data-corrections") ?? "[]"), fontsStatus: document.fonts.status,
    fields: Array.from(node.querySelectorAll<HTMLElement>("[data-fit]")).map(field => ({ role: field.dataset.role, pixels: parseFloat(getComputedStyle(field).fontSize), minimum: Number(field.dataset.min), horizontalFit: field.scrollWidth <= field.clientWidth + 1, verticalFit: field.scrollHeight <= field.clientHeight + 1,
      text: field.querySelector("[data-copy-group]") ? Array.from(field.querySelectorAll("[data-copy-group]")).map(n => n.textContent).join("\n") : field.textContent }))
  })));
  for (const record of quality) {
    expect(record.issues).toEqual([]); expect(record.fontsStatus).toBe("loaded");
    const copy = record.fields.map(f => f.text).join("\n"); expect(copy).not.toContain("No supplied"); expect(factualIssues(item.topic + "\n" + item.details, copy)).toEqual([]);
    if (item.id === "environment") expect(copy).toContain("Encourage people to bring a reusable bottle.");
    else for (const fact of ["students", "12 teams", "26 November 2026", "18:30 IST", "Lab A", "₹150", "https://example.org/workshop"]) expect(copy).toContain(fact);
    for (const field of record.fields) { expect(field.horizontalFit && field.verticalFit).toBe(true); expect(field.pixels).toBeGreaterThanOrEqual(field.minimum); }
  }
  if (item.id === "environment") { expect(result.interpretation.missingInformation).toContain("No supplied statistics, organization name or event date."); expect(result.spec.artDirection.visual).toBe("botanical"); }
  else expect(result.spec.artDirection.visual).toBe("robot");
  await page.setViewportSize({ width: 1440, height: 900 }); await page.screenshot({ path: info.outputPath(`${item.id}-studio.png`), fullPage: true });
  const outputs = [], native = new Map<string, Buffer>();
  for (const format of FORMATS) {
    const event = page.waitForEvent("download"); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
    const file = info.outputPath(`${item.id}-${format.id}.png`); await (await event).saveAs(file); const bytes = readFileSync(file);
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([format.width, format.height]);
    await page.setViewportSize({ width: 2000, height: 1450 });
    await page.locator(`[data-poster="${format.id}"]`).evaluate(root => { const clone = root.cloneNode(true) as HTMLElement; clone.dataset.nativeCapture = "true"; Object.assign(clone.style, { position: "fixed", left: "0", top: "0", zIndex: "99999" }); document.body.append(clone); });
    let capture: Buffer;
    try { capture = await page.locator('[data-native-capture="true"]').screenshot({ path: info.outputPath(`${item.id}-${format.id}-native-dom.png`) }); }
    finally { await page.locator('[data-native-capture="true"]').evaluate(node => node.remove()); }
    native.set(format.id, capture!); const pngComparison = await difference(page, capture!, bytes, 20);
    expect(pngComparison.dimensionsMatch).toBe(true); expect(pngComparison.ratio).toBeLessThanOrEqual(.015);
    outputs.push({ format: format.id, file: local(file), dimensions: [format.width, format.height], pngComparison: { ...pngComparison, maximumRatio: .015, channelDeltaGreaterThan: 20 } });
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  const htmlEvent = page.waitForEvent("download"); await page.getByRole("button", { name: "Export HTML" }).click(); const html = info.outputPath(`${item.id}.html`); await (await htmlEvent).saveAs(html);
  const offline = await context.newPage(); let externalRequests = 0; await offline.route(/https?:\/\//, route => { externalRequests++; return route.abort(); });
  const offlineComparisons = [];
  try {
    await offline.goto(pathToFileURL(html).href); await offline.evaluate(() => document.fonts.ready); await offline.setViewportSize({ width: 2000, height: 1450 }); await expect(offline.locator("[data-poster]")).toHaveCount(4);
    for (const format of FORMATS) {
      const node = offline.locator(`[data-poster="${format.id}"]`); await node.evaluate(root => Object.assign((root as HTMLElement).style, { position: "fixed", left: "0", top: "0", zIndex: "99999" }));
      const capture = await node.screenshot({ path: info.outputPath(`${item.id}-${format.id}-offline-dom.png`) }); const comparison = await difference(page, native.get(format.id)!, capture, 8);
      offlineComparisons.push({ format: format.id, ...comparison, maximumRatio: .001, channelDeltaGreaterThan: 8 });
      expect(comparison.dimensionsMatch).toBe(true); expect(comparison.ratio).toBeLessThanOrEqual(.001);
      await node.evaluate(root => Object.assign((root as HTMLElement).style, { position: "relative", left: "", top: "", zIndex: "" }));
    }
    expect(externalRequests).toBe(0);
  } finally { await offline.close(); }
  await page.getByRole("button", { name: "Inspect spec" }).click(); const jsonEvent = page.waitForEvent("download"); await page.getByRole("button", { name: "Download JSON" }).click();
  const json = info.outputPath(`${item.id}-spec.json`); await (await jsonEvent).saveAs(json); expect(JSON.parse(readFileSync(json, "utf8"))).toEqual(result.spec); await page.getByRole("button", { name: "Close inspection" }).click();
  await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: info.outputPath(`${item.id}-mobile.png`), fullPage: true });
  writeFileSync(info.outputPath("evidence.json"), JSON.stringify({ kind: "Actual explicit local planner and browser downloads, not fresh AI or replay", request: item, result, quality, outputs, html: local(html), json: local(json), offlineComparisons, externalRequests, localRequests, providerCalls: 0, browser: browser.version(), factualTokens: factualTokens(JSON.stringify(result.spec.campaign)) }, null, 2));
});
