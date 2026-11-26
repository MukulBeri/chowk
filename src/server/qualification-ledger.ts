import {openSync,writeSync,fsyncSync,closeSync,readFileSync,existsSync,mkdirSync,readdirSync} from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";

export type QualificationSession="A"|"B";
export type QualificationKind="text"|"image";
export type QualificationOutcome="accepted"|"structure"|"semantic"|"auth"|"quota"|"billing"|"eligibility"|"unsafe"|"timeout"|"transport"|"provider";
type Reservation={event:"reserved";id:number;session:QualificationSession;kind:QualificationKind;model:string;endpoint:string;reservationUsd:number;requestSha256:string;requestBytes:number;at:string};
type Outcome={event:"outcome";id:number;outcome:QualificationOutcome;usage?:{inputTokens?:number;outputTokens?:number;totalTokens?:number;thinkingTokens?:number};actualChargeUsd:null;at:string};
type Entry=Reservation|Outcome;
export type RecoveryBinding={lockSha256:string;journalSha256:string;evidenceSha256:string};
export function inspectAuthenticationRecovery(directory:string,binding:RecoveryBinding):Entry[]{
 try{
  if(JSON.stringify(readdirSync(directory).sort())!==JSON.stringify(['A-text-1.json','dispatch.jsonl','execution.lock']))throw Error();
  for(const [file,hash] of [['execution.lock',binding.lockSha256],['dispatch.jsonl',binding.journalSha256],['A-text-1.json',binding.evidenceSha256]])if(!/^[a-f0-9]{64}$/.test(hash)||createHash('sha256').update(readFileSync(path.join(directory,file))).digest('hex')!==hash)throw Error();
  if(readFileSync(path.join(directory,'execution.lock'),'utf8')!=="M7-L-four-dispatches-20261126\n")throw Error();
  const text=readFileSync(path.join(directory,'dispatch.jsonl'),'utf8');if(!text.endsWith('\n'))throw Error();
  const entries:Entry[]=text.trim().split('\n').map(line=>JSON.parse(line));if(entries.length!==2)throw Error();
  const [r,o]=entries;
  if(r.event!=='reserved'||r.id!==1||r.session!=='A'||r.kind!=='text'||r.model!=='muse-ember-1.0'||r.endpoint!=='https://api.meta.ai/v1/responses'||r.reservationUsd!==.01||o.event!=='outcome'||o.id!==1||o.outcome!=='auth'||o.actualChargeUsd!==null)throw Error();
  const evidence=JSON.parse(readFileSync(path.join(directory,'A-text-1.json'),'utf8'));
  if(evidence.origin!=='fresh-meta'||evidence.accepted!==false||evidence.code!=='auth'||evidence.model!=='muse-ember-1.0')throw Error();
  return entries;
 }catch{throw new QualificationStop('recovery-accounting-mismatch-or-already-used');}
}
export class QualificationStop extends Error{constructor(public code:string){super(`Qualification stopped: ${code}`);}}
const policy={A:{text:{model:"muse-ember-1.0",endpoint:"https://api.meta.ai/v1/responses",reservationUsd:.01},image:{model:"muse-image-1.0",endpoint:"https://api.meta.ai/v1/images/generations",reservationUsd:.01}},B:{text:{model:"muse-spark-1.3",endpoint:"https://api.meta.ai/v1/responses",reservationUsd:.075}}} as const;

// Private local qualification only. No runtime wiring or credential access.
// Exclusive run-lock is intentionally retained: interrupted/duplicate runs are
// inspection-only, never automatically resumed or given a new four-call budget.
export class QualificationLedger {
 private entries:Entry[]=[];
 private journal:string;
 constructor(directory:string,private recovery?:RecoveryBinding){
  if(recovery){
   this.entries=inspectAuthenticationRecovery(directory,recovery);this.journal=path.join(directory,'dispatch.jsonl');
   // Exclusive durable claim before credential entry. Never removed, even on cancellation.
   let lock:number;try{lock=openSync(path.join(directory,'continuation.lock'),'wx',0o600);}catch{throw new QualificationStop('recovery-already-used');}
   try{writeSync(lock,JSON.stringify({authorization:'M7-L-auth-recovery-20261126',binding:recovery,maximumActualRequests:4,maximumA:3,maximumB:1})+'\n');fsyncSync(lock);}finally{closeSync(lock);}
   // Recheck the original bytes after claiming without permitting another claimant.
   for(const [file,hash] of [['execution.lock',recovery.lockSha256],['dispatch.jsonl',recovery.journalSha256],['A-text-1.json',recovery.evidenceSha256]])if(createHash('sha256').update(readFileSync(path.join(directory,file))).digest('hex')!==hash)throw new QualificationStop('recovery-accounting-changed');
   return;
  }
  mkdirSync(directory,{recursive:true});this.journal=path.join(directory,"dispatch.jsonl");
  if(existsSync(path.join(directory,"execution.lock")))throw new QualificationStop("duplicate-or-interrupted-run");
  if(existsSync(this.journal))throw new QualificationStop("unexpected-existing-accounting");
  const lock=openSync(path.join(directory,"execution.lock"),"wx",0o600);try{writeSync(lock,"M7-L-four-dispatches-20261126\n");fsyncSync(lock);}finally{closeSync(lock);}
 }
 private append(entry:Entry){const file=openSync(this.journal,"a",0o600);try{writeSync(file,JSON.stringify(entry)+"\n");fsyncSync(file);}finally{closeSync(file);}this.entries.push(entry);}
 reserve(session:QualificationSession,kind:QualificationKind,url:string,body:string){
  const reserved=this.entries.filter((e):e is Reservation=>e.event==="reserved"),outcomes=this.entries.filter((e):e is Outcome=>e.event==="outcome");
  if(reserved.some(r=>!outcomes.some(o=>o.id===r.id)))throw new QualificationStop("unresolved-charge-or-dispatch");
  if(outcomes.some(o=>this.recovery?!(o.id===1&&o.outcome==='auth')&&o.outcome!=='accepted':!["accepted","structure","semantic"].includes(o.outcome)))throw new QualificationStop("terminal-provider-failure");
  const prior=reserved.filter(r=>r.session===session),last=prior.at(-1),lastOutcome=last&&outcomes.find(o=>o.id===last.id);
  if(reserved.length>=4||prior.length>=(this.recovery?(session==='A'?3:1):2))throw new QualificationStop("call-budget");
  if(this.recovery){const expected=[['A','text'],['A','image'],['B','text']][reserved.length-1];if(!expected||session!==expected[0]||kind!==expected[1])throw new QualificationStop('recovery-sequence');}
  if(session==="B"&&kind==="image")throw new QualificationStop("unapproved-image-session");
  if(!["A","B"].includes(session)||!["text","image"].includes(kind))throw new QualificationStop("unapproved-operation");
  const selected=kind==="image"?policy.A.image:policy[session].text;
  let parsed:Record<string,unknown>;try{parsed=JSON.parse(body);}catch{throw new QualificationStop("invalid-request");}
  const bytes=Buffer.byteLength(body);
  if(url!==selected.endpoint||parsed.model!==selected.model||bytes>32000||parsed.stream!==false)throw new QualificationStop("unapproved-request");
  const keys=kind==="text"?["model","instructions","input","reasoning","max_output_tokens","store","stream","text"]:["model","prompt","n","size","response_format","reasoning_strength","stream","tool_enablement","output_format"];
  if(Object.keys(parsed).some(k=>!keys.includes(k)))throw new QualificationStop("unapproved-request-field");
  if(kind==="text"&&(parsed.max_output_tokens!==4000||parsed.store!==false))throw new QualificationStop("unbounded-text-request");
  if(kind==="image"&&(session!=="A"||prior.length!==(this.recovery?2:1)||last?.kind!=="text"||lastOutcome?.outcome!=="accepted"||parsed.n!==1||parsed.size!=="1024x1024"||parsed.response_format!=="b64_json"||parsed.output_format!=="png"||JSON.stringify(parsed.tool_enablement)!==JSON.stringify({enable_image_search:false,enable_web_search:false,enable_shell:false})||"images" in parsed))throw new QualificationStop("unapproved-image-request");
  if(!this.recovery&&kind==="text"&&prior.length&&(!lastOutcome||!["structure","semantic"].includes(lastOutcome.outcome)||last?.kind!=="text"))throw new QualificationStop("unapproved-repair");
  const total=reserved.reduce((sum,r)=>sum+r.reservationUsd,0)+selected.reservationUsd;if(total>.20+1e-9)throw new QualificationStop("reservation-budget");
  if(this.recovery&&total>.105+1e-9)throw new QualificationStop('recovery-reservation-budget');
  const entry:Reservation={event:"reserved",id:reserved.length+1,session,kind,model:selected.model,endpoint:url,reservationUsd:selected.reservationUsd,requestSha256:createHash("sha256").update(body).digest("hex"),requestBytes:bytes,at:new Date().toISOString()};
  this.append(entry);return entry.id;
 }
 settle(id:number,outcome:QualificationOutcome,usage?:Outcome["usage"]){
  if(!this.entries.some(e=>e.event==="reserved"&&e.id===id)||this.entries.some(e=>e.event==="outcome"&&e.id===id))throw new QualificationStop("invalid-settlement");
  const safe=usage?Object.fromEntries(Object.entries(usage).filter(([k,v])=>["inputTokens","outputTokens","totalTokens","thinkingTokens"].includes(k)&&typeof v==="number"&&Number.isFinite(v)&&v>=0)):undefined;
  this.append({event:"outcome",id,outcome,...(safe?{usage:safe}:{}),actualChargeUsd:null,at:new Date().toISOString()});
 }
 inspect(){return this.entries.map(e=>({...e}));}
 static inspect(directory:string){
  try{const text=readFileSync(path.join(directory,"dispatch.jsonl"),"utf8");if(!text.endsWith("\n"))throw Error();return text.trim().split("\n").map(line=>JSON.parse(line));}catch{throw new QualificationStop("unknown-or-incomplete-accounting");}
 }
}
