import { Worker } from "node:worker_threads";
import { createHash } from "node:crypto";
import {createRequire} from 'node:module';
import {isAbsolute,join} from 'node:path';
import { assetLayerSchema, MAX_SOURCE_BYTES, MAX_RASTER_BYTES, rasterHeader, type AssetLayer } from "../lib/design-engine/assets";
import {pipelineDiagnosticSchema,type PipelineDiagnostic} from '../lib/generation/pipeline-diagnostics';

export class RasterError extends Error {constructor(public code:"busy"|"source-bound"|"decode"|"timeout"|"budget",public diagnostic?:PipelineDiagnostic){super(`Image preparation: ${code}`);}}
export function resolveNativeSharp(){
 try{
  // A native loader avoids Turbopack rewriting require.resolve to a module ID.
  // Anchor to the deployed app root; no build-machine path is embedded.
  const nativeRequire=createRequire(join(process.cwd(),'package.json')),resolved=nativeRequire.resolve('sharp');
  if(typeof resolved!=='string'||!isAbsolute(resolved)||nativeRequire.resolve(resolved)!==resolved)throw Error();
  return resolved;
 }catch{throw new RasterError('decode',{stage:'worker-bootstrap',code:'module-resolution'});}
}
let active=0;
// Native work is isolated and cancellable. Pixel/source bounds constrain decoded
// buffers; resourceLimits constrain JS heap, not a claim of an OS native-memory cap.
const workerSource=String.raw`
const {parentPort,workerData}=require('node:worker_threads');
let stage='worker-bootstrap';
const fail=(code)=>{const error=Error();error.safeCode=code;throw error;};
(async()=>{
 const sharp=require(workerData.sharp);sharp.cache(false);sharp.concurrency(1);
 stage='native-decode';
 const input=Buffer.from(workerData.bytes),options={limitInputPixels:4000000,sequentialRead:true,failOn:'error'};
 const meta=await sharp(input,options).timeout({seconds:2}).metadata();
 if(!['png','jpeg'].includes(meta.format)||!meta.width||!meta.height||meta.width>2048||meta.height>2048||meta.width*meta.height>4000000||(meta.pages||1)!==1)fail('decode-failed');
 // Force full pixel decode even if a small source can be retained verbatim.
 await sharp(input,options).timeout({seconds:2}).raw().toBuffer();
 if(input.length<=workerData.maximumBytes&&(!meta.orientation||meta.orientation===1)){parentPort.postMessage({bytes:input,width:meta.width,height:meta.height,mime:meta.format==='png'?'image/png':'image/jpeg',alpha:!!meta.hasAlpha,derivative:false,attempts:0});return;}
 let output,info,attempts=0;
 stage='image-fit';
 for(const edge of [1536,1280,1024,768,576]){
  attempts++;let pipeline=sharp(input,options).rotate().toColourspace('srgb').resize({width:edge,height:edge,fit:'inside',withoutEnlargement:true}).timeout({seconds:2});
  if(workerData.preserveXmp&&meta.xmp)pipeline=pipeline.keepXmp();
  pipeline=meta.hasAlpha?pipeline.png({compressionLevel:9}):pipeline.jpeg({quality:82,chromaSubsampling:'4:4:4'});
  const result=await pipeline.toBuffer({resolveWithObject:true});output=result.data;info=result.info;
  if(output.length<=workerData.maximumBytes)break;
 }
 if(!output||output.length>workerData.maximumBytes)fail('fit-exhausted');
 stage='xmp-preservation';
 if(workerData.preserveXmp&&meta.xmp){const finalMeta=await sharp(output,options).metadata();if(!finalMeta.xmp||!Buffer.from(meta.xmp).equals(Buffer.from(finalMeta.xmp)))fail('xmp-changed');}
 parentPort.postMessage({bytes:output,width:info.width,height:info.height,mime:meta.hasAlpha?'image/png':'image/jpeg',alpha:!!meta.hasAlpha,derivative:true,attempts});
})().catch(error=>{const timeout=/timeout|timed out/i.test(String(error.message));const code=error.safeCode||(timeout?'timeout':stage==='worker-bootstrap'?'worker-failed':'decode-failed');parentPort.postMessage({error:timeout?'timeout':code==='fit-exhausted'?'budget':'decode',stage,code});});
`;
type Prepared={bytes:Uint8Array;width:number;height:number;mime:"image/png"|"image/jpeg";alpha:boolean;derivative:boolean;attempts:number};
export async function optimizeRaster(bytes:Buffer,origin:{source:"local-file"|"meta";previous?:AssetLayer;inputReferenceSha256?:string},signal?:AbortSignal){
  if(bytes.length>MAX_SOURCE_BYTES||bytes.length<24)throw new RasterError("source-bound",{stage:'png-header',code:'invalid-png'});
  let header:ReturnType<typeof rasterHeader>;
  try{header=rasterHeader(bytes,MAX_SOURCE_BYTES);}catch{throw new RasterError("decode",{stage:'png-header',code:'invalid-png'});}
  if(signal?.aborted)throw new RasterError("timeout",{stage:'worker-bootstrap',code:'aborted'});
  if(active>=1)throw new RasterError("busy",{stage:'worker-bootstrap',code:'busy'});
  active++;const start=performance.now();let worker:Worker|undefined;
  try{
    const prepared=await new Promise<Prepared>((resolve,reject)=>{
      const sharp=resolveNativeSharp();
      try{worker=new Worker(workerSource,{eval:true,workerData:{bytes,maximumBytes:MAX_RASTER_BYTES,sharp,preserveXmp:origin.source==='meta'},resourceLimits:{maxOldGenerationSizeMb:64,maxYoungGenerationSizeMb:16}});}catch{throw new RasterError('decode',{stage:'worker-bootstrap',code:'worker-failed'});}
      const abort=()=>{clean();void worker?.terminate();reject(new RasterError("timeout",{stage:'worker-runtime',code:signal?.aborted?'aborted':'timeout'}));};
      const timer=setTimeout(abort,6000);signal?.addEventListener("abort",abort,{once:true});
      const clean=()=>{clearTimeout(timer);signal?.removeEventListener("abort",abort);};
      worker.once("message",value=>{clean();if(value.error){const checked=pipelineDiagnosticSchema.safeParse({stage:value.stage,code:value.code,sourceBytes:bytes.length,width:header.width,height:header.height,elapsedMs:performance.now()-start});reject(new RasterError(['timeout','budget','decode'].includes(value.error)?value.error:'decode',checked.success?checked.data:{stage:'worker-runtime',code:'worker-failed'}));}else resolve(value);});
      worker.once("error",()=>{clean();reject(new RasterError("decode",{stage:'worker-runtime',code:'worker-failed'}));});
      worker.once("exit",code=>{if(code!==0){clean();reject(new RasterError("decode",{stage:'worker-runtime',code:'worker-failed'}));}});
    });
    const output=Buffer.from(prepared.bytes),sha256=createHash("sha256").update(output).digest("hex"),sourceSha256=createHash("sha256").update(bytes).digest("hex");
    const previous=origin.previous;
    const parsed=assetLayerSchema.safeParse({version:1,id:`asset-${sha256.slice(0,16)}`,kind:origin.source==="meta"?"generated-raster":"local-raster",source:origin.source,provider:origin.source==="meta"?"meta":null,model:origin.source==="meta"?"muse-image-1.0":null,inputReferenceSha256:origin.inputReferenceSha256??sourceSha256,rights:"unverified",usageScope:"private-experiment",createdAt:new Date().toISOString(),revision:(previous?.revision??0)+1,sourceEditId:previous?.id??null,parentSha256:previous?.sha256??(prepared.derivative?sourceSha256:null),sha256,mime:prepared.mime,bytes:output.length,width:prepared.width,height:prepared.height,dataUrl:`data:${prepared.mime};base64,${output.toString("base64")}`,crop:{x:50,y:50,zoom:1,fit:"contain"},framing:"edge-to-edge",...(prepared.derivative?{derivative:{method:"server-sharp",quality:prepared.mime==="image/jpeg"?.82:null,opaque:!prepared.alpha,sourceSha256,sourceBytes:bytes.length,sourceWidth:header.width,sourceHeight:header.height}}:{})});
    if(!parsed.success)throw new RasterError('decode',{stage:'asset-schema',code:'schema-rejected'});
    const asset=parsed.data;
    if(asset.bytes>MAX_RASTER_BYTES)throw new RasterError("budget");
    return {asset,elapsedMs:performance.now()-start,attempts:prepared.attempts,originalSha256:sourceSha256,publicationCleared:false as const};
  }finally{active--;void worker?.terminate();}
}
