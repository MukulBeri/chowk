# Roadmap and engineering discipline

Official deadline (user-supplied): **26 November 2026, 11:59 PM IST**. Internal target: **26 November 2026, 8 PM IST**. Mandatory working behavior, reliability and end-to-end operation take precedence over optional polish. Reserve time for production testing, docs and submission. The milestone order is a planning framework; tasks may overlap **when authorized**, and a meaningful prototype should reach deployment early enough to expose production problems. No calendar allocation here is a measured effort estimate.

## Current gate

M0 implementation and consolidation are accepted by the owner. The local M0 checkpoint is authorized after a final staged-file audit. The original M0 lint/type/build checks and seven Chrome tests passed; exact evidence and exclusions are in TESTING.md. Consolidation preserves application/config/dependency/test bytes, records research/licenses and does not start M1. No reproducible remaining M0 acceptance-blocking defect was established by this review; the quality concerns below remain open.

Current action: audit and record the authorized local M0 checkpoint. Its hash belongs to Git history and the checkpoint report. Subsequent implementation, remote publishing and deployment each await explicit authorization. A roadmap entry or received prototype does not grant implementation permission.

## Milestones

| Milestone | Scope / priority | Exit evidence / current state |
|---|---|---|
| **M0 — Engineering foundation** | Docs, typed intermediate schema, 3 tastes, 4 layouts, HTML renderer, preview/export feasibility, initial checks | Foundation and consolidation accepted; existing tested renderer retained. Local checkpoint authorized after staged-file audit |
| **M1 — Creative intelligence** | Gemini integration; brief interpretation, audience/objective, structured strategy, copy/art direction; production spec validation; arbitrary topics; independent fallback; HTTP generation endpoint; initial model comparison/performance | Not started. Must prove live/fallback provenance, validated end-to-end outputs, failures, documented /api/generate curl and measured model behavior |
| **M2 — Advanced design engine** | Composition/typography, meaningful within-taste variation, topic-aware visuals, procedural graphics evaluation, text fitting/readability, colour intelligence and licensed selective reuse | Not started. Compare actual visual quality and cross-format/export reliability; address concern register rather than merely add decoration |
| **M3 — Professional frontend** | Specialized creative studio, visual taste controls, coordinated previews, inspectable decisions/rationale, improved exports and feasible refinement, responsive/accessibility work | Not started. Real states and actual behavior required; C1/C2 are unapproved references, not implemented UI/design decisions |
| **M4 — Quality and reliability** | Automated/manual checks, edge cases, API/fallback tests, export fidelity, performance, security, production-readiness audit | Not started; quality work also accompanies earlier authorized milestones. Passing geometry is not aesthetic sign-off |
| **M5 — Deployment and submission** | Meaningful GitHub repo, Vercel deployment, production checks, final README/API/architecture/disclosures, demonstration evidence, official audit and submission | Not started; publishing not authorized now. Revalidate final README example JSON (ENG-03), refresh notices for the deployment platform and record commit/deployment evidence |

## Existing concern register

These are existing audit/engineering concerns, not newly authorized features or claims of observed failures beyond the stated evidence.

| ID | Concern / actual M0 boundary | Planned evaluation / acceptance direction |
|---|---|---|
| R-01 | **Fixed-motif rendering**: the cup remains even for unrelated manual topics | M1/M2: relevant, bounded topic-aware visual choices without making image generation mandatory |
| R-02 | **Supporting-text readability**: fitting/no-overflow and 20 px native minimum do not prove legibility at social display/preview sizes | M2/M4: judge realistic viewing sizes, hierarchy and per-platform readable size; measure and visually inspect long copy |
| R-03 | **Limited composition variety**: three distinct systems but mainly one composition family each, adapted to ratios | M2: evaluate meaningful within-taste variations while retaining campaign identity |
| R-04 | **Semantic validation**: Zod shape/bounds cannot establish truthful facts, topic relevance, taste/palette coherence, audience fit or contrast | M1/M2/M4: enforce explicit content/semantic rules and deterministic quality correction; failure behavior must be tested |
| R-05 | **Cross-device fonts**: installed fonts/substitution and offline HTML without refitting can change text geometry | M2/M4: consider appropriately licensed embedded fonts, supported scripts and cross-OS/browser testing. Current HTML parity is one machine only |
| R-06 | **Export/quality evidence limits**: actual PNG sizes are verified, but universal PNG pixel fidelity, all artifacts' aesthetics and production behavior are unproven | M4: targeted PNG-to-preview raster/visual checks, realistic devices, production and human review; distinguish intended layering from accidental overlap |
| R-07 | **Distribution notices**: local inventory is not a target-platform compliance sign-off; some packages omit notice files | Before distribution: resolve relevant gaps, inspect the actual deployment dependency set and retain required native/bundled notices (THIRD_PARTY_NOTICES) |

## Product and design direction

The approved direction is a specialized professional AI creative studio: natural-language brief with optional context; visual taste selection; strong typography/hierarchy; artwork-first results; coordinated side-by-side previews and appropriate enlarged inspection; individual exports; inspectable decisions/JSON and rationale; understandable loading, empty, error and fallback states; responsive and accessible controls. This is direction, not a checklist of completed functionality.

Complete campaign download and natural-language refinement remain **prioritized enhancements**, conditional on mandatory behavior and time. Avoid generic dashboard aesthetics, excessive decorative gradients/UI chrome, meaningless statistics, crowding, a full Canva-style editor and attractive mocks concealing missing behavior. Temporary Create Lab branding is not a final identity. C1's UI palette is not approved.

Preserve the established taste character: **Bold Street**—contrast, oversized expressive type, asymmetry, layered elements and energetic rhythm; **Minimal Swiss**—disciplined grids, alignment, restraint, whitespace and hierarchy; **Festive Pop**—expressive colour, playful type/shapes, movement, dynamic hierarchy and appropriate ornament. Tastes must differ beyond palette.

Selectively evaluate existing enhancement candidates according to these priorities and time: multiple compositions, topic-aware elements, reusable procedural SVG/CSS, halftone/geometric patterns, sunbursts, abstract waves, sticker badges, frames, paper-like textures, duotone and ornaments; intelligent fitting, readable-size rules, contrast/correction, campaign identity and platform rearrangement. Verify font/asset licenses. None requires an AI-generated photograph.

## Quality strategy for later authorized work

Retain schema/input/escaping, dimensions, font readiness, layout bounds, responsive and offline HTML checks. Extend where warranted to invalid AI responses, timeout/rate/quota behavior, independent fallback, unreadable text, poor contrast, broken assets, preview/export and campaign consistency, unusual/long/vague/incomplete prompts, special characters/supported languages, repeated generation, actual production deployment, performance, security and privacy. Include human visual review; automation cannot certify art direction. Record performed checks and gaps in TESTING.md, not implied success from a UI or successful build.

## Deferred Ideas and Future Enhancements

Standing policy: preserve existing priorities/conditions; do not turn every discussed enhancement into a requirement. **Every genuinely new idea after consolidation must be recorded, briefly evaluated where useful and kept outside active work until the owner approves it.** Acceptance bug fixes are not new features.

The following remain deferred/conditional: AI-generated photographs; additional in-product agents; AI visual critic; advanced drag-and-drop editing; user-uploaded photos; brand management; extra provider integrations; photography/videography guidance; location/weather/device-aware advice. Additional presets, broader language support, advanced font measurement and alternative renderers remain candidates only. The broader AI Creative Director vision must not expand this fellowship submission beyond manageable scope. Model/provider/Meta-credit conditions are in AI_DISCLOSURE.md; library and C1/C2 status are in RESEARCH.md.

## Workspace and archive policy

- Sole active repository: this checkout; source, tests, technical docs, licensed assets and Git history belong here.
- Purposeful backups only when necessary, in the owner's established development-backup location. No duplicate active repositories, competing authoritative snapshots or scattered experiments.
- Preserve the owner's existing fellowship archive and its established layout: `01_Event`, `02_Application`, `03_Final-Submission`, `04_Project-Evidence`, `05_Development-History`, `06_Outcome`, `07_Post-Mortem`. Absolute machine-specific locations remain outside public documentation; request the location when external archival work is authorized.
- Application/submission records, curated evidence, development history/outcomes stay separate from active source. No second fellowship archive. External archival actions require instructions/approval; do not automatically move or modify them in this assignment.
- Do not modify unrelated projects, their backups or screenshots, Windows settings or security policies. Avoid unnecessary downloads/assets, secrets and committed caches.
- At each checkpoint, connect implementation/tests/evidence to the actual approved Git commit and deployment version. Use Git history and checkpoint reports for hashes; do not confuse the local M0 checkpoint with a deployment or later milestone.

Organization is part of completed work. Follow AGENTS.md's acceptance → scoped implementation → checks/result inspection → code/organization review → docs/evidence → approved Git checkpoint → next-milestone discipline. Coordinate agents if ever authorized and review external contributions before integration.
