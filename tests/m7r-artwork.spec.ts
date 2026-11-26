import {test,expect} from "@playwright/test";
import {writeFileSync} from "node:fs";
import {M7R_NOVEL} from "../evaluation/m7r-corpus";
import {PRESETS} from "../src/lib/design";
import {generationResultSchema} from "../src/lib/generation/contracts";
import {collectArtwork} from "./support/m7r-artwork";
for(const input of M7R_NOVEL)test(`M7R unfamiliar actual local campaign: ${input.id}`,async({page,context,request},info)=>{
 test.setTimeout(90000);await page.goto('/create');await page.getByLabel('What are we creating for?').fill(input.topic);await page.getByLabel('Optional details').fill(input.details);await page.getByRole('radio',{name:PRESETS[input.taste].name,exact:true}).check();await page.getByLabel('Planning approach').selectOption('creative-led');const response=page.waitForResponse(r=>r.url().endsWith('/api/generate'));await page.getByRole('button',{name:'Use local planner'}).click();const result=generationResultSchema.parse(await(await response).json());expect(result.metadata.attempts).toEqual([]);writeFileSync(info.outputPath('generation.json'),JSON.stringify({input,result,provenance:'Actual autonomous local generation, no authored plan and no provider request'},null,2));await collectArtwork(page,context,info,result.spec,'Actual autonomous local generation; unfamiliar evaluation topic fixed after grammar implementation.');
 const http=await request.post('/api/render',{data:{topic:input.topic,details:input.details,taste:input.taste,treatment:'creative-led',mode:'local'}});expect(http.status()).toBe(200);const data=await http.json();expect(data.spec).toEqual(result.spec);writeFileSync(info.outputPath('api.html'),data.html);
});
