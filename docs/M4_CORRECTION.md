# M4 focused public-copy correction

25 November 2026. **The confirmed environmental copy defect is corrected and quota-free verification passes. Candidate ready for final owner review; M4 acceptance is not declared.** No additional live provider call was made. The original [M4 report](M4_REPORT.md), [live report](M4_LIVE_VERIFICATION.md), completed journal, defective artwork and all 565 original M4 evidence records are preserved unchanged.

## Starting state and root cause

Read-only preflight confirmed main at accepted M3 `e52258fcf054de89844d02c2d7cba315812f264e`, 23 modified tracked files + 26 additions = 49 candidates, zero staged. Every prior candidate hash matched the live-closure audit; all source hashes matched fingerprint `3b2d03c6ee7c45ae634819c4ba7875afefa00338edf34b056a3d02c195e0935d`. Original 523 + 42 evidence records verified by SHA-256 and size before editing. Existing changes were preserved. Actual source, reports, governance and the installed Next route-handler guide were read.

`brief.ts` used separate field lists for missing-input declarations and “No supplied …” shorthand. The latter omitted `organization name` and `event date`. Because compound recognition was anchored to the complete list, the exact environmental declaration was classified as public content and copied into support. This is a classification defect, not a renderer/export failure. The new regression was run **before the fix** and failed on the exact leaked text; its planner JSON, log and failure trace remain in `test-results/m4-correction-before-01` and the adjacent log.

A subsequent regression exposed a related false rejection: `Organization name and event date have not been provided yet.` was correctly classified as metadata but the raw-input factual guard treated its `event … have not` wording as a required public negative. This is a reproducible synthetic finding, not an explanation retroactively attributed to the original Gemini response.

## Precise changes

- `brief.ts`: one bounded field/list grammar covers both declaration forms, recognized field nouns, commas, conjunctions and line-wrapped declarations. It adds narrowly defined nouns including organization/organisation name and event date/time. Only complete recognized declarations move to metadata. Unknown nouns and ordinary negatives remain content. Input-side explicit copy labels remain authoritative; model-authored labels cannot authorize their own leak.
- `planner.ts`: factual/name checks use shared interpreted public content so metadata is not falsely required in artwork. The underlying factual-token, negative, correction, claim, name and registry checks remain in force. A new semantic `planning-instruction-in-copy` rejects recognized declarations/directions in model artwork instead of silently deleting model text. Both advanced and historical creative-plan paths use it. An explicit `eyebrow: undefined` in the existing headline-override branch resolves a TypeScript union error without changing output.
- `gemini.ts`: prompt data now includes the same bounded brief interpretation, distinguishing public content, missing fields, directions and explicit copy. Prompt guidance explains those fields. Provider transport, model/configuration, credentials, retries, budgets, concurrency/cache and one-repair maximum are unchanged. Automatic fallback already uses the same independent planner.
- `facts.ts` / `diagnostics.ts`: future missing-token failures can carry optional static categories: date, time, timezone, currency, quantity, url, contact, identifier. These derive from the same unmatched-token calculation and do not alter acceptance. Strict metadata permits at most eight categories; repair guidance receives category names only. No private values, rejected plan, unknown field name or provider body is added. Historical envelopes without categories remain valid.

No studio, artwork engine, registry, font, asset, export or dependency implementation changed in this correction. V1/v2/v3 compatibility and existing quality/fidelity thresholds remain intact. The accepted Tabler trial was not repeated.

## Before and after

Exact environmental topic: `Campaign to reduce plastic waste.` Details: `Encourage people to bring a reusable bottle. No supplied statistics, organization name or event date.` Taste: Bold Street.

The headline remains `Less plastic. / More possibility.` Previously, support contained all three supplied sentences, including the missing-field declaration. Corrected public support is:

```text
Campaign to reduce plastic waste.
Encourage people to bring a reusable bottle.
```

`No supplied statistics, organization name or event date.` is now retained in `interpretation.missingInformation` and response warnings. It is absent from every native artwork. Street Stack, Street Acid and the original botanical bottle/leaves remain functional. No statistic, organization, date or factual environmental promise was added. The original sentence remains visible in the input controls and technical metadata when inspected; those are distinct from published artwork.

The exact robotics request preserves students, **12 teams**, **26 November 2026**, **18:30 IST**, **Lab A**, **₹150** and **https://example.org/workshop** in all four formats. Minimal Swiss, Swiss Grid/Ice and original robot art remain. No certificates, prizes, sponsors or additional eligibility/schedule claims were observed.

Both new campaigns are actual **requested-local** results: deterministic-fallback provenance, null model and empty attempts. Injected-provider fixtures separately verify initial leakage rejection, one successful mocked repair, repeated rejection followed by honest automatic fallback, and zero provider invocation in explicit local mode. Mocked `source=gemini` is a test envelope, not a fresh model measurement.

## Actual artwork and exports

[Environment before/after, all four native downloads](../test-results/m4-correction-artwork-final-02/environment-before-after.png) compares the untouched defective live-attempt fallback on the left with the corrected explicit local result on the right. [Robotics, all four native downloads](../test-results/m4-correction-artwork-final-02/robotics-four-formats.png) shows the exact logistics. Sheets compose actual downloads with labels; they are not generated mockups. Native artwork and the actual environmental studio were visually inspected. Automated visible-text assertions inspect all eight native canvases.

- Environment: [actual studio](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-studio.png), [mobile](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-mobile.png), [portable HTML](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment.html), [downloaded JSON](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-spec.json).
- Robotics: [actual studio](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics-studio.png), [portable HTML](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics.html), [downloaded JSON](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics-spec.json).

| Format | Native pixels | Environmental PNG | Robotics PNG | PNG vs native DOM, environment / robotics |
|---|---|---|---|---|
| Instagram portrait | 1080 × 1350 | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-instagram-portrait.png) | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics-instagram-portrait.png) | 0.53189% / 0.74664% |
| Instagram square | 1080 × 1080 | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-instagram-square.png) | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics-instagram-square.png) | 0.66487% / 0.93330% |
| YouTube thumbnail | 1280 × 720 | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-youtube-thumbnail.png) | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics-youtube-thumbnail.png) | 0.84288% / 1.01053% |
| LinkedIn landscape | 1910 × 1000 | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-environment--4e3c9-unchanged-export-thresholds/environment-linkedin-landscape.png) | [Download](../test-results/m4-correction-artwork-final-02/m4-correction-robotics-cor-22a7f-unchanged-export-thresholds/robotics-linkedin-landscape.png) | 0.73890% / 0.08539% |

All actual downloaded PNGs have exact dimensions. Comparison uses corresponding unscaled native DOM at integer origin, unchanged **≤0.015 changed pixels / any RGBA delta >20**. Both offline HTML files contain all four native formats, embedded approved fonts and zero external runtime requests; all eight offline DOM comparisons are **0** changed pixels above delta 8, passing unchanged **≤0.001**. JSON downloads exactly equal the validated rendered response spec. Fit/font/bounds/overlap/contrast diagnostics report no issues or corrections in all eight canvases; measured fonts are loaded, meet their floors and fit both axes. Environment: Windows headless Chrome **158.0.8127.88**, scale 1. These checks do not establish universal fidelity, factual truth, artistic quality or WCAG certification.

## Executed verification

Commands below reuse the existing server and installed tools. Each output directory is fresh; original evidence is never used as runner output. UTF-8 command/result logs are adjacent to each named run; early PowerShell logs retain their original UTF-16 encoding.

| Command | Result / isolated output |
|---|---|
| `npx playwright test tests/m4-copy-correction.spec.ts --output=test-results/m4-correction-before-01` | Intentional 1 failure before implementation; exact defect reproduced |
| Focused correction test, outputs `m4-correction-focused-01`, `-02`, `-03` | First 4 pass/1 fail exposed metadata/public-negative false rejection; next 5 pass; final 5 pass including line-wrapped list |
| `npx playwright test --output=test-results/m4-correction-full-final-02` | **77 passed, 1.3m**: all existing 72 source cases unchanged + five new correction cases |
| `npx playwright test --config=evaluation/m4-artwork.config.ts --output=test-results/m4-correction-corpus-01` | **11 passed, 33.3s**; corpus/all tastes/four formats plus historical v3 raster compatibility |
| `npx playwright test --config=evaluation/m4-edge.config.ts --output=test-results/m4-correction-edge-01` | **10 passed, 11.7s**; dense/unsafe/negative/corrected/unconfirmed logistics and incomplete input |
| `npx playwright test --config=evaluation/m4-correction.config.ts --output=test-results/m4-correction-artwork-final-02` | **2 passed, 11.3s**; two exact actual local briefs, eight PNGs, two HTML/JSON and original fidelity thresholds |
| `npm run lint` | Pass, final log `test-results/m4-correction-lint-final-02.log` |
| `npm run typecheck` | Pass, final log `test-results/m4-correction-typecheck-final-03.log` |
| `npm run build` | Pass, final log `test-results/m4-correction-build-final-02.log` |

New cases include the exact failure; equivalent compound and single-field declarations; mixed facts/directions; `No certificates.`, `No entry fee.`, `No organization has endorsed this campaign.`; explicit Public copy overrides; corrected/unconfirmed venues; exact names/dates/time/currency/quantities/URLs; strict mocked AI leakage/repair/fallback; static missing-fact categories and old diagnostic compatibility. Unknown noun lists remain public rather than being partially deleted. Subjectless briefs remain honestly incomplete before dispatch.

Earlier correction full run also passed 77, and first actual artwork run passed two. Final full/artwork runs followed the additional line-wrapped-list coverage; no quality assertion was weakened. Initial typecheck exposed the union error described above; its failed log is preserved. Later checks pass. Corpus/edge runs preceded only that whitespace-recognition extension, which final regressions explicitly exercise. No unrelated benchmark, new live call or repeated artistic trial occurred.

## Integrity, review and inventory

Separate [verification](evidence/m4/correction/verification.json) and [artifact manifest](evidence/m4/correction/artifact-manifest.json) record exact source fingerprints, executed commands, actual result/quality data, hashes/sizes/provenance and candidate paths. Raw downloads/screenshots/logs remain in ignored isolated directories; no external archival copy was made. All original 565 records are checked again, as are original reports/compact records against the preflight snapshot. Original provider call accounting remains **three calls: one semantic rejection + two HTTP 503s; zero fresh accepted plans; two independent fallback results**. The authorization is closed; this correction consumes zero more calls.

Read-only review checks the candidate inventory, configured-secret matches without printing values, client output, protected implementations/licenses/dependencies, JSON, local documentation links and whitespace. This is a scoped review, not a complete public-release security/licensing audit. Exact final findings and combined file inventory follow below.

## Remaining limitations and recommendation

Recommend final M4 acceptance for the initial release within the owner-approved artistic scope, subject to this review. The observed fallback defect and demonstrated metadata false rejection are fixed with separate evidence. Fresh live Gemini acceptance of either M4 brief remains unproven. The original robotics omitted fact cannot be recovered; new category diagnostics operate only on future validations. HTTP 503 cause, complete token use and monetary cost remain unknown. No reliability improvement is inferred from mocked repair.

Interpretation remains a bounded English grammar; unfamiliar missing-input phrasing may remain ambiguous. Explicit copy labels deliberately permit supplied wording. Factual and named-entity heuristics still have false positives/negatives and do not prove meaning or truth. Dense-copy refusal, social-scale readability, cross-device fonts/browser behavior, production provider/process-local limits and distribution notices remain the existing review/M5 concerns. There is no new asset, typography, studio or artwork redesign.

No stage/commit/push/history rewrite, deployment, environment/model/provider/billing/quota/infrastructure change, dependency installation, external archive operation or M5 implementation occurred. Stop at final M4 owner review.

<!-- CORRECTION-FINAL-INVENTORY -->

Final combined candidate: **23 modified tracked + 32 new = 55 files**, zero staged, main/HEAD unchanged. This correction changes 12 existing candidate files and adds 6 files. All **565** original artifact records and 8 protected reports/compact records verify unchanged. New manifest: **402 records, 54,768,574 bytes**, each size/SHA-256 verified. Scoped audit: no findings; configured-secret comparisons are internal, 11 compiled client files checked, and Git whitespace check passes. Provider transport, runtime controls, artwork/studio/registry/fonts/licenses/dependencies and all existing regression sources remain unchanged relative to the correction starting state.

Exact combined inventory:

- modified: .gitattributes
- modified: AGENTS.md
- modified: docs/AI_DISCLOSURE.md
- modified: docs/API.md
- modified: docs/ARCHITECTURE.md
- new: docs/evidence/m4/artifact-manifest.json
- new: docs/evidence/m4/asset-trial.json
- new: docs/evidence/m4/correction/artifact-manifest.json
- new: docs/evidence/m4/correction/verification.json
- new: docs/evidence/m4/live/artifact-manifest.json
- new: docs/evidence/m4/live/journal.json
- new: docs/evidence/m4/live/verification.json
- new: docs/evidence/m4/verification.json
- new: docs/example-design-spec-m4.json
- new: docs/licenses/Tabler-MIT.txt
- new: docs/M4_CORRECTION.md
- new: docs/M4_LIVE_VERIFICATION.md
- new: docs/M4_REPORT.md
- modified: docs/REQUIREMENTS.md
- modified: docs/RESEARCH.md
- modified: docs/ROADMAP.md
- modified: docs/TESTING.md
- modified: eslint.config.mjs
- new: evaluation/m4-artwork.config.ts
- new: evaluation/m4-artwork.spec.ts
- new: evaluation/m4-compatibility.spec.ts
- new: evaluation/m4-corpus.ts
- new: evaluation/m4-correction.config.ts
- new: evaluation/m4-correction.spec.ts
- new: evaluation/m4-edge.config.ts
- new: evaluation/m4-edge.spec.ts
- new: evaluation/m4-live-verification.config.ts
- new: evaluation/m4-live-verification.spec.ts
- new: evaluation/m4-tabler.config.ts
- new: evaluation/m4-tabler.spec.ts
- modified: playwright.config.ts
- modified: README.md
- modified: src/components/advanced-poster.tsx
- new: src/components/subject-visual.tsx
- new: src/components/tabler-camera.tsx
- modified: src/lib/design-engine/layout.ts
- modified: src/lib/design-engine/quality.ts
- modified: src/lib/design-engine/registry.ts
- new: src/lib/design-engine/subject-layout.ts
- new: src/lib/design-engine/tabler-asset.json
- modified: src/lib/export.ts
- modified: src/lib/generation/brief.ts
- modified: src/lib/generation/diagnostics.ts
- new: src/lib/generation/editorial.ts
- modified: src/lib/generation/facts.ts
- modified: src/lib/generation/planner.ts
- modified: src/server/gemini.ts
- new: tests/m4-copy-correction.spec.ts
- new: tests/m4-engine.spec.ts
- modified: THIRD_PARTY_NOTICES.md
