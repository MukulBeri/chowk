import {createHmac} from 'node:crypto';
export type Admission={requestId:string;source:string;operation:'text-1'|'text-2'|'image';reservationMicros:number};
export type SharedUsage={reserve:(input:Admission)=>Promise<{allowed:boolean;reason:string}>};
// All keys share a Redis hash slot. Budget never expires or resets with deployment.
// Deduplication and source windows may expire; uncertain reservations are never refunded.
export const RESERVE_LUA=`
if redis.call('HGET',KEYS[1],'disabled')=='1' then return {'deny','shared-disabled'} end
if redis.call('EXISTS',KEYS[3])==1 then return {'deny','duplicate'} end
local calls=tonumber(redis.call('HGET',KEYS[1],'calls') or '0')
local micros=tonumber(redis.call('HGET',KEYS[1],'micros') or '0')
local source=tonumber(redis.call('GET',KEYS[2]) or '0')
if calls+1>tonumber(ARGV[1]) or micros+tonumber(ARGV[3])>tonumber(ARGV[2]) then return {'deny','shared-budget'} end
if source+1>tonumber(ARGV[4]) then return {'deny','source-limit'} end
redis.call('HINCRBY',KEYS[1],'calls',1)
redis.call('HINCRBY',KEYS[1],'micros',ARGV[3])
redis.call('INCR',KEYS[2]);redis.call('EXPIRE',KEYS[2],60)
redis.call('SET',KEYS[3],'reserved','EX',604800)
return {'allow','reserved'}`;
export function createSharedUsage(config:{url:string;token:string;sourceSecret:string;epoch:string;maximumCalls:number;maximumMicros:number;perSourceMinute:number},transport:typeof fetch=fetch):SharedUsage{
 return {async reserve(input){
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([(async()=>{
  try{
   const url=new URL(config.url);
   if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.search||url.hash||!config.token||config.sourceSecret.length<32||!/^[a-zA-Z0-9_-]{1,40}$/.test(config.epoch)||![config.maximumCalls,config.maximumMicros,config.perSourceMinute,input.reservationMicros].every(v=>Number.isSafeInteger(v)&&v>0)||!/^[a-f0-9-]{36}$/i.test(input.requestId)||!input.source||input.source.length>128||!['text-1','text-2','image'].includes(input.operation))return{allowed:false,reason:'shared-configuration'};
   const source=createHmac('sha256',config.sourceSecret).update(input.source).digest('hex'),prefix=`{chowk-${config.epoch}}`;
   const response=await transport(url.origin,{method:'POST',redirect:'error',cache:'no-store',signal:controller.signal,headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',RESERVE_LUA,'3',prefix+':budget',prefix+':source:'+source,prefix+':id:'+input.requestId+':'+input.operation,String(config.maximumCalls),String(config.maximumMicros),String(input.reservationMicros),String(config.perSourceMinute)])});
   if(!response.ok)return{allowed:false,reason:'shared-unavailable'};
   const reader=response.body?.getReader();if(!reader)return{allowed:false,reason:'shared-unavailable'};let text='',bytes=0;while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>2048){void reader.cancel();return{allowed:false,reason:'shared-unavailable'};}text+=new TextDecoder().decode(part.value);}
   const data=JSON.parse(text),value=data.result;if(!Array.isArray(value)||value.length!==2)return{allowed:false,reason:'shared-unavailable'};
   if(value[0]==='allow'&&value[1]==='reserved')return{allowed:true,reason:'reserved'};
   return{allowed:false,reason:['duplicate','shared-budget','source-limit','shared-disabled'].includes(value[1])?value[1]:'shared-unavailable'};
  }catch{return{allowed:false,reason:'shared-unavailable'};}
  })(),new Promise<{allowed:boolean;reason:string}>(resolve=>{timer=setTimeout(()=>{controller.abort();resolve({allowed:false,reason:'shared-unavailable'});},2000);})]);}finally{clearTimeout(timer);controller.abort();}
 }};
}
