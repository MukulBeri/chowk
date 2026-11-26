import { z } from "zod";
import { creativeLedPlanSchema, type GenerationRequest } from "./contracts";
import { validatePlan, fallbackPlan, planToSpec } from "./planner";
import { interpretCreativeBrief, subjectIdentity } from "./creative-brief";
import { localDesign } from "../design-engine/direction";
import { designSchemaV3 } from "../design";
import {structuralDiagnostics,type ValidationDiagnostics} from './diagnostics';

// A concept is copy + supported direction, not another artboard size or local
// recipe thumbnail. This opt-in envelope never changes legacy HTTP responses.
export const conceptSchema = z.strictObject({
  version: z.literal(1), id: z.string().regex(/^[a-z0-9-]{1,64}$/),
  origin: z.enum(["local", "injected-provider"]), plan: creativeLedPlanSchema,
});
export function validatedConcepts(raw: unknown[], request: GenerationRequest, origin: "local" | "injected-provider" = "local") {
  return inspectConcepts(raw,request,origin).concepts;
}
export function inspectConcepts(raw:unknown[],request:GenerationRequest,origin:'local'|'injected-provider'='local'){
  const signatures = new Set<string>(), ids = new Set<string>();
  const rejections:{index:number;code:'validation'|'duplicate-copy'|'duplicate-id';diagnostics?:ValidationDiagnostics}[]=[];
  const concepts=raw.slice(0,3).flatMap((input,index) => {
    const parsed = conceptSchema.safeParse(input);
    if (!parsed.success) {rejections.push({index,code:'validation',diagnostics:structuralDiagnostics(parsed.error.issues)});return [];}
    const checked = validatePlan(parsed.data.plan, request);
    if (!checked.plan) {rejections.push({index,code:'validation',diagnostics:checked.diagnostics});return [];}
    // Layout, palette, kicker and whitespace alone do not constitute a concept.
    const signature = [checked.plan.campaign.headline, checked.plan.campaign.supportingText, checked.plan.campaign.cta??""].map(s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim()).join("|");
    if (signatures.has(signature)||ids.has(parsed.data.id)) {rejections.push({index,code:ids.has(parsed.data.id)?'duplicate-id':'duplicate-copy'});return [];}
    signatures.add(signature);ids.add(parsed.data.id);
    return [{ ...parsed.data, origin, plan: checked.plan }];
  });
  return {concepts,rejections};
}

export const conceptEnvelopeSchema=z.strictObject({version:z.literal(1),concepts:z.array(z.strictObject({id:conceptSchema.shape.id,plan:creativeLedPlanSchema})).min(1).max(3)});
export const conceptResponseSchema=z.strictObject({version:z.literal(1),source:z.literal("local"),concepts:z.array(z.strictObject({id:conceptSchema.shape.id,label:z.string(),angle:z.string(),spec:designSchemaV3})).min(1).max(3),warnings:z.array(z.string())});

// Two bounded editorial framings, not three template thumbnails. Unsafe/long/
// explicit copy receives fewer concepts; every choice goes through fact binding.
export function localConcepts(request: GenerationRequest) {
  if(request.treatment!=="creative-led")throw Error("Creative-led input required");
  const base=fallbackPlan(request),brief=interpretCreativeBrief(request),identity=subjectIdentity(brief.subject);
  const descriptor=(identity.name?identity.descriptor:brief.subject).replace(/[.!]$/,"").replace(/^an?\s+/i,"");
  const canExplore=descriptor.length>=4&&descriptor.length<=85&&!/\d|https?:|[₹$£€]|\b(no|not|never|without|cancelled|canceled)\b|^headline:/i.test(descriptor);
  const raw:unknown[]=[{version:1,id:"subject",origin:"local",plan:base}];
  if(canExplore){
    const noun=descriptor.charAt(0).toLowerCase()+descriptor.slice(1);
    const article=/^(?:a|an|the)\b/i.test(noun)?noun:`the ${noun}`;
    for(const [id,label,copy] of [["invitation","Invitation",`Make time for ${article}.`],["attention","Discovery",`Explore ${article}.`]] as const){
      const design=localDesign(request.taste,base.artDirection.visual,brief.subject,brief.facts,id==="attention");
      raw.push({version:1,id,origin:"local",plan:{...base,interpretation:{...base.interpretation,concept:`${label} angle: ${copy}`},campaign:{...base.campaign,headline:identity.name?`${id==='attention'?'Explore ':''}${identity.name}${id==='invitation'?" — you're invited":''}`:id==="invitation"?`Make time for ${article}`:`Explore ${article}`,supportingText:''},artDirection:{...base.artDirection,design,emphasis:id==="attention"?"editorial":"display",recipe:id==="attention"?"editorial":base.artDirection.recipe},rationale:`${label} angle: ${copy} Deterministic editorial framing; no new facts or AI request. The application binds every original fact.`}});
    }
  }
  const valid=validatedConcepts(raw,request);
  return conceptResponseSchema.parse({version:1,source:"local",concepts:valid.map(c=>({id:c.id,label:c.id==="subject"?"Subject first":c.id==="invitation"?"Make time": "Discover together",angle:c.id==="subject"?"Lead with the supplied subject":c.id==="invitation"?"An invitation to engage with the subject":"An editorial invitation to examine the subject",spec:planToSpec(c.plan,request,"deterministic-fallback")})),warnings:["Deterministic local editorial concepts, not fresh AI creativity. Some briefs safely support fewer choices. Composition alternatives rearrange one concept; platform formats adapt that same campaign."]});
}
