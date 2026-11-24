# Campaign APIs

## M2 validation diagnostics (additive metadata)

Failed plan-validation attempts now include optional `metadata.attempts[].validation`: `{ stage: "structure" | "semantic", issues: [{ code, path, limit? }], truncated }`. Structural examples are `too-large` at `campaign.cta`, limit 60, and `invalid-value` at `artDirection.visual`; semantic codes distinguish factual/name, registry/style and contrast failures. A strict schema permits at most 20 entries and fixed known paths/codes. Historical envelopes without this field remain compatible.

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

Content-Type must include `application/json`. Maximum body size is 8192 bytes, including streamed bodies. Unknown fields are rejected.

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

200 returns `{ spec, interpretation, metadata }`. `spec` is v2; `interpretation` contains objective, proposed audience, concept, assumptions and missing information (descriptive, not additional renderer capabilities). `metadata` contains:

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
