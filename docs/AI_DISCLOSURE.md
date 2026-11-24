# AI and API disclosure

## M0 runtime

There is **no AI integration** in this application. No credentials were requested, generated, read or used for AI services during M0. Inputs are processed locally with deterministic code; the optional HTTP endpoint uses that same code. Fixture and manual-input provenance are explicit in the UI, intermediate JSON and API response. No model generates HTML, CSS, JavaScript or images.

M0 runtime external API cost: **0**, because no AI requests occur. PNG/HTML downloads are local browser operations; no paid export service or external assets are used. The implementation was assisted by the Codex coding agent; that is development assistance, separate from product runtime generation. Its model billing/usage is not measured by this repository.

## User-provided feasibility evidence (not re-run in M0)

The user reports a dedicated Google AI Studio project named **YARC Create** on the free tier and successful connectivity/structured JSON generation.

| Item | Reported value |
|---|---|
| Primary provisional model | gemini-3.5-flash-lite |
| Reported quota | 15 requests/minute; 250,000 tokens/minute; 500 requests/day |
| Single-test latency | 8707 ms |
| Input / output / total tokens | 44 / 221 / 265 |
| Finish reason | STOP |
| Output | Valid parseable JSON |
| Alternative model | gemini-3.1-flash-lite |
| Quality benchmark candidate | gemini-3.8-flash |
| Optional advanced benchmark | gemini-4-hydrogen |

These names, quotas and measurements are user-provided historical test evidence. They were not independently verified against current provider availability or pricing. This is one manually executed test, not a benchmark or a latency/reliability guarantee. No money cost was supplied for that test; free-tier status is not a permanent cost guarantee.

## Selection rationale and pending decisions

Structured JSON feasibility and the reported free-tier quota make the primary provisional model a candidate for an AI planner. No comparative quality, reliability, actual campaign token consumption or model benchmark has been performed here. Selection remains provisional; alternatives are not implemented or evaluated.

Before submission, verify exact model availability/identifiers and terms in the intended project, compare controlled outputs through this schema, measure latency percentiles, record token/cost usage at actual current rates, document failure and safety behavior, and disclose any provider data handling. Do this in an explicitly authorized later milestone, not by inserting credentials into M0.

Gemini remains the provisional primary provider. Groq and OpenRouter are research alternatives, not integrated providers or approved dependencies. Use explicit model identifiers rather than changing latest aliases. Selection should balance actual creative quality, structural/semantic validity, latency, reliability, current project quota and cost; no comparative result is claimed here.

Meta fellowship API credits remain deferred until there is a meaningful GitHub repository and a concrete need supported by model quality, quotas, benchmarking or reliability evidence. Inform the owner when those conditions justify applying. Development must not depend on receiving credits. Do not enable paid billing without explicit approval or make image-generation APIs mandatory.

The planned product route POST `/api/generate` sits in front of server-only provider integration; the existing POST `/api/design-spec` remains a deterministic utility. See [API.md](API.md#future-product-generation-endpoint-planned-only). Prefer one structured request per campaign; additional agents or requests need demonstrated benefit. Protect credentials outside version control and add placeholder environment documentation only when needed.

## Intended creative intelligence (not implemented)

Interpret intention, campaign objective, audience and natural-language taste; develop a central concept, relevant headline/supporting copy, art direction, controlled typography/palette/composition and relevant visual elements; provide a concise rationale. Use structured instructions, examples, taste-specific guidance, negative constraints and schema validation. Do not invent names, dates, prices, offers, locations or factual product attributes. M0's literal manual copy and fixed cup are not evidence that this intelligence exists.

## External collaboration disclosure

The owner's project roles are ChatGPT for mentorship/architecture/requirements/research/management/quality, Codex for repository implementation/testing/integration/checkpoints, Claude for independent research/design/critical review, and Gemini API for future in-product intelligence. These roles are direction, not claims that unprovided research was performed. Claude C1/C2 are received reference contributions with review/integration pending; their exact status is in [RESEARCH.md](RESEARCH.md#received-claude-references). No C1/C2 code was integrated in consolidation.

## Performance and limitations

M0 does not provide model performance measurements. Renderer/export correctness checks are recorded in TESTING.md; browser runtime timings are not stable performance guarantees. Exports allocate a canvas at the requested size and depend on browser memory, fonts and SVG foreignObject support. System fonts may vary by machine. Safari/Firefox are not verified until explicitly tested.

No independent fallback planner is implemented. M0 fixture/manual mode is an honest development mode, not simulated live AI or a tested provider fallback. Later provider timeouts, quota exhaustion, invalid responses and API outages must be tested and routed through an independently generated validated fallback spec with visible provenance.
