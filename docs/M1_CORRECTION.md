# Focused M1 correction and checkpoint candidate

24 November 2026. Based on M0 `0665dc24afc641167bbb613ed1ab1c5028a5e66f`, branch `main`. The owner provisionally accepted M1 engineering and requested this focused correction/audit. No commit, staging, push, deployment, new dependency, broad live benchmark, external archive edit or M2 implementation occurred. This report supersedes the initial candidate inventory in M1_REPORT.md; original measured evidence is unchanged.

## Root cause and exact correction

The fallback independently chose the raw topic as headline and the full brief as supporting copy, causing repetition. A small sentence filter in the pre-correction source recognized some no-invention/missing-input wording only in supporting copy. It did not model publishable content separately, missed first-person declarations, kept only generic missing-information metadata, and used `filteredBrief || request.topic`, which restored instruction-only input as public copy. Historical measured fallback records predate even that small filter and show all reported leaks; those records are retained as findings.

- `src/lib/generation/brief.ts`: bounded, anchored English recognition of missing-input declarations, specific planning directions and subjectless requests. It separates content/directions/missing information instead of deleting words such as “no” or “not”. Ordinary negative facts and mixed factual clauses survive. Explicit public-copy labels resolve intentional ambiguous wording. Metadata notes respect the existing count/length bounds and summarize additional notes if necessary.
- `planner.ts`: derives headline, support and existing category/illustration choice from public content. It retains the first publishable segment as headline within the existing limit, keeps other content as support, removes only exact repeated segments and does not infer logistics or CTA. Missing information and directions remain in interpretation metadata. Original `campaign.topic` remains an input/editing record, not rendered artwork copy. No concrete subject raises `IncompleteBriefError`.
- `engine.ts`: runs that local preflight before dispatch in both modes, reuses the resulting independent plan for fallback and exposes missing-information warnings. Incomplete requests spend no provider quota and cannot return a fabricated campaign.
- `contracts.ts`, generate route and studio: add a validated `brief-incomplete` error envelope, HTTP **422**, a visible missing-subject explanation and interpretation details. The previous artwork remains visible. Successful response shape, v1/v2 design schemas, renderer/export code and limits are unchanged by this focused correction.
- Tests: five new correction tests, updated prior fallback expectations to verify preserved content/factual tokens rather than duplicate support, and a two-line mobile-test output-path fix described below. M0 geometry, escaping, dimensions and export-refusal assertions are retained.

Recognition deliberately uses complete bounded patterns. For example, a sentence extending “No business name … has been supplied” with a real qualifier, or a longer ambiguous directive containing a price, is preserved rather than broadly deleted. Unknown phrasing still requires review. This is not general natural-language understanding or a semantic truth guarantee.

## Actual before/after evidence

[Before](evidence/m1/correction/before.json) was captured by executing the independent pre-correction planner before editing it. [After](evidence/m1/correction/after.json) executes the corrected local engine on the same ten inputs with forced local mode and a provider that must not run. These are separate from the historical live matrix and do not change its outcomes, timing, token or cost claims. Five inputs produce conservative campaigns; the vague historical brief plus four standalone missing-info/instruction inputs are incomplete.

| Input | Actual pre-correction behavior | Corrected behavior |
|---|---|---|
| Chai opening + “An invitation for students. No business name, date or price has been supplied.” | Topic repeated in headline/support; the small current filter already removed the missing-data sentence from support, unlike the older live fallback record | Headline is the supplied topic; support only “An invitation for students.”; missing-input sentence is metadata and UI warning |
| Robotics workshop + “No schedule or price has been supplied.” | Topic repeated; instruction filtered only from support | Topic appears once; empty support is valid; specific missing schedule/price stays in metadata/warnings |
| Cultural evening + “An invitation to gather. Do not invent event logistics.” | Topic repeated; direction removed from support but not specifically retained in assumptions | Support only “An invitation to gather.”; direction recorded as a planning instruction |
| “Help me announce something.” + “I have not supplied what, when or where yet.” | A pretend generic campaign; first-person declaration leaked into support | 422, missing subject/details metadata, no new spec or provider request; previous artwork retained |
| Either missing-information sentence, “Do not invent event logistics.” or the first-person statement as the entire topic | Filter-or-topic fallback puts the original instruction back in headline/support | 422 without a fabricated campaign |
| Robotics workshop + “No tickets are required.” | Fact retained, alongside repeated topic | Fact remains as supporting copy, topic appears once; no invented price/date/CTA |

Regression coverage includes “No chairs have been supplied”, “No entry fee”, “No parking is available”, “The venue is not confirmed”, a negated event date, refund restrictions, product identifiers, public safety instructions and mixed missing-info/price/venue/URL clauses. Explicit labelled public wording is also retained.

## Verification and actual local screenshot/exports

Lint, typecheck and production build passed. **24 tests passed in 27.1 s**: 7 M0, 12 prior M1 and 5 focused correction tests. All normal tests are local or mocked and spend no Gemini quota. An initial focused run passed 5 tests in 3.5 s. An earlier full run had 23 pass/1 fail because a new assertion incorrectly required the intentionally hostile HTML fixture to pass the AI code-leakage guard. The corrected assertion checks preserved factual tokens; no production safeguard or original escaping assertion was weakened. Failed-run diagnostics remain in their separate output directory.

After correcting the mobile output path, its isolated browser regression passed **1 test in 2.3 s**. The final full source, including an explicit zero-provider-call assertion for incomplete auto requests and isolated mobile output, then passed **24 tests in 29.6 s** with `npm test -- --output=test-results/m1-correction-checkpoint`. No app behavior changed in the test-harness fix. Commands, dimensions and SHA-256 artifact hashes are in [verification.json](evidence/m1/correction/verification.json); TESTING.md retains precise historical boundaries.

The actual corrected browser run uses the real local endpoint, not a mocked or replayed response: **requested-local**, zero provider attempts, Minimal Swiss. The supplied topic is “A campus robotics workshop for first-year engineering students.” Details are “No schedule or price has been supplied. No tickets are required.” Missing schedule/price appears in the studio warning and metadata, not artwork. The negative ticket fact appears on all four canvases and in exported HTML. All canvases report ready/no overflow; no page errors occurred. The screenshot and native YouTube PNG were visually inspected; the long literal headline and generic geometry remain M2 concerns.

Artifacts remain under ignored `test-results/m1-correction-verified/fallback-correction-actual-ebe04-nd-warn-about-missing-input/`:

- [Actual studio screenshot](../test-results/m1-correction-verified/fallback-correction-actual-ebe04-nd-warn-about-missing-input/corrected-local-studio.png)
- [Native YouTube PNG, 1280 × 720](../test-results/m1-correction-verified/fallback-correction-actual-ebe04-nd-warn-about-missing-input/minimal-swiss-youtube-thumbnail-1280x720.png)
- Native Instagram portrait 1080 × 1350, square 1080 × 1080 and LinkedIn 1910 × 1000 PNGs in that same folder
- Portable `minimal-swiss-campaign.html` and actual HTTP result/interpretation/export record, also retained as [actual-local-result.json](evidence/m1/correction/actual-local-result.json)

PNG signature/header dimensions and HTML content were checked. This does not establish universal PNG pixel fidelity or cross-device font consistency. The retained M0 raster checks compare same-machine HTML screenshots only.

## Evidence preservation and archival recommendations

[The pre-run manifest](evidence/m1/correction/preserved-evidence.json) hashes 57 existing files (6,996,716 bytes). **56 remain byte-identical**, including all six original measured JSON files, the owner-created duplicate JSON, every retained model screenshot/native PNG/HTML and prior actual/mocked fallback export. No historical live finding was overwritten or relabelled repaired.

One preservation mistake occurred: the existing mobile test wrote directly to `test-results/mobile-studio.png`, bypassing the custom runner output and overwriting the prior non-model mobile screenshot. The original 168,277-byte file had SHA-256 `742dd61db364a35e5c860e570f985d866fa4b480234c83d985942604eee1195d`. Its original bytes were not recovered; the 168,322-byte current file is a **new rerun**, not preserved original evidence. The original hash and current hash/size remain in verification.json. The source now uses `testInfo.outputPath`; the isolated test confirms it writes only inside its selected directory. This limitation is disclosed rather than silently changing the baseline manifest.

For a later authorized fellowship archive action, preserve the original measured JSON/attempt history and findings; the explicitly labelled three-taste model-result replays with native PNGs/HTML; prior actual-local and mocked UI evidence with provenance; the new corrected-local screenshot/four PNGs/HTML/result; before/after/verification/hash records; and the new isolated mobile screenshot labelled with this rerun. Preserve failed-run diagnostics if useful for development history. Do not confuse replayed-live renders with new provider calls or replace missing original artifacts with relabelled reruns. No external archive was touched.

## Visual review and remaining limits

ROADMAP.md merges the owner/ChatGPT visual findings into existing concerns: R-01 generic/topic-aware graphics; R-02 overly long literal headlines, social supporting-copy/CTA readability and logistical hierarchy; R-03 unused no-art space and limited within-taste variation; R-04 interpretation/semantic limits; R-06 platform-specific creative adaptation and export verification. Minimal Swiss was judged strongest by the supplied qualitative review, not a new benchmark. R-05 fonts, R-07 distribution notices and R-08 provider reliability remain open. No M2 artwork, layout or design-engine implementation was undertaken.

Remaining limitations: bounded English interpretation with ambiguous/unrecognized wording; exact rather than semantic deduplication; conservative and sometimes literal long headlines; the visual concerns above; heuristic factual/name/claim checks; detailed-copy export refusal; system fonts/cross-device differences; previously measured provider failures; process-local quota/cache controls; unverified production/load/accessibility/security/billing behavior. Metadata notes may be summarized at existing schema bounds; original input remains available for review. No broad live-model rerun was performed.

## Read-only pre-commit security/artifact review

The read-only scan covered **180 candidate/tracked/client files, including 113 compiled client files**. No configured credential value or secret-shaped token was detected. Public documentation/evidence scans found no personal username/email or machine-specific absolute paths. `.env.local`, dependencies, builds, browser outputs and caches are ignored and absent from the proposed commit; `.env.example` contains placeholders only. The server-only credential boundary, fixed-host header authentication, sanitized errors, strict bounded inputs and controlled renderer were reviewed. This is a scoped review, not a complete security certification.

Package manifests/lockfile and existing license evidence are unchanged. The inventory lock hash matches. Existing evidence sizes are appropriate: `INVENTORY.json` **187,348 bytes**, `NOTICES.txt` **579,856 bytes**, retaining 476 source texts grouped into 245 unique notices for 349 installed packages. No new licensing dump or third-party asset/code was introduced. Keep all existing notices. **14 remaining local notice-file gaps and 53 uninstalled lockfile locations** still require target-distribution review; Windows evidence is not Vercel/Linux compliance sign-off. Small correction JSON files record actual reproduction/comparison/hash evidence; generated PNG/HTML/trace/build/dependency folders remain outside Git.

`git diff --check` and `git diff --cached --check` passed. The index is empty; the cached check cannot certify a later staged set. Any later commit must stage the approved explicit manifest and re-audit that actual index. No significant new security or licensing issue was found; the artifact-preservation exception above remains a material evidence limitation.

All 52 local Markdown link targets checked exist and all proposed JSON files parse. A whitespace review of the 48 proposed files found no trailing whitespace. The original `curl-generation.json` lacks a final newline; it was deliberately preserved byte-for-byte as historical evidence. The six new correction JSON files total approximately 65 KB and contain reproduction/results/hash/manifest records, not binary exports or credentials.

## Exact proposed checkpoint

Proposed message: **`feat: add validated Gemini campaign planning and independent fallback`**.

[candidate-files.json](evidence/m1/correction/candidate-files.json) is the exhaustive proposed path/status list: **48 files**, comprising 19 modified tracked files and 29 intended new files, with no deletions. It includes the complete uncommitted M1 implementation, tests, governance/API/disclosure/roadmap docs, validated examples, six original measured JSONs and six new correction JSONs (including the manifest itself). Existing license files remain in Git unchanged; THIRD_PARTY_NOTICES.md records no new dependency/asset reuse.

Final working-tree inventory: branch `main`, HEAD `0665dc2`; **19 modified tracked + 30 untracked = 49 changed/untracked files; zero staged, zero deleted**. The extra untracked `docs/evidence/m1/live-models - Copy.json` is an owner-created byte-identical duplicate of live-models.json. It is preserved and explicitly excluded from the 48-file proposal. No automatic `git add .` is appropriate.

Stop here for owner checkpoint authorization. This candidate has not been committed or published and does not authorize M2.
