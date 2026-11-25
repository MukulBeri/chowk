# M5-B — release corrections and quota-free candidate

25 November 2026. **Ready for owner review within the authorized M5-B scope; not deployed, submitted or target-license cleared.** All-M5 maximum internal completion remains today **15:00 IST**; official 26 November 23:59 IST is contingency. Implementation/verification completed ahead of the 11:00/11:45 targets. No deadline waives a release gate.

## A. Starting checkpoint and implementation

Main remains at **cad6bfcc3fb1da985ffd804be00afd6fc910f34a**. Before editing, all 65 accepted runtime/source/config/test hashes matched fingerprint 0e3afe6365b33b256af1810ded9c047486a097f75c475c85a278ea0e9521c09e; the working tree and index were clean. AGENTS and relevant installed Next 16.4.6 guides were read. M0–M4 stay accepted; [M5-A historical findings](evidence/m5/audit-baseline.json) remain distinct from new verification.

The new /api/render route reuses the existing engine **once per campaign** and returns actual styled HTML through pure AdvancedPosterMarkup/LegacyPosterMarkup extracted from the accepted renderer. The measured React wrappers retain their lifecycle, refs/callbacks and export revision behavior. No second engine, server browser, new artwork, font, dependency or studio redesign was added. Existing JSON-only /api/generate and v1 /api/design-spec successes retain their contracts; v1/v2/v3 validation/rendering compatibility remains protected.

Trusted HTML measurement serializes only repository-authored font/fitting/coordinator functions. The v3 quality function and original legacy fitter are shared rather than independently reimplemented. Existing two-axis fitting, readable floors, bounds/overlap/contrast checks and at most three correction passes remain. Inert templates contain the same resolver's bounded alternatives; they do not register canonical refs. There is no model-authored executable content. The shared font loader is self-contained; approved WOFF2/OFL hashes are checked before one embedded font bundle per document. Conditional Tabler attribution is retained. Production minification of this path was actually tested, not assumed.

New server factory requires exact GEMINI_ENABLED=true before constructing the provider. Unset/false/other values fail closed. .env.example now recommends false with placeholder credentials. Existing real secret configuration was not edited. Runtime model/billing/quota/timeouts and single repair cap remain unchanged. The studio truthfully labels disabled auto as local planning, distinct from failed AI. A shared streamed UTF-8 JSON reader hardens all three POST routes; scoped headers protect framing, MIME and referrers without breaking hydration/artwork/fonts/downloads. /api/notices makes existing and supplemental notices available to browser recipients.

## B. Actual HTTP contract and executed curl

POST /api/render accepts {topic,taste,details?,mode?}, the existing generation request contract. On success it returns **{spec,interpretation,metadata,html,sizes,rendering}**. Current generated specs are v3; metadata retains true source, attempts/model/fallback reason. Details in [API.md](API.md), [actual request](example-render-request.json), [complete actual spec](example-design-spec-m5.json) and README. The official /generate path is illustrative; returning actual styled HTML/sizes is the consequential integration behavior that the old JSON-only routes alone did not demonstrate.

Executed against the actual production build, with local mode and zero provider attempts:

~~~powershell
curl.exe --fail-with-body --json "@docs/example-render-request.json" http://localhost:3000/api/render --output campaign-response.json
~~~

The recorded curl additionally saves headers under test-results/m5-curl-01. It exited 0, HTTP 200, returned **623,141 UTF-8 HTML bytes**, four native size records, a validated spec and requested-local provenance. Actual response, HTML, headers and execution record are preserved there. The HTML contains native artwork immediately; it is neither a blank loader nor a link to the studio.

Server rendering is explicitly **requires-browser-verification / measuredOnServer=false**. Consumers save/open the returned HTML, allow its hash-authorized trusted script, and await **window.yarcCampaignReady**. Its resolved result and window.yarcCampaignQuality contain ready/failed and per-format issues/corrections/exportReady. data-ready means measurement settled, including refusal; it alone is not permission to export. Disabled scripts stay pending. Font failure has a ten-second bound and fails closed. Geometry success is not artistic/factual certification. The returned document intentionally has native-size scrolling and no PNG download controls; the studio remains the canonical PNG exporter.

Requests are at most 12,288 streamed bytes (legacy utility 8,192); read deadline two seconds. Topic/details limits and strict unknown-field rejection remain. HTML is bounded to 1,500,000 UTF-8 bytes and the final JSON response to 2,000,000. Errors distinguish 400, 408, 413, 415, 422 and safe internal 503. No-store responses and X-Campaign-Inference policy header expose no credential.

## C. Native size, quality, facts and export evidence

Actual local robotics topic and all supplied student/12-team/date/time/IST/Lab A/₹150/exact URL facts were checked in all four API formats for all three tastes. Native dimensions: **1080×1350, 1080×1080, 1280×720, 1910×1000**. All twelve actual studio PNG downloads match those dimensions. All twelve API native DOM captures match canonical studio captures at the unchanged delta>8 / ratio≤0.001 threshold, with **zero** changed pixels above that delta. All twelve new PNGs also match the retained accepted M4 PNGs at that method with **zero** above-delta changes. Existing representative PNG-vs-native-DOM threshold stays ratio≤0.015 at delta>20; maximum observed here **1.10524%**. These are pixel comparisons in one Windows/Chrome environment, not byte-identity, cross-device or public production guarantees.

| Taste | Format | PNG vs native DOM | API vs studio (delta>8) | New vs M4 (delta>8) |
|---|---|---:|---:|---:|
| bold-street | instagram-portrait | 0.72668% | 0 | 0 |
| bold-street | instagram-square | 0.90835% | 0 | 0 |
| bold-street | youtube-thumbnail | 1.01411% | 0 | 0 |
| bold-street | linkedin-landscape | 1.10524% | 0 | 0 |
| festive-pop | instagram-portrait | 0.69966% | 0 | 0 |
| festive-pop | instagram-square | 0.87457% | 0 | 0 |
| festive-pop | youtube-thumbnail | 0.97591% | 0 | 0 |
| festive-pop | linkedin-landscape | 0.08204% | 0 | 0 |
| minimal-swiss | instagram-portrait | 0.78333% | 0 | 0 |
| minimal-swiss | instagram-square | 0.93330% | 0 | 0 |
| minimal-swiss | youtube-thumbnail | 1.01053% | 0 | 0 |
| minimal-swiss | linkedin-landscape | 0.08539% | 0 | 0 |

The actual returned HTML works offline without external runtime requests, with approved font readiness and no page errors for the twelve representative formats. Native DOM includes the same layout, facts and artwork. Short poetry, environmental copy, camera attribution, hostile markup-like data, readable dense logistics, overload and impossible headline fixtures exercise the new consumer path. Missing-input environmental declarations stay metadata; original negative statements stay public. No model output is invented for these fixtures.

The readable dense robotics-plus-notebook brief fits all formats; YouTube uses the existing correction removing artwork to allocate support space. The larger eight-clause brief honestly refuses **only YouTube**, with TEXT_OVERFLOW and OUT_OF_BOUNDS, matching the canonical studio; the other three formats fit. Negative clauses are retained in each. This is a measured capacity limit, not a reason to lower floors or discard content. Impossible W×220 copy refuses all formats, retaining its full headline. A deliberately tampered missing-font fixture fails closed; it is labelled a fixture, not an actual outage.

Representative genuine local evidence:

- [Production result root](../test-results/m5-full-production-01): m5-release-HTTP-HTML-* directories contain each taste's HTML, validated JSON, four actual PNG downloads, API/native DOM captures, desktop/mobile screenshots and actual-evidence.json.
- [Minimal Swiss actual studio](../test-results/m5-full-production-01/m5-release-HTTP-HTML-minim-c7cfb-d-accepted-M4-compatibility/minimal-swiss-studio.png), [Bold Street studio](../test-results/m5-full-production-01/m5-release-HTTP-HTML-bold--7ef3a-d-accepted-M4-compatibility/bold-street-studio.png), [Festive Pop mobile](../test-results/m5-full-production-01/m5-release-HTTP-HTML-festi-367f1-d-accepted-M4-compatibility/festive-pop-mobile.png).
- [Actual curl HTML](../test-results/m5-curl-01/campaign.html), [response record](../test-results/m5-curl-01/execution.json).
- Existing full-suite outputs also verify measured portable studio HTML, native PNGs, fonts, v1/v2 compatibility, contextual inspection, refinement and safe refusal. Replayed M1 cases inside that suite remain labelled replays, not fresh AI.

I inspected representative actual Bold/Swiss desktop and Pop mobile captures. The approved Hybrid studio and accepted artwork remain recognizable; this was preservation review, not a new artistic redesign or formal accessibility certification.

## D. Licensing and actual distribution scope

[Recipient notices](../THIRD_PARTY_NOTICES.md), [supplement](licenses/NOTICE_SUPPLEMENT.txt) and [qualified release inventory](licenses/RELEASE_REVIEW.json) are current. Original 579,856-byte package collection, inventory, all five approved fonts/three OFLs and pinned camera/MIT records remain intact. New /api/notices serves the full existing collection plus supplement and font/asset texts. Exact texts are verified in the real HTTP response. API camera HTML preserves the complete displayed MIT notice; font notices are embedded with all current API campaigns.

Complete exact installed esrecurse 4.3.0 BSD source-header and imurmurhash 0.1.4 MIT README evidence are now retained. language-subtag-registry 0.3.23's explicit database CC0 declaration/legal-text link is retained with its narrower scope. Next 16.4.6 umbrella MIT evidence for related packages is distinguished from package-local absence and bundled/native obligations. No holder was invented and no dependency/source package was modified.

All **14 historical gaps and 53 absent locations** remain in the qualified inventory; they are not all labelled resolved or violations. Eleven historical gaps concern development scope in the prior classification; three concern runtime/shared packages, with SWC build-vs-distribution qualification still target-dependent. Full/minimal framework traces are inspected, not just app routes: the full Windows framework includes @next/env, client-only and Sharp/native Windows Sharp. Installed client-only's empty index.js limits the substantial-code question for that exact payload, not future targets. A successfully built app does not clear every package/vendor component.

Build 01 warned that an unscoped dynamic notice path could trace the whole project. Fixed-directory reads remove that warning in final build 02. Fresh production traces include the eight font/OFL files in /api/render and required notices in /api/notices; none of the six inspected traces includes environment files. Trace counts/scope are retained in test-results/m5-tools/production-traces.json. New client/static secret checks also pass.

**Release gate, not local failure:** actual Linux/Vercel Node/OS/CPU/libc, selected native packages, build/server/client payloads and relevant notices/source/object/relinking obligations have not been inspected. Minimum safe next action is an independently authorized target-preparation build/artifact inspection: identify actually conveyed Linux Sharp/libvips and bundled components, fulfill applicable obligations, qualify build-only SWC/resolver and other-platform alternatives, and verify deployed notices. Do not copy all 53 absent alternatives or assume Windows clearance transfers. No packages/infrastructure were installed here; target payload remains unavailable. Original-code license/visibility decisions remain with the owner.

## E. Security and disabled inference

Exact opt-in is tested with undefined, false, uppercase TRUE, 1 and empty values. Disabled configuration cannot construct a provider. Actual studio Generate, /api/generate auto and /api/render auto return local disabled provenance with **zero attempts and null model**, including synthetic enablement/key headers. Unknown configuration request fields are rejected. One injected mock proves the preserved eligible opt-in path; it is not a provider request. All normal tests are now guarded by an explicit-local policy probe before any automatic path.

The request reader accepts valid JSON MIME/charset parameters and rejects malformed/unsupported MIME, Latin-1, malformed JSON, invalid UTF-8 and oversized streaming bodies. A controlled slow stream verifies deadline cancellation. Safe messages expose no rejected provider body, raw private brief or secret. The isolated HTML CSP permits only its authored script hash, inline approved styling/data fonts and data images; hostile input remains escaped text and causes no requests/execution. Studio response headers deliberately avoid a restrictive default-src that would break accepted Next/inline/export behavior.

Existing actual .env.local/key/model/billing/quota settings were not edited. The sole localhost service was restarted with process-only GEMINI_ENABLED=false for authorized verification, then left in development mode with the same port and disabled inference. There is no public deployment or inference enablement. Eligible Gemini integration remains available for separately approved use; default local mode is not described as successful Gemini.

Per-instance budgets/cache/concurrency and cancellation limits are accurately documented: 18-second attempts inside 38-second planning, one repair; process-local reservations, no globally enforced serverless budget; accepted-plan cache eligibility 120 seconds/20 entries, lazy cleanup on eligible auto requests rather than timed erasure; client abort does not directly cancel engine work. Public Google eligibility/privacy restrictions require owner review before enabling AI. No billing, account age, eligibility or legal clearance is assumed.

## F. Executed verification and preserved findings

| Check | Actual result / record |
|---|---|
| npm run lint | Pass; test-results/m5-lint-final.json/log |
| npm run typecheck | Pass; test-results/m5-typecheck-final.json/log |
| npm run build | Pass; test-results/m5-build-02.json/log; scoped notices remove initial tracing warning |
| npx playwright test --output=test-results/m5-full-production-01 | **92/92 pass**, 94,460 ms command elapsed; original 77 plus 15 focused cases |
| npx playwright test tests/m5-release.spec.ts --output=test-results/m5-dev-final-01 | **15/15 pass**, 20,321 ms; final development path |
| Real curl POST /api/render | HTTP 200, local provenance, actual self-contained HTML/sizes/spec |
| Source/privacy/trace and historical integrity | 64 protected tracked files and 967 M4 artifact records unchanged; 12 production static assets scanned; zero known-secret/key-pattern/private-path matches |

All original test source files remain byte-unchanged; assertions/tolerances were not weakened. Existing suite includes same-machine offline HTML raster parity, actual PNG parity, export refusal, font integrity, compatibility, safe diagnostics, keyboard/modal/ref/state, responsive and mocked transport protection. No installed browser/dependency changes. Platform/cross-device/production limits remain.

Preserved failed/intermediate evidence: m5-focused-01 had 7/14 passing while the development server repeatedly reloaded; it also exposed a misused no-JavaScript page option, notice comparison of escaped source rather than displayed text and the extra-dense fixture's legitimate capacity refusal. m5-focused-production-01 had 13/14 passing, isolating that expectation. The test now creates a genuinely JavaScript-disabled browser context, compares actual decoded notice text and retains both readable dense and overload/canonical-refusal cases. Build 01's tracing warning is retained. Final production/development runs pass; these older failures were not overwritten or reinterpreted as original product success. No artistic benchmarks or live evaluations were repeated.

## G. Official matrix and pending public verification

[REQUIREMENTS.md](REQUIREMENTS.md) now records the owner-supplied exact authoritative Technology Create transcript, Tech form fields and OFF-01–15 / ENG-01–10 traceability. Product Figma/history/walkthrough and Creative launch deliverables are separately scoped, not Tech mandates. Mandatory public arbitrary-input prototype **OFF-15 remains pending**, despite the optional demo form field. OFF-02/11/12 now have actual local styled-HTML HTTP/curl proof. Native pixels are internal choices realizing official ratios; local geometry/parity is not a public release claim. The README contains a complete actual current local v3 spec, preserving historical examples separately.

## H. Exact candidate inventory and integrity

**39 candidate files, zero staged**. Main/HEAD remain unchanged. [Machine-readable verification](evidence/m5/verification.json) records exact inventory, checks and all source hashes. Candidate runtime/config/test/asset fingerprint **e52a30ea813e2d020cee173798797458b8802011fbef7a54496fcf0dabbaefac** over 90 sorted {file,sha256} records (the documented current inventory, not a direct same-cardinality comparison with the historical 65-file fingerprint). Documentation/evidence are outside that runtime fingerprint. Known configured credentials are compared privately against candidate files and production static outputs; none matched, and no value/hash of a credential was exposed. No personal absolute machine paths or private application references were found in that scope. This is not a new all-history certification.

[Artifact integrity manifest](evidence/m5/artifact-manifest.json) records **511** new isolated evidence files with SHA-256, sizes and original relative paths (217,501,163 bytes). It includes preserved initial failures and clearly labelled mocked/replay fixtures; it does not make them live AI successes. All listed artifacts were read to compute integrity records, and protected historical artifacts were rechecked. No physical archive copying occurred. Generated outputs remain ignored, with compact evidence records in docs/evidence/m5.

Exact affected files:

- .env.example
- AGENTS.md
- README.md
- THIRD_PARTY_NOTICES.md
- docs/AI_DISCLOSURE.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/M5_REPORT.md
- docs/REQUIREMENTS.md
- docs/ROADMAP.md
- docs/TESTING.md
- docs/evidence/m5/artifact-manifest.json
- docs/evidence/m5/audit-baseline.json
- docs/evidence/m5/verification.json
- docs/example-design-spec-m5.json
- docs/example-render-request.json
- docs/licenses/NOTICE_SUPPLEMENT.txt
- docs/licenses/RELEASE_REVIEW.json
- next.config.ts
- playwright.config.ts
- src/app/api/design-spec/route.ts
- src/app/api/generate/route.ts
- src/app/api/notices/route.ts
- src/app/api/render/route.ts
- src/components/advanced-poster-markup.tsx
- src/components/advanced-poster.tsx
- src/components/legacy-poster-markup.tsx
- src/components/poster.tsx
- src/components/studio.tsx
- src/lib/design-engine/document-runtime.ts
- src/lib/design-engine/fonts.ts
- src/lib/design-engine/legacy-quality.ts
- src/lib/design-engine/quality.ts
- src/server/configured-engine.ts
- src/server/json-body.ts
- src/server/render-document.tsx
- src/server/runtime.ts
- tests/m5-release.spec.ts
- tests/quota-free-setup.ts

## I. Remaining blockers and focused owner decisions

1. Review this M5-B candidate; separately authorize any exact Git checkpoint/publishing. Nothing is staged or committed.
2. Authorize target-specific deployment preparation, inspecting the actual selected Linux/Vercel artifact and fulfilling applicable native/vendor notices before release clearance. Confirm actual Node/runtime/plan/region and traced assets. Do not infer those dashboard settings from this Windows build.
3. Select reviewer repository access/visibility and any original-code license decision if necessary. Neither public visibility nor open-source licensing is explicitly mandated by the supplied Tech brief; reviewer access is necessary. Git history can contain author metadata; do not expose personal identifiers casually.
4. Separately authorize initial deployment with **GEMINI_ENABLED=false**, no public key exposure and ordinary arbitrary-input local planning. Verify public HTTPS, all three tastes/four formats, JSON/HTML API, served notices, fonts, dimensions/parity, input/failure/refusal states and export behavior on the actual URL. No deployed URL exists or is invented here.
5. Any public AI enablement/fresh verification requires separate Google eligible-use/privacy/budget approval. M4's zero accepted fresh plans and unrecoverable original omitted robotics fact remain disclosed. No unused historical allowance is active.
6. Complete final Tech architecture decisions field (≥30 characters), repository/demo access, concise demonstration backup, actual submission confirmation and owner-authorized evidence archival within today's maximum 15:00 IST deadline. None is performed by this candidate.

Remaining engineering limits: bounded English/factual heuristics and possible novel false positives/negatives, finite dense-copy capacity, unsupported-glyph/system-font fallback warnings, one-environment raster evidence, practical rather than certified accessibility, process-local quotas/cache and bounded continuation after disconnect. The new HTML fitting script is trusted application code whose serialization must be regression-checked after future toolchain changes. No additional art/UI feature was added; existing deferred roadmap concerns remain.

**Prohibited actions not taken:** no inference calls, dependency/font/asset acquisition or install, secret/model/billing/quota change, stage/commit/push/reset/history rewrite, visibility/license change, deploy, project submission, unrelated project edits or physical historical archive modification. Stop at owner review.
