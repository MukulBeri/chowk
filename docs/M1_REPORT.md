# M1 candidate report

Uncommitted candidate for owner review, based on accepted M0 checkpoint `0665dc2`. No push, deployment, visibility/billing change, package installation or M2 work. Existing M0 evidence/archive/checkpoint were not recreated.

**Latest checkpoint:** the owner provisionally accepted this engineering foundation and requested the focused fallback correction. [M1_CORRECTION.md](M1_CORRECTION.md) supersedes the initial candidate inventory/test totals below, records the actual correction and artifact-preservation exception, and provides the exact proposed commit manifest. The historical live measurements below remain unchanged.

## Implementation and decisions

The studio now sends a genuine topic/details/taste request to POST `/api/generate`. Native server-side Gemini REST proposes a typed creative plan; shared structural and semantic checks enforce the selected taste, supported controls, basic contrast and selected factual constraints. One bounded repair is allowed, then independent deterministic fallback. Both feed DesignSpec v2 into the preserved HTML/SVG renderer and existing native PNG/portable HTML/JSON export pipeline. No unrestricted generated code executes.

No SDK/new dependency was needed. `server-only` runtime configuration contains the credential boundary; pure injectable transport/engine functions support repeatable mocks. The configured key is never part of prompts, URLs, client state or evidence. The original `/api/design-spec` still emits the unchanged deterministic v1 contract.

V2 adds live/fallback/manual provenance, up to 1200 topic/2400 supporting characters and cup/abstract/none illustration. Request topic/details are each bounded to 1200, 2200 combined, and 12 KiB HTTP body. Long copy is retained, not silently truncated; no-art layouts give it room, and unfittable text still blocks export. Neutral/no-art paths remove misleading chai imagery for unrelated topics without introducing the M2 motif library.

Interpretation/concept/audience/assumptions/missing information are descriptive metadata; actual palette/type scale/spacing/density/illustration/copy fields affect supported rendering decisions. The provider may retain preset values; the live matrix generally did, so advanced composition diversity is not claimed.

The independent planner classifies technical/cultural/launch/general topics, conservatively retains supplied copy/facts and handles absent information without fabricating names/logistics. Explicit local mode provides a real no-AI endpoint/UI demonstration. Manual edits become manual provenance, stale replies cannot overwrite changed briefs/tastes, genuine errors preserve the previous campaign, and no fake progress stages are shown.

## Reliability, security and quota safeguards

2-second body read; 18-second provider attempt / 38-second engine total by default; at most one repair counted against all budgets; 4096 output-token cap; two distinct active campaigns; duplicate joining; at most 20 successful cached plans for 120 seconds; 8 provider calls/minute, 100/rolling local day and 100K reserved tokens/minute by default (comparison models capped more tightly). Provider errors are sanitized, 429 cools down locally for 60 seconds without automatic retries, redirects are rejected and response size is bounded.

All limits are process-local, reset on restart/HMR and cannot enforce global serverless quotas. No Redis/database/auth/queue was added. `.env.local` remains ignored; `.env.example` is the only permitted environment template. Existing dependency/license records remain applicable; known distribution-notice gaps remain open. No external reference code/assets were reused.

Final static/security checks examined 178 source, documentation/evidence and production/development client files plus root documentation/template inputs: no actual configured-key value was found. `.env.local` exclusion and the narrow example exception were verified; no environment secret is tracked. Package.json/package-lock.json remain unchanged and the license-inventory lock hash still matches. Twelve Markdown documents had no broken local links/anchors; `git diff --check` passed. Independently reading retained PNG headers confirmed 17 normal-run native files (12 M0, 4 actual local, 1 mocked thumbnail) and 12 explicitly replayed-live native files at supported dimensions.

## Provider/model evidence

Both primary `gemini-3.5-flash-lite` and comparison `gemini-3.8-flash` model metadata returned 200/generateContent support. The actual nested REST JSON schema shape succeeded on the primary. Six synthetic public briefs each yielded:

| Model | Measured AI/fallback outcomes | Timing / token evidence |
|---|---|---|
| 3.5-flash-lite | 4 AI accepted during measurement; 2 unavailable fallbacks | Median all responses 1999 ms, range 1064–8833; successful subset 4389 reported tokens |
| 3.8-flash | 0 AI accepted; 5 unavailable + 1 timeout | Median all responses 6057 ms, range 2154–25001; failed usage unknown |

The primary remains provisional because it produced usable outputs and the comparison provided no quality result in this run. Neither is a reliability guarantee. Human review caught unsupported relative timing in one originally accepted product output; the final guard now flags it. The other three retained accepted matrix plans pass final revalidation. The original result is preserved rather than falsely relabelled repaired. No other model was tested or silently substituted.

The final exact-input real browser generation succeeded at **6134 ms / 1080 reported tokens**, then exported four native PNGs, HTML and JSON. A separate genuine 503 fallback, earlier successful/fill-race run and initial fresh-brew finding remain recorded. The documented Windows curl returned HTTP 200 with honest **provider-503 fallback**, not AI success. Actual billed cost was not independently observed; owner reports free-tier access, and failed usage is unknown. Complete measured records and source references are in AI_DISCLOSURE.md.

## API and manual review

```powershell
curl.exe --fail-with-body --json "@docs/example-generation-request.json" http://localhost:3000/api/generate
```

200 can be gemini or deterministic-fallback; inspect metadata. Invalid input/media/body has 400/415/413/408 responses; unexpected unrecoverable app failure is sanitized 503. API.md documents exact fields/settings and the preserved v1 route. README contains a complete validated live v2 example and links to the original v1 fixture example.

At localhost:3000, enter a brief/details, choose a taste and Generate. Inspect interpretation/rationale/JSON/provenance, compare all formats and export. Use local planner to verify no-AI behavior. Edit copy/taste to see manual provenance. Generation failure preserves the prior result; very long copy may require shortening before export.

## Executed verification and output evidence

Lint, typecheck and production build pass; the final repeatable suite has **19 passing tests in 19.0 seconds** (7 original M0 + 12 M1). Explicit live matrix outcome recording completed two tests; the final genuine live browser run passed one test; final guard review and three-taste live-result replay passed two tests. Failures from earlier runs, including sandbox networking, provider 503/timeout, unsupported runtime export, hydration fill and stale development-module diagnostic, are disclosed in TESTING.md with fixes/evidence boundaries. No assertion was disabled to obtain a pass.

Retained screenshots/export evidence in ignored `evaluation-results/` is labelled **replayed-live-**: saved actual model results rendered in three tastes, with 12 PNG dimensions/3 HTML files checked and zero new API requests. Actual no-AI endpoint exports are in `test-results/`, separately from mocked-fallback tests and M0 fixture artifacts. Original live-browser downloads were checked but superseded by later evaluation-output cleanup; no replay is presented as another model measurement. Selected actual command outcomes and all exclusions are in TESTING.md.

## Initial candidate file inventory (before focused correction)

Created:

- `.env.example`
- `src/lib/generation/contracts.ts`, `src/lib/generation/facts.ts`, `src/lib/generation/planner.ts`
- `src/server/gemini.ts`, `src/server/engine.ts`, `src/server/runtime.ts`
- `src/app/api/generate/route.ts`
- `tests/generation.spec.ts`
- `evaluation/playwright.config.ts`, `evaluation/live-models.spec.ts`
- `docs/example-generation-request.json`, `docs/example-design-spec-v1.json`, `docs/M1_REPORT.md`
- `docs/evidence/m1/live-models.json`, `live-end-to-end.json`, `live-browser.json`, `live-browser-attempts.json`, `final-review.json`, `curl-generation.json` (all under docs/evidence/m1)

Modified:

- `.gitignore`, `AGENTS.md`, `README.md`, `THIRD_PARTY_NOTICES.md`
- `src/lib/design.ts`, `src/lib/export.ts`, `src/components/poster.tsx`, `src/components/studio.tsx`, `src/app/globals.css`, `src/app/layout.tsx`
- `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/RESEARCH.md`, `docs/API.md`, `docs/AI_DISCLOSURE.md`, `docs/TESTING.md`, `docs/example-design-spec.json`

Removed: **none**. Package/lock/configuration dependencies and the M0 deterministic route/test source remain unchanged. Generated browser/build artifacts are ignored and not part of the source inventory.

## Coverage, limits and next action

OFF-01/02/03/11/12/14 now have an implemented local creative-intelligence pipeline; three tastes/four layouts/previews/exports remain covered. OFF-13 disclosure includes actual results and unknowns; OFF-15 public evaluator access remains pending. REQUIREMENTS.md owns full official/internal traceability.

Remaining risks: frequent observed provider unavailability; incomplete heuristic truth/semantic checks; conservative fallback/very vague briefs; limited stylistic/composition novelty; supporting/CTA readability at social sizes; excessive-copy overflow refusal; system-font/cross-device differences; non-global quotas; deployment/security/accessibility/load/billing audits and license distribution gaps. A model metadata capability listing or a passing layout test does not resolve these.

Recommended next action: owner reviews the M1 candidate, live findings and artifacts; authorizes fixes/checkpoint separately, then a focused M2 for readability/composition/topic visuals if approved. Do not begin M2 automatically. Proposed eventual commit message: `feat: add validated Gemini campaign planning and independent fallback`.

At the initial candidate checkpoint Git remained on main at M0 HEAD `0665dc2`, with **18 modified tracked files, 20 new untracked files, no deletions and nothing staged**. This historical inventory is superseded by M1_CORRECTION.md. No commit/push/deployment was performed. The configured private remote/archival state is owner-provided context; it was not changed in M1.
