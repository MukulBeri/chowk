import { conceptEnvelopeSchema, localConcepts, validatedConcepts } from "../lib/generation/concepts";
import { designSchemaV3, type DesignSpecV3 } from "../lib/design";
import { planToSpec } from "../lib/generation/planner";
import type { GenerationRequest, Usage } from "../lib/generation/contracts";
import type { AssetLayer } from "../lib/design-engine/assets";

type TextTransport=(input:{request:GenerationRequest;signal:AbortSignal;repair?:string[]})=>Promise<{raw:unknown;usage?:Partial<Usage>}>;
type ImageTransport=(prompt:string,signal:AbortSignal)=>Promise<{asset:AssetLayer;elapsedMs:number;usage?:Partial<Usage>}>;
type Attempt={kind:"concepts"|"image";outcome:"accepted"|"rejected"|"failed";elapsedMs:number;usage?:Partial<Usage>;code?:string;dispatched?:boolean};
export type CreativeSessionResult={origin:"local"|"injected-provider"|"retained-replay";concepts:{id:string;spec:DesignSpecV3}[];attempts:Attempt[];providerCalls:number;warnings:string[]};
class QualificationError extends Error{constructor(public code:"timeout"|"budget"){super(code);}}
function failureCode(error:unknown){const code=typeof error==="object"&&error!==null&&"code" in error?String(error.code):"transport";return ["timeout","budget","auth","quota","refusal","incomplete","structure","semantic","asset","transport","provider-auth","provider-rate-limit","blocked"].includes(code)?code:"transport";}

// Offline qualification seam only: no runtime/env/provider selection. Callers
// must explicitly inject both transports and provenance; disabled returns before
// touching them. Selection never invokes image generation per platform.
export async function creativeSession(request:GenerationRequest,options:{enabled?:boolean;origin?:"injected-provider"|"retained-replay";maximumCalls?:number;timeoutMs?:number;qualificationWindowMs?:number;text?:TextTransport;image?:ImageTransport;selectedId?:string;imagePrompt?:string}={}):Promise<CreativeSessionResult>{
  let calls=0;
  const local=localConcepts(request),fallback=(attempts:Attempt[],warning:string):CreativeSessionResult=>({origin:"local",concepts:local.concepts,attempts,providerCalls:calls,warnings:[warning,...local.warnings]});
  if(!options.enabled)return fallback([],"Provider orchestration disabled; independent local concepts.");
  const maximum=options.maximumCalls??2;
  if(!Number.isInteger(maximum)||maximum<0||maximum>4||!options.text||!options.origin)return fallback([],"Invalid qualification configuration; no dispatch.");
  if(options.qualificationWindowMs!==undefined&&(!Number.isInteger(options.qualificationWindowMs)||options.qualificationWindowMs<1||options.qualificationWindowMs>90000))return fallback([],"Invalid isolated qualification window; no dispatch.");
  const overallMs=options.qualificationWindowMs??Math.min(38000,Math.max(1,options.timeoutMs??38000));
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),overallMs),attempts:Attempt[]=[];
  async function bounded<T>(work:()=>Promise<T>){
    if(controller.signal.aborted||calls>=maximum)throw new QualificationError(controller.signal.aborted?"timeout":"budget");calls++;
    return new Promise<T>((resolve,reject)=>{const abort=()=>reject(new QualificationError("timeout"));controller.signal.addEventListener("abort",abort,{once:true});work().then(resolve,reject).finally(()=>controller.signal.removeEventListener("abort",abort));});
  }
  try{
    let repair:string[]|undefined;
    for(let i=0;i<2&&calls<maximum;i++){
      const start=performance.now();
      let result:Awaited<ReturnType<TextTransport>>;
      try{result=await bounded(()=>options.text!({request,signal:controller.signal,repair}));}
      catch(error){const code=failureCode(error),repairable=code==="structure"||code==="semantic";attempts.push({kind:"concepts",outcome:repairable?"rejected":"failed",elapsedMs:performance.now()-start,code,dispatched:true});if(repairable&&i===0&&calls<maximum){repair=["Return a complete structurally valid fact-grounded concept envelope; preserve every ledger ID and the selected taste. One repair only."];continue;}return fallback(attempts,"Provider unavailable or bounded request failed; no transport retry or provider cascade.");}
      const envelope=conceptEnvelopeSchema.safeParse(result.raw);
      const concepts=envelope.success?validatedConcepts(envelope.data.concepts.map(c=>({...c,version:1,origin:"injected-provider"})),request,"injected-provider"):[];
      attempts.push({kind:"concepts",outcome:concepts.length?"accepted":"rejected",elapsedMs:performance.now()-start,usage:result.usage});
      if(!concepts.length){repair=[envelope.success?"No factually valid independent concepts. Preserve every ledger fact ID, selected taste and supported art direction.":"Return the complete version 1 concept envelope with one to three id/full-plan entries."];continue;}
      let selected=concepts.map(c=>({id:c.id,spec:designSchemaV3.parse({...planToSpec(c.plan,request,"deterministic-fallback"),provenance:"manual-input"})}));
      if(options.image&&options.selectedId&&options.imagePrompt){
        const choice=selected.find(c=>c.id===options.selectedId);
        if(!choice)return {...fallback(attempts,"Selected concept is not valid; no image dispatch."),warnings:["Provider concepts were accepted, but the requested selection was not among them. No image was generated."]};
        const imageStart=performance.now(),beforeImage=calls;
        try{
          const image=await bounded(()=>options.image!(options.imagePrompt!,controller.signal));
          const withAsset=designSchemaV3.parse({...choice.spec,assetLayer:image.asset,artDirection:{...choice.spec.artDirection,adaptation:"balanced",recipe:"editorial",design:choice.spec.artDirection.design?{...choice.spec.artDirection.design,imageRole:"immersive"}:undefined}});
          selected=selected.map(c=>c.id===choice.id?{...c,spec:withAsset}:c);
          attempts.push({kind:"image",outcome:"accepted",elapsedMs:performance.now()-imageStart,usage:image.usage});
        }catch(error){attempts.push({kind:"image",outcome:"failed",elapsedMs:performance.now()-imageStart,code:failureCode(error),dispatched:calls>beforeImage});return {origin:options.origin,concepts:selected,attempts,providerCalls:calls,warnings:["Text concepts accepted; image unavailable or refused. Original authored illustration/type retained. No public asset rights established."]};}
      }
      return {origin:options.origin,concepts:selected,attempts,providerCalls:calls,warnings:["Injected or retained-response qualification only; not fresh AI success. Image rights remain unverified."]};
    }
    return fallback(attempts,"Concept validation exhausted the single repair allowance; independent local fallback.");
  }finally{clearTimeout(timer);controller.abort();}
}
