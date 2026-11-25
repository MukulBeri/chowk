# Create Studio — M5-B release candidate

[M4 acceptance](docs/M4_ACCEPTANCE.md) records formal owner acceptance, verified scope and remaining release gates. The original [focused correction](docs/M4_CORRECTION.md) and [live verification](docs/M4_LIVE_VERIFICATION.md) are preserved historical reports: three provider calls, zero accepted fresh Gemini plans and two fallback results; the subsequent correction made zero live calls. Acceptance includes this reliability limitation.

[M4 report](docs/M4_REPORT.md) records actual before/after artwork, native exports, compatible v3 extensions, fact-guard findings, the selective asset trial and remaining limits. [Current actual M4 DesignSpec](docs/example-design-spec-m4.json) is a local-planner robotics fixture; earlier v1/v2/v3 examples remain valid.

[M3 report](docs/M3_REPORT.md) contains the implemented workflows, actual artwork/screenshots, verification results and remaining review limitations.

An artwork-first HTML/CSS campaign studio for the YARC Builder Fellowship Create track. **Create Studio is a working identity for the initial release.** M0–M2 are accepted and synchronized at `e6d968f`. M3 adds the approved light creation panel/dark gallery, native taste radios, distinct draft/result state, local refinements and contextual inspection while preserving the M2 engine. M3 is accepted and synchronized at `e52258f`. Formally accepted M4 adds subject-led original artwork, concise copy hierarchy, larger landscape information regions, one verified Tabler camera asset and the focused public-copy correction. Deployment and final fellowship acceptance requirements remain pending; no public release is claimed.

Turn a topic, optional facts/preferences and one of three tastes into a coordinated campaign. The model proposes a bounded creative plan; validated software renders four adapted formats. Inspect the JSON/rationale, edit copy, download native-size PNGs or portable HTML. AI and fallback are visibly distinguished.

## Review locally

The existing development server is at **http://localhost:3000**. Reuse it. If it is not running:

```powershell
npm ci
npm run dev
```

1. Start with `GEMINI_ENABLED=false` as in [the placeholder example](.env.example); no key is needed for fully functional local planning. PowerShell: `$env:GEMINI_ENABLED="false"; npm run dev` (or `npm run start` after building). Restart an existing server when its environment changes. The server requires exact `GEMINI_ENABLED=true` plus valid credentials for inference; public AI use requires separate eligible-use approval. Keep keys in ignored server configuration, never `NEXT_PUBLIC_`.
2. Enter a topic and optional audience/facts/preferences; choose Bold Street, Minimal Swiss or Festive Pop; click **Generate campaign**. The initial state is empty; the optional sample button loads an explicitly labelled v1 fixture without AI. With inference disabled, auto mode also uses the independent local planner with zero provider calls. Enabled auto mode may send the brief to Google—avoid private information.
3. Use Design & spec for rationale, the validated JSON and download; View and Checks inspect actual artwork and measurements. Explicit local planning, automatic fallback, AI and manual provenance remain distinct. **Use local planner · no AI** demonstrates independent fallback with no provider request. Review factual copy before publishing.
4. Compare four platform previews and export each PNG. Draft taste applies to the next generation; changing it leaves the current campaign intact with a notice. Copy/composition/palette refinements apply locally to the displayed campaign and are labelled manual. Failed generation preserves the previous campaign.
5. Export HTML/JSON. V3 HTML contains full-size inline posters, embedded approved fonts and their OFL notices, and intentionally scrolls offline. Unsupported scripts and legacy fonts can still vary by device. Excessive copy triggers a warning and export refusal rather than clipping.

The focused M1 correction keeps recognized missing-input statements and planning directions in interpretation metadata, shows missing-detail warnings, and avoids repeating the headline as support. Negative factual copy remains public. A subjectless brief returns an explicit 422 response and preserves the previous artwork. See [the correction and final audit](docs/M1_CORRECTION.md) for before/after evidence, tests, exact proposed commit contents and remaining limitations.

No authentication, database, payments or image-generation dependency. M0–M4 are accepted at `cad6bfcc3fb1da985ffd804be00afd6fc910f34a`. Current M5-B authorization covers release corrections and quota-free local verification only; staging, commits, pushes, deployment, visibility/licensing changes, live inference and submission remain separate gates.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
npm test -- --output=test-results/m5-next-review
```

Browser tests reuse localhost:3000 and installed Google Chrome in headless mode; they do not download a browser or start a server. Choose a new output directory for each evidence-bearing run: Playwright cleans the selected directory. Test exports/screenshots are ignored under `test-results/`. See [testing evidence and limits](docs/TESTING.md).

Historical live evaluations are not routine checks and must not be rerun without a new bounded owner authorization. The completed records remain in docs/evidence; no fresh inference was performed for M5-B.

## HTTP API

The integration endpoint returns actual styled HTML, the validated DesignSpec, interpretation, provenance and all four native sizes. This command was executed successfully against the local production build in explicit no-AI mode:

```powershell
curl.exe --fail-with-body --json "@docs/example-render-request.json" http://localhost:3000/api/render --output campaign-response.json
```

The response's `html` is a complete self-contained document. Save it as HTML and open it in a browser; await `window.yarcCampaignReady` before using the measured result. Server metadata explicitly says `requires-browser-verification`, never export-ready. Browser quality failures refuse the affected format. `GET /api/notices` serves applicable preserved package/font/asset notices in the running app; see [notice records](THIRD_PARTY_NOTICES.md). [Full API contract](docs/API.md). Existing JSON-only `/api/generate` and v1 `/api/design-spec` remain compatible.

Native sizes: Instagram portrait **1080 × 1350**, square **1080 × 1080**, YouTube **1280 × 720**, LinkedIn **1910 × 1000**. Native canvases intentionally scroll in the portable document.

## Current complete intermediate specification

This is the complete validated v3 result of the actual local curl request above, with `deterministic-fallback` provenance and `requested-local` metadata, not Gemini generation. [Machine-readable source](docs/example-design-spec-m5.json).

```json
{
  "version": 3,
  "provenance": "deterministic-fallback",
  "campaign": {
    "topic": "Campus robotics workshop for students.",
    "eyebrow": "For students · 12 teams",
    "headline": "Campus robotics workshop",
    "supportingText": "26 November 2026 at 18:30 IST.\nVenue: Lab A; Entry ₹150.\nRegister at https://example.org/workshop."
  },
  "taste": "minimal-swiss",
  "palette": {
    "background": "#dcecf0",
    "ink": "#163438",
    "accent": "#00616b",
    "secondary": "#bcd9dd"
  },
  "typography": {
    "family": "neutral-sans",
    "headlineScale": 0.85,
    "case": "sentence"
  },
  "composition": {
    "layout": "swiss-grid",
    "spacing": 80
  },
  "decoration": {
    "motif": "orbit",
    "density": 1,
    "illustration": "abstract"
  },
  "rationale": "Minimal Swiss: swiss grid with swiss ice colours and robot visuals, selected from subject and information density. Publishable copy retained; recognized instructions stay in metadata. Formats resolve their own text/visual regions and measured corrections preserve all supplied copy.",
  "artDirection": {
    "variant": "swiss-grid",
    "palette": "swiss-ice",
    "visual": "robot",
    "emphasis": "display",
    "information": "grid",
    "adaptation": "balanced",
    "treatment": "subject-led"
  }
}
```

## Historical M1 example intermediate JSON specification

The current M2 engine also provides a [complete actual v3 example](docs/example-design-spec-v3.json): local generation with an explicitly manual composition selection. V3 adds registry-backed art direction while historical v1/v2 continue to render unchanged. The full [M2 report](docs/M2_REPORT.md) records actual screenshots/exports, limits, approved font integration and the two focused live outcomes (one accepted AI plan; one validation-failed local fallback).

This is a **complete DesignSpec v2 from an actual live browser generation**, not a mock. The HTTP envelope separately includes interpretation and source/model/timing/usage/fallback metadata. The [machine-readable example](docs/example-design-spec.json) is validated against [designSchema](src/lib/design.ts). The [original v1 fixture example](docs/example-design-spec-v1.json) is retained for compatibility.

```json
{
  "version": 2,
  "provenance": "gemini",
  "campaign": {
    "topic": "Chai stall opening near campus.",
    "eyebrow": "NEW NEAR CAMPUS",
    "headline": "CHAI STALL OPENING",
    "supportingText": "An invitation for students to grab a cup at the new campus chai stall.",
    "cta": "VISIT US"
  },
  "taste": "bold-street",
  "palette": {
    "background": "#efe943",
    "ink": "#20231e",
    "accent": "#c84225",
    "secondary": "#fff9e9"
  },
  "typography": {
    "family": "condensed-sans",
    "headlineScale": 1.1,
    "case": "uppercase"
  },
  "composition": {
    "layout": "street-stack",
    "spacing": 60
  },
  "decoration": {
    "motif": "sticker",
    "density": 3,
    "illustration": "cup"
  },
  "rationale": "Applied the bold-street taste profile with condensed uppercase typography, heavy rules, and a cup illustration to create an energetic street poster look for the campus chai stall announcement."
}
```

Final submission acceptance **ENG-03** requires keeping this example in the final README and refreshing/revalidating it whenever the final schema changes; do not replace it with an abbreviated response or placeholder.

## Project map

| Path | Purpose |
|---|---|
| src/lib/design.ts | Zod contracts, types, fixtures, presets and format registry |
| src/lib/generation/ | Request/plan/response contracts, factual heuristics and independent planner |
| src/server/ | Server-only runtime, injectable Gemini REST transport and bounded orchestration |
| src/components/poster.tsx | Adaptive HTML/SVG renderer, measured text fitting, preview scaling |
| src/components/studio.tsx | Manual brief/copy, tastes, JSON inspector and downloads |
| src/lib/export.ts | PNG and portable HTML export |
| src/app/api/design-spec/route.ts | Deterministic HTTP interface |
| src/app/api/generate/route.ts | Product generation HTTP interface |
| tests/studio.spec.ts | Schema, HTTP, browser, overflow and export checks |
| tests/generation.spec.ts | Repeatable M1 tests, mocked transport and real no-AI endpoint |
| evaluation/ | Explicit live-only model/browser evaluation, excluded from normal tests |

## Authoritative documentation

| Document | Owns |
|---|---|
| [AGENTS.md](AGENTS.md) | Persistent instructions, authorization boundaries and engineering discipline |
| [Requirements](docs/REQUIREMENTS.md) | Official OFF identifiers, internal ENG criteria, coverage and evidence links |
| [Architecture](docs/ARCHITECTURE.md) | Current pipeline, module boundaries and approved architectural direction |
| [API](docs/API.md) | Implemented endpoint contract/curl and planned generation-route relationship |
| [Testing](docs/TESTING.md) | Executed checks, dates, artifacts, thresholds and verification exclusions |
| [AI/API disclosure](docs/AI_DISCLOSURE.md) | Actual no-AI runtime, provisional strategy and user-provided feasibility measurements |
| [Research](docs/RESEARCH.md) | Commercial/repository/library candidates, adoption decisions and C1/C2 receipt/review status |
| [Roadmap](docs/ROADMAP.md) | M0–M5, priorities, existing concern register, deferred ideas and archive policy |
| [Third-party notices](THIRD_PARTY_NOTICES.md) | Actual dependencies, licenses, preserved notices and distribution review gaps |
| [M5 candidate report](docs/M5_REPORT.md) | Current release corrections, actual verification, remaining production gates |
| [M0 report](docs/M0_REPORT.md) | Historical delivery and changed-file inventory |
| [M1 report](docs/M1_REPORT.md) | Current implementation, actual checks, model results and remaining limits |

Runtime dependencies added: Zod for one validated/type-inferred contract and [html-to-image](https://github.com/bubkoo/html-to-image) for browser DOM rasterization. Playwright is development-only browser verification. Existing Next.js 16.4.6 / React 19.3.0 / TypeScript / custom CSS remain in place.

Public deployment and broader design/frontend/quality work remain pending. Model evidence and unknown billing details are explicit in [AI/API disclosure](docs/AI_DISCLOSURE.md). Official submission deadline supplied by the user: **26 November 2026, 11:59 PM IST**; maximum internal completion deadline **25 November 2026, 3:00 PM IST**; the official deadline is contingency only.

## Current evidence and limitations

M0 regression checks are retained alongside M1 unit/API/browser checks. Actual live generation and independent local planning have both produced exported campaigns. The six-brief matrix accepted four primary-model AI outputs and fell back for two; the comparison model accepted none (timeout/unavailable). These are small-sample observations, not reliability guarantees. Historical M0 raster comparison remains same-machine app/portable-HTML screenshots. M2 separately checks actual downloaded PNGs against native DOM at the unchanged tolerance; neither establishes cross-device or production fidelity. [Precise evidence](docs/TESTING.md).

The fixed cup is now restricted to relevant briefs, with neutral/no-illustration paths elsewhere. Readability, composition variety, limited semantic heuristics, in-memory quota limitations and cross-device fonts remain [roadmap concerns](docs/ROADMAP.md#existing-concern-register). Very detailed briefs may exceed a format's capacity and refuse export. Official requirements specify aspect ratios; exact pixels and local quality controls are internal choices. A build, mock or structural validator alone does not close the final checklist.

Intended deployment is Vercel after separate authorization. C1's palette and C2's untested renderer remain unintegrated; subsequent advisory references do not authorize wholesale code reuse. The M0 renderer is preserved and narrowly extended for M1, not replaced by a reference application.
