import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { fallbackPlan, validatePlan } from "../src/lib/generation/planner";
import { interpretBrief, IncompleteBriefError } from "../src/lib/generation/brief";
import { factualIssues, factualTokens } from "../src/lib/generation/facts";
import { repairGuidance, validationDiagnosticsSchema } from "../src/lib/generation/diagnostics";
import { generationPrompt } from "../src/server/gemini";
import { GenerationEngine, DEFAULT_CONFIG } from "../src/server/engine";

export const environment = { topic: "Campaign to reduce plastic waste.", details: "Encourage people to bring a reusable bottle. No supplied statistics, organization name or event date.", taste: "bold-street" as const };
export const robotics = { topic: "Campus robotics workshop for students.", details: "12 teams. 26 November 2026 at 18:30 IST. Venue: Lab A; Entry ₹150. Register at https://example.org/workshop.", taste: "minimal-swiss" as const };
const copy = (plan: ReturnType<typeof fallbackPlan>) => [plan.campaign.eyebrow, plan.campaign.headline, plan.campaign.supportingText, plan.campaign.cta ?? ""].join("\n");

test("exact environmental declaration stays metadata rather than public copy", ({}, info) => {
  const plan = fallbackPlan(environment), interpretation = interpretBrief(environment);
  writeFileSync(info.outputPath("environment-classification.json"), JSON.stringify({ kind: "Actual independent planner; no provider call", request: environment, interpretation, plan }, null, 2));
  expect(copy(plan)).not.toContain("No supplied statistics");
  expect(copy(plan)).toContain("Encourage people to bring a reusable bottle.");
  expect(interpretation.missing).toEqual(["No supplied statistics, organization name or event date."]);
  expect(plan.interpretation.missingInformation).toContain(interpretation.missing[0]);
  expect(validatePlan(plan, environment).issues).toEqual([]);
});

test("bounded field grammar recognizes compound and single-field metadata without deleting negatives", ({}, info) => {
  const declarations = [
    "No supplied organization name or event date.",
    "No supplied statistics, organization name, and event date.",
    "No supplied statistics,\norganization name or event date.",
    "No supplied date, time, or venue.",
    "No organization name, event date or price has been supplied.",
    "Organization name and event date have not been provided yet.",
    "We haven't supplied statistics or organization name yet.",
    "No supplied organization name.", "No supplied event date.",
    "No schedule or price has been supplied.", "I have not supplied what, when or where yet.",
  ];
  const records = declarations.map(details => {
    const request = { ...environment, details }, interpretation = interpretBrief(request), plan = fallbackPlan(request);
    expect(interpretation.missing, details).toEqual([details]);
    expect(copy(plan), details).not.toContain(details);
    expect(validatePlan(plan, request).issues, details).toEqual([]);
    return { details, interpretation, campaign: plan.campaign };
  });
  for (const fact of ["No certificates.", "No entry fee.", "No organization has endorsed this campaign.", "No chairs have been supplied.", "The venue is not confirmed."]) {
    const request = { ...environment, details: fact }, plan = fallbackPlan(request);
    expect(interpretBrief(request).missing).toEqual([]);
    expect(copy(plan)).toContain(fact);
    expect(validatePlan(plan, request).issues).toEqual([]);
  }
  // Unknown noun lists stay unclassified; a partial known field cannot swallow facts.
  expect(interpretBrief({ ...environment, details: "No supplied certificates or chairs." }).content).toContain("No supplied certificates or chairs.");
  expect(() => fallbackPlan({ ...environment, topic: "Create a poster.", details: declarations[0] })).toThrow(IncompleteBriefError);
  writeFileSync(info.outputPath("classification-matrix.json"), JSON.stringify(records, null, 2));
});

test("mixed facts, planning directions, explicit copy and corrected venues stay distinct", () => {
  const request = { ...robotics, details: robotics.details + " No supplied organization name; No certificates; No entry fee. No organization has endorsed this campaign. Venue changed from Lab B to Lab C. The venue is not confirmed. Do not invent event logistics." };
  const plan = fallbackPlan(request), text = copy(plan);
  expect(text).toContain("No certificates"); expect(text).toContain("No entry fee");
  expect(text).toContain("No organization has endorsed this campaign.");
  expect(text).toContain("Venue changed from Lab B to Lab C."); expect(text).toContain("The venue is not confirmed.");
  expect(text).not.toContain("No supplied organization name"); expect(text).not.toContain("Do not invent");
  expect(factualTokens(text)).toEqual(factualTokens(interpretBrief(request).content.join("\n")));
  expect(validatePlan(plan, request).issues).toEqual([]);
  expect(factualIssues(request.details, text.replace("No entry fee", "Entry fee"))).toContain("missing-negative-fact");
  for (const declaration of ["No supplied statistics, organization name or event date.", "No organization name has been supplied.", "Do not invent event logistics."]) {
    const explicit = { ...environment, details: `Public copy: ${declaration}` }, kept = fallbackPlan(explicit);
    expect(copy(kept)).toContain(declaration); expect(interpretBrief(explicit).missing).toEqual([]);
    expect(validatePlan(kept, explicit).issues).toEqual([]);
  }
});

test("exact robotics facts and private-value-free missing categories use unchanged factual criteria", ({}, info) => {
  const plan = fallbackPlan(robotics);
  expect(validatePlan(plan, robotics).issues).toEqual([]);
  for (const fact of ["students", "12 teams", "26 November 2026", "18:30 IST", "Lab A", "₹150", "https://example.org/workshop"]) expect(copy(plan)).toContain(fact);
  const omissions = [ ["26 November 2026", "date"], ["18:30", "time"], ["IST", "timezone"], ["₹150", "currency"], ["12 teams", "quantity"], ["https://example.org/workshop", "url"] ];
  const records = omissions.map(([fact, category]) => {
    const changed = JSON.parse(JSON.stringify(plan));
    for (const field of ["eyebrow", "headline", "supportingText", "cta"]) if (changed.campaign[field]) changed.campaign[field] = changed.campaign[field].replace(fact, "");
    const rejected = validatePlan(changed, robotics), diagnostic = rejected.diagnostics!;
    expect(rejected.issues).toContain("missing-supplied-fact"); expect(validationDiagnosticsSchema.safeParse(diagnostic).success).toBe(true);
    expect(diagnostic.issues.find(issue => issue.code === "missing-supplied-fact")?.categories).toContain(category);
    expect(repairGuidance(diagnostic).join(" ")).toContain(category);
    expect(JSON.stringify(diagnostic)).not.toContain(fact);
    return { omittedCategory: category, diagnostic, repair: repairGuidance(diagnostic) };
  });
  const named = { ...environment, details: 'Business name: "Cedar Collective". 8 teams. 4 December 2026 at 10:15 IST. Entry ₹250. Register at https://example.org/cedar.' };
  expect(validatePlan(fallbackPlan(named), named).issues).toEqual([]);
  expect(factualTokens(copy(fallbackPlan(named)))).toEqual(factualTokens(named.details));
  writeFileSync(info.outputPath("safe-missing-fact-categories.json"), JSON.stringify(records, null, 2));
});

test("mocked AI declaration leaks are rejected, repaired once, or honestly fall back", async ({}, info) => {
  const good = fallbackPlan(environment), bad = { ...good, campaign: { ...good.campaign, supportingText: good.campaign.supportingText + "\nNo supplied statistics, organization name or event date." } };
  const wrapped = { ...good, campaign: { ...good.campaign, supportingText: good.campaign.supportingText + "\nNo supplied statistics,\norganization name or event date." } };
  expect(validatePlan(wrapped, environment).issues).toContain("planning-instruction-in-copy");
  for (const field of ["eyebrow", "headline", "supportingText", "cta"] as const) {
    // Short known declaration also fits the eyebrow/CTA bounds.
    const leaking = { ...good, campaign: { ...good.campaign, [field]: "No supplied event date." } };
    expect(validatePlan(leaking, environment).issues, field).toContain("planning-instruction-in-copy");
  }
  const prompt = JSON.parse(generationPrompt(environment).user);
  expect(prompt.campaignData).toEqual(environment); expect(prompt.briefInterpretation.missing).toContain("No supplied statistics, organization name or event date.");
  expect(prompt.briefInterpretation.content.join("\n")).not.toContain("No supplied");
  const records = [];
  for (const repaired of [true, false]) {
    const calls: { repair?: string[] }[] = [];
    const engine = new GenerationEngine(DEFAULT_CONFIG, async input => {
      calls.push({ repair: input.repair });
      return { raw: repaired && calls.length === 2 ? good : bad, usage: { inputTokens: 0, outputTokens: 0, thinkingTokens: 0, totalTokens: 0 }, finishReason: "STOP" };
    });
    const result = await engine.generate({ ...environment, mode: "auto" });
    expect(calls).toHaveLength(2); expect(calls[1].repair?.join(" ")).toContain("planning-instruction-in-copy");
    expect(result.metadata.source).toBe(repaired ? "gemini" : "deterministic-fallback");
    expect(JSON.stringify(result.spec.campaign)).not.toContain("No supplied");
    if (!repaired) expect(result.interpretation.missingInformation).toContain("No supplied statistics, organization name or event date.");
    records.push({ kind: "Injected in-process provider mock; zero live calls", repaired, calls, result });
  }
  const local = await new GenerationEngine(DEFAULT_CONFIG, async () => { throw new Error("Local mode must never invoke a provider"); }).generate({ ...environment, mode: "local" });
  expect(local.metadata.attempts).toEqual([]);
  writeFileSync(info.outputPath("mocked-ai-repair-fallback.json"), JSON.stringify(records, null, 2));
});
