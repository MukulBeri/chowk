import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {PRESETS,TASTES,FORMATS} from "../src/lib/design";
import {M4_CORPUS} from "./m4-corpus";

const source="test-results/m4-tabler-trial/source";
const cases=[{asset:"music",id:"culture"},{asset:"device-laptop",id:"ai-workshop"},{asset:"recycle",id:"environment"},{asset:"perfume",id:"perfume"},{asset:"camera",id:"photography"}];
for(const item of cases)for(const taste of TASTES)test(`controlled ${item.asset}/${taste}: native versus vetted static trial`,async({page},info)=>{
  const integrity=JSON.parse(readFileSync("test-results/m4-tabler-trial/integrity.json","utf8"));
  for(const r of integrity){const b=readFileSync(source+"/"+r.name);expect(createHash("sha1").update(Buffer.from(`blob ${b.length}\0`)).update(b).digest("hex")).toBe(r.expectedBlob);}
  const svg=readFileSync(source+`/${item.asset}.svg`,"utf8");
  expect(svg).not.toMatch(/<\/?(?:script|style|foreignObject|image|use|a)\b|\bon\w+\s*=|href=|url\(/i);
  expect(svg).toContain('viewBox="0 0 24 24"');
  const base=M4_CORPUS.find(c=>c.id===item.id)??{topic:"Photography workshop for students.",details:"No supplied date, venue or fee."};
  await page.goto("/");await page.getByLabel("What are we creating for?").fill(base.topic);await page.getByLabel("Optional details").fill(base.details);
  await page.getByRole("radio",{name:new RegExp(PRESETS[taste].name)}).click();const response=page.waitForResponse(r=>r.url().endsWith("/api/generate"));await page.getByRole("button",{name:"Use local planner"}).click();const result=await(await response).json();expect(result.metadata.attempts).toEqual([]);
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);
  const records=[];
  for(const f of FORMATS.filter(f=>f.id==="instagram-square"||f.id==="youtube-thumbnail")){
    const poster=page.locator(`[data-poster="${f.id}"]`),hero=poster.locator('[data-hero]');expect(await hero.count()).toBe(1);
    const native=page.waitForEvent("download");await page.getByRole("button",{name:`Export ${f.name} PNG`,exact:true}).click();await(await native).saveAs(info.outputPath(`native-${item.asset}-${taste}-${f.id}.png`));
    const audit=await hero.evaluate((node,{svg,ink})=>{
      // Whitelisted static paths only; no SVG/HTML interpolation or imported DOM.
      const parsed=new DOMParser().parseFromString(svg,"image/svg+xml");if(parsed.querySelector('parsererror'))throw Error('Invalid vetted SVG');
      const sourceRoot=parsed.documentElement;if(sourceRoot.tagName!=="svg"||sourceRoot.getAttribute("viewBox")!=="0 0 24 24")throw Error('Unexpected source canvas');
      const allowed=new Set(["xmlns","width","height","viewBox","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin"]);
      if(Array.from(sourceRoot.attributes).some(a=>!allowed.has(a.name)))throw Error('Unexpected source root attribute');
      const safe=document.createElementNS("http://www.w3.org/2000/svg","svg");safe.setAttribute("viewBox","0 0 24 24");safe.setAttribute("width","100%");safe.setAttribute("height","100%");safe.setAttribute("fill","none");safe.setAttribute("stroke",ink);safe.setAttribute("stroke-width","2");safe.setAttribute("stroke-linecap","round");safe.setAttribute("stroke-linejoin","round");safe.style.display="block";
      for(const child of sourceRoot.children){if(child.tagName!=="path"||child.attributes.length!==1||!child.hasAttribute("d"))throw Error('Non-whitelisted trial geometry');const d=child.getAttribute("d")!;if(!/^[MmLlHhVvCcSsQqTtAaZz\d., +\-]+$/.test(d))throw Error('Invalid path syntax');const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);safe.append(p);}
      node.replaceChildren(safe);return{paths:safe.childElementCount,staticOnly:true};
    },{svg,ink:result.spec.palette.ink});
    const trial=page.waitForEvent("download");await page.getByRole("button",{name:`Export ${f.name} PNG`,exact:true}).click();const file=info.outputPath(`trial-${item.asset}-${taste}-${f.id}.png`);await(await trial).saveAs(file);const b=readFileSync(file);expect([b.readUInt32BE(16),b.readUInt32BE(20)]).toEqual([f.width,f.height]);
    records.push({format:f.id,audit});
  }
  writeFileSync(info.outputPath("trial.json"),JSON.stringify({kind:"Isolated DOM-only whitelisted geometry trial over actual native local artwork; not a generated or retained product spec",asset:item.asset,taste,sourceRevision:JSON.parse(readFileSync("test-results/m4-tabler-trial/source-revision.json","utf8")),nativeSpec:result.spec,licenseSidecar:"test-results/m4-tabler-trial/source/LICENSE",records},null,2));
});
