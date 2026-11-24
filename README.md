# Create Lab — M0

Local HTML/CSS campaign rendering prototype for the YARC Builder Fellowship Create track. **Create Lab is a temporary working title. No live AI integration.** M0 implementation and consolidation are accepted for a local Git checkpoint; the complete fellowship submission is not finished.

One sample topic, “Chai stall opening near campus.”, becomes three distinct taste systems and four adaptive platform layouts. Editable manual copy, validated/inspectable JSON, exact-size PNG downloads and a standalone HTML export are included.

## Review locally

The existing development server is at **http://localhost:3000**. Reuse it. If it is not running:

```powershell
npm ci
npm run dev
```

1. Switch between Bold Street, Minimal Swiss and Festive Pop.
2. Compare all four platform previews. Each PNG button downloads that format at native resolution.
3. Choose **Inspect spec** to review rationale/style/content/provenance and download JSON.
4. Open **Edit campaign copy**, enter a long headline and click **Apply copy to campaign**. Topic changes alone do not rewrite your headline; M0 has no creative planner. Manual copy remains the same when switching taste.
5. Choose **Export HTML**, then open the downloaded file offline. It contains all four posters at native dimensions and intentionally scrolls. Installed fonts can differ on another machine.

M0 has no auth, database, payments or AI credentials. The local checkpoint is approved; remote publishing and deployment require separate authorization.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
npm test
```

Browser tests reuse localhost:3000 and installed Google Chrome in headless mode; they do not download a browser or start a server. Test exports/screenshots are ignored under `test-results/`. See [testing evidence and limits](docs/TESTING.md).

## HTTP API

```powershell
curl.exe --fail-with-body --json "@docs/example-request.json" http://localhost:3000/api/design-spec
```

Returns a validated deterministic specification and format metadata, explicitly `aiUsed: false`. [Request/response contract and errors](docs/API.md). Future **POST /api/generate** is the planned product brief/planning/provider/fallback orchestration route; it does not exist yet and is distinct from both this M0 utility and the external Gemini API. [Planned relationship](docs/API.md#future-product-generation-endpoint-planned-only).

## Example intermediate JSON specification

This is the **complete DesignSpec v1**, extracted from the current deterministic endpoint for the sample topic; it is experimental fixture data, not live AI output. The HTTP envelope additionally contains `aiUsed`, `mode` and format metadata. The [machine-readable example](docs/example-design-spec.json) is validated against [designSchema](src/lib/design.ts).

```json
{
  "version": 1,
  "provenance": "experimental-fixture",
  "campaign": {
    "topic": "Chai stall opening near campus.",
    "eyebrow": "A campus invitation",
    "headline": "Chai.\nMeet campus.",
    "supportingText": "A chai stall is opening near campus. Come say hello.",
    "cta": "See you for chai"
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
    "density": 3
  },
  "rationale": "Condensed uppercase typography, tight stacked hierarchy, heavy rules and an oversized cup sticker give the invitation street-poster energy. Wide formats split copy and illustration; tall formats stack them."
}
```

Final submission acceptance **ENG-03** requires keeping this example in the final README and refreshing/revalidating it whenever the final schema changes; do not replace it with an abbreviated response or placeholder.

## Project map

| Path | Purpose |
|---|---|
| src/lib/design.ts | Zod contracts, types, fixtures, presets and format registry |
| src/components/poster.tsx | Adaptive HTML/SVG renderer, measured text fitting, preview scaling |
| src/components/studio.tsx | Manual brief/copy, tastes, JSON inspector and downloads |
| src/lib/export.ts | PNG and portable HTML export |
| src/app/api/design-spec/route.ts | Deterministic HTTP interface |
| tests/studio.spec.ts | Schema, HTTP, browser, overflow and export checks |

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

Runtime dependencies added: Zod for one validated/type-inferred contract and [html-to-image](https://github.com/bubkoo/html-to-image) for browser DOM rasterization. Playwright is development-only browser verification. Existing Next.js 16.4.6 / React 19.3.0 / TypeScript / custom CSS remain in place.

Public deployment, live AI planning, an independent fallback engine and final API cost/performance evaluation remain future work, as required by the M0 boundary. Official submission deadline supplied by the user: **26 November 2026, 11:59 PM IST**; internal target **8 PM IST** the same day.

## Current evidence and limitations

Historical M0 checks: lint, TypeScript and production build passed; seven Chrome tests passed. Twelve actual fixture PNGs had the selected exact dimensions; three portable HTML exports opened offline. The raster comparison was between same-machine app/portable-HTML screenshots—not an automated downloaded-PNG-to-preview comparison or a cross-device fidelity guarantee. Browser tests targeted the development server, not a production deployment. [Precise evidence](docs/TESTING.md).

Fixed cup motifs, supporting-text readability at real display sizes, limited composition variety, semantic validation and cross-device font consistency remain open [roadmap concerns](docs/ROADMAP.md#existing-concern-register). Official requirements specify aspect ratios; the exact pixels, library choices and local quality controls are internal engineering decisions. A build, attractive mock or structural validator alone does not close the final requirement checklist.

Intended deployment is Vercel after authorization; no publishing, M1 or external-reference integration is authorized by consolidation. C1 is a received mocked UI reference whose palette is not approved; C2 is a received untested poster reference with recommendations pending review. The verified M0 renderer remains authoritative.
