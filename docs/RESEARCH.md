# Research, reuse and reference register

Status vocabulary: **Adopted** = integrated with evidence; **Pending evaluation** = investigate before selecting; **Rejected** = a specific unsuitable approach is excluded with a reason; **Deferred** = conditional/later priority. A public page, README claim or received reference is not an independently tested implementation.

## Commercial references

Official pages opened on 24 November 2026; the observations below are page-level descriptions, not hands-on accounts, accessibility audits or integration recommendations. All four remain **Pending evaluation** as design/workflow studies; none is an adopted service.

| Reference / source | Established study questions | Page-level observation |
|---|---|---|
| [Canva](https://www.canva.com/) | Intuitive workflows, accessibility for non-designers, visual taste selection, preview/regeneration | Broad visual design product categories; actual workflows/accessibility still need review |
| [Adobe Express](https://www.adobe.com/express/) | Professional workspace, campaign/brand consistency, contextual controls and hierarchy | Content creation/templates product; no local behavior or source verification |
| [Bannerbear](https://www.bannerbear.com/) | Programmatic generation, adaptive composition, structured templates, multi-format exports/API | Official page advertises image/video APIs and template library; API not called |
| [Placid](https://placid.app/) | Dynamic layers, automatic text fitting, reusable elements, predictable rendering | Official page describes dynamic templates and automation APIs; fitting reliability not tested |

## External repository candidates

All six supplied repository pages resolved during consolidation. Only public descriptions/README excerpts were inspected; **no clone, implementation audit, license grant verification, execution, compatibility test or code adoption** was performed. URLs and claimed relevance are leads. Verify actual files, the license at a pinned revision, per-asset permissions, security and compatibility before reuse.

| Candidate / primary source | Research target and bounded observation | Status |
|---|---|---|
| [OpenAdFormats](https://github.com/clawnify/OpenAdFormats) | Schema-led creative fields and AI-to-renderer separation. README describes per-layout copy fields and a React/Hono/SQLite app; its full app/database stack is not our architecture | Pending evaluation |
| [Poster Maker](https://github.com/dabodamjan/poster-maker) | Typography, composition rules and HTML export; project description/README presents editable HTML/CSS examples and PNG/PDF export, not locally verified | Pending evaluation |
| [Poster Studio JS](https://github.com/Harikrashna-Parikh/poster-studio-js) | Modular renderer/preview/export boundaries and JSON templates appear in README; implementation unreviewed | Pending evaluation |
| [Any2Poster](https://github.com/Any2Poster/Any2Poster) | Visual feedback, layout/quality assessment; README exposes optional vision feedback/quality flags | Deferred: vision critic/multiple-model pipeline is conditional, not mandatory |
| [Maket](https://github.com/ng-galien/maket) | Inspectable creative state and tooling; README describes schema/state and layout-check tools | Pending evaluation; no tool/plugin integration authorized |
| [Social Poster Generator](https://github.com/ArielMedeiros13/social-poster-generator) | Typography fitting, procedural ornaments and platform zones; README describes a Canvas-first engine and text trimming | Pending evaluation for isolated techniques; wholesale Canvas replacement and silent trimming are rejected for this HTML/no-hidden-copy architecture |

No candidate license is inferred from a repository being public or its README saying “open-source.” No external app is being copied and presented as original work.

## Library decisions

| Library | Status / rationale / evidence |
|---|---|
| Zod 4.6.7 | **Adopted**: strict shared schema and inferred types in design.ts; validation tests executed in M0 |
| html-to-image 1.11.13 | **Adopted**: browser PNG implementation in export.ts; 12 M0 fixture downloads/dimensions checked; no universal PNG fidelity claim |
| @playwright/test 1.65.1 | **Adopted**, development-only: 7 M0 tests executed against installed Chrome; scope in TESTING.md |
| Fitty | Pending evaluation: compare loaded-font fitting/readability against our measured fitter before adding anything |
| Culori | Pending evaluation: bounded colour manipulation and contrast needs; no dependency installed |
| Tabler Icons | Pending evaluation: SVG reuse only after component/asset license review and actual need |
| OpenType.js | Deferred: advanced measurement only if system/browser fitting proves insufficient |
| Satori | Deferred: alternative rendering only for a demonstrated failure/advantage; no renderer replacement approved. Next's bundled dependencies may contain Satori, which is not direct adoption by this app |

Actual licenses, notices, transitive findings and gaps are recorded in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). No package was installed for consolidation.

## Received Claude references

| Contribution | Receipt and contents | Review / integration status |
|---|---|---|
| **Claude C1** | Received project reference, per owner: **mocked frontend reference prototype** | Interface colour palette **not approved**. No integration authorized. Mocked interface behavior is not a working generation/export result |
| **Claude C2** | Received project reference, per owner: **untested poster design reference** containing three taste systems, four platform formats, two sample topics and parameter-driven composition techniques | Visual and technical recommendations **pending review**. Do not integrate code or replace the verified M0 renderer in this assignment |

Receipt/content descriptions above are **owner-provided evidence**. C1/C2 source artifacts were not supplied to Codex in this consolidation; there was no independent source/license audit, execution or test. Do not invent topic names, infer approved palettes or claim that these recommendations were adopted. Review references deliberately against the concern register and acceptance criteria after explicit authorization.

## Reuse gate and consequences

Selective reuse of functions, algorithms, text fitting, export mechanisms, CSS/SVG/decorations, colour logic, validators, tests or prompts is encouraged when useful. Before adoption: verify exact permissions and notices; understand the implementation; evaluate security/compatibility and demonstrated advantage; adapt deliberately; test integration; retain attribution. Record the revision, changed files, rationale and verification. Do not import an entire application, add a dependency or expand scope merely because a reference exists.

Current consequential decisions: keep the validated HTML engine; retain the tested Zod/html-to-image/Playwright choices; no replacement renderer, image API, critic or C1/C2 integration. Model/provider research decisions are centralized in [AI_DISCLOSURE.md](AI_DISCLOSURE.md).
