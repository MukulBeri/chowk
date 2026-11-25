import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync,readdirSync} from "node:fs";
import {FORMATS,PRESETS,type Taste} from "../src/lib/design";

test("actual historical v3 downloads preserve the accepted M3 raster at the existing HTML comparison tolerance",async({page},info)=>{
  const root="test-results/m4-m3-baseline-01";
  const comparisons=[];
  for(const taste of ["bold-street","minimal-swiss","festive-pop"] as Taste[]){
    const folder=readdirSync(root).find(n=>n.startsWith("m4-artwork-robotics-")&&readFileSync(`${root}/${n}/evidence.json`,"utf8").includes(`"taste": "${taste}"`))!;
    const evidence=JSON.parse(readFileSync(`${root}/${folder}/evidence.json`,"utf8"));
    await page.route("**/api/generate",route=>route.fulfill({json:evidence.result}));
    await page.goto("/");await page.getByLabel("What are we creating for?").fill(evidence.request.topic);await page.getByRole("radio",{name:new RegExp(PRESETS[taste].name)}).click();await page.getByRole("button",{name:"Use local planner"}).click();
    await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
    for(const f of FORMATS){
      const event=page.waitForEvent("download");await page.getByRole("button",{name:`Export ${f.name} PNG`,exact:true}).click();const file=info.outputPath(`legacy-v3-${taste}-${f.id}.png`);await(await event).saveAs(file);
      const before=readFileSync(`${root}/${folder}/${evidence.request.id}-${f.id}.png`),after=readFileSync(file),byteIdentical=after.equals(before);
      const difference=await page.evaluate(async({a,b})=>{
        const imgs=await Promise.all([a,b].map(async src=>{const img=new Image();img.src=`data:image/png;base64,${src}`;await img.decode();return img;}));
        const data=imgs.map(img=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const ctx=c.getContext("2d")!;ctx.drawImage(img,0,0);return ctx.getImageData(0,0,c.width,c.height).data;});
        let changed=0,maxDelta=0;for(let i=0;i<data[0].length;i+=4){const delta=Math.max(...[0,1,2,3].map(c=>Math.abs(data[0][i+c]-data[1][i+c])));if(delta>8)changed++;maxDelta=Math.max(maxDelta,delta);}return{ratio:changed/(imgs[0].width*imgs[0].height),maxDelta};
      },{a:before.toString("base64"),b:after.toString("base64")});
      comparisons.push({taste,format:f.id,byteIdentical,...difference});expect(difference.ratio).toBeLessThanOrEqual(.001);
    }
    await page.unroute("**/api/generate");
  }
  writeFileSync(info.outputPath("legacy-v3-comparisons.json"),JSON.stringify({kind:"Cross-run legacy compatibility; distinct from same-revision actual PNG-vs-DOM fidelity and byte-identical inspection checks",threshold:{ratio:.001,channelDelta:8},comparisons},null,2));
});
