import {test,expect} from "@playwright/test";
import {writeFileSync} from "node:fs";
import {designSchema} from "../src/lib/design";
import {interpretBrief} from "../src/lib/generation/brief";
import {factualTokens} from "../src/lib/generation/facts";

const edges=[
  {id:"contradictory-venues",topic:"Campus robotics workshop.",details:"Venue: Lab A.\nVenue: Lab C. 26 November 2026 at 18:30 IST.",facts:["Venue: Lab A.","Venue: Lab C."]},
  {id:"corrected-venue",topic:"Coding contest for students.",details:"27 November 2026, 15:00 IST. Venue changed from Lab A to Lab C. No entry fee.",facts:["Venue changed from Lab A to Lab C.","No entry fee."]},
  {id:"unusual-names-currency-url",topic:'Workshop for "OrbitForge" students.',details:"Entry ₹1,250; materials €18. Venue: Studio XR-210; register at https://example.org/register?team=XR-210&fee=150",facts:['"OrbitForge"',"₹1,250","€18","XR-210","https://example.org/register?team=XR-210&fee=150"]},
  {id:"long-dense",topic:"Campus robotics workshop.",details:"26 November 2026 at 18:30 IST. Venue: Lab A. No certificates. "+"Bring a notebook to record workshop ideas and discuss exercises with other participants. ".repeat(4),facts:["No certificates.","other participants."]},
  {id:"unbroken-url",topic:"A community reading corner.",details:"Register at https://example.org/"+"reading".repeat(24),facts:["https://example.org/"]},
  {id:"negative-facts",topic:"A neighborhood gathering.",details:"No parking is available. No chairs have been supplied. The venue is not confirmed.",facts:["No parking is available.","No chairs have been supplied.","The venue is not confirmed."]},
  {id:"unsafe-as-data",topic:'<script>alert("unsafe")</script> & a robotics workshop.',details:"No supplied date, venue or fee.",facts:['<script>alert("unsafe")</script>']},
  {id:"unsupported-script",topic:"समुदाय कार्यशाला",details:"No supplied date, venue or fee.",facts:["समुदाय कार्यशाला"]},
  {id:"unknown-topic",topic:"A neighborhood reading corner.",details:"",facts:["reading corner"]},
  {id:"subjectless",topic:"Help me announce something.",details:"No supplied name, date or price.",facts:[]},
];
for(const fixture of edges)test(`M4 edge ${fixture.id}: actual local safety and honest layout outcome`,async({page},info)=>{
  await page.goto("/");await page.getByLabel("What are we creating for?").fill(fixture.topic);await page.getByLabel("Optional details").fill(fixture.details);await page.getByRole("radio",{name:"Minimal Swiss",exact:true}).check();
  const event=page.waitForResponse(r=>r.url().endsWith("/api/generate"));await page.getByRole("button",{name:"Use local planner"}).click();const response=await event,result=await response.json();
  if(fixture.id==="subjectless"){expect(response.status()).toBe(422);expect(result.code).toBe("brief-incomplete");await expect(page.locator('[data-poster]')).toHaveCount(0);writeFileSync(info.outputPath("edge.json"),JSON.stringify({kind:"Actual local incomplete input, no provider",fixture,result},null,2));return;}
  expect(response.status()).toBe(200);expect(result.metadata.attempts).toEqual([]);expect(designSchema.safeParse(result.spec).success).toBe(true);
  const copy=[result.spec.campaign.eyebrow,result.spec.campaign.headline,result.spec.campaign.supportingText,result.spec.campaign.cta??""].join("\n");
  expect(factualTokens(copy)).toEqual(factualTokens(interpretBrief({...fixture,taste:"minimal-swiss"}).content.join("\n")));
  for(const fact of fixture.facts)expect(copy).toContain(fact);
  await expect(page.locator('[data-poster][data-ready="true"]')).toHaveCount(4);await expect(page.locator('[data-poster] script')).toHaveCount(0);
  if(fixture.id==="unknown-topic")expect(result.spec.artDirection.visual).toBe("none");
  const measured=await page.locator('[data-poster]').evaluateAll(nodes=>nodes.map(n=>({format:n.getAttribute("data-poster"),overflow:n.getAttribute("data-overflow"),issues:JSON.parse(n.getAttribute("data-quality")??"[]"),corrections:JSON.parse(n.getAttribute("data-corrections")??"[]")})));
  if(fixture.id==="long-dense")expect(measured.every(m=>m.overflow==="false")).toBe(true);
  await page.screenshot({path:info.outputPath(fixture.id+"-actual-studio.png"),fullPage:true});
  writeFileSync(info.outputPath("edge.json"),JSON.stringify({kind:"Actual local browser/HTTP; no AI or mock. Contradictory labels retained without guessing a winner; user must confirm.",fixture,result,measured},null,2));
});
