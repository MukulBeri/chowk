import {createMetaAdapter,MetaError,type MetaEvidence} from './meta';
import {FinalQualificationLedger,type FinalBinding,type FinalOutcome} from './qualification-final-ledger';
import {QualificationStop} from './qualification-ledger';
import {QUALIFICATION_BRIEFS,verifyQualificationPrerequisites} from './qualification-runner';
import {inspectConcepts} from '../lib/generation/concepts';
import {fallbackPlan,planToSpec} from '../lib/generation/planner';
import {designSchemaV3,type DesignSpecV3} from '../lib/design';
import {safeRecoveryDiagnostic,RecoveryFailure} from './qualification-recovery';
import type {MetaTransport} from './meta';
import type {ValidationDiagnostics} from '../lib/generation/diagnostics';

export function verifyFinalPrerequisites(value:unknown):FinalBinding{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new QualificationStop('final-authorization');
 const {authorization,finalExecutionAuthorized,maximumSessionRequests,historicalBinding,priorReviewedFingerprint,maximumAdditionalRequests,maximumAdditionalReservationUsd,maximumCumulativeReservationUsd,...base}=value as Record<string,unknown>;
 if(authorization!=='M7-L-final-six-cumulative-20261126'||finalExecutionAuthorized!==true||maximumSessionRequests!==undefined||maximumAdditionalRequests!==4||maximumAdditionalReservationUsd!==.17||maximumCumulativeReservationUsd!==.19||typeof priorReviewedFingerprint!=='string'||!/^[a-f0-9]{64}$/.test(priorReviewedFingerprint)||!historicalBinding||typeof historicalBinding!=='object'||Array.isArray(historicalBinding))throw new QualificationStop('final-authorization');
 if(base.maximumActualRequests!==6)throw new QualificationStop('final-authorization');
 verifyQualificationPrerequisites({...base,authorization:'M7-L-four-dispatches-20261126',maximumActualRequests:4,maximumSessionRequests:2});
 return historicalBinding as FinalBinding;
}
const fatal=(e:unknown)=>!(e instanceof MetaError)||['auth','quota','timeout','transport','provider','budget','disabled'].includes(e.code);
const outcome=(e:unknown):FinalOutcome=>e instanceof MetaError&&(['accepted','semantic','structure','asset','auth','quota','transport','timeout','provider','refusal','incomplete'] as string[]).includes(e.code)?e.code as FinalOutcome:'provider';
const ceramicPrompt='Ceramic pen holders and small trays in sand and charcoal, understated editorial still life, neutral studio background, text-free conceptual product study';
export async function runFinalQualification(options:{prerequisites:unknown;originalDirectory:string;directory:string;getKey:()=>Promise<string>;transportFactory:()=>MetaTransport;record:(name:string,value:unknown)=>void;retainOriginalImage?:(bytes:Buffer)=>void;origin:'fresh-meta'|'injected-test'}){
 let stage:'authorization'|'accounting'|'credential-entry'|'text-planning'|'image-generation'|'image-processing'|'evidence'='authorization',ticket:number|undefined,ledger:FinalQualificationLedger|undefined,metrics:MetaEvidence|undefined;
 const settle=(result:FinalOutcome)=>{if(ticket!==undefined){ledger!.settle(ticket,result,metrics);ticket=undefined;}};
 try{
  const binding=verifyFinalPrerequisites(options.prerequisites);stage='accounting';ledger=new FinalQualificationLedger(options.directory,options.originalDirectory,binding);
  stage='credential-entry';const key=await options.getKey();let kind:'image'|'ember'|'spark'='image',repairing=false;
  const adapter=createMetaAdapter({enabled:true,key,maximumCalls:4,timeoutMs:38000,retainOriginalImage:options.retainOriginalImage,observe:e=>{
   metrics=e;options.record(`provider-${ticket}-${e.phase}`,{origin:options.origin,...e,usage:e.usage??null,actualChargeUsd:null,publicationCleared:false});
  }},()=>{const transport=options.transportFactory();return async(url,init)=>{metrics=undefined;ticket=ledger!.reserve(kind,repairing,url,String(init.body));return transport(url,init);};})!;
  const local=QUALIFICATION_BRIEFS.map(r=>designSchemaV3.parse(planToSpec(fallbackPlan(r),r,'deterministic-fallback')));
  let image:Awaited<ReturnType<typeof adapter.image>>|undefined,imageFailure:string|null=null;
  // Image generation uses the validated local brief/spec; text-provider success is irrelevant.
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  try{
   stage='image-generation';options.record('image-local-base',{origin:'independent-local',request:QUALIFICATION_BRIEFS[0],spec:local[0],prompt:ceramicPrompt});
   image=await adapter.image(ceramicPrompt,undefined,controller.signal);settle('accepted');
   options.record('image-accepted',{origin:options.origin,model:image.model,asset:image.asset,usage:image.usage??null,elapsedMs:image.elapsedMs,processingMs:image.processingMs,publicationCleared:false});
  }catch(error){settle(outcome(error));imageFailure=error instanceof MetaError?error.code:'local-error';options.record('image-rejected',{origin:options.origin,...safeRecoveryDiagnostic(error,stage),metrics:metrics?{httpStatus:metrics.httpStatus,elapsedMs:metrics.elapsedMs,usage:metrics.usage??null}:null,actualChargeUsd:null});if(fatal(error))throw error;}
  finally{clearTimeout(timer);controller.abort();}
  const withImage=(spec:DesignSpecV3)=>image?designSchemaV3.parse({...spec,assetLayer:image.asset,artDirection:{...spec.artDirection,recipe:'editorial',adaptation:'balanced',design:spec.artDirection.design?{...spec.artDirection.design,imageRole:'immersive'}:undefined}}):spec;
  options.record('local-with-image',{origin:'independent-local-text',spec:withImage(local[0]),text:{provider:null,accepted:false,source:'independent-local'},image:{provider:image?'meta':null,model:image?.model??null,accepted:!!image,fallbackReason:imageFailure},publicationCleared:false});
  let repairUsed=false;
  const results=[];
  for(const index of [0,1]){
   const request=QUALIFICATION_BRIEFS[index],model=index===0?'muse-ember-1.0':'muse-spark-1.3';kind=index===0?'ember':'spark';
   let accepted:DesignSpecV3|undefined,diagnostics:ValidationDiagnostics|undefined,textFailure:string|null=null;
   const c=new AbortController(),t=setTimeout(()=>c.abort(),90000);
   try{for(let attempt=1;attempt<=2;attempt++){
    repairing=attempt===2;stage='text-planning';
    try{
     const response=await adapter.creativeEnvelope(request,model,c.signal,diagnostics);
     const checked=inspectConcepts(response.raw.concepts.map(v=>({...v,version:1,origin:'injected-provider'})),request,'injected-provider');
     // Persist all rejection codes and available measurements, even if none passes.
     options.record(`${kind}-${attempt}-validation`,{origin:options.origin,httpStatus:response.httpStatus,elapsedMs:response.elapsedMs,usage:response.usage??null,acceptedCount:checked.concepts.length,rejections:checked.rejections,actualChargeUsd:null});
     if(!checked.concepts.length){const reason=checked.rejections.find(v=>v.diagnostics?.stage==='semantic')?.diagnostics;throw new MetaError(reason?'semantic':'structure',reason);}
     accepted=designSchemaV3.parse({...planToSpec(checked.concepts[0].plan,request,'deterministic-fallback'),provenance:'manual-input'});settle('accepted');textFailure=null;break;
    }catch(error){
     settle(outcome(error));textFailure=error instanceof MetaError?error.code:'local-error';diagnostics=error instanceof MetaError?error.validation:undefined;
     options.record(`${kind}-${attempt}-rejected`,{origin:options.origin,...safeRecoveryDiagnostic(error,stage),diagnostics:diagnostics??null,metrics:metrics?{httpStatus:metrics.httpStatus,elapsedMs:metrics.elapsedMs,usage:metrics.usage??null}:null,actualChargeUsd:null});
     if(fatal(error))throw error;
     if(error instanceof MetaError&&error.code==='semantic'&&diagnostics&&!repairUsed&&attempt===1){repairUsed=true;continue;}break;
    }
   }}finally{clearTimeout(t);c.abort();}
   const spec=index===0?withImage(accepted??local[index]):accepted??local[index];
   const result={request,spec,text:{source:accepted?'meta':'independent-local',provider:accepted?'meta':null,model:accepted?model:null,accepted:!!accepted,fallbackReason:textFailure},image:{provider:index===0&&image?'meta':null,model:index===0&&image?image.model:null,accepted:index===0&&!!image,fallbackReason:index===0?imageFailure:'not-requested'},publicationCleared:false};
   options.record(`${kind}-selected`,{origin:options.origin,...result});results.push(result);
  }
  return {origin:options.origin,results,accounting:ledger.inspect(),repairUsed,actualChargeUsd:null};
 }catch(error){try{settle(outcome(error));}catch{throw new RecoveryFailure({stage:'accounting',classification:'unresolved-accounting',httpStatus:null});}const diagnostic=safeRecoveryDiagnostic(error,stage);if(ledger)options.record('final-failure',{origin:options.origin,...diagnostic,actualChargeUsd:null});throw new RecoveryFailure(diagnostic);}
}
