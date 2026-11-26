import {createMetaAdapter,MetaError,type MetaCode,type MetaTransport} from './meta';
import {QualificationLedger,QualificationStop,type RecoveryBinding,type QualificationOutcome} from './qualification-ledger';
import {QUALIFICATION_BRIEFS,verifyQualificationPrerequisites} from './qualification-runner';
import {validatedConcepts} from '../lib/generation/concepts';
import {planToSpec} from '../lib/generation/planner';
import {designSchemaV3,type DesignSpecV3} from '../lib/design';

type Stage='authorization'|'accounting'|'credential-entry'|'text-planning'|'image-generation'|'image-processing'|'evidence';
export type RecoveryDiagnostic={stage:Stage;classification:string;httpStatus:number|null};
export class RecoveryFailure extends Error{constructor(public diagnostic:RecoveryDiagnostic){super('Qualification continuation stopped safely');}}
export function safeRecoveryDiagnostic(error:unknown,stage:Stage):RecoveryDiagnostic{
 const allowed:MetaCode[]=['auth','quota','timeout','transport','provider','structure','semantic','asset','refusal','incomplete','budget','disabled'];
 if(error instanceof MetaError&&allowed.includes(error.code)){
  const candidate=error.httpStatus,status=typeof candidate==='number'&&Number.isInteger(candidate)&&candidate>=100&&candidate<=599?candidate:null;
  return {stage:error.code==='asset'?'image-processing':stage,classification:status===401?'http-401-authentication':status===403?'http-403-access':error.code,httpStatus:status};
 }
 return {stage,classification:error instanceof QualificationStop?'accounting-refusal':stage==='credential-entry'?'credential-entry-failure':'local-runtime-or-evidence-failure',httpStatus:null};
}
export function verifyRecoveryPrerequisites(value:unknown):RecoveryBinding{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new QualificationStop('recovery-authorization');
 const {authorization,continuationExecutionAuthorized,maximumSessionRequests,accountingBinding,priorReviewedFingerprint,...base}=value as Record<string,unknown>;
 if(authorization!=='M7-L-auth-recovery-20261126'||continuationExecutionAuthorized!==true||JSON.stringify(maximumSessionRequests)!==JSON.stringify({A:3,B:1})||typeof priorReviewedFingerprint!=='string'||!/^[a-f0-9]{64}$/.test(priorReviewedFingerprint)||!accountingBinding||typeof accountingBinding!=='object'||Array.isArray(accountingBinding))throw new QualificationStop('recovery-authorization');
 const b=accountingBinding as Record<string,unknown>;
 if(JSON.stringify(Object.keys(b).sort())!==JSON.stringify(['evidenceSha256','journalSha256','lockSha256'])||Object.values(b).some(v=>typeof v!=='string'||!/^[a-f0-9]{64}$/.test(v)))throw new QualificationStop('recovery-authorization');
 verifyQualificationPrerequisites({...base,authorization:'M7-L-four-dispatches-20261126',maximumSessionRequests:2});
 return b as RecoveryBinding;
}

// Private owner-only continuation. Same adapter, immutable briefs, validators,
// renderer contract and raster path. No repair loop and no production activation.
export async function runAuthenticationRecovery(options:{prerequisites:unknown;directory:string;getKey:()=>Promise<string>;transportFactory:()=>MetaTransport;record:(name:string,data:unknown)=>void;origin:'fresh-meta'|'injected-test'}){
 let stage:Stage='authorization',ticket:number|undefined,ledger:QualificationLedger|undefined;
 const finish=(outcome:QualificationOutcome,usage?:Parameters<QualificationLedger['settle']>[2])=>{if(ticket!==undefined){ledger!.settle(ticket,outcome,usage);ticket=undefined;}};
 try{
  const binding=verifyRecoveryPrerequisites(options.prerequisites);stage='accounting';ledger=new QualificationLedger(options.directory,binding);
  stage='credential-entry';const key=await options.getKey();let session:'A'|'B'='A';
  const adapter=createMetaAdapter({enabled:true,key,maximumCalls:3,timeoutMs:38000},()=>{
   const transport=options.transportFactory();
   return async(url,init)=>{ticket=ledger!.reserve(session,url.endsWith('/responses')?'text':'image',url,String(init.body));return transport(url,init);};
  })!;
  const results:{session:string;concepts:{id:string;spec:DesignSpecV3}[];image:boolean}[]=[];
  for(const index of [0,1]){
   session=index===0?'A':'B';const request=QUALIFICATION_BRIEFS[index],model=index===0?'muse-ember-1.0':'muse-spark-1.3',controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
   try{
    stage='text-planning';
    const response=await adapter.conceptEnvelope(request,model,controller.signal);
    const concepts=validatedConcepts(response.raw.concepts.map(c=>({...c,version:1,origin:'injected-provider'})),request,'injected-provider');
    if(!concepts.length)throw new MetaError('semantic');
    const accepted=concepts.map(c=>({id:c.id,spec:designSchemaV3.parse({...planToSpec(c.plan,request,'deterministic-fallback'),provenance:'manual-input'})}));
    finish('accepted',response.usage);stage='evidence';
    options.record(`${session}-recovery-text`,{origin:options.origin,request,model,acceptedConcepts:accepted,providerResponse:response.raw,elapsedMs:response.elapsedMs,usage:response.usage??null,actualChargeUsd:null,publicationCleared:false});
    let image=false;
    if(session==='A'){
     stage='image-generation';
     const prepared=await adapter.image('Ceramic pen holders and small trays in sand and charcoal, understated editorial still life, neutral studio background, text-free conceptual product study',undefined,controller.signal);
     stage='image-processing';const spec=accepted[0].spec;
     accepted[0].spec=designSchemaV3.parse({...spec,assetLayer:prepared.asset,artDirection:{...spec.artDirection,recipe:'editorial',adaptation:'balanced',design:spec.artDirection.design?{...spec.artDirection.design,imageRole:'immersive'}:undefined}});
     finish('accepted',prepared.usage);image=true;stage='evidence';
     options.record('A-recovery-image',{origin:options.origin,model:prepared.model,elapsedMs:prepared.elapsedMs,processingMs:prepared.processingMs,usage:prepared.usage??null,actualChargeUsd:null,spec:accepted[0].spec,publicationCleared:false});
    }
    stage='evidence';options.record(`${session}-recovery-selected`,{origin:options.origin,request,selectedConcept:accepted[0],allConcepts:accepted,image,canonicalSpecificationProvenance:'manual-input imported validated plan; fresh-meta provenance retained separately'});
    results.push({session,concepts:accepted,image});
   }finally{clearTimeout(timer);controller.abort();}
  }
  return {origin:options.origin,results,dispatches:ledger.inspect(),actualChargeUsd:null};
 }catch(error){
  const diagnostic=safeRecoveryDiagnostic(error,stage);
  const outcome:QualificationOutcome=error instanceof MetaError&&['auth','quota','timeout','transport','structure','semantic'].includes(error.code)?error.code as QualificationOutcome:'unsafe';
  // A local error must not settle an outstanding request as successful or enable a retry.
  try{finish(outcome);}catch{throw new RecoveryFailure({stage:'accounting',classification:'unresolved-accounting',httpStatus:null});}
  // Only after the exclusive claim; never overwrite the original rejected record.
  if(ledger)try{options.record('recovery-failure',{origin:options.origin,accepted:false,...diagnostic,usage:null,actualChargeUsd:null});}catch{throw new RecoveryFailure({stage:'evidence',classification:'evidence-write-failure',httpStatus:diagnostic.httpStatus});}
  throw new RecoveryFailure(diagnostic);
 }
}
