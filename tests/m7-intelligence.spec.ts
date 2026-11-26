import {writeFileSync} from "node:fs";
import { test, expect } from "@playwright/test";
import { fallbackPlan, validatePlan, planToSpec } from "../src/lib/generation/planner";
import { interpretCreativeBrief } from "../src/lib/generation/creative-brief";
import { validatedConcepts } from "../src/lib/generation/concepts";
import { designSchema, FORMATS } from "../src/lib/design";
import { resolveLayout } from "../src/lib/design-engine/layout";
import { M7_CORPUS } from "../evaluation/m7-corpus";
import { createMetaAdapter, META_RUNTIME_ENABLED, MetaError } from "../src/server/meta";
import { shareRasterResources, assetLayerSchema } from "../src/lib/design-engine/assets";
import { inspectRaster } from "../src/server/raster-validation";
import { deflateSync } from "node:zlib";
function syntheticPng(animated=false) {
 const chunk=(type:string,data:Buffer)=>{const kind=Buffer.from(type),payload=Buffer.concat([kind,data]);let crc=0xffffffff;for(const b of payload){crc^=b;for(let i=0;i<8;i++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}const size=Buffer.alloc(4),check=Buffer.alloc(4);size.writeUInt32BE(data.length);check.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([size,payload,check]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(4);header.writeUInt32BE(4,4);header[8]=8;header[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",header),...(animated?[chunk("acTL",Buffer.alloc(8))]:[]),chunk("IDAT",deflateSync(Buffer.alloc(4*(1+4*4)))),chunk("IEND",Buffer.alloc(0))]);
}
const request = {...M7_CORPUS[3],treatment:"creative-led" as const,mode:"local" as const};
const metaMockPlan=()=>{const plan=fallbackPlan(request);return {...plan,campaign:{...plan.campaign,cta:""}};};
test("M7: atmosphere instruction is metadata while negative factual statements remain public",()=>{
 const b=interpretCreativeBrief(request),p=fallbackPlan(request);
 expect(b.directions).toContain("Create a warm, sophisticated editorial atmosphere.");
 expect(b.facts.some(f=>/atmosphere/.test(f.text))).toBe(false);
 expect(p.campaign.supportingText).not.toContain("atmosphere");
 for(const detail of ["No certificates will be issued.","No chairs have been supplied.","Do not include nuts.","Use a premium ceramic pen holder."]){const r={...request,details:detail};expect(fallbackPlan(r).campaign.supportingText).toContain(detail);}
});
test("M7: every corpus plan has exact facts and names, with four valid bounded allocations",()=>{
 for(const item of M7_CORPUS){const r={...item,treatment:"creative-led" as const},p=fallbackPlan(r);expect(validatePlan(p,r).issues,item.id).toEqual([]);const spec=designSchema.parse(planToSpec(p,r,"deterministic-fallback"));expect(spec.version).toBe(3);if(spec.version!==3)continue;for(const f of spec.creativeContent!.facts)expect(JSON.stringify(spec.campaign).replace(/\\n/g," "),item.id).toContain(f.text);for(const f of FORMATS){const l=resolveLayout(spec,f);expect(l.support.h).toBeGreaterThan(0);expect(l.floors.support).toBeGreaterThanOrEqual(34);}}
});
test("M7: unsolicited product branding and competition activity are rejected",()=>{const p=fallbackPlan(request);for(const supportingText of ["CHOWK presents.","Join the competition.","Bring your builds.","A hands-on workshop."]){expect(validatePlan({...p,campaign:{...p.campaign,supportingText}},request).plan).toBeUndefined();}});
test("M7: swapped drink prices cannot be disguised by an intact fact ledger",()=>{const p=fallbackPlan(request);expect(validatePlan({...p,campaign:{...p.campaign,supportingText:"Coffee ₹29 and tea ₹49."}},request).issues).toContain("reconstructed-public-fact");});
test("M7: appended ledger cannot hide a contradictory certificate promise or venue label",({},info)=>{const r={...request,topic:"Student robotics workshop.",details:"Venue: Lab A. No certificates."},p=fallbackPlan(r);const results=["Certificates included.","Venue: Lab B."].map(claim=>({claim,validation:validatePlan({...p,campaign:{...p.campaign,supportingText:p.campaign.supportingText+"\n"+claim}},r)}));for(const result of results)expect(result.validation.issues).toContain("reconstructed-public-fact");expect(validatePlan(p,r).issues).toEqual([]);writeFileSync(info.outputPath("factual-contradiction-after.json"),JSON.stringify({provenance:"Deterministic regression fixture, not a historical provider failure",results},null,2));});
test("M7: concepts are distinct from local recipes and unsafe or duplicate candidates are filtered",()=>{const p=fallbackPlan(request),c={version:1,id:"first",origin:"local",plan:p};expect(validatedConcepts([c,{...c,id:"duplicate"},{...c,id:"unsafe",plan:{...p,campaign:{...p.campaign,headline:"CHOWK"}}}],request)).toHaveLength(1);});
test("M7: dense boundary, conflicting venues, subjectless and hostile input remain honest",()=>{
 const forty=Array.from({length:39},(_,i)=>`Public detail ${i+1}.`).join(" ");expect(interpretCreativeBrief({...request,details:forty}).facts).toHaveLength(40);
 expect(()=>interpretCreativeBrief({...request,details:forty+" Another fact."})).toThrow(/too many factual/);
 const b=interpretCreativeBrief({...request,details:"Venue: Hall A. Venue: Hall B."});expect(b.ambiguities).toHaveLength(1);
 for(const topic of ["Create a poster.","<script>alert(1)</script>"])expect(()=>fallbackPlan({...request,topic,details:""})).toThrow();
});
test("M7: raster URL/markup/cap injection is rejected and shared resources are deduplicated",()=>{
 for(const dataUrl of ["https://unsafe.example/a.png","data:image/svg+xml,<svg onload=alert(1)>","data:image/png;base64,AAAA"]){expect(assetLayerSchema.safeParse({dataUrl}).success).toBe(false);}
 const data="data:image/png;base64,aGVsbG8=";const r=shareRasterResources(`<div style="background-image:url(${data})"></div><div style='background-image: url("${data}")'></div>`);expect(r.html).not.toContain(data);expect(r.css.split(data)).toHaveLength(2);
});
test("M7 Meta: disabled gate constructs no transport or provider and never reads a key",()=>{let factories=0;expect(META_RUNTIME_ENABLED).toBe(false);const options={enabled:false,get key():string{throw Error("key access");}};expect(createMetaAdapter(options,()=>{factories++;throw Error();})).toBeUndefined();expect(factories).toBe(0);});
test("M7 Meta: invalid budgets fail before transport construction",()=>{for(const maximumCalls of [NaN,-1,1.5,Infinity,5]){let factories=0;expect(()=>createMetaAdapter({enabled:true,key:"synthetic-test-key",maximumCalls},()=>{factories++;throw Error();})).toThrow(MetaError);expect(factories).toBe(0);}});
test("M7 Meta: invalid JSON and stalled bodies have bounded safe error classes",async()=>{for(const stalled of [false,true]){const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",timeoutMs:15},()=>async()=>stalled?new Response(new ReadableStream({start(){}})):new Response("private non-JSON body"))!;await expect(adapter.plan(request,"muse-ember-1.0")).rejects.toMatchObject({code:stalled?"timeout":"structure"});}});
test("M7 raster: bounded PNG CRC, decoded size and tampered chunks",()=>{const bytes=syntheticPng();expect(()=>inspectRaster(syntheticPng(true))).toThrow(/Animated/);expect(inspectRaster(bytes)).toMatchObject({width:4,height:4});const broken=Buffer.from(bytes);broken[30]^=1;expect(()=>inspectRaster(broken)).toThrow();expect(()=>inspectRaster(Buffer.alloc(60001))).toThrow();});
test("M7 Meta: injected image generation and JSON edit keep lineage, fixed tools and private rights",async()=>{
 let count=0;const png=syntheticPng();const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",maximumCalls:2},()=>async(url,init)=>{const body=JSON.parse(String(init.body));expect(url).toBe(`https://api.meta.ai/v1/images/${count++?"edits":"generations"}`);expect(body).toMatchObject({model:"muse-image-1.0",n:1,response_format:"b64_json",output_format:"png",tool_enablement:{enable_image_search:false,enable_web_search:false,enable_shell:false}});if(count===2)expect(body.images[0].image_url).toBe("data:image/png;base64,"+png.toString("base64"));return Response.json({data:[{b64_json:png.toString("base64")}]});})!;
 const first=await adapter.image("Abstract ceramic study on warm paper");expect(first.asset).toMatchObject({provider:"meta",model:"muse-image-1.0",usageScope:"private-experiment",rights:"unverified"});const edit=await adapter.image("Shift the background to cool blue",first.asset);expect(edit.asset.parentSha256).toBe(first.asset.sha256);expect(edit.asset.revision).toBe(2);expect(count).toBe(2);await expect(adapter.image("Abstract study")).rejects.toMatchObject({code:"budget"});
});
test("M7 Meta: injected strict response binds facts, uses fixed endpoint and records unknown reasoning honestly",async()=>{
 let calls=0;const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",maximumCalls:1},()=>async(url,init)=>{calls++;expect(url).toBe("https://api.meta.ai/v1/responses");expect(init.redirect).toBe("error");const body=JSON.parse(String(init.body));expect(body).toMatchObject({model:"muse-ember-1.0",store:false,max_output_tokens:4000,reasoning:{effort:"low"}});return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:JSON.stringify(metaMockPlan())}]}],usage:{input_tokens:100,output_tokens:50,total_tokens:150}});})!;
 const result=await adapter.plan(request,"muse-ember-1.0");expect(result.plan.campaign.headline).toBe("After Hours");expect(result.usage?.thinkingTokens).toBeUndefined();expect(calls).toBe(1);await expect(adapter.plan(request,"muse-spark-1.3")).rejects.toMatchObject({code:"budget"});expect(calls).toBe(1);
});
for(const kind of ["auth","quota","refusal","incomplete","structure","semantic","timeout"] as const)test(`M7 Meta: injected ${kind} fails safely without retry`,async()=>{
 let calls=0;const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",timeoutMs:15},()=>async()=>{calls++;if(kind==="auth"||kind==="quota")return Response.json({private:"must not escape"},{status:kind==="auth"?401:429});if(kind==="timeout")return new Promise(()=>{});return Response.json({status:kind==="incomplete"?"incomplete":"completed",output:[{type:"message",content:[{type:kind==="refusal"?"refusal":"output_text",text:JSON.stringify(kind==="semantic"?{...metaMockPlan(),campaign:{...metaMockPlan().campaign,headline:"CHOWK"}}:{})}]}]});})!;
 let error:unknown;try{await adapter.plan(request,"muse-spark-1.3");}catch(e){error=e;}expect(error).toBeInstanceOf(MetaError);expect(error).toMatchObject({code:kind});expect(String(error)).not.toContain("private");expect(calls).toBe(1);
});
