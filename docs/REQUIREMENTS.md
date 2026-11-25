# Requirements and acceptance traceability

Current authority: M0–M4 accepted at cad6bfcc3fb1da985ffd804be00afd6fc910f34a; M5-A audit accepted; M5-B release corrections and quota-free verification authorized. This is a local candidate, not a public/production or final-submission sign-off. Historical evidence remains in the original milestone reports. Maximum internal completion deadline for **all M5 work is 25 November 2026 at 15:00 IST**; official **26 November 2026 at 23:59 IST** is emergency contingency.

## Authoritative official source and division scope

The owner supplied the complete official applicant-page Create challenge and Technology submission form text, retrieved **25 November 2026**. This owner-provided official transcript is authoritative; public division pages are supplementary, not a substitute for the applicant text. [Public Technology division](https://fellowship.tryreppy.com/divisions/tech), [fellowship](https://fellowship.tryreppy.com/fellowship). No applicant identifiers or private answers are retained here.

Applicable division: **Technology & Engineering, Track 01 — Create**. Build topic + taste controls → styled HTML poster/page output → platform-size previews → export/publish-ready output. Design decisions must be inspectable through an intermediate specification; the README must show one complete example. At least three taste presets must visibly change typography/composition/style and their effects must be documented. Exact ratios: Instagram 4:5 and 1:1, YouTube 16:9, LinkedIn 1.91:1; side-by-side preview and exports without broken crops or clipped text. At least one HTTP endpoint or MCP tool, illustrated officially as POST /generate {topic,taste} → {html,sizes}, must be documented with usable curl integration. Disclose every runtime LLM/API, rationale, measured numbers where available, failure behavior and honest fallback.

**A publicly openable working prototype accepting arbitrary input is mandatory.** The submission form's “Working demo (optional but strong)” field does not waive that requirement. Localhost demonstration video is backup, never primary proof. Tech submission fields: GitHub repository; Working demo (optional but strong); Architecture & decisions (stack/structure/tradeoffs, minimum 30 characters); submit project. No submission is authorized or claimed here. The owner must ensure reviewers can access the repository; public visibility and an open-source license are not explicit requirements in the supplied text.

Separate **Product** deliverables (Figma full-flow prototype, compare/history/save design, 3–6-minute walkthrough, rationale citing three posters) and **Creative** deliverables (launch kit, transformation story, two-week strategy, five hooks, honest review) are not mandatory Technology deliverables. Useful Tech demonstration/documentation remains planned without importing another division's whole checklist.

## Official challenge matrix

Locally satisfied means bounded by current actual evidence in M5_REPORT.md and TESTING.md; public production verification remains a separate gate.

| ID | Official acceptance criterion | Current status / evidence |
|---|---|---|
| OFF-01 | Topic + taste, arbitrary evaluator input | Local studio and HTTP paths functional; local planner and mocked provider tests; public evaluator access pending |
| OFF-02 | Topic in, actual styled HTML out | New POST /api/render returns self-contained native artwork plus trusted browser fitting; existing studio/portable exports retained; real curl and consumer browser checks |
| OFF-03 | Inspectable intermediate spec and README example | Strict v1/v2/v3, Design & spec, JSON download; complete current actual local v3 example in README and example-design-spec-m5.json |
| OFF-04 | At least three visibly different tastes, documented effects | Bold Street: strong uppercase Anton/stack or editorial split; Minimal Swiss: Inter grid/editorial discipline; Festive Pop: Fredoka central/offset playful framing. Shared registry exposes supported layouts/palettes, subject-led graphics and local refinements; accepted M4 artwork preserved |
| OFF-05 | Instagram portrait 4:5 | 1080 × 1350 native, actual PNG/HTML/browser checks |
| OFF-06 | Instagram square 1:1 | 1080 × 1080 native, actual PNG/HTML/browser checks |
| OFF-07 | YouTube thumbnail 16:9 | 1280 × 720 native, adaptive composition/export checks |
| OFF-08 | LinkedIn landscape 1.91:1 | 1910 × 1000 native, adaptive composition/export checks |
| OFF-09 | Side-by-side platform previews | Existing real desktop gallery; narrow screens stack without changing native canvases |
| OFF-10 | Unclipped/correct-crop exports | Actual twelve PNG downloads, dimensions, unchanged PNG/native-DOM tolerance and M4 comparison; impossible fits refuse, preserving all copy. Device universality not established |
| OFF-11 | One usable HTTP endpoint or MCP integration | /api/render returns {html,sizes,spec,interpretation,metadata,rendering}; route spelling /generate is illustrative, not mandatory. Legacy JSON-only endpoints alone were insufficient for the demonstrated HTML contract |
| OFF-12 | Working documented curl usable by another track | Actual local production curl using example-render-request.json; API.md documents browser readiness and safe local mode |
| OFF-13 | Exact AI/API disclosure, rationale, costs, measured performance/limits | AI_DISCLOSURE.md distinguishes historical M1/M2 successes, M4 failures, corrections/mocks and current zero-call local verification; no exact unknown cost or fresh success invented |
| OFF-14 | Honest degradation when API fails | Independent local planner shares renderer; disabled/missing/provider-error/validation paths remain distinct. Existing bounded repair and safeguards retained; no new live reliability claim |
| OFF-15 | Mandatory public working arbitrary-input prototype | **Pending deployment authorization and actual public verification**. Local production success or optional form field is not sufficient |

## Internally selected engineering criteria

These are owner-selected technical choices, not additional official mandates.

| ID | Criterion | Current state |
|---|---|---|
| ENG-01 | Next/TypeScript/React, strict bounded schema, trusted HTML/CSS/SVG only | Preserved; shared pure markup, no executable provider markup |
| ENG-02 | Exact native pixels independent of preview scaling | All four dimensions retained; twelve actual native downloads checked |
| ENG-03 | Complete current README spec, provenance and validated source | Actual local curl v3 example present; historical v1/v2/M4 examples retained |
| ENG-04 | Native PNG, portable offline HTML and JSON | Existing exports retained; API HTML additionally embeds fonts once and carries honest browser-readiness contract |
| ENG-05 | Font readiness, bounded fitting, input/overflow refusal | Existing thresholds unchanged; shared reader adds MIME/UTF-8/read-time bounds; consumer failures remain unready |
| ENG-06 | Honest fixture/manual/AI/local/fallback provenance | Disabled auto labelled local/AI disabled; explicit local requested-local; no mock is fresh AI |
| ENG-07 | Lint/type/build/regression, evidence and candid limits | Original 77 regression cases preserved plus focused M5 cases; actual results in M5 report, not implied by a build alone |
| ENG-08 | Licensed selective reuse, notices, secrets/privacy and reviewed Git gates | Browser notices and supplement added; Linux/native/vendor clearance remains gated; no Git mutation or new dependency |
| ENG-09 | Deadlines, one workspace, no unrelated infrastructure | Current maximum 25 November 15:00 IST; scope/deployment/archival boundaries retained |
| ENG-10 | Existing product-generation orchestration and deterministic utility separated | /api/generate remains JSON orchestration; /api/design-spec remains v1 utility; /api/render reuses the same engine once and returns styled HTML |

## Remaining release gates

Target Linux/Vercel distribution and applicable native notices; separately approved production configuration and deployment; public arbitrary-input/font/fidelity/error/export verification; reviewer repository access/visibility and original-code licensing decision where necessary; final Tech fields, demonstration backup and submission; final evidence archival. Fresh AI verification or public AI enablement requires separate eligible-use and call-budget authorization. M5-B does not authorize any of those actions. Existing artistic/semantic/accessibility/browser concerns remain in ROADMAP.md.
