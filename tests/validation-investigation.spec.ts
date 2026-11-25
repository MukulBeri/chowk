import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import {fallbackPlan,validatePlan,contrast,planToSpec} from "../src/lib/generation/planner";
import {generationPrompt,createGeminiProvider,ProviderError} from "../src/server/gemini";
import {PRESETS,TASTES,designSchema} from "../src/lib/design";
import {PALETTES,ENGINE_TASTES} from "../src/lib/design-engine/registry";
import {generationResultSchema,type GenerationRequest} from "../src/lib/generation/contracts";
import {GenerationEngine,DEFAULT_CONFIG} from "../src/server/engine";
import {repairGuidance,structuralDiagnostics,validationDiagnosticsSchema} from "../src/lib/generation/diagnostics";
import {z} from "zod";

const archived=JSON.parse(readFileSync("docs/evidence/m1/live-models.json","utf8"));
const request:GenerationRequest=archived.records.find((r:{id:string;result:{metadata:{model:string}}})=>r.id==="fact-sensitive"&&r.result.metadata.model==="gemini-3.5-flash-lite").request;

test("synthetic failure-mode matrix; no recreation of rejected live plans",({browserName},info)=>{
 expect(browserName).toBe("chromium");
 const base=fallbackPlan(request);
 const candidates=[
  {id:"valid-concise",plan:{...base,campaign:{eyebrow:"ROBOTICS WORKSHOP",headline:"Build together",supportingText:request.topic+"\n"+request.details}}},
  {id:"valid-generic-entry-fee-label",plan:{...base,campaign:{eyebrow:"ROBOTICS WORKSHOP",headline:"Robotics Workshop",supportingText:"12 teams. 26 November 2026 at 18:30 IST. Entry Fee: ₹150. Venue: Lab A; registration at https://example.org/workshop"}}},
  {id:"valid-generic-date-time-label",plan:{...base,campaign:{eyebrow:"ROBOTICS WORKSHOP",headline:"Robotics Workshop",supportingText:"12 teams. Date: 26 November 2026. Time: 18:30 IST. Entry ₹150. Venue: Lab A; registration at https://example.org/workshop"}}},
  {id:"prompt-permitted-legacy-palette",plan:{...base,palette:PRESETS[request.taste].palette}},
  {id:"wrong-variant",plan:{...base,artDirection:{...base.artDirection,variant:"swiss-grid"}}},
  {id:"missing-price",plan:{...base,campaign:{...base.campaign,supportingText:base.campaign.supportingText.replace("₹150","")}}},
  {id:"structural-long-cta",plan:{...base,campaign:{...base.campaign,cta:"Register at https://example.org/workshop for the robotics workshop"}}},
 ];
 const records=candidates.map(({id,plan})=>({id,syntheticPlan:plan,validation:validatePlan(plan,request)}));
 const data={kind:"Deterministic synthetic fixtures using exact archived brief; not recovered live responses",request,records,promptContainsLegacyPalettePermission:generationPrompt(request).system.includes("You may retain the preset palette"),paletteAccentContrast:Object.fromEntries(Object.entries(PALETTES).map(([key,p])=>[key,contrast(p.accent,p.background)]))};
 writeFileSync(info.outputPath("after.json"),JSON.stringify(data,null,2));
 const expected:Record<string,string[]>={"valid-concise":[],"valid-generic-entry-fee-label":[],"valid-generic-date-time-label":[],"prompt-permitted-legacy-palette":["palette-token-mismatch"],"wrong-variant":["unsupported-art-direction"],"missing-price":["missing-supplied-fact"],"structural-long-cta":["invalid-structure"]};
 for(const r of records)expect(r.validation.issues,r.id).toEqual(expected[r.id]);
 expect(data.promptContainsLegacyPalettePermission).toBe(false);
});

const usage={inputTokens:100,outputTokens:200,thinkingTokens:0,totalTokens:300};

test("structural failures retain safe v3 field paths and bounds rather than legacy parse noise",()=>{
 const plan=fallbackPlan(request),bad={...plan,campaign:{...plan.campaign,cta:"x".repeat(61)},artDirection:{...plan.artDirection,visual:"unsupported"}};
 const result=validatePlan(bad,request);expect(result.diagnostics?.stage).toBe("structure");
 expect(result.diagnostics?.issues).toEqual(expect.arrayContaining([{code:"too-large",path:"campaign.cta",limit:60},{code:"invalid-value",path:"artDirection.visual"}]));
 expect(result.diagnostics?.issues.some(i=>i.code==="unknown-field")).toBe(false);
 expect(repairGuidance(result.diagnostics!)).toEqual(expect.arrayContaining([expect.stringContaining("schema maximum (60)")]));
 expect(validationDiagnosticsSchema.safeParse(result.diagnostics).success).toBe(true);
});

test("diagnostics and repair guidance never echo unknown fields, values or unsafe response content and are bounded",()=>{
 const marker="PRIVATE-SYNTHETIC-SENTINEL",plan=fallbackPlan(request);
 const raw={...plan,typography:{...plan.typography,family:marker},campaign:{...plan.campaign,headline:{[marker]:"<script>private payload</script>"}},[marker]:marker};
 const d=validatePlan(raw,request).diagnostics!;
 expect(d.stage).toBe("structure");expect(JSON.stringify([d,repairGuidance(d)])).not.toMatch(/PRIVATE-SYNTHETIC-SENTINEL|private payload|<script>/);
 expect(d.issues).toContainEqual({code:"invalid-type",path:"campaign.headline"});expect(d.issues).toContainEqual({code:"unknown-field",path:"$"});
 const schema=z.array(z.string().max(1)),failed=schema.safeParse(Array(40).fill(marker));expect(failed.success).toBe(false);
 if(!failed.success){const bounded=structuralDiagnostics(failed.error.issues);expect(bounded.issues).toHaveLength(20);expect(bounded.truncated).toBe(true);expect(validationDiagnosticsSchema.safeParse(bounded).success).toBe(true);expect(JSON.stringify(bounded)).not.toContain(marker);}
});

test("field-label correction preserves strict factual and named-entity rejection",()=>{
 const base=fallbackPlan(request),copy="12 teams. 26 November 2026 at 18:30 IST. Entry Fee: ₹150. Venue: Lab A; registration at https://example.org/workshop";
 for(const [label,text,code]of [
  ["changed price",copy.replace("₹150","₹151"),"unsupported-factual-token"],
  ["missing price",copy.replace("₹150",""),"missing-supplied-fact"],
  ["changed count",copy.replace("12 teams","21 teams"),"unsupported-factual-token"],
  ["changed timezone",copy.replace("IST","EST"),"unsupported-factual-token"],
  ["changed venue",copy.replace("Lab A","Lab B"),"missing-named-fact"],
  ["changed URL",copy.replace("example.org","invented.example"),"unsupported-factual-token"],
  ["invented offer",copy+" Free entry.","unsupported-promotional-claim"],
  ["invented organization",copy+" Hosted by Frost Labs.","unsupported-named-entity"],
  ["label-like organization",copy+" Hosted by Entry Fee Labs.","unsupported-named-entity"],
 ]as const){const result=validatePlan({...base,campaign:{...base.campaign,supportingText:text}},request);expect(result.issues,label).toContain(code);expect(result.diagnostics?.stage).toBe("semantic");}
 const negative={...request,details:request.details+"\nNo tickets are required. No chairs have been supplied."};
 expect(validatePlan(fallbackPlan(negative),negative).issues).toEqual([]);
});

test("every supported taste variant and palette passes the plan/renderer contract; historical v2 stays compatible",()=>{
 for(const taste of TASTES){const input={...request,taste},base=fallbackPlan(input);for(const variant of ENGINE_TASTES[taste].variants)for(const palette of ENGINE_TASTES[taste].palettes){
  const plan={...base,palette:PALETTES[palette],artDirection:{...base.artDirection,variant,palette}};
  expect(validatePlan(plan,input).issues).toEqual([]);expect(designSchema.safeParse(planToSpec(plan,input,"gemini")).success).toBe(true);
  const prompt=generationPrompt(input).system;expect(prompt).toContain(variant);expect(prompt).toContain(JSON.stringify(PALETTES[palette]));expect(prompt).not.toContain("You may retain the preset palette");
 }}
 const prior=archived.records.find((r:{id:string;result:{metadata:{source:string}}})=>r.id==="fact-sensitive"&&r.result.metadata.source==="gemini");
 const {topic:originalTopic,...campaign}=prior.result.spec.campaign;expect(originalTopic).toBe(request.topic);
 const {spec,interpretation}=prior.result;const legacy={interpretation,taste:spec.taste,campaign,palette:spec.palette,typography:spec.typography,composition:spec.composition,decoration:spec.decoration,rationale:spec.rationale};
 expect(validatePlan(legacy,request).issues).toEqual([]);expect(planToSpec(legacy,request,"gemini").version).toBe(2);
});

test("mocked REST repair receives actionable sanitized details; response metadata and UI contract preserve them",async()=>{
 let calls=0;const base=fallbackPlan(request);
 const provider=createGeminiProvider({apiKey:"synthetic-credential-not-real",model:DEFAULT_CONFIG.model,maxOutputTokens:DEFAULT_CONFIG.maxOutputTokens,fetcher:async(_url,options)=>{
  calls++;const body=JSON.parse(String(options?.body));const user=JSON.parse(body.contents[0].parts[0].text);expect(user.campaignData).toEqual(request);
  if(calls===2){expect(user.validationIssues).toContain("invalid-structure");expect(user.validationIssues.some((v:string)=>v.includes("campaign.cta")&&v.includes("(60)"))).toBe(true);expect(user.validationIssues.some((v:string)=>v.includes("artDirection.visual"))).toBe(true);expect(user.validationIssues.join(" ")).not.toContain("SYNTHETIC-UNSAFE-VALUE");}
  const raw=calls===1?{...base,campaign:{...base.campaign,cta:"x".repeat(61)},artDirection:{...base.artDirection,visual:"SYNTHETIC-UNSAFE-VALUE"}}:base;
  return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(raw)}]},finishReason:"STOP"}],usageMetadata:{promptTokenCount:100,candidatesTokenCount:200,totalTokenCount:300}});
 }});
 const result=await new GenerationEngine(DEFAULT_CONFIG,provider).generate(request);
 expect(calls).toBe(2);expect(result.metadata.source).toBe("gemini");expect(result.metadata.attempts[0].validation?.stage).toBe("structure");expect(result.metadata.attempts[1].validation).toBeUndefined();
 expect(generationResultSchema.parse(result).metadata.attempts[0].validation).toEqual(result.metadata.attempts[0].validation);
});

test("semantic repair/failure, per-call budget, timeout, local provenance and historical envelopes remain intact",async({browserName},info)=>{
 expect(browserName).toBe("chromium");const base=fallbackPlan(request),bad={...base,palette:PRESETS[request.taste].palette};let calls=0;
 const result=await new GenerationEngine(DEFAULT_CONFIG,async({repair})=>{calls++;if(calls===2){expect(repair).toContain("palette-token-mismatch");expect(repair?.some(v=>v.includes("Copy all four colour values exactly"))).toBe(true);}return{raw:bad,usage,finishReason:"STOP"};}).generate(request);
 expect(calls).toBe(2);expect(result.metadata.fallbackReason).toBe("validation-failed");expect(result.metadata.source).toBe("deterministic-fallback");expect(result.spec.provenance).toBe("deterministic-fallback");expect(result.metadata.attempts.every(a=>a.validation?.stage==="semantic")).toBe(true);
 let budgetCalls=0;const budget=await new GenerationEngine({...DEFAULT_CONFIG,dailyCalls:1},async()=>{budgetCalls++;return{raw:bad,usage,finishReason:"STOP"};}).generate(request);expect(budgetCalls).toBe(1);expect(budget.metadata.fallbackReason).toBe("local-budget");expect(budget.metadata.attempts[0].validation?.stage).toBe("semantic");
 const timeout=await new GenerationEngine({...DEFAULT_CONFIG,timeoutMs:10,overallMs:30},()=>new Promise(()=>{})).generate(request);expect(timeout.metadata.attempts).toHaveLength(1);expect(timeout.metadata.fallbackReason).toBe("timeout");expect(timeout.metadata.attempts[0].validation).toBeUndefined();
 const malformed=await new GenerationEngine(DEFAULT_CONFIG,async()=>{throw new ProviderError("invalid-output");}).generate(request);expect(malformed.metadata.attempts).toHaveLength(2);expect(malformed.metadata.attempts.every(a=>!a.validation)).toBe(true);
 const historical=JSON.parse(readFileSync("docs/evidence/m2/typography/live-verification.json","utf8"));for(const record of historical.records)expect(generationResultSchema.safeParse(record.result).success).toBe(true);
 writeFileSync(info.outputPath("mocked-engine-evidence.json"),JSON.stringify({kind:"Mocked providers only; zero live calls; not recovered historical attempts",request,result,budget,timeout,malformed},null,2));
});

test("studio displays retained safe validation diagnostics from a mocked fallback response",async({page})=>{
 const base=fallbackPlan(request),bad={...base,campaign:{...base.campaign,cta:"x".repeat(61)}};
 const result=await new GenerationEngine(DEFAULT_CONFIG,async()=>({raw:bad,usage,finishReason:"STOP"})).generate(request);
 let intercepted=0;await page.route("**/api/generate",route=>{intercepted++;return route.fulfill({json:result});});
 await page.goto("/create");await page.getByLabel("What are we creating for?").fill(request.topic);await page.getByLabel("Optional details").fill(request.details);await page.getByRole("radio",{name:/Festive Pop/}).click();await page.getByRole("button",{name:"Generate campaign"}).click();
 await expect(page.getByRole("status")).toContainText("Local fallback campaign ready");await page.getByText("Creative plan and generation details",{exact:true}).click();
 const details=page.locator(".generation-provenance pre");await expect(details).toContainText('"stage": "structure"');await expect(details).toContainText('"path": "campaign.cta"');await expect(details).toContainText('"limit": 60');expect(intercepted).toBe(1);
});
