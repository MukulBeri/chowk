import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { designSchema, designSchemaV3, FORMATS, PRESETS, TASTES, type DesignSpecV3, type Taste } from "../src/lib/design";
import { ENGINE_TASTES, localDirection, PALETTES } from "../src/lib/design-engine/registry";
import { copyGroups, resolveLayout } from "../src/lib/design-engine/layout";
import { fallbackPlan, planToSpec, validatePlan, contrast } from "../src/lib/generation/planner";
import { generationPrompt } from "../src/server/gemini";
import { factualTokens } from "../src/lib/generation/facts";

const common = { topic: "A robotics workshop for students.", details: "26 November 2026 at 18:30 IST. Venue: Lab A. Entry ₹150. Register at https://example.org/workshop" };
function specFor(taste: Taste): DesignSpecV3 {
  const request = { ...common, taste }, plan = fallbackPlan(request);
  return designSchemaV3.parse(planToSpec(plan, request, "deterministic-fallback"));
}
async function ready(page: Page) {
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
}
async function actualLocal(page: Page, taste: Taste, topic = common.topic, details = common.details) {
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill(topic);
  await page.getByLabel("Optional details").fill(details); await page.getByRole("radio", { name: new RegExp(PRESETS[taste].name) }).click();
  const response = page.waitForResponse((item) => item.url().endsWith("/api/generate"));
  await page.getByRole("button", { name: "Use local planner" }).click();
  const result = await (await response).json();
  expect(result.metadata.attempts).toEqual([]); expect(result.metadata.source).toBe("deterministic-fallback"); expect(result.spec.version).toBe(3);
  return result;
}
async function pixelDifference(page: Page, first: Buffer, second: Buffer) {
  return page.evaluate(async ({ a, b }) => {
    const images = await Promise.all([a,b].map(async (src) => { const image = new Image(); image.src = `data:image/png;base64,${src}`; await image.decode(); return image; }));
    if (images[0].width !== images[1].width || images[0].height !== images[1].height) return { ratio: 1, changed: -1 };
    const data = images.map((image) => { const canvas = document.createElement("canvas"); canvas.width=image.width; canvas.height=image.height; const context=canvas.getContext("2d")!; context.drawImage(image,0,0); return context.getImageData(0,0,canvas.width,canvas.height).data; });
    let changed=0; for(let i=0;i<data[0].length;i+=4) if([0,1,2,3].some((c)=>Math.abs(data[0][i+c]-data[1][i+c])>20)) changed++;
    return { ratio: changed/(images[0].width*images[0].height), changed };
  }, { a: first.toString("base64"), b: second.toString("base64") });
}
async function exportsAndEvidence(page: Page, info: TestInfo, prefix: string, fidelity: boolean) {
  const outputs = [];
  for (const format of FORMATS) {
    const event = page.waitForEvent("download"); await page.getByRole("button", { name: `Export ${format.name} PNG`, exact: true }).click();
    const download = await event, path = info.outputPath(`${prefix}-${format.id}.png`); await download.saveAs(path);
    const png = readFileSync(path); expect(png.subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([format.width,format.height]);
    let difference;
    if (fidelity && format.id === "youtube-thumbnail") {
      await page.setViewportSize({width:2000,height:1450});
      await page.locator(`[data-poster="${format.id}"]`).evaluate((node) => {
        const clone=node.cloneNode(true) as HTMLElement; clone.dataset.nativeCapture="true";
        Object.assign(clone.style,{position:"fixed",left:"0",top:"0",zIndex:"99999"}); document.body.append(clone);
      });
      const native = await page.locator('[data-native-capture="true"]').screenshot({path:info.outputPath(`${prefix}-native-dom.png`)});
      difference = await pixelDifference(page,native,png);
      expect(difference.ratio, "Actual downloaded PNG vs native DOM; channel delta >20, <=1.5% changed pixels").toBeLessThanOrEqual(.015);
      await page.locator('[data-native-capture="true"]').evaluate((node)=>node.remove());
      await page.setViewportSize({width:1440,height:1050});
    }
    outputs.push({format:format.id,width:format.width,height:format.height,bytes:png.length,actualPngVsNativeDom:difference});
  }
  const event=page.waitForEvent("download"); await page.getByRole("button",{name:"Export HTML"}).click(); const html=await event;
  const htmlPath=info.outputPath(`${prefix}.html`); await html.saveAs(htmlPath);
  const htmlText=readFileSync(htmlPath,"utf8"); expect(htmlText).not.toMatch(/<script|<link/);
  const offline=await page.context().newPage(); let externalRequests=0; await offline.route("https://**",(route)=>{externalRequests++; return route.abort();});
  await offline.goto(pathToFileURL(htmlPath).href); await expect(offline.locator("[data-poster]")).toHaveCount(4);
  for(const poster of await offline.locator("[data-poster]").all()) {
    expect(await poster.getAttribute("data-overflow")).toBe("false");
    expect(await poster.textContent()).toContain("₹150");
  }
  expect(externalRequests).toBe(0); await offline.close();
  await page.getByRole("button",{name:"Inspect spec"}).click();
  const jsonEvent=page.waitForEvent("download"); await page.getByRole("button",{name:"Download JSON"}).click();
  const specPath=info.outputPath(`${prefix}-spec.json`); await (await jsonEvent).saveAs(specPath);
  const downloadedSpec=JSON.parse(readFileSync(specPath,"utf8")); expect(downloadedSpec.rationale).toContain(downloadedSpec.artDirection.variant.replaceAll("-"," "));
  await page.getByRole("button",{name:"Close inspection"}).click();
  await page.screenshot({path:info.outputPath(`${prefix}-studio.png`),fullPage:true});
  return outputs;
}

test("strict v3 capabilities share registry and preserve historical v1/v2 parsing", () => {
  expect(designSchema.safeParse(JSON.parse(readFileSync("docs/example-design-spec-v1.json","utf8"))).success).toBe(true);
  expect(designSchema.safeParse(JSON.parse(readFileSync("docs/example-design-spec.json","utf8"))).success).toBe(true);
  for(const taste of TASTES) {
    const spec=specFor(taste), request={...common,taste};
    expect(validatePlan(fallbackPlan(request),request).issues).toEqual([]);
    for(const variant of ENGINE_TASTES[taste].variants) expect(designSchemaV3.safeParse({...spec,artDirection:{...spec.artDirection,variant}}).success).toBe(true);
    for(const palette of ENGINE_TASTES[taste].palettes) {
      const colours=PALETTES[palette]; expect(contrast(colours.background,colours.ink)).toBeGreaterThanOrEqual(4.5);
      expect(designSchemaV3.safeParse({...spec,palette:colours,artDirection:{...spec.artDirection,palette}}).success).toBe(true);
    }
    expect(designSchemaV3.safeParse({...spec,artDirection:{...spec.artDirection,variant:taste==="bold-street"?"pop-stage":"street-stack"}}).success).toBe(false);
    expect(designSchemaV3.safeParse({...spec,palette:{...spec.palette,ink:spec.palette.background}}).success).toBe(false);
    expect(designSchemaV3.safeParse({...spec,artDirection:{...spec.artDirection,visual:"<script>"}}).success).toBe(false);
    expect(generationPrompt(request).system).toContain(ENGINE_TASTES[taste].variants[1]);
  }
});

test("no-art regions expand, format rules differ, and factual grouping never drops clauses", () => {
  for(const taste of TASTES) {
    const spec=specFor(taste), none={...spec,artDirection:{...spec.artDirection,visual:"none" as const}};
    const resolved=FORMATS.map((format)=>resolveLayout(none,format));
    expect(new Set(resolved.map((layout)=>JSON.stringify(layout.headline))).size).toBe(4);
    for(const layout of resolved) { expect(layout.art).toBeUndefined(); expect(layout.headline.w).toBeGreaterThan(800); expect(layout.support.w).toBeGreaterThan(800); }
  }
  const copy="26 November 2026 at 18:30 IST. Venue: Lab A; entry ₹150. No tickets are required. Register at https://example.org/workshop";
  expect(copyGroups(copy).join(" ")).toBe(copy);
  expect(factualTokens(copyGroups(copy).join(" "))).toEqual(factualTokens(copy));
  expect(localDirection("bold-street","A music concert.").visual).toBe("waves");
  expect(localDirection("minimal-swiss","A chai stall.").visual).toBe("cup");
  expect(localDirection("festive-pop","A neighbourhood reading corner.").visual).toBe("none");
  const longTopic="A robotics workshop for first-year engineering students with demonstrations of collaborative technical exercises.";
  const plan=fallbackPlan({topic:longTopic,details:"",taste:"minimal-swiss"});
  expect(plan.campaign.headline).toBe("Robotics workshop"); expect(plan.campaign.supportingText).toBe(longTopic);
  const negative="A robotics workshop is not on 26 November 2026 and no alternative date has been announced by the organizers.";
  expect(fallbackPlan({topic:negative,details:"",taste:"minimal-swiss"}).campaign.headline).toBe(negative);
});

test("actual local requests cover topic range, negative facts, unsafe data and incomplete input without AI", async ({request:http}, info) => {
  const records=[];
  for(const topic of ["A cultural evening of music and dance for the campus community.","A campus robotics workshop for first-year engineering students.","Chai stall opening near campus.",'Announce a planning notebook called "OrbitPad".',"A neighbourhood reading corner.","No chairs have been supplied.",'<script>alert("hello")</script> & a robotics workshop.',"A workshop with 12 teams on 26 November 2026. Entry ₹150.","Detailed workshop information. ".repeat(25)]) {
    const response=await http.post("/api/generate",{data:{topic,taste:"minimal-swiss",mode:"local"}}), result=await response.json();
    expect(response.status()).toBe(200); expect(result.metadata.attempts).toEqual([]); expect(designSchemaV3.safeParse(result.spec).success).toBe(true);
    expect(factualTokens(`${result.spec.campaign.headline}\n${result.spec.campaign.supportingText}`)).toEqual(factualTokens(topic)); records.push({topic,result});
  }
  const response=await http.post("/api/generate",{data:{topic:"Help me announce something.",details:"I have not supplied what, when or where yet.",taste:"minimal-swiss",mode:"local"}});
  expect(response.status()).toBe(422);
  writeFileSync(info.outputPath("actual-local-topic-cases.json"),JSON.stringify({kind:"Actual local HTTP; zero provider attempts, not live AI",records},null,2));
});

test("v3 dense copy reorganizes safely, escaped text stays data, and impossible copy refuses exports", async ({page},info) => {
  const details="26 November 2026 at 18:30 IST. Venue: Lab A. Entry ₹150. No tickets are required. "+"Bring a notebook to record your ideas and discuss the workshop exercises with other participants. ".repeat(4);
  await actualLocal(page,"minimal-swiss",common.topic,details); await ready(page);
  await expect(page.locator("[data-hero]")).toHaveCount(0);
  for(const poster of await page.locator("[data-poster]").all()) { await expect(poster).toContainText("No tickets are required."); await expect(poster).toContainText("discuss the workshop exercises"); }
  await page.screenshot({path:info.outputPath("actual-dense-no-art-studio.png"),fullPage:true});
  await page.getByText("Edit campaign copy",{exact:true}).click();
  const unsafe='<script>alert("hello")</script>';
  await page.getByLabel("Headline",{exact:false}).fill(unsafe); await page.getByRole("button",{name:"Apply copy to campaign"}).click(); await ready(page);
  await expect(page.locator("[data-poster] script")).toHaveCount(0); await expect(page.locator("[data-poster] h2").first()).toHaveText(unsafe);
  await page.getByLabel("Headline",{exact:false}).fill("W\n".repeat(120).trim()); await page.getByRole("button",{name:"Apply copy to campaign"}).click();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4); await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(4);
  await expect(page.locator('[data-poster][data-correction-step="2"]')).toHaveCount(4);
  let downloads=0; page.on("download",()=>downloads++);
  await page.getByRole("button",{name:"Export YouTube thumbnail PNG",exact:true}).click(); await expect(page.getByRole("status")).toContainText("cannot keep all copy readable");
  await page.getByRole("button",{name:"Export HTML"}).click(); await expect(page.getByRole("status")).toContainText("cannot keep all copy readable"); expect(downloads).toBe(0);
  await page.screenshot({path:info.outputPath("actual-impossible-copy-refused.png"),fullPage:true});
});

for(const taste of TASTES) for(const variant of ENGINE_TASTES[taste].variants) {
  test(`actual local ${taste}/${variant}: four native exports, shared-brief taste comparison and layout quality`, async ({page}, info) => {
    const errors:string[]=[]; page.on("pageerror",(error)=>errors.push(error.message));
    const result=await actualLocal(page,taste); await page.getByLabel("Composition",{exact:true}).selectOption(variant); await ready(page);
    for(const poster of await page.locator("[data-poster]").all()) {
      expect(await poster.getAttribute("data-variant")).toBe(variant);
      const text=await poster.textContent(); for(const fact of ["26 November 2026","18:30 IST","Lab A","₹150","https://example.org/workshop"]) expect(text).toContain(fact);
      expect(JSON.parse((await poster.getAttribute("data-quality"))!)).toEqual([]);
      const floors=await poster.locator("[data-fit]").evaluateAll((fields)=>fields.map((field)=>({actual:parseFloat(getComputedStyle(field).fontSize),floor:Number((field as HTMLElement).dataset.min)})));
      expect(floors.every((entry)=>entry.actual>=entry.floor)).toBe(true);
    }
    const outputs=await exportsAndEvidence(page,info,`${taste}-${variant}`,variant===ENGINE_TASTES[taste].variants[0]);
    if(variant===ENGINE_TASTES[taste].variants[0]) { await page.setViewportSize({width:430,height:932}); await page.screenshot({path:info.outputPath(`${taste}-social-size.png`),fullPage:true}); }
    writeFileSync(info.outputPath("evidence.json"),JSON.stringify({kind:"Actual local generation with manual registry variant; identical brief across tastes",request:common,result,selectedVariant:variant,outputs},null,2));
    expect(errors).toEqual([]);
  });
}

for(const id of ["cultural-evening","technical-workshop","fact-sensitive"]) {
  test(`retained M1 ${id}: same AI copy adapted to v3, no new model call`, async ({page},info) => {
    const historical=JSON.parse(readFileSync("docs/evidence/m1/live-models.json","utf8"));
    const record=historical.records.find((item:{id:string;result:{metadata:{source:string}}})=>item.id===id&&item.result.metadata.source==="gemini");
    expect(record).toBeTruthy(); const original=record.result.spec;
    const direction=localDirection(original.taste,`${original.campaign.headline}\n${original.campaign.supportingText}`);
    const spec=designSchemaV3.parse({...original,version:3,artDirection:direction,palette:PALETTES[direction.palette],typography:{...original.typography,family:ENGINE_TASTES[original.taste as Taste].family},decoration:{...original.decoration,illustration:direction.visual==="cup"?"cup":direction.visual==="none"?"none":"abstract"}});
    expect(spec.campaign).toEqual(original.campaign);
    await page.route("**/api/generate",(route)=>route.fulfill({json:{...record.result,spec}}));
    await page.goto("/"); await page.getByLabel("What are we creating for?").fill(record.request.topic);
    await page.getByRole("radio",{name:new RegExp(PRESETS[spec.taste].name)}).click(); await page.getByRole("button",{name:"Generate campaign"}).click(); await ready(page);
    await page.screenshot({path:info.outputPath(`replayed-m1-${id}-studio.png`),fullPage:true});
    for(const format of FORMATS) { const event=page.waitForEvent("download"); await page.getByRole("button",{name:`Export ${format.name} PNG`,exact:true}).click(); const download=await event; await download.saveAs(info.outputPath(`replayed-m1-${id}-${format.id}.png`)); const png=readFileSync(info.outputPath(`replayed-m1-${id}-${format.id}.png`)); expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([format.width,format.height]); }
    writeFileSync(info.outputPath("replay-provenance.json"),JSON.stringify({kind:"Retained M1 AI copy, new deterministic M2 art direction; browser response supplied from saved JSON; zero new provider calls",id,original,spec},null,2));
  });
}

test("historical v2 actual AI specification still renders and exports through the unchanged legacy path", async ({page},info) => {
  const result=JSON.parse(readFileSync("docs/evidence/m1/live-browser.json","utf8")).result;
  expect(result.spec.version).toBe(2);
  await page.route("**/api/generate",(route)=>route.fulfill({json:result}));
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill(result.spec.campaign.topic);
  await page.getByRole("radio",{name:new RegExp(PRESETS[result.spec.taste as Taste].name)}).click();
  await page.getByRole("button",{name:"Generate campaign"}).click(); await ready(page);
  await expect(page.locator('[data-poster][data-version="3"]')).toHaveCount(0);
  for(const format of FORMATS) {
    const event=page.waitForEvent("download"); await page.getByRole("button",{name:`Export ${format.name} PNG`,exact:true}).click();
    const download=await event,path=info.outputPath(`legacy-v2-${format.id}.png`); await download.saveAs(path);
    const png=readFileSync(path); expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([format.width,format.height]);
  }
  const event=page.waitForEvent("download"); await page.getByRole("button",{name:"Export HTML"}).click(); await (await event).saveAs(info.outputPath("legacy-v2.html"));
  await page.getByRole("button",{name:"Inspect spec"}).click(); const json=page.waitForEvent("download"); await page.getByRole("button",{name:"Download JSON"}).click();
  const jsonPath=info.outputPath("legacy-v2-spec.json"); await (await json).saveAs(jsonPath); expect(JSON.parse(readFileSync(jsonPath,"utf8"))).toEqual(result.spec);
});
