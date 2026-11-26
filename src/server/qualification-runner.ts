import {createMetaAdapter,MetaError,type MetaTransport} from "./meta";
import {QualificationLedger,QualificationStop,type QualificationOutcome} from "./qualification-ledger";
import {validatedConcepts} from "../lib/generation/concepts";
import {designSchemaV3,type DesignSpecV3} from "../lib/design";
import {planToSpec} from "../lib/generation/planner";
import type {GenerationRequest} from "../lib/generation/contracts";

export const QUALIFICATION_BRIEFS:GenerationRequest[]=[
 {topic:"Introduce Orbit Clay, a collection of ceramic desk pieces.",details:"Pen holders and small trays in sand and charcoal. Understated editorial direction. No prices or launch dates have been supplied. Do not invent dimensions, manufacturing locations or certifications.",taste:"minimal-swiss",treatment:"creative-led",mode:"local"},
 {topic:"Promote Field Notes, an introductory seminar on observing urban wildlife.",details:"18 December 2026, 2 PM to 4 PM IST. Venue: Room Cedar. Open to first-year students. 20 seats. Entry ₹60. Bring a notebook. No certificates will be issued. Register at https://example.org/field-notes.",taste:"bold-street",treatment:"creative-led",mode:"local"},
];
export function verifyQualificationPrerequisites(value:unknown){
 const p=value as Record<string,unknown>|null;
 if(!p||p.authorization!=="M7-L-four-dispatches-20261126"||!["liveExecutionAuthorized","accountEligibilityConfirmed","regionalEligibilityConfirmed","currentModelsConfirmed","noPaidBillingSubscriptionOrTopUpConfirmed","secureCredentialAvailableConfirmed","offlineIntegrationVerified"].every(k=>p[k]===true)||typeof p.promotionalBalanceUsd!=="number"||p.promotionalBalanceUsd<.20)throw new QualificationStop("owner-account-or-execution-gate");
}
export async function runQualification(options:{prerequisites:unknown;directory:string;getKey:()=>Promise<string>;transportFactory:()=>MetaTransport;record:(name:string,data:unknown)=>void;origin:"fresh-meta"|"injected-test"}){
 verifyQualificationPrerequisites(options.prerequisites);
 const ledger=new QualificationLedger(options.directory),key=await options.getKey();
 let ticket:number|undefined,session:"A"|"B"="A";
 // The credential exists only in this Node process/adapter closure, never in an
 // environment variable, child browser, argument, record or console message.
 const adapter=createMetaAdapter({enabled:true,key,maximumCalls:4,timeoutMs:38000},()=>{
  const transport=options.transportFactory();
  return async(url,init)=>{ticket=ledger.reserve(session,url.endsWith("/responses")?"text":"image",url,String(init.body));return transport(url,init);};
 })!;
 const results:{session:string;concepts:{id:string;spec:DesignSpecV3}[];image:boolean}[]=[];
 const finish=(outcome:QualificationOutcome,usage?:Parameters<QualificationLedger["settle"]>[2])=>{if(ticket!==undefined){ledger.settle(ticket,outcome,usage);ticket=undefined;}};
 for(const index of [0,1]){
  session=index===0?"A":"B";const request=QUALIFICATION_BRIEFS[index],model=index===0?"muse-ember-1.0":"muse-spark-1.3",controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);let repair:string[]|undefined,accepted:{id:string;spec:DesignSpecV3}[]=[];
  try{
   for(let attempt=0;attempt<2;attempt++){
    try{
     const response=await adapter.conceptEnvelope(request,model,controller.signal,repair),concepts=validatedConcepts(response.raw.concepts.map(c=>({...c,version:1,origin:"injected-provider"})),request,"injected-provider");
     accepted=concepts.map(c=>({id:c.id,spec:designSchemaV3.parse({...planToSpec(c.plan,request,"deterministic-fallback"),provenance:"manual-input"})}));
     finish(accepted.length?"accepted":"semantic",response.usage);options.record(`${session}-text-${attempt+1}`,{origin:options.origin,request,model,attempt:attempt+1,acceptedConcepts:accepted,providerResponse:response.raw,elapsedMs:response.elapsedMs,usage:response.usage??null,actualChargeUsd:null,publicationCleared:false});
     if(accepted.length)break;
     repair=["Return independently developed factually valid concepts. Preserve every original ledger ID, selected taste and supported art direction."];
    }catch(error){
     const code=error instanceof MetaError?error.code:"transport",safe=["structure","semantic","auth","quota","timeout","transport"].includes(code)?code as QualificationOutcome:"provider";
     finish(safe);options.record(`${session}-text-${attempt+1}`,{origin:options.origin,model,accepted:false,code,diagnostics:error instanceof MetaError?error.validation:undefined,usage:null,actualChargeUsd:null});
     if(!["structure","semantic"].includes(code))throw new QualificationStop(safe);
     repair=["Return a complete strict version 1 envelope. Preserve original ledger IDs and selected taste. One repair only."];
    }
   }
   if(!accepted.length)throw new QualificationStop("concepts-rejected");
   let image=false;
   const aCalls=ledger.inspect().filter(e=>e.event==="reserved"&&e.session==="A").length;
   if(session==="A"&&aCalls===1){
    try{
     const prepared=await adapter.image("Ceramic pen holders and small trays in sand and charcoal, understated editorial still life, neutral studio background, text-free conceptual product study",undefined,controller.signal);finish("accepted",prepared.usage);const selected=accepted[0],spec=selected.spec;
     selected.spec=designSchemaV3.parse({...spec,assetLayer:prepared.asset,artDirection:{...spec.artDirection,recipe:"editorial",adaptation:"balanced",design:spec.artDirection.design?{...spec.artDirection.design,imageRole:"immersive"}:undefined}});image=true;options.record("A-image",{origin:options.origin,model:prepared.model,elapsedMs:prepared.elapsedMs,processingMs:prepared.processingMs,usage:prepared.usage??null,actualChargeUsd:null,spec:selected.spec,publicationCleared:false});
    }catch(error){const code=error instanceof MetaError?error.code:"transport",safe=["auth","quota","timeout","transport"].includes(code)?code as QualificationOutcome:"unsafe";finish(safe);options.record("A-image",{origin:options.origin,accepted:false,code,usage:null,actualChargeUsd:null});throw new QualificationStop(safe);}
   }
   results.push({session,concepts:accepted,image});options.record(`${session}-selected`,{origin:options.origin,request,selectedConcept:accepted[0],allConcepts:accepted,image,canonicalSpecificationProvenance:"manual-input imported validated plan; true provider provenance retained separately, never labelled Gemini or local generation"});
  }finally{clearTimeout(timer);controller.abort();}
 }
 return {origin:options.origin,results,dispatches:ledger.inspect(),actualChargeUsd:null};
}
