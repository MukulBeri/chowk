# M9 — proposed production activation procedure

26 November 2026. **Preparation only. No activation, provider call or release action is authorized by this document.** The current accepted public release `42ea860` remains the submission contingency. Remaining YARC credits and exact charges are unknown. Its managed allocation/no-personal-billing clarification does not authorize unlimited usage.

## Confirmed configuration and outstanding decisions

The owner reports Production-only Upstash Free credentials, HMAC source secret and canonical origin saved, along with `CHOWK_AI_ENABLED=false` and `CHOWK_AI_KILL_SWITCH=true`. The five pilot entries are now **owner-configured**: epoch `production-pilot-20261126`, maximum calls `15`, maximum reservation micros `500000`, source calls per minute `3`, allowed countries `IN`. This is configuration, not authorization for inference. Values were not retrieved. The implemented function was externally checked by the owner in a separate random smoke namespace: reserve allowed, duplicate/over-budget denied, zero inference. Do not reuse that smoke namespace for the production budget or reset counters.

Meta credential and the reviewed image-policy flag remain unconfigured. Owner approval is still needed for conceptual image publication workflow, eligible adult/India use, the exact corrected candidate, release actions and a bounded hosted inference test. `rights:"unverified"` stays truthful; technical metadata preservation is not blanket image clearance. Keep private qualification originals, response bodies and review bundles out of the public commit.

## Exact Build Command

Previously owner-confirmed saved command (not freshly fetched from the dashboard):

```sh
node -e 'let e=process.env,p=process;if(!p.version.startsWith("v24.")||e.GEMINI_ENABLED!=="false"||e.NEXT_TELEMETRY_DISABLED!=="1"||e.GEMINI_API_KEY)throw Error("Build guard failed");console.log(p.version,p.platform,p.arch)' && npm run build
```

This does not itself prohibit Meta activation. The smallest proposed safety adjustment removes diagnostic output and explicitly checks the Meta enable/kill pair while retaining the Node, Gemini and telemetry guards. **226 characters**, below Vercel's 256-character field limit:

```sh
node -e 'let{env:e,version:v}=process;if(!v.startsWith("v24.")||e.GEMINI_ENABLED!="false"||e.NEXT_TELEMETRY_DISABLED!="1"||e.GEMINI_API_KEY||e.CHOWK_AI_ENABLED!="true"||e.CHOWK_AI_KILL_SWITCH!="false")throw 1' && npm run build
```

Eight isolated fake-environment checks pass/refuse as expected; no real environment or secret was accessed. The command prints no secret, does not probe a provider, and preserves `npm run build`. It intentionally refuses an AI-disabled build; retain the original command when deliberately deploying Configuration A. Shared-budget and policy correctness remain runtime gates, not claims made by this short guard. No command was saved to Vercel here.

`/create` reads AI flags during static generation. Set the approved Production flags **before** the authorized build; changing settings afterward does not update an existing deployment's controls or process-cached engine. Build and runtime must agree. Meta credentials are server-only, never `NEXT_PUBLIC_`, source files, arguments, client JSON, screenshots or copied logs. The server-only runtime reads them; rendering the page during build does not invoke generation handlers. Existing installed dependencies and locked installation remain unchanged.

## Ordered owner-side actions — each requires the corresponding approval

1. Accept the corrected candidate and evidence. Confirm the current immutable Ready deployment serving `42ea860`, record its deployment ID privately, and verify actual rollback eligibility. Do not infer the latest ID from an older deployment record. Preserve both existing public domains and evaluator access.
2. In the existing Redis console, inspect only the following budget hash's `calls`, `micros` and `disabled` fields. Preserve existing values; never issue FLUSH, DEL or zero counters. Apply the shared hold before preparing an AI-enabled deployment:

   ```text
   HGETALL {chowk-production-pilot-20261126}:budget
   HSET {chowk-production-pilot-20261126}:budget disabled 1
   ```

   The budget namespace must remain stable across deployments. Creating a different epoch creates a different allowance and requires explicit approval. The shared hold prevents provider dispatch during deployment/smoke work even if UI controls are built enabled. It does not cancel calls already dispatched.
3. Owner privately sets `META_API_KEY` for Production only through Vercel's secret UI. Do not copy the value into chat, evidence, shell arguments or the repository. After reviewing terms/imagery/privacy, set `CHOWK_AI_IMAGE_POLICY=conceptual-2026-11-reviewed`. Keep the already saved Redis/HMAC/origin/pilot values. Gemini remains `GEMINI_ENABLED=false` with no nonempty `GEMINI_API_KEY`; telemetry remains `1`, Node `24.x`. No Spark configuration or additional provider is needed.
4. Only with explicit activation/deployment approval, set `CHOWK_AI_ENABLED=true`, `CHOWK_AI_KILL_SWITCH=false`, and the proposed guarded Build Command above. Confirm all Production values are saved for the **same** build/runtime environment. Leave Redis `disabled=1`. Neither environment entry alone activates the currently running immutable deployment.
5. Approve and create the exact audited source/docs commit, then normally push once to the existing `origin/main`. That push triggers Production; do not add a redundant redeploy. Verify the actual new commit, Ready status, guarded build, domains and public access. No such Git/deployment action is authorized by the correction assignment.
6. While the shared hold remains, verify anonymous homepage/studio and `/docs`, notices/fonts and arbitrary **explicit local** planning. Verify visible independent AI choices/adult consent and matching runtime flags, all four native formats, no lost facts, actual PNG/HTML/JSON exports and local refinements. Missing adult acknowledgement or country mismatch must retain local generation without dispatch. No log, screenshot or test artifact should contain keys, authorization headers or provider bodies.
7. Only with separate approval for the bounded experiment, inspect unchanged counters, then set `disabled=0` in this same hash. This permits public AI usage, not just the owner's browser; incidental public traffic also consumes the pilot. Run **one** owner-approved synthetic campaign with text and image selected, maximum **three actual provider requests total**, including the single possible text repair; no warm-up, discovery, transport retries or repeated demonstrations. Engine reservations are 10,000 micros/text and 75,000/image, maximum 95,000 for that campaign. Store limits remain 15 calls/500,000 micros; these are estimated reservation limits, not guaranteed billed-dollar ceilings.
8. Record actual shared deltas, safe HTTP outcomes, measured latency/available usage, independent capability provenance and any fallback. Export the committed result without regeneration across all four sizes; verify XMP/AI label, facts, fit and unchanged fidelity thresholds. Recheck local planning, image removal/reset and storage after generation. Do not label fallback or private replays as fresh Meta success. On auth/access/quota/ambiguous failure, stop; additional calls need approval.
9. Reapply the Redis hold at the bounded test's end unless the owner explicitly approves leaving the public pilot open. Publish the exact qualified capability/region/failure limitations. Preserve the stable release and submission buffer; do not postpone submission for another broad artistic cycle.

## Eligibility, publication and shutdown

The initial UI offers India only, requires age 18+/input-rights/Meta-processing acknowledgement and compares the choice with trusted Vercel geolocation. Real hosted header behavior still needs qualification. Missing or ineligible geography retains local generation; evaluators outside India cannot be promised Meta access. Age is self-attested, not identity verification. Do not bypass provider region controls. The public site remains usable without AI or authentication. Consent/disclosure is at `/docs#ai`; preserve truthful separate text/image labels and conceptual product imagery, not assertions of verified photographs.

Immediate shared shutdown is:

```text
HSET {chowk-production-pilot-20261126}:budget disabled 1
```

New reservations across instances refuse; dispatched calls may still finish and remain charged/reserved. No automatic refund. REST outage is fail-closed for AI while independent local generation remains available. Source throttling is HMAC/IP-based, not authenticated-user protection. For a durable disabled deployment, separately approve `CHOWK_AI_ENABLED=false`, `CHOWK_AI_KILL_SWITCH=true`, restore the original disabled-build guard and rebuild/deploy; environment edits alone are not an instant distributed switch.

For a consequential production defect: first apply the shared hold, then, with rollback authorization, restore/promote the previously verified eligible immutable `42ea860` deployment. Do not rewrite Git history or reset the budget. Verify canonical anonymous access and local planning afterward. Record the failed candidate and diagnostics. Retain unresolved hosting/native-package qualification and the historical headed fidelity failure; neither is cured by this procedure.

The actual Meta terms, AUP and geographic policy remain applicable; see [AI disclosure](AI_DISCLOSURE.md) and [M9 report](M9_REPORT.md). Public imagery requires owner review of rights, conceptual labelling and preserved provider provenance. No model upgrade, new service, payment method, paid billing or infrastructure change is proposed.
