# M4 bounded live Gemini verification

25 November 2026. **Two campaigns completed, three actual provider invocations, zero accepted fresh Gemini plans.** Both final campaigns are independent deterministic fallback. The renderer/export checks passed, but Campaign B fails public-copy acceptance. No more calls will be made under this completed two-campaign authorization.

## Starting state and authorized method

Verified main at accepted M3 `e52258fcf054de89844d02c2d7cba315812f264e`: 23 modified tracked files, 20 additions, 43 total candidates, zero staged. Source fingerprint `3b2d03c6ee7c45ae634819c4ba7875afefa00338edf34b056a3d02c195e0935d` matches every recorded source hash; all **523** original M4 manifest artifacts remain size/SHA-256 identical. Read M4_REPORT, engine/provider/runtime budget controls, facts/diagnostics and actual studio/export paths. Owner approval of quota-free implementation and initial-release artistic quality remains recorded; full M4 closure is pending this review.

Used the actual studio Generate campaign action and existing /api/generate → configured provider → validation/single repair → committed result → native export path. Both briefs were exactly as authorized, auto mode, uncached results; no model discovery, health probe, warm-up, response replay, manual copy refinement or extra demonstration. Model **gemini-3.5-flash-lite** was privately read from local configuration and confirmed by actual response metadata. Model/provider/key/budgets/cache/concurrency/billing were unchanged. The engine's at-most-two attempts and one-fetch/no-retry transport bound the two application requests to at most four invocations. A completed exclusive journal and pre-run guards prevent repetition; it is preserved unchanged.

One initial harness launch failed its worker-level output-directory guard before test execution/journal creation (0 ms, zero application/provider requests). This is retained in m4-live-verification-01, not counted as a provider failure. The worker guard was scoped correctly and a fresh directory 02 used; no evidence was erased. The successful collection harness passed one test in 14.6 s. That pass means limit/evidence collection completed, not model acceptance. Typecheck and focused harness lint passed before dispatch; test listing made no calls. No broad regression/artistic benchmark was repeated. After the usage interruption the completed journal was inspected, not restarted; zero additional calls occurred.

## Exact provider accounting

| Call | Campaign | Attempt | Observed outcome | Attempt elapsed | Available usage |
|---|---|---|---|---:|---|
| 1 | A, Minimal Swiss robotics | Initial | Parsed provider response, STOP; semantic validation rejected missing-supplied-fact at $ | 2,489 ms | Input 1,111; output 508; total 1,619 |
| 2 | A | One authorized repair | provider-unavailable, **HTTP 503**; no replacement plan available for validation | 1,933 ms | Unavailable |
| 3 | B, Bold Street environment | Initial | provider-unavailable, **HTTP 503** | 1,681 ms | Unavailable |

**3/4 maximum calls used: two initial calls + one repair; zero extra retries.** One call remains numerically unused, but both authorized campaigns have run and it is not permission for another request. B correctly received no repair/retry for transport-level unavailability. Both application endpoints returned HTTP 200 with truthful fallback envelopes; that is separate from provider acceptance/status.

Attempt elapsed includes transport, parsing and validation—not isolated model inference latency. A: browser response **4,457 ms**, engine total **4,426 ms**, renderer-ready gate **4,839 ms**. B: browser response **1,709 ms**, engine total **1,682 ms**, renderer-ready gate **1,922 ms**. Browser-ready includes actual font/layout waiting and polling, not a fabricated progress stage.

Only call 1 exposes usage. Thinking is application-reported as zero, but the transport defaults absent counters to zero, so its original presence is unverified. The HTTP 503 calls have no exposed usage; **1,619 is a known partial total, not all-call consumption**. Billing/monetary cost and complete usage are unknown; no cost estimate or zero-cost claim is made.

## Model acceptance, safe diagnostics and uncertainty

A initial: structural parsing succeeded sufficiently for semantic validation; safe diagnostics report **semantic / missing-supplied-fact / $**, not a structure/schema failure. The exact unmatched token and rejected copy were not retained/exposed; no conclusion about the particular missing date/count/fee/URL or a possible valid-paraphrase false rejection can be established. Do not speculate or weaken the guard. The repaired plan was not evaluated because that request returned 503.

The two HTTP 503s support the application's provider-unavailable classification. Error bodies were not retained, so no global outage, quota exhaustion, authentication error or billing cause is asserted. They are not observed 429/401/403 responses. No more requests were made to diagnose availability. Original M2 records and their unrecoverable exact failure cause remain unchanged.

**Fresh Gemini acceptance: 0/2 campaigns.** Both have cached=false, nonempty real attempt metadata and the configured model identifier. Final specs/provenance are deterministic-fallback. No accepted model art-direction choice or fresh live model creative quality is established by these fallback artifacts.

## Factual and creative inspection of actual fallback outputs

**A:** All four native exports preserve robotics workshop subject, students, 12 teams, 26 November 2026, 18:30 IST, Lab A, ₹150 and exact https://example.org/workshop URL. No extra certificates, prizes, sponsors, schedules or eligibility conditions were observed. Native robot artwork, Minimal Swiss swiss-grid/swiss-ice and grouped logistical hierarchy are coherent across four formats. These are successful independent fallback decisions, not accepted/repaired Gemini choices.

**B:** All four preserve the reusable-bottle action, relevant original botanical bottle/leaves, Bold Street street-stack/street-acid and concise “Less plastic. More possibility.” headline. No invented numerical statistics, dates, organization or unsupported factual environmental claim was observed. However all four artwork formats incorrectly contain the exact planning declaration:

> No supplied statistics, organization name or event date.

This is **a public-copy acceptance failure**. The earlier quota-free corpus used a shorter “No supplied statistics” declaration; the newly authorized compound wording exposes an allowlist gap. Static inspection of brief.ts confirms that organization name and event date are absent from suppliedField; its anchored list rule does not recognize the whole declaration, so it enters content and supportingText. The condition is already demonstrated by these actual fallback outputs; no extra generation is needed. B is **not publish-ready**, despite passing geometry/fidelity. No corrected artwork was substituted.

Narrow justified follow-up, **not implemented here**: recognize the exact missing-field nouns/compound grammar and add a regression for B, metadata/UI-warning retention, legitimate public negatives such as “No certificates”/“No entry fee”/“No organization has endorsed this campaign”, and explicit Public copy override. Avoid broad keyword deletion or any relaxation of factual validation. Optional future diagnostics could expose static missing-fact categories without private values; they cannot retroactively recover this rejected plan.

## Native export and offline verification

Collected **eight actual PNG downloads**, two portable HTML files, two downloaded validated DesignSpecs, two actual studio and two mobile screenshots, native DOM captures and offline captures. Exports came from each committed result with no manual edits or additional generation. JSON downloads exactly match the validated response spec; all per-format visible copy was inspected using its measured text groups (not concatenated block text that could join unrelated words).

| Native format | Dimensions | A PNG-vs-native-DOM changed pixels | B PNG-vs-native-DOM changed pixels |
|---|---|---:|---:|
| instagram-portrait | 1080 × 1350 | 0.74664% | 0.86056% |
| instagram-square | 1080 × 1080 | 0.93330% | 1.07570% |
| youtube-thumbnail | 1280 × 720 | 1.01053% | 1.28309% |
| linkedin-landscape | 1910 × 1000 | 0.08539% | 0.73895% |

All eight meet unchanged **≤1.5% changed pixels / any RGBA channel delta >20**, compared with corresponding unscaled native DOM at integer origin. Both offline HTML files contain four native formats and embedded approved fonts, load with zero external runtime requests and pass **≤0.1% / delta >8** in all eight corresponding raster comparisons (zero pixels changed above that threshold). This is separate from downloaded-PNG fidelity and not universal device equivalence.

Existing measured readiness, horizontal/vertical fit, bounds, essential-text/hero and sibling overlap, minimum-font and basic text-contrast checks report no issues/corrections in all eight formats; font status is loaded and every measured text field meets its original floor. This does not certify artistic or factual quality. **B demonstrates why green geometry checks cannot certify public-copy suitability.** Environment: Windows headless Chrome 158.0.8127.88, deviceScaleFactor 1. Existing broader browser/script/accessibility/production limits remain.

## Actual evidence and integrity

- [All eight actual fallback downloads, labelled review sheet](../test-results/m4-live-verification-02/fallback-review-sheet.png)
- A: [studio](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/A-robotics-studio.png), [native portrait](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/A-robotics-instagram-portrait.png), [native landscape](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/A-robotics-youtube-thumbnail.png), [portable HTML](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/A-robotics.html), [validated JSON](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/A-robotics-spec.json)
- B: [studio with retained copy defect](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/B-environment-studio.png), [native portrait with retained defect](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/B-environment-instagram-portrait.png), [native landscape with retained defect](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/B-environment-youtube-thumbnail.png), [portable HTML](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/B-environment.html), [validated JSON](../test-results/m4-live-verification-02/m4-live-verification-exact-e0fc5--repeat-an-existing-journal/B-environment-spec.json)
- [Original completed execution journal](evidence/m4/live/journal.json), [derived verification/fact assessment](evidence/m4/live/verification.json), [artifact integrity manifest](evidence/m4/live/artifact-manifest.json)

42 selected new evidence records, 5,337,214 bytes, have explicit sizes/SHA-256 and provenance. Source/destination archiving is not performed; these are local evidence hashes. All 523 prior M4 artifacts are unchanged. The original journal, failure, screenshots and uncorrected exports are preserved. No raw rejected model plan, provider error body, credential or private configuration is copied into evidence. The only configuration identifier reported is the explicitly requested model. Runtime source fingerprint remains identical.

## Recommendation and scope boundary

Preserve the owner-approved quota-free implementation/artistic quality. **Defer final M4 closure pending a separately authorized narrow fallback-interpretation correction and owner review of this live-failure disclosure.** HTTP 503 alone does not invalidate the deterministic renderer. The desired fresh Gemini acceptance is unproven; neither fallback is relabelled AI success. Further live calls require separate owner authorization; the unused numerical allowance will not be spent after both campaign requests have completed.

No implementation correction, artistic redesign, extra provider request, model/key/provider/billing/quota/cache/runtime-architecture change, dependency/asset installation, historical evidence rewrite, external archive operation, stage/commit/push, deployment, visibility/license change or M5 implementation occurred. Only the bounded verification harness and associated evidence/docs changed. The previously accepted 72/11/10/15 quota-free results remain historical; no new full-suite/build pass is claimed for this documentation-only assignment.

## Exact changed-file inventory

This verification assignment touches the following **11 paths**, including six additions; original M4 engine/studio/renderer/validation/runtime/dependency/font implementations remain unchanged:

- AGENTS.md
- docs/AI_DISCLOSURE.md
- docs/M4_LIVE_VERIFICATION.md
- docs/M4_REPORT.md
- docs/ROADMAP.md
- docs/TESTING.md
- docs/evidence/m4/live/artifact-manifest.json
- docs/evidence/m4/live/journal.json
- docs/evidence/m4/live/verification.json
- evaluation/m4-live-verification.config.ts
- evaluation/m4-live-verification.spec.ts

Combined M4 working tree: **23 modified tracked + 26 new = 49 candidate files**, zero staged; main/HEAD remains `e52258fcf054de89844d02c2d7cba315812f264e`. The exact combined list is also machine-readable in verification.json:

- modified: .gitattributes
- modified: AGENTS.md
- modified: README.md
- modified: THIRD_PARTY_NOTICES.md
- modified: docs/AI_DISCLOSURE.md
- modified: docs/API.md
- modified: docs/ARCHITECTURE.md
- new: docs/M4_LIVE_VERIFICATION.md
- new: docs/M4_REPORT.md
- modified: docs/REQUIREMENTS.md
- modified: docs/RESEARCH.md
- modified: docs/ROADMAP.md
- modified: docs/TESTING.md
- new: docs/evidence/m4/artifact-manifest.json
- new: docs/evidence/m4/asset-trial.json
- new: docs/evidence/m4/live/artifact-manifest.json
- new: docs/evidence/m4/live/journal.json
- new: docs/evidence/m4/live/verification.json
- new: docs/evidence/m4/verification.json
- new: docs/example-design-spec-m4.json
- new: docs/licenses/Tabler-MIT.txt
- modified: eslint.config.mjs
- new: evaluation/m4-artwork.config.ts
- new: evaluation/m4-artwork.spec.ts
- new: evaluation/m4-compatibility.spec.ts
- new: evaluation/m4-corpus.ts
- new: evaluation/m4-edge.config.ts
- new: evaluation/m4-edge.spec.ts
- new: evaluation/m4-live-verification.config.ts
- new: evaluation/m4-live-verification.spec.ts
- new: evaluation/m4-tabler.config.ts
- new: evaluation/m4-tabler.spec.ts
- modified: playwright.config.ts
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
- new: tests/m4-engine.spec.ts

## Final scoped review

Typecheck and focused lint of the two verification harness files passed again after collection; neither command invokes the provider. No full regression or production build was unnecessarily repeated because runtime implementation is unchanged. Git whitespace check passes and the staged inventory is empty. All 42 new evidence records and all 523 prior M4 manifest records match their recorded sizes/SHA-256; the original completed journal and runtime-source fingerprint remain unchanged. The 49-file candidate inventory contains no credential match, actual environment file, private absolute path, unapproved asset, dependency folder/cache/raw export or broken local Markdown link. Configured secrets were compared internally without printing them. This is a scoped review, not distribution/security clearance. Both campaigns were already complete when work resumed; no additional application/provider requests were made.
