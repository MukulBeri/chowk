import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {MetaGenerationEngine,type AdmissionContext} from '../src/server/meta-engine';
import {createSharedUsage,RESERVE_LUA} from '../src/server/shared-usage';
import {fallbackPlan,validatePlan} from '../src/lib/generation/planner';
import {generationResultSchema,type GenerationRequest} from '../src/lib/generation/contracts';
import {compactCreativeSchema} from '../src/server/meta-creative-contract';
import {createMetaAdapter,metaPngMetadata} from '../src/server/meta';
import {pngProvenance} from '../src/lib/image-provenance';
const request:GenerationRequest={topic:'Introduce Line Form, a collection of ceramic desk pieces.',details:'Pen holders and small trays in sand and charcoal. No prices or dates have been supplied.',taste:'minimal-swiss',treatment:'creative-led',ai:{text:true,image:true,adult:true,country:'IN',consent:'meta-2026-11'}};
const context:AdmissionContext={requestId:randomUUID(),source:'192.0.2.1',country:'IN',originAllowed:true};
function envelope(r:GenerationRequest,invalid=false){const p=fallbackPlan(r),d=p.artDirection;return {status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({version:1,concepts:[{id:'original',interpretation:p.interpretation,campaign:{...p.campaign,headline:invalid?'Acme Institute':p.campaign.headline,cta:''},factIds:'factIds'in p?p.factIds:[],direction:{variant:d.variant,palette:d.palette,visual:d.visual,recipe:d.recipe,emphasis:d.emphasis,information:d.information,adaptation:d.adaptation},rationale:p.rationale}]})}]}],usage:{input_tokens:123,output_tokens:50}};}
for(const text of [false,true])for(const image of [false,true])test(`M9 independent capabilities text=${text} image=${image}`,async()=>{
 const png=await sharp({create:{width:32,height:32,channels:3,background:'red'}}).png().toBuffer();const ops:string[]=[],models:string[]=[];
 const engine=new MetaGenerationEngine({enabled:true,key:()=>'synthetic-only',countries:['IN'],imagePolicyReviewed:true,shared:{reserve:async a=>{ops.push(a.operation);return{allowed:true,reason:'reserved'};}},transport:()=>async(url,init)=>{models.push(JSON.parse(String(init.body)).model);return Response.json(url.endsWith('/generations')?{data:[{b64_json:png.toString('base64')}]}:envelope(request));}});
 const result=generationResultSchema.parse(await engine.generate({...request,ai:{...request.ai!,text,image}},context));
 expect(result.metadata.capabilities?.text.accepted).toBe(text);expect(result.metadata.capabilities?.image.accepted).toBe(image);expect(models).toEqual([...(text?['muse-ember-1.0']:[]),...(image?['muse-image-1.0']:[])]);expect(ops).toHaveLength(Number(text)+Number(image));
 expect(result.spec.provenance).toBe(text?'meta':'deterministic-fallback');if(result.spec.version!==3)throw Error();expect(result.spec.capabilities).toEqual(result.metadata.capabilities);expect(result.spec.assetLayer?.rights??'unverified').toBe('unverified');
});
test('M9 independent failure: rejected text repairs once then local text still receives generated image',async()=>{
 const png=await sharp({create:{width:32,height:32,channels:3,background:'red'}}).png().toBuffer();let calls=0;
 const engine=new MetaGenerationEngine({enabled:true,key:()=>'synthetic-only',countries:['IN'],imagePolicyReviewed:true,shared:{reserve:async()=>({allowed:true,reason:'reserved'})},transport:()=>async url=>{calls++;return Response.json(url.endsWith('/generations')?{data:[{b64_json:png.toString('base64')}]}:envelope(request,true));}});
 const result=await engine.generate(request,context);expect(calls).toBe(3);expect(result.metadata.capabilities?.text.accepted).toBe(false);expect(result.metadata.capabilities?.image.accepted).toBe(true);expect(JSON.stringify(result)).not.toContain('synthetic-only');
});
test('M9 independent failure: malformed image preserves accepted Meta text',async()=>{
 const engine=new MetaGenerationEngine({enabled:true,key:()=>'synthetic-only',countries:['IN'],imagePolicyReviewed:true,shared:{reserve:async()=>({allowed:true,reason:'reserved'})},transport:()=>async url=>Response.json(url.endsWith('/generations')?{}:envelope(request))});
 const result=await engine.generate(request,context);expect(result.metadata.source).toBe('meta');expect(result.metadata.capabilities?.text.accepted).toBe(true);expect(result.metadata.capabilities?.image.accepted).toBe(false);
});
test('M9 privacy gates: local, disabled, adult, country and origin refusals precede key/transport access',async()=>{
 let touched=false;const engine=new MetaGenerationEngine({enabled:true,key:()=>{touched=true;return 'synthetic-only';},countries:['IN'],shared:{reserve:async()=>{touched=true;return{allowed:true,reason:'reserved'};}},transport:()=>{touched=true;throw Error();}});
 for(const [r,c] of [[{...request,mode:'local'},context],[{...request,ai:{...request.ai!,adult:false}},context],[request,{...context,country:'XX'}],[request,{...context,originAllowed:false}]] as const){await engine.generate(r as GenerationRequest,c);expect(touched).toBe(false);}
});
test('M9 shared accounting outage/duplicate deny provider dispatch and authentication stops image',async()=>{
 let calls=0;for(const reason of ['shared-unavailable','duplicate','shared-budget']){const engine=new MetaGenerationEngine({enabled:true,key:()=>'synthetic-only',countries:['IN'],shared:{reserve:async()=>({allowed:false,reason})},transport:()=>async()=>{calls++;throw Error();}});expect((await engine.generate(request,context)).metadata.capabilities?.text.accepted).toBe(false);}expect(calls).toBe(0);
 const engine=new MetaGenerationEngine({enabled:true,key:()=>'synthetic-only',countries:['IN'],imagePolicyReviewed:true,shared:{reserve:async()=>({allowed:true,reason:'reserved'})},transport:()=>async()=>{calls++;return new Response('private body',{status:401});}});const result=await engine.generate(request,context);expect(calls).toBe(1);expect(result.metadata.capabilities?.text.fallbackReason).toBe('provider-auth');expect(JSON.stringify(result)).not.toContain('private body');
});
test('M9 shared REST: atomic reservation contract, hashed source, duplicate/budget and malformed responses fail closed',async()=>{
 let body:unknown[]=[];const config={url:'https://test.upstash.io',token:'synthetic-redis-token',sourceSecret:'synthetic-hmac-secret-at-least-32-characters',epoch:'pilot',maximumCalls:5,maximumMicros:50000,perSourceMinute:2};
 const input={requestId:randomUUID(),source:'192.0.2.50',operation:'image' as const,reservationMicros:10000};
 const shared=createSharedUsage(config,async(_url,init)=>{body=JSON.parse(String(init?.body));return Response.json({result:['allow','reserved']});});expect((await shared.reserve(input)).allowed).toBe(true);expect(body[0]).toBe('EVAL');expect(body[1]).toBe(RESERVE_LUA);expect(JSON.stringify(body)).not.toContain(input.source);expect(RESERVE_LUA).toContain("HINCRBY");expect(RESERVE_LUA).toContain("disabled");
 for(const result of [['deny','duplicate'],['deny','shared-budget'],['deny','source-limit'],[],null]){const denied=createSharedUsage(config,async()=>Response.json({result}));expect((await denied.reserve(input)).allowed).toBe(false);}
 let accessed=false;const unsafe=createSharedUsage({...config,url:'https://evil.invalid'},async()=>{accessed=true;throw Error();});expect((await unsafe.reserve(input)).allowed).toBe(false);expect(accessed).toBe(false);
});
test('M9 image provenance: XMP exact through worker derivative and composite PNG, pixels unchanged',async()=>{
 const xmp='<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:iptc="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" iptc:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/></rdf:RDF></x:xmpmeta>';
 const png=Buffer.from(pngProvenance(new Uint8Array(await sharp({create:{width:32,height:32,channels:3,background:'red'}}).png().toBuffer()),xmp));const adapter=createMetaAdapter({enabled:true,key:'synthetic-only'},()=>async()=>Response.json({data:[{b64_json:png.toString('base64')}]}))!;const image=await adapter.image('Ceramic desk pieces');expect(image.asset.providerMetadata?.xmp).toBe(xmp);
 const composite=pngProvenance(new Uint8Array(await sharp({create:{width:100,height:80,channels:3,background:'blue'}}).png().toBuffer()),xmp,JSON.stringify({image:{source:'meta'}}));const meta=await sharp(composite).metadata();expect(meta.xmp?.toString()).toBe(xmp);expect([meta.width,meta.height]).toEqual([100,80]);expect(await sharp(composite).raw().toBuffer()).toEqual(await sharp({create:{width:100,height:80,channels:3,background:'blue'}}).raw().toBuffer());
});
test('M9 topic alignment: generalized desk/wildlife choices preserve unrelated cup/camera/sky refusals',()=>{
 for(const r of [{...request,topic:'Ceramic desk pieces.'},{...request,topic:'Observing urban wildlife.'}]){const schema=compactCreativeSchema(r);expect(JSON.stringify(schema)).toBeTruthy();const p=fallbackPlan(r);expect(validatePlan(p,r).issues).toEqual([]);for(const visual of ['cup','camera','sky'] as const){expect(validatePlan({...p,artDirection:{...p.artDirection,visual},decoration:{...p.decoration,illustration:visual==='cup'?'cup':'abstract'}},r).plan).toBeUndefined();}}
});

test('M9 shared admission: two server instances share cumulative reservations, source throttling and idempotency',async()=>{
 // Deterministic atomic backing-store fixture; this is not a claim of live Redis execution.
 let calls=0,micros=0;const ids=new Set<string>();
 const shared={reserve:async(a:{requestId:string;operation:string;reservationMicros:number})=>{const id=a.requestId+a.operation;if(ids.has(id))return{allowed:false,reason:'duplicate'};if(calls+1>2||micros+a.reservationMicros>85000)return{allowed:false,reason:'shared-budget'};ids.add(id);calls++;micros+=a.reservationMicros;return{allowed:true,reason:'reserved'};}};
 let dispatches=0;const options={enabled:true,key:()=>'synthetic-only',countries:['IN'],shared,transport:()=>async()=>{dispatches++;return Response.json(envelope(request));}};
 const a=new MetaGenerationEngine(options),b=new MetaGenerationEngine(options);
 const onlyText={...request,ai:{...request.ai!,image:false}};
 await Promise.all([a.generate(onlyText,context),b.generate(onlyText,context)]);expect(dispatches).toBe(1);
 await a.generate(onlyText,{...context,requestId:randomUUID()});await b.generate(onlyText,{...context,requestId:randomUUID()});expect(dispatches).toBe(2);expect(calls).toBe(2);expect(micros).toBe(20000);
 expect(RESERVE_LUA.indexOf('shared-budget')).toBeLessThan(RESERVE_LUA.indexOf('HINCRBY'));expect(RESERVE_LUA.indexOf('source-limit')).toBeLessThan(RESERVE_LUA.indexOf('HINCRBY'));
});

test('M9 shared outage: stalled transport has a bounded fail-closed deadline',async()=>{
 const shared=createSharedUsage({url:'https://test.upstash.io',token:'synthetic',sourceSecret:'synthetic-secret-with-at-least-32-characters',epoch:'test',maximumCalls:1,maximumMicros:75000,perSourceMinute:3},async()=>new Promise<Response>(()=>{}));
 const started=Date.now();expect(await shared.reserve({requestId:randomUUID(),source:'192.0.2.1',operation:'image',reservationMicros:75000})).toEqual({allowed:false,reason:'shared-unavailable'});expect(Date.now()-started).toBeLessThan(2800);
});

test('M9 preservation: signed XMP is refused; original AI marker remains detectable without decoding pixels',async()=>{
 const original=await sharp({create:{width:32,height:32,channels:3,background:'red'}}).png().toBuffer();const signed=Buffer.from(pngProvenance(original,'<x:xmpmeta>c2pa signed provenance</x:xmpmeta>'));
 expect(metaPngMetadata(signed).signed).toBe(true);const adapter=createMetaAdapter({enabled:true,key:'synthetic-only'},()=>async()=>Response.json({data:[{b64_json:signed.toString('base64')}]}))!;await expect(adapter.image('Ceramic desk pieces')).rejects.toMatchObject({code:'asset'});
});
