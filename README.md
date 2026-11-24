# Create Lab — M2 accepted milestone

AI-powered HTML/CSS campaign design engine for the YARC Builder Fellowship Create track. **Create Lab is a temporary working title.** M0/M1 are accepted at M1 checkpoint `e4a338f`. M2 adds six structural variants, six palettes, topic-aware procedural SVG, grouped logistics and bounded readable fitting. The owner accepted M2 on 24 November 2026 within its documented verification scope. It remains uncommitted and is not publicly deployed; acceptance does not establish final artistic excellence, universal fidelity, live repair effectiveness or production readiness.

Turn a topic, optional facts/preferences and one of three tastes into a coordinated campaign. The model proposes a bounded creative plan; validated software renders four adapted formats. Inspect the JSON/rationale, edit copy, download native-size PNGs or portable HTML. AI and fallback are visibly distinguished.

## Review locally

The existing development server is at **http://localhost:3000**. Reuse it. If it is not running:

```powershell
npm ci
npm run dev
```

1. Configure the server-only key in ignored `.env.local` using [the placeholder example](.env.example); never use `NEXT_PUBLIC_` or commit real environment files. The default explicit model is `gemini-3.5-flash-lite`. Missing credentials still allow local fallback. Restart the existing dev server only if environment configuration changed.
2. Enter a topic and optional audience/facts/preferences; choose Bold Street, Minimal Swiss or Festive Pop; click **Generate campaign**. Initial artwork is explicitly a sample fixture until generation. Auto mode sends the brief to Google—avoid private information.
3. Inspect AI/fallback provenance, creative interpretation/rationale and the specification. **Use local planner · no AI** demonstrates independent fallback with no provider request. Review factual copy before publishing.
4. Compare four platform previews and export each PNG. Manual copy or taste edits are labelled manual; generate again for fresh AI art direction. Failed generation preserves the previous campaign.
5. Export HTML/JSON. V3 HTML contains full-size inline posters, embedded approved fonts and their OFL notices, and intentionally scrolls offline. Unsupported scripts and legacy fonts can still vary by device. Excessive copy triggers a warning and export refusal rather than clipping.

The focused M1 correction keeps recognized missing-input statements and planning directions in interpretation metadata, shows missing-detail warnings, and avoids repeating the headline as support. Negative factual copy remains public. A subjectless brief returns an explicit 422 response and preserves the previous artwork. See [the correction and final audit](docs/M1_CORRECTION.md) for before/after evidence, tests, exact proposed commit contents and remaining limitations.

No authentication, database, payments or image-generation dependency. Billing, staging/commits, remote publishing, deployment, additional assets/dependencies/live calls and M3 require separate authorization. M2 is owner-accepted and uncommitted. Exact-manifest staging and curated M2 archival are authorized; the commit remains separately gated.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
npm test -- --output=test-results/m2-next-review
```

Browser tests reuse localhost:3000 and installed Google Chrome in headless mode; they do not download a browser or start a server. Choose a new output directory for each evidence-bearing run: Playwright cleans the selected directory. Test exports/screenshots are ignored under `test-results/`. See [testing evidence and limits](docs/TESTING.md).

Live evaluation is separate and opt-in; it spends configured Gemini quota:

```powershell
npx --no-install playwright test --config evaluation/playwright.config.ts
```

The completed six-brief-per-model matrix and browser measurements are in [M1 evidence](docs/evidence/m1/live-models.json); do not rerun it as a routine regression check. Evaluation artifacts go to ignored `evaluation-results/` independently of normal test output.

## HTTP API

```powershell
curl.exe --fail-with-body --json "@docs/example-generation-request.json" http://localhost:3000/api/generate
```

Returns a validated v2 specification, interpretation and honest AI/fallback metadata. Add `"mode":"local"` to request independent planning without Gemini. [Configuration, contract, error/status behavior and curl examples](docs/API.md#m1-product-generation-endpoint). Existing `POST /api/design-spec` remains the deterministic v1 fixture/manual utility using `docs/example-request.json`; it does not call Gemini or the product generation route.

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
| [M0 report](docs/M0_REPORT.md) | Historical delivery and changed-file inventory |
| [M1 report](docs/M1_REPORT.md) | Current implementation, actual checks, model results and remaining limits |

Runtime dependencies added: Zod for one validated/type-inferred contract and [html-to-image](https://github.com/bubkoo/html-to-image) for browser DOM rasterization. Playwright is development-only browser verification. Existing Next.js 16.4.6 / React 19.3.0 / TypeScript / custom CSS remain in place.

Public deployment and broader design/frontend/quality work remain pending. Model evidence and unknown billing details are explicit in [AI/API disclosure](docs/AI_DISCLOSURE.md). Official submission deadline supplied by the user: **26 November 2026, 11:59 PM IST**; internal target **8 PM IST** the same day.

## Current evidence and limitations

M0 regression checks are retained alongside M1 unit/API/browser checks. Actual live generation and independent local planning have both produced exported campaigns. The six-brief matrix accepted four primary-model AI outputs and fell back for two; the comparison model accepted none (timeout/unavailable). These are small-sample observations, not reliability guarantees. Historical M0 raster comparison remains same-machine app/portable-HTML screenshots. M2 separately checks actual downloaded PNGs against native DOM at the unchanged tolerance; neither establishes cross-device or production fidelity. [Precise evidence](docs/TESTING.md).

The fixed cup is now restricted to relevant briefs, with neutral/no-illustration paths elsewhere. Readability, composition variety, limited semantic heuristics, in-memory quota limitations and cross-device fonts remain [roadmap concerns](docs/ROADMAP.md#existing-concern-register). Very detailed briefs may exceed a format's capacity and refuse export. Official requirements specify aspect ratios; exact pixels and local quality controls are internal choices. A build, mock or structural validator alone does not close the final checklist.

Intended deployment is Vercel after separate authorization. C1's palette and C2's untested renderer remain unintegrated; subsequent advisory references do not authorize wholesale code reuse. The M0 renderer is preserved and narrowly extended for M1, not replaced by a reference application.
