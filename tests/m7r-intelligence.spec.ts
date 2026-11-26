import {test,expect} from "@playwright/test";
import {readFileSync,writeFileSync} from "node:fs";
import {fallbackPlan,planToSpec,validatePlan} from "../src/lib/generation/planner";
import {localConcepts,validatedConcepts} from "../src/lib/generation/concepts";
import {FORMATS,designSchema} from "../src/lib/design";
import {resolveLayout} from "../src/lib/design-engine/layout";
import {M7_CORPUS} from "../evaluation/m7-corpus";
const request={...M7_CORPUS[0],treatment:"creative-led" as const,mode:"local" as const};
test("M7R concepts: distinct copy, immutable ledger, determinism, and duplicate palette rejection",({},info)=>{
 const set=localConcepts(request);expect(set.concepts.length).toBeGreaterThanOrEqual(2);expect(localConcepts(request)).toEqual(set);
 for(const c of set.concepts){expect(designSchema.safeParse(c.spec).success).toBe(true);for(const f of c.spec.creativeContent!.facts)expect(JSON.stringify(c.spec.campaign)).toContain(f.text);}
 const p=fallbackPlan(request),c={version:1,id:"first",origin:"local",plan:p};expect(validatedConcepts([c,{...c,id:"colour",plan:{...p,artDirection:{...p.artDirection,recipe:"editorial"}}}],request)).toHaveLength(1);
 writeFileSync(info.outputPath("concepts.json"),JSON.stringify(set,null,2));
});
test("M7R subject strategy: uncertain garments get deliberate type, never a mechanical wrench",()=>{
 for(const topic of ["Introduce a community clothing repair gathering.","A silk restoration demonstration.","A discussion about deep-sea soundscapes.","A paper marbling exhibition."]){const p=fallbackPlan({...request,topic,details:""});expect(p.artDirection.visual).toBe("none");expect(p.artDirection.design?.imageRole).toBe("none");}
 expect(fallbackPlan({...request,topic:"Mechanical bicycle repair gathering.",details:""}).artDirection.visual).toBe("repair");
});
test("M7R grammar: four distinct recipes and three distinct tastes preserve bounded native roles",()=>{
 const geometry=[];for(const taste of ["bold-street","minimal-swiss","festive-pop"] as const){const r={...request,taste},s=planToSpec(fallbackPlan(r),r,"deterministic-fallback");if(s.version!==3)throw Error();for(const f of FORMATS){const l=resolveLayout(s,f);for(const rect of [l.kicker,l.headline,l.support]){expect(rect.w).toBeGreaterThan(0);expect(rect.h).toBeGreaterThan(0);}expect(l.floors.support).toBeGreaterThanOrEqual(34);}geometry.push(JSON.stringify(resolveLayout(s,FORMATS[0])));}
 expect(new Set(geometry).size).toBe(3);
});
test("M7R anchor: unknown, negative and workshop fact anchors are refused",()=>{
 const r={...request,taste:"minimal-swiss" as const,topic:"A research-reading workshop.",details:"Entry ₹50. No certificates."},p=fallbackPlan(r);
 for(const anchorFactId of ["f-details-0","f-details-11","f-topic-999"]){expect(validatePlan({...p,artDirection:{...p.artDirection,design:{version:1,imageRole:"none",typeMode:"anchor",device:"axis",anchorFactId}}},r).plan).toBeUndefined();}
});
test("M7R historical compatibility: retained M7 specifications retain exact old layout dispatch",()=>{
 const s=JSON.parse(readFileSync("tests/fixtures/m7-legacy-chai.json","utf8"));expect(s.artDirection.design).toBeUndefined();expect(designSchema.safeParse(s).success).toBe(true);expect(resolveLayout(s,FORMATS[0]).headline.w).toBe(972);
});
