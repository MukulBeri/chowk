# M0 completion report

Historical delivery record from M0, updated with documentation pointers during consolidation. The owner has accepted the foundation and consolidation and authorized a local M0 checkpoint after a staged-file audit. The seven-test/16.9-second result below is the original M0 execution, not a new consolidation browser run. See Git history and the checkpoint report for the resulting commit identity.

## Delivered scope

Local typed/validated campaign specification; three visually distinct deterministic taste systems; four native HTML/SVG canvas formats with responsive previews; copy controls and inspectable/downloadable JSON; per-format PNG and offline HTML export; deterministic documented HTTP endpoint; maintained project instructions and milestone evidence. No AI credentials/integration, deployment or remote publishing.

## File inventory

Created:

- `src/lib/design.ts`, `src/lib/export.ts`
- `src/components/poster.tsx`, `src/components/studio.tsx`
- `src/app/api/design-spec/route.ts`
- `playwright.config.ts`, `tests/studio.spec.ts`
- `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/API.md`, `docs/example-request.json`, `docs/AI_DISCLOSURE.md`, `docs/M0_REPORT.md`

Modified: `AGENTS.md` (managed block preserved), `README.md`, `.gitignore`, `package.json`, `package-lock.json`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.

Removed: unused starter `src/app/page.module.css`. Existing Next config retained. Unused starter SVGs/favicon are not campaign dependencies; no final brand is selected.

## Decisions and dependencies

The schema owns the rendering contract and inferred types. Presets select controlled style decisions; React escapes copy and only repository-authored markup/styles execute. Format-specific positioning reorganizes content; native canvases are scaled only for preview. Measured text fitting follows font readiness; impossible overflow blocks export. Inline styles/SVG make portable HTML independent of the app. System fonts remove network assets but limit cross-machine typography matching.

- Runtime: `zod` ^4.6.7 for strict runtime validation and type inference.
- Runtime: `html-to-image` ^1.11.13 for local browser HTML-to-PNG feasibility.
- Development: `@playwright/test` ^1.65.1 for real Chrome checks and downloaded artifact verification; uses the installed browser.

Versions actually resolved are pinned in package-lock.json. Detailed architecture and source references: ARCHITECTURE.md.

## Verification and dimensions

Lint, TypeScript and production build pass. The final Chrome run reports **7 tests passed (16.9 s)**, covering all 12 preset/format combinations, long copy, offline HTML, mobile input and API validation. The documented curl command passed. Twelve actual PNG downloads were independently confirmed at 1080 × 1350, 1080 × 1080, 1280 × 720 and 1910 × 1000 (all four dimensions for each taste). Three portable HTML files opened offline; all 12 canvases passed same-machine raster comparison. Deliberately impossible copy warned and refused download. Commands, comparison thresholds, failures/fixes and browser limits are maintained in TESTING.md.

## Coverage and limitations

REQUIREMENTS.md maps official OFF requirements separately from internally chosen ENG criteria. Exact pixels are internal choices; aspect ratios are official. ENG-03 explicitly tracks a complete example intermediate JSON in the final README (now present and backed by example-design-spec.json). AI planning, independently generated fallback, complete measured provider costs/performance and public evaluator access remain intentionally pending. Fixture/manual mode never claims to be live AI. The user-provided AI test evidence is preserved as measurements in AI_DISCLOSURE.md without re-testing or extrapolation.

The renderer is an experimental fixed-motif system, not yet a topic-aware creative planner. The cup motif remains when arbitrary manual topics are entered. No persistence, arbitrary JSON import/editor or unrestricted HTML/CSS entry. Portable HTML retains native sizes and installed font stacks; exact appearance can vary across devices. Browser compatibility is limited to what TESTING.md actually verifies.

The same-machine raster comparison covered app/portable-HTML screenshots, **not downloaded PNG pixel fidelity**. Supporting-text readability, limited composition variety, semantic validation and cross-device fonts remain open alongside the fixed motif; ROADMAP.md owns that concern register. RESEARCH.md owns C1/C2 receipt/pending-review status; neither is integrated. THIRD_PARTY_NOTICES.md owns actual license evidence and unresolved distribution review.

## Review steps

Open http://localhost:3000, switch all tastes, inspect JSON, compare four layouts, download PNGs and HTML, then edit headline/support/CTA and apply copy. Inspect test exports/screenshots under ignored `test-results/`. See README.md for commands and docs/API.md for curl. The owner has reviewed the implementation and consolidation and authorized the local checkpoint.

## Post-M0 consolidation record

Documentation-only consolidation prepared for owner review; no M1 or reference integration. Source, tests, configuration and package files compare byte-for-byte with the beginning of consolidation (14 SHA-256 comparisons). Fresh checks and historical evidence remain separate in TESTING.md.

Created in consolidation: `docs/RESEARCH.md`, `docs/ROADMAP.md`, `docs/example-design-spec.json`, `THIRD_PARTY_NOTICES.md`, `docs/licenses/INVENTORY.json`, `docs/licenses/NOTICES.txt`.

Updated in consolidation: `AGENTS.md`, `README.md`, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/AI_DISCLOSURE.md`, `docs/TESTING.md`, `docs/M0_REPORT.md`. The managed framework instructions remain current. No `.env.example` was needed because no integration/environment configuration was introduced.

The inventory preserves 476 available license/notice files as 245 unique text documents across 349 installed packages; it is not target-distribution sign-off. Missing local notice files and uninstalled platform variants remain explicit release-review gaps. C1/C2 remain received, unintegrated references with recommendations pending review; C1's palette is not approved.

Authorized checkpoint message: `feat: establish M0 campaign rendering foundation and project governance`. The owner approved this local commit subject to the final staged-file audit; M1 requires separate authorization. No deployment, publishing, push or external archive changes were performed. Before staging, machine-specific personal paths were removed from project instructions/roadmap; required upstream authorship notices remain intact.
