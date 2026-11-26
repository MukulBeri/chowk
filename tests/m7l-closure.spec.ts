import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {interpretCreativeBrief} from "../src/lib/generation/creative-brief";
import {fallbackPlan,planToSpec,validatePlan} from "../src/lib/generation/planner";
import {QualificationLedger} from "../src/server/qualification-ledger";
import {runQualification,QUALIFICATION_BRIEFS,verifyQualificationPrerequisites} from "../src/server/qualification-runner";
const request=QUALIFICATION_BRIEFS[0];
const approved={authorization:"M7-L-four-dispatches-20261126",liveExecutionAuthorized:true,accountEligibilityConfirmed:true,regionalEligibilityConfirmed:true,currentModelsConfirmed:true,secureCredentialAvailableConfirmed:true,offlineIntegrationVerified:true,fundingSource:"yarc-managed-fellowship",baselineAllocationUsd:10,remainingCreditUsd:null,remainingCreditUnknownAcknowledged:true,noPersonalBillingConfirmed:true,maximumActualRequests:4,maximumSessionRequests:2,estimatedReservationEnvelopeUsd:.20};
const body=(session:"A"|"B")=>JSON.stringify({model:session==="A"?"muse-ember-1.0":"muse-spark-1.3",max_output_tokens:4000,store:false,stream:false});
const url="https://api.meta.ai/v1/responses";

test("M7L closure: noun-phrase styles and labelled design roles stay outside public copy",()=>{
 for(const style of ["Understated editorial direction.","Warm playful palette.","Restrained modern composition.","Typography: condensed and bold.","Prefer a quiet editorial aesthetic."]){const input={...request,details:`Pen holders in sand. ${style}`},brief=interpretCreativeBrief(input),plan=fallbackPlan(input),spec=planToSpec(plan,input,"deterministic-fallback");expect(brief.directions).toContain(style);expect(spec.campaign.supportingText).not.toContain(style);expect(brief.facts.map(f=>f.text)).toContain("Pen holders in sand.");}
});
test("M7L closure: mixed clauses, explicit public overrides and genuine negative facts survive",()=>{
 const input={...request,details:"Pen holders and trays in sand; understated editorial direction; No certificates will be issued. No entry fee. Do not include nuts. Public copy: Understated editorial direction."},brief=interpretCreativeBrief(input);expect(brief.directions.some(d=>d.includes('understated'))).toBe(true);for(const fact of ["No certificates will be issued.","No entry fee.","Do not include nuts.","Understated editorial direction."])expect(brief.facts.map(f=>f.text)).toContain(fact);
 const spec=planToSpec(fallbackPlan(input),input,"deterministic-fallback");expect(spec.campaign.supportingText).toContain("Understated editorial direction.");expect(validatePlan(fallbackPlan(input),input).plan).toBeDefined();
 const product={...request,details:"Sand and charcoal colours. A tray with playful graphics. Use a premium pen holder."};expect(interpretCreativeBrief(product).facts).toHaveLength(4);
});
test("M7L closure: style-only subjectless briefs do not manufacture a campaign",()=>{const r={...request,topic:"Understated editorial direction.",details:"Warm playful palette."};expect(interpretCreativeBrief(r).facts).toHaveLength(0);expect(()=>fallbackPlan(r)).toThrow();});

test("M7L dispatcher: durable reservation precedes transport; four-slot path and unknown charges",async({},info)=>{
 const png=await sharp({create:{width:32,height:32,channels:3,background:"#887766"}}).png().toBuffer(),directory=info.outputPath('ledger');let calls=0,b=0;
 const result=await runQualification({directory,prerequisites:approved,origin:"injected-test",getKey:async()=>"synthetic-test-key",record:(name,data)=>writeFileSync(info.outputPath(name+'.json'),JSON.stringify(data,null,2)),transportFactory:()=>async(endpoint,init)=>{
  calls++;const journal=QualificationLedger.inspect(directory);expect(journal.at(-1).event).toBe("reserved");expect(journal.filter(e=>e.event==='reserved')).toHaveLength(calls);expect(readFileSync(path.join(directory,'dispatch.jsonl'),'utf8')).not.toContain('synthetic-test-key');
  if(endpoint.endsWith('/generations'))return Response.json({data:[{b64_json:png.toString('base64')}]});
  const model=JSON.parse(String(init.body)).model,r=model==='muse-ember-1.0'?QUALIFICATION_BRIEFS[0]:QUALIFICATION_BRIEFS[1],p=fallbackPlan(r),raw=model==='muse-spark-1.3'&&b++===0?{}:{version:1,concepts:[{id:'subject',plan:{...p,campaign:{...p.campaign,cta:p.campaign.cta??''}}}]};return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(raw)}]}]});
 }});expect(calls).toBe(4);expect(result.results.map(r=>r.image)).toEqual([true,false]);expect(result.actualChargeUsd).toBeNull();expect(result.dispatches.filter(e=>e.event==='reserved').reduce((n,e)=>n+e.reservationUsd,0)).toBeLessThanOrEqual(.20);expect(()=>new QualificationLedger(directory)).toThrow('duplicate-or-interrupted-run');
});
test("M7L dispatcher: repair uses image slot, then B repair reaches exactly four calls",async({},info)=>{
 let a=0,b=0,calls=0;const result=await runQualification({directory:info.outputPath('ledger'),prerequisites:approved,origin:'injected-test',getKey:async()=>"synthetic-test-key",record:()=>{},transportFactory:()=>async(url,init)=>{calls++;expect(url.endsWith('/responses')).toBe(true);const model=JSON.parse(String(init.body)).model,isA=model==='muse-ember-1.0',p=fallbackPlan(QUALIFICATION_BRIEFS[isA?0:1]),raw=(isA?a++:b++)===0?{}:{version:1,concepts:[{id:'subject',plan:{...p,campaign:{...p.campaign,cta:p.campaign.cta??''}}}]};return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(raw)}]}]});}});expect(calls).toBe(4);expect(result.results.every(r=>!r.image)).toBe(true);
});
test("M7L dispatcher: auth and quota stop globally; failed requests retain full reservation",async({},info)=>{
 for(const status of [401,429]){let calls=0;const directory=info.outputPath(String(status));await expect(runQualification({directory,prerequisites:approved,origin:'injected-test',getKey:async()=>"synthetic-test-key",record:()=>{},transportFactory:()=>async()=>{calls++;return new Response('private body',{status});}})).rejects.toThrow();expect(calls).toBe(1);const events=QualificationLedger.inspect(directory);expect(events[0].reservationUsd).toBe(.01);expect(events[1].actualChargeUsd).toBeNull();expect(JSON.stringify(events)).not.toContain('private body');}
});
test("M7L dispatcher: interruption, endpoint/model/tool/size guards and duplicate prevention",({},info)=>{
 const dir=info.outputPath('interrupted'),ledger=new QualificationLedger(dir);expect(()=>ledger.reserve('A','text','https://evil.invalid',body('A'))).toThrow();expect(()=>ledger.reserve('A','text',url,body('B'))).toThrow();expect(()=>ledger.reserve('A','text',url,JSON.stringify({...JSON.parse(body('A')),tools:[]}))).toThrow();expect(()=>ledger.reserve('A','text',url,JSON.stringify({...JSON.parse(body('A')),input:'x'.repeat(32001)}))).toThrow();const id=ledger.reserve('A','text',url,body('A'));expect(id).toBe(1);expect(()=>ledger.reserve('B','text',url,body('B'))).toThrow('unresolved-charge');expect(()=>new QualificationLedger(dir)).toThrow();expect(QualificationLedger.inspect(dir)).toHaveLength(1);
});
test("M7L dispatcher: incomplete owner prerequisites precede credential and transport access",async({},info)=>{
 expect(()=>verifyQualificationPrerequisites({...approved,liveExecutionAuthorized:false})).toThrow();await expect(runQualification({directory:info.outputPath('blocked'),prerequisites:{...approved,promotionalBalanceUsd:null},origin:'injected-test',getKey:async()=>{throw Error('key must not be read');},transportFactory:()=>{throw Error('transport must not be created');},record:()=>{}})).rejects.toThrow('owner-account-or-execution-gate');
});
