# M5-C — target distribution and licensing preparation

25 November 2026. **The accepted candidate builds successfully on actual Linux; public release is not yet cleared.** Ready for owner review and a separately authorized, protected Vercel preparation/inspection gate. No application, dependency, package version, runtime architecture or original license changed. Maximum entire-project completion remains today 15:00 IST; 11:00 is this preparation's target, not permission to waive obligations.

## 1. Starting checkpoint and preservation

Main/HEAD remain **cad6bfcc3fb1da985ffd804be00afd6fc910f34a**. Read-only preflight verified exact accepted source fingerprint **e52a30ea813e2d020cee173798797458b8802011fbef7a54496fcf0dabbaefac**, all 90 recorded source/config/test/asset hashes, original **39 candidate files**, 20 tracked modifications plus 19 new files and **zero staged**. All 511 M5-B artifact records were checked before preparation. Original M0–M5-B reports/evidence remain untouched; accepted 92/92 and 15/15 results are reused, not rerun. Current M5-C permission supersedes the historical M5-B-only gate in AGENTS; it does not authorize Git/deployment/inference or product changes.

## 2. Actual Linux environment and build

Existing default **Ubuntu WSL2**, Linux **x86-64**, Ubuntu **26.04.1 LTS**, **glibc 2.43**. Initial inspection found no Linux Node; npm resolved to Windows and was not reused. The owner explicitly approved [the exact isolated proposal](M5C_INSTALL_PROPOSAL.md) before any installation/download.

Temporary build-only destination: /tmp/yarc-create-m5c-e52a30ea813e. **94 allowlisted inputs / 1,891,637 source bytes** were hash-checked before and after copying; all remain unchanged after the build. No .git, actual environment file, credentials, Windows node_modules, private evidence or archive data was copied. This is not another active repository. Node **24.22.3**, npm **11.19.1**, came from the pinned official Linux archive (32,064,292 bytes), SHA-256 **4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb**, verified against the official HTTPS manifest before extraction. Only nodejs.org and registry.npmjs.org were used for approved package/tool downloads.

Executed inside a cleared environment with GEMINI_ENABLED=false, NEXT_TELEMETRY_DISABLED=1, browser downloads disabled, separate empty npm configuration and local cache:

~~~sh
npm ci --ignore-scripts --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org --cache=/tmp/yarc-create-m5c-e52a30ea813e/npm-cache
npm run build
~~~

**350 locked packages installed; Linux production build and its TypeScript check passed.** Compilation 1,750 ms; TypeScript 2.4 s; static generation 355 ms are available build-log substeps, not invented end-to-end latency. No install scripts, global tools, dependency/version changes or optional fallback downloads were needed. The pinned ESLint deprecation and npm upgrade notices are recorded; no upgrade was performed.

Initial Linux archive transfer timed out partway; no unverified archive executed. The temporary directory subsequently disappeared between WSL invocations. A retained WSL process kept the same approved destination available, and Windows HTTPS transport delivered the already-approved files directly there. Failed transfer/write/resume logs remain separate. Final checksum, install, build and native-linkage results are actual, not inferred from those failures. Local preparation tools are isolated and never staged; the temporary directory is not a durable evidence archive.

## 3. Distribution surfaces and native results

Ten actual Linux traces were inspected: full/minimal Next framework plus eight app/page routes. Full framework: **907 files**, including @next/env, client-only, Sharp, @img/sharp-linux-x64 and @img/sharp-libvips-linux-x64. Minimal framework: **93 files**, no Sharp. App render route: **125 files**, including all **eight** approved font/OFL records; notices route: **123 files**, including required notice records. No inspected trace contains environment files. The trace distinction matters: app-route-only exclusions do not prove framework exclusion, and a broad local full-server trace is not automatically a Vercel function bundle.

Two actual native artifacts were hashed and inspected with ldd: Sharp addon **0.35.5** (415,112 bytes) dynamically resolves libvips-cpp.so.8.18.7; libvips shared bundle **1.3.4 / vips 8.18.7** is 18,699,288 bytes. A synthetic **one-pixel PNG** smoke passed using the actual Linux addon/library. This is native linkage evidence, not campaign artwork or another artistic benchmark.

All **13 Linux browser assets** passed scoped key-pattern, personal-path and private-application checks. No credential was transferred into Linux even for scanning. Browser/app HTML/font exports are distinct from server-native ELF files. Existing Windows source/client known-credential checks remain accepted, not relabelled as a Linux known-value scan. Exact hashes, traces, package metadata, linkage and qualified locations are in [distribution evidence](evidence/m5c/distribution.json); full package/file records remain ignored local artifacts.

## 4. Component-specific license findings

- **Next 16.4.6 / @next/env:** same-version monorepo MIT evidence and existing Next/vendor notices are retained. @next/env is actually traced; absent package-local LICENSE is distinguished from the retained umbrella grant. Framework bundling does not mean all constituents share one license.
- **React, React DOM, styled-jsx, @swc/helpers and other traced JS:** discovered license/notice texts are already in the original preserved collection. **143 legal-file records** match complete normalized texts already retained; two initially matched Next documentation guides were excluded as discovery false positives. This is bounded file-discovery coverage, not a proof that every possible source header was found.
- **Linux SWC 16.4.6 and unrs binding 1.13.0:** installed for build/lint, absent from all ten inspected runtime traces. Do not classify them as deployed native runtime merely because npm installed them; Vercel actual build/runtime selection still controls.
- **client-only 0.0.1:** full/minimal framework traces contain its metadata and empty index.js; installed error.js is nonempty but not selected in these traces. MIT is declared, but no standalone license/source attribution text was supplied. An empty executable file is a narrower finding than blanket React/Meta copyright clearance; retain provenance review if a target selects nonempty code. No invented holder/grant was added.
- **Sharp / Linux addon 0.35.5:** actual Apache-2.0 license and README copyright/attribution are retained in evidence and match existing full license text. Preserve applicable grants/notices and modification statements if relevant; upstream source was not modified.
- **libvips Linux package 1.3.4:** declares LGPL-3.0-or-later and supplies a README component/license matrix, **no standalone license text** in that package. Exact upstream v1.3.4 README/THIRD-PARTY-NOTICES confirms a matrix, not complete individual notices. Its shared binary contains additional libraries; the versioned packaging recipe statically incorporates constituents and patches into that shared bundle. Outer dynamic linkage alone does not prove all inner source/relinking obligations fulfilled.
- **Fonts/retained camera:** pinned Anton, Inter, Fredoka/OFL and Tabler/MIT records remain unchanged. Required font resources appear in the Linux render trace. Existing canonical exports/HTTP embedding and browser notice delivery remain accepted. No new font/artwork asset was acquired.

Sources: [exact libvips packaging revision](https://raw.githubusercontent.com/lovell/sharp-libvips/v1.3.4/README.md), [component matrix](https://raw.githubusercontent.com/lovell/sharp-libvips/v1.3.4/THIRD-PARTY-NOTICES.md), [build recipe](https://raw.githubusercontent.com/lovell/sharp-libvips/v1.3.4/build/posix.sh). These were read as evidence, never executed or integrated. Standard GPL/LGPL texts from existing Ubuntu common-licenses were retained with hashes; they explain conditions, not a missing component-specific copyright grant.

### Manner of distribution and precise remaining obligations

The source repository does not include node_modules/native binaries. Browser JS, WOFF2, actual controlled HTML/SVG and PNGs are the public recipient surfaces; a browser does not receive the server ELF files merely by using the studio. [GPLv3 section 0](https://www.gnu.org/licenses/gpl-3.0.html) distinguishes network interaction from conveying copies. Do not automatically require the project's original code to become open source because a server uses LGPL, or assume uploading a binary to a host has no conditions.

If native binaries are actually conveyed, identify recipient/hosting arrangement and applicable terms. LGPL combined-work permissions preserve library modification/debugging rights, notices and GPL/LGPL text, with a suitable replaceable shared-library mechanism or the required source/application relinking materials; library binary source obligations remain separately relevant. For the bundled static constituents, verify exact versions, copyrights/license terms, patches/build recipe and corresponding source/relinking route where applicable. A generic upstream homepage or matrix alone is not established fulfillment. No source offer was invented and no binary redistribution clearance is claimed. This is a conditional target-release gate, not a finding that SaaS access itself mandates public application source.

Minimum safe resolution: inspect the actual Vercel function/server/image-optimizer payload and selected native packages. If Sharp/libvips is not conveyed in that applicable payload, document that with the actual manifest; if present, retain/fulfill applicable complete notices and source/relinking conditions for the real distribution. Material pruning, dependency replacement or runtime changes require separate approval. No such change was made here.

## 5. Fourteen historical gaps and fifty-three absent locations

Of 53 previously absent locations, **four** are now actually installed: the Linux Sharp addon and libvips package are framework-traced; Linux SWC/resolver are build/development in the inspected runtime scope. The other **49** remain absent for this Linux x64 glibc selection, including musl/other-platform/WASM alternatives. They are not automatically distributed packages. Per-location conclusions are preserved in the compact evidence.

| Historical notice gap | Linux installation | Traced files | Qualification |
|---|---|---:|---|
| @humanfs/types 0.15.0 | Installed | 0 | Build/development scope in these traces |
| @next/env 16.4.6 | Installed | 2 | Framework/runtime qualification remains |
| @next/eslint-plugin-next 16.4.6 | Installed | 0 | Build/development scope in these traces |
| @next/swc-win32-x64-msvc 16.4.6 | Absent | 0 | Windows alternative; not this Linux payload |
| @types/json5 0.0.29 | Installed | 0 | Build/development scope in these traces |
| @unrs/resolver-binding-win32-x64-msvc 1.13.0 | Absent | 0 | Windows alternative; not this Linux payload |
| client-only 0.0.1 | Installed | 2 | Framework/runtime qualification remains |
| esrecurse 4.3.0 | Installed | 0 | Build/development scope in these traces |
| imurmurhash 0.1.4 | Installed | 0 | Build/development scope in these traces |
| keyv 4.5.4 | Installed | 0 | Build/development scope in these traces |
| language-subtag-registry 0.3.23 | Installed | 0 | Build/development scope in these traces |
| language-tags 1.0.9 | Installed | 0 | Build/development scope in these traces |
| natural-compare 1.4.0 | Installed | 0 | Build/development scope in these traces |
| stable-hash 0.0.5 | Installed | 0 | Build/development scope in these traces |

Thus two historical gaps are actual framework scope here, ten installed entries are absent from runtime traces, and two Windows alternatives are absent. Existing esrecurse/imurmurhash/CC0 evidence remains valid, without claiming that all development-only package copyrights are universally resolved. These qualifications reduce consequential release scope without treating all gaps as violations or inventing permissions.

## 6. Privacy and checkpoint proposal

[Sanitized privacy review](evidence/m5c/privacy.json): current pre-documentation candidate had zero configured-credential/key-pattern/personal-path/private-application matches; **274 reachable Git blobs and six commit messages** had no such findings. One unique non-noreply author/committer email is present in Git metadata. Its value is not exposed here. Repository visibility remains private; this is an owner awareness item for recipient/visibility decisions, not authorization to rewrite history. Credential variable names and ignored .env.local references are expected setup documentation, not credentials.

Exact proposed staging inventory: **45 files**, combining accepted M5-B's 39 files with **6 M5-C documentation/evidence additions**. See [checkpoint proposal](evidence/m5c/checkpoint-proposal.json) for exact paths and hashes of other candidate files. No raw build artifacts, dependency/toolchain folders, actual environments, private archival material or binary screenshots are included. No original-code open-source license has been selected. Proposed message:

~~~text
feat: add HTML campaign integration and release safeguards
~~~

M5-C adds only:

- docs/M5C_INSTALL_PROPOSAL.md
- docs/M5C_REPORT.md
- docs/evidence/m5c/artifact-manifest.json
- docs/evidence/m5c/checkpoint-proposal.json
- docs/evidence/m5c/distribution.json
- docs/evidence/m5c/privacy.json

The accepted runtime fingerprint remains **e52a30ea813e2d020cee173798797458b8802011fbef7a54496fcf0dabbaefac**. No accepted application, config, test, dependency or historical report/evidence was modified. Zero files are staged; HEAD remains unchanged. No commit/push/reset/history rewrite occurred. Scoped final checks verify this inventory, historical hashes, JSON, documentation links, artifact sizes/SHA-256 and whitespace. Existing product regressions/lint/typecheck are reused because runtime source is unchanged; the actual Linux build includes a fresh TypeScript check.

## 7. Deployment configuration and controlled verification plan

[Vercel supports 24.x](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), but its build/function minor/patch can differ; Ubuntu glibc 2.43 is not proof of Vercel's libc/native artifact. Recommended initial configuration: existing Next framework, project root, locked install, npm run build, **explicit Node 24.x**, **GEMINI_ENABLED=false**, no Gemini key required for local mode, no browser-exposed secrets. Confirm actual plan/region/function limits and the existing 45-second route declaration; do not change dashboard settings now.

After separate checkpoint/push/project/deployment authorization, prefer a **protected preview** for artifact inspection. Verify real build OS/CPU/libc, Node build/runtime versions, selected packages, framework vs function/image traces, native notice/source conditions, font/notice file tracing and current private-source access. Inspect .vercel/output function/static manifests or equivalent downloadable build artifacts/logs actually available; do not assert dashboard/CLI capabilities before access. If those artifacts cannot be obtained, keep native-distribution clearance explicitly unresolved rather than declaring a Windows/WSL build equivalent.

Only after consequential conditions pass should the owner authorize public access and verify arbitrary input, all tastes/four sizes, actual /api/render HTML/readiness, zero-call disabled auto/local provenance and bypass resistance, notice delivery, offline HTML, JSON, native PNG dimensions/fidelity/refusals and privacy over actual HTTPS. No fresh Gemini probe is implied. Existing artistic/functionality evidence is reused unless the target reveals a defect.

## 8. Evidence, readiness decision and actions not taken

[M5-C artifact manifest](evidence/m5c/artifact-manifest.json) records **37 new local evidence files**, sizes and SHA-256. It includes preserved failure logs plus final actual build, ten traces, selected package notices/README/version metadata, native linkage and smoke, client checks and legal-term evidence. Large toolchain/dependency directories were not copied into the repository. M0–M5-B protected evidence remains intact; no physical OneDrive/archive change occurred.

**Decision:** Linux compatibility/preparation passes. Candidate is suitable for owner review and conditional protected Vercel preparation, **not unconditional public release clearance**. Remaining consequential gate is the actual target payload/manner of native distribution and its applicable notices/source/relinking obligations, followed by separately authorized deployment/public verification. This is precise target qualification, not a request to reopen accepted product design or install more infrastructure.

Zero live provider calls. No package/version/model/billing/quota/credential changes, accepted product modifications, Git mutations, visibility/license changes, Vercel project creation/deployment, fellowship submission, archive edits or unrelated work occurred. Stop at owner review.
