import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import sharp from "sharp";
import {optimizeRaster} from "../src/server/raster-optimizer";
import {M7_CORPUS} from "./m7-corpus";
import {generationResultSchema} from "../src/lib/generation/contracts";
import {designSchema} from "../src/lib/design";
import {collectArtwork} from "../tests/support/m7r-artwork";

async function load(page:import('@playwright/test').Page,input:{topic:string;details:string;taste:string},result:unknown){
 await page.route('**/api/generate',r=>r.fulfill({json:result}));await page.goto('/create');await page.getByLabel('What are we creating for?').fill(input.topic);await page.getByLabel('Optional details').fill(input.details);await page.getByRole('radio',{name:input.taste==='minimal-swiss'?'Minimal Swiss':'Bold Street',exact:true}).check();await page.getByLabel('Planning approach').selectOption('creative-led');await page.getByRole('button',{name:'Use local planner'}).click();
}

test("M7L private retained I01: 160 KB optimization and actual canonical downloads",async({page,context,request},info)=>{
 test.setTimeout(90000);
 const sourcePath=process.env.CHOWK_M7L_PRIVATE_SOURCE;if(!sourcePath)throw Error('Provide the authorized retained I01 asset path; no download is performed.');
 const source=readFileSync(sourcePath),sha=createHash('sha256').update(source).digest('hex');expect(sha).toBe('388b6c0a0a32227ed581b7ef0b9f9c70cd726e5ee16d60e6f12c7b9d94942c5a');
 const optimized=await optimizeRaster(source,{source:'meta'}),a=optimized.asset;expect(a.bytes).toBe(143185);expect([a.width,a.height]).toEqual([1024,1024]);expect(a.bytes).toBeLessThanOrEqual(160000);const bytes=Buffer.from(a.dataUrl.split(',')[1],'base64');writeFileSync(info.outputPath('private-derivative.jpg'),bytes);
 const originalPixels=await sharp(source).resize(a.width,a.height).removeAlpha().raw().toBuffer(),derivativePixels=await sharp(bytes).removeAlpha().raw().toBuffer();let mse=0;for(let i=0;i<originalPixels.length;i++)mse+=(originalPixels[i]-derivativePixels[i])**2;mse/=originalPixels.length;
 const compression={rgbRmse:Math.sqrt(mse),psnrDb:mse?10*Math.log10(255**2/mse):null,comparison:'Decoded derivative against the original resized by the same installed Sharp; not artistic acceptance or cross-resolution quality equivalence.',sourceBytes:source.length,derivativeBytes:a.bytes,width:a.width,height:a.height,processingMs:optimized.elapsedMs,attempts:optimized.attempts};
 const item=M7_CORPUS[1],input={topic:item.topic,details:item.details,taste:item.taste,treatment:'creative-led',mode:'local'};const response=await request.post('/api/generate',{data:input});expect(response.headers()['x-campaign-inference']).toBe('disabled');const result=generationResultSchema.parse(await response.json());expect(result.spec.version).toBe(3);if(result.spec.version!==3)throw Error();
 const spec=designSchema.parse({...result.spec,assetLayer:a,artDirection:{...result.spec.artDirection,adaptation:'balanced',recipe:'editorial',design:{...result.spec.artDirection.design,imageRole:'immersive'}}});
 const fixture={...result,spec};await load(page,input,fixture);await expect(page.locator('[data-raster-layer]')).toHaveCount(4);
 writeFileSync(info.outputPath('generation.json'),JSON.stringify({provenance:'INJECTED HTTP fixture: actual local Chai text plan plus server-optimized historical private Meta I01 asset. Not fresh inference or autonomous selection.',input,actualLocalGeneration:result,fixture,source:{reference:'Meta Batch A I01/asset.png',sha256:sha,bytes:source.length,privateOnly:true},compression},null,2));
 const record=await collectArtwork(page,context,info,spec,'Private retained Meta I01 asset; 160 KB server budget; actual native downloads; zero fresh inference; rights uncleared.');
 const htmlBytes=readFileSync(info.outputPath('campaign.html')).length,representativeResponseBytes=Buffer.byteLength(JSON.stringify({...fixture,html:readFileSync(info.outputPath('campaign.html'),'utf8')}));expect(htmlBytes).toBeLessThanOrEqual(1500000);expect(representativeResponseBytes).toBeLessThanOrEqual(2000000);
 writeFileSync(info.outputPath('transport.json'),JSON.stringify({htmlBytes,representativeResponseBytes,scope:'Actual browser HTML download and measured representative serialized result with spec plus HTML; not an HTTP endpoint accepting private asset specifications.',thresholds:{html:1500000,http:2000000},...compression,maximumPngDifference:Math.max(...record.outputs.map(o=>o.pngVsDom))},null,2));
});

const briefs=[
 {id:'orbit-clay',topic:'Introduce Orbit Clay, a collection of ceramic desk pieces.',details:'Pen holders and small trays in sand and charcoal. Understated editorial direction. No prices or launch dates have been supplied. Do not invent dimensions, manufacturing locations or certifications.',taste:'minimal-swiss'},
 {id:'field-notes',topic:'Promote Field Notes, an introductory seminar on observing urban wildlife.',details:'18 December 2026, 2 PM to 4 PM IST. Venue: Room Cedar. Open to first-year students. 20 seats. Entry \u20b960. Bring a notebook. No certificates will be issued. Register at https://example.org/field-notes.',taste:'bold-street'},
];
for(const brief of briefs)test('M7L actual local baseline '+brief.id,async({page,context,request},info)=>{
 test.setTimeout(90000);const input={...brief,id:undefined,treatment:'creative-led',mode:'local'},response=await request.post('/api/generate',{data:input});expect(response.headers()['x-campaign-inference']).toBe('disabled');const result=generationResultSchema.parse(await response.json());expect(result.metadata.attempts).toEqual([]);writeFileSync(info.outputPath('generation.json'),JSON.stringify({provenance:'Actual local creative-led generation; not Meta; fresh provider dispatches zero.',input,result},null,2));await load(page,input,result);await collectArtwork(page,context,info,result.spec,'Actual local creative-led baseline for pending live comparison; zero provider calls.');
 const concepts=await request.post('/api/concepts',{data:input});expect(concepts.ok()).toBe(true);writeFileSync(info.outputPath('local-concepts.json'),JSON.stringify(await concepts.json(),null,2));
});

