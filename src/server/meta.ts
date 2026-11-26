import { z } from "zod";
import { creativeLedPlanSchema, type GenerationRequest, type Usage } from "../lib/generation/contracts";
import { generationPrompt } from "./gemini";
import { validatePlan } from "../lib/generation/planner";
import { assetLayerSchema, MAX_SOURCE_BYTES,MAX_RASTER_BYTES,rasterHeader, type AssetLayer } from "../lib/design-engine/assets";
import { createHash } from "node:crypto";
import { inspectRaster } from "./raster-validation";
import type { ValidationDiagnostics } from "../lib/generation/diagnostics";
import { RECIPES } from "../lib/design-engine/registry";
import { optimizeRaster, RasterError } from "./raster-optimizer";
import { conceptEnvelopeSchema, validatedConcepts } from "../lib/generation/concepts";
import { structuralDiagnostics } from "../lib/generation/diagnostics";
import {compactCreativeSchema,compactCreativePrompt,expandCreativeEnvelope} from './meta-creative-contract';

export type MetaCode = "disabled" | "budget" | "timeout" | "transport" | "auth" | "quota" | "provider" | "refusal" | "incomplete" | "structure" | "semantic" | "asset";
export class MetaError extends Error { constructor(public code: MetaCode, public validation?: ValidationDiagnostics,public httpStatus?:number) { super(`Meta adapter: ${code}`); } }
export type MetaTransport = (url: string, init: RequestInit) => Promise<Response>;
export const META_RUNTIME_ENABLED = false; // Legacy default. M9 uses its own explicit, fail-closed service gates.
const BASE = "https://api.meta.ai/v1";
export const META_TEXT_RESPONSE_BYTES=1_000_000;
export const META_IMAGE_RESPONSE_BYTES=11_000_000;
// Strict structured-output objects require every property. Use an empty CTA
// string at this transport boundary, then normalize to the production optional
// field. No renderer capability or Gemini contract is loosened.
const metaPlanSchema = creativeLedPlanSchema.extend({
  campaign: creativeLedPlanSchema.shape.campaign.extend({ cta: z.string().trim().max(60) }),
  artDirection: creativeLedPlanSchema.shape.artDirection.safeExtend({ treatment:z.literal("creative-led"),recipe:z.enum(RECIPES) }),
});
// Required by Meta's strict subset. Optional canonical values travel as null,
// then only these known optional fields are normalized before strict validation.
export function strictMetaSchema(value:unknown):unknown {
  if(Array.isArray(value))return value.map(strictMetaSchema);
  if(!value||typeof value!=="object")return value;
  const item=value as Record<string,unknown>,out=Object.fromEntries(Object.entries(item).map(([k,v])=>[k,strictMetaSchema(v)]));
  if(item.type==="object"&&item.properties){
    const required=new Set(item.required as string[]??[]),properties=out.properties as Record<string,unknown>;
    for(const key of Object.keys(properties))if(!required.has(key))properties[key]={anyOf:[properties[key],{type:"null"}]};
    out.required=Object.keys(properties);out.additionalProperties=false;
  }
  return out;
}
function normalizeMetaPlan(value:unknown){
  if(!value||typeof value!=="object"||Array.isArray(value))return value;
  const plan=structuredClone(value) as Record<string,unknown>,direction=plan.artDirection as Record<string,unknown>|undefined;
  if(direction?.design===null)delete direction.design;
  else if(direction?.design&&typeof direction.design==="object"&&(direction.design as Record<string,unknown>).anchorFactId===null)delete (direction.design as Record<string,unknown>).anchorFactId;
  return plan;
}
export type MetaEvidence={phase:'http'|'complete';kind:'text'|'image';httpStatus:number;elapsedMs:number;usage:Partial<Usage>|undefined;response?:unknown};
export function measuredMetaUsage(raw:unknown):Partial<Usage>|undefined{
 if(!raw||typeof raw!=='object'||!('usage' in raw)||!raw.usage||typeof raw.usage!=='object')return undefined;
 const u=raw.usage as Record<string,unknown>,values:Partial<Usage>={};
 for(const [from,to] of [['input_tokens','inputTokens'],['output_tokens','outputTokens'],['total_tokens','totalTokens']] as const)if(typeof u[from]==='number'&&Number.isFinite(u[from])&&u[from]>=0)values[to]=u[from];
 const details=u.output_tokens_details;if(details&&typeof details==='object'&&'reasoning_tokens' in details&&typeof details.reasoning_tokens==='number'&&Number.isFinite(details.reasoning_tokens)&&details.reasoning_tokens>=0)values.thinkingTokens=details.reasoning_tokens;
 return Object.keys(values).length?values:undefined;
}
type Options = { enabled?: boolean; key?: string; maximumCalls?: number; timeoutMs?: number;observe?:(evidence:MetaEvidence)=>void;retainOriginalImage?:(bytes:Buffer)=>void };
// Preserve provider-applied PNG provenance. Without a provenance-aware encoder,
// retain such originals verbatim or refuse a derivative rather than strip metadata.
export function metaPngMetadata(bytes:Buffer){
 let offset=8,metadata=false,exif=false,other=false,signedChunk=false,xmp:string|undefined;
 while(offset+12<=bytes.length){const length=bytes.readUInt32BE(offset),kind=bytes.toString('ascii',offset+4,offset+8);if(offset+12+length>bytes.length)throw new MetaError('asset');if(!['IHDR','PLTE','IDAT','IEND','tRNS','pHYs','gAMA','cHRM','sRGB','bKGD'].includes(kind)){
 metadata=true;const data=bytes.subarray(offset+8,offset+8+length),keyword=data.indexOf(0);
 if(kind==='iTXt'&&data.subarray(0,keyword).toString()==='XML:com.adobe.xmp'&&data[keyword+1]===0){let start=keyword+3;for(let n=0;n<2;n++){const end=data.indexOf(0,start);if(end<0)throw new MetaError('asset');start=end+1;}if(xmp||data.length-start>16000)throw new MetaError('asset');xmp=new TextDecoder('utf-8',{fatal:true}).decode(data.subarray(start));}else other=true;
 }if(kind==='eXIf')exif=true;if(kind==='caBX'||kind==='JUMb')signedChunk=true;offset+=12+length;if(kind==='IEND')break;}
 return {metadata,exif,other,xmp,signed:signedChunk||!!xmp&&/c2pa|contentcredentials|<ds:Signature|<Signature\b/i.test(xmp)};
}
export function createMetaAdapter(options: Options = {}, transportFactory: () => MetaTransport = () => fetch) {
  // Gate before reading a key, creating transport, schema/prompt work or dispatch.
  if (!options.enabled) return undefined;
  if (!Number.isInteger(options.maximumCalls ?? 1) || (options.maximumCalls ?? 1) < 0 || (options.maximumCalls ?? 1) > 4) throw new MetaError("budget");
  if (!options.key?.trim()) throw new MetaError("auth");
  const transport = transportFactory(); let calls = 0;
  const maximum = Math.min(4, Math.max(0, options.maximumCalls ?? 1));
  async function dispatch(endpoint: "/responses" | "/images/generations" | "/images/edits", body: object, signal?: AbortSignal) {
    if (calls >= maximum) throw new MetaError("budget");
    if (signal?.aborted) throw new MetaError("timeout");
    calls++; // Reserve before transport; failures consume the allowance.
    const controller = new AbortController(), abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once:true });
    const timer = setTimeout(abort, Math.min(options.timeoutMs ?? 18000, 38000));
    const start = performance.now();
    const deadline = new Promise<never>((_resolve,reject)=>controller.signal.addEventListener("abort",()=>reject(new MetaError("timeout")),{once:true}));
    try {
      const response = await Promise.race([transport(BASE + endpoint, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${options.key}`},body:JSON.stringify(body),redirect:"error",signal:controller.signal }), deadline]);
      options.observe?.({phase:'http',kind:endpoint==='/responses'?'text':'image',httpStatus:response.status,elapsedMs:performance.now()-start,usage:undefined});
      if (!response.ok) throw new MetaError(response.status === 401 || response.status === 403 ? "auth" : response.status === 429 ? "quota" : "provider",undefined,response.status);
      const reader=response.body?.getReader(); if(!reader)throw new MetaError("structure");
      let size=0;const chunks:Uint8Array[]=[];
      const maximumResponse=endpoint==="/responses"?META_TEXT_RESPONSE_BYTES:META_IMAGE_RESPONSE_BYTES;
      while(true){const chunk=await Promise.race([reader.read(),deadline]);if(chunk.done)break;size+=chunk.value.length;if(size>maximumResponse){void reader.cancel().catch(()=>{});throw new MetaError("structure");}chunks.push(chunk.value);}
      const bytes=Buffer.concat(chunks);let raw:unknown;try{const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);if(options.key&&text.includes(options.key))throw Error();raw=JSON.parse(text);if(options.key&&JSON.stringify(raw).includes(options.key))throw Error();}catch{throw new MetaError("structure");}
      const elapsedMs=performance.now()-start;
      options.observe?.({phase:'complete',kind:endpoint==='/responses'?'text':'image',httpStatus:response.status,elapsedMs,usage:measuredMetaUsage(raw),...(endpoint==='/responses'?{response:raw}:{})});
      return {raw,elapsedMs,httpStatus:response.status};
    } catch(error) { if(error instanceof MetaError)throw error;throw new MetaError(controller.signal.aborted?"timeout":"transport"); }
    finally { clearTimeout(timer);signal?.removeEventListener("abort",abort); }
  }
  async function requestConcepts(request:GenerationRequest,model:"muse-spark-1.3"|"muse-ember-1.0",signal?:AbortSignal,repair?:string[]){
      if(request.treatment!=="creative-led"||!["muse-spark-1.3","muse-ember-1.0"].includes(model))throw new MetaError("structure");
      const prompt=generationPrompt(request,repair);
      // Meta strict transport keeps optional render fields normalized by the
      // existing transport plan schema, including the empty optional CTA.
      const schema=conceptEnvelopeSchema.extend({concepts:z.array(z.strictObject({id:z.string().regex(/^[a-z0-9-]{1,64}$/),plan:metaPlanSchema})).min(1).max(3)});
      const result=await dispatch("/responses",{model,instructions:prompt.system+" Return one to three independently developed concepts in the version 1 envelope. Each needs distinct messaging and visual strategy. Palette/layout swaps are not concepts. Preserve every immutable fact ID. Do not force three.",input:prompt.user,reasoning:{effort:model==="muse-spark-1.3"?"medium":"low"},max_output_tokens:4000,store:false,stream:false,text:{format:{type:"json_schema",name:"chowk_concepts",strict:true,schema:strictMetaSchema(z.toJSONSchema(schema,{unrepresentable:"any"}))}}},signal);
      const e=z.object({status:z.string(),output:z.array(z.object({content:z.array(z.object({type:z.string(),text:z.string().optional()})).optional()})),usage:z.object({input_tokens:z.number(),output_tokens:z.number(),total_tokens:z.number(),output_tokens_details:z.object({reasoning_tokens:z.number()}).optional()}).optional()}).safeParse(result.raw);
      if(!e.success)throw new MetaError("structure");
      const content=e.data.output.flatMap(o=>o.content??[]);
      if(content.some(c=>c.type==="refusal"))throw new MetaError("refusal");
      if(e.data.status!=="completed")throw new MetaError("incomplete");
      const text=content.filter(c=>c.type==="output_text");if(text.length!==1||!text[0].text)throw new MetaError("structure");
      let raw:unknown;try{raw=JSON.parse(text[0].text);}catch{throw new MetaError("structure");}
      if(raw&&typeof raw==="object"&&"concepts" in raw&&Array.isArray(raw.concepts))raw={...raw,concepts:raw.concepts.map((c:unknown)=>c&&typeof c==="object"&&!Array.isArray(c)?{...c,plan:normalizeMetaPlan((c as Record<string,unknown>).plan)}:c)};
      const parsed=schema.safeParse(raw);if(!parsed.success)throw new MetaError("structure",structuralDiagnostics(parsed.error.issues));
      return {raw:{version:1 as const,concepts:parsed.data.concepts.map(c=>({id:c.id,plan:{...c.plan,campaign:{...c.plan.campaign,cta:c.plan.campaign.cta||undefined}}}))},provider:"meta" as const,model,elapsedMs:result.elapsedMs,usage:e.data.usage?{inputTokens:e.data.usage.input_tokens,outputTokens:e.data.usage.output_tokens,totalTokens:e.data.usage.total_tokens,...(e.data.usage.output_tokens_details?{thinkingTokens:e.data.usage.output_tokens_details.reasoning_tokens}:{})}:undefined};
  }

  return {
    get calls() { return calls; },
    conceptEnvelope:requestConcepts,
    async creativeEnvelope(request:GenerationRequest,model:'muse-ember-1.0'|'muse-spark-1.3',signal?:AbortSignal,repair?:ValidationDiagnostics){
      if(request.treatment!=='creative-led'||!['muse-ember-1.0','muse-spark-1.3'].includes(model))throw new MetaError('structure');
      const prompt=compactCreativePrompt(request,repair),schema=compactCreativeSchema(request);
      const result=await dispatch('/responses',{model,instructions:prompt.system,input:prompt.user,reasoning:{effort:model==='muse-spark-1.3'?'medium':'low'},max_output_tokens:4000,store:false,stream:false,text:{format:{type:'json_schema',name:'chowk_creative_decisions',strict:true,schema:strictMetaSchema(z.toJSONSchema(schema,{unrepresentable:'any'}))}}},signal);
      const parsed=z.object({status:z.string(),output:z.array(z.object({content:z.array(z.object({type:z.string(),text:z.string().optional()})).optional()}))}).safeParse(result.raw);
      if(!parsed.success)throw new MetaError('structure');
      const content=parsed.data.output.flatMap(item=>item.content??[]);if(content.some(c=>c.type==='refusal'))throw new MetaError('refusal');if(parsed.data.status!=='completed')throw new MetaError('incomplete');
      const texts=content.filter(c=>c.type==='output_text');if(texts.length!==1||!texts[0].text)throw new MetaError('structure');
      let raw:unknown;try{raw=JSON.parse(texts[0].text);}catch{throw new MetaError('structure');}
      const checked=schema.safeParse(raw);if(!checked.success)throw new MetaError('structure',structuralDiagnostics(checked.error.issues));
      return {raw:expandCreativeEnvelope(checked.data,request),model,provider:'meta' as const,httpStatus:result.httpStatus,elapsedMs:result.elapsedMs,usage:measuredMetaUsage(result.raw)};
    },
    async concepts(request:GenerationRequest,model:"muse-spark-1.3"|"muse-ember-1.0",signal?:AbortSignal){
      const result=await requestConcepts(request,model,signal);
      const concepts=validatedConcepts(result.raw.concepts.map(c=>({...c,version:1,origin:"injected-provider"})),request,"injected-provider");
      if(!concepts.length)throw new MetaError("semantic");
      return {concepts,provider:result.provider,model:result.model,elapsedMs:result.elapsedMs,usage:result.usage};
    },
    async plan(request: GenerationRequest, model: "muse-spark-1.3" | "muse-ember-1.0", signal?: AbortSignal) {
      if(!["muse-spark-1.3","muse-ember-1.0"].includes(model))throw new MetaError("structure");
      if(request.treatment!=="creative-led")throw new MetaError("structure");
      const prompt=generationPrompt(request);
      const schema=strictMetaSchema(z.toJSONSchema(metaPlanSchema,{unrepresentable:"any"}));
      const result=await dispatch("/responses",{model,instructions:prompt.system,input:prompt.user,reasoning:{effort:model==="muse-spark-1.3"?"medium":"low"},max_output_tokens:4000,store:false,stream:false,text:{format:{type:"json_schema",name:"chowk_creative_plan",strict:true,schema}}},signal);
      const envelope=z.object({status:z.string(),output:z.array(z.object({type:z.string(),content:z.array(z.object({type:z.string(),text:z.string().optional()})).optional()})),usage:z.object({input_tokens:z.number(),output_tokens:z.number(),total_tokens:z.number(),output_tokens_details:z.object({reasoning_tokens:z.number()}).optional()}).optional()}).safeParse(result.raw);
      if(!envelope.success)throw new MetaError("structure");
      const e=envelope.data,content=e.output.flatMap(o=>o.content??[]);
      if(content.some(c=>c.type==="refusal"))throw new MetaError("refusal");
      if(e.status!=="completed")throw new MetaError("incomplete");
      const texts=content.filter(c=>c.type==="output_text");if(texts.length!==1||!texts[0].text)throw new MetaError("structure");
      let raw:unknown;try{raw=JSON.parse(texts[0].text);}catch{throw new MetaError("structure");}
      const transportPlan=metaPlanSchema.safeParse(normalizeMetaPlan(raw));if(!transportPlan.success)throw new MetaError("structure");
      const proposal={...transportPlan.data,campaign:{...transportPlan.data.campaign,cta:transportPlan.data.campaign.cta||undefined}};
      const checked=validatePlan(proposal,request);if(!checked.plan)throw new MetaError(checked.diagnostics?.stage==="structure"?"structure":"semantic",checked.diagnostics);
      const usage:Partial<Usage>|undefined=e.usage?{inputTokens:e.usage.input_tokens,outputTokens:e.usage.output_tokens,totalTokens:e.usage.total_tokens,...(e.usage.output_tokens_details?{thinkingTokens:e.usage.output_tokens_details.reasoning_tokens}:{})}:undefined;
      return {plan:checked.plan,provider:"meta" as const,model,elapsedMs:result.elapsedMs,usage,validation:checked.diagnostics};
    },
    async image(prompt: string, source?: AssetLayer, signal?: AbortSignal) {
      // Trusted caller provides a text-free subject/style prompt, never an
      // arbitrary endpoint. This is not called from any production UI/runtime.
      if(!prompt.trim()||prompt.length>600||/<|https?:|\b(?:person|face|celebrity)\b/i.test(prompt))throw new MetaError("asset");
      if(source){const parsed=assetLayerSchema.safeParse(source);if(!parsed.success||parsed.data.mime!=="image/png")throw new MetaError("asset");const bytes=Buffer.from(parsed.data.dataUrl.split(",")[1],"base64");try{inspectRaster(bytes);}catch{throw new MetaError("asset");}if(createHash("sha256").update(bytes).digest("hex")!==parsed.data.sha256)throw new MetaError("asset");}
      const body={model:"muse-image-1.0",prompt:`${prompt}\nOriginal text-free visual asset. No lettering, numbers, logos, watermarks or people.`,n:1,size:"1024x1024",response_format:"b64_json",reasoning_strength:"high",stream:false,tool_enablement:{enable_image_search:false,enable_web_search:false,enable_shell:false},...(source?{images:[{image_url:source.dataUrl}]}:{}),output_format:"png"};
      const result=await dispatch(source?"/images/edits":"/images/generations",body,signal);
      // M7-L approval is image-specific; text remains at its existing 1 MB cap.
      const parsed=z.object({data:z.array(z.object({b64_json:z.string().max(4*Math.ceil(MAX_SOURCE_BYTES/3)).regex(/^[A-Za-z0-9+/]+={0,2}$/)})).length(1),usage:z.object({input_tokens:z.number().nonnegative().optional(),output_tokens:z.number().nonnegative().optional(),total_tokens:z.number().nonnegative().optional()}).optional()}).safeParse(result.raw);
      if(!parsed.success)throw new MetaError("asset");
      const encoded=parsed.data.data[0].b64_json,padding=encoded.endsWith("==")?2:encoded.endsWith("=")?1:0;
      if(encoded.length%4||encoded.length/4*3-padding>MAX_SOURCE_BYTES)throw new MetaError("asset");
      const bytes=Buffer.from(encoded,"base64");
      if(bytes.toString("base64")!==encoded)throw new MetaError("asset");
      if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new MetaError("asset");
      try{rasterHeader(bytes,MAX_SOURCE_BYTES);}catch{throw new MetaError('asset');}
      if(options.key&&bytes.includes(Buffer.from(options.key)))throw new MetaError('asset');
      options.retainOriginalImage?.(bytes); // Private, bounded original retained before any derivative.
      const provenance=metaPngMetadata(bytes);
      if(provenance.signed||provenance.exif||provenance.other)throw new MetaError('asset');
      try{
        const prepared=await optimizeRaster(bytes,{source:"meta",previous:source,inputReferenceSha256:createHash("sha256").update(prompt).digest("hex")},signal);
        const measured=parsed.data.usage,usage:Partial<Usage>|undefined=measured?{...(measured.input_tokens!==undefined?{inputTokens:measured.input_tokens}:{}),...(measured.output_tokens!==undefined?{outputTokens:measured.output_tokens}:{}),...(measured.total_tokens!==undefined?{totalTokens:measured.total_tokens}:{})}:undefined;
        const asset=assetLayerSchema.parse({...prepared.asset,...(provenance.xmp?{providerMetadata:{xmp:provenance.xmp,xmpSha256:createHash('sha256').update(provenance.xmp).digest('hex'),preserved:true}}:{})});
        return {...prepared,asset,usage,provider:"meta" as const,model:"muse-image-1.0",processingMs:prepared.elapsedMs,elapsedMs:result.elapsedMs,publicationCleared:false as const};
      }catch(error){throw new MetaError(error instanceof RasterError&&error.code==="timeout"?"timeout":"asset");}
    },
  };
}
