# Requirements and acceptance traceability

M3 was owner-accepted on 25 November 2026 over accepted synchronized M2 `e6d968f`; current authority is its archival, final verification and Git checkpoint closure. The two-region studio, responsive real previews, truthful states, native-radio taste selection, local refinement, contextual inspection and isolated enlargement are internal M3 choices, not new official challenge mandates. Native dimensions, schema/API/factual/export contracts remain preserved. OFF-15 public access and production verification remain pending; M3 acceptance does not establish deployment readiness.

YARC Builder Fellowship, Founding Cohort 2027; Technology & Engineering; Track 01 — Create. The challenge checklist and deadlines below are **user-supplied**, not an independently verified event-rule transcript. Official deadline: **26 November 2026, 11:59 PM IST**; internal target: **26 November 2026, 8 PM IST**.

M0 implementation and consolidation are accepted at checkpoint `0665dc2`. This is not acceptance of the complete submission. “Covered locally” below is bounded by [TESTING.md](TESTING.md), not a public/production sign-off.

M0/M1 are accepted and closed at M1 checkpoint `e4a338f722680421bfff6ea88662594ecce3c234`. The owner formally accepted M2 on 24 November 2026 within the scope in M2_REPORT.md. That M2 closure authority is historical. Current M3 acceptance/closure authority is stated above; deployment, visibility/billing changes and subsequent implementation remain gated. Historical table entries below retain their measured milestone scope.

## Official challenge requirements

| ID | Requirement and acceptance criteria | Current implementation / status | Verification reference |
|---|---|---|---|
| OFF-01 | Accept topic and creative taste; ultimately process evaluator-provided briefs | Implemented locally: topic/details/taste → live planning or independent fallback; manual edits preserved | M1 API/browser tests and six-brief live matrix; public evaluator access pending |
| OFF-02 | Produce styled HTML designs | Covered locally: controlled React HTML/CSS/SVG; no unrestricted model code | Poster/export modules; offline HTML tests |
| OFF-03 | Expose an inspectable intermediate design specification | Covered locally: strict v1/v2 Zod contracts, inspector, JSON download, live plan/rationale metadata and API response. Final README example tracked as ENG-03 | Schema/M1 tests; README live v2 example; preserved v1 example |
| OFF-04 | At least 3 genuinely distinct taste presets | Covered for M0: Bold Street, Minimal Swiss, Festive Pop vary type, layout, hierarchy, spacing and decoration; artistic breadth remains a roadmap concern | Presets/renderer; 3 preset tests; representative human review |
| OFF-05 | Instagram portrait **4:5** | Covered locally; selected 1080 × 1350 canvas | 3 PNG headers and DOM geometry; TESTING |
| OFF-06 | Instagram square **1:1** | Covered locally; selected 1080 × 1080 canvas | Same, all 3 tastes |
| OFF-07 | YouTube thumbnail **16:9** | Covered locally; selected 1280 × 720 canvas | Same, all 3 tastes |
| OFF-08 | LinkedIn landscape **1.91:1** | Covered locally; selected 1910 × 1000 canvas | Same, all 3 tastes |
| OFF-09 | Side-by-side platform previews | Covered locally: desktop grid; narrow mobile stacks | Studio screenshots; mobile width test |
| OFF-10 | Working exports in every format without clipping/broken crops | M0 regression retained; actual M1 AI and independent local campaigns export all four native PNGs and portable HTML. Bounds/overflow protections remain. Universal pixel fidelity/readability unproven | TESTING and live browser artifacts; R-02/R-05/R-06 |
| OFF-11 | At least one HTTP endpoint or MCP tool | Covered locally: product POST /api/generate plus preserved deterministic POST /api/design-spec | API.md, API/browser tests and live endpoint evidence |
| OFF-12 | API documentation with a working curl example | Both endpoints documented with Windows file-based requests; generation supports explicit no-AI local mode | API.md; example-generation-request.json; TESTING actual curl evidence |
| OFF-13 | Complete AI/API disclosure, rationale, costs, performance and limits | Current M1 evidence documented: two model metadata checks, six briefs each, failures/tokens/timing, provisional choice, unknown actual billed cost. Refresh after further integration/deployment | AI_DISCLOSURE.md; live JSON and human review; final submission disclosure audit remains |
| OFF-14 | Honest useful fallback when external APIs fail | Implemented independently through same v2 renderer; missing key, invalid plan/repair, timeout/network/quota/provider/budget paths tested; live failures recorded. Distributed/production behavior unverified | engine/planner, generation tests, live matrix/browser failure, local endpoint |
| OFF-15 | Public working prototype accepting evaluator-provided input | Pending public access: live/local planning now handles arbitrary local briefs; no public deployment | M5; production verification not performed |

## Internally selected engineering requirements

M2 update: current generation adds strict v3 with v1/v2 compatibility. OFF-03/04/10/14 and ENG-01/03/04/05/06/07 gain owner-accepted M2 evidence for six variants, palettes/SVG capabilities, native hierarchy/corrections, grouped/negative facts, actual local exports and PNG comparisons. Official requirements are unchanged and OFF-15 public access remains pending. M2_REPORT.md owns exact results/gates; historically labelled table entries retain their original scope. ENG-03 now includes a complete actual v3 JSON alongside v1/v2 examples.

These implement our quality/safety/development choices; they are **not additional official challenge mandates**.

| ID | Acceptance criteria / decision | Status and evidence |
|---|---|---|
| ENG-01 | Next.js/TypeScript/React/custom CSS; strict bounded versioned schema; no model-executed HTML/JS/CSS | Preserved; M1 adds bounded plan/v2 spec and semantic heuristics. These do not prove truth |
| ENG-02 | Exact PNG dimensions: 1080×1350, 1080×1080, 1280×720, 1910×1000; responsive scale independent of canvas | Implemented; all 12 fixture downloads checked. Official aspect ratios are OFF-05–08 |
| ENG-03 | **Final README includes a complete example intermediate JSON specification**, explains provenance and links to its validated source | Present now in README and example-design-spec.json; must be refreshed/validated against the final schema again at M5 |
| ENG-04 | Portable offline HTML plus JSON downloads; deterministic fixtures with no invented business facts | Implemented locally. HTML font portability limited; source notes in ARCHITECTURE |
| ENG-05 | Font readiness, bounded text fitting, overflow refusal, input escaping and size limits | Retained/tested in M0 and M1. Detailed v2 copy can still exceed readable capacity and refuse export |
| ENG-06 | Honest fixture/manual/live/fallback provenance; independent fallback sharing the rendering contract | All four paths now distinguishable; fallback does not reuse unrelated chai fixture |
| ENG-07 | Appropriate lint/type/build/browser evidence, human visual inspection, truthful scope and unresolved issues | Historical evidence retained; M1 fresh checks, repeatable mocks, real local endpoint, live matrix/browser and human semantic findings recorded separately |
| ENG-08 | Licensed selective reuse, notices, no secrets/caches in Git, reviewed milestone checkpoints | License snapshot/notices added; distribution gaps tracked in THIRD_PARTY_NOTICES. Commit requires owner approval |
| ENG-09 | Preserve deadlines; no unnecessary auth/database/payments; one active repository; reviewed scope changes | M0–M3 accepted; no new dependencies/infrastructure; M3 archival/normal Git checkpoint authorized; deployment/billing/subsequent implementation gated |
| ENG-10 | Document POST /api/generate as the product orchestration boundary, separate from provider API and spec utility | Implemented/documented; native REST, server-only configuration, bounded budgets and sanitized errors |

## Acceptance status and priorities

M0 rendering feasibility remains accepted; M1 adds actual creative planning and fallback. The fixed cup now has relevant/neutral/no-art paths, and semantic safeguards exist, but broader topic-aware visuals/meaning/readability/composition/fonts are not solved. Live reliability is imperfect (primary 4/6 matrix AI outcomes; comparison 0/6); human review found and prompted an extra timing-claim guard. See [ROADMAP.md](ROADMAP.md) and [M1_REPORT.md](M1_REPORT.md).

Mandatory final-product gaps take priority over optional improvements. Complete campaign download and natural-language refinement remain enhancements, not authorization to implement them now. That M1 scope is historical; M0/M1 are now accepted and closed. M2 is formally accepted with its recorded limitations; the two live outcomes and later quota-free corrections retain their original scopes. Current authorization is M3 checkpoint closure only. See M2_REPORT.md for historical results and M3_REPORT.md for accepted frontend scope; deployment, billing and M4/M5 implementation remain gated.
