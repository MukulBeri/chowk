import { test, expect, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { M6A_CORPUS, M6A_CHAI } from '../evaluation/m6a-corpus';
import { FORMATS, PRESETS, designSchema, type Taste } from '../src/lib/design';
async function difference(page: Page, a: Buffer, b: Buffer, delta: number) { return page.evaluate(async ({ a, b, delta }) => { const imgs = await Promise.all([a, b].map(async (src) => { const im = new Image(); im.src = 'data:image/png;base64,' + src; await im.decode(); return im; })); if (imgs[0].width !== imgs[1].width || imgs[0].height !== imgs[1].height)
    return 1; const data = imgs.map(im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d')!; x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; }); let changed = 0; for (let i = 0; i < data[0].length; i += 4)
    if ([0, 1, 2, 3].some(k => Math.abs(data[0][i + k] - data[1][i + k]) > delta))
        changed++; return changed / (imgs[0].width * imgs[0].height); }, { a: a.toString('base64'), b: b.toString('base64'), delta }); }
async function generate(page: Page, item: {
    topic: string;
    details: string;
    taste: Taste;
}) { await page.goto('/create'); await page.getByLabel('What are we creating for?').fill(item.topic); await page.getByLabel('Optional details').fill(item.details); await page.getByRole('radio', { name: PRESETS[item.taste].name, exact: true }).check(); await page.getByLabel('Planning approach').selectOption('creative-led'); const event = page.waitForResponse(r => r.url().endsWith('/api/generate')); await page.getByRole('button', { name: 'Use local planner' }).click(); const response = await event; expect(response.status()).toBe(200); expect(response.headers()['x-campaign-inference']).toBe('disabled'); const data = await response.json(); expect(data.metadata.attempts).toEqual([]); expect(data.metadata.model).toBeNull(); expect(designSchema.safeParse(data.spec).success).toBe(true); await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4); await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0); return data; }
for (const item of M6A_CORPUS)
    test(`M6A artwork ${item.id}: actual local studio, native PNG, portable HTML and API`, async ({ page, context, request }, info) => {
        test.setTimeout(90000);
        const data = await generate(page, item);
        writeFileSync(info.outputPath('generation.json'), JSON.stringify({ kind: 'Actual local production pipeline, zero provider calls', request: { ...item, treatment: 'creative-led', mode: 'local' }, result: data }, null, 2));
        await page.getByRole('button', { name: 'Inspect spec', exact: true }).click();
        const jsonEvent = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download JSON' }).click();
        const json = info.outputPath('spec.json');
        await (await jsonEvent).saveAs(json);
        expect(JSON.parse(readFileSync(json, 'utf8'))).toEqual(data.spec);
        await page.keyboard.press('Escape');
        const htmlEvent = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Export HTML' }).click();
        const html = info.outputPath('portable.html');
        await (await htmlEvent).saveAs(html);
        const offline = await context.newPage();
        let external = 0;
        await offline.route(/https?:\/\//, r => { external++; return r.abort(); });
        await offline.goto(pathToFileURL(html).href);
        await offline.evaluate(() => document.fonts.ready);
        await expect(offline.locator('[data-poster]')).toHaveCount(4);
        expect(external).toBe(0);
        expect(readFileSync(html, 'utf8')).toContain("font-src data:");
        const api = await request.post('/api/render', { data: { topic: item.topic, details: item.details, taste: item.taste, treatment: 'creative-led', mode: 'local' } });
        expect(api.status()).toBe(200);
        const rendered = await api.json();
        expect(rendered.spec).toEqual(data.spec);
        expect(Buffer.byteLength(rendered.html)).toBeLessThanOrEqual(1500000);
        expect(Buffer.byteLength(JSON.stringify(rendered))).toBeLessThanOrEqual(2000000);
        writeFileSync(info.outputPath('api.html'), rendered.html);
        const consumer = await context.newPage();
        await consumer.route(/https?:\/\//, r => { external++; return r.abort(); });
        await consumer.goto(pathToFileURL(info.outputPath('api.html')).href);
        const measured = await consumer.evaluate(async () => await (window as unknown as {
            yarcCampaignReady: Promise<unknown>;
        }).yarcCampaignReady);
        writeFileSync(info.outputPath('api-quality.json'), JSON.stringify(measured, null, 2));
        expect(measured).toMatchObject({ state: 'ready' });
        expect(external).toBe(0);
        const outputs = [];
        await page.setViewportSize({ width: 2000, height: 1450 });
        await offline.setViewportSize({ width: 2000, height: 1450 });
        await consumer.setViewportSize({ width: 2000, height: 1450 });
        for (const f of FORMATS) {
            const n = page.locator(`[data-poster="${f.id}"]`);
            const visible = await n.innerText();
            for (const fact of data.spec.creativeContent.facts)
                expect(visible.toLowerCase().replace(/\s+/g, ' ')).toContain(fact.text.toLowerCase().replace(/\s+/g, ' '));
            expect(visible).not.toMatch(/Target audience:|Do not invent|No supplied|Warm, youthful/);
            const event = page.waitForEvent('download');
            await page.getByRole('button', { name: `Export ${f.name} PNG`, exact: true }).click();
            const path = info.outputPath(`${item.id}-${f.id}.png`);
            await (await event).saveAs(path);
            const png = readFileSync(path);
            expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([f.width, f.height]);
            await n.evaluate(node => { const c = node.cloneNode(true) as HTMLElement; c.dataset.capture = 'true'; Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '99999' }); document.body.append(c); });
            const native = await page.locator('[data-capture]').screenshot();
            await page.locator('[data-capture]').evaluate(n => n.remove());
            const off = offline.locator(`[data-poster="${f.id}"]`);
            await off.evaluate(n => Object.assign((n as HTMLElement).style, { position: 'fixed', left: '0', top: '0', zIndex: '99999' }));
            const offlineDom = await off.screenshot();
            await off.evaluate(n => Object.assign((n as HTMLElement).style, { position: 'relative', left: '', top: '', zIndex: '' }));
            const apiNode = consumer.locator(`[data-poster="${f.id}"]`);
            await apiNode.evaluate(n => Object.assign((n as HTMLElement).style, { position: 'fixed', left: '0', top: '0', zIndex: '99999' }));
            const apiDom = await apiNode.screenshot();
            await apiNode.evaluate(n => Object.assign((n as HTMLElement).style, { position: 'relative', left: '', top: '', zIndex: '' }));
            const pngVsDom = await difference(page, png, native, 20), offlineVsDom = await difference(page, offlineDom, native, 8), apiVsDom = await difference(page, apiDom, native, 8);
            writeFileSync(info.outputPath(f.id + '-fidelity.json'), JSON.stringify({ pngVsDom, offlineVsDom, apiVsDom }, null, 2));
            if (apiVsDom > .001 || offlineVsDom > .001) {
                writeFileSync(info.outputPath(f.id + '-native-dom.png'), native);
                writeFileSync(info.outputPath(f.id + '-api-dom.png'), apiDom);
                writeFileSync(info.outputPath(f.id + '-offline-dom.png'), offlineDom);
            }
            expect(pngVsDom).toBeLessThanOrEqual(.015);
            expect(offlineVsDom).toBeLessThanOrEqual(.001);
            expect(apiVsDom).toBeLessThanOrEqual(.001);
            outputs.push({ format: f.id, dimensions: [f.width, f.height], pngVsDom, offlineVsDom, apiVsDom, diagnostics: await n.evaluate(n => ({ quality: n.dataset.quality, corrections: n.dataset.corrections, step: n.dataset.correctionStep, sizes: Array.from(n.querySelectorAll<HTMLElement>('[data-fit]')).map(e => ({ role: e.dataset.role, size: getComputedStyle(e).fontSize, floor: e.dataset.min })) })) });
        }
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.screenshot({ path: info.outputPath('studio.png'), fullPage: true });
        if (item.id.startsWith('chai')) {
            await page.setViewportSize({ width: 390, height: 844 });
            await page.screenshot({ path: info.outputPath('mobile.png'), fullPage: true });
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        writeFileSync(info.outputPath('verification.json'), JSON.stringify({ kind: 'Actual local generation and downloaded PNG/HTML/JSON, not screenshots substituted for exports', browser: context.browser()?.version(), outputs, externalRequests: external, metadata: data.metadata, recipe: data.spec.artDirection.recipe }, null, 2));
        await offline.close();
        await consumer.close();
    });
test('M6A artwork manifesto: local composition selection, edit, stale readiness and export', async ({ page, context }, info) => {
    await generate(page, { ...M6A_CHAI, taste: 'bold-street' });
    const before = await page.locator('[data-campaign-revision]').getAttribute('data-campaign-revision');
    await page.getByLabel('Composition', { exact: true }).selectOption('manifesto');
    await expect(page.locator('[data-poster][data-ready="true"][data-recipe="manifesto"]')).toHaveCount(4);
    expect(await page.locator('[data-campaign-revision]').getAttribute('data-campaign-revision')).not.toBe(before);
    await expect(page.locator('.generation-provenance')).toContainText('Manual edits');
    await expect(page.locator('[data-hero]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Inspect spec', exact: true }).click();
    const jsonEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download JSON' }).click();
    await (await jsonEvent).saveAs(info.outputPath('manifesto-spec.json'));
    await page.keyboard.press('Escape');
    const htmlEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export HTML' }).click();
    const htmlPath = info.outputPath('manifesto-portable.html');
    await (await htmlEvent).saveAs(htmlPath);
    const offline = await context.newPage();
    await offline.route(/https?:\/\//, r => r.abort());
    await offline.goto(pathToFileURL(htmlPath).href);
    await offline.evaluate(() => document.fonts.ready);
    await page.setViewportSize({ width: 2000, height: 1450 });
    await offline.setViewportSize({ width: 2000, height: 1450 });
    const outputs = [];
    for (const f of FORMATS) {
        const event = page.waitForEvent('download');
        await page.getByRole('button', { name: `Export ${f.name} PNG`, exact: true }).click();
        const path = info.outputPath(`manifesto-${f.id}.png`);
        await (await event).saveAs(path);
        const png = readFileSync(path);
        expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([f.width, f.height]);
        await page.locator(`[data-poster="${f.id}"]`).evaluate(node => {
            const c = node.cloneNode(true) as HTMLElement;
            c.dataset.capture = 'true';
            Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '99999' });
            document.body.append(c);
        });
        const native = await page.locator('[data-capture]').screenshot();
        await page.locator('[data-capture]').evaluate(n => n.remove());
        const off = offline.locator(`[data-poster="${f.id}"]`);
        await off.evaluate(n => Object.assign((n as HTMLElement).style, { position: 'fixed', left: '0', top: '0', zIndex: '99999' }));
        const offDom = await off.screenshot();
        await off.evaluate(n => Object.assign((n as HTMLElement).style, { position: 'relative', left: '', top: '', zIndex: '' }));
        const pngVsDom = await difference(page, png, native, 20), offlineVsDom = await difference(page, offDom, native, 8);
        expect(pngVsDom).toBeLessThanOrEqual(.015);
        expect(offlineVsDom).toBeLessThanOrEqual(.001);
        outputs.push({ format: f.id, dimensions: [f.width, f.height], pngVsDom, offlineVsDom });
    }
    writeFileSync(info.outputPath('manifesto-verification.json'), JSON.stringify({ kind: 'Actual local manual composition selection and PNG/HTML/JSON downloads; zero provider calls', outputs }, null, 2));
    await offline.close();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('.copy-details summary').click();
    await page.getByLabel('Headline up to').fill('Chai Junction.');
    await expect(page.getByRole('button', { name: 'Export HTML' })).toBeDisabled();
    await page.getByRole('button', { name: 'Apply copy to campaign' }).click();
    await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
    await page.getByLabel('Supporting text', { exact: true }).fill('Facts removed.');
    await page.getByRole('button', { name: 'Apply copy to campaign' }).click();
    await expect(page.locator('.export-status [role="alert"]')).toContainText('retain all supplied public facts');
    await page.getByLabel('Supporting text', { exact: true }).fill('');
    await page.getByLabel('Planning approach').selectOption('standard');
    await expect(page.getByRole('note').filter({ hasText: 'Draft changed' })).toBeVisible();
    await page.screenshot({ path: info.outputPath('manifesto-studio.png'), fullPage: true });
});
