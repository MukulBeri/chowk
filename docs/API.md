# Design specification API (M0)

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

## Future product generation endpoint (planned only)

| Boundary | Current / intended responsibility | Status |
|---|---|---|
| POST /api/design-spec | Deterministic fixture/manual input → validated DesignSpec plus format metadata; does not interpret a brief or call AI | Implemented and tested in M0; preserve its current contract |
| POST /api/generate | Product brief/taste → interpretation, creative planning, provider orchestration, validation/quality decisions → spec compatible with the renderer and honest provenance | Provisional M1 plan; no handler exists, no working curl or error/fallback behavior can be claimed yet |
| External Gemini API | Server-side provider transport used behind product orchestration, with credentials never sent to the browser | Not integrated; model identifiers/evidence in AI_DISCLOSURE.md |

`/api/generate` is not an alias for `/api/design-spec` and is distinct from the external Gemini API. The future route should reuse the specification/validation/preset/format/rendering boundary, not expose a provider's unrestricted response or turn the fixture utility into simulated AI. It need not make an internal HTTP request to `/api/design-spec`; shared pure functions are preferable where suitable. Keep M0 route compatibility unless a deliberate migration/deprecation is reviewed and documented.

Before implementing/shipping M1, define and test the generation request (topic, taste and only approved contextual fields), response (validated spec, live/fallback provenance, rationale and appropriate usage/timing metadata), input/body limits, provider timeout/quota/invalid-response behavior, and independent deterministic fallback. A useful valid fallback should be visibly identified; inability to produce a safe valid spec must return an explicit failure rather than a falsely successful fixture. Exact HTTP statuses and wire fields remain decisions to verify, not an implemented contract.

M1 acceptance also requires a **new working curl example for `/api/generate`**, updated AI/API disclosure and failure-path tests. The curl above proves only the current M0 endpoint. No credentials or environment configuration are needed for this consolidation; add placeholder-only `.env.example` when a later authorized integration actually requires it.
