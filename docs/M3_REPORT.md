# Accepted M3 — professional creative studio

## Starting checkpoint and scope

25 November 2026. Read-only preflight confirmed workspace/branch main, HEAD `e6d968ff35d081f524495c8f4fd26efac24b604b`, and a clean tree. M0–M2 remain accepted and closed. The owner authorizes M3 frontend implementation, quota-free verification and documentation only; no staging/commit/push/deployment, new assets/dependencies/live calls or M4/M5 implementation.

AGENTS, requirements, architecture, roadmap, M2 report, research/testing and installed Next CSS/layout guidance were inspected. The three Hybrid Refinement 02 reference files were read/visually inspected and hashed locally in `test-results/m3-preflight/reference-files.json`. The HTML is reference data, not production code or authority: its embedded screenshot crops, concept/state controls, mocked actions, evidence links and illustrative artwork were not copied into the app. No reference archive or attachment was modified.

The existing studio coupled draft taste to displayed art and used a React state-only export lock. Its canonical native posters lived under a gallery ref, with PosterPreview measuring preview scale, native renderer effects measuring fit and data-ready/data-overflow attributes guarding export. These boundaries are retained. A focused local hash baseline protects 51 existing engine/provider/font/evidence files; this is not a repeated historical archive audit.

## Implementation order and decisions

1. Scope studio tokens and build the approved light-rail/dark-gallery shell.
2. Separate draft, pending request, committed campaign/revision, unapplied edits and export state; reorganize existing controls.
3. Preserve native artwork/gallery refs and expose actual provenance, measurements, JSON and HTML/PNG workflows.
4. Add isolated snapshot inspection only after checking renderer lifecycle and IDs.
5. Verify interactions, responsive views, accessibility and unchanged native export regressions, then finalize this report.

## Frontend architecture

`studio.tsx` owns the workflow and committed revision. `taste-picker.tsx` uses native radios and original CSS/type miniatures from approved local resources. `studio-artboard.tsx` owns presentation and observes canonical data-ready attributes without changing renderer callbacks. `studio-dialog.tsx` provides native modal focus behavior and an inert cloned artwork view. `globals.css` owns the scoped Nocturne × Signal tokens, light creation rail, dark stage and responsive shell. Existing renderer, registry, provider, schemas, fonts and export implementation are unchanged.

Desktop uses a 300 px creation rail, reduced to 260 px where needed, and equal-width top-aligned gallery columns. The studio uses neutral Arial/Helvetica 13–14 px UI text; artwork retains approved Anton/Inter/Fredoka. The palette follows the supplied Hybrid 02 values. The working identity is create / studio, not permanent branding. No milestone/date/version badges, marketing hero, design-comparison footer or fake controls appear in the public interface. Schema versions remain available inside actual spec inspection.

The initial state is empty. An explicit “View sample campaign · no AI” retains the original real v1 fixture workflow without mislabelling it generated. New arbitrary briefs use the actual existing API/local planner. Draft taste no longer silently changes old artwork; local refinement controls use the displayed result's taste. The 52 retained regression cases are updated for native radios, explicit examples, separate manual campaign-topic editing, modal closing and truthful explicit-local provenance, preserving underlying fact/fit/dimension/pixel assertions.

Two small reference deviations are deliberate: editable-field boundaries use #9387A4 for stronger contrast while general rail borders keep #D4CFDF, and the empty state offers an explicitly labelled example instead of showing the prototype's static result. Native-radio taste semantics replace mock selection buttons. Next's documented devIndicators:false disables the development-only floating badge so local art review is unobscured; it does not suppress build/runtime errors or alter production/provider behavior. Spacing, colour, radius and UI type tokens remain centralized for future revision.

## State, inspection and export isolation

Draft topic/details/taste are separate from the committed spec/input/revision and copy editor. Requests use the existing validated response contracts and abort/identity protection; previous art remains during pending/error/subjectless results. Explicit local mode, AI success, automatic fallback, examples and manual changes have distinct labels. Existing safe diagnostics remain in generation details. Changing a draft aborts/invalidates a pending client response, without claiming the server/provider stopped processing.

An immediate ref lock prevents overlapping exports and disables conflicting controls before async work. Export starts only when the gallery revision matches the committed revision; a controlled stale-DOM test confirms that a mismatch refuses download. Export functions receive the four canonical native nodes and the applied campaign's taste, irrespective of a changed draft. Readiness is observed per revision; a successful response does not enable download buttons before fonts/fit finish. Unapplied edits block export. Fit/font defects retain actual refusal behavior and messages rather than triggering an unrelated AI retry.

Spec/check inspection is contextual. Enlarged art is a plain clone of an already measured native node, with IDs and canonical data attributes stripped, mounted outside the gallery. It creates no Poster component, callback or canonical ref. Inspection captures a consistent campaign snapshot. Native dialog provides naming, focus containment, Escape/backdrop/close behavior and restoration; background scrolling is locked while open. The gallery has full visible-copy descriptions for assistive access alongside the image role. Geometry results are not quality scores or artistic/factual certification.

## Responsive behavior and accessibility

At suitable desktop widths the creation rail and equal two-column gallery remain side by side; ordinary short laptop heights use normal page scrolling instead of clipping controls in a fixed panel. Below 980 px the creation section stacks and has an explicit keyboard-accessible disclosure, preserving input values/selections. Below 700 px the artwork gallery is one column. All four formats remain reachable by ordinary scrolling; ratios are not stretched. The creation panel does not auto-collapse or move focus after generation.

Semantic landmarks/headings/labels, native radio arrow-key behavior, selected/focus indicators, error/status announcements, reduced-motion rules and full-copy artboard descriptions are implemented. Live progress is outside the artwork's aria-busy region. Technical preformatted data is focusable and wraps long URLs. Dialogs use native modality plus explicit Tab wrapping, Escape/close/backdrop handling and trigger focus restoration. The prototype's unimplemented controls, fake stages and scores are absent.

Headless Windows Chrome verification is practical AA-oriented evidence, not WCAG certification, a screen-reader audit or a Safari/Firefox/device matrix. At 200% CSS magnification no horizontal page overflow occurred; the separate 320–1440 CSS-pixel reflow tests are not described as an OS/browser zoom certification.

## Executed verification and corrections

Final commands: `npm run lint`, `npm run typecheck`, `npm run build` — all passed. `npx --no-install playwright test --output=test-results/m3-final-08` — **62 passed (1.2 min)**, all 52 accepted M2 cases retained/equivalently verified plus 10 M3 frontend cases. A final draft-state correction compares trimmed input using the existing API normalization, avoiding a false “Draft changed” notice for leading/trailing whitespace. After that one comparison change, lint/typecheck/build passed again and `npx --no-install playwright test tests/studio-workspace.spec.ts --output=test-results/m3-state-final-09` passed **10/10 (15.4 s)**, including the whitespace case. The 62-case suite was not unnecessarily repeated for this isolated comparison; native engine/export code remained unchanged. Home and both API routes build successfully. Earlier focused/core runs and preserved findings are enumerated in [verification.json](evidence/m3/verification.json).

The first focused run had three failures: a test alert locator also matched Next's route announcer; an initial font gate blocked CSS font loading before navigation completed; and native modal Tab could move focus outside the document. The test harness issues were corrected and explicit focus wrapping fixes the actual modal defect. A test-only createImageBitmap overload typing error was fixed. Later scans exposed one incomplete axe aria-prohibited-attr check for a labelled palette div; adding its meaningful group role fixed it. Final tests assert both zero axe violations **and zero incomplete checks** in all three tested desktop taste states. Earlier runs/failure evidence remain in separate M3 output folders, not overwritten or counted as final passes.

Tests cover arbitrary briefs (beverage, cultural and factual workshop), all tastes/formats, empty/subjectless/invalid requests, draft/applied taste, local copy/composition/palette and rendered-spec correspondence, pending/error/stale retention, explicit local vs mocked AI/fallback/manual provenance, slow-font readiness, export refusal and duplicate/locked export behavior. Existing factual/safety/provider/mock/repair/budget/API, dense/long/unbroken text, negative facts, ₹/date/time/URL, unsupported-script, font-integrity and v1/v2/v3 compatibility cases pass. No live Gemini request was made; mocked AI-labelled responses are not new model measurements.

Final native matrix: six composition variants × four formats, **24 actual PNG downloads, six portable HTML and six downloaded JSON specifications**. Three retained M1-copy adaptations and exact legacy-v2 exports remain separately labelled; original v1 examples also retain their full export/HTML checks. Portable font-embedded HTML was checked offline with no runtime external requests. JSON inspection uses the validated displayed spec; manual refinement tests match its headline, taste and variant to all four rendered roots.

Native YouTube downloaded-PNG versus unscaled integer-origin DOM differences remain **Bold Street 1.15701%, Minimal Swiss 1.13553%, Festive Pop 1.13639%**, under the unchanged <=1.5% pixels / any RGBA channel delta >20 threshold. Tests use Windows headless Chrome 158.0.8127.88 at device scale 1. Separate offline HTML raster comparisons retain 0.1% / delta>8 and are not presented as downloaded-PNG fidelity. No renderer/export correction or threshold relaxation was needed in M3.

Enlargement/check inspection added **zero renderer instances** and left the four canonical roots' markup unchanged. Actual native PNG files downloaded before and after inspection were byte-identical. Rapid double export clicks produced one download while draft/refinement/generation controls were locked. This verifies the current supported snapshot path, not an arbitrary future SVG/editor implementation.

## Formal acceptance and final closure verification

The owner accepts Hybrid 02 as the initial public-release studio; future redesign remains permitted. Closure changed acceptance documentation/evidence only, not implementation, tests, dependencies or the native engine. Fresh final commands `npm run lint`, `npm run typecheck`, `npm run build` and `npx --no-install playwright test --output=test-results/m3-closure-10/artifacts` all passed on the accepted implementation: **62/62** full regressions after the isolated draft-whitespace correction. Earlier 62-before/10-after measurements remain historically accurate, with their original artifacts retained separately.

Curated copies go only to the existing 04_Project-Evidence/M3 and 05_Development-History/M3 trees. Native exports, real screenshots, inspection, representative failure/correction evidence, tests, approved references, acceptance and Git records are distinguished by provenance and verified by size/SHA-256. The already archived revised C7 source report is referenced without duplication or modification. No standalone M4 preparation document was located in the checked workspace, Downloads, attachments or existing archive; completion is owner-reported, not independently reconstructed here. OneDrive cloud synchronization is unverified. Final file counts and hashes are in the private archive index/integrity record; no personal archive paths enter public documentation.

## Principal actual evidence

[Artifact manifest](evidence/m3/artifact-manifest.json) records **170 selected final-run artifacts**, approximately 26.9 MB, with SHA-256, sizes and provenance. Raw PNG/HTML/screenshots remain ignored in the fresh final output directory; no historical evidence was rerendered in place, copied to external archives or staged. Source reference hashes are retained as metadata; embedded prototype artwork was not integrated.

- [Minimal Swiss desktop, 1440×900](../test-results/m3-final-08/studio-workspace-minimal-s-a6031-io-and-accessibility-checks/minimal-swiss-desktop-1440.png)
- [Bold Street desktop](../test-results/m3-final-08/studio-workspace-bold-stre-b1ead-io-and-accessibility-checks/bold-street-desktop-1440.png)
- [Festive Pop desktop](../test-results/m3-final-08/studio-workspace-festive-p-57277-io-and-accessibility-checks/festive-pop-desktop-1440.png)
- [Actual Festive mobile gallery, 390×844](../test-results/m3-final-08/studio-workspace-festive-p-57277-io-and-accessibility-checks/festive-pop-mobile-gallery-390.png)
- [320 px gallery](../test-results/m3-final-08/studio-workspace-responsiv-fea0e-llapsed-control-persistence/studio-320x844.png), [320 px open controls](../test-results/m3-final-08/studio-workspace-responsiv-fea0e-llapsed-control-persistence/mobile-creation-open-320.png)
- [1366×768](../test-results/m3-final-08/studio-workspace-responsiv-fea0e-llapsed-control-persistence/studio-1366x768.png), [1280×720](../test-results/m3-final-08/studio-workspace-responsiv-fea0e-llapsed-control-persistence/studio-1280x720.png), [1024×768](../test-results/m3-final-08/studio-workspace-responsiv-fea0e-llapsed-control-persistence/studio-1024x768.png), [768×1024](../test-results/m3-final-08/studio-workspace-responsiv-fea0e-llapsed-control-persistence/studio-768x1024.png)
- [Actual artwork enlargement](../test-results/m3-final-08/studio-workspace-dialog-ke-842a2--refs-and-actual-PNG-output/actual-artwork-enlargement.png), [isolation record](../test-results/m3-final-08/studio-workspace-dialog-ke-842a2--refs-and-actual-PNG-output/inspection-isolation.json)
- [Native 1080×1080 PNG](../test-results/m3-final-08/design-engine-actual-local-cd756-mparison-and-layout-quality/minimal-swiss-swiss-grid-instagram-square.png), [portable HTML](../test-results/m3-final-08/design-engine-actual-local-cd756-mparison-and-layout-quality/minimal-swiss-swiss-grid.html), [validated JSON](../test-results/m3-final-08/design-engine-actual-local-cd756-mparison-and-layout-quality/minimal-swiss-swiss-grid-spec.json)

Human inspection of actual desktop, mobile and enlarged artwork finds the approved proportions/contrast and artwork-first hierarchy substantially realized. The controls remain compact and separate from poster typography; portrait/square and landscape canvases retain their different native shapes. Small landscape artwork copy and inherited literal headlines remain M2/M4 concerns. Native poster quality is not improved or certified merely by this frontend redesign.

## Remaining limitations and acceptance boundary

The owner formally accepted M3 on 25 November 2026 after reviewing the report, real artwork/screenshots and native exports. This accepts the frontend within its documented scope. Only local Windows Chrome is tested; Safari/Firefox, touch hardware, assistive technologies, actual production deployment/performance and interactive browser/OS zoom remain unverified. No cross-reload persistence is added. Inspection is fitted snapshot viewing, not editing; if generation finishes while a dialog is open, its snapshot remains explicitly labelled rather than silently changing.

Existing M4/M5 concerns remain: fresh separately authorized live validation/repair, broader semantic reliability, richer topic graphics/composition, landscape readability, browser/device/script coverage, production reliability and actual target-distribution licensing (14 notice gaps, 53 uninspected package locations, ten potentially Linux x64 applicable). Their presence is not a claim of confirmed license violations. Existing deferred priorities/approval gates remain unchanged; no new ZIP, chat refinement, canvas editor, infrastructure or unrelated feature was added. No new enhancement is promoted to mandatory scope.

At the earlier candidate delivery, no staging/commit/push or external archival operation had occurred and HEAD was M2. That historical state is preserved in the private pre-acceptance report and original verification record. The owner now authorizes final verification, curated M3 archival, explicit staging, commit and normal push. No deployment, history rewrite, visibility/license/billing/provider change, Gemini call, dependency/asset adoption or M4/M5 implementation is authorized or performed. Actual final Git hashes and synchronization belong to the external M3 Git checkpoint record, avoiding a self-referential commit hash.

The closure retains the explicit **26-file inventory** below (19 previously tracked modifications and seven additions). Acceptance changes update the same documentation/evidence files; raw artifacts and private archive records are excluded. The final staged audit and completed Git state are recorded in the external milestone history.

Read-only review: 26 candidates and 123 compiled client files compared against the configured secret internally, without printing it. No configured-secret/token-shape match, private absolute path, prohibited generated/environment/asset candidate, invalid JSON or broken local Markdown target was found. All 51 protected engine/provider/font/history records remain byte-identical. This is scoped review, not a full security or release audit.

- modified: AGENTS.md
- modified: README.md
- modified: docs/AI_DISCLOSURE.md
- modified: docs/ARCHITECTURE.md
- new: docs/M3_REPORT.md
- modified: docs/REQUIREMENTS.md
- modified: docs/RESEARCH.md
- modified: docs/ROADMAP.md
- modified: docs/TESTING.md
- new: docs/evidence/m3/artifact-manifest.json
- new: docs/evidence/m3/verification.json
- modified: next.config.ts
- modified: playwright.config.ts
- modified: src/app/globals.css
- modified: src/app/layout.tsx
- new: src/components/studio-artboard.tsx
- new: src/components/studio-dialog.tsx
- modified: src/components/studio.tsx
- new: src/components/taste-picker.tsx
- modified: tests/design-engine.spec.ts
- modified: tests/fallback-correction.spec.ts
- modified: tests/generation.spec.ts
- new: tests/studio-workspace.spec.ts
- modified: tests/studio.spec.ts
- modified: tests/typography.spec.ts
- modified: tests/validation-investigation.spec.ts
