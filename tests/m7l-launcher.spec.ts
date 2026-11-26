import {test,expect} from "@playwright/test";
import {createHash} from "node:crypto";
import {existsSync,mkdirSync,writeFileSync} from "node:fs";
import {PassThrough,Writable} from "node:stream";
import path from "node:path";
import {runQualification,verifyQualificationPrerequisites} from "../src/server/qualification-runner";
import {QualificationLedger} from "../src/server/qualification-ledger";
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Inspect the native owner launcher without executing its CLI.
const launcher:typeof import("../evaluation/m7l-owner-run.cjs")=require("../evaluation/m7l-owner-run.cjs");
const digest=(s:string)=>createHash("sha256").update(s).digest("hex");
const approved={authorization:"M7-L-four-dispatches-20261126",liveExecutionAuthorized:true,accountEligibilityConfirmed:true,regionalEligibilityConfirmed:true,currentModelsConfirmed:true,secureCredentialAvailableConfirmed:true,offlineIntegrationVerified:true,fundingSource:"yarc-managed-fellowship",baselineAllocationUsd:10,remainingCreditUsd:null,remainingCreditUnknownAcknowledged:true,noPersonalBillingConfirmed:true,maximumActualRequests:4,maximumSessionRequests:2,estimatedReservationEnvelopeUsd:.20};

test("M7L launcher: unknown remaining credit requires explicit owner acknowledgement, not an invented balance",()=>{
 expect(()=>verifyQualificationPrerequisites(approved)).not.toThrow();
 for(const field of ["liveExecutionAuthorized","accountEligibilityConfirmed","regionalEligibilityConfirmed","currentModelsConfirmed","secureCredentialAvailableConfirmed","offlineIntegrationVerified","remainingCreditUnknownAcknowledged","noPersonalBillingConfirmed"]){
  expect(()=>verifyQualificationPrerequisites({...approved,[field]:false})).toThrow("owner-account-or-execution-gate");
  const missing:Record<string,unknown>={...approved};delete missing[field];expect(()=>verifyQualificationPrerequisites(missing)).toThrow();
 }
 for(const change of [{remainingCreditUsd:10},{baselineAllocationUsd:0},{fundingSource:"personal"},{maximumActualRequests:5},{maximumSessionRequests:3},{estimatedReservationEnvelopeUsd:.21},{promotionalBalanceUsd:10},{apiKey:"synthetic-only"}])expect(()=>verifyQualificationPrerequisites({...approved,...change})).toThrow();
 for(const invalid of [null,[],{},"approved"])expect(()=>verifyQualificationPrerequisites(invalid)).toThrow();
});

test("M7L launcher: invalid authorization refuses before key, transport or durable execution lock",async({},info)=>{
 for(const change of [{liveExecutionAuthorized:false},{remainingCreditUnknownAcknowledged:false},{authorization:"other"}]){
  let key=false,transport=false,record=false;const directory=info.outputPath(String(Object.keys(change)[0]));
  await expect(runQualification({directory,prerequisites:{...approved,...change},origin:"injected-test",getKey:async()=>{key=true;return "synthetic-only";},transportFactory:()=>{transport=true;throw Error("Forbidden");},record:()=>{record=true;}})).rejects.toThrow("owner-account-or-execution-gate");
  expect({key,transport,record,created:existsSync(directory)}).toEqual({key:false,transport:false,record:false,created:false});
 }
});

test("M7L launcher: reviewed release HEAD, aggregate, per-file and complete source coverage all bind",({},info)=>{
 const root=info.outputPath("source");mkdirSync(root,{recursive:true});writeFileSync(path.join(root,"runtime.ts"),"reviewed");
 const records=[{file:"runtime.ts",sha256:digest("reviewed")}],source={head:launcher.ACCEPTED_RELEASE_HEAD,records,fingerprint:digest(JSON.stringify(records))};
 const prerequisites={expectedHead:launcher.ACCEPTED_RELEASE_HEAD,reviewedFingerprint:source.fingerprint};
 const inspect=()=>({head:launcher.ACCEPTED_RELEASE_HEAD,files:["runtime.ts"]});
 expect(launcher.verifyReviewedSource(prerequisites,source,{root,inspect})).toBe(source.fingerprint);
 expect(()=>launcher.verifyReviewedSource(prerequisites,source,{root,inspect:()=>({...inspect(),head:"unexpected"})})).toThrow("HEAD mismatch");
 expect(()=>launcher.verifyReviewedSource({...prerequisites,expectedHead:"unexpected"},source,{root,inspect})).toThrow("HEAD mismatch");
 expect(()=>launcher.verifyReviewedSource(prerequisites,{...source,head:"unexpected"},{root,inspect})).toThrow("HEAD mismatch");
 expect(()=>launcher.verifyReviewedSource({...prerequisites,reviewedFingerprint:"0".repeat(64)},source,{root,inspect})).toThrow("digest mismatch");
 expect(()=>launcher.verifyReviewedSource(prerequisites,{...source,records:[{...records[0],sha256:"0".repeat(64)}]},{root,inspect})).toThrow("digest mismatch");
 const wrongRecords=[{...records[0],sha256:"0".repeat(64)}],wrong={...source,records:wrongRecords,fingerprint:digest(JSON.stringify(wrongRecords))};
 expect(()=>launcher.verifyReviewedSource({...prerequisites,reviewedFingerprint:wrong.fingerprint},wrong,{root,inspect})).toThrow("Source integrity changed");
 expect(()=>launcher.verifyReviewedSource(prerequisites,source,{root,inspect:()=>({...inspect(),files:["runtime.ts","unreviewed.ts"]})})).toThrow("coverage mismatch");
 expect(()=>launcher.verifyReviewedSource(prerequisites,source,{root,inspect:()=>({...inspect(),files:[]})})).toThrow("coverage mismatch");
 writeFileSync(path.join(root,"runtime.ts"),"unexpected edit");expect(()=>launcher.verifyReviewedSource(prerequisites,source,{root,inspect})).toThrow("Source integrity changed");
});

test("M7L launcher: piped credential input is refused without prompting",async()=>{
 let printed="";const input=new PassThrough(),output=new Writable({write(chunk,_encoding,done){printed+=String(chunk);done();}});
 await expect(launcher.hiddenCredential("Synthetic prompt: ",input,output)).rejects.toThrow("interactive terminal required");expect(printed).toBe("");
});

test("M7L launcher: owner terminal prompt suppresses synthetic input and handles cancellation",async()=>{
 let printed="";const input=Object.assign(new PassThrough(),{isTTY:true}),output=Object.assign(new Writable({write(chunk,_encoding,done){printed+=String(chunk);done();}}),{isTTY:true});
 const pending=launcher.hiddenCredential("Synthetic prompt: ",input,output);input.write("synthetic-not-a-real-key\r");expect(await pending).toBe("synthetic-not-a-real-key");expect(printed).toBe("Synthetic prompt: \n");
 for(const entry of ["\r","\u0003"]){const next=Object.assign(new PassThrough(),{isTTY:true}),cancelled=launcher.hiddenCredential("Synthetic prompt: ",next,output);next.write(entry);await expect(cancelled).rejects.toThrow();}
});

test("M7L launcher: both permitted four-request paths reserve at most 0.17 USD with two per session",({},info)=>{
 for(const withImage of [false,true]){
  const ledger=new QualificationLedger(info.outputPath(withImage?"with-image":"text-repair"));
  const text=(session:"A"|"B")=>JSON.stringify({model:session==="A"?"muse-ember-1.0":"muse-spark-1.3",max_output_tokens:4000,store:false,stream:false});
  ledger.settle(ledger.reserve("A","text","https://api.meta.ai/v1/responses",text("A")),withImage?"accepted":"semantic");
  if(withImage)ledger.settle(ledger.reserve("A","image","https://api.meta.ai/v1/images/generations",JSON.stringify({model:"muse-image-1.0",n:1,size:"1024x1024",response_format:"b64_json",output_format:"png",stream:false,tool_enablement:{enable_image_search:false,enable_web_search:false,enable_shell:false}})),"accepted");
  else ledger.settle(ledger.reserve("A","text","https://api.meta.ai/v1/responses",text("A")),"accepted");
  ledger.settle(ledger.reserve("B","text","https://api.meta.ai/v1/responses",text("B")),"semantic");
  ledger.settle(ledger.reserve("B","text","https://api.meta.ai/v1/responses",text("B")),"accepted");
  const reserved=ledger.inspect().filter(e=>e.event==="reserved");expect(reserved).toHaveLength(4);
  for(const session of ["A","B"])expect(reserved.filter(e=>e.session===session)).toHaveLength(2);
  expect(reserved.reduce((sum,e)=>sum+e.reservationUsd,0)).toBeCloseTo(.17,10);
  expect(()=>ledger.reserve("B","text","https://api.meta.ai/v1/responses",text("B"))).toThrow("call-budget");
 }
});
