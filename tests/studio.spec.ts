import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createDesign, designSchema, FORMATS, PRESETS, SAMPLE_TOPIC, TASTES } from "../src/lib/design";

async function ready(page: Page) {
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
}
async function geometry(page: Page) {
  const issues = await page.locator("[data-poster]").evaluateAll((posters) => {
    const issues: string[] = [];
    for (const root of posters) {
      const box = root.getBoundingClientRect();
      const fields = Array.from(root.querySelectorAll<HTMLElement>("[data-fit]"));
      for (const field of fields) {
        const rect = field.getBoundingClientRect();
        if (field.scrollHeight > field.clientHeight + 1 || field.scrollWidth > field.clientWidth + 1) issues.push(`${root.getAttribute("data-poster")}: text overflow`);
        if (rect.left < box.left - 1 || rect.right > box.right + 1 || rect.top < box.top - 1 || rect.bottom > box.bottom + 1) issues.push("Text outside canvas");
      }
      // Meaningful content boxes must not overlap, including the rotated illustration.
      const boxes = [...fields, root.querySelector<HTMLElement>("[data-decoration]")!].map((el) => el.getBoundingClientRect());
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) issues.push(`${root.getAttribute("data-poster")}: content boxes overlap ${i}/${j}`);
      }
    }
    return issues;
  });
  expect(issues).toEqual([]);
}

test("schema rejects unbounded values and executable style input", () => {
  for (const taste of TASTES) {
    const spec = createDesign({ taste, topic: SAMPLE_TOPIC });
    expect(designSchema.safeParse(spec).success).toBe(true);
    expect(designSchema.safeParse({ ...spec, css: "body{}" }).success).toBe(false);
    expect(designSchema.safeParse({ ...spec, palette: { ...spec.palette, ink: "url(https://example.com)" } }).success).toBe(false);
    expect(designSchema.safeParse({ ...spec, campaign: { ...spec.campaign, headline: "x".repeat(241) } }).success).toBe(false);
    expect(designSchema.safeParse({ ...spec, typography: { ...spec.typography, headlineScale: 30 } }).success).toBe(false);
  }
});

for (const taste of TASTES) {
  test(`${taste}: four layouts, exact PNGs, offline HTML parity, long copy`, async ({ page, context }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/create");
    await page.getByRole("radio", { name: new RegExp(PRESETS[taste].name) }).check();
    await page.getByRole("button", { name: "View sample campaign" }).click();
    await ready(page);
    await geometry(page);
    await page.screenshot({ path: testInfo.outputPath(`${taste}-studio.png`), fullPage: true });
    const signatures: string[] = [];
    for (const format of FORMATS) {
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
      const download = await downloadPromise;
      const path = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(path);
      const png = await readFile(path);
      expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([format.width, format.height]);
      expect(png.length).toBeGreaterThan(10_000);
      signatures.push(png.toString("base64"));
    }
    expect(new Set(signatures).size).toBe(4);
    const htmlDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export HTML" }).click();
    const download = await htmlDownload;
    const htmlPath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(htmlPath);
    const html = await readFile(htmlPath, "utf8");
    expect(html).not.toMatch(/<script|<link|https?:\/\//);
    const portable = await context.newPage();
    await context.setOffline(true);
    await portable.goto(pathToFileURL(htmlPath).href);
    await expect(portable.locator("[data-poster]")).toHaveCount(4);
    await geometry(portable);
    await page.setViewportSize({ width: 2000, height: 1450 });
    await portable.setViewportSize({ width: 2000, height: 1450 });
    for (const format of FORMATS) {
      const source = page.locator(`[data-poster="${format.id}"]`);
      const target = portable.locator(`[data-poster="${format.id}"]`);
      // Place native-size canvases on an integer pixel origin, outside scaled wrappers.
      // Fractional preview coordinates otherwise round screenshot dimensions differently.
      await source.evaluate((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        Object.assign(clone.style, { position: "fixed", left: "0", top: "0", zIndex: "9999" });
        clone.dataset.parity = "true";
        document.body.append(clone);
      });
      await target.evaluate((node) => Object.assign((node as HTMLElement).style, { position: "fixed", left: "0", top: "0", zIndex: "9999" }));
      const original = await page.locator('[data-parity="true"]').screenshot();
      const exported = await target.screenshot();
      await testInfo.attach(`${format.id}-original`, { body: original, contentType: "image/png" });
      await testInfo.attach(`${format.id}-html`, { body: exported, contentType: "image/png" });
      const difference = await portable.evaluate(async ({ first, second }) => {
        const images = await Promise.all([first, second].map(async (base64) => {
          const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode(); return image;
        }));
        if (images[0].width !== images[1].width || images[0].height !== images[1].height) return { ratio: 1, changed: -1, dimensions: images.map((image) => [image.width, image.height]) };
        const pixels = images.map((image) => {
          const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height;
          const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        });
        let changed = 0;
        for (let i = 0; i < pixels[0].length; i += 4) {
          if ([0, 1, 2, 3].some((channel) => Math.abs(pixels[0][i + channel] - pixels[1][i + channel]) > 8)) changed++;
        }
        return { ratio: changed / (images[0].width * images[0].height), changed };
      }, { first: original.toString("base64"), second: exported.toString("base64") });
      console.log(`${taste}/${format.id} offline HTML pixel difference: ${JSON.stringify(difference)}`);
      expect(difference.ratio, `${format.id}: offline HTML raster parity (0.1% pixel tolerance; channel delta >8)`).toBeLessThanOrEqual(0.001);
      await page.locator('[data-parity="true"]').evaluate((node) => node.remove());
      await target.evaluate((node) => Object.assign((node as HTMLElement).style, { position: "relative", left: "", top: "", zIndex: "" }));
    }
    await context.setOffline(false);
    await portable.close();
    await page.reload();
    await page.getByRole("radio", { name: new RegExp(PRESETS[taste].name) }).check();
    await page.getByRole("button", { name: "View sample campaign" }).click();
    await page.getByText("Edit campaign copy", { exact: true }).click();
    const longHeadline = "A new place to pause between classes, meet your campus community and share a conversation over chai near campus. ".repeat(3).slice(0, 240);
    await page.getByLabel("Headline", { exact: false }).fill(longHeadline);
    await page.getByLabel("Supporting text").fill("Chai stall opening near campus. ".repeat(6).slice(0, 180));
    await page.getByLabel("Call to action", { exact: false }).fill("Come say hello and make a little space for a chai break");
    await page.getByRole("button", { name: "Apply copy to campaign" }).click();
    await ready(page);
    await geometry(page);
    await expect(page.locator("[data-poster] h2").first()).toHaveText(longHeadline);
    await page.screenshot({ path: testInfo.outputPath(`${taste}-long-copy.png`), fullPage: true });
    await page.getByLabel("Headline", { exact: false }).fill("W".repeat(240));
    await page.getByRole("button", { name: "Apply copy to campaign" }).click();
    await ready(page);
    await geometry(page);
    expect(errors).toEqual([]);
  });
}

test("mobile layout, manual topic, spec and text injection remain safe", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/create");
  await page.getByRole("button", { name: "View sample campaign" }).click();
  await ready(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel("What are we creating for?").fill("A campus poetry circle.");
  await page.getByText("Edit campaign copy", { exact: true }).click();
  await page.getByLabel("Campaign topic", { exact: true }).fill("A campus poetry circle.");
  const headline = '<script>alert("hello")</script>';
  await page.getByLabel("Headline", { exact: false }).fill(headline);
  await page.getByLabel("Call to action", { exact: false }).fill("");
  await page.getByRole("button", { name: "Apply copy to campaign" }).click();
  await ready(page);
  await geometry(page);
  await expect(page.locator("[data-poster] script")).toHaveCount(0);
  await expect(page.locator("[data-poster] h2").first()).toHaveText(headline);
  await page.getByRole("button", { name: "Inspect spec" }).click();
  await expect(page.getByRole("region", { name: "Intermediate design specification" })).toContainText("A campus poetry circle.");
  await page.screenshot({ path: testInfo.outputPath("mobile-studio.png"), fullPage: true });
});

test("impossible line-break copy warns and refuses PNG/HTML downloads", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("button", { name: "View sample campaign" }).click();
  await page.getByText("Edit campaign copy", { exact: true }).click();
  await page.getByLabel("Headline", { exact: false }).fill("W\n".repeat(120).trim());
  await page.getByRole("button", { name: "Apply copy to campaign" }).click();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await expect(page.getByRole("alert", { name: "", exact: true }).filter({ hasText: "Copy exceeds this layout" })).toHaveCount(4);
  const downloads: string[] = [];
  page.on("download", (download) => downloads.push(download.suggestedFilename()));
  await page.getByRole("button", { name: "Export Instagram portrait PNG", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Shorten it before exporting");
  await page.getByRole("button", { name: "Export HTML" }).click();
  await expect(page.getByRole("status")).toContainText("Shorten it before exporting");
  expect(downloads).toEqual([]);
});

test("HTTP endpoint: fixture/manual input, bad JSON, limits and media type", async ({ request }) => {
  const result = await request.post("/api/design-spec", { data: { taste: "minimal-swiss", topic: SAMPLE_TOPIC } });
  expect(result.status()).toBe(200);
  const json = await result.json();
  expect(json.aiUsed).toBe(false);
  expect(json.mode).toBe("experimental-fixture");
  expect(designSchema.safeParse(json.spec).success).toBe(true);
  const manual = await request.post("/api/design-spec", { data: { taste: "festive-pop", topic: "A campus poetry circle." } });
  expect((await manual.json()).spec.campaign.headline).toBe("A campus poetry circle.");
  for (const body of [{ taste: "unknown", topic: "x" }, { taste: "bold-street", topic: " " }, { taste: "bold-street", topic: "x", headline: "x".repeat(241) }, { taste: "bold-street", topic: "x", html: "<script>" }]) {
    expect((await request.post("/api/design-spec", { data: body })).status()).toBe(400);
  }
  expect((await request.post("/api/design-spec", { data: "{", headers: { "Content-Type": "application/json" } })).status()).toBe(400);
  expect((await request.post("/api/design-spec", { data: "x" })).status()).toBe(415);
  expect((await request.post("/api/design-spec", { data: "x".repeat(9000), headers: { "Content-Type": "application/json" } })).status()).toBe(413);
});
