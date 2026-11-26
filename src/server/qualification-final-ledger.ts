import {readFileSync,readdirSync,mkdirSync,existsSync,openSync,writeSync,fsyncSync,closeSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {QualificationStop} from './qualification-ledger';
import type {Usage} from '../lib/generation/contracts';

export type FinalBinding=Record<'execution.lock'|'continuation.lock'|'dispatch.jsonl'|'A-text-1.json'|'recovery-failure.json',string>;
type Kind='image'|'ember'|'spark';
export type FinalOutcome='accepted'|'semantic'|'structure'|'asset'|'auth'|'quota'|'transport'|'timeout'|'provider'|'refusal'|'incomplete';
type Reservation={event:'reserved';id:number;kind:Kind;repair:boolean;model:string;reservationUsd:number;requestSha256:string;at:string};
type Outcome={event:'outcome';id:number;outcome:FinalOutcome;usage?:Partial<Usage>;httpStatus?:number;elapsedMs?:number;actualChargeUsd:null;at:string};
const policy={image:{model:'muse-image-1.0',url:'https://api.meta.ai/v1/images/generations',reservationUsd:.01},ember:{model:'muse-ember-1.0',url:'https://api.meta.ai/v1/responses',reservationUsd:.01},spark:{model:'muse-spark-1.3',url:'https://api.meta.ai/v1/responses',reservationUsd:.075}} as const;
export function inspectFinalBaseline(directory:string,binding:FinalBinding){
 try{
  const names=['A-text-1.json','continuation.lock','dispatch.jsonl','execution.lock','recovery-failure.json'];
  if(JSON.stringify(Object.keys(binding).sort())!==JSON.stringify(names)||JSON.stringify(readdirSync(directory).sort())!==JSON.stringify(names))throw Error();
  for(const file of names)if(!/^[a-f0-9]{64}$/.test(binding[file as keyof FinalBinding])||createHash('sha256').update(readFileSync(path.join(directory,file))).digest('hex')!==binding[file as keyof FinalBinding])throw Error();
  const text=readFileSync(path.join(directory,'dispatch.jsonl'),'utf8');if(!text.endsWith('\n'))throw Error();const records=text.trim().split('\n').map(line=>JSON.parse(line));
  if(records.length!==4)throw Error();
  for(const id of [1,2]){const r=records[(id-1)*2],o=records[(id-1)*2+1];if(r.event!=='reserved'||r.id!==id||r.session!=='A'||r.kind!=='text'||r.model!=='muse-ember-1.0'||r.reservationUsd!==.01||o.event!=='outcome'||o.id!==id||o.outcome!==(id===1?'auth':'semantic')||o.actualChargeUsd!==null)throw Error();}
  return {consumedRequests:2 as const,estimatedReservationUsd:.02 as const,journalSha256:binding['dispatch.jsonl']};
 }catch{throw new QualificationStop('historical-accounting-mismatch');}
}
export class FinalQualificationLedger{
 private records:(Reservation|Outcome)[]=[];private journal:string;
 constructor(directory:string,private originalDirectory:string,private binding:FinalBinding){
  const inherited=inspectFinalBaseline(originalDirectory,binding);
  if(existsSync(directory))throw new QualificationStop('final-run-already-exists');mkdirSync(directory,{recursive:true});
  const lock=openSync(path.join(directory,'execution.lock'),'wx',0o600);try{writeSync(lock,JSON.stringify({authorization:'M7-L-final-six-cumulative-20261126',inherited,originalDirectory,binding})+'\n');fsyncSync(lock);}finally{closeSync(lock);}
  this.journal=path.join(directory,'dispatch.jsonl');this.append({event:'inherited',...inherited,actualChargeUsd:null});
 }
 private append(record:unknown){const f=openSync(this.journal,'a',0o600);try{writeSync(f,JSON.stringify(record)+'\n');fsyncSync(f);}finally{closeSync(f);}}
 reserve(kind:Kind,repair:boolean,url:string,body:string){
  inspectFinalBaseline(this.originalDirectory,this.binding);
  const reserved=this.records.filter((r):r is Reservation=>r.event==='reserved'),outcomes=this.records.filter((r):r is Outcome=>r.event==='outcome');
  if(reserved.some(r=>!outcomes.some(o=>o.id===r.id)))throw new QualificationStop('unresolved-reservation');
  if(outcomes.some(o=>['auth','quota','transport','timeout','provider'].includes(o.outcome)))throw new QualificationStop('terminal-shared-failure');
  if(reserved.length>=4)throw new QualificationStop('six-cumulative-call-limit');
  const same=reserved.filter(r=>r.kind===kind),last=reserved.at(-1),lastOutcome=outcomes.find(o=>o.id===last?.id);
  if(kind==='image'&&(reserved.length!==0||repair)||kind!=='image'&&!reserved.some(r=>r.kind==='image')||kind==='ember'&&reserved.some(r=>r.kind==='spark')||kind==='spark'&&!reserved.some(r=>r.kind==='ember'))throw new QualificationStop('final-sequence');
  if(repair?(kind==='image'||reserved.some(r=>r.repair)||same.length!==1||last?.kind!==kind||lastOutcome?.outcome!=='semantic'):same.length!==0)throw new QualificationStop('unapproved-repair-or-duplicate');
  const selected=policy[kind];let p:Record<string,unknown>;try{p=JSON.parse(body);}catch{throw new QualificationStop('invalid-request');}
  if(url!==selected.url||p.model!==selected.model||Buffer.byteLength(body)>32000||p.stream!==false)throw new QualificationStop('unapproved-request');
  const fields=kind==='image'?['model','prompt','n','size','response_format','reasoning_strength','stream','tool_enablement','output_format']:['model','instructions','input','reasoning','max_output_tokens','store','stream','text'];
  if(Object.keys(p).some(k=>!fields.includes(k)))throw new QualificationStop('unapproved-fields');
  if(kind==='image'?(p.n!==1||p.size!=='1024x1024'||p.response_format!=='b64_json'||p.output_format!=='png'||JSON.stringify(p.tool_enablement)!==JSON.stringify({enable_image_search:false,enable_web_search:false,enable_shell:false})):(p.max_output_tokens!==4000||p.store!==false))throw new QualificationStop('unbounded-request');
  const total=reserved.reduce((n,r)=>n+r.reservationUsd,0)+selected.reservationUsd;if(total>.17+1e-9||total+.02>.19+1e-9)throw new QualificationStop('reservation-limit');
  const r:Reservation={event:'reserved',id:reserved.length+3,kind,repair,model:selected.model,reservationUsd:selected.reservationUsd,requestSha256:createHash('sha256').update(body).digest('hex'),at:new Date().toISOString()};this.append(r);this.records.push(r);return r.id;
 }
 settle(id:number,outcome:FinalOutcome,metrics?:{usage?:Partial<Usage>;httpStatus?:number;elapsedMs?:number}){
  if(!this.records.some(r=>r.event==='reserved'&&r.id===id)||this.records.some(r=>r.event==='outcome'&&r.id===id))throw new QualificationStop('invalid-settlement');
  const usage=metrics?.usage?Object.fromEntries(Object.entries(metrics.usage).filter(([k,v])=>['inputTokens','outputTokens','thinkingTokens','totalTokens'].includes(k)&&typeof v==='number'&&Number.isFinite(v)&&v>=0)):undefined;
  const r:Outcome={event:'outcome',id,outcome,...(usage?{usage}:{}),...(metrics?.httpStatus?{httpStatus:metrics.httpStatus}:{}),...(metrics?.elapsedMs!==undefined?{elapsedMs:metrics.elapsedMs}:{}),actualChargeUsd:null,at:new Date().toISOString()};this.append(r);this.records.push(r);
 }
 inspect(){return {inherited:{requests:2,estimatedReservationUsd:.02,sourceJournalSha256:this.binding['dispatch.jsonl']},newRecords:this.records.map(r=>({...r})),cumulativeRequests:2+this.records.filter(r=>r.event==='reserved').length,cumulativeEstimatedReservationUsd:.02+this.records.filter((r):r is Reservation=>r.event==='reserved').reduce((n,r)=>n+r.reservationUsd,0),actualChargeUsd:null};}
}
