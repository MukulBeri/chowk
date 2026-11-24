import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import manifest from "../src/lib/design-engine/font-assets.json";
import { PRESETS, TASTES } from "../src/lib/design";

test("approved WOFF2 bytes, notices, weights and coverage remain pinned", () => {
  expect(manifest.assets).toHaveLength(5);
  for (const asset of manifest.assets) {
    const bytes=readFileSync(`public${asset.path}`);
    expect(bytes.subarray(0,4).toString()).toBe("wOF2"); expect(bytes.readUInt32BE(8)).toBe(bytes.length);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
  }
  for (const license of manifest.licenses) {
    const bytes=readFileSync(`public${license.path}`); expect(createHash("sha256").update(bytes).digest("hex")).toBe(license.sha256);
    expect(bytes.toString()).toContain("SIL OPEN FONT LICENSE Version 1.1");
  }
  expect(manifest.assets.filter(asset=>asset.family==="YarcFredoka").every(asset=>asset.weight==="600")).toBe(true);
  expect(manifest.assets.find(asset=>asset.family==="YarcInter")?.coverageRanges.some(([a,b])=>0x20b9>=a&&0x20b9<=b)).toBe(true);
});

for (const taste of TASTES) test(`${taste}: actual glyph fonts, embedded offline HTML and native font appearance`, async ({page,context},info) => {
  const remote:string[]=[]; await page.route("https://**",route=>{remote.push(route.request().url());return route.abort();});
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill("Café Noël — Łódź ₹150.");
  await page.getByLabel("Optional details").fill("0123456789. No tickets are required.");
  await page.getByRole("button",{name:new RegExp(PRESETS[taste].name)}).click();
  await page.getByRole("button",{name:"Use local planner"}).click();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4); await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  // CDP reports glyphs actually painted; an off-screen poster can have no
  // platform-font runs yet even after FontFaceSet is ready. Paint this target.
  await page.locator('[data-poster="instagram-square"] [data-role="headline"]').scrollIntoViewIfNeeded();
  await page.locator('[data-poster="instagram-square"]').screenshot({path:info.outputPath(`${taste}-painted-before-glyph-query.png`)});
  const session=await context.newCDPSession(page); await session.send("DOM.enable"); await session.send("CSS.enable");
  const domTree=await session.send("DOM.getDocument"); const target=await session.send("DOM.querySelector",{nodeId:domTree.root.nodeId,selector:'[data-poster="instagram-square"] [data-role="headline"]'});
  const fonts=await session.send("CSS.getPlatformFontsForNode",{nodeId:target.nodeId});
  const expected=taste==="bold-street"?"Anton":taste==="minimal-swiss"?"Inter":"Fredoka";
  expect(fonts.fonts.some(font=>font.isCustomFont&&font.familyName.includes(expected)&&font.glyphCount>0),JSON.stringify(fonts)).toBe(true);
  if(taste==="festive-pop")expect(fonts.fonts.some(font=>font.isCustomFont&&font.familyName.includes("Inter")&&font.glyphCount>0)).toBe(true);
  const headline=page.locator('[data-poster="instagram-square"] [data-role="headline"]');
  expect(await headline.evaluate(node=>getComputedStyle(node).fontSynthesis)).toBe("none");
  const pngEvent=page.waitForEvent("download"); await page.getByRole("button",{name:"Export Instagram square PNG",exact:true}).click();
  const pngPath=info.outputPath(`${taste}-glyphs.png`); await(await pngEvent).saveAs(pngPath); const png=readFileSync(pngPath);expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([1080,1080]);
  const htmlEvent=page.waitForEvent("download"); await page.getByRole("button",{name:"Export HTML"}).click(); const htmlPath=info.outputPath(`${taste}-embedded-fonts.html`);await(await htmlEvent).saveAs(htmlPath);
  const html=readFileSync(htmlPath,"utf8");expect(html).toContain("data:font/woff2;base64,");expect(html).toContain("SIL OPEN FONT LICENSE Version 1.1");expect(html).toContain("font-src data:");
  const offline=await context.newPage();const offlineRequests:string[]=[];await offline.route("http://**",route=>{offlineRequests.push(route.request().url());return route.abort();});await offline.route("https://**",route=>{offlineRequests.push(route.request().url());return route.abort();});
  await offline.goto(pathToFileURL(htmlPath).href);await offline.evaluate(()=>document.fonts.ready);await expect(offline.locator('[data-poster="instagram-square"] h2')).toContainText("₹150");expect(offlineRequests).toEqual([]);
  const offlineSession=await context.newCDPSession(offline);await offlineSession.send("DOM.enable");await offlineSession.send("CSS.enable");const offlineDoc=await offlineSession.send("DOM.getDocument");const offlineTarget=await offlineSession.send("DOM.querySelector",{nodeId:offlineDoc.root.nodeId,selector:'[data-poster="instagram-square"] [data-role="headline"]'});const offlineFonts=await offlineSession.send("CSS.getPlatformFontsForNode",{nodeId:offlineTarget.nodeId});expect(offlineFonts.fonts.some(font=>font.isCustomFont&&font.familyName.includes(expected)&&font.glyphCount>0)).toBe(true);
  await page.setViewportSize({width:2000,height:1450});await offline.setViewportSize({width:2000,height:1450});
  await page.locator('[data-poster="instagram-square"]').evaluate(node=>{const clone=node.cloneNode(true)as HTMLElement;clone.dataset.fontParity="true";Object.assign(clone.style,{position:"fixed",left:"0",top:"0",zIndex:"9999"});document.body.append(clone);});
  await offline.locator('[data-poster="instagram-square"]').evaluate(node=>Object.assign((node as HTMLElement).style,{position:"fixed",left:"0",top:"0",zIndex:"9999"}));
  const native=await page.locator('[data-font-parity="true"]').screenshot({path:info.outputPath(`${taste}-native-glyphs.png`)}),portable=await offline.locator('[data-poster="instagram-square"]').screenshot({path:info.outputPath(`${taste}-offline-glyphs.png`)});
  const ratio=await offline.evaluate(async({a,b})=>{const images=await Promise.all([a,b].map(async src=>{const image=new Image();image.src=`data:image/png;base64,${src}`;await image.decode();return image;}));const data=images.map(image=>{const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext("2d")!;ctx.drawImage(image,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height).data;});let changed=0;for(let i=0;i<data[0].length;i+=4)if([0,1,2,3].some(c=>Math.abs(data[0][i+c]-data[1][i+c])>8))changed++;return changed/(1080*1080);},{a:native.toString("base64"),b:portable.toString("base64")});
  expect(ratio,"Representative embedded offline HTML vs DOM: original 0.1%/delta>8 threshold").toBeLessThanOrEqual(.001);
  const pngRatio=await page.evaluate(async({a,b})=>{const images=await Promise.all([a,b].map(async src=>{const image=new Image();image.src=`data:image/png;base64,${src}`;await image.decode();return image;}));const data=images.map(image=>{const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext("2d")!;ctx.drawImage(image,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height).data;});let changed=0;for(let i=0;i<data[0].length;i+=4)if([0,1,2,3].some(c=>Math.abs(data[0][i+c]-data[1][i+c])>20))changed++;return changed/(1080*1080);},{a:native.toString("base64"),b:png.toString("base64")});expect(pngRatio).toBeLessThanOrEqual(.015);
  writeFileSync(info.outputPath("glyph-evidence.json"),JSON.stringify({taste,kind:"Actual local generation; CDP observed native and offline font glyph use, not only FontFaceSet status",nativeFonts:fonts.fonts,offlineFonts:offlineFonts.fonts,offlineHtmlVsDomRatio:ratio,actualPngVsDomRatio:pngRatio,remoteRequests:remote},null,2));expect(remote).toEqual([]);
});

test("font integrity failure refuses v3 exports without silent font substitution",async({page})=>{
  await page.route("**/fonts/anton-latin.woff2",route=>route.fulfill({contentType:"font/woff2",body:"invalid font bytes"}));
  await page.goto("/");await page.getByLabel("What are we creating for?").fill("A robotics workshop.");await page.getByRole("button",{name:"Use local planner"}).click();await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(4);
  expect(await page.locator("[data-poster]").first().getAttribute("data-quality")).toContain("FONT_UNAVAILABLE");let downloads=0;page.on("download",()=>downloads++);await page.getByRole("button",{name:"Export YouTube thumbnail PNG",exact:true}).click();await expect(page.getByRole("status")).toContainText("font");expect(downloads).toBe(0);
});

test("unsupported-script text stays visible with an explicit system-font warning",async({page,context},info)=>{
  await page.goto("/");await page.getByLabel("What are we creating for?").fill("Campus reading — नमस्ते 東京.");
  await page.getByRole("button",{name:/Minimal Swiss/}).click();await page.getByRole("button",{name:"Use local planner"}).click();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  await expect(page.getByRole("note").first()).toContainText("system-font fallback");
  const poster=page.locator('[data-poster="instagram-square"]');await poster.scrollIntoViewIfNeeded();await poster.screenshot({path:info.outputPath("unsupported-script-native.png")});
  await expect(poster.locator("h2")).toContainText("नमस्ते 東京");
  const session=await context.newCDPSession(page);await session.send("DOM.enable");await session.send("CSS.enable");const tree=await session.send("DOM.getDocument");const target=await session.send("DOM.querySelector",{nodeId:tree.root.nodeId,selector:'[data-poster="instagram-square"] h2'});const fonts=await session.send("CSS.getPlatformFontsForNode",{nodeId:target.nodeId});
  expect(fonts.fonts.some(font=>!font.isCustomFont&&font.glyphCount>0),JSON.stringify(fonts)).toBe(true);
  const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export Instagram square PNG",exact:true}).click();await(await event).saveAs(info.outputPath("unsupported-script-export.png"));
  writeFileSync(info.outputPath("system-fallback-evidence.json"),JSON.stringify({kind:"Actual local generation; this Windows machine only; unsupported scripts require installed fonts",fonts:fonts.fonts},null,2));
});
