# M7-L: offline qualification and conditional live gate

26 November 2026. **Offline resource qualification completed; live experiment blocked before dispatch.** No artistic, milestone, account or production acceptance is implied.

## Authority and preserved baseline

The owner approved bounded resource changes and conditionally approved four Meta inference dispatches, then explicitly required no live inference until current account prerequisites are confirmed. Historical META-0/META-1 access and estimated $0.056910 across seven calls do not establish present credits/billing. No new credential, confidential approval or actual environment file was read.

Starting main/HEAD remains `41bdf94ccaefddaf864998e3da285c86dc4f3f34`, staging empty. The original 59-file candidate and all 174 source hashes matched fingerprint `451deac1e420374ebe3ab864fb42a0a0f90c6284b4e9792c59a8b53af36b5c74` before edits. Final verification confirms all 27 original test/fixture/helper files and all 2,339 sealed M7-R artifact records retain their hashes and sizes. Reports, original failures, private research sources and historical measurements were not rewritten.

## Implemented changes

| Boundary | Qualified value | Preserved safeguards |
|---|---:|---|
| Meta text `/responses` | 1,000,000 bytes | Actual streamed accounting, deadline, fixed endpoint |
| Supported Meta image responses | 11,000,000 bytes | Actual streamed accounting; misleading Content-Length does not bypass it |
| Decoded original | 8,000,000 bytes | Canonical base64, PNG signature, static decode, 2048 per axis / 4 million pixels |
| Server-prepared private layer | 160,000 bytes | Hashes, strict schema, private/unverified rights and source lineage |
| Browser import optimization | 60,000 bytes | Accepted import behavior and original assertions retained |
| Portable HTML / HTTP response | 1,500,000 / 2,000,000 bytes | Existing refusal checks unchanged |
| Explicit qualification session | At most 90 seconds | Normal 38-second session ceiling unchanged; adapter requests <=38 seconds |
| Image worker | Existing 6-second parent / 2-second native operation deadlines | One concurrent worker, bounded JS heap; no OS-level native-memory guarantee |

`assets.ts`, `raster-optimizer.ts`, `meta.ts` and `creative-session.ts` are the only runtime files changed from the reviewed M7-R source. No renderer, production provider selection, environment, model, dependency, registry, creative capability or export tolerance was changed.

Offline request capture exposed a Meta strict-schema mismatch: optional `artDirection.design` and its optional `anchorFactId` were not listed as required. [Meta's strict structured-output contract](https://dev.meta.ai/docs/structured-output) requires every object property to be required, with `additionalProperties:false`. The adapter now represents optional transport values as nullable, removes only those known optional nulls, then applies existing canonical validation. This is a demonstrated static compatibility defect, **not an observed live HTTP 400 or a recovered historical failure cause**.

An additive structurally checked concept-envelope seam allows the existing orchestrator to receive rejected concepts and supply its one repair. Structural/semantic adapter failures receive bounded repair guidance; authentication/quota failures stop. Null malformed entries safely reach schema rejection. Available reasoning usage is preserved; absent usage remains absent. Injected tests prove this path only, not live model compatibility or acceptance.

## Actual offline artwork and transport evidence

Fresh isolated evidence: [M7-L directory](../test-results/m7l-20261126-01/). Three quota-free cases produced **12 actual native PNG downloads**, three matching JSON downloads and three portable HTML downloads:

1. Exact Orbit Clay brief, actual local creative-led plan and local concepts; Minimal Swiss.
2. Exact Field Notes brief, actual local creative-led plan and local concepts; Bold Street.
3. Actual local Chai Junction plan plus the server-optimized historical private Meta I01 image, supplied through an explicitly injected HTTP fixture. This is retained imagery, not a new model result or autonomous asset selection. The chai image was not presented as an Orbit Clay product.

All four native dimensions pass per case: 1080x1350, 1080x1080, 1280x720 and 1910x1000. All supplied ledger facts are checked in every native artboard. Actual downloads match native DOM at **0%** in these 12 focused comparisons; portable browser-export HTML matches at **0%** with outbound HTTP blocked. Thresholds remain PNG <=1.5% at channel delta20 and HTML <=0.1% at delta8. Environment: Windows, headless Chrome, DPR1; exact browser version and quality/correction records accompany each case. These are bounded same-machine measurements, not universal fidelity.

The retained 3,088,102-byte, 1600x1600 I01 source has unchanged SHA-256 `388b6c0a0a32227ed581b7ef0b9f9c70cd726e5ee16d60e6f12c7b9d94942c5a`. The qualified derivative is **143,185 bytes at 1024x1024**, three attempts, versus the retained M7-R 56,589-byte / 576x576 derivative. Opaque JPEG quality82 / 4:4:4 is unchanged. Current RGB RMSE 2.1092 / PSNR 41.6484 dB compares decoded output with the original resized to the derivative's dimensions; it is not an artistic score or a controlled cross-resolution quality ranking.

Actual browser HTML is 785,420 bytes. Direct execution of the **same canonical server renderer** produces 818,691-byte HTML and a 1,015,652-byte serialized result/spec/HTML envelope matching the existing response shape. Its real browser verification reports four ready formats, no quality issues and zero outbound HTTP. This is direct canonical server-function qualification, **not an actual HTTP request accepting an uploaded private specification**; that endpoint does not exist. No competing renderer or test-only production route was added. The Node-only harness treats `server-only` as its compile-time marker; all schema, raster, font-integrity and document-size guards run.

## Qualitative inspection and limitations

Actual native artwork confirms intact Field Notes date/time/IST, venue, first-year audience, 20 seats, entry fee, notebook action, exact URL and **"No certificates will be issued."** Orbit Clay retains collection/category/colours without adding prices, dates, locations or certifications; the supplied missing-information and do-not-invent declarations do not appear in the artwork.

However, Orbit Clay visibly publishes **"Understated editorial direction."** The local interpreter treats this supplied style direction as a fact; headline/support also repeat the collection identity. Field Notes is readable but type-led and illustration-free, with residual lower whitespace. These are genuine remaining planning/creative limitations, not hidden by passing geometry tests. No broader correction or manually authored showcase was substituted during qualification. The larger image improves available raster resolution, not composition intelligence by itself. No local-versus-fresh-model quality conclusion is possible yet.

## Verification performed

| Check | Actual result |
|---|---|
| `npm run lint` | Passed; only pre-existing unused `path` warning in `tests/m5-release.spec.ts` |
| `npm run typecheck` | Passed, final log retained |
| `npm run build` with process-local inference disabled and telemetry disabled | Passed, 14 static-generation entries; existing local metadataBase warning retained |
| Focused `tests/m7l-qualification.spec.ts` | 8/8 passed, including exact streamed boundaries and failure accounting |
| Complete regression, isolated output | **229/229 passed**: all 221 prior cases plus 8 new cases; no original assertion edited |
| Opt-in `evaluation/m7l-private.config.ts` | 3/3 passed; retained-image and two exact local baselines |
| Canonical server HTML in actual browser | Four ready formats, no network, existing ceilings retained |
| Credential helper | PowerShell AST syntax passed; execution blocked by Windows script policy, not tested or bypassed |
| Git whitespace / JSON / integrity | Final machine records retained alongside this report |

Exact commands, run statistics and artifact hashes are in `verification.json` and retained logs under the isolated directory. Initial harness failures remain available: incorrect generation-result property in the new evaluation test, a JavaScript helper containing a TypeScript non-null assertion, unavailable network-process inspection, the script execution-policy denial, and a failed documentation patch. The first focused runner reported eight passing cases but its PowerShell wrapper returned nonzero on native warning output; the subsequent captured run exited zero. No provider failure or live request is inferred from these tooling failures.

## Conditional live preflight and accounting

**Current actual dispatches: 0 of 4.** No request, repair, discovery, warm-up, Gemini call or image edit occurred. Provider latency/token usage and actual charge are unavailable, not zero-valued measurements. Production and local application inference remain disabled; adapter creation remains explicitly injected and default-disabled.

Current [public model documentation](https://dev.meta.ai/docs/models) lists Ember 1.0, Spark 1.3 and Muse Image 1.0. [Published standard pricing](https://dev.meta.ai/docs/pricing-rate-limits), checked 26 November, lists Ember short-context input/output $0.10/$0.50 per million, Spark $1.25/$4.25 per million, and Image $0.01 per generated image. Public documentation is not proof of current account entitlement, credits or remaining quota. The [geographic policy](https://dev.meta.ai/legal/geographic-use-policy) does not list India as restricted; individual/account eligibility and [applicable terms](https://dev.meta.ai/legal/terms-of-service) still require confirmation.

Offline injected capture measured initial/repair request bodies of 13,890/14,197 bytes for A and 14,706/15,013 bytes for B. Using serialized UTF-8 bytes plus 1,024 estimated input tokens and all 4,000 possible output tokens, the conservative calculated four-slot estimate is **$0.0876146**, within the proposed $0.20 envelope. This is not measured tokenizer usage, an invoice, a spend guarantee or a provider-side cap. `reservation-proposal.json` preserves the basis; account balance remains null.

The prepared owner-local `evaluation/m7l-credential-scope.ps1` prompts with SecureString only after explicit nonsensitive prerequisite checks, scopes an ephemeral child environment entry and clears it in `finally`; it never reads a key file, logs a key or dispatches by itself. Dot-sourcing/execution was blocked by the current Windows policy, which was not changed. AST inspection does not prove successful credential handoff. Clearing BSTR/environment/.NET strings is not guaranteed memory erasure. No executable live consumer is supplied: a reviewed durable reserve-before-dispatch runner enforcing A<=2, B<=2, global<=4, fixed models/endpoints and <=$0.20 estimates remains required before live execution. It must clear the key from inherited environment before launching browsers and stop on uncertain accounting/auth/billing/eligibility.

Remaining owner prerequisites: current promotional balance of at least $0.20, no paid billing/subscription/top-up, current eligibility/model availability and secure local credential availability. Do not send credentials or confidential approvals. Historical access alone does not satisfy this gate. `account-prerequisites.json` and the zero-entry `dispatch-ledger.json` remain blocked records, not a claim that dashboard checks passed.

## Source, review package and release gates

Revised runtime/test/fixture/config fingerprint: **178 records**, `4b1243f98727320eeb6ddd75545f05900b0dfd53a5b608cdc72df0af8806e71d`. The separate source record preserves exact paths and hashes. This is an intentional successor to the reviewed M7-R fingerprint, not a claim that runtime bytes stayed unchanged.

The private self-contained gallery/package contains all 12 focused native exports, matching specs/HTML/generation records, original weak artwork, retained before/after derivatives and relevant original M7-R image exports, plus verification/source/integrity records. Images are copied unchanged, never regenerated or recompressed for packaging. `package-integrity.json` records the final ZIP count, size and SHA-256. Generated evidence stays ignored and private; no uncleared imagery enters tracked public assets.

Final exact working-tree inventory and per-file hashes are in `verification.json`. HEAD/branch/staging remain unchanged; no Git mutation, push, deployment, visibility change, installation, billing/configuration change or external archival occurred. The original headed-browser 2.7366536458% failure remains open against 1.5%; no reinvestigation or tolerance increase. Artistic/M7 acceptance, fresh integrated inference, image publication rights, native Sharp/libvips target distribution, public evaluator access, metadata/domain, release qualification/submission and all existing active roadmap workstreams remain unresolved or separately authorized. Stop at the current owner account/qualification gate.
