# Campaign APIs

## Release origin and inference policy

Configuration A uses the real local planner with external inference disabled. The documented localhost curl remains runnable. The owner-verified production origin is `https://chowk-studio.vercel.app`; it remains protected until separately authorized evaluator access. An anonymous Vercel login redirect is not a JSON/HTML response. Metadata defaults to this origin: omit `CHOWK_PRODUCTION_ORIGIN` or use exactly this value; a stale override fails the build. The old `https://yarc-create.vercel.app` domain remains assigned, but Projects storage is separate per origin and no transfer/import is implemented. Repository links now use [MukulBeri/chowk](https://github.com/MukulBeri/chowk). Endpoint paths, schema versions and `window.yarcCampaignReady` remain compatible. These local changes are not yet deployed.

After protected target verification and separately approved evaluator access, the callable production integration is:

```sh
curl --fail-with-body https://chowk-studio.vercel.app/api/render \
  -H 'Content-Type: application/json' \
  --data '{"topic":"A neighborhood reading circle.","details":"Bring a book. No sales.","taste":"minimal-swiss","mode":"local","treatment":"creative-led"}'
```

Do not supply owner credentials or bypass links to make a shell example work. Public access remains an explicit gate; no production request was made for this documentation change.

## M8 additive manual specification fields

Manual v3 exports/project records may contain `editing: {version:1, shared:{headline:{dx:1,fontScale:0.95}}, formats:{"instagram-portrait":{headline:{dx:2}}}}`. Offsets are percentages of the native canvas; size multipliers are relative to the generated regions. Per-format properties override shared properties. All rendering still uses the canonical renderer and quality checks. Existing generated specs omit this optional field; model-plan and HTTP input contracts are unchanged. This does not add an arbitrary-spec, asset-upload, project-storage or remote editing endpoint. Projects are IndexedDB records on the browser's current origin only.

## M7-R local concept exploration

POST /api/concepts accepts the existing topic/details/taste/mode/treatment request with treatment creative-led. It is always local, even if mode auto is supplied; X-Campaign-Inference is disabled and no runtime provider is reachable from this handler. Response: version 1, source local, concepts with id/label/angle/validated v3 spec and warnings. Up to three genuinely different bounded editorial framings; fewer when unsafe or unsupported. Standard/unknown fields return 400, incomplete briefs 422. This additive route does not change /api/generate, /api/render or legacy endpoints.

Example (replace localhost with an authorized accessible host):

```sh
curl -X POST http://localhost:3000/api/concepts -H 'Content-Type: application/json' --data '{"topic":"A neighborhood print exchange.","details":"Bring one print. No sales.","taste":"minimal-swiss","mode":"local","treatment":"creative-led"}'
```

ArtDirection.design version 1 is an additive creative-led field; historical v1/v2/v3 specifications require no migration. It contains implemented bounded imageRole/typeMode/device and an optional eligible anchorFactId. Clients should retain the complete returned spec and its fact ledger. No arbitrary asset URL/HTML/CSS/script is accepted. No production Meta activation or new hosted route is claimed before release approval.


## M7 compatibility note

No endpoint or default request/response meaning changes. POST /api/render still returns styled HTML, four native sizes and explicit browser readiness. Creative-led v3 may contain a versioned private raster layer after browser-local editing; current HTTP input does not accept uploaded assets, external image URLs or arbitrary specifications. Manual crop/image changes are exported from the current canonical browser revision with matching JSON. Disabled Meta adapters are not a callable public integration or newly enabled provider. See [M7 report](M7_REPORT.md).

## Chowk application routes

The current product identity is Chowk; `/` is the homepage and `/create` hosts the working studio. `/explore` and `/docs` are frontend routes. Existing `/api/generate`, `/api/render`, `/api/design-spec`, `/api/notices`, schema/provenance values, environment names and HTML `window.yarcCampaignReady` remain unchanged. No MCP tool, account/cloud API or publishing API is introduced. Frontend homepage entry explicitly requests creative-led only after the user chooses generation; default HTTP requests and direct studio Standard behavior are preserved. Current product/API guidance is also available at `/docs#api`.

## Opt-in creative-led requests (M6-A candidate)

Existing requests retain their default M5 behavior. Explicitly add `"treatment":"creative-led"` to the existing /api/generate or /api/render request to use fact-led planning and the four recipe registry. No new endpoint exists. /api/design-spec remains the unchanged v1 utility and does not accept this option. Example body:

```json
{"topic":"Launch campaign for a new campus chai stall called Chai Junction.","details":"Masala chai ₹15. Opening on 28 November 2026 at 4 PM near the IET entrance. Target audience: college students. Warm, youthful and affordable. Do not invent offers, discounts or additional products.","taste":"bold-street","mode":"local","treatment":"creative-led"}
```

The successful response envelope is unchanged. Only this opt-in emits v3 artDirection.treatment=creative-led, a validated recipe, and creativeContent version 1 (application-owned public facts, complete fact IDs and source-field UTF-16 offsets). Historical strict consumers should continue omitting treatment. Recipe-only or creative-content additions to legacy specifications fail validation. The provider receives fact IDs, never permission to replace factual clauses; the application binds original public text before semantic validation. Stored v1/v2/v3 without the new treatment use the historical renderer path. New opt-in specs require the updated renderer, not historical deployed clients.

All output still requires browser font/fitting verification. The 1.5 MB HTML, 2 MB response and existing read/time/correction limits are unchanged. There is no server browser, new provider call per format or implicit inference activation. Ledger/linguistic checks remain bounded heuristics, not semantic truth certification. See M6A_REPORT.md for actual evidence and limitations.

## Current M5-B HTML integration

`POST /api/render` accepts the same strict request as `/api/generate`: `{topic,taste,details?,mode?}`. Tastes are bold-street, minimal-swiss and festive-pop; mode is auto (default) or local. Topic/details each ≤1200 characters, combined ≤2200; JSON body ≤12288 bytes. Unknown fields, including model/configuration overrides, are rejected. It invokes the existing campaign engine once, then serializes the same pure native artwork used by the studio.

Actual executed quota-free example:

```powershell
curl.exe --fail-with-body --json "@docs/example-render-request.json" http://localhost:3000/api/render --output campaign-response.json
```

On 200 the envelope is `{spec,interpretation,metadata,html,sizes,rendering}`. The first three fields retain the generation contract; current generation emits v3. `sizes` is the four-format registry: instagram-portrait 1080×1350 (4:5), instagram-square 1080×1080 (1:1), youtube-thumbnail 1280×720 (16:9), linkedin-landscape 1910×1000 (1.91:1). HTML is actual self-contained native artwork, not a loader or an external URL. It embeds approved fonts once per document, their full OFL notices and conditional camera MIT attribution.

`rendering` reports `state:"requires-browser-verification", measuredOnServer:false, readinessPromise:"window.yarcCampaignReady", result:"window.yarcCampaignQuality", maximumCorrectionPasses:3, warnings:[...]`. HTML is bounded to 1,500,000 UTF-8 bytes; JSON response to 2,000,000 bytes. Oversize render responses return 413. No browser service or additional model request is introduced.

Consumer: write the returned `html` to an HTML file/document and allow its authored hash-authorized script. Await `window.yarcCampaignReady`, a Promise resolving `{state:"ready"|"failed",formats:[{id,issues,corrections,exportReady}]}`. The result is also available as `window.yarcCampaignQuality`. Only per-format `exportReady:true` after font/fitting/geometry checks permits use as measured artwork. `data-ready=true` means measurement settled, including failure; it alone is insufficient. Missing scripts stay pending; missing fonts fail closed after at most ten seconds. Browser geometry is not artistic/factual certification or universal device fidelity. There are no download buttons in this integration document; use the existing studio for canonical PNG/HTML exports.

All request readers now require an exact application/json media type (case-insensitive; valid parameters and UTF-8 charset accepted), fatal UTF-8 decoding, bounded streaming size and a two-second read deadline. Statuses: 400 invalid UTF-8/JSON/request schema, 408 read timeout, 413 size, 415 MIME/charset, 422 subjectless brief, 503 unavailable internal generation/render resources. They never return private rejected provider content. Legacy /api/design-spec retains its 8192-byte limit and successful v1 shape. /api/generate retains its successful JSON envelope; neither legacy endpoint has become an HTML endpoint. Responses are no-store.

`X-Campaign-Inference: disabled|enabled` reports server policy on generate/render responses; it exposes no key/model secrets. Only exact server environment `GEMINI_ENABLED=true` can opt in. Unset/false/other values fail closed, even with a configured key; auto returns independent local generation, fallbackReason=disabled, model=null and attempts=[]. Request fields/headers cannot enable it. Explicit local returns requested-local. The studio labels AI-disabled operation separately from provider failure.

`GET /api/notices` delivers preserved package notices plus exact local supplement, Tabler MIT and three OFL texts as UTF-8 plain text, accessible from the studio. A failed notice read returns safe 503. Low-risk response headers prohibit framing/object embedding and MIME sniffing and set strict-origin-when-cross-origin referrers; the studio CSP deliberately leaves approved inline artwork, fonts and Next hydration functional. Returned HTML has its separate restricted hash-based script CSP.

Current evidence: [M5 report](M5_REPORT.md), [local request](example-render-request.json), [actual complete spec](example-design-spec-m5.json). Historical sections below retain earlier milestone scopes; current successful generation specs are v3, not the historical v2 description.

M4 compatibility: endpoint/request/provenance contracts and schema version 3 remain in place. New generated plans may include optional artDirection.treatment="subject-led" and one of the registry-approved subject visuals. New visual values require that treatment; taste/variant/palette constraints remain strict. Historical v3 with no treatment retains its prior renderer path; v1/v2 remain valid. [Actual local M4 example](example-design-spec-m4.json) and M4_REPORT.md document the compatible extension. Missing facts/instructions stay in interpretation metadata; no raw failed provider content is exposed.

## M2 validation diagnostics (additive metadata)

Failed plan-validation attempts include optional `metadata.attempts[].validation`: `{ stage: "structure" | "semantic", issues: [{ code, path, limit?, categories? }], truncated }`. Structural examples are `too-large` at `campaign.cta`, limit 60, and `invalid-value` at `artDirection.visual`; semantic codes distinguish factual/name, registry/style and contrast failures. A strict schema permits at most 20 entries and fixed known paths/codes. Historical envelopes without this field remain compatible.

The focused M4 correction adds `planning-instruction-in-copy` for recognized metadata declarations/directions in public artwork, honoring explicit input-side copy labels. Factual validation uses the shared interpreted public content; recognized missing-input statements do not become required public facts. `missing-supplied-fact` may additionally carry at most eight static `categories`: date, time, timezone, currency, quantity, url, contact, identifier. They describe the unchanged factual-token difference, never private values or rejected copy, and reach bounded repair guidance. Historical diagnostics without categories remain valid. This cannot identify the omitted fact in the original M4 live rejection. See [correction evidence](M4_CORRECTION.md).

Diagnostics include no rejected plan/value, unknown property name, raw Zod message, brief excerpt or provider body/secret. Unknown paths become `$`; bounds come from the controlled schema. Existing studio generation details retain/display these safe entries. Original codes plus static field-specific guidance reach the single permitted repair; no extra call or content-log infrastructure was added. Provider `invalid-output` remains a distinct aggregate transport/envelope/JSON/finish failure without plan-validation details.

The quota-free follow-up removed contradictory legacy-palette permission and corrected the ordinary `Entry Fee:` label's false entity rejection. All factual and registry constraints remain. The original live failure cause is still unknown. [Investigation evidence](evidence/m2/validation/investigation.json).

## Deterministic design specification (M0, preserved)

`POST http://localhost:3000/api/design-spec`

Local deterministic endpoint. No auth, secrets, model calls, persistence or usage charges. It returns a specification, not AI-generated text or a rendered image. The studio uses the same builder locally; changing inputs does not require network access.

## Working example

From the repository root, Windows PowerShell (use curl.exe to avoid the legacy curl alias):

```powershell
curl.exe --fail-with-body --json "@docs/example-request.json" http://localhost:3000/api/design-spec
```

macOS/Linux:

```sh
curl --fail-with-body --json '{"taste":"bold-street","topic":"Chai stall opening near campus."}' http://localhost:3000/api/design-spec
```

The Windows file-based command is the example exercised during M0 verification; see TESTING.md.

## Request

Content-Type must be `application/json` with valid optional parameters and UTF-8 encoding. Maximum body size is 8192 bytes, including streamed bodies. Unknown fields are rejected.

| Field | Type / bounds | Required |
|---|---|---|
| taste | bold-street, minimal-swiss or festive-pop | Yes |
| topic | Nonblank text, up to 240 characters | Yes |
| headline | Nonblank text, up to 240 characters | No |
| supportingText | Text, up to 180 characters; empty allowed | No |
| cta | Text, up to 60 characters; empty removes CTA | No |

For the exact sample topic with no copy overrides, the result is `experimental-fixture` and uses the shared sample copy. Other inputs are `manual-input`: the headline defaults to the topic and supporting text defaults to empty. No new factual details are inferred. No topic-specific illustration is generated; the cup remains an experimental motif. Copy overrides are literal user text, escaped by React when rendered.

## Success: 200

```json
{
  "aiUsed": false,
  "mode": "experimental-fixture",
  "spec": {
    "version": 1,
    "provenance": "experimental-fixture",
    "campaign": {
      "topic": "Chai stall opening near campus.",
      "eyebrow": "A campus invitation",
      "headline": "Chai.\nMeet campus.",
      "supportingText": "A chai stall is opening near campus. Come say hello.",
      "cta": "See you for chai"
    },
    "taste": "bold-street"
  }
}
```

The example above abbreviates `spec`: the actual response also includes palette, typography, composition, decoration and rationale, plus a top-level `formats` array with all four names, ratios, IDs and native dimensions. `src/lib/design.ts` is the exact executable schema contract.

## Errors

| Status | Meaning |
|---|---|
| 400 | Missing body, malformed JSON or invalid schema; validation errors include an issues array |
| 413 | Body exceeds 8192 bytes |
| 415 | Content-Type is not application/json |
| 405 | Unsupported HTTP method (Next.js route handling) |

No external provider is called, so there is no provider failure/fallback behavior to claim here. Rate limiting, public deployment controls and model error recovery remain later work.

## M1 product generation endpoint

`POST http://localhost:3000/api/generate` interprets/plans a campaign through server-side Gemini and validates the plan. M1 introduced v2; the M2 candidate emits **v3** for current local/new provider plans while historical v2 responses remain accepted. It is distinct from the external Google API and unchanged deterministic v1 `/api/design-spec` utility. Shared pure contracts/planners are reused; it does not make an internal HTTP request to the old endpoint.

```powershell
curl.exe --fail-with-body --json "@docs/example-generation-request.json" http://localhost:3000/api/generate
```

The file-based command avoids PowerShell JSON quoting problems. The existing M0 curl remains valid above. To verify independent fallback without external API use, send this JSON instead (also available through **Use local planner · no AI**):

```json
{
  "topic": "A campus poetry circle.",
  "details": "An invitation to share a poem.",
  "taste": "festive-pop",
  "mode": "local"
}
```

| Request field | Actual bounds |
|---|---|
| topic | Required trimmed nonblank string, up to 1200 characters |
| details | Optional string, up to 1200 characters; defaults empty |
| taste | Required existing taste enum |
| mode | Optional auto (default behavior) or local (no provider request) |

Unknown fields, including model/provider override fields, are rejected. Topic/details combined may not exceed 2200 characters. JSON body is at most 12288 bytes; the body-read deadline is 2 seconds. No auth/database is required; this is not sufficient public abuse protection for every deployment.

### Focused M1 interpretation correction

The local planner separates recognized missing-input declarations (for example, “No schedule or price has been supplied”) and narrow planning directions (“Do not invent event logistics”) from public copy. These remain in interpretation metadata; missing information is also shown in UI warnings. Exact repeated content is not repeated in headline/support. Negative facts such as “No tickets are required” and “The venue is not confirmed” remain public. No date, price, CTA or venue is filled in. `campaign.topic` remains the original input for editing/traceability; it is not an artwork text field.

Both auto/local modes perform this local preflight **before any provider request**. A request containing only recognized missing-information/planning statements, or a subjectless request such as “Help me announce something”, returns **422**, no new spec, and this validated error shape:

```json
{
  "code": "brief-incomplete",
  "error": "Tell us what you are announcing or promoting before generating a campaign. Your previous campaign is preserved.",
  "interpretation": {
    "objective": "Present the supplied subject without adding facts.",
    "audience": "Audience unspecified; no demographic assumed.",
    "concept": "Give the supplied subject a clear Minimal Swiss hierarchy; preserve publishable information.",
    "assumptions": ["No new event, business or product facts have been inferred."],
    "missingInformation": ["A concrete subject or publishable message has not been supplied."]
  }
}
```

Metadata varies with the brief/taste. The studio displays the missing subject/details and preserves the previous campaign; a 422 is not a successful fallback. A concrete subject supplied in optional details can satisfy the preflight. Explicit `Headline:`, `Supporting copy:`/`Supporting text:` or `Public copy:` labels preserve intentionally supplied wording when it would otherwise resemble an instruction. Recognition is bounded English syntax, not general semantic understanding; review ambiguous copy. V1/v2 design schemas, successful response shape and rendering/export bounds remain unchanged.

### Response and statuses

200 returns `{ spec, interpretation, metadata }`. Current `spec` is v3; historical v2 remains valid; `interpretation` contains objective, proposed audience, concept, assumptions and missing information (descriptive, not additional renderer capabilities). `metadata` contains:

- `source`: gemini or deterministic-fallback, matching `spec.provenance`.
- `model`: explicit model used for an AI result (including a cached one); on fallback, null unless provider attempts occurred.
- `fallbackReason`: null for AI success; a sanitized reason code for fallback (including requested-local).
- `totalMs`: measured orchestration elapsed time; not a future latency guarantee.
- `attempts`: at most two entries with outcome, elapsedMs, available input/output/thinking/total token usage, known finish reason and available HTTP status. Missing usage is unknown, not zero cost.
- `cached`: true when a successful plan was reused or an identical in-flight request joined; that response adds no separate provider attempt (`attempts` is empty).
- `warnings`: human review and excessive-copy guidance.

Successful fallback is **200 with explicit fallback source/reason**, never a fake AI success. The independent planner classifies basic technical/cultural/launch/general public content, separates recognized no-invention/missing-input instructions into metadata, preserves negative facts, avoids exact repeated copy and selects the existing taste plus relevant cup/neutral/no-art path. It is conservative and less creative than a useful live plan. A subjectless recognized brief returns 422 instead; ambiguous/detailed/instruction-heavy input may need manual refinement. No public factual copy is silently truncated; overflow refuses export. Interpretation notes remain bounded by their existing schema limits.

| Status | Actual meaning |
|---|---|
| 400 | Invalid JSON/UTF-8, blank/oversized fields, invalid taste/mode or unknown fields |
| 408 | Body could not be read within its deadline |
| 413 | Body exceeds 12288 bytes |
| 415 | Content-Type is not application/json (parameters allowed) |
| 422 | Recognized subjectless/instruction-only brief; interpretation metadata returned, no campaign generated |
| 503 | Unexpected application failure prevented any result; sanitized retry message |
| 405 | Unsupported method, framework handling |

Provider failures normally become 200 fallback: missing credentials, disabled/configuration, local-budget, busy, provider-rate-limit, provider-auth, provider-unavailable, network, timeout, blocked, invalid-output/validation-failed. A genuine 503 application error is distinct from a provider 503 that successfully falls back. Raw provider bodies, credentials and internal exceptions are not returned.

### Configuration and limits

M2 retains the request/envelope, 422 behavior, model and budgets below. V3 adds required `artDirection` to the spec/current provider plan:

```json
{"variant":"swiss-column","palette":"swiss-ice","visual":"circuit","emphasis":"display","information":"auto","adaptation":"balanced"}
```

`src/lib/design-engine/registry.ts` owns exact enums and taste membership. Palette values and legacy style fields must match their selections. Geometry/corrections remain deterministic, with no executable model markup. V1/v2 are not rewritten. The focused owner-authorized live check used three provider calls across two campaigns: cultural v3 accepted initially; fact-sensitive responses failed validation initially and after one repair, so the result is labelled independent fallback. Exact rejected plans/validation reasons are not exposed by the product response. [Complete actual v3 local/manual example](example-design-spec-v3.json).

Set server-only variables in ignored `.env.local`, using [.env.example](../.env.example) as a placeholder reference; do not overwrite an existing configured file or prefix keys with NEXT_PUBLIC_. Environment changes require a server restart to reset the runtime singleton. Never paste secrets into briefs or curl request bodies.

| Variable | Default / behavior |
|---|---|
| GEMINI_API_KEY | Required only for auto-mode provider calls; never returned or logged |
| GEMINI_MODEL | gemini-3.5-flash-lite; allowlisted explicit IDs only: primary, 3.1-flash-lite, 3.8-flash, 4-hydrogen. No silent substitution |
| GEMINI_ENABLED | false forces independent fallback; otherwise auto mode may call Gemini |
| GEMINI_TIMEOUT_MS / GENERATION_TIMEOUT_MS | 18000 per attempt / 38000 engine total; hard config caps 25000 / 40000 |
| GEMINI_RPM_BUDGET / GEMINI_DAILY_BUDGET | Primary defaults 8 / 100, bounded to 12 / 400; comparison caps/defaults 4 / 12; zero disables new provider calls |
| GEMINI_TPM_BUDGET | 100000 conservatively reserved tokens/minute; max 200000; zero prevents calls |
| GEMINI_MAX_OUTPUT_TOKENS | 4096, bounded 1024–8192 |
| GEMINI_CONCURRENCY | 2, bounded 1–3 distinct active requests |

One repair is allowed only for invalid structured/semantic output, within the same total deadline and budgets. Network, timeout, auth, quota and unavailable failures do not trigger transport retries. A 429 creates a 60-second per-instance cooldown. Duplicate auto inputs coalesce; successful results cache at most 20 entries for 120 seconds. Cache/limiter state is process-local, resets on restart/HMR and does **not** guarantee a global Vercel quota. Model-specific owner dashboard observations are not verified global limits. The Node route advertises maxDuration 45 seconds; deployment behavior has not been tested.
