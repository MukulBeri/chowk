import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import sharp from "sharp";
import {optimizeRaster} from "../src/server/raster-optimizer";
import {M7_CORPUS} from "./m7-corpus";
import {generationResultSchema} from "../src/lib/generation/contracts";
import {designSchema} from "../src/lib/design";
import {collectArtwork} from "../tests/support/m7r-artwork";

test("M7R private retained photograph: actual server optimization and canonical studio downloads",async({page,context,request},info)=>{
 test.setTimeout(90000);
 const sourcePath=process.env.CHOWK_M7R_PRIVATE_SOURCE;if(!sourcePath)throw Error('Set CHOWK_M7R_PRIVATE_SOURCE to the approved retained I01 asset; no download is performed.');
 const source=readFileSync(sourcePath),sha=createHash('sha256').update(source).digest('hex');expect(sha).toBe('388b6c0a0a32227ed581b7ef0b9f9c70cd726e5ee16d60e6f12c7b9d94942c5a');
 const optimized=await optimizeRaster(source,{source:'meta'});const a=optimized.asset;expect(a.bytes).toBeLessThanOrEqual(60000);const bytes=Buffer.from(a.dataUrl.split(',')[1],'base64');writeFileSync(info.outputPath('private-derivative.jpg'),bytes);
 const originalPixels=await sharp(source).resize(a.width,a.height).removeAlpha().raw().toBuffer(),derivativePixels=await sharp(bytes).removeAlpha().raw().toBuffer();let mse=0;for(let i=0;i<originalPixels.length;i++)mse+=(originalPixels[i]-derivativePixels[i])**2;mse/=originalPixels.length;
 const compression={rgbRmse:Math.sqrt(mse),psnrDb:mse?10*Math.log10(255**2/mse):null,comparison:'Server decoded JPEG against the original resized by the same installed Sharp to derivative dimensions; not artistic acceptance or native-detail recovery.',sourceBytes:source.length,derivativeBytes:a.bytes,width:a.width,height:a.height,processingMs:optimized.elapsedMs,attempts:optimized.attempts};
 const item=M7_CORPUS[1],input={topic:item.topic,details:item.details,taste:item.taste,treatment:'creative-led',mode:'local'};const response=await request.post('/api/generate',{data:input});expect(response.headers()['x-campaign-inference']).toBe('disabled');const result=generationResultSchema.parse(await response.json());expect(result.spec.version).toBe(3);if(result.spec.version!==3)throw Error();
 const spec=designSchema.parse({...result.spec,assetLayer:a,artDirection:{...result.spec.artDirection,adaptation:'balanced',recipe:'editorial',design:{...result.spec.artDirection.design,imageRole:'immersive'}}});
 const fixture={...result,spec};await page.route('**/api/generate',r=>r.fulfill({json:fixture}));await page.goto('/create');await page.getByLabel('What are we creating for?').fill(input.topic);await page.getByLabel('Optional details').fill(input.details);await page.getByRole('radio',{name:'Minimal Swiss',exact:true}).check();await page.getByLabel('Planning approach').selectOption('creative-led');await page.getByRole('button',{name:'Use local planner'}).click();await expect(page.locator('[data-raster-layer]')).toHaveCount(4);
 writeFileSync(info.outputPath('generation.json'),JSON.stringify({provenance:'INJECTED HTTP fixture: actual local text plan plus server-optimized historical private Meta I01 asset. Not fresh inference or autonomous asset selection.',input,actualLocalGeneration:result,fixture,source:{reference:'Meta Batch A I01/asset.png',sha256:sha,bytes:source.length,privateOnly:true},compression},null,2));
 await collectArtwork(page,context,info,spec,'Private retained Meta I01 asset with actual server optimization, injected local response and actual native downloads. No fresh model call; public rights uncleared.');writeFileSync(info.outputPath('compression.json'),JSON.stringify(compression,null,2));
});
