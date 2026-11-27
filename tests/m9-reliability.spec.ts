import {test,expect} from '@playwright/test';
import {EventEmitter} from 'node:events';
import {createRequire} from 'node:module';
import {isAbsolute,join} from 'node:path';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {resolveNativeSharp,optimizeRaster} from '../src/server/raster-optimizer';
import {createMetaAdapter} from '../src/server/meta';
import {MetaGenerationEngine} from '../src/server/meta-engine';
import {fallbackPlan} from '../src/lib/generation/planner';
import {generationResultSchema,type GenerationRequest} from '../src/lib/generation/contracts';
import {pipelineDiagnosticSchema} from '../src/lib/generation/pipeline-diagnostics';
import {pngProvenance} from '../src/lib/image-provenance';

const request:GenerationRequest={topic:'Chai stall opening.',details:'Fresh masala chai for ₹15. Opening on 30 November, 9 AM. Near the university main gate.',taste:'bold-street',treatment:'creative-led',ai:{text:true,image:true,adult:true,country:'IN',consent:'meta-2026-11'}};
const context={requestId:randomUUID(),source:'192.0.2.7',country:'IN',originAllowed:true};
function envelope(invalid=false){const p=fallbackPlan(request),d=p.artDirection;return{status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({version:1,concepts:[{id:'controlled',interpretation:{...p.interpretation,assumptions:['Controlled accepted model interpretation.']},campaign:{...p.campaign,headline:invalid?'Acme Institute':p.campaign.headline,cta:p.campaign.cta??''},factIds:'factIds'in p?p.factIds:[],direction:{variant:d.variant,palette:d.palette,visual:d.visual,recipe:d.recipe,emphasis:d.emphasis,information:d.information,adaptation:d.adaptation},rationale:p.rationale}]})}]}]};}
const png=()=>sharp({create:{width:32,height:32,channels:3,background:'red'}}).png().toBuffer();
function adapter(raw:unknown){return createMetaAdapter({enabled:true,key:'synthetic-only'},()=>async()=>Response.json(raw))!;}
function engine(reserve=async()=>({allowed:true,reason:'reserved'}),transport=async()=>Response.json(envelope())){return new MetaGenerationEngine({enabled:true,key:()=>'synthetic-only',countries:['IN'],imagePolicyReviewed:true,shared:{reserve},transport:()=>transport});}

test('M9-R native resolution returns a real loadable absolute path',()=>{const resolved=resolveNativeSharp();expect(isAbsolute(resolved)).toBe(true);expect(typeof createRequire(join(process.cwd(),'package.json'))(resolved)).toBe('function');});

for(const [name,raw,stage] of [
 ['envelope',{},'response-contract'],
 ['canonical base64',{data:[{b64_json:'AB=='}]},'base64'],
 ['PNG signature',{data:[{b64_json:Buffer.from('Not a PNG').toString('base64')}]},'png-header'],
] as const)test(`M9-R image diagnostic: ${name}`,async()=>{await expect(adapter(raw).image('Ceramic desk pieces')).rejects.toMatchObject({code:'asset',diagnostic:{stage}});});

test('M9-R metadata policy refuses signed content without leaking it',async()=>{const privateMarker='<x:xmpmeta>c2pa private synthetic fixture</x:xmpmeta>',bytes=pngProvenance(await png(),privateMarker);let error:unknown;try{await adapter({data:[{b64_json:Buffer.from(bytes).toString('base64')}]}).image('Ceramic desk pieces');}catch(e){error=e;}expect(error).toMatchObject({code:'asset',diagnostic:{stage:'metadata-policy',code:'metadata-refused'}});expect(JSON.stringify(error)).not.toContain(privateMarker);});

test('M9-R public diagnostic schema rejects extra content and arbitrary errors',()=>{for(const raw of [{stage:'native-decode',code:'decode-failed',message:'private'}, {stage:'private path',code:'decode-failed'},{stage:'native-decode',code:'private body'},{stage:'native-decode',code:'decode-failed',sourceBytes:Infinity}])expect(pipelineDiagnosticSchema.safeParse(raw).success).toBe(false);});

// Inject only the worker boundary. Native production execution is separately
// verified through the newly compiled POST handler, never replaced by this fake.
async function mockWorker(run:(worker:EventEmitter)=>void,body:()=>Promise<void>){
 // eslint-disable-next-line @typescript-eslint/no-require-imports
 const threads=require('node:worker_threads') as typeof import('node:worker_threads'),Native=threads.Worker;
 class ControlledWorker extends EventEmitter{constructor(){super();queueMicrotask(()=>run(this));}terminate(){return Promise.resolve(0);}}
 threads.Worker=ControlledWorker as unknown as typeof Native;try{await body();}finally{threads.Worker=Native;}
}
test('M9-R bootstrap failure reports an allowlisted stage, not the thrown message',async()=>{await mockWorker(w=>w.emit('error',Error('private path and raw native error')),async()=>{await expect(optimizeRaster(await png(),{source:'meta'})).rejects.toMatchObject({code:'decode',diagnostic:{stage:'worker-runtime',code:'worker-failed'}});});});
for(const [stage,code,error] of [['worker-bootstrap','worker-failed','decode'],['native-decode','decode-failed','decode'],['image-fit','fit-exhausted','budget'],['xmp-preservation','xmp-changed','decode'],['native-decode','timeout','timeout']] as const)test(`M9-R worker stage: ${stage}/${code}`,async()=>{await mockWorker(w=>w.emit('message',{error,stage,code}),async()=>{await expect(optimizeRaster(await png(),{source:'meta'})).rejects.toMatchObject({code:error,diagnostic:{stage,code}});});});
test('M9-R unexpected worker diagnostics fail closed without arbitrary values',async()=>{await mockWorker(w=>w.emit('message',{error:'private message',stage:'private path',code:'private code'}),async()=>{await expect(optimizeRaster(await png(),{source:'meta'})).rejects.toMatchObject({code:'decode',diagnostic:{stage:'worker-runtime',code:'worker-failed'}});});});
test('M9-R parent deadline terminates stalled worker within the existing bound',async()=>{let terminated=false;
 // eslint-disable-next-line @typescript-eslint/no-require-imports
 const threads=require('node:worker_threads') as typeof import('node:worker_threads'),Native=threads.Worker;
 class Stalled extends EventEmitter{terminate(){terminated=true;return Promise.resolve(0);}}
 threads.Worker=Stalled as unknown as typeof Native;const started=Date.now();try{await expect(optimizeRaster(await png(),{source:'meta'})).rejects.toMatchObject({code:'timeout',diagnostic:{stage:'worker-runtime',code:'timeout'}});expect(terminated).toBe(true);expect(Date.now()-started).toBeLessThan(7500);}finally{threads.Worker=Native;}
});
test('M9-R concurrent raster refusal and abort preserve isolation',async()=>{await mockWorker(()=>{},async()=>{const bytes=await png(),controller=new AbortController(),first=optimizeRaster(bytes,{source:'meta'},controller.signal);const check=expect(first).rejects.toMatchObject({code:'timeout',diagnostic:{code:'aborted'}});await expect(optimizeRaster(bytes,{source:'meta'})).rejects.toMatchObject({code:'busy',diagnostic:{code:'busy'}});controller.abort();await check;});});

for(const [detail,summary] of [['shared-disabled','disabled'],['shared-budget','local-budget'],['source-limit','local-budget'],['duplicate','local-budget'],['shared-unavailable','provider-unavailable'],['shared-configuration','configuration']] as const)test(`M9-R admission ${detail} has accurate summary and zero dispatch`,async()=>{let calls=0;const result=await engine(async()=>({allowed:false,reason:detail}),async()=>{calls++;throw Error();}).generate(request,context);expect(calls).toBe(0);expect(result.metadata.fallbackReason).toBe(summary);expect(result.metadata.capabilities?.text.fallbackReason).toBe(detail);expect(result.metadata.attempts[0].dispatched).toBe(false);expect(result.metadata.capabilities?.text.accepted).toBe(false);});

test('M9-R semantic rejection retains validation-failed and one repair maximum',async()=>{let calls=0;const result=await engine(undefined,async()=>{calls++;return Response.json(envelope(true));}).generate({...request,ai:{...request.ai!,image:false}},context);expect(calls).toBe(2);expect(result.metadata.fallbackReason).toBe('validation-failed');expect(result.metadata.attempts.every(a=>a.validation?.stage==='semantic')).toBe(true);expect(result.interpretationSources?.creative).toBeUndefined();});

test('M9-R interpretation sources retain authoritative local facts and actual accepted model interpretation',async()=>{const result=generationResultSchema.parse(await engine().generate({...request,ai:{...request.ai!,image:false}},context));expect(result.interpretation).toEqual(fallbackPlan(request).interpretation);expect(result.interpretationSources?.brief).toBe('application');expect(result.interpretationSources?.creative?.interpretation.assumptions).toEqual(['Controlled accepted model interpretation.']);expect(result.interpretationSources?.creative?.rationale).toBe(result.spec.rationale);expect(result.metadata.source).toBe('meta');expect(JSON.stringify(result.spec)).toContain('₹15');});

test('M9-R image-only skips text and reserves exactly one image operation',async()=>{const operations:string[]=[],bytes=await png();const result=await engine(async(a?:unknown)=>{operations.push((a as {operation:string}).operation);return{allowed:true,reason:'reserved'};},async()=>Response.json({data:[{b64_json:bytes.toString('base64')}]})).generate({...request,ai:{...request.ai!,text:false}},context);expect(operations).toEqual(['image']);expect(result.metadata.capabilities?.image.accepted).toBe(true);expect(result.metadata.capabilities?.text.source).toBe('local');expect(result.interpretationSources?.creative).toBeUndefined();});

test('M9-R actual studio disclosure distinguishes application and accepted model interpretation',async({page},info)=>{
 const result=generationResultSchema.parse(await engine().generate({...request,ai:{...request.ai!,image:false}},context));
 await page.route('**/api/generate',route=>route.fulfill({json:result}));await page.goto('/create');
 await page.getByLabel('What are we creating for?').fill(request.topic);await page.getByLabel('Optional details').fill(request.details);
 await page.getByRole('radio',{name:'Bold Street',exact:true}).check();await page.getByLabel('Planning approach').selectOption('creative-led');
 await page.getByRole('button',{name:/Generate campaign locally/}).click();await page.getByText('Creative plan and generation details',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'Application-owned brief interpretation'})).toBeVisible();await expect(page.getByRole('heading',{name:'Accepted Meta creative interpretation'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Accepted model interpretation'})).toContainText('Controlled accepted model interpretation.');await page.screenshot({path:info.outputPath('actual-disclosure.png'),fullPage:true});
});
