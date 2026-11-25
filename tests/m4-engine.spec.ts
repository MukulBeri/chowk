import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import {designSchema,designSchemaV3,FORMATS} from "../src/lib/design";
import {fallbackPlan,validatePlan,planToSpec} from "../src/lib/generation/planner";
import {interpretBrief,IncompleteBriefError} from "../src/lib/generation/brief";
import {factualIssues,factualTokens} from "../src/lib/generation/facts";
import {resolveLayout} from "../src/lib/design-engine/layout";
import {hierarchyGroups} from "../src/lib/design-engine/subject-layout";
import {generationPrompt} from "../src/server/gemini";
import {GenerationEngine,DEFAULT_CONFIG} from "../src/server/engine";
import {M4_CORPUS} from "../evaluation/m4-corpus";
import {createHash} from "node:crypto";
import {transpileModule,ModuleKind,ScriptTarget} from "typescript";
import {pathToFileURL} from "node:url";
import tabler from "../src/lib/design-engine/tabler-asset.json";
import {TASTES,PRESETS} from "../src/lib/design";

test("M4 corpus preserves public facts, metadata and concise hierarchy through the shared strict contract",({},info)=>{
  const records=[];
  for(const request of M4_CORPUS){
    const plan=fallbackPlan(request),copy=[plan.campaign.eyebrow,plan.campaign.headline,plan.campaign.supportingText,plan.campaign.cta??""].join("\n");
    const publicInput=interpretBrief(request).content.join("\n");
    expect(validatePlan(plan,request).issues,request.id).toEqual([]);
    expect(factualTokens(copy),request.id).toEqual(factualTokens(publicInput));
    expect(copy).not.toMatch(/No supplied|has not been supplied|Do not invent/);
    expect(plan.artDirection.treatment).toBe("subject-led");
    expect(hierarchyGroups(plan.campaign.supportingText).join(" ")).toBe(plan.campaign.supportingText.replace(/\s+/g," "));
    const spec=designSchemaV3.parse(planToSpec(plan,request,"deterministic-fallback"));
    records.push({request,plan,layouts:FORMATS.map(f=>({format:f.id,...resolveLayout(spec,f)}))});
    for(const f of FORMATS){const layout=resolveLayout(spec,f);expect(layout.floors.support).toBeGreaterThanOrEqual(f.width>f.height?30:32);}
  }
  writeFileSync(info.outputPath("local-planning-corpus.json"),JSON.stringify(records,null,2));
  const segmented="Keep this supplied clause; ".repeat(60).trim();
  const bounded=hierarchyGroups(segmented);expect(bounded.length).toBeLessThanOrEqual(8);expect(bounded.join(" ")).toBe(segmented);
});

test("M4 additions reject unsupported visual/treatment/registry combinations and keep old v3 specs valid",()=>{
  const request=M4_CORPUS[0],plan=fallbackPlan(request),spec=planToSpec(plan,request,"deterministic-fallback");
  expect(designSchema.safeParse(spec).success).toBe(true);
  expect(validatePlan({...plan,artDirection:{...plan.artDirection,visual:"aroma"}},request).issues).toContain("irrelevant-subject-visual");
  expect(designSchema.safeParse({...spec,artDirection:{...plan.artDirection,treatment:undefined}}).success).toBe(false);
  expect(validatePlan({...plan,artDirection:{...plan.artDirection,treatment:"<script>"}},request).issues).toEqual(["invalid-structure"]);
  const old=JSON.parse(readFileSync("docs/example-design-spec-v3.json","utf8"));expect(designSchemaV3.safeParse(old).success).toBe(true);expect(old.artDirection.treatment).toBeUndefined();
});

test("negative facts and corrected logistics cannot silently reverse or disappear",({},info)=>{
  const cases=[
    {input:"AI workshop. No certificates.",bad:"AI workshop. Certificates.",expected:"missing-negative-fact"},
    {input:"Coding contest. No entry fee.",bad:"Coding contest. Entry fee.",expected:"missing-negative-fact"},
    {input:"Event. Venue changed from Lab A to Lab C.",bad:"Event. Venue: Lab A.",expected:"missing-corrected-fact"},
    {input:"Workshop. The venue is not confirmed.",bad:"Workshop. The venue is confirmed.",expected:"missing-negative-fact"},
  ];
  const records=cases.map(c=>({...c,issues:factualIssues(c.input,c.bad),preserved:factualIssues(c.input,c.input)}));
  writeFileSync(info.outputPath("fact-guard-findings.json"),JSON.stringify(records,null,2));
  for(const r of records){expect(r.issues,r.input).toContain(r.expected);expect(r.preserved).toEqual([]);}
});

test("new direction participates in one safe repair and honest fallback without changing runtime limits",async()=>{
  const request=M4_CORPUS[0],good=fallbackPlan(request),calls:{repair?:string[]}[]=[];
  const engine=new GenerationEngine(DEFAULT_CONFIG,async input=>{calls.push({repair:input.repair});return {raw:calls.length===1?{...good,artDirection:{...good.artDirection,visual:"aroma"}}:good,usage:{inputTokens:0,outputTokens:0,thinkingTokens:0,totalTokens:0},finishReason:"STOP"};});
  const result=await engine.generate({...request,mode:"auto"});expect(calls).toHaveLength(2);expect(result.metadata.source).toBe("gemini");expect(calls[1].repair?.join(" ")).toContain("irrelevant-subject-visual");
  expect(generationPrompt(request).system).toContain("subject-led");
  expect(()=>fallbackPlan({...request,topic:"Create a poster.",details:"No supplied name, date or price."})).toThrow(IncompleteBriefError);
});

test("editorial rules generalize to supplied audiences and drinks while keeping explicit headlines",()=>{
  const custom={topic:"Community robotics workshop for faculty.",details:"8 teams. No parking is available.",taste:"bold-street" as const};
  const plan=fallbackPlan(custom);expect(plan.campaign.headline).toBe("Community robotics workshop");expect(plan.campaign.eyebrow).toBe("For faculty · 8 teams");expect(plan.campaign.supportingText).toBe("No parking is available.");expect(validatePlan(plan,custom).issues).toEqual([]);
  const tea=fallbackPlan({...custom,topic:"A campus chai cart serving hot ginger chai.",details:""});expect(tea.campaign.headline).toBe("Hot ginger chai.");expect(tea.campaign.supportingText).toBe("A campus chai cart.");
  const headline="Cultural evening of music and dance.";expect(fallbackPlan({...custom,topic:`Headline: ${headline}`,details:""}).campaign.headline).toBe(headline);
});

test("measured sibling collisions and obstructing art are rejected despite z-index or pointer-events",async({page},info)=>{
  // Authored isolated DOM geometry fixture, not artwork or model-generated code.
  const code=transpileModule(readFileSync("src/lib/design-engine/quality.ts","utf8"),{compilerOptions:{module:ModuleKind.CommonJS,target:ScriptTarget.ES2022}}).outputText;
  await page.setContent('<div id="canvas" style="position:relative;width:1000px;height:800px;background:rgb(255,255,255)"><div data-fit data-role="support" data-min="34" data-max="34" style="position:absolute;left:40px;top:80px;width:600px;height:300px;color:rgb(0,0,0);font-family:Arial"><p data-copy-group style="position:absolute;left:0;top:0;margin:0;width:300px;height:60px">First supplied clause.</p><p data-copy-group style="position:absolute;left:0;top:0;margin:0;width:300px;height:60px">Second supplied clause.</p></div><div data-hero style="position:absolute;left:40px;top:80px;width:200px;height:200px;z-index:-10;pointer-events:none"></div></div>');
  await page.addScriptTag({content:`window.m4Quality = (()=>{const exports={};${code};return exports.fitAndInspect;})()`});
  const issues=await page.evaluate(()=>{const w=window as unknown as {m4Quality:(root:HTMLElement)=>string[]};return w.m4Quality(document.querySelector<HTMLElement>('#canvas')!);});
  expect(issues).toContain("TEXT_OVERLAP");expect(issues).toContain("DECOR_OVER_TEXT");
  writeFileSync(info.outputPath("geometry-fixture.json"),JSON.stringify({kind:"Authored DOM fixture; not artistic quality evidence",issues},null,2));
});

for(const taste of TASTES)test(`approved camera/${taste}: actual native four-format and portable notice`,async({page},info)=>{
  expect(createHash("sha256").update(readFileSync("docs/licenses/Tabler-MIT.txt")).digest("hex")).toBe(tabler.license.sha256);
  await page.goto("/create");await page.getByLabel("What are we creating for?").fill("Photography workshop for students.");await page.getByLabel("Optional details").fill("No supplied date, venue or fee.");await page.getByRole("radio",{name:new RegExp(PRESETS[taste].name)}).click();
  const response=page.waitForResponse(r=>r.url().endsWith("/api/generate"));await page.getByRole("button",{name:"Use local planner"}).click();const result=await(await response).json();expect(result.metadata.attempts).toEqual([]);expect(result.spec.artDirection.visual).toBe("camera");
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);await expect(page.locator('[data-asset="tabler-camera"]')).toHaveCount(4);
  for(const f of FORMATS){const event=page.waitForEvent("download");await page.getByRole("button",{name:`Export ${f.name} PNG`,exact:true}).click();const file=info.outputPath(`camera-${taste}-${f.id}.png`);await(await event).saveAs(file);const b=readFileSync(file);expect([b.readUInt32BE(16),b.readUInt32BE(20)]).toEqual([f.width,f.height]);}
  const html=page.waitForEvent("download");await page.getByRole("button",{name:"Export HTML"}).click();const file=info.outputPath(`camera-${taste}.html`);await(await html).saveAs(file);
  const offline=await page.context().newPage();let external=0;await offline.route("http{,s}://**",r=>{external++;return r.abort();});await offline.goto(pathToFileURL(file).href);await expect(offline.locator('[data-asset="tabler-camera"]')).toHaveCount(4);await expect(offline.locator('body')).toContainText(tabler.license.notice.trim());expect(external).toBe(0);await offline.close();
  writeFileSync(info.outputPath("camera-result.json"),JSON.stringify({kind:"Actual local planning and retained one-asset native integration; no AI calls",result,tabler},null,2));
});

test("whole-word headline fitting keeps expressive intact and refuses an impossible unbroken token",async({page},info)=>{
  await page.goto("/create");await page.getByLabel("What are we creating for?").fill("Premium perfume campaign with a refined, understated mood.");await page.getByRole("radio",{name:"Minimal Swiss",exact:true}).check();await page.getByRole("button",{name:"Use local planner"}).click();
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
  const words=await page.locator('[data-poster] h2').evaluateAll(nodes=>nodes.map(node=>{const text=node.firstChild!;const index=text.textContent!.indexOf("expressive");const range=document.createRange();range.setStart(text,index);range.setEnd(text,index+"expressive".length);return{font:parseFloat(getComputedStyle(node).fontSize),wordFragments:range.getClientRects().length};}));
  expect(words.every(w=>w.wordFragments===1)).toBe(true);writeFileSync(info.outputPath("whole-word-fitting.json"),JSON.stringify({kind:"Actual local measured headline geometry",words},null,2));
  await page.getByText("Edit campaign copy",{exact:true}).click();await page.getByLabel("Headline",{exact:false}).fill("W".repeat(200));await page.getByRole("button",{name:"Apply copy to campaign"}).click();await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(4);
  let downloads=0;page.on("download",()=>downloads++);await page.getByRole("button",{name:"Export HTML"}).click();await expect(page.getByRole("status")).toContainText("cannot keep all copy readable");expect(downloads).toBe(0);
});
