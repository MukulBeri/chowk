# Chowk — Put your idea on the wall.

Chowk is an independently directed project by Mukul Beri, developed with AI-assisted implementation, research, design exploration and testing.

Turn a topic and visual taste into a coordinated HTML campaign. Explore local concepts, refine copy and composition, adjust supported elements, save projects in this browser, and export four native formats.

**Submission configuration: independent local planning, external inference disabled.** Chowk at [chowk-studio.vercel.app](https://chowk-studio.vercel.app) passed owner-accepted bounded M11-D protected hosted qualification on 26 November 2026 at application source `710373b`; the [previous address](https://yarc-create.vercel.app) was also retained. At the M11-D/M11-E checks, the [GitHub repository](https://github.com/MukulBeri/chowk) was private and production required authentication. These are dated verification findings, not permanent access settings or an anonymous evaluator-access pass. [Release status](docs/RELEASE_STATUS.md) distinguishes actual hosted checks, retained-plan export replays and unresolved hosting/native-package qualification. No fresh AI reliability or unconditional artistic acceptance is claimed.

## Create and refine

1. Open the homepage or `/create`, enter a topic and optional public facts/preferences, then choose a taste. Generation is explicit; no brief is placed in a URL.
2. Choose Standard or Creative-led. Creative-led separates recognized facts from instructions and offers deterministic editorial concepts. Composition alternatives rearrange a selected concept; formats adapt the same campaign.
3. Refine applied copy, palette, composition, typography, spacing or artwork. Edit elements supports direct selection, bounded drag/resize, shared and per-format overrides, keyboard controls, Undo/Redo and reset. Public factual text cannot be hidden or silently discarded. This is an existing-element editor, not arbitrary layer authoring.
4. Inspect the actual DesignSpec/rationale and measured checks. Download each native PNG, four-format portable HTML and matching JSON. Impossible copy or missing resources can refuse export instead of clipping.
5. Use Local projects to explicitly save, reopen, rename, duplicate or delete a validated campaign. Image layers and format overrides are restored. Deletion requires confirmation; quota/conflict failures preserve the last saved version.

**Projects stay on this browser, device and origin.** They are not cloud-synchronized, encrypted or automatically backed up. Unsaved changes and undo history do not survive reload. Clearing site data/private browsing can remove saves. JSON/HTML are manual artwork backups; this release does not import project JSON or migrate storage to a new hostname. Private image rights remain unverified; local editing does not authorize publication.

## Three tastes, four formats

| Taste | What changes |
|---|---|
| Bold Street | Condensed Anton, strong uppercase hierarchy, assertive colour/strips and stacked or editorial compositions |
| Minimal Swiss | Inter, disciplined grids and axes, restrained palettes and editorial spacing |
| Festive Pop | Rounded Fredoka, bright palettes, playful framing, offset blocks and expressive rhythm |

Every taste has supported composition/palette choices. The deterministic HTML/CSS/SVG renderer resolves format-specific geometry; it does not crop one portrait to every size.

| Platform | Native canvas | Ratio |
|---|---|---|
| Instagram portrait | 1080 × 1350 | 4:5 |
| Instagram square | 1080 × 1080 | 1:1 |
| YouTube thumbnail | 1280 × 720 | 16:9 |
| LinkedIn landscape | 1910 × 1000 | 1.91:1 |

Desktop previews are side by side; smaller screens stack them. Preview scaling never changes native exports. HTML embeds approved fonts and applicable notices and scrolls at native size offline. Geometry checks do not certify artistic excellence, factual truth, social-size legibility or universal browser fidelity.

## Run locally

Use Node 24.x and the existing installed toolchain. Browser tests use installed Google Chrome. For a fresh checkout only:

```powershell
npm ci
$env:GEMINI_ENABLED="false"
$env:NEXT_TELEMETRY_DISABLED="1"
npm run build
npm run start
```

Open http://localhost:3000; the studio is at http://localhost:3000/create. Reuse an already-running server. [Example configuration](.env.example) contains placeholders only. No API key is needed for the local planner; never expose credentials through browser configuration. These are setup instructions, not authorization to reinstall, activate inference or deploy an existing workspace.

Metadata defaults to the owner-verified `https://chowk-studio.vercel.app`. Omit `CHOWK_PRODUCTION_ORIGIN` or set it to exactly that origin; stale or different overrides fail the build instead of publishing misleading canonical URLs. The old domain remains available, but browser-local Projects are separate on each origin and cannot be automatically transferred. Keep the same localhost hostname/port to retain access to local Projects. The physical workspace has not moved.

## HTTP integration

`POST /api/render` returns actual styled HTML, `sizes`, the validated `spec`, `interpretation`, `metadata` and browser-readiness information. The official `POST /generate` spelling is illustrative; this is the implemented callable contract. JSON-only `/api/generate` and deterministic v1 `/api/design-spec` remain compatible; `/api/concepts` is local-only.

This quota-free curl request is runnable with the local application above:

```powershell
curl.exe --fail-with-body --json "@docs/example-render-request.json" http://localhost:3000/api/render --output campaign-response.json
```

Or supply an arbitrary brief directly:

```sh
curl --fail-with-body http://localhost:3000/api/render \
  -H 'Content-Type: application/json' \
  --data '{"topic":"A neighborhood reading circle.","details":"Bring a book. No sales.","taste":"minimal-swiss","mode":"local","treatment":"creative-led"}'
```

Save the response's `html` string as an HTML file and open it. Await `window.yarcCampaignReady`; readiness requires state `ready` and every format's `exportReady=true`. HTTP 200 alone is not export readiness. Keep embedded fonts/notices. At the recorded M11-D/M11-E checks, production required arranged access; an anonymous login redirect is not a successful API response. Verify access from the evaluator context after any separately authorized change. [Complete API contract](docs/API.md).

Once separately authorized production access and the target release are verified, use the same request against `https://chowk-studio.vercel.app/api/render`. This is the intended integration URL, not a claim that anonymous curl currently works:

```sh
curl --fail-with-body https://chowk-studio.vercel.app/api/render \
  -H 'Content-Type: application/json' \
  --data '{"topic":"A neighborhood reading circle.","details":"Bring a book. No sales.","taste":"minimal-swiss","mode":"local","treatment":"creative-led"}'
```

## Complete inspectable example

Recorded **local M5 v3** result, compatible with the current schema: deterministic fallback with requested-local provenance, not new Gemini output or a current M8 benchmark. The full [machine-readable specification](docs/example-design-spec-m5.json) is preserved; manual editing fields are optional.

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

## Disclosure, rights and verification

The default submission configuration makes no external inference request. Optional Gemini structured planning, disabled private Meta adapters, historical measured results, failure/fallback behavior, unknown costs and development assistance are described in [AI/API disclosure](docs/AI_DISCLOSURE.md). Development assistance is separate from runtime generation; replayed or injected responses are not fresh model acceptance.

Original-code rights are described in [RIGHTS.md](RIGHTS.md); no permissive open-source grant has been selected. Third-party packages, approved OFL fonts and the adopted MIT Tabler camera retain their own [licenses/notices](THIRD_PARTY_NOTICES.md), served by `GET /api/notices` and embedded where applicable. When distributing artwork containing the copied camera, keep its [MIT notice](docs/licenses/Tabler-MIT.txt) with the distribution materials, including for PNG; a bare PNG does not automatically carry the HTML notice. Target-native distribution and private imagery rights remain qualified, not blanket-cleared.

The accepted local checkpoint passed **248/248** cases, lint, typecheck and build. Its [report](docs/M8_REPORT.md) distinguishes actual native downloads from mocks and retained private evidence. Current engine functionality reuses that evidence; release-presentation checks are reported separately. Generated `test-results/` artifacts and owner-review ZIPs are private local evidence, not files promised in a public checkout.

The historical headed PNG comparison remains failed/open at **2.7366536458% against 1.5%**. Current headless comparisons do not erase it. Local interpretation and graphics remain finite; literal/repetitive copy, unused space and dense-text fitting are known limits. Human review is required.

## Project documentation

[Architecture](docs/ARCHITECTURE.md) · [Requirements](docs/REQUIREMENTS.md) · [API](docs/API.md) · [Testing](docs/TESTING.md) · [Roadmap](docs/ROADMAP.md) · [Research](docs/RESEARCH.md) · [Release status](docs/RELEASE_STATUS.md)

Authentication/accounts, cloud storage, collaboration and direct social publishing are planned after submission. Historical reports and measured evidence retain their original outcomes and attribution. Public repository/evaluator access and final fellowship submission still require explicit approvals.
