import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { FORMATS, PRESETS, designSchema } from "../src/lib/design";
import { M4_CORPUS } from "./m4-corpus";

for (const item of M4_CORPUS) test(`${item.id}: actual local four-format corpus`, async ({ page }, info) => {
  const errors: string[]=[]; page.on("pageerror",e=>errors.push(e.message));
  await page.goto("/"); await page.getByLabel("What are we creating for?").fill(item.topic);
  await page.getByLabel("Optional details").fill(item.details);
  await page.getByRole("radio",{name:new RegExp(PRESETS[item.taste].name)}).click();
  const response=page.waitForResponse(r=>r.url().endsWith("/api/generate"));
  await page.getByRole("button",{name:"Use local planner"}).click();
  const result=await (await response).json(); expect(result.metadata.attempts).toEqual([]);
  expect(result.metadata.source).toBe("deterministic-fallback"); expect(designSchema.safeParse(result.spec).success).toBe(true);
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  const outputs=[];
  for(const format of FORMATS){
    const node=page.locator(`[data-poster="${format.id}"]`), issues=JSON.parse(await node.getAttribute("data-quality")??"[]");
    const measurements=await node.locator('[data-fit]').evaluateAll(nodes=>nodes.map(n=>({role:(n as HTMLElement).dataset.role,pixels:parseFloat(getComputedStyle(n).fontSize),floor:Number((n as HTMLElement).dataset.min),text:n.textContent})));
    if(issues.length){outputs.push({format:format.id,issues,measurements,refused:true});continue;}
    const event=page.waitForEvent("download");await page.getByRole("button",{name:`Export ${format.name} PNG`,exact:true}).click();
    const file=info.outputPath(`${item.id}-${format.id}.png`);await(await event).saveAs(file);
    const png=readFileSync(file);expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([format.width,format.height]);
    outputs.push({format:format.id,issues,measurements,refused:false,bytes:png.length});
  }
  if(outputs.every(o=>!o.refused)){
    const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export HTML"}).click();
    const file=info.outputPath(`${item.id}.html`);await(await event).saveAs(file);
    const offline=await page.context().newPage();let requests=0;await offline.route("http{,s}://**",r=>{requests++;return r.abort();});
    await offline.goto(pathToFileURL(file).href);await expect(offline.locator('[data-poster]')).toHaveCount(4);expect(requests).toBe(0);await offline.close();
  }
  await page.getByRole("button",{name:"Inspect spec"}).click();const json=page.waitForEvent("download");await page.getByRole("button",{name:"Download JSON"}).click();
  const file=info.outputPath(`${item.id}-spec.json`);await(await json).saveAs(file);expect(JSON.parse(readFileSync(file,"utf8"))).toEqual(result.spec);
  await page.getByRole("button",{name:"Close inspection"}).click();
  await page.setViewportSize({width:1440,height:900});await page.screenshot({path:info.outputPath(`${item.id}-desktop.png`),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:info.outputPath(`${item.id}-mobile.png`),fullPage:true});
  writeFileSync(info.outputPath("evidence.json"),JSON.stringify({kind:"Actual local planning and actual browser downloads; no model request or mock",checkpoint:execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),request:item,result,outputs,errors},null,2));
  expect(errors).toEqual([]);
  // Baseline records a refusal honestly; the candidate must fit the reasonable corpus.
  if(process.env.M4_PHASE!=="baseline")expect(outputs.filter(o=>o.refused)).toEqual([]);
});
