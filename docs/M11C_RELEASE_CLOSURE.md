# M11-C naming closure and local release checkpoint

26 November 2026. Configuration A: independent local planning, external inference disabled. This supersedes the proposed naming sequence in [M11-B](M11B_RELEASE_PREPARATION.md); historical reports remain unchanged. No new feature, provider qualification, public release or submission is implied. Internal target: 21:00 IST; official deadline: 23:59 IST.

## Verified starting state and migration

HEAD was `388b2414bc7b381050a6641d5a0d076e9d3baa80`, `main`, index empty. All **28** accepted M11-B file states matched their retained sizes/SHA-256 (including five intentional deletions). Authenticated GitHub CLI freshly confirmed **MukulBeri/chowk**, private, default branch `main`. Local `origin` was updated to `https://github.com/MukulBeri/chowk.git`; actual remote main was `2b3c56468f764f549a3335e87d34d877a206d42a`, matching the cached ref. Initial divergence: two ahead, zero behind. No fetch, push or history rewrite was needed.

Owner-confirmed infrastructure: the existing Vercel project is now `chowk`, still ID `prj_3PwwMyhIYlGCs8oZoZ3qwiWXRupv`, with the renamed repository connection intact. `https://chowk-studio.vercel.app` and `https://yarc-create.vercel.app` both remain assigned to Production. Authentication still covers All Deployments; password protection is disabled. The shorter chowk hostname belongs to another team and must not be reassigned. These dashboard facts are owner observations, not fresh automated hosted checks.

The retained intended rollback deployment is **`FDCGNNb7SMongEtGbiFnNc6LRqR8`**, source `2b3c564`, owner-confirmed Ready before migration. Reconfirm actual eligibility and both domain assignments before the next deployment; preservation is not proof that a future rollback will succeed.

## Final local preparation

- Default metadata origin is **`https://chowk-studio.vercel.app`**, with distinct canonical and Open Graph URLs for `/`, `/create`, `/explore` and `/docs`, plus the existing social image. `CHOWK_PRODUCTION_ORIGIN` is optional; a nonempty different/invalid value fails closed with a static error rather than silently publishing stale metadata. Origin changes require owner review.
- README, API examples and current Docs links use the verified repository/domain. Localhost curl remains runnable; production curl is explicitly conditional on target verification and arranged/public access, not a claimed anonymous success. The existing protected Production still serves the older engine, not this local candidate.
- The old domain remains available. Browser-local Projects on it do not migrate to the new origin. No redirect, storage transfer/import or physical folder move was introduced.
- M11-B presentation, complete compatible example JSON, bounded-editor/Projects documentation, centralized runtime/development disclosure, limited original-code rights and conditional native-license preparation are retained. Package/root lock names alone change to `chowk`; dependencies, resolutions and `private:true` are preserved. The five verified unused starter SVGs are removed.
- The previously accepted tsconfig correction excludes only generated evidence directories; real application, test and evaluation sources remain compiled. Engine, renderer, factual guards, legacy API/readiness identifiers, artwork fonts, existing regression cases and thresholds are untouched by this release preparation.

No local process or local environment-file origin override was found; only public-origin status was recorded, never configuration contents or credentials. **Hosted override status is unknown.** Before deployment the owner must omit it or set Production `CHOWK_PRODUCTION_ORIGIN=https://chowk-studio.vercel.app`, including any linked/shared overrides. If already absent/correct, no environment change is needed. Do not change other settings unnecessarily.

## Verification and exact candidate

Lint passed with the existing unused-import warning in `tests/m5-release.spec.ts`. Final TypeScript checking and the guarded Node24 production build passed, including 14/14 static generation. Build/server configuration enforced inference false, no process provider key and telemetry disabled; the build exercised the approved source-origin default.

Five distinct focused cases passed: origin/default/stale-override refusal and complete README schema; actual four-route canonical/OG/Twitter metadata/assets; current Docs/repository link and storage/disclosure; package/rights/license-copy hashes; actual local HTTP HTML opened offline to browser readiness. The first run passed four and exposed a new-test selector race with the temporary loading landmark. Narrowing that test to the Docs landmark preserved its assertions; its isolated rerun passed. Existing 248 regression results and the unaffected M11-B frontend checks were reused, not rerun. A PowerShell quoting error affected the first diagnostic guard invocation; the initial successful build was not relabelled guarded. A file-based guard then executed `npm run build` successfully. All failed attempts remain in the ignored local records.

The complete audited inventory contains **29 paths**: the accepted 28 preparations plus this report. Exact paths:

```text
.env.example
AGENTS.md
README.md
RIGHTS.md
THIRD_PARTY_NOTICES.md
docs/AI_DISCLOSURE.md
docs/API.md
docs/M11B_RELEASE_PREPARATION.md
docs/M11C_RELEASE_CLOSURE.md
docs/REQUIREMENTS.md
docs/ROADMAP.md
docs/licenses/native/GPL-3.0.txt
docs/licenses/native/LGPL-3.0.txt
docs/licenses/native/QUALIFICATION.json
package-lock.json
package.json
public/file.svg                 (deleted)
public/globe.svg                (deleted)
public/next.svg                 (deleted)
public/vercel.svg               (deleted)
public/window.svg               (deleted)
src/app/create/page.tsx
src/app/docs/page.tsx
src/app/explore/page.tsx
src/app/layout.tsx
src/app/page.tsx
src/lib/site-metadata.ts
tests/m11-release.spec.ts
tsconfig.json
```

Only these audited paths are authorized for the local commit:

`chore: finalize Chowk release metadata, documentation and distribution preparation`

The resulting SHA, final inventory/statistics and Git state are recorded after committing in the completion response and the small ignored `test-results/m11c-20261126-01/checkpoint.json`; a report cannot embed its own resulting Git commit hash. That folder retains logs, failure evidence, exact content hashes and staged checks without another ZIP or external archive. No actual environment file, private imagery, installed binary, dependency folder or generated cache belongs in this commit.

## Exact next protected-deployment handoff — approval required

1. In the existing project, verify repository `MukulBeri/chowk`, Production branch `main`, expected automatic Production trigger, unchanged project ID, both assigned domains, current All Deployments authentication and protected source/log settings. Preserve the prior Ready deployment and recheck rollback eligibility. Keep CampusFlow untouched.
2. Confirm Production origin is absent or the exact approved value above. Confirm `GEMINI_ENABLED=false`, `NEXT_TELEMETRY_DISABLED=1`, no nonempty `GEMINI_API_KEY`, no public provider credentials/Meta activation and no conflicting shared variables. Retain the accepted locked install, Node24 and existing guarded Build Command; the new application guard covers stale origin overrides. No credentials need to be printed or supplied to the reviewer.
3. After explicit push/deployment approval, recheck remote main for unexpected divergence. With clean local `main` at the reported release SHA, the exact normal command is:

   ```powershell
   git push origin main
   ```

   This synchronizes the three local commits and triggers Production; it is not executed here. Do not force, auto-merge or recreate a project.
4. Verify actual source SHA/deployment ID, successful guard/build, Ready/current state and both domains. Keep protection during smoke tests: four routes/current metadata/assets/notices; arbitrary local briefs, tastes/formats, concepts, editor undo/reset, Projects save/reopen, fit refusal and matching JSON/native PNG/portable HTML. Preserve thresholds and provenance. Obtain the target-native evidence below before any unconditional distribution claim.
5. If consequential failure occurs, use an eligible prior Ready deployment with owner approval, verify domain assignments and restore/retain protection. No reset or force-push. Public repository visibility and production-only evaluator access remain separate approvals; anonymous generation and `/api/render` must actually work before claiming the mandatory working prototype is evaluator-accessible. Free Standard Protection is the proposed later access scope, not a change made here. [Vercel protection guidance](https://vercel.com/docs/deployment-protection).

## Smallest supported native qualification procedure and remaining gates

Reuse [M11-B qualification](licenses/native/QUALIFICATION.json) and M5-C/M5-D: installed Sharp/libvips versions/linkage, retained legal texts and 28-component map are evidence, not final deployment payload clearance. Full framework traces differ from app traces; the private image worker is not a public provider endpoint. No broad package investigation was repeated.

For the exact new deployment, the owner should open **Resources and Source/build output** in the authenticated inspector (or its `/_src` entry), preserving source/log protection. Inspect every actual function/shared layer and any managed image-optimizer boundary, not just `/api/render`. Retain available bundle/file manifests, runtime/OS/architecture, selected package versions and native binary hashes where the actual bytes can legitimately be obtained. A resource name/size or an installed-build package list alone cannot prove inclusion/exclusion. Vercel documents these inspector views: [build troubleshooting](https://vercel.com/docs/deployments/troubleshoot-a-build), [protected source/build views](https://vercel.com/docs/builds/build-features). Its [Build Output primitives](https://vercel.com/docs/build-output-api/primitives) identify function payload directories; this is not a claim that this Git deployment exposes downloadable `.func` archives.

Do **not** assume the [List Deployment Files API](https://vercel.com/docs/rest-api/deployments/list-deployment-files) exports final bundles: its documented tree describes deployment **source**, with CLI/API-upload conditions. [File Contents](https://vercel.com/docs/rest-api/deployments/get-deployment-file-contents) is likewise not documented as a general final-package download. A source-only tree or inaccessible payload leaves this gate open; no API credential or new tool is requested here.

If the inspector cannot supply sufficient final-package evidence, the smallest legitimate alternative is an owner request to Vercel support for an exact-deployment function/image-optimizer package inventory or an authoritative target-specific inclusion/version statement. Match any native components actually conveyed to recipients to applicable notices, corresponding source/patch/build references and replaceability/relinking obligations. If absent, retain actual evidence of absence. No invented source offer, automatic license violation, permissive application-license requirement or blanket clearance is asserted. The lack of authenticated payload access in this session remains the concrete blocker; another local Next trace would not resolve it.

Historical headed PNG fidelity remains **failed/open at 2.7366536458% against 1.5%**. Artistic limits, finite local understanding, private image rights, process-local provider controls, target qualification, evaluator access and final submission gates remain. Authentication/cloud/collaboration/direct publishing stay post-submission. No provider call, installation, paid service, push, deployment, visibility/protection change, physical move, external archival or submission occurred. Stop after the verified local checkpoint.
