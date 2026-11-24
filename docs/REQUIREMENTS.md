# Requirements and acceptance traceability

YARC Builder Fellowship, Founding Cohort 2027; Technology & Engineering; Track 01 — Create. The challenge checklist and deadlines below are **user-supplied**, not an independently verified event-rule transcript. Official deadline: **26 November 2026, 11:59 PM IST**; internal target: **26 November 2026, 8 PM IST**.

M0 implementation and documentation consolidation are **accepted by the owner for a local Git checkpoint**, subject to the final staged-file audit. This is not acceptance of the complete submission. “Covered locally” below is bounded by [TESTING.md](TESTING.md), not a public/production sign-off.

## Official challenge requirements

| ID | Requirement and acceptance criteria | Current implementation / status | Verification reference |
|---|---|---|---|
| OFF-01 | Accept topic and creative taste; ultimately process evaluator-provided briefs | Partial: manual topic/copy controls and 3 tastes work locally; intelligent interpretation pending | Studio controls; M0 mobile/manual test; M1 in ROADMAP |
| OFF-02 | Produce styled HTML designs | Covered locally: controlled React HTML/CSS/SVG; no unrestricted model code | Poster/export modules; offline HTML tests |
| OFF-03 | Expose an inspectable intermediate design specification | Covered locally: strict versioned Zod schema, inspector, JSON download and API response. Final README example tracked separately as ENG-03 | Schema test; mobile inspector test; README example and example-design-spec.json |
| OFF-04 | At least 3 genuinely distinct taste presets | Covered for M0: Bold Street, Minimal Swiss, Festive Pop vary type, layout, hierarchy, spacing and decoration; artistic breadth remains a roadmap concern | Presets/renderer; 3 preset tests; representative human review |
| OFF-05 | Instagram portrait **4:5** | Covered locally; selected 1080 × 1350 canvas | 3 PNG headers and DOM geometry; TESTING |
| OFF-06 | Instagram square **1:1** | Covered locally; selected 1080 × 1080 canvas | Same, all 3 tastes |
| OFF-07 | YouTube thumbnail **16:9** | Covered locally; selected 1280 × 720 canvas | Same, all 3 tastes |
| OFF-08 | LinkedIn landscape **1.91:1** | Covered locally; selected 1910 × 1000 canvas | Same, all 3 tastes |
| OFF-09 | Side-by-side platform previews | Covered locally: desktop grid; narrow mobile stacks | Studio screenshots; mobile width test |
| OFF-10 | Working exports in every format without clipping/broken crops | M0 feasibility verified within tested fixtures: 12 PNG downloads/dimensions; HTML offline comparison; DOM long-copy bounds. Universal PNG pixel fidelity and readability are not proven | TESTING exact assertions/limits; concerns R-02/R-05 in ROADMAP |
| OFF-11 | At least one HTTP endpoint or MCP tool | Covered locally: POST /api/design-spec, deterministic no-AI | HTTP test and curl; API.md. Future product generation route is distinct |
| OFF-12 | API documentation with a working curl example | Covered for current endpoint; future /api/generate documentation/curl pending | API.md; example-request.json; historical M0 and consolidation curl evidence |
| OFF-13 | Complete AI/API disclosure, rationale, costs, performance and limits | Partial for final product: M0 no-AI disclosure and one user-provided test recorded; production provider measurements pending | AI_DISCLOSURE.md |
| OFF-14 | Honest useful fallback when external APIs fail | Pending: independent fallback planner, provider failure handling and tests do not exist. Fixture mode is explicitly not a tested fallback | ARCHITECTURE; AI_DISCLOSURE; M1/M4 |
| OFF-15 | Public working prototype accepting evaluator-provided input | Pending: local manual input works; no public deployment or creative planner | M1/M5; production verification not performed |

## Internally selected engineering requirements

These implement our quality/safety/development choices; they are **not additional official challenge mandates**.

| ID | Acceptance criteria / decision | Status and evidence |
|---|---|---|
| ENG-01 | Next.js/TypeScript/React/custom CSS; strict bounded versioned schema; no model-executed HTML/JS/CSS | Implemented M0; structural validation tested. Semantic validation pending |
| ENG-02 | Exact PNG dimensions: 1080×1350, 1080×1080, 1280×720, 1910×1000; responsive scale independent of canvas | Implemented; all 12 fixture downloads checked. Official aspect ratios are OFF-05–08 |
| ENG-03 | **Final README includes a complete example intermediate JSON specification**, explains provenance and links to its validated source | Present now in README and example-design-spec.json; must be refreshed/validated against the final schema again at M5 |
| ENG-04 | Portable offline HTML plus JSON downloads; deterministic fixtures with no invented business facts | Implemented locally. HTML font portability limited; source notes in ARCHITECTURE |
| ENG-05 | Font readiness, bounded text fitting, overflow refusal, input escaping and size limits | Tested within M0 cases. Numeric minimum sizes do not establish final viewing-size readability |
| ENG-06 | Honest fixture/manual/live/fallback provenance; independent fallback sharing the rendering contract | Fixture/manual implemented; live/fallback future plans only |
| ENG-07 | Appropriate lint/type/build/browser evidence, human visual inspection, truthful scope and unresolved issues | Historical M0 checks passed; docs-only consolidation uses source hashes/evidence inspection instead of claiming a new browser run |
| ENG-08 | Licensed selective reuse, notices, no secrets/caches in Git, reviewed milestone checkpoints | License snapshot/notices added; distribution gaps tracked in THIRD_PARTY_NOTICES. Commit requires owner approval |
| ENG-09 | Preserve deadlines; no unnecessary auth/database/payments; one active repository; reviewed scope changes | Standing policy in AGENTS and ROADMAP. No M1/integration/deployment authorized here |
| ENG-10 | Eventually document POST /api/generate as the product orchestration boundary, separate from provider API and current spec builder | Planned only; API.md defines the relationship, not an implemented endpoint contract |

## Acceptance status and priorities

M0 rendering feasibility and initial checks are complete within their recorded scope. The owner's audit accepts that foundation; no remaining reproducible M0 acceptance-blocking defect is established by this documentation review. Existing quality concerns are not closed: fixed motif, supporting-copy readability, limited composition variety, semantic validation and cross-device fonts. See the identified concern register in [ROADMAP.md](ROADMAP.md).

Mandatory final-product gaps take priority over optional improvements. Complete campaign download and natural-language refinement are prioritized enhancements, not official mandates or authorization to implement them now. No AI integration, credentials, new dependency, C1/C2 integration, publishing or M1 work is part of consolidation.
