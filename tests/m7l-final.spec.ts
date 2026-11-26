import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import {QualificationLedger} from '../src/server/qualification-ledger';
import {FinalQualificationLedger,inspectFinalBaseline,type FinalBinding} from '../src/server/qualification-final-ledger';
import {runFinalQualification} from '../src/server/qualification-final';
import {QUALIFICATION_BRIEFS} from '../src/server/qualification-runner';
import {compactCreativeSchema,compactCreativePrompt,expandCreativeEnvelope} from '../src/server/meta-creative-contract';
import {fallbackPlan,validatePlan} from '../src/lib/generation/planner';
import {inspectConcepts} from '../src/lib/generation/concepts';
import {createMetaAdapter} from '../src/server/meta';
import type {GenerationRequest} from '../src/lib/generation/contracts';

const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
const text=(kind:'ember'|'spark')=>JSON.stringify({model:kind==='ember'?'muse-ember-1.0':'muse-spark-1.3',max_output_tokens:4000,store:false,stream:false});
const imageBody=()=>JSON.stringify({model:'muse-image-1.0',n:1,size:'1024x1024',response_format:'b64_json',output_format:'png',stream:false,tool_enablement:{enable_image_search:false,enable_web_search:false,enable_shell:false}});
function history(dir:string):FinalBinding{
 const original=new QualificationLedger(dir);original.settle(original.reserve('A','text','https://api.meta.ai/v1/responses',text('ember')),'auth');
 writeFileSync(path.join(dir,'A-text-1.json'),JSON.stringify({origin:'fresh-meta',model:'muse-ember-1.0',accepted:false,code:'auth',usage:null,actualChargeUsd:null}));
 const binding={lockSha256:sha(readFileSync(path.join(dir,'execution.lock'))),journalSha256:sha(readFileSync(path.join(dir,'dispatch.jsonl'))),evidenceSha256:sha(readFileSync(path.join(dir,'A-text-1.json')))};
 const continuation=new QualificationLedger(dir,binding);continuation.settle(continuation.reserve('A','text','https://api.meta.ai/v1/responses',text('ember')),'semantic');
 writeFileSync(path.join(dir,'recovery-failure.json'),JSON.stringify({origin:'fresh-meta',stage:'text-planning',classification:'semantic',httpStatus:null,usage:null,actualChargeUsd:null}));
 return Object.fromEntries(['execution.lock','continuation.lock','dispatch.jsonl','A-text-1.json','recovery-failure.json'].map(file=>[file,sha(readFileSync(path.join(dir,file)))])) as FinalBinding;
}
function approved(historicalBinding:FinalBinding){return {authorization:'M7-L-final-six-cumulative-20261126',liveExecutionAuthorized:true,finalExecutionAuthorized:true,accountEligibilityConfirmed:true,regionalEligibilityConfirmed:true,currentModelsConfirmed:true,secureCredentialAvailableConfirmed:true,offlineIntegrationVerified:true,fundingSource:'yarc-managed-fellowship',baselineAllocationUsd:10,remainingCreditUsd:null,remainingCreditUnknownAcknowledged:true,noPersonalBillingConfirmed:true,maximumActualRequests:6,maximumAdditionalRequests:4,maximumAdditionalReservationUsd:.17,maximumCumulativeReservationUsd:.19,estimatedReservationEnvelopeUsd:.20,historicalBinding,priorReviewedFingerprint:'a'.repeat(64)};}
function compact(request:GenerationRequest){const p=fallbackPlan(request),d=p.artDirection;return {version:1,concepts:[{id:'subject',interpretation:p.interpretation,campaign:{...p.campaign,cta:p.campaign.cta??''},factIds:'factIds' in p?p.factIds:[],direction:{variant:d.variant,palette:d.palette,visual:d.visual,recipe:d.recipe,emphasis:d.emphasis,information:d.information,adaptation:d.adaptation},rationale:p.rationale}]};}
const response=(value:unknown)=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}],usage:{input_tokens:123,output_tokens:17}});

test('M7L final: compact contract derives deterministic fields for all tastes; strict canonical validation remains',()=>{
 for(const taste of ['bold-street','minimal-swiss','festive-pop'] as const){const r={...QUALIFICATION_BRIEFS[0],taste},raw=compact(r),expanded=expandCreativeEnvelope(raw,r);expect(validatePlan(expanded.concepts[0].plan,r).issues).toEqual([]);expect(JSON.stringify(compactCreativeSchema(r).shape.concepts)).not.toContain('headlineScale');expect(()=>compactCreativeSchema(r).parse({...raw,secret:'unsafe'})).toThrow();}
 const prompt=compactCreativePrompt(QUALIFICATION_BRIEFS[0]);expect(prompt.system).not.toContain('subject-led');expect(prompt.system).toContain('application derives');expect(prompt.user).toContain('f-topic-0');
 const repair=compactCreativePrompt(QUALIFICATION_BRIEFS[0],{stage:'semantic',issues:[{code:'missing-supplied-fact',path:'$'}],truncated:false});expect(JSON.parse(repair.user).repair[0]).toContain('factLedger ID once in factIds');
 const wrong=compact(QUALIFICATION_BRIEFS[0]);wrong.concepts[0].direction.palette='street-acid';expect(()=>expandCreativeEnvelope(wrong,QUALIFICATION_BRIEFS[0])).toThrow();
});

test('M7L final: headline case fix is subject-independent and does not permit invented entities or facts',()=>{
 for(const r of [QUALIFICATION_BRIEFS[0],{...QUALIFICATION_BRIEFS[0],topic:'Introduce Loom Line, a collection of ceramic desk pieces.'}]){
  for(const headline of ['Quiet Order','Small Spaces','Made For Focus']){const p=fallbackPlan(r);p.campaign.headline=headline;expect(validatePlan(p,r).issues).toEqual([]);}
  for(const headline of ['Made by Acme Studios','Introducing Quiet Order','Venue: Quiet Order','Made in Kyoto','Quiet Order Ltd','Only 12 Available']){const p=fallbackPlan(r);p.campaign.headline=headline;expect(validatePlan(p,r).plan,headline).toBeUndefined();}
 }
 const p=fallbackPlan(QUALIFICATION_BRIEFS[0]);p.campaign.supportingText+='\nMade by Acme Studios.';expect(validatePlan(p,QUALIFICATION_BRIEFS[0]).issues).toContain('unsupported-named-entity');
 const supplied={...QUALIFICATION_BRIEFS[0],details:QUALIFICATION_BRIEFS[0].details+' Made in Kyoto.'};expect(validatePlan(fallbackPlan(supplied),supplied).issues).toEqual([]);
});

test('M7L final: numeric facts, prices, URLs, negations and immutable IDs retain paired guards',()=>{
 const r=QUALIFICATION_BRIEFS[1],base=fallbackPlan(r);expect(validatePlan(base,r).issues).toEqual([]);
 for(const extra of ['Entry ₹500.','Register at https://invented.invalid/entry.','Certificates will be issued.','Venue: Room Oak.','18 December 2027.']){const p=structuredClone(base);p.campaign.supportingText+='\n'+extra;expect(validatePlan(p,r).plan,extra).toBeUndefined();}
 const dropped={...structuredClone(base),factIds:'factIds' in base?(base.factIds as string[]).slice(1):[]};expect(validatePlan(dropped,r).issues).toContain('missing-supplied-fact');
});

test('M7L final: rejected concepts retain safe per-concept semantic and structural reasons',()=>{
 const r=QUALIFICATION_BRIEFS[0],p=fallbackPlan(r);p.campaign.headline='Acme Studios';
 const checked=inspectConcepts([{version:1,id:'bad',origin:'injected-provider',plan:p},{unexpected:'private detail'}],r,'injected-provider');
 expect(checked.concepts).toHaveLength(0);expect(checked.rejections).toHaveLength(2);expect(checked.rejections[0].diagnostics?.issues.map(i=>i.code)).toContain('unsupported-named-entity');expect(JSON.stringify(checked.rejections)).not.toContain('private detail');
});

test('M7L final: HTTP and credential-screened text evidence precede semantic validation; partial usage stays partial',async()=>{
 const evidence:unknown[]=[],r=QUALIFICATION_BRIEFS[0],raw=compact(r);raw.concepts[0].campaign.headline='Acme Studios';
 const adapter=createMetaAdapter({enabled:true,key:'synthetic-only',observe:e=>evidence.push(e)},()=>async()=>response(raw))!;
 const result=await adapter.creativeEnvelope(r,'muse-ember-1.0');expect(evidence).toHaveLength(2);expect(evidence[0]).toMatchObject({phase:'http',httpStatus:200});expect(evidence[1]).toMatchObject({phase:'complete',usage:{inputTokens:123,outputTokens:17}});expect(result.usage?.totalTokens).toBeUndefined();expect(inspectConcepts(result.raw.concepts.map(c=>({...c,version:1,origin:'injected-provider'})),r).concepts).toHaveLength(0);
});

test('M7L final: escaped credential echoes never enter private response capture',async()=>{
 const evidence:unknown[]=[];const adapter=createMetaAdapter({enabled:true,key:'synthetic-only',observe:e=>evidence.push(e)},()=>async()=>new Response('{"value":"synthetic-\\u006fnly"}',{status:200}))!;
 await expect(adapter.creativeEnvelope(QUALIFICATION_BRIEFS[0],'muse-ember-1.0')).rejects.toMatchObject({code:'structure'});expect(evidence).toHaveLength(1);expect(JSON.stringify(evidence)).not.toContain('synthetic');
});

test('M7L final: original image is retained, provenance metadata stays verbatim or refuses derivative; 160KB path remains',async()=>{
 function textChunk(data:Buffer){const kind=Buffer.from('tEXt'),chunk=Buffer.alloc(data.length+12);chunk.writeUInt32BE(data.length);kind.copy(chunk,4);data.copy(chunk,8);let crc=0xffffffff;for(const b of Buffer.concat([kind,data])){crc^=b;for(let i=0;i<8;i++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}chunk.writeUInt32BE((crc^0xffffffff)>>>0,data.length+8);return chunk;}
 const png=await sharp({create:{width:32,height:32,channels:3,background:'red'}}).png().toBuffer();
 const tagged=Buffer.concat([png.subarray(0,-12),textChunk(Buffer.from('Provenance\0Synthetic fixture only')),png.subarray(-12)]);
 let original:Buffer|undefined;
 const adapter=createMetaAdapter({enabled:true,key:'synthetic-only',retainOriginalImage:b=>{original=b;}},()=>async()=>Response.json({data:[{b64_json:tagged.toString('base64')}]}))!;
 await expect(adapter.image('Ceramic desk accessories')).rejects.toMatchObject({code:'asset'});expect(original).toEqual(tagged);
 const large=Buffer.concat([png.subarray(0,-12),textChunk(Buffer.from('Provenance\0'+'x'.repeat(160000))),png.subarray(-12)]);
 const blocked=createMetaAdapter({enabled:true,key:'synthetic-only',retainOriginalImage:b=>{original=b;}},()=>async()=>Response.json({data:[{b64_json:large.toString('base64')}]}))!;
 await expect(blocked.image('Ceramic desk accessories')).rejects.toMatchObject({code:'asset'});expect(original).toEqual(large);
 const noise=await sharp(randomBytes(300*300*3),{raw:{width:300,height:300,channels:3}}).png().toBuffer();expect(noise.length).toBeGreaterThan(160000);
 const prepared=createMetaAdapter({enabled:true,key:'synthetic-only'},()=>async()=>Response.json({data:[{b64_json:noise.toString('base64')}]}))!;
 expect((await prepared.image('Ceramic desk accessories')).asset.bytes).toBeLessThanOrEqual(160000);
});

test('M7L final: independent image first, six cumulative maximum and worst-case 0.19 reservations',({},info)=>{
 const original=info.outputPath('old'),binding=history(original),ledger=new FinalQualificationLedger(info.outputPath('new'),original,binding);
 ledger.settle(ledger.reserve('image',false,'https://api.meta.ai/v1/images/generations',imageBody()),'asset');
 ledger.settle(ledger.reserve('ember',false,'https://api.meta.ai/v1/responses',text('ember')),'semantic');
 ledger.settle(ledger.reserve('spark',false,'https://api.meta.ai/v1/responses',text('spark')),'semantic');
 ledger.settle(ledger.reserve('spark',true,'https://api.meta.ai/v1/responses',text('spark')),'accepted');
 expect(ledger.inspect().cumulativeRequests).toBe(6);expect(ledger.inspect().cumulativeEstimatedReservationUsd).toBeCloseTo(.19,10);expect(()=>ledger.reserve('spark',true,'https://api.meta.ai/v1/responses',text('spark'))).toThrow();
 expect(inspectFinalBaseline(original,binding).consumedRequests).toBe(2);expect(()=>new FinalQualificationLedger(info.outputPath('new'),original,binding)).toThrow();
});

test('M7L final: changed historical accounting, invalid approval and unresolved reservations refuse',async({},info)=>{
 const original=info.outputPath('old'),binding=history(original),dir=info.outputPath('new');let touched=false;
 await expect(runFinalQualification({originalDirectory:original,directory:dir,prerequisites:{...approved(binding),finalExecutionAuthorized:false},origin:'injected-test',getKey:async()=>{touched=true;return 'synthetic';},transportFactory:()=>{touched=true;throw Error();},record:()=>{touched=true;}})).rejects.toThrow();expect(touched).toBe(false);expect(existsSync(dir)).toBe(false);
 const ledger=new FinalQualificationLedger(dir,original,binding);ledger.reserve('image',false,'https://api.meta.ai/v1/images/generations',imageBody());expect(()=>ledger.reserve('ember',false,'https://api.meta.ai/v1/responses',text('ember'))).toThrow('unresolved');
 writeFileSync(path.join(original,'recovery-failure.json'),'changed');expect(()=>inspectFinalBaseline(original,binding)).toThrow();
});

test('M7L final: no transport/image retries, only one semantic repair shared across campaigns',({},info)=>{
 const original=info.outputPath('old'),binding=history(original),ledger=new FinalQualificationLedger(info.outputPath('new'),original,binding);
 expect(()=>ledger.reserve('ember',false,'https://api.meta.ai/v1/responses',text('ember'))).toThrow('sequence');
 ledger.settle(ledger.reserve('image',false,'https://api.meta.ai/v1/images/generations',imageBody()),'asset');expect(()=>ledger.reserve('image',false,'https://api.meta.ai/v1/images/generations',imageBody())).toThrow();
 ledger.settle(ledger.reserve('ember',false,'https://api.meta.ai/v1/responses',text('ember')),'semantic');ledger.settle(ledger.reserve('ember',true,'https://api.meta.ai/v1/responses',text('ember')),'semantic');
 ledger.settle(ledger.reserve('spark',false,'https://api.meta.ai/v1/responses',text('spark')),'semantic');expect(()=>ledger.reserve('spark',true,'https://api.meta.ai/v1/responses',text('spark'))).toThrow();
});

for(const failure of ['none','image','text','repair','both'] as const)test(`M7L final: ${failure} outcome preserves independent capability and truthful selected provenance`,async({},info)=>{
 const original=info.outputPath('old'),binding=history(original),png=await sharp({create:{width:32,height:32,channels:3,background:'#998877'}}).png().toBuffer();let calls=0,ember=0;
 const records:Record<string,unknown>={},seen:string[]=[];
 const result=await runFinalQualification({originalDirectory:original,directory:info.outputPath('new'),prerequisites:approved(binding),origin:'injected-test',getKey:async()=>'synthetic-only',record:(name,value)=>{records[name]=value;},transportFactory:()=>async(url,init)=>{
  calls++;const body=JSON.parse(String(init.body));seen.push(body.model);
  if(url.endsWith('/generations'))return failure==='image'||failure==='both'?Response.json({}):Response.json({data:[{b64_json:png.toString('base64')}]});
  const index=body.model==='muse-ember-1.0'?0:1,raw=compact(QUALIFICATION_BRIEFS[index]);
  if(index===0&&(failure==='text'||failure==='both'||failure==='repair'&&ember++===0))raw.concepts[0].campaign.headline='Acme Studios';
  if(body.input.includes('repair'))expect(body.input).toContain('unsupported-named-entity');
  return response(raw);
 }});
 expect(seen[0]).toBe('muse-image-1.0');expect(calls).toBe(failure==='text'||failure==='repair'||failure==='both'?4:3);expect(result.results[0].image.accepted).toBe(failure!=='image'&&failure!=='both');expect(result.results[0].text.accepted).toBe(failure!=='text'&&failure!=='both');expect(result.results[1].text.accepted).toBe(true);
 expect(result.results[0].spec.creativeContent?.factIds.length).toBeGreaterThan(0);expect(records['provider-4-complete']).toBeDefined();expect(records['ember-1-validation']).toBeDefined();expect(JSON.stringify(records)).not.toContain('synthetic-only');
 if(failure==='text'||failure==='both')expect(result.results[0].text.source).toBe('independent-local');
 if(failure==='image'||failure==='both')expect(result.results[0].spec.assetLayer).toBeUndefined();
});

for(const status of [401,403,429,503])test(`M7L final: shared HTTP ${status} failure stops before text`,async({},info)=>{
 const original=info.outputPath('old'),binding=history(original);let calls=0;
 await expect(runFinalQualification({originalDirectory:original,directory:info.outputPath('new'),prerequisites:approved(binding),origin:'injected-test',getKey:async()=>'synthetic-only',record:()=>{},transportFactory:()=>async()=>{calls++;return new Response('private body',{status});}})).rejects.toThrow();expect(calls).toBe(1);
});
