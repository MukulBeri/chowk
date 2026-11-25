import { test, expect } from '@playwright/test';
import { fallbackPlan, validatePlan, planToSpec } from '../src/lib/generation/planner';
import { interpretCreativeBrief } from '../src/lib/generation/creative-brief';
import { GenerationEngine, DEFAULT_CONFIG } from '../src/server/engine';
import { ProviderError } from '../src/server/gemini';
import { writeFileSync } from 'node:fs';
const benchmark = { topic: 'Launch campaign for a new campus chai stall called Chai Junction.', details: 'Masala chai ₹15. Opening on 28 November 2026 at 4 PM near the IET entrance. Target audience: college students. Warm, youthful and affordable. Do not invent offers, discounts or additional products.', taste: 'bold-street' as const, treatment: 'creative-led' as const, mode: 'local' as const };
test('A1: benchmark separates public ledger and planning metadata', async ({}, info) => { const b = interpretCreativeBrief(benchmark); expect(b.audience).toBe('college students'); expect(b.tone).toContain('youthful'); expect(b.directions).toHaveLength(3); expect(Object.isFrozen(b.facts)).toBe(true); const p = fallbackPlan(benchmark); expect(p.campaign.headline).toBe('Chai Junction'); expect(validatePlan(p, benchmark).issues).toEqual([]); const spec = planToSpec(p, benchmark, 'deterministic-fallback'); expect(spec.campaign.supportingText).toContain('Masala chai ₹15.'); expect(spec.campaign.supportingText).toContain('28 November 2026 at 4 PM near the IET entrance.'); expect(spec.campaign.supportingText).not.toMatch(/Target audience|Do not invent|youthful|Launch campaign/); writeFileSync(info.outputPath('a1-benchmark.json'), JSON.stringify({ brief: b, plan: p, spec }, null, 2)); });
test('A1: negatives, qualifiers, changed venue and multiple prices stay atomic', () => { const r = { ...benchmark, topic: 'Robotics workshop for students.', details: 'No certificates will be provided. Entry is not free. No plastic bags allowed. Venue changed from Lab B to Lab A. Students ₹150; Guests ₹250. Do not invent discounts. No price has been supplied.' }; const b = interpretCreativeBrief(r); const p = fallbackPlan(r); expect(validatePlan(p, r).issues).toEqual([]); for (const f of b.facts)
    expect(JSON.stringify(p.campaign)).toContain(f.text); expect(p.campaign.supportingText).toContain('Students ₹150;'); expect(p.campaign.supportingText).not.toContain('Do not invent'); expect(b.missingInformation).toEqual(['No price has been supplied.']); });
test('A1: subjectless and hostile-only briefs fail honestly; unknown public subject stays data', () => { for (const topic of ['Create a poster.', '<script>alert(1)</script>', 'Do not invent discounts.'])
    expect(() => fallbackPlan({ ...benchmark, topic, details: '' })).toThrow(/what you are announcing/); const r = { ...benchmark, topic: 'An exhibition about imaginary landscapes.', details: 'No refunds. No illustration.' }; const p = fallbackPlan(r); expect(p.artDirection.visual).toBe('none'); expect(p.campaign.supportingText).toContain('No refunds.'); });
test('A1: mocked invalid, refusal, timeout and bounded repair preserve honest fallback', async ({}, info) => { const records = []; for (const kind of ['invalid', 'blocked', 'timeout', 'repair'] as const) {
    let calls = 0;
    const r = { ...benchmark, mode: 'auto' as const };
    const engine = new GenerationEngine({ ...DEFAULT_CONFIG, timeoutMs: 20 }, async ({ repair }) => { calls++; if (kind === 'blocked')
        throw new ProviderError('blocked'); if (kind === 'timeout')
        return new Promise(() => { }); if (kind === 'invalid' || !repair)
        return { raw: {}, usage: { inputTokens: 0, outputTokens: 0, thinkingTokens: 0, totalTokens: 0 }, finishReason: 'STOP' }; return { raw: fallbackPlan(r), usage: { inputTokens: 0, outputTokens: 0, thinkingTokens: 0, totalTokens: 0 }, finishReason: 'STOP' }; });
    const result = await engine.generate(r);
    expect(calls).toBeLessThanOrEqual(2);
    expect(result.metadata.source).toBe(kind === 'repair' ? 'gemini' : 'deterministic-fallback');
    expect(result.spec.campaign.headline).toBe('Chai Junction');
    records.push({ kind, calls, result });
} writeFileSync(info.outputPath('mocked-paths.json'), JSON.stringify(records, null, 2)); });
test('A1: fact references and relational reversals cannot pass as accepted copy', () => { const p = fallbackPlan(benchmark); expect(validatePlan({ ...p, factIds: [] }, benchmark).plan).toBeUndefined(); expect(validatePlan({ ...p, campaign: { ...p.campaign, supportingText: p.campaign.supportingText + ' Free entry!' } }, benchmark).plan).toBeUndefined(); expect(validatePlan({ ...p, campaign: { ...p.campaign, supportingText: 'Target audience: college students.' } }, benchmark).issues).toContain('planning-instruction-in-copy'); });
import { M6A_CORPUS } from '../evaluation/m6a-corpus';
import { compositionCandidates } from '../src/lib/design-engine/candidates';
import { resolveLayout } from '../src/lib/design-engine/layout';
import { designSchema, designSchemaV3, FORMATS } from '../src/lib/design';
import { generationRequestSchema } from '../src/lib/generation/contracts';
import { generationPrompt } from '../src/server/gemini';
test('A1: held-separate evaluation corpus retains every ledger clause without benchmark answers in rules', () => { for (const fixture of M6A_CORPUS) {
    const r = { ...fixture, treatment: 'creative-led' as const };
    const b = interpretCreativeBrief(r), p = fallbackPlan(r);
    expect(validatePlan(p, r).issues, fixture.id).toEqual([]);
    const s = planToSpec(p, r, 'deterministic-fallback');
    expect(designSchema.safeParse(s).success).toBe(true);
    const visible = JSON.stringify(s.campaign).toLowerCase().replace(/\\n/g, ' ').replace(/\s+/g, ' ');
    for (const fact of b.facts)
        expect(visible).toContain(fact.text.toLowerCase().replace(/\s+/g, ' '));
} });
test('A1: all recognized planning statements stay metadata and legitimate supplied negatives stay public', () => { const r = { ...benchmark, topic: 'Library information session.', details: 'Target audience: students. Tone: restrained. Do not invent discounts. No date has been supplied. No chairs have been supplied. Entry is not free. No plastic bags allowed. No certificates will be provided.' }; const b = interpretCreativeBrief(r); const p = fallbackPlan(r); for (const t of ['No chairs have been supplied.', 'Entry is not free.', 'No plastic bags allowed.', 'No certificates will be provided.'])
    expect(p.campaign.supportingText).toContain(t); expect(b.missingInformation).toEqual(['No date has been supplied.']); expect(b.audience).toBe('students'); });
test('A1: contradictory locations are preserved and flagged rather than silently resolved', () => { const r = { ...benchmark, topic: 'Community gathering.', details: 'Venue: Hall A. Venue: Hall B.' }; const b = interpretCreativeBrief(r); expect(b.ambiguities).toHaveLength(1); const p = fallbackPlan(r); expect(p.campaign.supportingText).toContain('Venue: Hall A.'); expect(p.campaign.supportingText).toContain('Venue: Hall B.'); expect(p.interpretation.assumptions.join(' ')).toContain('Multiple location declarations'); });
test('A1: swapped entity-price relations and reconstructed negatives are rejected before binding', () => { const r = { ...benchmark, topic: 'Museum admission.', details: 'Students ₹150. Guests ₹250. No refunds.' }; const p = fallbackPlan(r); for (const supportingText of ['Students ₹250. Guests ₹150.', 'Refunds.'])
    expect(validatePlan({ ...p, campaign: { ...p.campaign, supportingText } }, r).issues).toContain('reconstructed-public-fact'); });
test('A1: fact source ranges are bounded and stable across repeat interpretation', () => { const a = interpretCreativeBrief(benchmark), b = interpretCreativeBrief(benchmark); expect(a.facts).toEqual(b.facts); for (const f of a.facts) {
    expect(f.source.end).toBeLessThanOrEqual(benchmark[f.source.field].length);
    expect(f.source.start).toBeLessThan(f.source.end);
    expect(Object.isFrozen(f.source)).toBe(true);
} });
test('A1: blank, malformed and oversized requests cannot enable capabilities', () => { for (const data of [{ ...benchmark, topic: '' }, { ...benchmark, details: 'a'.repeat(1201) }, { ...benchmark, recipe: '<svg>' }, { ...benchmark, treatment: 'v4' }])
    expect(generationRequestSchema.safeParse(data).success).toBe(false); });
test('A2: candidates preserve public content, ledger, source and registry validation', () => { const r = benchmark, p = fallbackPlan(r), s = designSchemaV3.parse(planToSpec(p, r, 'deterministic-fallback')), c = compositionCandidates(s); expect(c).toHaveLength(3); expect(new Set(c.map(x => x.recipe)).size).toBe(3); for (const item of c) {
    expect(item.kind).toBe('composition');
    expect(item.spec.campaign).toEqual(s.campaign);
    expect(item.spec.creativeContent).toEqual(s.creativeContent);
    expect(item.spec.provenance).toBe(s.provenance);
    expect(designSchema.safeParse(item.spec).success).toBe(true);
} expect(designSchema.safeParse({ ...s, artDirection: { ...s.artDirection, recipe: 'arbitrary' } }).success).toBe(false); expect(designSchema.safeParse({ ...s, campaign: { ...s.campaign, supportingText: '' } }).success).toBe(false); });
test('A2: four recipes resolve structurally different canonical layouts in every format', () => { const s = designSchemaV3.parse(planToSpec(fallbackPlan(benchmark), benchmark, 'deterministic-fallback')); for (const format of FORMATS) {
    const layouts = ['manifesto', 'signboard', 'editorial', 'dossier'].map(recipe => resolveLayout(designSchemaV3.parse({ ...s, artDirection: { ...s.artDirection, recipe } }), format));
    expect(new Set(layouts.map(l => JSON.stringify([l.headline, l.support, l.art]))).size).toBe(4);
    for (const l of layouts) {
        expect(l.floors.support).toBeGreaterThanOrEqual(34);
        expect(l.headline.w).toBeGreaterThan(0);
        expect(l.support.h).toBeGreaterThan(0);
    }
} });
test('A2: default legacy schemas and plans remain opt-in free; new treatment cannot leak into defaults', () => { const r = { ...benchmark, treatment: undefined }; const p = fallbackPlan(r), s = planToSpec(p, r, 'deterministic-fallback'); expect('creativeContent' in s).toBe(false); expect(p.artDirection.treatment).toBe('subject-led'); expect(p.artDirection.recipe).toBeUndefined(); expect(validatePlan(fallbackPlan(benchmark), r).plan).toBeUndefined(); expect(designSchema.safeParse({ ...s, creativeContent: {} }).success).toBe(false); });
test('A1: mock cache keeps legacy and creative opt-in results distinct with original bounded calls', async () => { let calls = 0; const e = new GenerationEngine(DEFAULT_CONFIG, async ({ request }) => { calls++; return { raw: fallbackPlan(request), usage: { inputTokens: 0, outputTokens: 0, thinkingTokens: 0, totalTokens: 0 }, finishReason: 'STOP' }; }); const r = { ...benchmark, mode: 'auto' as const }; const a = await e.generate({ ...r, treatment: undefined }), b = await e.generate(r); expect(calls).toBe(2); expect(a.spec).not.toHaveProperty('creativeContent'); expect(b.spec).toHaveProperty('creativeContent'); expect((await e.generate(r)).metadata.cached).toBe(true); expect(calls).toBe(2); });
test('A1: creative provider contract advertises supported fact references and recipes without changing defaults', () => { const a = generationPrompt(benchmark), b = generationPrompt({ ...benchmark, treatment: undefined }); expect(a.system).toContain('EXPLICIT CREATIVE-LED CONTRACT'); expect(a.user).toContain('f-topic-'); expect(b.system).not.toContain('EXPLICIT CREATIVE-LED CONTRACT'); expect(b.user).not.toContain('factIds'); });
test('A2: selected provider recipe remains selectable even outside local ranking', () => { const s = designSchemaV3.parse(planToSpec(fallbackPlan({ ...benchmark, taste: 'minimal-swiss' }), { ...benchmark, taste: 'minimal-swiss' }, 'deterministic-fallback')); s.artDirection.recipe = 'manifesto'; const c = compositionCandidates(s); expect(c[0].recipe).toBe('manifesto'); expect(c).toHaveLength(3); });
test('A2: explicit no-art wording uses intentional typography instead of a misleading visual', () => { for (const details of ['No illustration.', 'Please do not use illustrations.', 'Use typography only.', 'No graphics requested.']) {
    const r = { ...benchmark, details };
    const p = fallbackPlan(r);
    expect(p.artDirection.visual, details).toBe('none');
    expect(p.campaign.supportingText).not.toContain(details);
} });
test('M6A-bounded visual eligibility: unrelated workshops do not imply technology',()=>{const p=fallbackPlan({...benchmark,topic:'Ceramics workshop for neighbors.',details:''});expect(p.artDirection.visual).toBe('none');});
test('M6A-bounded subject: logistics alone do not manufacture a campaign',()=>{expect(()=>fallbackPlan({...benchmark,topic:'Create a poster.',details:'Venue: Hall A. Entry ₹150.'})).toThrow(/what you are announcing/);});
import {providerResponseSchema} from '../src/server/gemini';
test('M6A provider schema: default capabilities remain closed while explicit creative requests expose references and recipes',()=>{const legacy=JSON.stringify(providerResponseSchema({...benchmark,treatment:undefined}));const creative=JSON.stringify(providerResponseSchema(benchmark));expect(legacy).not.toContain('creative-led');expect(legacy).not.toContain('recipe');expect(legacy).not.toContain('factIds');expect(legacy).not.toContain('repair');expect(creative).toContain('creative-led');expect(creative).toContain('recipe');expect(creative).toContain('factIds');});
import {manifestoHeadline} from '../src/lib/design-engine/creative-layout';
test('M6A manifesto hierarchy changes word wrapping without changing supplied content',()=>{for(const title of ['Chai Junction','A neighborhood cycling meetup','Museum admission','Keep\nthis break','One','A sentence with more than six supplied words here'])expect(manifestoHeadline(title).replace(/\s+/g,' ')).toBe(title.replace(/\s+/g,' '));expect(manifestoHeadline('Chai Junction')).toBe('Chai\nJunction');});
