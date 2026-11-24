# Architecture

## M0 implementation

```text
Fixture or manual topic/copy + taste
  → inputSchema → createDesign → designSchema
  → controlled Poster component at native pixel dimensions
  → measured text fit after document.fonts.ready
  → responsive scaled previews / PNG / standalone HTML
```

The UI uses the local pure builder without an HTTP round trip. POST `/api/design-spec` exposes the same validated builder for inspection. It is a deterministic M0 utility, not a creative planner. No credentials or external AI clients exist in this milestone. The future product orchestration boundary is provisionally POST `/api/generate`; its relationship to the current endpoint is documented in [API.md](API.md#future-product-generation-endpoint-planned-only).

## Module boundaries

- `src/lib/design.ts`: input limits, strict versioned schema, inferred TypeScript types, format registry, three taste systems and fixture builder.
- `src/components/poster.tsx`: shared poster markup, inline SVG cup, fixed-size canvases, format-specific positions, measured text fitting and responsive preview scaling.
- `src/components/studio.tsx`: local input state, taste selection, provenance, inspector and downloads. The memoized spec stays stable through export status updates.
- `src/lib/export.ts`: font/readiness/overflow guards, exact-resolution PNG rasterization, dimensions checked before download, standalone HTML serialization.
- `src/app/api/design-spec/route.ts`: bounded JSON body and input validation. No generated code execution.

## Specification contract

Version 1 includes campaign topic, eyebrow, headline, supporting copy and optional CTA; provenance; taste; four six-digit hex colours; controlled typography family/case and headline scale (0.8–1.2); layout enum and spacing (40–90 px); decoration motif/density (1–3); and bounded creative rationale. Strict objects reject additional keys, including HTML/CSS/JS fields. Schema types are inferred rather than duplicated.

Text limits: topic/headline 240, eyebrow 40, supporting copy 180, CTA 60, rationale 600 characters. These are bounds, not a guarantee that every Unicode sequence fits. Unbroken words wrap; text shrinks to a minimum of 24 px for headlines, 20 px for support and 18 px for CTA. If minimum-size text still overflows, export is blocked with an actionable message. Content is never silently ellipsized or truncated. Whitespace is trimmed during validation.

The renderer uses all actionable style groups. Preset metadata (name/subtitle/number) describes the UI, while rationale is shown and inspectable. Arbitrary mixed style combinations are not exposed in the UI; validating a future model output will need semantic taste/palette consistency and contrast checks beyond the structural schema.

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

## Intended later pipeline

```text
Topic + taste → input/brief interpretation → creative strategy + art direction
  → bounded provider response → structural + semantic validation → DesignSpec
  → composition + platform adaptation → HTML/CSS → quality checks → preview/export
                       ↓ provider/response failure
             independent deterministic fallback → same validation/rendering
```

AI may propose controlled creative decisions, never executable HTML/CSS/JS. Future provenance must distinguish live AI, fallback and manual/fixture paths. The current schema intentionally permits only fixture/manual provenance until those paths exist. Validate model responses, enforce content/contrast constraints and show failures honestly; do not silently relabel fixtures as generated campaigns.

Maintain separate responsibilities for input interpretation, planning, provider calls, validation, campaign content, tastes/compositions, platform adaptation, rendering, export, quality checks and frontend state. These are boundaries, not a requirement to create a framework or a separate service for every step. Prefer one structured request per campaign until measurements demonstrate a benefit from more.

M0's strict schema checks shape, enums, ranges and lengths. It does not establish topic relevance, factual truth, palette contrast, audience appropriateness, taste coherence or viewing-size readability. Automated deterministic correction and human visual review are complementary. The known concern register and milestone priorities live in [ROADMAP.md](ROADMAP.md); the current assignment records this direction without implementing it.
