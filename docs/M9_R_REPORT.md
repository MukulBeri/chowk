# M9-R: native image reliability and safe diagnostics

Local candidate for owner review, 27 November 2026 IST. This correction does not establish artistic acceptance, fresh AI qualification or production deployment acceptance.

## Baseline and scope

Starting commit `9a5d8127daac1cff3611708a3ec69b407cb364c7`, branch `main`, with accepted 198-record fingerprint `efb4e9e35cfe6abfd68a4b7b46124f361a2a658d8ea9347c3a3151d34468d5e5` and 306 regression cases. Initial tracked tree and staging were clean. The two excluded M11 reports and accepted hosted-investigation report were untracked and remain untouched. Historical M9 archive and failure records were not modified.

The accepted investigation reproduced a local compiled-worker defect, not the exact unavailable hosted response. Owner-observed hosted text acceptance and image rejection remain historical findings; this correction does not relabel the failed image as successful fresh inference.

## Implementation

1. [Native worker resolution](../src/server/raster-optimizer.ts): use Node `createRequire`, anchored to the runtime app root, to resolve Sharp outside bundler module IDs. Before worker construction, require a genuine absolute module path that native resolution confirms. No build-machine path is embedded. Missing resolution is a safe `worker-bootstrap/module-resolution` refusal. The real worker still loads Sharp, fully decodes pixels and prepares the image.
2. [Dependency tracing](../next.config.ts): narrowly include Sharp and installed `@img/sharp-*` package files for `/api/generate`, since native resolution is not a static bundler import. Sharp was already externalized by Next; externalization alone was not treated as a fix. No package/lockfile, dependency version or installation changed.
3. [Allowlisted diagnostics](../src/lib/generation/pipeline-diagnostics.ts), [adapter](../src/server/meta.ts) and [engine](../src/server/meta-engine.ts): optional attempt `diagnostic` distinguishes response/base64/PNG/metadata, bootstrap/runtime, decode/fitting/XMP and asset/campaign schema failures. Codes are closed enums; numeric measurements are bounded and optional. Malformed worker diagnostics become a generic safe refusal. Arbitrary exceptions, native paths, prompts, response bodies, headers, credentials and base64 never become public diagnostic fields. Invalid metadata UTF-8 is now classified as metadata refusal. Native operation timeout is classified as timeout instead of generic decode; parent timeout/abort also cleans up its timer/listener and terminates the worker.
4. [Interpretation contract](../src/lib/generation/contracts.ts): legacy `interpretation` stays application-owned and authoritative for brief/fact interpretation. Additive optional `interpretationSources.creative` carries only the actual accepted, validated Meta interpretation and rationale, with source/model. No accepted creative entry is fabricated on local fallback. [GenerationDetails](../src/components/generation-details.tsx) renders both origins explicitly through escaped React text. [Studio](../src/components/studio.tsx) delegates this existing disclosure without changing renderer refs, measurements or export lifecycle.
5. [Fallback summaries](../src/server/meta-engine.ts): `shared-disabled` summarizes as `disabled`; budget/source/duplicate denials as `local-budget`; unavailable store as `provider-unavailable`; configuration/eligibility as `configuration`. Exact detailed capability reasons remain. Actual semantic rejection still uses `validation-failed`, and one-repair maximum remains unchanged. Successful accepted text remains independent of failed image output.

Compatibility: no request change or DesignSpec version migration; v1/v2/v3 remain supported. New response fields are optional, and older response fixtures remain valid. Campaign-schema rejection on image attachment is now safely identified as `invalid-output` with a `campaign-schema` diagnostic instead of an unexplained generic provider-unavailable error. No supplied facts are removed or modified.

Unchanged safety bounds: 8,000,000 source bytes; 11,000,000 image-response bytes; 4,000,000 pixels / maximum 2048 per edge; 160,000 prepared bytes; single preparation per process; 64/16 MiB worker JS heaps; two-second native operation limits; six-second parent termination; 18-second provider / 40-second campaign limits. These heap limits are not an OS native-memory ceiling. Metadata is preserved or refused, not stripped. Independent local fallback, eligibility, shared atomic reservations, kill switch and per-format export refusals remain intact.

## Before and after: actual compiled handler

The original numeric worker argument `sharp:6971` and `ERR_INVALID_ARG_TYPE` are retained in the investigation records. Before cleaning the build, the exact original production chunk was preserved as `test-results/m9-r-20261127-01/before-production-chunk.js`, SHA-256 `307b420d9ef4bfe331b09be2d81f3e5dfa752f9127db907ccc1c1d8482b43bf2`. This preserves the transient old build artifact after `.next` is rebuilt; original investigation outputs remain unchanged.

The newly compiled `/api/generate` POST handler was invoked in a disposable process with synthetic-only configuration and injected transports. Actual worker execution is not mocked. Controls use the historical genuine Muse original and historical repaired Ember response; no new inference occurs. Replay usage/latency is not new live measurement. Image usage in the injected envelope is synthetic.

| Compiled-handler case | Actual local result |
|---|---|
| Retained accepted text + retained Muse original | HTTP 200; text and image accepted independently; model interpretation retained |
| Local text + retained Muse original | HTTP 200; no text transport; exactly one image operation |
| Accepted text + malformed image envelope | HTTP 200; accepted text preserved, local image fallback, `response-contract/invalid-response` |
| Shared-held request | HTTP 200 local fallback; no provider dispatch; exact text `shared-disabled`, summary `disabled` |

Source PNG: 1600 × 1600, 3,025,049 bytes, SHA-256 `1ff2c7f594781c0f751b515a0983e2d3b8143690a9da0b8f26accce1b4d17fc3`. Accepted derivative: 1024 × 1024 JPEG, 113,491 bytes, SHA-256 `3dfec052a2b1eaeaafdc05ee14d2b46a65179d27819942a3cca50f899603cfca`. Exact provider XMP digest remains `8331d3b1f0445390678700f47f92337a5f231b3897ecb94e9f5324f1db9f5061`; derivative and parent/source integrity are preserved.

Definitive replay after the final rebuild: `test-results/m9-r-20261127-01/compiled-results-03.json`; the earlier successful second replay is also retained. The first corrected replay already succeeded, but its harness read the wrong Lua argument position and recorded null reservation measurements. That result and harness are retained. The second replay asserts and records the correct 10,000/75,000-micro synthetic reservations. Neither replay queried real Redis or changed consumed production reservations.

## Verification

Final integrated run: **331/331 passed**, zero skipped/flaky/failed, 5.55 minutes. All original **306 cases** and their source assertions are retained; 25 new cases pass. Separate dedicated retained-image browser/export checks: **2/2 passed**, eight actual native PNGs (1080 × 1350, 1080 × 1080, 1280 × 720, 1910 × 1000 for each campaign), two portable HTML and two matching JSON exports. Maximum PNG/native-DOM difference **0%**; maximum portable-HTML/native-DOM difference **0%**, with original thresholds 1.5% at channel delta 20 and 0.1% at delta 8. Fonts, facts and XMP pass; offline exports made zero external requests. These are headless Chrome 158.0.8127.88, Windows, device scale 1 measurements, not headed/physical-device qualification.

Final lint: zero errors, one pre-existing unused-import warning in m5-release.spec.ts. Typecheck and clean production build pass. Git whitespace and documentation checks pass. Candidate **201-record fingerprint**: `ce0db951aed86446ccabcba1ad8ffd11f4a232fd9b05a326cff9e2cad0cb1db4`. Exact results and hashes: `test-results/m9-r-20261127-01/verification.json` and `integrity.json`. Private visual gallery: `test-results/m9-r-20261127-01/REVIEW.html`.

The first full run passed 330/331 and exposed the new disclosure's multiple inspection blocks against an original single-block assertion. The implementation now retains one combined JSON block and distinct human-readable provenance labels. No original assertion was changed. Both focused compatibility checks passed, then the final clean build and complete 331-case suite passed; the failed run/screenshots/trace remain under full-01. Two further actual native-worker fault probes distinguish bootstrap failure from native decode with only allowlisted data.

Commands executed with installed tools, real environment-file access blocked and external fetch blocked:

```text
node test-results/m9-r-20261127-01/check.cjs typecheck
node test-results/m9-r-20261127-01/check.cjs lint
node test-results/m9-r-20261127-01/check.cjs build
node --require ./test-results/m9-20261126-01/safe-local.cjs test-results/m9-r-20261127-01/compiled-replay.cjs -03
node --require ./test-results/m9-20261126-01/safe-local.cjs node_modules/@playwright/test/cli.js test --config=test-results/m9-r-20261127-01/full.config.cjs
node --require ./test-results/m9-20261126-01/safe-local.cjs node_modules/@playwright/test/cli.js test --config=test-results/m9-r-20261127-01/artwork.config.cjs
```

The initial new focused run passed 24 tests and failed its browser case because the test omitted matching taste and creative-led selection. The application correctly refused the mismatched response. The test was corrected to choose the actual input settings, without weakening its assertions; its isolated browser rerun passed. Both attempts are retained. The initial typecheck caught a new test's missing union narrowing; it was corrected before the successful recorded typecheck/build. No existing test source/assertion was edited.

## Windows, Linux and native distribution

Windows Node 24.22.3 clean Next 16.4.6 build passed compilation, TypeScript and 14/14 static pages. The generated `/api/generate` trace contains 112 Sharp-related locations, including Sharp entry/package/license files, installed Windows native `.node` and libvips DLLs. The actual compiled handler loads and executes them successfully. The native loader expression no longer supplies a numeric module identifier to the worker.

Ubuntu WSL is installed, but the previous isolated `/tmp/yarc-create-m5c-*` environment and Linux Node are unavailable; PATH only exposes a Windows npm location. No system package or tool was installed. Consequently **no new Linux production build or native execution is claimed**. Runtime-root native resolution and forward-slash trace globs are cross-platform mechanisms, subject to a later actual Linux/hosted verification. A local trace is not the Vercel final function inventory. Existing hosting/native-distribution and applicable-license qualifications remain open; this change does not declare licensing clearance or infer missing native libraries from absent hosted inventory.

## Proposed image-only qualification — not authorized

The existing endpoint supports `mode:"auto"`, creative-led treatment and `ai.text:false, ai.image:true` with normal consent/adult/country checks. `mode:"local"` intentionally disables both providers. Compiled replay demonstrates that image-only dispatch uses the local validated text plan and one Muse image operation; no new public endpoint or validation bypass is needed.

Retain consumed **two calls / 85,000 micros**. With one additional 75,000-micro image reservation, the cumulative minimum ceiling is **three calls / 160,000 micros**, not the current 95,000. These are reservations, not verified charges. No counter, epoch, limit, configuration or hold was changed here.

Do not simply release the global public hold for a browser test. Recommended separately reviewed mechanism: add a short-lived, single-use owner-bound admission requirement to the existing route **in addition to** all current origin, eligibility, trusted location, policy and shared-budget checks. A server-validated owner qualification token/lease would restrict dispatch to that approved request; it must not bypass the shared ledger or be committed/exported/logged. This mechanism is a proposal, not part of this candidate. An equivalently isolated protected qualification deployment is possible only if public traffic cannot reach any enabled consumer of the same released budget. Dashboard protection alone on a separate URL does not stop the existing public consumer.

After separately approved isolation, source/configuration/deployment and execution: verify counters/eligibility without exposing secrets; admit one image-only request using the validated local chai campaign; no text, repair, retry, discovery or warm-up. Stop on any unexpected traffic, authentication, quota, transport or image rejection. Restore and verify the hold in a finally-style owner procedure. Record real reservation delta, safe diagnostic stage, actual timing/available usage and independent local-text/Meta-image provenance. Require image/rights review, four native exports, matching JSON, offline HTML and unchanged fidelity thresholds before claiming hosted image qualification.

## Remaining limitations and review gate

- Exact cause of the original hosted chai image failure remains unrecoverable. Correcting the demonstrated local build defect does not prove that the missing hosted body met every contract or exclude a second production issue.
- Historical 2.7367% headed PNG/native-DOM failure against the 1.5% limit remains open. New headless checks do not resolve it, establish cross-device fidelity or qualify a physical smartphone.
- Image rights remain unverified and publication requires review; retained imagery stays private. No artistic engine expansion, claim of broad artistic excellence or fresh provider reliability is made.
- Shared counters/hold are owner-reported, not newly queried. Production remains unchanged, with the safety hold untouched. Existing 217-file historical archive is not modified or recopied.

## Inventory and proposed archival mapping

Candidate files: `next.config.ts`; `src/server/raster-optimizer.ts`; `src/server/meta.ts`; `src/server/meta-engine.ts`; `src/lib/generation/contracts.ts`; new `src/lib/generation/pipeline-diagnostics.ts`; new `src/components/generation-details.tsx`; `src/components/studio.tsx`; new `tests/m9-reliability.spec.ts`; `docs/API.md`; `docs/TESTING.md`; this report. Exact hashes and candidate runtime fingerprint are supplied in the local verification inventory.

The two old excluded M11 reports and `docs/M9_HOSTED_QUALIFICATION_INVESTIGATION.md` stay separate, untracked and unchanged. Staging remains empty. No commit, push, deployment, provider request, actual credential read, production Redis query, hold release, configuration change, dependency installation or archive modification occurred.

Proposed mapping only: safe report, source inventory, hashes and compact sanitized verification → established `05_Development-History/M9/M9-R`; appropriate non-sensitive screenshots → `04_Project-Evidence/M9/M9-R`; retained-image outputs, image-bearing HTML/JSON, raw responses and private bundles → the existing non-synchronized local M9 archive under `M9-R`. Do not copy private evidence to OneDrive or Git. No archival execution or cloud synchronization is claimed. Stop at owner review before any release or live action.
