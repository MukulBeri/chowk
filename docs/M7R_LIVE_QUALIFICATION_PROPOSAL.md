# M7-R — bounded live qualification proposal (NOT authorized)

Prepared 26 November 2026. All earlier seven Meta calls are exhausted. M7-R makes **zero live calls**. Providers remain disabled; this proposal neither activates a runtime nor reads credentials.

## Prerequisites requiring owner decisions

1. Explicit approval of the four-call experiment below, current account eligibility, promotional-credit balance and rates. No personal/paid billing, upgrade or provider cascade. Missing account usage/cost stays unknown.
2. **Image transport gate:** the current Meta response ceiling is 1,000,000 bytes. Retained Batch A image responses were 4,117,655 / 6,005,459 / 4,280,006 bytes. All would still be refused. Proposed approval: image endpoints only, streamed JSON at most 11,000,000 bytes, decoded original at most the existing 8,000,000 bytes / four million pixels. Keep text response cap at 1 MB, optimized asset at 60,000 bytes, offline HTML at 1.5 MB and HTTP response at 2 MB. No limit has been raised in M7-R. Without this approval, qualify text only and retain image qualification as blocked; do not spend a predictable failed image call.
3. Private synthetic briefs/assets only. Reconfirm adult/end-user, geography, credit and publication terms; owner-reported historical access is not public-release clearance. Do not expose a key, raw response, session data or private generated image in tracked/public files.
4. Freeze the reviewed source fingerprint. Use a separate local injected qualification launcher, not global inference activation. Explicitly bound requests before dispatch, make a fresh dispatch, and disable/close the launcher afterward. Gemini stays disabled. No deployment/configuration change follows.

Separate optional image-quality decision: measured retained I01 JPEG candidates at fixed quality 82 / 4:4:4 were 56,589 bytes (576 px), 90,920 (768), 143,185 (1024), 200,389 (1280), and 261,751 (1536). Only 576 fits the unchanged 60 KB layer. A proposed **160,000-byte layer ceiling** would admit the tested 1024 candidate, but is **not implemented or approved**. Shared-base64 transport suggests room under the unchanged HTML/HTTP ceilings; actual native/export/response-size qualification would still be required after approval. Current native proof uses only the valid 576 derivative. Larger private samples in image-budget-tradeoffs.json are codec research, not accepted artwork assets or a reason to bypass validation. The owner can qualify live text and the current constrained image path while retaining this quality limitation.

## Proposed request allocation

| Session | Models and purpose | Maximum actual calls |
|---|---|---:|
| A | `muse-ember-1.0` via fixed `/responses`, strict concept envelope; select one validated independent concept. Then one `muse-image-1.0` `/images/generations`, text-free subject asset, server optimization and actual canonical four-format exports. If text needs its single repair, it consumes the image slot and no image request occurs. | 2 |
| B | `muse-spark-1.3` via fixed `/responses`, independent fact-grounded concepts for the difficult brief; at most one repair. No image, discovery, warm-up or repeated demo. | 2 |

Total **four actual inference dispatches**, including every failure, repair or retry; no automatic transport retry. No image edit in this experiment. One asset is reused across formats. Selecting concepts or changing copy/palette/crop never calls a provider. This is useful integrated qualification, not a fair model ranking: briefs and reasoning configurations differ. A later Gemini comparison remains a separate approved workstream.

Brief A (Minimal Swiss): “Introduce Orbit Clay, a collection of ceramic desk pieces.” Details: “Pen holders and small trays in sand and charcoal. Understated editorial direction. No prices or launch dates have been supplied. Do not invent dimensions, manufacturing locations or certifications.” Compare actual local concepts against accepted model concepts, then the selected concept with its private generated illustration/photo. Asset prompt is subject/style only, with no letters, numbers, logos, people or remote URLs.

Brief B (Bold Street): “Promote Field Notes, an introductory seminar on observing urban wildlife.” Details: “18 December 2026, 2 PM to 4 PM IST. Venue: Room Cedar. Open to first-year students. 20 seats. Entry ₹60. Bring a notebook. No certificates will be issued. Register at https://example.org/field-notes.” Test concise contextual messaging, exact complete ledger, no invented activities/urgency and meaningful nontechnical art direction. No manually written showcase plan replaces rejected output.

## Budget and runtime

Proposed **estimated reservation envelope: US$0.20 equivalent promotional credits**, never paid billing. Basis: retained Batch A reservations were $0.0295/Spark, $0.003/Ember and $0.01/image; a four-slot allocation costs at most $0.072 on that historical reservation basis. The larger $0.20 proposal allows prompt/schema growth and uncertainty. These are historical estimates, **not current prices, actual account charges or a guaranteed provider-side spending cap**. Confirm present rates and conservative prompt/output reservations before granting execution; stop if the four bounded requests cannot fit that envelope. Reserve before dispatch; an unknown charge consumes its full reserved allowance. No exact cost claim without supplied billing evidence.

Native REST only. Max output 4,000 tokens, existing Spark medium / Ember low reasoning, image tool search/web/shell disabled. Use the adapter's existing supported <=38 s bound; do not change production defaults. Session A must fit the existing 38 s overall qualification window (failed/slow image keeps validated text). Session B text only can use the existing bounded per-request timeout. No extra request to rescue an overall timeout.

## Stop and evidence rules

Stop immediately on authentication, quota/billing, exhausted requests/credit reservation, unknown dispatch accounting, unsafe output or lost eligibility. A structural/semantic rejection may use only the single repair inside its session allocation. Preserve rejected plan hashes and privacy-safe diagnostics; don't expose raw rejected/private bodies through public UI. A local fallback is application success, never live model acceptance.

Retain each original synthetic brief, ledger, concept envelope, validation, selected specification, actual provenance, dispatch reservation/count, latency, available input/output/reasoning usage, unknown cost fields, all four actual PNG downloads, portable HTML/JSON and unchanged PNG/DOM and HTML/DOM comparisons. Record subjective improvements separately: contextual copy, independent concepts, subject relevance, hierarchy and image utility. Report every failed/refused output. Acceptance requires factual safety, supported selected direction, truthful provenance and valid native exports; artistic and production acceptance remain the owner's decisions.

This proposal does not resolve the original M6BC headed raster failure, public repository/application access, original-code/native distribution licensing, metadata/domain, release audit or submission gates. M8–M11 and all expanded workstreams remain active under their separate authorizations.
