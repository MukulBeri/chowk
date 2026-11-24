# M0 verification

Test environment: Windows 11; Node 24.22.3; npm 11.19.1; Next.js 16.4.6; installed Google Chrome via Playwright. Verification date: 24 November 2026 (IST). Browser tests reuse the existing development server at localhost:3000. No duplicate server, downloaded browser or Windows policy change.

## Commands executed

- Repository: `git status --short`, `git log -1 --oneline`, package/config/source inspection, managed AGENTS generator and relevant bundled Next.js guides.
- Environment: `node --version`, `npm --version`, `npm ls --depth=0`.
- Dependencies: `npm install zod html-to-image`; sandbox network denial followed by approved retry; `npm install --save-dev @playwright/test`. Install audit reported zero vulnerabilities at that time.
- Checks: `npm run lint`, `npx --no-install tsc --noEmit`, `npm run typecheck`, `npm run build`, `npm test`.
- HTTP readiness: PowerShell `Invoke-WebRequest` against localhost:3000 (200 after dependency installation).
- Documented example: `curl.exe --fail-with-body --json "@docs/example-request.json" http://localhost:3000/api/design-spec` — exit 0, valid fixture response, `aiUsed: false`, all four formats.
- Review: `git diff --check` (pass); native PNG header inspection of all 12 downloaded exports; `hasCurrentAgentRules(process.cwd())` from the installed Next.js generator (true).

## Results

| Check | Final result |
|---|---|
| npm run lint | Pass, no lint errors |
| npm run typecheck | Pass, no TypeScript errors |
| npm run build | Pass; static home page and dynamic POST API built |
| npm test | **7 passed**, final run 16.9 seconds; installed Chrome, existing development server |
| Documented curl example | Pass, exit 0 and deterministic validated JSON |
| Managed Next.js AGENTS block | Preserved; generator reports current block |
| git diff --check | Pass |

All three presets were checked in all four formats: **12 fixture PNG downloads**. PNG signatures and native IHDR dimensions were verified by the browser test and independently read from the saved files. The application also decodes each PNG and verifies width/height before initiating download.

| Format | Selected exact pixels (internal) | Bold Street | Minimal Swiss | Festive Pop |
|---|---|---|---|---|
| Instagram portrait | 1080 × 1350 | Verified | Verified | Verified |
| Instagram square | 1080 × 1080 | Verified | Verified | Verified |
| YouTube thumbnail | 1280 × 720 | Verified | Verified | Verified |
| LinkedIn landscape | 1910 × 1000 | Verified | Verified | Verified |

Three portable HTML files were opened with the browser context offline. All 12 HTML canvases were compared with their native app canvases at the same pixel origin: **0 pixels exceeded an 8-channel-value difference** in the final run (test allows up to 0.1% differing pixels at that threshold). This is same-machine HTML raster parity, not a cross-device font guarantee or a byte-for-byte comparison of PNG encodings. The comparison decodes PNGs because metadata/encoding and fractional screenshot coordinates can differ without a material visual change.

Specifically, the decoded images in that comparison are **browser screenshots of the app poster and the portable HTML poster**. They are not the downloaded `html-to-image` PNGs. PNG downloads were checked for signature, dimensions, nontrivial size and distinct format files; representative PNGs received human inspection. No automated PNG-to-preview pixel-fidelity test was performed. Long/unbroken copy checks measured DOM geometry/scroll bounds; they did not establish native raster fidelity for all stress-copy exports or readability at actual social display sizes. Numeric minimum font sizes and no overflow do not certify artistic quality or legibility.

Every preset/format passed geometry and scroll-overflow checks with a 240-character headline, 180-character supporting text, long CTA, and separately a 240-character unbroken headline. Content was retained without ellipsis. Deliberately impossible 120-line copy triggered visible warnings on all four previews and refused both PNG and HTML downloads. The mobile input/spec/injection test passed at 390 × 844. Representative full-resolution PNGs and a long-copy studio screenshot were visually inspected; visual review was not an exhaustive manual inspection of every artifact.

## Meaningful automated assertions

- Strict schemas reject unexpected executable-style fields, invalid colours, excessive copy and unbounded typography values.
- All three tastes × all four native canvas formats: font readiness, text overflow, content bounds and intersecting headline/support/CTA/illustration regions.
- PNG downloads: PNG signature, IHDR width/height, nontrivial image size and distinct files across formats.
- Portable HTML: four canvases, no scripts/stylesheets/network references, offline opening and same-machine rendering comparison.
- Long headlines (240 characters), supporting copy (180), long CTA, and 240-character unbroken words across every taste/format; no silent truncation.
- Mobile 390 × 844: no page-level horizontal overflow; custom topic, optional CTA removal, literal script-looking headline and JSON inspection.
- HTTP success/provenance/manual input; invalid taste, blank topic, excess headline, unknown fields, malformed JSON, oversized body and wrong content type.

Initial runs caught a wide-layout overlap, a spec identity/readiness race during export, and insufficient Swiss supporting-copy height at the maximum length; all were corrected before final verification. Visual review also prompted font-relative tracking and removal of synthetic Impact bolding so long headlines keep their word spacing. The HTML comparison initially compared screenshot encoding/fractional bounds; it now compares decoded raster values at integer origins. Earlier failed runs are not counted as final passes.

## Manual review

At localhost:3000, compare three taste presets, all four platforms, JSON and rationale. Download each PNG, check file properties and inspect the full-resolution image. Open the HTML file with the network disabled. Test a long headline, empty optional CTA and narrow browser width. An overflow refusal is intentional; shorten copy instead of accepting hidden text. Unapplied copy must be applied before download.

## Unperformed checks / limits

No live AI/provider, quota, cost, failure/fallback or deployment tests. No independent verification of historical AI feasibility. No Safari/Firefox/Edge, cross-OS font matching, full accessibility audit, arbitrary Unicode/font-script coverage or low-memory device qualification. Browser screenshots and test data are local artifacts, not a public deployment. No production server was started; the production build is checked, browser tests target development mode.

## Post-M0 consolidation verification (24 November 2026)

The results above remain **historical M0 execution evidence** from this repository/conversation, not a newly executed browser suite. The owner reports review of screenshots and four engineering documents and accepts M0 as a foundation, pending consolidation and final commit approval. The retained `test-results/.last-run.json` reports `passed` with no failed tests; that marker alone does not establish test count/coverage, which come from the actual earlier run and inspected test source.

These checks do not add browser, provider, production or C1/C2 validation coverage. Application/test/config/package files remained unchanged, so browser/build suites were not rerun for documentation-only edits.

| Check actually executed during consolidation | Result |
|---|---|
| Git/source/config/test/document inspection; npm ls --depth=0 | Existing M0 implementation and versions confirmed; HEAD still eb7e428; retained last-run marker passed |
| Local POST /api/design-spec via Node fetch | 200, fixture provenance, aiUsed false, four formats; complete spec saved to docs/example-design-spec.json |
| Documented curl.exe example (with silent/show-error output flags) | Exit 0; deterministic fixture response |
| Node built-in TypeScript import + Zod parse/deep equality | Saved example matches createDesign; complete README JSON matches the saved example. Node emitted a module-type autodetection warning; no package configuration was changed |
| Installed license inventory and preserved-text integrity | 349 installed package locations; 476 file hashes/content copies checked; 245 unique notices; gaps explicitly recorded in THIRD_PARTY_NOTICES |
| Markdown local files/anchors | 11 Markdown documents checked; no broken local links/anchors |
| SHA-256 before/after source/config/dependency/test comparison | All 14 monitored files identical; no application, test, package or config implementation change |
| Managed Next.js instruction generator check | hasCurrentAgentRules returned true |
| Git whitespace review | git diff --check passed |

The inline Node checks used existing Node/TypeScript/Zod and filesystem/crypto/assert APIs; no new test framework, package or product feature was added. Public research pages/README excerpts and exact-version Next license metadata were read; no candidate source implementation, C1/C2 artifact, provider or production behavior was executed. The complete licence filename-discovery scope and unresolved gaps are in THIRD_PARTY_NOTICES.md.
