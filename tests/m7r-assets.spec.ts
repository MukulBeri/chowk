import {test,expect} from "@playwright/test";
import sharp from "sharp";
import {writeFileSync} from "node:fs";
import {optimizeRaster,RasterError} from "../src/server/raster-optimizer";
import {MAX_RASTER_BYTES} from "../src/lib/design-engine/assets";
import {creativeSession} from "../src/server/creative-session";
import {createGeminiProvider} from "../src/server/gemini";
import {createMetaAdapter} from "../src/server/meta";
import {fallbackPlan} from "../src/lib/generation/planner";
import {M7_CORPUS} from "../evaluation/m7-corpus";
const request={...M7_CORPUS[0],treatment:"creative-led" as const,mode:"local" as const};
const envelope=()=>({version:1,concepts:[{id:"subject",plan:fallbackPlan(request)}]});
test("M7R image: actual decode, bounded optimization and transparent lineage",async({},info)=>{
 const raw=Buffer.alloc(400*300*4);for(let i=0;i<400*300;i++){raw[i*4]=i%256;raw[i*4+1]=100;raw[i*4+2]=160;raw[i*4+3]=i%400<200?0:255;}
 const original=await sharp(raw,{raw:{width:400,height:300,channels:4}}).png({compressionLevel:0}).toBuffer();expect(original.length).toBeGreaterThan(MAX_RASTER_BYTES);
 const result=await optimizeRaster(original,{source:"meta"});expect(result.asset.bytes).toBeLessThanOrEqual(MAX_RASTER_BYTES);expect(result.asset.mime).toBe("image/png");expect(result.asset.derivative?.opaque).toBe(false);expect(result.asset.derivative?.sourceBytes).toBe(original.length);
 const decoded=await sharp(Buffer.from(result.asset.dataUrl.split(",")[1],"base64")).raw().toBuffer();expect(decoded.equals(raw)).toBe(true);
 writeFileSync(info.outputPath("original-synthetic.png"),original);writeFileSync(info.outputPath("optimized-synthetic.png"),Buffer.from(result.asset.dataUrl.split(",")[1],"base64"));writeFileSync(info.outputPath("optimization.json"),JSON.stringify({...result,asset:{...result.asset,dataUrl:"[binary retained separately]"},identicalDecodedPixels:true},null,2));
});
test("M7R image: compressed bound, decompression dimensions, corrupt JPEG and abort refuse safely",async()=>{
 await expect(optimizeRaster(Buffer.alloc(8_000_001),{source:"local-file"})).rejects.toMatchObject({code:"source-bound"});
 await expect(optimizeRaster(Buffer.from('<svg onload="alert(1)"/>'),{source:"local-file"})).rejects.toBeInstanceOf(RasterError);
 const png=await sharp({create:{width:2048,height:2048,channels:3,background:"red"}}).png().toBuffer();await expect(optimizeRaster(png,{source:"local-file"})).rejects.toMatchObject({code:"decode"});
 const tiny=await sharp({create:{width:16,height:16,channels:3,background:"red"}}).png().toBuffer();const c=new AbortController();c.abort();await expect(optimizeRaster(tiny,{source:"local-file"},c.signal)).rejects.toMatchObject({code:"timeout"});
 const jpg=await sharp(tiny).jpeg().toBuffer();await expect(optimizeRaster(Buffer.concat([jpg.subarray(0,Math.min(250,jpg.length-2)),Buffer.from([255,217])]),{source:"local-file"})).rejects.toMatchObject({code:"decode"});
});
test("M7R orchestration: disabled never touches provider getters; invalid budgets dispatch zero",async()=>{
 expect((await creativeSession(request,{enabled:false,get text():never{throw Error("transport access");}})).origin).toBe("local");
 let calls=0;for(const maximumCalls of [-1,5,NaN])expect((await creativeSession(request,{enabled:true,origin:"injected-provider",maximumCalls,text:async()=>{calls++;throw Error();}})).origin).toBe("local");expect(calls).toBe(0);
});
test("M7R Gemini: injected real envelope transport, one repair and honest usage",async({},info)=>{
 let count=0;const provider=createGeminiProvider({apiKey:"synthetic-test-key",model:"gemini-3.5-flash-lite",maxOutputTokens:4096,concepts:true,fetcher:async()=>Response.json({candidates:[{finishReason:"STOP",content:{parts:[{text:JSON.stringify(count++?envelope():{})}]}}],usageMetadata:{promptTokenCount:120,candidatesTokenCount:100,totalTokenCount:220}})});
 const result=await creativeSession(request,{enabled:true,origin:"injected-provider",maximumCalls:2,text:provider});expect(count).toBe(2);expect(result.origin).toBe("injected-provider");expect(result.attempts.map(a=>a.outcome)).toEqual(["rejected","accepted"]);expect(result.concepts[0].spec.provenance).toBe("manual-input");writeFileSync(info.outputPath("injected-session.json"),JSON.stringify(result,null,2));
});
test("M7R Meta: strict concepts through selected image optimization converge on canonical spec",async({},info)=>{
 let count=0;const bytes=await sharp({create:{width:240,height:240,channels:3,background:"#dc8260"}}).png().toBuffer();
 const adapter=createMetaAdapter({enabled:true,key:"synthetic-test-key",maximumCalls:2},()=>async(url)=>{count++;if(url.endsWith('/responses')){const body=envelope();return Response.json({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify({...body,concepts:body.concepts.map(c=>({...c,plan:{...c.plan,campaign:{...c.plan.campaign,cta:""}}}))})}]}]});}return Response.json({data:[{b64_json:bytes.toString("base64")}],usage:{input_tokens:12,output_tokens:4,total_tokens:16}});})!;
 const result=await creativeSession(request,{enabled:true,origin:"injected-provider",maximumCalls:2,text:async({request,signal})=>{const r=await adapter.concepts(request,"muse-ember-1.0",signal);return {raw:{version:1,concepts:r.concepts.map(c=>({id:c.id,plan:c.plan}))},usage:r.usage};},image:(prompt,signal)=>adapter.image(prompt,undefined,signal),selectedId:"subject",imagePrompt:"Warm ceramic cup study on paper"});
 expect(count).toBe(2);expect(result.origin).toBe("injected-provider");expect(result.concepts[0].spec.assetLayer?.usageScope).toBe("private-experiment");expect(result.concepts[0].spec.artDirection.design?.imageRole).toBe("immersive");expect(result.attempts.every(a=>a.outcome==="accepted")).toBe(true);expect(result.attempts[0].usage).toBeUndefined();expect(result.attempts[1].usage).toEqual({inputTokens:12,outputTokens:4,totalTokens:16});expect(result.providerCalls).toBe(2);writeFileSync(info.outputPath("injected-meta-image.json"),JSON.stringify(result,null,2));
});
test("M7R orchestration: refusal has no retry; rejected concepts repair once; timeout bounded",async()=>{
 for(const kind of ["refusal","invalid","timeout"]){let calls=0;const result=await creativeSession(request,{enabled:true,origin:"injected-provider",maximumCalls:4,timeoutMs:20,text:async()=>{calls++;if(kind==="refusal")throw Error("private provider body");if(kind==="timeout")return new Promise(()=>{});return {raw:{}};}});expect(calls).toBe(kind==="invalid"?2:1);expect(result.origin).toBe("local");expect(JSON.stringify(result)).not.toContain("private provider body");}
});
