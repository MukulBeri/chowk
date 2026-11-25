import { test, expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FORMATS, PRESETS, TASTES, designSchema } from "../src/lib/design";
import { readJsonBody, JsonBodyError } from "../src/server/json-body";
import { createConfiguredEngine } from "../src/server/configured-engine";
import { DEFAULT_CONFIG } from "../src/server/engine";
import { fallbackPlan } from "../src/lib/generation/planner";
import type { GenerationRequest } from "../src/lib/generation/contracts";

const robotics = { topic: "Campus robotics workshop for students.", details: "12 teams. 26 November 2026 at 18:30 IST. Venue: Lab A; Entry ₹150. Register at https://example.org/workshop." };
type Quality = { state: "ready" | "failed"; formats: { id: string; issues: string[]; exportReady: boolean; corrections: string[] }[] };
async function quality(page: Page): Promise<Quality> {
  await page.waitForFunction(() => Boolean((window as unknown as { yarcCampaignReady?: unknown }).yarcCampaignReady));
  return page.evaluate(() => (window as unknown as { yarcCampaignReady: Promise<Quality> }).yarcCampaignReady);
}
async function compare(page: Page, first: Buffer, second: Buffer, delta: number) {
  return page.evaluate(async ({a,b,delta}) => {
    const images = await Promise.all([a,b].map(async data => { const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode(); return image; }));
    if(images[0].width!==images[1].width||images[0].height!==images[1].height)return 1;
    const pixels=images.map(image=>{const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext("2d")!;ctx.drawImage(image,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height).data;});
    let changed=0;for(let i=0;i<pixels[0].length;i+=4)if([0,1,2,3].some(c=>Math.abs(pixels[0][i+c]-pixels[1][i+c])>delta))changed++;
    return changed/(images[0].width*images[0].height);
  },{a:first.toString("base64"),b:second.toString("base64"),delta});
}

test("shared JSON reader enforces MIME, streaming byte limit, UTF-8, JSON and bounded duration", async () => {
  for(const type of ['application/json','Application/JSON; charset="UTF-8"','application/json; charset=utf-8'])expect(await readJsonBody(new Request("http://local",{method:"POST",headers:{"Content-Type":type},body:'{"ok":true}'}),100)).toEqual({ok:true});
  for(const type of ['application/json-invalid','text/plain','application/json; charset=latin1','application/json; broken'])await expect(readJsonBody(new Request("http://local",{method:"POST",headers:{"Content-Type":type},body:'{}'}),100)).rejects.toMatchObject({status:415});
  await expect(readJsonBody(new Request("http://local",{method:"POST",headers:{"Content-Type":"application/json"},body:Buffer.from([0xff,0xfe])}),100)).rejects.toMatchObject({status:400});
  await expect(readJsonBody(new Request("http://local",{method:"POST",headers:{"Content-Type":"application/json"},body:'{'}),100)).rejects.toMatchObject({status:400});
  let cancelled=false;const slow=new ReadableStream({cancel(){cancelled=true;}});
  await expect(readJsonBody(new Request("http://local",{method:"POST",headers:{"Content-Type":"application/json"},body:slow,duplex:"half"} as RequestInit),100,20)).rejects.toBeInstanceOf(JsonBodyError);expect(cancelled).toBe(true);
  const chunks=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(60));controller.enqueue(new Uint8Array(60));controller.close();}});
  await expect(readJsonBody(new Request("http://local",{method:"POST",headers:{"Content-Type":"application/json"},body:chunks,duplex:"half"} as RequestInit),100)).rejects.toMatchObject({status:413});
});

test("server inference requires exact opt-in; disabled configuration cannot even construct a provider", async ({},info) => {
  const records=[];for(const enabled of [undefined,"false","TRUE","1",""]){
    let constructed=0;const engine=createConfiguredEngine(DEFAULT_CONFIG,{GEMINI_ENABLED:enabled,GEMINI_API_KEY:"synthetic-not-a-real-key"},()=>{constructed++;throw Error("Provider must not be constructed");});
    for(const mode of ["auto","local"] as const){const result=await engine.generate({topic:"Campus poetry circle.",details:"",taste:"minimal-swiss",mode});expect(result.metadata.attempts).toEqual([]);expect(result.metadata.model).toBeNull();expect(result.metadata.fallbackReason).toBe(mode==="auto"?"disabled":"requested-local");records.push({enabled:enabled??"unset",mode,metadata:result.metadata});}
    expect(constructed).toBe(0);
  }
  let calls=0;const request:GenerationRequest={...robotics,taste:"minimal-swiss",mode:"auto"};
  const allowed=createConfiguredEngine(DEFAULT_CONFIG,{GEMINI_ENABLED:"true",GEMINI_API_KEY:"synthetic-not-a-real-key"},()=>async()=>{calls++;return{raw:fallbackPlan(request),usage:{inputTokens:0,outputTokens:0,thinkingTokens:0,totalTokens:0},finishReason:"STOP"};});
  expect((await allowed.generate(request)).metadata.source).toBe("gemini");expect(calls).toBe(1);
  writeFileSync(info.outputPath("disabled-and-mocked-opt-in.json"),JSON.stringify({kind:"Injected provider only for opt-in proof; zero live calls",records,mockedCalls:calls},null,2));
});

test("real disabled HTTP routes reject bypass attempts and malformed/oversized inputs", async ({request},info) => {
  const records=[];
  for(const endpoint of ["generate","render"]){
    const response=await request.post(`/api/${endpoint}`,{headers:{"X-Gemini-Enabled":"true","X-Goog-Api-Key":"synthetic-not-a-real-key"},data:{...robotics,taste:"minimal-swiss",mode:"auto"}});const result=await response.json();expect(response.status()).toBe(200);expect(result.metadata.fallbackReason).toBe("disabled");expect(result.metadata.attempts).toEqual([]);expect(result.metadata.model).toBeNull();
    const bypass=await request.post(`/api/${endpoint}`,{data:{...robotics,taste:"minimal-swiss",mode:"auto",GEMINI_ENABLED:true}});expect(bypass.status()).toBe(400);
    records.push({endpoint,metadata:result.metadata,rendering:result.rendering??null,bypassStatus:bypass.status()});
  }
  for(const endpoint of ["design-spec","generate","render"]){
    const data={topic:"Campus poetry circle.",taste:"minimal-swiss",...(endpoint==="design-spec"?{}:{mode:"local"})};
    expect((await request.post(`/api/${endpoint}`,{headers:{"Content-Type":'Application/JSON; charset="utf-8"'},data:JSON.stringify(data)})).status()).toBe(200);
    for(const [type,body,status] of [["application/json-invalid","{}",415],["application/json; charset=latin1","{}",415],["application/json","{",400],["application/json"," ".repeat(13000),413]] as const)expect((await request.post(`/api/${endpoint}`,{headers:{"Content-Type":type},data:body})).status()).toBe(status);
    expect((await request.post(`/api/${endpoint}`,{headers:{"Content-Type":"application/json"},data:Buffer.from([0xff])})).status()).toBe(400);
  }
  const empty=await request.post('/api/render',{data:{topic:"Create a poster.",details:"No supplied organization name or event date.",taste:"minimal-swiss",mode:"auto"}});expect(empty.status()).toBe(422);expect((await empty.json()).spec).toBeUndefined();
  writeFileSync(info.outputPath("actual-disabled-http.json"),JSON.stringify({kind:"Actual disabled local server HTTP, zero attempts",records},null,2));
});

test("notices and low-risk security headers are delivered without changing font/asset attribution", async ({request,page},info) => {
  const response=await request.get('/api/notices');expect(response.status()).toBe(200);const text=await response.text();
  for(const file of ['docs/licenses/NOTICES.txt','docs/licenses/NOTICE_SUPPLEMENT.txt','docs/licenses/Tabler-MIT.txt','public/fonts/OFL-anton.txt','public/fonts/OFL-inter.txt','public/fonts/OFL-fredoka.txt'])expect(text).toContain(readFileSync(file,'utf8'));
  for(const [header,value] of Object.entries({"x-content-type-options":"nosniff","x-frame-options":"DENY","referrer-policy":"strict-origin-when-cross-origin"}))expect(response.headers()[header]).toBe(value);
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  await page.goto('/');await expect(page.getByRole('link',{name:'Licenses and notices'})).toBeVisible();
  await page.getByLabel('What are we creating for?').fill('Campus poetry circle.');await page.getByRole('button',{name:'Generate campaign'}).click();await expect(page.getByRole('status')).toContainText('Server-side AI is disabled; no provider request.');await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  await page.screenshot({path:info.outputPath('actual-disabled-studio.png'),fullPage:true});writeFileSync(info.outputPath('notice-response.txt'),text);
});

for(const taste of TASTES)test(`HTTP HTML ${taste}: canonical artwork, native exports and accepted M4 compatibility`,async({page,context,request},info)=>{
  const response=await request.post('/api/render',{data:{...robotics,taste,mode:'local'}});expect(response.status()).toBe(200);const result=await response.json();
  expect(result.sizes).toEqual(FORMATS);expect(result.rendering.measuredOnServer).toBe(false);expect(result.rendering.state).toBe('requires-browser-verification');expect(result.metadata.attempts).toEqual([]);expect(designSchema.safeParse(result.spec).success).toBe(true);
  const html=info.outputPath(`${taste}.html`);writeFileSync(html,result.html);writeFileSync(info.outputPath(`${taste}-spec.json`),JSON.stringify(result.spec,null,2));
  const consumer=await context.newPage();let external=0;const errors:string[]=[];consumer.on('pageerror',e=>errors.push(e.message));await consumer.route(/https?:\/\//,r=>{external++;return r.abort();});await consumer.goto(pathToFileURL(html).href);const measured=await quality(consumer);expect(measured.state).toBe('ready');expect(measured.formats).toHaveLength(4);expect(external).toBe(0);expect(errors).toEqual([]);
  await page.goto('/');await page.getByLabel('What are we creating for?').fill(robotics.topic);await page.getByLabel('Optional details').fill(robotics.details);await page.getByRole('radio',{name:PRESETS[taste].name,exact:true}).check();await page.getByRole('button',{name:'Use local planner'}).click();await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  const baselineRoot='test-results/m4-artwork-source-final-04';const baseline=readdirSync(baselineRoot).find(dir=>dir.startsWith('m4-artwork-robotics-')&&readFileSync(`${baselineRoot}/${dir}/evidence.json`,'utf8').includes(`"taste": "${taste}"`))!;
  const outputs=[];await consumer.setViewportSize({width:2000,height:1450});
  for(const format of FORMATS){
    const apiNode=consumer.locator(`[data-poster="${format.id}"]`);await expect(apiNode).toHaveAttribute('data-export-ready','true');
    expect(await apiNode.evaluate(node=>({w:(node as HTMLElement).offsetWidth,h:(node as HTMLElement).offsetHeight}))).toEqual({w:format.width,h:format.height});
    const copy=await apiNode.locator('[data-fit]').evaluateAll(nodes=>nodes.map(node=>node.textContent).join('\n'));for(const fact of ['students','12 teams','26 November 2026','18:30 IST','Lab A','₹150','https://example.org/workshop'])expect(copy).toContain(fact);
    await apiNode.evaluate(node=>Object.assign((node as HTMLElement).style,{position:'fixed',left:'0',top:'0',zIndex:'99999'}));const apiCapture=await apiNode.screenshot({path:info.outputPath(`${taste}-${format.id}-api-dom.png`)});await apiNode.evaluate(node=>Object.assign((node as HTMLElement).style,{position:'relative',left:'',top:'',zIndex:''}));
    const download=page.waitForEvent('download');await page.getByRole('button',{name:`Export ${format.name} PNG`,exact:true}).click();const file=info.outputPath(`${taste}-${format.id}.png`);await(await download).saveAs(file);const png=readFileSync(file);expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([format.width,format.height]);
    await page.setViewportSize({width:2000,height:1450});await page.locator(`[data-poster="${format.id}"]`).evaluate(node=>{const clone=node.cloneNode(true) as HTMLElement;clone.dataset.nativeCapture='true';Object.assign(clone.style,{position:'fixed',left:'0',top:'0',zIndex:'99999'});document.body.append(clone);});
    const native=await page.locator('[data-native-capture]').screenshot({path:info.outputPath(`${taste}-${format.id}-studio-dom.png`)});await page.locator('[data-native-capture]').evaluate(node=>node.remove());
    const apiVsStudio=await compare(page,apiCapture,native,8),pngVsDom=await compare(page,png,native,20),oldVsNew=await compare(page,readFileSync(`${baselineRoot}/${baseline}/robotics-${taste}-${format.id}.png`),png,8);
    expect(apiVsStudio).toBeLessThanOrEqual(.001);expect(pngVsDom).toBeLessThanOrEqual(.015);expect(oldVsNew).toBeLessThanOrEqual(.001);outputs.push({format:format.id,apiVsStudio,pngVsDom,oldVsNew,dimensions:[format.width,format.height]});
  }
  await page.setViewportSize({width:1440,height:900});await page.screenshot({path:info.outputPath(`${taste}-studio.png`),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:info.outputPath(`${taste}-mobile.png`),fullPage:true});
  writeFileSync(info.outputPath('actual-evidence.json'),JSON.stringify({kind:'Actual explicit local HTTP HTML and canonical studio downloads; no live/mocked/replayed generation',request:{...robotics,taste,mode:'local'},metadata:result.metadata,rendering:result.rendering,measured,outputs,externalRequests:external,errors,browser:context.browser()?.version()},null,2));await consumer.close();
});

for(const item of [
  {id:'short',topic:'Campus poetry circle.',details:'',taste:'festive-pop',expected:'ready'},
  {id:'dense',...robotics,details:robotics.details+' Bring a notebook.',taste:'minimal-swiss',expected:'ready'},
  {id:'dense-overload',...robotics,details:robotics.details+' Bring a notebook. No certificates. Registration is not open yet. Materials will not be supplied.',taste:'minimal-swiss',expected:'failed'},
  {id:'environment',topic:'Campaign to reduce plastic waste.',details:'Encourage people to bring a reusable bottle. No supplied statistics, organization name or event date.',taste:'bold-street',expected:'ready'},
  {id:'impossible',topic:'Headline: '+ 'W'.repeat(220),details:'No supplied date.',taste:'bold-street',expected:'failed'},
  {id:'hostile-data',topic:'Public copy: <img src="https://invalid.example/a" onerror="window.injected=true"> & campus announcement.',details:'<svg onload="window.injected=true"></svg>',taste:'minimal-swiss',expected:null},
  {id:'camera',topic:'Photography workshop for students.',details:'No supplied date, venue or fee.',taste:'festive-pop',expected:'ready'},
])test(`returned HTML ${item.id}: bounded fitting, data safety and honest readiness`,async({request,context,page:studio},info)=>{
  const response=await request.post('/api/render',{data:{topic:item.topic,details:item.details,taste:item.taste,mode:'local'}});expect(response.status()).toBe(200);const result=await response.json();const file=info.outputPath(`${item.id}.html`);writeFileSync(file,result.html);
  const page=await context.newPage();let requests=0;await page.route(/https?:\/\//,r=>{requests++;return r.abort();});await page.goto(pathToFileURL(file).href);const measured=await quality(page);if(item.expected)expect(measured.state).toBe(item.expected);expect(requests).toBe(0);
  expect(await page.evaluate(()=>(window as unknown as {injected?:boolean}).injected)).toBeUndefined();expect(await page.locator('[data-poster] img, [data-poster] script, [data-poster] svg[onload]').count()).toBe(0);
  if(item.id==='environment'){expect(await page.locator('[data-poster]').first().innerText()).not.toContain('No supplied');expect(result.interpretation.missingInformation).toContain('No supplied statistics, organization name or event date.');}
  if(item.id==='impossible'){for(const format of measured.formats){expect(format.exportReady).toBe(false);expect(format.issues).toContain('TEXT_OVERFLOW');}expect(await page.locator('[data-poster] h2').first().textContent()).toBe('W'.repeat(220));}
  if(item.id==='dense-overload'){
    await studio.goto('/');await studio.getByLabel('What are we creating for?').fill(item.topic);await studio.getByLabel('Optional details').fill(item.details);await studio.getByRole('radio',{name:'Minimal Swiss',exact:true}).check();await studio.getByRole('button',{name:'Use local planner'}).click();await expect(studio.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
    for(const format of measured.formats){const canonical=studio.locator(`[data-poster="${format.id}"]`);expect(JSON.parse(await canonical.getAttribute('data-quality')??'[]')).toEqual(format.issues);for(const negative of ['No certificates.','Registration is not open yet.','Materials will not be supplied.'])expect(await page.locator(`[data-poster="${format.id}"]`).textContent()).toContain(negative);}
  }
  if(item.id==='camera')expect(await page.locator('details').last().locator('pre').textContent()).toBe(readFileSync('docs/licenses/Tabler-MIT.txt','utf8'));
  await page.screenshot({path:info.outputPath(`${item.id}.png`),fullPage:true});writeFileSync(info.outputPath('quality.json'),JSON.stringify({kind:'Actual local returned HTML, not fresh AI',request:item,metadata:result.metadata,measured,externalRequests:requests},null,2));await page.close();
});

test("consumer without trusted script stays unmeasured; missing embedded fonts fail closed",async({request,context,browser},info)=>{
  const result=await(await request.post('/api/render',{data:{...robotics,taste:'minimal-swiss',mode:'local'}})).json();
  const noScriptContext=await browser.newContext({javaScriptEnabled:false});const noScript=await noScriptContext.newPage();const original=info.outputPath('original-unmeasured.html');writeFileSync(original,result.html);await noScript.goto(pathToFileURL(original).href);expect(await noScript.locator('html').getAttribute('data-render-state')).toBe('pending');expect(await noScript.locator('[data-export-ready="true"]').count()).toBe(0);await noScriptContext.close();
  const broken=info.outputPath('tampered-missing-fonts-fixture.html');writeFileSync(broken,result.html.replace(/@font-face\{[^}]+\}/g,''));const page=await context.newPage();await page.goto(pathToFileURL(broken).href);const measured=await quality(page);expect(measured.state).toBe('failed');expect(measured.formats.every(format=>format.issues.includes('FONT_UNAVAILABLE')&&!format.exportReady)).toBe(true);writeFileSync(info.outputPath('font-refusal.json'),JSON.stringify({kind:'Deliberately tampered fixture based on actual API HTML, not an actual font outage',measured},null,2));await page.close();
});
