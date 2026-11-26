import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import {QualificationLedger,inspectAuthenticationRecovery,type RecoveryBinding} from '../src/server/qualification-ledger';
import {QUALIFICATION_BRIEFS} from '../src/server/qualification-runner';
import {runAuthenticationRecovery,verifyRecoveryPrerequisites,safeRecoveryDiagnostic} from '../src/server/qualification-recovery';
import {MetaError} from '../src/server/meta';
import {fallbackPlan} from '../src/lib/generation/planner';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Native owner entry point; importing does not execute it.
const launcher:typeof import('../evaluation/m7l-owner-run.cjs')=require('../evaluation/m7l-owner-run.cjs');
const sha=(data:Buffer|string)=>createHash('sha256').update(data).digest('hex');
const text=(session:'A'|'B')=>JSON.stringify({model:session==='A'?'muse-ember-1.0':'muse-spark-1.3',max_output_tokens:4000,store:false,stream:false});
function seed(directory:string){
 const ledger=new QualificationLedger(directory);ledger.settle(ledger.reserve('A','text','https://api.meta.ai/v1/responses',text('A')),'auth');
 writeFileSync(path.join(directory,'A-text-1.json'),JSON.stringify({origin:'fresh-meta',model:'muse-ember-1.0',accepted:false,code:'auth',usage:null,actualChargeUsd:null}));
 const hash=(file:string)=>sha(readFileSync(path.join(directory,file)));
 return {lockSha256:hash('execution.lock'),journalSha256:hash('dispatch.jsonl'),evidenceSha256:hash('A-text-1.json')};
}
function approved(accountingBinding:RecoveryBinding){return {authorization:'M7-L-auth-recovery-20261126',liveExecutionAuthorized:true,continuationExecutionAuthorized:true,accountEligibilityConfirmed:true,regionalEligibilityConfirmed:true,currentModelsConfirmed:true,secureCredentialAvailableConfirmed:true,offlineIntegrationVerified:true,fundingSource:'yarc-managed-fellowship',baselineAllocationUsd:10,remainingCreditUsd:null,remainingCreditUnknownAcknowledged:true,noPersonalBillingConfirmed:true,maximumActualRequests:4,maximumSessionRequests:{A:3,B:1},estimatedReservationEnvelopeUsd:.20,accountingBinding,priorReviewedFingerprint:launcher.RECOVERY_PRIOR_FINGERPRINT};}
const envelope=(index:number)=>{const p=fallbackPlan(QUALIFICATION_BRIEFS[index]);return {status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({version:1,concepts:[{id:'subject',plan:{...p,campaign:{...p.campaign,cta:p.campaign.cta??''}}}]})}]}]};};

test('M7L recovery: original settled rejection reconciles read-only; claim is durable and single-use',({},info)=>{
 const dir=info.outputPath('run'),binding=seed(dir),prefix=readFileSync(path.join(dir,'dispatch.jsonl'));
 expect(inspectAuthenticationRecovery(dir,binding)).toHaveLength(2);expect(existsSync(path.join(dir,'continuation.lock'))).toBe(false);
 new QualificationLedger(dir,binding);expect(readFileSync(path.join(dir,'dispatch.jsonl'))).toEqual(prefix);
 expect(()=>new QualificationLedger(dir,binding)).toThrow();expect(()=>new QualificationLedger(dir)).toThrow();
 expect(sha(readFileSync(path.join(dir,'execution.lock')))).toBe(binding.lockSha256);expect(sha(readFileSync(path.join(dir,'A-text-1.json')))).toBe(binding.evidenceSha256);
});

test('M7L recovery: changed evidence, wrong hashes, unexpected or unresolved accounting refuse before claiming',({},info)=>{
 for(const mutation of ['journal','evidence','lock','extra','unresolved']){
  const dir=info.outputPath(mutation),binding=seed(dir);
  if(mutation==='extra')writeFileSync(path.join(dir,'unexpected.json'),'{}');
  else if(mutation==='unresolved'){
   const journal=path.join(dir,'dispatch.jsonl');writeFileSync(journal,readFileSync(journal,'utf8').split('\n')[0]+'\n');binding.journalSha256=sha(readFileSync(journal));
  }else writeFileSync(path.join(dir,mutation==='journal'?'dispatch.jsonl':mutation==='evidence'?'A-text-1.json':'execution.lock'),'changed');
  expect(()=>new QualificationLedger(dir,binding)).toThrow();expect(existsSync(path.join(dir,'continuation.lock'))).toBe(false);
 }
});

test('M7L recovery: explicit revised authorization gates key, transport, records and claim',async({},info)=>{
 const dir=info.outputPath('run'),binding=seed(dir),p=approved(binding);
 for(const change of [{continuationExecutionAuthorized:false},{liveExecutionAuthorized:false},{remainingCreditUnknownAcknowledged:false},{maximumSessionRequests:{A:2,B:2}},{maximumActualRequests:5},{remainingCreditUsd:10},{authorization:'old'},{apiKey:'synthetic-only'}]){
  let touched=false;
  await expect(runAuthenticationRecovery({directory:dir,prerequisites:{...p,...change},origin:'injected-test',getKey:async()=>{touched=true;return 'synthetic-only';},transportFactory:()=>{touched=true;throw Error();},record:()=>{touched=true;}})).rejects.toMatchObject({diagnostic:{stage:'authorization'}});
  expect(touched).toBe(false);expect(existsSync(path.join(dir,'continuation.lock'))).toBe(false);
 }
 expect(()=>verifyRecoveryPrerequisites(p)).not.toThrow();
});

test('M7L recovery: exactly three injected dispatches append IDs 2-4, A3/B1 and cumulative 0.105 USD',async({},info)=>{
 const dir=info.outputPath('run'),binding=seed(dir),prefix=readFileSync(path.join(dir,'dispatch.jsonl')),png=await sharp({create:{width:32,height:32,channels:3,background:'#998877'}}).png().toBuffer();
 let calls=0;const sequence:string[]=[],records:Record<string,unknown>={};
 const result=await runAuthenticationRecovery({directory:dir,prerequisites:approved(binding),origin:'injected-test',getKey:async()=>'synthetic-only',record:(name,data)=>{records[name]=data;},transportFactory:()=>async(url,init)=>{
  calls++;const entries=QualificationLedger.inspect(dir);expect(entries.at(-1)).toMatchObject({event:'reserved',id:calls+1});
  const body=JSON.parse(String(init.body));sequence.push(body.model);
  return url.endsWith('/generations')?Response.json({data:[{b64_json:png.toString('base64')}]}):Response.json(envelope(body.model==='muse-ember-1.0'?0:1));
 }});
 expect(calls).toBe(3);expect(sequence).toEqual(['muse-ember-1.0','muse-image-1.0','muse-spark-1.3']);
 expect(result.results.map(r=>r.image)).toEqual([true,false]);expect(result.actualChargeUsd).toBeNull();
 const reserved=result.dispatches.filter(e=>e.event==='reserved');expect(reserved).toHaveLength(4);expect(reserved.filter(e=>e.session==='A')).toHaveLength(3);expect(reserved.filter(e=>e.session==='B')).toHaveLength(1);expect(reserved.reduce((sum,e)=>sum+e.reservationUsd,0)).toBeCloseTo(.105,10);
 expect(readFileSync(path.join(dir,'dispatch.jsonl')).subarray(0,prefix.length)).toEqual(prefix);expect(sha(readFileSync(path.join(dir,'A-text-1.json')))).toBe(binding.evidenceSha256);expect(JSON.stringify(records)).not.toContain('synthetic-only');
});

test('M7L recovery: sequence, accepted planning prerequisite, no repairs and cumulative fifth-call refusal',({},info)=>{
 const dir=info.outputPath('run'),ledger=new QualificationLedger(dir,seed(dir));
 expect(()=>ledger.reserve('B','text','https://api.meta.ai/v1/responses',text('B'))).toThrow('recovery-sequence');
 const id=ledger.reserve('A','text','https://api.meta.ai/v1/responses',text('A'));
 expect(()=>ledger.reserve('A','text','https://api.meta.ai/v1/responses',text('A'))).toThrow('unresolved');
 ledger.settle(id,'semantic');expect(()=>ledger.reserve('A','text','https://api.meta.ai/v1/responses',text('A'))).toThrow('terminal');
 const full=info.outputPath('complete'),complete=new QualificationLedger(full,seed(full));
 complete.settle(complete.reserve('A','text','https://api.meta.ai/v1/responses',text('A')),'accepted');
 expect(()=>complete.reserve('A','text','https://api.meta.ai/v1/responses',text('A'))).toThrow('recovery-sequence');
 complete.settle(complete.reserve('A','image','https://api.meta.ai/v1/images/generations',JSON.stringify({model:'muse-image-1.0',n:1,size:'1024x1024',response_format:'b64_json',output_format:'png',stream:false,tool_enablement:{enable_image_search:false,enable_web_search:false,enable_shell:false}})),'accepted');
 complete.settle(complete.reserve('B','text','https://api.meta.ai/v1/responses',text('B')),'accepted');
 expect(()=>complete.reserve('B','text','https://api.meta.ai/v1/responses',text('B'))).toThrow('call-budget');
});

for(const status of [401,403,429,500])test(`M7L recovery: HTTP ${status} reports safe exact status and stops without retry`,async({},info)=>{
 const dir=info.outputPath('run'),binding=seed(dir);let calls=0;const records:unknown[]=[];
 await expect(runAuthenticationRecovery({directory:dir,prerequisites:approved(binding),origin:'injected-test',getKey:async()=>'synthetic-only',record:(_name,data)=>records.push(data),transportFactory:()=>async()=>{calls++;return new Response('sensitive provider body',{status});}})).rejects.toMatchObject({diagnostic:{stage:'text-planning',httpStatus:status,classification:status===401?'http-401-authentication':status===403?'http-403-access':status===429?'quota':'provider'}});
 expect(calls).toBe(1);expect(QualificationLedger.inspect(dir).filter(e=>e.event==='reserved')).toHaveLength(2);expect(JSON.stringify(records)).not.toContain('sensitive provider body');expect(JSON.stringify(records)).not.toContain('synthetic-only');expect(()=>new QualificationLedger(dir,binding)).toThrow();
});

test('M7L recovery: structure and transport failures do not repair; image failure prevents Spark',async({},info)=>{
 for(const failure of ['structure','transport','image']){
  const dir=info.outputPath(failure),binding=seed(dir);let calls=0;
  await expect(runAuthenticationRecovery({directory:dir,prerequisites:approved(binding),origin:'injected-test',getKey:async()=>'synthetic-only',record:()=>{},transportFactory:()=>async()=>{calls++;if(failure==='transport')throw Error('private transport detail');if(failure==='image'&&calls===1)return Response.json(envelope(0));return Response.json({});}})).rejects.toMatchObject({diagnostic:{classification:failure==='structure'?'structure':failure==='transport'?'transport':'asset'}});
  expect(calls).toBe(failure==='image'?2:1);
 }
});

test('M7L recovery: credential cancellation consumes continuation claim but no provider slot',async({},info)=>{
 const dir=info.outputPath('run'),binding=seed(dir);let transport=false;
 await expect(runAuthenticationRecovery({directory:dir,prerequisites:approved(binding),origin:'injected-test',getKey:async()=>{throw Error('private input detail');},record:()=>{},transportFactory:()=>{transport=true;throw Error();}})).rejects.toMatchObject({diagnostic:{stage:'credential-entry',classification:'credential-entry-failure'}});
 expect(transport).toBe(false);expect(QualificationLedger.inspect(dir)).toHaveLength(2);expect(existsSync(path.join(dir,'continuation.lock'))).toBe(true);expect(()=>new QualificationLedger(dir,binding)).toThrow();
});

test('M7L recovery: safe diagnostic projection never includes raw errors or unexpected fields',()=>{
 expect(safeRecoveryDiagnostic(new Error('secret body or header'),'text-planning')).toEqual({stage:'text-planning',classification:'local-runtime-or-evidence-failure',httpStatus:null});
 expect(safeRecoveryDiagnostic(new MetaError('auth',undefined,403),'text-planning')).toEqual({stage:'text-planning',classification:'http-403-access',httpStatus:403});
 expect(safeRecoveryDiagnostic(new MetaError('auth',undefined,NaN),'text-planning').httpStatus).toBeNull();
 const messages:string[]=[],original=console.error;console.error=(value:unknown)=>{messages.push(String(value));};
 try{
  launcher.reportSafeFailure({message:'private detail',diagnostic:{stage:'text-planning',classification:'http-403-access',httpStatus:403,body:'private body',authorization:'private header'}});
  launcher.reportSafeFailure({diagnostic:{stage:'text-planning',classification:'private detail',httpStatus:401}});
 }finally{console.error=original;}
 expect(messages.join('\n')).not.toContain('private');expect(JSON.parse(messages[0])).toEqual({stage:'text-planning',classification:'http-403-access',httpStatus:403});
});
