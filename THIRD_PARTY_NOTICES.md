# Third-party software, assets and notices

Verified **24 November 2026**, against this repository's unchanged package.json/package-lock.json and installed package metadata/license files. This is the attribution record for actual dependencies, not a list of desired libraries. No dependencies were installed or changed during consolidation.

Full existing license/notice texts are preserved in [docs/licenses/NOTICES.txt](docs/licenses/NOTICES.txt), grouped by identical content to avoid repetition. [docs/licenses/INVENTORY.json](docs/licenses/INVENTORY.json) maps each installed package/version, declared license, source repository and local source file to its notice ID and original SHA-256. The readable notices include each source path; text line endings are normalized to LF, with original-byte hashes retained in the inventory. This preserves notices beyond ignored node_modules, including bundled compiler/tool notices. These documents do not license the project's original code.

Upstream trailing spaces and final blank lines are preserved in the snapshot. A rule in `.gitattributes` exempts **only** `docs/licenses/NOTICES.txt` from trailing-space/end-blank-line diagnostics; normal Git whitespace checks remain in place for project files. This avoids rewriting source notice text or invalidating its recorded content identifiers merely for formatting.

## Direct dependencies actually installed

| Package | Resolved version | Role | Verified license / local evidence | Primary source |
|---|---|---|---|---|
| html-to-image | 1.11.13 | Runtime PNG capture; M0 addition | MIT; LICENSE, copyright 2017–2025 W.Y. | [bubkoo/html-to-image](https://github.com/bubkoo/html-to-image) |
| next | 16.4.6 | Runtime framework; starter | MIT for Next itself; license.md, copyright 2025 Vercel, Inc. Bundled components have their own notices | [vercel/next.js](https://github.com/vercel/next.js) |
| react | 19.3.0 | Runtime UI; starter | MIT; LICENSE, Meta Platforms, Inc. and affiliates | [react/react](https://github.com/react/react) |
| react-dom | 19.3.0 | Runtime DOM; starter | MIT; LICENSE, Meta Platforms, Inc. and affiliates | [React DOM source](https://github.com/react/react/tree/main/packages/react-dom) |
| zod | 4.6.7 | Runtime validation; M0 addition | MIT; LICENSE, copyright 2025 Colin McDonnell | [colinhacks/zod](https://github.com/colinhacks/zod) |
| @playwright/test | 1.65.1 | Development/browser tests; M0 addition | Apache-2.0; LICENSE **and NOTICE**; Microsoft and Google/Puppeteer notices | [microsoft/playwright](https://github.com/microsoft/playwright) |
| @types/node | 20.19.43 | Development types; starter | MIT; LICENSE, Microsoft Corporation | [DefinitelyTyped node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node) |
| @types/react | 19.3.0 | Development types; starter | MIT; LICENSE, Microsoft Corporation | [DefinitelyTyped react](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) |
| @types/react-dom | 19.3.0 | Development types; starter | MIT; LICENSE, Microsoft Corporation | [DefinitelyTyped react-dom](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom) |
| eslint | 9.39.5 | Development lint; starter | MIT; LICENSE, OpenJS Foundation and other contributors | [eslint/eslint](https://github.com/eslint/eslint) |
| eslint-config-next | 16.4.6 | Development lint config; starter | MIT declared in installed package.json; no standalone local license file. Versioned upstream metadata/root license checked as below | [Versioned package metadata](https://raw.githubusercontent.com/vercel/next.js/v16.4.6/packages/eslint-config-next/package.json) |
| typescript | 5.9.3 | Development compiler; starter | Apache-2.0; LICENSE.txt **and ThirdPartyNoticeText.txt** | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) |

`eslint-config-next`'s exact-version upstream package metadata confirms MIT and its Next.js monorepo location. The [same-tag monorepo license](https://raw.githubusercontent.com/vercel/next.js/v16.4.6/license.md) was checked and matches the installed Next license text retained in NOTICES.txt. This is upstream evidence, distinguished from a nonexistent local package license file. No license was guessed from the library's popularity.

## Notices and redistribution handling

Retain applicable upstream copyright, permission, disclaimer, attribution and license texts with redistributed substantial portions/bundles. MIT texts are preserved per actual copyright holder. Apache-2.0 texts, Playwright's NOTICE and TypeScript's third-party notices are preserved in the snapshot; retain relevant notices and license copies, and identify any modified upstream files when later adapting code. See the authoritative [Apache License 2.0 redistribution terms](https://www.apache.org/licenses/LICENSE-2.0). No upstream package source was patched here.

Playwright's installed NOTICE (also preserved in full in the snapshot):

```text
Playwright
Copyright (c) Microsoft Corporation

This software contains code derived from the Puppeteer project (https://github.com/puppeteer/puppeteer),
available under the Apache 2.0 license (https://github.com/puppeteer/puppeteer/blob/master/LICENSE).
```

Do not strip native-library, data or vendored notices just because the parent package uses MIT/Apache. The snapshot covers existing discoverable license/notice files; header-only notices and the actual shipped dependency set still require release review.

## Transitive and bundled audit scope

- **349 installed lockfile package locations** inspected. **476 existing license/notice files**, including Next's vendored and TypeScript/Playwright notices, retained as **245 unique text documents**. Declaration counts are metadata, not an independent legal classification of every nested component.
- **53 lockfile package locations not installed** on this machine (including platform-specific options) are listed separately; their contents/notices were not inspected. A Vercel/Linux install may differ. Refresh this record against the actual target deployment/distribution rather than treating the Windows snapshot as universal.
- Declarations among installed packages include MIT, Apache-2.0, ISC, BSD-2/3-Clause, BlueOak-1.0.0, Python-2.0, MPL-2.0, CC-BY-4.0, CC0-1.0, 0BSD and a combined Apache/LGPL declaration. **The full dependency tree is not all MIT.**
- Examples requiring attention in target-distribution review: `@img/sharp-win32-x64` 0.35.5 declares `Apache-2.0 AND LGPL-3.0-or-later`; `axe-core` 4.14.1 declares MPL-2.0; `caniuse-lite` 1.0.30001827 declares CC-BY-4.0; `argparse` 2.0.1 declares Python-2.0. Their available texts/notices are in the snapshot. This does not imply the poster renderer directly uses or ships all these packages.
- The audit enumerated conventional license/notice/copyright filenames and files ending `.LICENSE.txt` under each installed lockfile package, excluding nested node_modules handled separately. It is **not** a source-by-source ownership audit, browser binary license audit or certification that distribution obligations are closed.

### Missing local notice files and release work

Fifteen installed packages had no discoverable standalone license/notice file in the audited package tree. `eslint-config-next` has the versioned upstream evidence above. The remaining local-file gaps are:

`@humanfs/types`, `@next/env`, `@next/eslint-plugin-next`, `@next/swc-win32-x64-msvc`, `@types/json5`, `@unrs/resolver-binding-win32-x64-msvc`, `client-only`, `esrecurse`, `imurmurhash`, `keyv`, `language-subtag-registry`, `language-tags`, `natural-compare`, `stable-hash`.

Their version/license declarations are recorded in INVENTORY.json, but declarations alone are not fabricated replacement notices. Before distribution, identify which are shipped, obtain applicable versioned notices/source from upstream where necessary, review native/copyleft/data conditions for that distribution and preserve them. No publishing is authorized in this assignment. This outstanding release review is concern R-07 in ROADMAP.md, not a claim of a fully cleared release.

## Assets, fonts, references and originality

- Campaign SVG cup/ornaments and renderer/CSS were authored in this repository during Codex-assisted M0. No external candidate repository code/assets, C1 or C2 code, or generated photographs were integrated.
- Poster fonts are system-font references (Impact/Arial/Helvetica/Georgia/Times stacks); no font files are bundled, copied or embedded. Installed font rights are not a grant to redistribute font bytes. Any later embedding requires a verified font license and matching notice handling.
- Existing create-next-app starter assets/favicon remain. Vercel/Next marks are not the final product branding; the software MIT license does not by itself approve trademark use. Review/remove unused starter branding before final publication if appropriate.
- Commercial products/research repositories in RESEARCH.md are references only. No reuse permission has been inferred for them. The owner has not selected a license for this project's original code; do not assign one as part of consolidation.

For future reuse, record exact upstream revision/version, component/asset, license and notices, adaptation rationale, changed files and executed tests. Refresh the inventory after approved dependency changes and against the final deployment artifact, preserving the relevant texts with any distributed code.
