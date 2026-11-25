# M6-A1/A2 — fact-led creative planning and adaptive artwork candidate

25 November 2026. **Implemented and locally verified; ready for owner review, not formally accepted or deployed.** No artistic score is assigned. Owner-selected held-out briefs and the proposed 80/100 rubric remain unverified.

## Review entry points

- [Same-brief Chai Junction before/after, all three tastes](../test-results/m6a-review/index.html).
- [Twelve actual production-pipeline campaigns and all native downloads](../test-results/m6a-review/corpus.html).
- [Four integrated recipes, portrait and landscape](../test-results/m6a-review/recipes.html).
- [Machine-readable actual verification](../test-results/m6a-final/verification.json), [source fingerprint and read-only candidate review](../test-results/m6a-final/source-and-review.json), [artifact integrity inventory](../test-results/m6a-final/artifact-manifest.json).

These are local ignored evidence, not published pages. Contact sheets arrange actual downloaded PNGs; they are not substitute artwork, mockups or Creative Lab captures. Run the existing studio locally, select **Planning approach → Creative-led · fact-led recipes**, enter a brief/taste and use the local planner. Standard remains available. The local production server has inference disabled.

## Starting checkpoint and preflight

Started on clean `main` at **ca1b65736fe10fdef46bec5a2d2a62c6f5bd97a1**, empty index, one documentation commit ahead/zero behind. Actual read-only remote inspection confirmed private `MukulBeri/yarc-create`, remote main **e894bc1dca1af5b4a82e2b65d4721f16556827fc**. All 90 accepted baseline hashes matched **e52a30ea813e2d020cee173798797458b8802011fbef7a54496fcf0dabbaefac**. No Git history or hosted deployment was changed.

Read AGENTS, current source/contracts and relevant requirements, architecture, M5/closure, research and testing records; checked installed Next 16.4.6 component/CSS/route documentation. The new owner brief supersedes older authorization/scheduling statements in historical reports. M5-D remains an accepted **protected engineering baseline**, not public-release or final licensing clearance. No hosted authentication/configuration audit was repeated.

The original Creative Lab 1, Creative Lab 2 and M5 source-review ZIPs were hashed, extracted only under ignored `test-results/m6a-research`, and selectively inspected. Original ZIPs remain SHA-256 identical. Extracted TypeScript reference filenames gained `.reference` to prevent the application's broad TypeScript include from compiling isolated research; source bytes/archives were not edited. The sandbox initially could not inspect local listeners; an attempted server start was denied before binding. The existing workspace server was subsequently identified/reused, then replaced sequentially with inference-disabled local production builds. No second active workspace or deployment was created.

Before runtime edits, actual untouched M5 Chai Junction output was captured in `test-results/m6a-baseline`: three tastes, twelve native PNG downloads, three portable documents, actual generation JSON and studio captures. It reproduces literal task headlines and audience/tone/negative-instruction leakage. This is a new reproducible M5 baseline, not rewritten historical hosted evidence.

## Implementation and contracts

The pipeline is additive:

`explicit creative-led request → bounded structured interpretation → frozen public fact ledger → contextual plan + fact references → binding/semantic checks → recipe selection → existing measured v3 markup → existing PNG/HTML/JSON/HTTP output`.

### A1: interpretation, immutable facts and contextual copy

`creative-brief.ts` separates subject, communication objective, audience, tone, no-art preferences, planning constraints, missing information and recognized ambiguity. It reuses the accepted missing-information classifier. Complete clauses are classified; it does not delete negative keywords from public statements. Explicit input-side public-copy labels remain intentional data. Hostile instructions are quarantined; markup intentionally supplied as public text is escaped, never executed.

`fact-ledger.ts` strictly bounds up to 40 public clauses, stable `f-topic-*`/`f-details-*` identifiers and source field/start/end references. Offsets are JavaScript UTF-16 positions in the original request; text may undergo documented task-prefix/article/punctuation normalization or named-entity separation. These are provenance references, not a claim that every rendered clause is an unmodified source substring. Ledger arrays, entries and source references are frozen before planning. Dates, prices, names, negations, qualifiers and relationships remain supplied public content.

`creative-planner.ts` derives concise named-entity or subject titles without shipping lab slogans or evaluation answers. It moves recognized tone/audience/missing-input directions to interpretation metadata and chooses recipes/visuals from public subject and density. Ordinary named launches improve most; unnamed or complicated subjects can still receive literal noun-phrase titles. Explicit long headlines remain intact and can fail readable fitting honestly. Logistics without a concrete subject do not manufacture a campaign.

The provider's new opt-in plan supplies all fact IDs exactly once. The application binds omitted public clauses from its own ledger before the existing factual/claim/name/taste/contrast checks. Added checks reject reconstructed numeric clauses with swapped entity-price relationships and recognized negation reversals. A malformed reference cannot cause facts to disappear. The stored v3 creative content also requires all ledger clauses to remain visible, so manual copy edits cannot remove supplied facts. Changing the source brief requires regeneration; editing campaign-topic metadata does not recreate the ledger.

These are bounded English and factual heuristics, **not** general semantic understanding or proof against all contradictory implications. Multiple explicit locations are retained and flagged, not silently resolved. Unknown wording and ambiguous interpretation still require human review.

### Provider preparation and provenance

The existing Gemini integration advertises contextual copy, fact references and the four supported recipes only for explicit creative-led requests. The default provider JSON schema remains closed to the historical capability set: no recipe/fact IDs/creative treatment/new repair or sky illustrations. The cache key distinguishes default and opt-in requests. Existing activation policy, configured model, one repair, budgets, timeout, cache/concurrency and safe diagnostics remain. New diagnostics use static codes/paths, not raw provider bodies or unknown keys.

**Zero actual provider calls.** Injected success/repair/refusal/timeout/invalid-response/cache tests are mocks. Real creative-led Gemini acceptance, creative quality, latency, cost and reliability remain unverified. All prior measured live failures remain unchanged.

### A2: recipes, visuals and adaptive layout

Four actual recipe allocations resolve into the existing `ResolvedLayout`:

| Recipe | Structure | Adaptive behavior |
|---|---|---|
| Manifesto | Dominant stacked typography, deliberate rules, no reserved artwork region | Short multiword headlines split only at supplied word boundaries; full-width factual band; existing measured floors |
| Signboard | Framed expressive headline, supporting facts and a separate layered hero | Tall formats place artwork beside facts; landscapes use headline/hero above a full-width information band |
| Editorial | Image-first/modular editorial hierarchy | Portrait imagery above title/facts; landscape imagery beside the copy column; no-art shifts the text grid |
| Dossier | Compact title/visual above structured factual regions | Broad lower information region, format/density-aware columns, bounded type-only corrections |

Bold Street retains Anton, confident uppercase and strong framing; Minimal Swiss retains Inter, modular alignment and an alternate top-view illustration; Festive Pop retains Fredoka, rounded framing, celebratory layers and a lighter expression. All use existing approved palettes/fonts. Palette controls remain registry-owned. Recipe compatibility allows density and content to override taste preferences; legacy variant fields remain compatibility fields, while the creative recipe resolves the new geometry.

`CreativeVisual` selectively adapts original lab geometry: layered front-view beverage glass, alternate overhead cup, detailed robotic arm, scent ribbons, repair tool and astronomical illustration. Existing trusted subject visuals remain reusable. Drawings are conceptual; perfume uses scent movement rather than inventing a real bottle. No external artwork, image service, new font, executable model markup, filters or fragment-ID dependency was introduced. Unknown/unsuitable subjects use restrained abstract or type-only output. Generic nontechnical workshops no longer imply circuit imagery. No-art preferences are honored.

`candidates.ts` ranks up to three schema-validated composition alternatives from one base plan, preserving every campaign field, public ledger and original source. The selected recipe remains reachable even when outside local ranking. These are local **composition alternatives**, not independently generated creative concepts or persistent history. If no candidate is available, the current compatible campaign is retained.

### Canonical rendering and studio isolation

There is no v4 renderer or new endpoint. `AdvancedPosterMarkup`, existing fitting/correction, native refs, font readiness, revision handling, `renderCampaignDocument`, `exportPng` and `exportHtml` remain authoritative. Legacy v1/v2/v3 without creative treatment take their previous branches. The default request does not acquire creative content or recipes. New opt-in v3 specifications require the updated consumer; old strict clients should continue omitting the request option.

The studio adds only a planning-approach select and validated recipe selection. Draft treatment participates in changed-draft/stale-response handling. An unexpected response treatment is rejected while preserving the last valid campaign. Generation/refinement commits new revisions and measurements; exports remain locked while pending or unapplied. Composition changes preserve pending copy edits, restoring the accepted M3 workflow. Palette/copy/recipe edits make no new generation request. Inspection, enlargement, JSON and native exports retain canonical-ref isolation.

## Actual verification

Final production build: Next **16.4.6**, installed Node **24.22.3**, Windows/installed Chrome. Exact Chrome version and per-format measurements are in verification records. No package installation, model discovery or external asset acquisition occurred.

| Check | Actual result / record |
|---|---|
| ESLint | Pass; one pre-existing unused `path` import warning in untouched `tests/m5-release.spec.ts`; `m6a-commands/lint-candidate.*` |
| TypeScript | Pass; `m6a-commands/typecheck-candidate.*` |
| Production build | Pass; `m6a-commands/build-candidate.*`; all four existing API routes retained |
| Complete production regression suite | **130/130 passed**, 2.8 minutes; all original **92** plus **38** new cases; `m6a-commands/candidate-production.*` |
| Retained focused M5 development checks | **15/15 passed**, 19.7 seconds; `m6a-commands/m5-dev-final.*`; these are part of the 92, not 15 additional distinct old tests |
| Focused final intelligence checks | **22/22 passed**; `m6a-commands/intelligence-candidate.*` |
| Provider/validation focused protection | **41/41 passed**, injected mocks and quota-free UI; `m6a-commands/provider-contract-final.*` |
| Whitespace and scoped security/artifact review | Pass; final source-and-review record; empty index |

All command/log references above are under ignored `test-results`. Existing eleven regression source files are hash-identical to the accepted baseline. Tests were neither removed nor weakened. Normal global setup requires `X-Campaign-Inference: disabled`, null model and zero attempts before any auto-mode regression. Fresh directories preserve older M0–M5 evidence and earlier M6 failures.

### Artwork/export evidence

The final corpus has **twelve actual local campaigns**: Chai Junction in all three tastes; established robotics, perfume, environment and repair briefs; five new synthetic generalization subjects (pottery, library exchange, cycling, theatre auditions, pet-adoption information). Evaluation inputs live separately in `evaluation/m6a-corpus.ts`, not production rules. New subjects are not owner-held-out acceptance.

- **52 actual native PNG downloads**: 48 across twelve campaigns plus four from manual Manifesto selection. All four exact native dimensions verified.
- **13 portable HTML downloads and 13 validated JSON downloads** for committed selections; **12 actual /api/render HTML documents**, retaining the existing envelope and browser-readiness contract.
- Chai: 3 tastes × 4 formats = 12. Five new subjects: 5 × 4 = 20. All four recipes have four-format evidence; overlap avoids artificial duplication.
- Maximum actual PNG/native-DOM changed-pixel ratio: **0.012805213 (1.281%)**, within unchanged **0.015** at channel delta >20.
- Offline HTML/native DOM and API HTML/native DOM: **0 changed pixels above delta 8**, within unchanged **0.001** threshold on these cases.
- All 48 base campaign format checks have no blocking issues and need no structural correction. Manifesto's four checks pass. Dense/impossible fixtures separately prove refusal, with content retained.
- All ledger clauses are checked in each of the 48 base artboards. Native fact-sensitive robotics retains subject/student audience, 12 teams, complete date, time/IST, Lab A, ₹150 and exact registration URL.
- Offline consumers block HTTP requests; the twelve base portable/API consumer records report zero external requests. Manifesto portable HTML also renders with HTTP blocked and matches native output. Fonts and applicable notices remain embedded. No-script/missing-font/CSP/refusal protections remain in the retained regressions.
- Actual studio screenshots, three Chai mobile states and the original responsive/modal/keyboard checks are retained. No full branding/frontend redesign or new accessibility certification is claimed.

The comparison environment is local Windows/Chrome. These measurements do not establish universal browser/device fidelity, every-glyph font attribution, artistic quality or production Vercel behavior.

### Chai Junction before/after

Before: the untouched M5 headline is the full task, “Launch campaign for a new campus chai stall called Chai Junction.” Audience, tone and negative constraints also appear in supporting copy.

After: **Chai Junction**, with **new campus chai stall** as kicker. Public copy retains **Masala chai ₹15. Opening on 28 November 2026 at 4 PM near the IET entrance.** Audience/tone/constraints stay interpretation metadata. Bold Street uses a framed front-view hero, Swiss an editorial overhead cup, Pop rounded celebratory styling. The same supplied facts remain across all four formats. [Actual comparison](../test-results/m6a-review/index.html), [contact sheet](../test-results/m6a-review/index-contact-sheet.png).

## Retained failures and corrections

1. Initial focused run: **16/18 passed**. The new alert selector matched Next's announcer as well as the application's alert; it was scoped appropriately. Cycling LinkedIn portable HTML differed by 0.2306% at delta >8. Native-pixel tracking for creative text resolves the reproduction; legacy typography and comparison tolerances remain unchanged. Failed runs/captured comparisons remain under `m6a-integrated-dev-01`, `m6a-cycling-dev-04/05/06` and the preflight investigation JSON.
2. First build exposed unsupported regex dotAll syntax under the existing TypeScript target; replaced it with an equivalent character class, without changing compiler configuration. Original failed build logs remain.
3. First complete production run: **125/126 passed**. Disabling composition selection during pending copy edits broke the accepted workflow. Restored the control behavior and retained the original regression unchanged.
4. Two explicit failing bounded reproductions established unrelated-workshop circuit selection and logistics-only subject invention. Narrow eligibility/subject corrections pass the retained new tests. No fact or negative clause was deleted to pass them.
5. A hostile public-text fixture exposed over-conservative title normalization in a numeric/contact-bearing clause. Such clauses now retain exact supplied headline text instead of being reconstructed; escaped data and strict fact guards remain.
6. Next full run: **127/128 passed**. Additional Manifesto export coverage exposed a 1.7487% YouTube PNG mismatch. Controlled DOM-style trials and captured export SVG show intended font sizes intact; exact browser rasterization internals remain uncertain. Alignment/line-height/root-style trials did not resolve it. Bounded word-preserving stacked Manifesto headlines improve hierarchy and produce verified exports: YouTube **0.8675%**, all four below threshold. The correction is measured before export, never hidden font scaling or threshold relaxation. Original failure, SVG capture and explicitly labelled diagnostic perturbations remain under `m6a-full-production-final` and `m6a-manifesto-*-investigation`.
7. The final **130/130** run includes default-provider capability isolation, word-preserving headline wrapping and the corrections above. Earlier failures are not relabelled passing or historical Gemini evidence.

## Acceptance-criteria matrix

“Pass” below means the bounded implemented/evaluated behavior, not universal semantics or owner artistic approval.

| A1 criterion | Status | Evidence/limit |
|---|---|---|
| 1. Supported subject/objective extraction | Pass | Corpus, named launch, incomplete/logistics-only tests |
| 2. Task instructions removed from ordinary titles | Pass for evaluated framing | Named-launch/task-prefix tests; some unnamed titles remain literal noun phrases |
| 3. Known instruction leakage | Pass in evaluated cases | Missing/audience/tone/negative-direction tests and actual Chai/environment copy; unfamiliar phrasing remains a risk |
| 4. Required public facts | Pass | Ledger binding, strict spec checks, all 48 base formats |
| 5. Relationships and qualifiers | Pass for evaluated cases | Exact clauses, swapped-price rejection, venue-change/qualification tests; no universal semantic proof |
| 6. Legitimate negative facts | Pass | Certificates, not-free entry, bags restriction, chairs and other retained negatives |
| 7. No unsupported claims in evaluated outputs | Pass for evaluated corpus | Supplied/synthetic public facts, existing claim/name checks; novel implications remain heuristic |
| 8. Missing details not fabricated | Pass | Missing metadata and honest incomplete-input behavior |
| 9. Vague/conflicting/malformed/hostile inputs | Pass for evaluated cases | 422 without a subject; conflicts retained/flagged; strict requests; escaped data and honest refusal |
| 10. Honest provenance/fallback | Pass | Actual local null model/zero attempts; manual refinements; separate mock records |
| 11. Validation/legacy contracts | Pass | All 92 retained regressions; strict opt-in/default schema and renderer checks |
| 12. Mock failure/refusal/repair/timeout | Pass | Injected providers, one-repair/budget tests; no real model claim |

| A2 criterion | Status | Evidence/limit |
|---|---|---|
| 1. Four distinct recipes | Pass | Four-format layout assertions and actual exports |
| 2. Three differentiated tastes | Implemented; owner artistic judgment pending | Same-brief 12-output comparison, approved type/palette and alternate visuals |
| 3. Relevant visuals/type-only | Pass for corpus | Actual cup/robot/scent/bottle/repair and safe unknown-subject output |
| 4. Unknown/no-art handling | Pass for evaluated cases | No-art actual HTML, unrelated workshop regression |
| 5. Dense readable facts | Pass within capacity | Corpus facts retained at unchanged floors; impossible composition refuses |
| 6. Exact native dimensions | Pass | All 52 actual PNG headers verified |
| 7. Minimum type floors | Pass | Existing floors retained, measured sizes recorded |
| 8. No blocking geometry in accepted corpus | Pass | Actual reports; separate refusal fixtures preserved |
| 9. Contrast/correction limits | Pass | Existing contrast/floors/three-pass budgets unchanged |
| 10. Production PNG fidelity | Pass for evaluated exports | 52 downloads; unchanged 1.5% threshold; original failures preserved |
| 11. Portable HTML | Pass | Embedded approved fonts/notices, blocked-network consumers, parity |
| 12. Shared studio/API/export rendering | Pass | Twelve actual API documents and four-format comparisons; no second renderer |
| 13. V1/V2/V3 compatibility | Pass | Original regressions and retained artwork comparisons |
| 14. Candidate/revision behavior | Pass | Selected candidate retained; pending edits preserved; unexpected treatment rejected; canonical export guards |
| 15. Trusted markup/dependencies | Pass | Authored JSX/SVG only; manifests/assets/licenses unchanged |
| 16. Owner visual evidence | Delivered; acceptance unverified | Native downloads, review gallery, no invented score or held-out acceptance |

## Remaining limitations and next integration

The deterministic writer remains conservative: named launches improve substantially, but perfume, repair, pet-adoption and other unnamed campaigns can retain literal or long titles. Short/type-only outputs can still have large quiet areas. The original illustrations are a limited library, not general product visualization. Taste variation is real but does not prove professional finish or meet the proposed artistic score automatically. Owner review should specifically judge those weaker outputs, supporting-copy readability at feed size and whether whitespace is intentional.

English classification, complete-clause binding and selected claim/negation checks cannot resolve all language, ambiguity, conflicting facts or unsupported implications. Explicitly conflicting locations remain visible with a review warning. Over 40 public clauses exceed the bounded interpreter and currently reach a generic safe request failure rather than a tailored editing flow. Unknown glyphs still require system-font warnings. Nothing here establishes fresh Gemini quality, Vercel parity, global quota enforcement, final distribution/license clearance, evaluator access or public release.

For M6-B/C, reuse `creativeContent`, recipe IDs and `compositionCandidates` as the contract; keep one canonical native artboard per format and revision-specific readiness. Composition variants must retain their local-derivation label. New source facts require regeneration; do not mutate a published ledger to accommodate copy edits. Current compatibility-variant rationale text on manual refinement remains generic; the actual selected recipe is authoritative in `artDirection.recipe` and should receive clearer wording in future presentation work. Full brand/frontend design, persistent creative history/comparison, independently AI-generated alternatives, generated imagery and provider activation remain separately gated.

Rollback for immediate operation is **Standard** or omitting `treatment` in HTTP requests. The accepted local checkpoint remains the Git rollback boundary. No reset/restore/rewrite was executed; any later disposal of uncommitted candidate files must be owner-reviewed. Existing M5 protected deployment remains unchanged.

## Exact file inventory and Git state

Candidate: **18 modified tracked files + 11 new files = 29 files**, zero staged. Generated evidence/extracted research stays ignored. Package manifests/lockfile, environment files, approved font/asset bytes, licenses/notices, historical reports/evidence and existing test sources are unchanged.

Modified:

```text
AGENTS.md
README.md
docs/AI_DISCLOSURE.md
docs/API.md
docs/ARCHITECTURE.md
docs/RESEARCH.md
docs/ROADMAP.md
docs/TESTING.md
src/components/advanced-poster-markup.tsx
src/components/studio.tsx
src/lib/design-engine/layout.ts
src/lib/design-engine/registry.ts
src/lib/design.ts
src/lib/generation/contracts.ts
src/lib/generation/diagnostics.ts
src/lib/generation/planner.ts
src/server/engine.ts
src/server/gemini.ts
```

New:

```text
docs/M6A_REPORT.md
evaluation/m6a-corpus.ts
src/components/creative-visual.tsx
src/lib/design-engine/candidates.ts
src/lib/design-engine/creative-layout.ts
src/lib/generation/creative-brief.ts
src/lib/generation/creative-planner.ts
src/lib/generation/fact-ledger.ts
tests/m6a-artwork.spec.ts
tests/m6a-integration.spec.ts
tests/m6a-intelligence.spec.ts
```

Runtime/test fingerprint: **3e4ff61557361f38c852ebcbe0f83f014b9e222c2897a31079ff424cef5f5405**, SHA-256 of the sorted 100-file `{file,sha256}` inventory (the accepted 90 plus ten new source/evaluation/test files). Documentation is recorded separately and does not recursively enter this fingerprint.

`main` remains at ca1b657, one ahead/zero behind the existing origin/main reference. Read-only source review finds no credential patterns, unnecessary personal absolute paths, dependency/configuration changes, generated artifacts or historical-evidence files in the candidate. No staging, commit, push, deployment/redeployment, inference activation/call, dependency installation, external archive modification, visibility/license change, submission or subsequent workstream implementation occurred. Stop at owner review.
