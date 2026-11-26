import {test,expect} from "@playwright/test";
import sharp from "sharp";
import {writeFileSync} from "node:fs";
import {createMetaAdapter,META_IMAGE_RESPONSE_BYTES,META_TEXT_RESPONSE_BYTES} from "../src/server/meta";
import {creativeSession} from "../src/server/creative-session";
import {fallbackPlan} from "../src/lib/generation/planner";
import {MAX_RASTER_BYTES,LOCAL_IMPORT_TARGET_BYTES,MAX_SOURCE_BYTES,assetLayerSchema} from "../src/lib/design-engine/assets";

const request={topic:"Introduce Orbit Clay, a collection of ceramic desk pieces.",details:"Pen holders and small trays in sand and charcoal. Understated editorial direction. No prices or launch dates have been supplied. Do not invent dimensions, manufacturing locations or certifications.",taste:"minimal-swiss" as const,treatment:"creative-led" as const,mode:"local" as const};
function content(){const p=fallbackPlan(request);return {version:1,concepts:[{id:"subject",plan:{...p,campaign:{...p.campaign,cta:p.campaign.cta??""}}}]};}
function response(raw:unknown){return {status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify(raw)}]}]};}
function padded(value:object,size:number){const start=JSON.stringify({...value,padding:""});return start.slice(0,-2)+"x".repeat(size-Buffer.byteLength(start))+start.slice(-2);}
function streamed(text:string){let offset=0;return new Response(new ReadableStream({pull(controller){if(offset>=text.length){controller.close();return;}const next=text.slice(offset,offset+64000);offset+=next.length;controller.enqueue(new TextEncoder().encode(next));}}),{headers:{"Content-Length":"1"}});}
const imagePrompt="Text-free ceramic desk pieces in sand and charcoal";

test("M7L strict Meta schema covers every object property without weakening canonical plans",async({},info)=>{
 let sent:Record<string,unknown>|undefined;
 const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async(_url,init)=>{sent=JSON.parse(init.body as string);const raw=content();raw.concepts[0].plan.artDirection.design=undefined;return Response.json(response({...raw,concepts:raw.concepts.map(c=>({...c,plan:{...c.plan,artDirection:{...c.plan.artDirection,design:null}}}))}));})!;
 const result=await adapter.conceptEnvelope(request,"muse-ember-1.0");expect(result.raw.concepts[0].plan.artDirection.design).toBeUndefined();
 const schema=(sent!.text as {format:{schema:unknown}}).format.schema,missing:string[]=[];
 function visit(value:unknown,path="$ "){if(!value||typeof value!=="object")return;const n=value as Record<string,unknown>;if(n.type==="object"){expect(n.additionalProperties).toBe(false);for(const k of Object.keys(n.properties as object??{}))if(!(n.required as string[]).includes(k))missing.push(path+k);}for(const [k,v]of Object.entries(n)){if(Array.isArray(v))v.forEach((x,i)=>visit(x,path+k+i+"."));else visit(v,path+k+".");}}
 visit(schema);expect(missing).toEqual([]);writeFileSync(info.outputPath("strict-schema-after.json"),JSON.stringify({provenance:"Injected transport only; no live inference",missingRequired:missing,schema},null,2));
});

test("M7L text streamed byte limit stays exactly one million despite false Content-Length",async()=>{
 for(const size of [META_TEXT_RESPONSE_BYTES,META_TEXT_RESPONSE_BYTES+1]){const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async()=>streamed(padded(response(content()),size)))!;const work=adapter.conceptEnvelope(request,"muse-ember-1.0");if(size===META_TEXT_RESPONSE_BYTES)expect((await work).raw.concepts).toHaveLength(1);else await expect(work).rejects.toMatchObject({code:"structure"});expect(adapter.calls).toBe(1);}
});

test("M7L image stream accepts above former limit and refuses above eleven million bytes",async()=>{
 const png=await sharp({create:{width:32,height:32,channels:3,background:"#997755"}}).png().toBuffer();
 for(const size of [1_000_001,META_IMAGE_RESPONSE_BYTES,META_IMAGE_RESPONSE_BYTES+1]){const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async()=>streamed(padded({data:[{b64_json:png.toString("base64")}]},size)))!;const work=adapter.image(imagePrompt);if(size<=META_IMAGE_RESPONSE_BYTES){const result=await work;expect(result.asset.bytes).toBe(png.length);expect(result.asset.usageScope).toBe("private-experiment");expect(result.usage).toBeUndefined();}else await expect(work).rejects.toMatchObject({code:"structure"});}
});

test("M7L base64, original decoded byte, dimensions and malformed UTF-8 safeguards remain strict",async()=>{
 for(const b64 of ["!!!!","a===","AAAA=",Buffer.alloc(MAX_SOURCE_BYTES+1).toString("base64")]){const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async()=>Response.json({data:[{b64_json:b64}]}))!;await expect(adapter.image(imagePrompt)).rejects.toMatchObject({code:"asset"});}
 const oversized=await sharp({create:{width:2048,height:2048,channels:3,background:"red"}}).png().toBuffer();const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async()=>Response.json({data:[{b64_json:oversized.toString("base64")}]}))!;await expect(adapter.image(imagePrompt)).rejects.toMatchObject({code:"asset"});
 const utf=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async()=>new Response(new Uint8Array([0xff,0xfe,0x7b,0x7d])))!;await expect(utf.conceptEnvelope(request,"muse-ember-1.0")).rejects.toMatchObject({code:"structure"});
});

test("M7L layer ceiling is 160 KB while browser local import target stays 60 KB",async()=>{
 expect(MAX_RASTER_BYTES).toBe(160000);expect(LOCAL_IMPORT_TARGET_BYTES).toBe(60000);expect(MAX_SOURCE_BYTES).toBe(8000000);
 const png=await sharp({create:{width:32,height:32,channels:3,background:"red"}}).png().toBuffer();const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key"},()=>async()=>Response.json({data:[{b64_json:png.toString("base64")}]}))!;const {asset}=await adapter.image(imagePrompt);expect(assetLayerSchema.safeParse({...asset,bytes:160001}).success).toBe(false);expect(assetLayerSchema.safeParse({...asset,dataUrl:"data:image/png;base64,"+"a".repeat(4*Math.ceil(MAX_RASTER_BYTES/3)+4)}).success).toBe(false);
});

test("M7L concept structural rejection repairs once with guidance, preserves available reasoning usage",async({},info)=>{
 const bodies:Record<string,unknown>[]=[];const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",maximumCalls:2},()=>async(_url,init)=>{bodies.push(JSON.parse(init.body as string));return Response.json({...response(bodies.length===1?{version:1,concepts:[null]}:content()),usage:{input_tokens:123,output_tokens:90,total_tokens:213,output_tokens_details:{reasoning_tokens:17}}});})!;
 const result=await creativeSession(request,{enabled:true,origin:"injected-provider",maximumCalls:2,qualificationWindowMs:90000,text:({request,signal,repair})=>adapter.conceptEnvelope(request,"muse-ember-1.0",signal,repair)});
 expect(adapter.calls).toBe(2);expect(result.attempts.map(a=>a.outcome)).toEqual(["rejected","accepted"]);expect(bodies[1].input).not.toEqual(bodies[0].input);expect(result.attempts[1].usage?.thinkingTokens).toBe(17);expect(result.concepts[0].spec.provenance).toBe("manual-input");writeFileSync(info.outputPath("injected-repair.json"),JSON.stringify({actualLiveDispatches:0,result},null,2));
});

test("M7L isolated 90 second window validation and disabled gates precede transport access",async()=>{
 let calls=0;for(const qualificationWindowMs of [0,90001,NaN]){const r=await creativeSession(request,{enabled:true,origin:"injected-provider",qualificationWindowMs,text:async()=>{calls++;return {raw:content()};}});expect(r.providerCalls).toBe(0);}expect(calls).toBe(0);
 expect(createMetaAdapter({enabled:false,get key():never{throw Error("key accessed");}},()=>{throw Error("transport created");})).toBeUndefined();
 const timeout=await creativeSession(request,{enabled:true,origin:"injected-provider",timeoutMs:5,text:async()=>new Promise(()=>{})});expect(timeout.attempts[0].code).toBe("timeout");expect(timeout.providerCalls).toBe(1);
});

test("M7L authentication and quota stop without repair, every failed dispatch consumes its slot",async()=>{
 for(const status of [401,403,429]){const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",maximumCalls:2},()=>async()=>new Response("private body",{status}))!;const result=await creativeSession(request,{enabled:true,origin:"injected-provider",maximumCalls:2,text:({request,signal,repair})=>adapter.conceptEnvelope(request,"muse-spark-1.3",signal,repair)});expect(adapter.calls).toBe(1);expect(result.origin).toBe("local");expect(result.attempts[0].code).toBe(status===429?"quota":"auth");expect(JSON.stringify(result)).not.toContain("private body");}
});
