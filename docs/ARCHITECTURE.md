# Architecture

## Chowk M6-B/C frontend integration

The route boundary is `/` (marketing/start), `/create` (existing Studio), `/explore` (curated real local outputs) and `/docs` (product/API/transparency). Shared header/footer, original brand assets and scoped site tokens change the interface, not the canonical creative engine. Marketing uses existing Anton/Inter assets; native artwork keeps its accepted inline font/palette/geometry styles. The four API routes, schema versions, environment names, native dimensions and `window.yarcCampaignReady` remain unchanged.

`studio-handoff.ts` validates a versioned, one-shot browser-session draft with a transient-memory fallback for same-client navigation. Only topic/details/taste/treatment transfer; no input is put in URLs or server logs and nothing auto-generates. Invalid entries are discarded. This is not saved projects, cloud storage or a new persistence service. Conditional local Projects is deliberately omitted rather than exposing an incomplete save flow. Future editor/account/cloud workstreams are explicit in ROADMAP.md; no speculative adapters or backend stubs are introduced.

The studio retains committed specification/revision, editable draft, unapplied copy, stale-response cancellation and export lock. Supported manual controls update the same validated DesignSpec, including required legacy illustration compatibility fields when a visual changes. Focused view moves inactive *existing* artboards off-screen with nonzero measurable width, `aria-hidden` and `inert`; it does not mount duplicate renderers, register extra callbacks or replace native export refs. All four roots remain inside the sole revision-tagged export region. The existing inert enlargement snapshot is retained.

The loading mark uses the exact approved four-square geometry, with CSS activation red → ink → dashed → yellow in 400 ms phases over 1.6 s. Its text/wordmark stay stationary. It mounts for actual generation/export/measurement or route suspense only, stops on completion/failure and becomes static under reduced motion. No artificial delays, progress percentages or claimed invisible AI stages exist. Curated gallery WebP files are proportionally resized actual accepted local PNGs, not research-prototype output or fresh AI art. See M6BC_REPORT.md for evidence and remaining release qualifications.

## Targeted M6-A correction

The correction retains the same v3 ledger, schemas, renderer, fitter and export functions. Input-field plurals and bounded style instructions stay metadata; named appositions provide concise titles while their complete source clauses remain immutable facts. Generic title-cased CTA actions are distinguished from names only in the CTA field; a separate safe semantic diagnostic rejects unsupported or contradicted registration actions. No fact guard, repair budget or renderer compatibility gate is removed.

Creative spacing now affects native margins/gaps; type-led adaptation releases artwork. Moderate density no longer mandates Dossier. Taste/recipe/format rules allocate bounded square visual regions and independent, contiguous factual columns (up to three on dense wide canvases); every complete clause stays in DOM reading order. The existing tiles visual gains an original abstract arrangement/study treatment, not a verified product depiction. Portrait Manifesto titles remain stacked; wide titles use an intentional horizontal arrangement.

Creative artboards use a compositor surface (`will-change: transform`) to align native text antialiasing with SVG-image PNG export in tested Chrome. There is no geometric transform, font reduction, changed comparison tolerance or replacement export target. The canonical quality fitter and legacy render branches remain unchanged. This is a measured browser-specific correction, not a cross-device fidelity guarantee. Details and retained controlled trials are in [the correction report](M6A_CORRECTION_REPORT.md).

## M6-A additive creative path

The explicit creative-led request reuses the existing generation engine and v3 renderer. creative-brief.ts classifies bounded English clauses and creates a frozen public fact ledger with stable source IDs. creative-planner.ts derives contextual subject/entity copy; validatePlan binds all public clauses from the ledger, checks complete fact references and rejects reconstructed numeric relationships or recognized negative reversals in addition to the existing safeguards. creativeContent is optional only at the schema boundary and mandatory for this treatment. Default and historical contracts are preserved.

creative-layout.ts resolves manifesto, signboard, editorial and dossier into the existing ResolvedLayout roles. AdvancedPosterMarkup selects trusted lab-derived CreativeVisual JSX and recipe-specific hierarchy; existing fitAndInspect, three correction passes, canonical refs, readiness, PNG/HTML export and HTTP renderer remain authoritative. No second engine or v4 renderer exists. candidates.ts ranks at most three locally derived composition alternatives from one validated base, preserves public content/source, and includes the currently selected recipe. This is neither independent AI concept generation nor persistent history.

The studio's opt-in Planning approach participates in draft/stale-response state. Recipe selection, palette and copy edits commit a new revision; immutable public clauses cannot be removed by the copy editor. Topic edits do not regenerate a fact ledger: regenerate for changed source facts. Exports remain locked to measured applied revisions. Further frontend work should consume these same contracts instead of mounting duplicate canonical artboards.

## M5-B shared HTML integration and release controls

The accepted M4 creative engine, native dimensions, quality thresholds, SVGs, registry, fonts and export implementation remain the baseline. Pure AdvancedPosterMarkup and LegacyPosterMarkup are extracted from the existing components; measured React wrappers retain refs, lifecycle, callbacks and revision behavior. /api/render calls the existing engine once and renders those same components using installed react-dom/server.edge. It never accepts arbitrary specs/markup/scripts from the caller or implements another layout engine. Historical v1/v2 render paths remain valid.

Server rendering does not measure fonts or text. The returned complete document includes trusted self-contained fitAndInspect, original legacy fitLegacyText, font readiness and a small coordinator. The existing two-axis geometry/contrast/overlap rules and at most three bounded passes are preserved. Two inert template alternatives share the actual resolver; only one active canonical native root exists per format, and alternatives are removed after fitting. No facts are removed. Browser results explicitly distinguish pending, ready and failed; font failure and impossible fit refuse affected outputs. Fonts/licenses are fixed-path, SHA-256 checked, cached as a verified bundle and embedded once. User text remains React-escaped outside executable script. An inline-script SHA-256 CSP permits only repository-authored fitting; returned HTML requires no external runtime requests.

configured-engine.ts requires exact server GEMINI_ENABLED=true before even constructing a provider; request data cannot influence it. Default/false operation supports arbitrary local briefs in auto and explicit local modes with zero provider calls. Enabled eligible environments retain the same provider/model, one repair maximum, budgets, timeout and honest fallback. /api/generate and /api/design-spec successful response contracts are unchanged. A shared bounded UTF-8 JSON reader hardens all three endpoints. /api/notices reads only fixed license/font directories; output tracing explicitly includes required font/notice records, without broad workspace tracing.

Inference-enabled limits remain per process, not global: default concurrency 2; reservations 8 calls/minute, 100/day, 100,000 tokens/minute; 18-second provider attempts within 38-second overall planning, route maxDuration 45 seconds. Runtime clamps are in runtime.ts, not new quota policy. Only accepted AI plans cache for up to 120 seconds of eligibility, at most 20 entries; expired entries are cleaned when a subsequent eligible auto request reaches cache handling, not by scheduled deletion. Entries can remain in idle process memory beyond TTL; restart/eviction removes them. Identical in-flight requests may share work. Client abort/stale-response protection does not explicitly cancel engine work; bounded provider work may continue after disconnect. No distributed budget, global cache or persistent storage was added.

The [focused M4 correction](M4_CORRECTION.md) shares one bounded missing-field/list grammar across brief interpretation, local/automatic fallback, provider prompt data and semantic leakage rejection. Complete recognized declarations become interpretation metadata; public facts and explicit copy labels remain content. The factual validator checks that interpreted content, preventing metadata from being falsely required in artwork. It rejects a leaking model plan rather than silently editing it. Missing-token diagnostics expose only optional static categories. Schema v1/v2/v3, native renderer/export, fonts, registry, studio and runtime/repair budgets are unchanged.

## M4 compatible subject-led treatment

New plans remain strict DesignSpec v3 and opt into artDirection.treatment=subject-led. Absence retains historical v3 layout/visual behavior; v1/v2 endpoints/renderers are unchanged. The shared registry also validates seven subject-specific visuals (robot, network, tiles, botanical, aroma, code, camera); they require that treatment. Registry and provider JSON Schema/prompt share the actual capabilities. No renderer accepts model markup. Original native graphics are primary; only the independently vetted static Tabler camera geometry is retained with pinned MIT provenance.

brief.ts recognizes explicit missing-field shorthand without deleting legitimate negative facts. editorial.ts makes conservative short-subject/audience/drink transformations and bounded conceptual headlines; unfamiliar/long/negative/explicitly labelled headlines retain supplied content. Factual token checks are retained and now also preserve selected public negative clauses and explicit venue corrections, with bounded safe repair guidance. These remain heuristics, not a truth engine.

subject-layout.ts allocates taste/variant-specific regions and a full-width landscape information band. Audience/count may move to the kicker; every supplied fact remains in visible copy. Subject-led headlines fit whole words, support uses 34 px minimum (scaled upwards for LinkedIn), and all prior two-axis/bounds/contrast/collision/refusal checks remain. Copy-group sibling bounds/collision checks supplement container measurement. Bounded correction still removes artwork/reallocates support before refusing infeasible copy, never drops content.

The M3 UI/state/ref/revision architecture is unchanged. export.ts adds conditional full Tabler notice text to offline HTML only when the retained camera occurs; PNG capture, readiness, dimensions, locks and font embedding are unchanged. No runtime external asset request or new dependency is introduced. See M4_REPORT.md for executed evidence and limitations.

## M3 studio presentation and state

The approved two-region shell uses scoped UI tokens and Arial/Helvetica, separate from native inline artwork typography/palettes. Studio owns draft topic/details/taste, pending request identity, committed campaign/spec/revision, unapplied copy and export locks separately. A draft change never relabels existing art. Refinement is validated against the displayed result taste/version, makes no AI call and remeasures a new revision. Previous valid campaigns survive pending/error/subjectless/stale responses. Explicit examples, local mode, automatic fallback, AI and manual provenance are distinct.

TastePicker uses native radios and authored miniature styles. StudioArtboard presents PosterPreview unchanged and observes canonical data-ready attributes per revision. The four native roots remain under the sole gallery export ref. An immediate ref lock plus disabled controls prevents concurrent export/campaign mutations; existing export.ts receives a consistent applied revision at native size. Progress status is outside aria-busy artwork so live announcements are not deferred by that busy region.

Contextual native dialogs show current spec/rationale, actual checks or a snapshot. Enlargement clones measured controlled DOM, strips IDs/canonical data attributes and mounts outside the gallery; it creates no renderer instance, callback or export registration. Modal focus is explicitly contained/restored, with Escape handling. JSON inspection captures a coherent snapshot. The gallery describes all visible artwork copy to assistive technology. No native renderer, schema/registry/provider/font/export implementation changed. Details and limits are in M3_REPORT.md.

## M2 controlled creative engine

Focused validation follow-up: `diagnostics.ts` sanitizes structural/semantic failures and provides static repair guidance. `validatePlan` retains v3 field errors when artDirection is present instead of unrelated legacy-parser errors. Engine attempts retain bounded optional diagnostics; the client contract/details view preserves them, and old envelopes remain valid. No raw failed plan/value/message is logged or exposed. The prompt now permits only selected registry colours; name detection recognizes `Entry Fee:` without changing artwork copy or skipping factual checks. Renderer/export/schema versions, model, limits and infrastructure are unchanged by this follow-up.

Current plans emit **DesignSpec v3**. V1/v2 schemas and the legacy renderer remain compatible and are not silently migrated; the v1 deterministic endpoint is unchanged. M2 comparison tests explicitly construct new v3 adaptations while retaining original measured records and campaign copy.

`design-engine/registry.ts` owns six composition IDs, six palette tokens, seven bounded visual choices, taste membership and local selection. `design.ts` validates matching palette/type/legacy fields; the provider contract derives current capabilities from the same registry. Semantic validation rejects incompatible/irrelevant options before the existing repair/fallback flow. No per-platform model call is added.

`layout.ts` resolves native rectangles by variant, ratio, copy density, CTA and adaptation. Complete supporting clauses become groups; URL rows span the grid and receive visual break opportunities without changing text. No-art/dense campaigns reclaim the art area. `advanced-poster.tsx` renders inline controlled HTML/CSS and repository-authored procedural SVG. V3 display roles use approved local Anton 400, Inter variable and Fredoka 600 respectively; supporting roles use Inter. Legacy font stacks stay unchanged. Five unchanged WOFF2 assets plus three OFL notices are bundled; fonts.ts verifies their hashes, waits for relevant faces and supplies portable embedded CSS. Unsupported code points generate system-font warnings; fontSynthesis:none prevents synthetic display weights.

`quality.ts` fits both axes after font readiness and checks role floors, basic contrast, bounds and unintended content/hero overlap. At most three passes expand text/remove art and then allocate additional support space; no copy is dropped. Unresolved defects block exports. Preview details and exported attributes expose corrections/font sizes. Checks do not certify aesthetics, arbitrary glyph coverage or social-scale accessibility.

The existing html-to-image path is retained. Fully inline v3 nodes opt out of computed-style copying to avoid observed library font-size changes; v1/v2 keep original options. V3 PNG explicitly embeds the verified font CSS; portable HTML includes data-font CSS and escaped full notices with no font network dependency. Actual downloaded-PNG comparisons are distinct from offline HTML screenshot parity. See M2_REPORT.md for measured scope, font/source proposals and deployment limits.

## Current M1 implementation

```text
Topic + optional details + authoritative taste
  → POST /api/generate → bounded request validation → local brief preflight
  → per-instance budget/concurrency/cache → server-only Gemini REST
  → CreativePlan shape + factual/taste/contrast heuristics
  → at most one repair within the same time/request budgets
  → DesignSpec v2 → same controlled HTML renderer → four previews/exports
                         ↑
  failure or explicit local mode → independent conservative local planner
```

`src/lib/generation/contracts.ts` distinguishes request, provider plan, renderer spec and response metadata. `facts.ts` canonicalizes complete facts; `planner.ts` checks plan compatibility and implements the independent fallback. `src/server/gemini.ts` is an injectable REST transport; only the `server-only` runtime supplies credentials/environment configuration. `engine.ts` owns repair, provenance and bounded process state. `api/generate/route.ts` owns HTTP input/status/error handling. React imports only shared contracts and the existing renderer, never the provider runtime.

The focused correction adds `brief.ts`: bounded English patterns separate recognized brief declarations/directions from publishable segments, preserving ordinary negative facts. The planner uses public content for copy/category/illustration, removes only exact repeated segments and retains missing information/directions in bounded interpretation metadata. A request with no remaining subject raises `IncompleteBriefError` before provider quota is spent in either mode. The route returns validated-shape 422 metadata without a spec; the studio shows the missing subject and retains prior artwork. Original input remains in `campaign.topic` for editing, not rendered poster text. Successful response and v1/v2 spec schemas are unchanged. This is a deterministic heuristic, not a general semantic parser; see M1_CORRECTION.md.

Gemini may decide concept/copy and supported palette/scale/spacing/density/illustration; it cannot emit executable markup/styles or an unsupported font/layout. The requested taste pins family, case, layout and motif to the existing registry. Interpretation/objective/audience/concept/assumptions/missing information are descriptive metadata. Palette, typography, composition, decoration and campaign copy act on rendering. No C1 redesign or M2 motif library was integrated.

The studio sends actual generation requests, shows truthful loading and AI/fallback/manual provenance, exposes interpretation/rationale/spec, keeps a previous successful result on failure, and aborts/invalidates stale responses when brief or taste changes. Manual edits become `manual-input`. Historical M1/M2 taste selection reapplied a local preset; M3 now keeps draft taste separate and uses the displayed campaign taste for supported local refinement. Explicit local mode demonstrates the same independent planner without manipulating credentials.

### Version reconciliation

The original `designSchemaV1` and `/api/design-spec` retain their fixture/manual contract and limits. `designSchema` is a discriminated union accepting v1/v2; `createDesign` still emits v1 unchanged. V2 extends the same style groups, adds `gemini`/`deterministic-fallback`/manual provenance, supports topic up to 1200 and supporting copy up to 2400 characters, and requires `illustration: cup | abstract | none`. Full request bounds are 1200 topic, 1200 details, 2200 combined; no copy is silently truncated. Cup is restricted to relevant briefs; neutral geometry or no illustration handles unrelated topics. Detailed supporting text uses the freed art region; text that still cannot fit blocks export. V1 canvases/layouts and minimum font/overflow checks remain.

### Reliability and privacy boundaries

Defaults: 12 KiB body/2-second read, 18-second provider attempt, 38-second engine total, one repair, 4096 max output tokens, two active distinct campaigns, 20 cached successful plans for 120 seconds. Exact duplicates coalesce; local fallback is not cached. Default provider budget is 8 calls/minute, 100 calls/rolling local day, 100K conservatively reserved tokens/minute. Comparison models are capped more tightly (4 calls/minute, 12/day). Calls including repairs reserve before dispatch; 429 establishes a 60-second local cooldown without automatic retry. Estimates reserve prompt/schema overhead plus maximum output, not just returned tokens.

These controls are in-memory per process, reset on restarts/HMR, and **cannot enforce a global Vercel/project quota**. Cache data includes brief-derived campaign text for a short TTL; there is no database, content log or persistent runtime history. Request input is sent to Google only in auto mode when credentials/budgets permit. Keys remain headers on fixed-host server fetches, never prompts/URLs/browser bundles; provider redirects are rejected, responses are size-bounded, and provider bodies/errors are not exposed. Transport tests use synthetic credentials; live files contain synthetic public briefs only. Detailed configuration, error/status behavior and limitations are in API.md and AI_DISCLOSURE.md.

Structural/semantic heuristics do not prove truth or excellent art direction. They cover normalized dates/times/currency/units/contacts/IDs, omitted or new protected tokens, selected unsupported claims/placeholders/names, taste consistency and basic contrast. Unknown names, negation, word-number paraphrases, ambiguous dates, novel claims and semantic relevance remain imperfect. False positives may cause a repair or conservative fallback. No semantic safeguard may be described as eliminating hallucinations.

## Historical M0 foundation (preserved)

```text
Fixture or manual topic/copy + taste
  → inputSchema → createDesign → designSchema
  → controlled Poster component at native pixel dimensions
  → measured text fit after document.fonts.ready
  → responsive scaled previews / PNG / standalone HTML
```

M0 used a local pure builder without HTTP. POST `/api/design-spec` still exposes that deterministic fixture/manual utility. The product orchestration route is now POST `/api/generate`; the implemented relationship is in [API.md](API.md#m1-product-generation-endpoint).

## Module boundaries

- `src/lib/design.ts`: input limits, strict versioned schema, inferred TypeScript types, format registry, three taste systems and fixture builder.
- `src/components/poster.tsx`: shared poster markup, inline SVG cup, fixed-size canvases, format-specific positions, measured text fitting and responsive preview scaling.
- `src/components/studio.tsx`: local input state, taste selection, provenance, inspector and downloads. The memoized spec stays stable through export status updates.
- `src/lib/export.ts`: font/readiness/overflow guards, exact-resolution PNG rasterization, dimensions checked before download, standalone HTML serialization.
- `src/app/api/design-spec/route.ts`: bounded JSON body and input validation. No generated code execution.

## Specification contract

Version 1 includes campaign topic, eyebrow, headline, supporting copy and optional CTA; provenance; taste; four six-digit hex colours; controlled typography family/case and headline scale (0.8–1.2); layout enum and spacing (40–90 px); decoration motif/density (1–3); and bounded creative rationale. Strict objects reject additional keys, including HTML/CSS/JS fields. Schema types are inferred rather than duplicated.

Text limits: topic/headline 240, eyebrow 40, supporting copy 180, CTA 60, rationale 600 characters. These are bounds, not a guarantee that every Unicode sequence fits. Unbroken words wrap; text shrinks to a minimum of 24 px for headlines, 20 px for support and 18 px for CTA. If minimum-size text still overflows, export is blocked with an actionable message. Content is never silently ellipsized or truncated. Whitespace is trimmed during validation.

The renderer uses actionable style groups. Preset metadata (name/subtitle/number) describes the UI, while rationale is shown and inspectable. Arbitrary mixed style combinations are not exposed; M1 now adds taste/palette/contrast and factual heuristics beyond this original structural schema, with the limitations documented above.

## Taste and layout choices

| Taste | Typography / hierarchy | Composition / decoration |
|---|---|---|
| Bold Street | Condensed uppercase Impact stack; dense large headline; heavy rules | Left-aligned text, tilted dark cup sticker, raw accent marks, tight 60 px margins |
| Minimal Swiss | Neutral Arial/Helvetica; lighter headline weight, fine rules | Asymmetric grid, 80 px margins, isolated red circular motif, sparse decoration |
| Festive Pop | Georgia serif; expressive headline, warm contrast | Centered tall invitations, rounded dashed frame, golden cup arch, confetti, 64 px margins |

Wide formats split headline and illustration; square and portrait formats use different vertical regions. Swiss retains a left supporting-copy column beside its illustration. This is layout adaptation, not cropping one poster. Full-canvas dimensions never depend on viewport size. A parent transform scales previews, and a ResizeObserver follows container width.

## Export decisions

`html-to-image` is a lightweight browser-side DOM/SVG/canvas approach; no server browser or infrastructure is required. Each capture uses the actual poster node, pixelRatio 1 and explicit canvas width/height. It checks the resulting bitmap dimensions before saving. Export does not capture the scaled preview wrapper.

Poster styles are inline and assets are inline SVG, so portable HTML contains four complete native-resolution posters, no application scripts/stylesheets and no network assets. It uses a restrictive CSP and escaped React text. It preserves editable HTML text and SVG, not a screenshot disguised as HTML. The document intentionally scrolls across full-size canvases for inspection.

M0 references installed system font stacks; it does not bundle or redistribute font files. Font readiness is still awaited. The recorded raster test compares same-machine **HTML screenshots**, not downloaded PNG pixels or other operating systems. Another OS may substitute fonts, and standalone HTML cannot refit text without JavaScript. Cross-device consistency remains unresolved; evaluating bundled fonts requires their actual embedding/redistribution licenses and later cross-device tests. See [TESTING.md](TESTING.md) for the precise evidence boundary.

Primary references: [html-to-image options and browser constraints](https://github.com/bubkoo/html-to-image), [Zod schema API](https://zod.dev/api). Framework behavior was checked in the installed `node_modules/next/dist/docs/` guides for components, layouts, CSS, fonts, route handlers and Playwright, plus the managed instruction generator. Next.js 16.4.6 isolates development output in `.next/dev`; the production build uses `.next` without starting another server. Existing cacheComponents/partialPrefetching config is retained.

## Planning principles retained in M1

```text
Topic + taste → input/brief interpretation → creative strategy + art direction
  → bounded provider response → structural + semantic validation → DesignSpec
  → composition + platform adaptation → HTML/CSS → quality checks → preview/export
                       ↓ provider/response failure
             independent deterministic fallback → same validation/rendering
```

AI may propose controlled creative decisions, never executable HTML/CSS/JS. V2 now distinguishes live AI, independent fallback and manual output while retaining v1 fixture/manual compatibility. Validate responses and show failures honestly; fixtures are never relabelled as generated campaigns.

Maintain separate responsibilities for input interpretation, planning, provider calls, validation, campaign content, tastes/compositions, platform adaptation, rendering, export, quality checks and frontend state. These are boundaries, not a requirement to create a framework or a separate service for every step. Prefer one structured request per campaign until measurements demonstrate a benefit from more.

M0's strict schema checks shape, enums, ranges and lengths. It does not establish topic relevance, factual truth, palette contrast, audience appropriateness, taste coherence or viewing-size readability. Automated deterministic correction and human visual review are complementary. The known concern register and milestone priorities live in [ROADMAP.md](ROADMAP.md); the current assignment records this direction without implementing it.
