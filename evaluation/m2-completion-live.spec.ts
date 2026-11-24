import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { FORMATS, PRESETS, designSchemaV3, type Taste } from "../src/lib/design";
import { generationResultSchema, type GenerationResult } from "../src/lib/generation/contracts";
import { factualTokens } from "../src/lib/generation/facts";

test("two authorized uncached v3 campaigns; persistent journal prevents accidental repeat",async({page,context},info)=>{
  test.skip(process.env.M2_LIVE_AUTHORIZED!=="two-campaigns-four-calls", "Explicit opt-in required; --list never makes calls.");
  const journalPath="docs/evidence/m2/typography/live-verification.json";
  const archived=JSON.parse(readFileSync("docs/evidence/m1/live-models.json","utf8"));
  const records: Array<Record<string,unknown>>=[];
  const journal={date:"2026-11-24",kind:"Actual new UI generation; no mocked responses or retries",model:"gemini-3.5-flash-lite",maximumCampaigns:2,maximumProviderCalls:4,records};
  // Exclusive creation is intentional. Never delete the journal to obtain a rerun.
  writeFileSync(journalPath,JSON.stringify(journal,null,2)+"\n",{flag:"wx"});
  const save=()=>writeFileSync(journalPath,JSON.stringify(journal,null,2)+"\n");
  let requests=0,totalCalls=0;
  await page.route("**/api/generate",async route=>{
    requests++;if(requests>2){await route.abort();throw new Error("Two campaign request limit reached.");}
    await route.continue();
  });
  for(const id of ["cultural-evening","fact-sensitive"]){
    const historical=archived.records.find((r:{id:string;result:GenerationResult})=>r.id===id&&r.result.metadata.model===journal.model);
    expect(historical).toBeTruthy();const request=historical.request as {topic:string;details:string;taste:Taste};
    const record:Record<string,unknown>={id,request,requestOrigin:"Exact archived primary-model request; unchanged constraints",state:"not dispatched"};records.push(record);save();
    await page.goto("/");await page.getByLabel("What are we creating for?").fill(request.topic);await page.getByLabel("Optional details").fill(request.details);
    await page.getByRole("button",{name:new RegExp(PRESETS[request.taste].name)}).click();
    await expect(page.getByLabel("What are we creating for?")).toHaveValue(request.topic);await expect(page.getByLabel("Optional details")).toHaveValue(request.details);
    record.state="dispatch pending; do not retry if interrupted";save();
    const responseEvent=page.waitForResponse(r=>r.url().endsWith("/api/generate"));const start=Date.now();
    await page.getByRole("button",{name:"Generate campaign"}).click();const response=await responseEvent;
    record.httpStatus=response.status();record.wallMs=Date.now()-start;
    const result=generationResultSchema.parse(await response.json());record.result=result;
    record.providerCalls=result.metadata.attempts.length;totalCalls+=result.metadata.attempts.length;
    record.initialContractAccepted=result.metadata.attempts[0]?.outcome==="accepted"&&result.spec.version===3;
    record.repairAttempted=result.metadata.attempts.length===2;record.state="response preserved";save();
    expect(result.metadata.attempts.length).toBeLessThanOrEqual(2);expect(totalCalls).toBeLessThanOrEqual(4);expect(result.metadata.model).toBe(journal.model);
    expect(result.metadata.cached).toBe(false);expect(designSchemaV3.safeParse(result.spec).success).toBe(true);
    const text=[result.spec.campaign.headline,result.spec.campaign.supportingText,result.spec.campaign.cta].join("\n");
    record.factualTokens={supplied:factualTokens(request.topic+"\n"+request.details),artwork:factualTokens(text)};
    const outputs:Array<Record<string,unknown>>=[];record.outputs=outputs;
    try{
      await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
      record.quality=await page.locator("[data-poster]").evaluateAll(nodes=>nodes.map(node=>({format:(node as HTMLElement).dataset.poster,issues:(node as HTMLElement).dataset.quality,corrections:(node as HTMLElement).dataset.corrections,text:node.textContent})));
      await expect(page.locator('[data-poster][data-overflow="true"]')).toHaveCount(0);
      await page.screenshot({path:info.outputPath(`${id}-studio.png`),fullPage:true});
      for(const format of FORMATS){
        const event=page.waitForEvent("download");await page.getByRole("button",{name:`Export ${format.name} PNG`,exact:true}).click();const download=await event;
        const path=info.outputPath(`${id}-${format.id}.png`);await download.saveAs(path);const bytes=readFileSync(path);
        const dimensions=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];expect(dimensions).toEqual([format.width,format.height]);outputs.push({format:format.id,path:path.replaceAll("\\","/").split("/evaluation-results/")[1],dimensions,bytes:bytes.length});save();
      }
      const htmlEvent=page.waitForEvent("download");await page.getByRole("button",{name:"Export HTML"}).click();const htmlPath=info.outputPath(`${id}.html`);await(await htmlEvent).saveAs(htmlPath);
      const html=readFileSync(htmlPath,"utf8");expect(html).toContain("data:font/woff2;base64,");expect(html).toContain("SIL OPEN FONT LICENSE Version 1.1");
      const offline=await context.newPage();const remote:string[]=[];await offline.route(/https?:\/\//,route=>{remote.push(route.request().url());return route.abort();});await offline.goto(pathToFileURL(htmlPath).href);await offline.evaluate(()=>document.fonts.ready);await expect(offline.locator("[data-poster]")).toHaveCount(4);expect(remote).toEqual([]);record.offlineRemoteRequests=remote;await offline.close();
      await page.getByRole("button",{name:"Inspect spec"}).click();const jsonEvent=page.waitForEvent("download");await page.getByRole("button",{name:"Download JSON"}).click();const jsonPath=info.outputPath(`${id}-spec.json`);await(await jsonEvent).saveAs(jsonPath);expect(JSON.parse(readFileSync(jsonPath,"utf8"))).toEqual(result.spec);await page.getByRole("button",{name:"Hide spec"}).click();
      await page.setViewportSize({width:430,height:932});await page.screenshot({path:info.outputPath(`${id}-social-size.png`),fullPage:true});await page.setViewportSize({width:1440,height:1050});record.state="actual generation and all exports preserved";
    }catch(error){record.artworkError=error instanceof Error?error.message:"Artwork verification failed";record.state="response preserved; artwork failure retained";await page.screenshot({path:info.outputPath(`${id}-artwork-failure.png`),fullPage:true});}
    save();
  }
  Object.assign(journal,{completed:true,campaignRequests:requests,reportedProviderCalls:totalCalls,billing:"Not independently verified; unavailable usage is not zero cost"});save();
  expect(requests).toBe(2);expect(records.every(record=>!record.artworkError)).toBe(true);
});
