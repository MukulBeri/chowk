# AI and API disclosure

## Actual M1 runtime

M1 uses the **Gemini Developer REST API** with native server-side fetch; no SDK, image-generation API or second provider was added. The configured secret is consumed only by the server-only runtime and sent in `x-goog-api-key` headers to the fixed Google host. It is not part of prompts, URLs, logs, client responses or screenshots. `.env.local` is ignored; `.env.example` contains placeholders/settings only.

The user-supplied brief/details/taste go to Google in auto mode when local safeguards permit. Do not submit private information. Free-tier data handling may differ from paid-tier handling; the [official pricing/data-use table](https://aistudio.google.com/docs/pricing) indicates free-tier content may be used to improve products. This repository does not audit the user's provider account/terms or billing state.

Gemini interprets the brief, proposes a concept/audience/objective, copy, supported style decisions, rationale and explicit assumptions/missing information. It emits **bounded structured JSON**, never executable HTML/CSS/JS or images. Structural/semantic checks map it to DesignSpec v2; the original deterministic renderer adapts all four formats. No C1/C2 redesign or external reference code was integrated.

`metadata.source` and `spec.provenance` distinguish gemini from deterministic-fallback. Initial fixture/manual output remains distinct; manual changes do not claim another AI request. Independent local mode and missing-key/limit/failure fallback use no external AI. A successful fallback is useful output, not a successful model measurement. See [API.md](API.md#m1-product-generation-endpoint) for the actual contract and budgets.

## Provider/model selection evidence

The default explicit model remains **gemini-3.5-flash-lite**, configurable on the server. [Its official model page](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite) lists structured output support. The [generateContent reference](https://aistudio.google.com/api-reference/generate-content) documents the v1beta models endpoint and `generationConfig.responseFormat.text` with `mimeType: APPLICATION_JSON` and `schema`; that exact nested shape was exercised successfully, not inferred from an SDK example. Responses were parsed from candidates/content/parts, checked for STOP and validated; usageMetadata was recorded when present. Thinking was MINIMAL for the primary and LOW for the comparison model.

Both selected models' metadata GETs returned 200 and listed generateContent support. Actual structured campaign generation succeeded on the primary. **gemini-3.8-flash** was selected as the owner's quality comparison candidate, but this run obtained no accepted output, so no creative-quality advantage or successful structured response is claimed for it. The [official comparison model page](https://aistudio.google.com/docs/models/gemini-3.8-flash) lists capability; that is distinct from successful local execution.

### Live matrix (24 November 2026)

Six synthetic public briefs per model: campus launch, technical workshop, product announcement, cultural event, vague brief, and fact-sensitive workshop with teams/date/time/price/venue/URL. These are test fixtures, not real advertised events/products. Raw accepted plans, interpretation, metadata and failed outcomes are in [live-models.json](evidence/m1/live-models.json).

| Model | Briefs / provider calls | AI accepted at run time | Fallback outcomes | Median total / range |
|---|---|---|---|---|
| gemini-3.5-flash-lite | 6 / 6 | 4 | 2 provider-unavailable | 1999 ms / 1064–8833 ms |
| gemini-3.8-flash | 6 / 6 | 0 | 5 provider-unavailable, 1 timeout | 6057 ms / 2154–25001 ms |

No repair was needed/attempted in this matrix. The model checks count as completed evaluation tests because they record honest AI/fallback outcomes; “2 tests passed” does **not** mean all 12 provider generations succeeded. The comparison used a 25-second attempt cap/40-second overall budget (production defaults 18/38 seconds) and stricter pacing/budgets. Timings include orchestration/any evaluation spacing, not guaranteed pure model inference. Primary successful calls reported 2687 input + 1702 output = **4389 total tokens**, thinking count 0. Failed calls returned no usable token counts: their usage/cost is **unknown**, not zero. Early benchmark failures did not retain numeric HTTP status; their reason cannot be reconstructed more precisely.

### Human review and follow-up evidence

Review of the four primary accepted plans found relevant subjects, taste consistency and preserved explicit numeric/named facts in the fact-sensitive example, including its URL in CTA. Creative novelty/within-taste style variation was modest: the model generally retained preset style values and selected abstract/no illustration appropriately. Product copy added **“Coming soon”** despite unspecified availability; this is a human-identified semantic gap. A final guard now flags unsupported relative timing; post-hoc revalidation records that flag without rewriting the measured result or pretending it was repaired live. The other three accepted matrix plans pass that final guard. Heuristics still cannot certify truth or eliminate hallucinations.

An initial endpoint pilot succeeded in 8696 ms / 1099 reported tokens, but human review caught unsupported fresh-brew wording; the prompt/claim guard was tightened. It remains labelled as an initial finding in [live-end-to-end.json](evidence/m1/live-end-to-end.json). An initial browser run also succeeded (2516 ms / 1095 tokens); its full local artifacts were superseded during verification, so only the recorded console summary is retained, not invented replacement screenshots.

Subsequent browser checks recorded a real **HTTP 503 → fallback** (6669 ms), then AI success (2151 ms / 1099 tokens). The latter exposed an automated fill/hydration race duplicating the sample topic; its actual input and finding are retained, and hydration gating/request-body assertions were added. The final clean-input browser run succeeded in **6134 ms / 1080 tokens** and exported all four exact-size PNGs plus HTML/JSON. [Browser attempt history](evidence/m1/live-browser-attempts.json) preserves the retained failure/follow-ups; [latest clean browser result](evidence/m1/live-browser.json) backs the README's validated v2 example. These separate runs are not silently added to the six-case matrix.

The initial standalone evaluation runner's sandbox-network metadata requests failed; approved network execution then completed the matrix. That tooling denial is separate from provider failures. There were no additional comparisons of the remaining model candidates and no paid-service/billing change. Evaluation output is cleaned between commands; retained representative captures are explicitly labelled **replays of measured live JSON** for three tastes, with no new provider calls. They are rendering/export evidence, not additional model measurements. The genuine final browser run's recorded response and execution result remain separate.

## Quotas, cost and limitations

The owner review prompted a focused deterministic-fallback correction after these measurements. [Before](evidence/m1/correction/before.json) and [after](evidence/m1/correction/after.json) are explicitly local planner replays, not new live-model results. Recognized missing-input instructions move to metadata, exact headline/support repetition is removed, and subjectless requests return 422 before provider dispatch. [Actual corrected local UI/API evidence](evidence/m1/correction/actual-local-result.json) reports requested-local provenance and zero attempts. No broad live benchmark or new Gemini call was made in this correction. All six original measured JSON files remain byte-identical; original fallback leakage remains an observed finding. Preservation details and the separate historical mobile screenshot replacement are disclosed in M1_CORRECTION.md.

Owner-observed quotas: 3.5-flash-lite and 3.1-flash-lite, 15 RPM / 250K TPM / 500 RPD; 3.8-flash and optional 4-hydrogen, 5 RPM / 250K TPM / 20 RPD. These are user-provided dashboard observations, not independently verified current allowances. [Google's rate-limit documentation](https://aistudio.google.com/docs/rate-limits) says limits are project/model/tier dependent and not guaranteed. In-memory process budgets reserve substantial headroom but cannot guarantee a global quota across serverless instances/restarts. The comparison spent six generation calls; no repeated comparison sweep was run to exhaust quota.

**Actual billed cost was not independently observed.** The owner reports free-tier access; generation responses contain token usage, not invoice amounts, and failures/timeouts may have unreported usage. Do not label unknown failures zero-cost or extrapolate a benchmark to daily cost. Current official standard pricing lists free input/output for both tested models on eligible free-tier access; paid-tier rates are separate and were not enabled here. No provider tools/grounding/image generation were requested.

Alternative 3.1-flash-lite and optional advanced 4-hydrogen remain **untested** candidates. Groq/OpenRouter remain research only. Meta credits remain deferred until a meaningful repository and a concrete quality/quota/reliability need justify applying; development does not depend on them. Inform the owner if that need arises. Paid billing, another provider, extra in-product agents or mandatory image APIs require separate approval.

Semantic safeguards normalize complete dates/times/currency/units/contacts/IDs and flag selected claims, missing facts, placeholders/names/taste mismatches and poor contrast. They have false positives/negatives: ambiguous dates, spelled-out numbers, novel product claims, renamed entities, negation and broader meaning are not fully solved. Proposed audience/concept are descriptive planning metadata, not verified facts. Human review remains required. Detailed copy can overflow and refuse export; system fonts, visual quality and distributed quota behavior are not universally verified.

## Historical user-provided M0 feasibility evidence

The owner reports a dedicated free-tier Google AI Studio project named YARC Create, successful connectivity/model discovery and one initial structured JSON test: provisional gemini-3.5-flash-lite, **8707 ms**, **44 input / 221 output / 265 total reported tokens**, finish STOP, valid parseable JSON. This was not rerun as part of M0, is not the M1 full-campaign benchmark and is not a performance guarantee. M0 runtime itself made no AI calls (external API runtime cost 0 for that milestone).

Codex assisted implementation; ChatGPT provides mentorship/architecture/requirements/research/quality; Claude references are advisory and reviewed before integration; Gemini supplies current in-product planning. Development-assistant model billing is not measured here. Existing reference receipt/status and deferred research remain in RESEARCH.md.
