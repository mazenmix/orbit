# Verification record — 2026-10-18

## Automated checks

- `pnpm install --frozen-lockfile`: passed with pnpm 11.25.0.
- `pnpm test`: 20 tests (GitHub CI validates the public demo configuration), zero failures.
- `pnpm build`: TypeScript check passed; production Vite build passed; offline asset manifest generated.
- Three independent native Swiss Ephemeris snapshots: 1900-01-01 12:00 UTC, 2026-10-18 09:00 UTC, 2030-06-15 18:30 UTC.
- At each snapshot: all 16 bodies' longitude and longitude velocity, 12 Placidus cusps, ASC and MC match the official native executable within 0.000001 degrees (degrees/day for velocity).
- Tests also cover Swift-derived mathematical vectors, orb boundaries, six-hour applying projection, exact-window estimate, synastry geometry, historical Baghdad DST, ambiguous-time rejection, birth-time anniversary profections, unknown-time exclusions, polar house omission and optional gateway input/privacy handling.

Native vectors establish numerical engine agreement with the official native executable, using identical ephemeris data. They do not establish parity with all Swift app interpretation/post-processing layers.

## Browser checks

Tested through the supported in-app browser:

- Production static build loads with the deployment Content Security Policy, including WASM compilation.
- Iraqi Arabic RTL mobile view at 390px and English LTR switching.
- Desktop layout at 1280px; document width 1265px, no horizontal page overflow.
- Mobile document width 375px inside a 390px viewport, no horizontal page overflow.
- Time Machine input changed to 2030-06-15 21:30 Asia/Baghdad; heading, positions and scores changed to the requested instant.
- Local temporary profile added with unknown birth time, saved, opened in synastry, and removed through the app's delete flow. The comparison omitted partner Moon/angles/houses and excluded dating-only dimensions for a friend.
- The original profile remained in place.
- Mobile More tools menu opens Time Machine, technical evidence and Qwen3.
- Qwen3 request on the static preview reports that the gateway is unconfigured; it does not fabricate a model response.
- Production offline test: after cache installation, the owned preview server was configured to close all connections. A **new browser tab** loaded the app, initialized the WASM engine and rendered Time Machine successfully. The existing tab also displayed the natal chart, speeds and cusps. Server connections were restored afterward.
- Reviewed mobile and desktop screenshots for layout and legibility.

## Not verified or not implemented

- Actual iPhone Safari install prompt, iOS home-screen lifecycle, or watch/widget behavior; this session used a desktop browser with a mobile viewport.
- Qwen3 with a live configured gateway. Gateway success/privacy tests use a mock endpoint response.
- Complete source parity with MXOrbit v2.3.2, whose source archive was not available.
- Advanced Swift post-processing, complete live-asteroid catalogue, VOC/event scanning, convergence techniques, background push or native notification scheduling.
- Cloudflare deployment, DNS, custom-domain attachment and production TLS. No domain was selected and no publishing action occurred.

See `SOURCE_AUDIT.md` for feature-level coverage.

## GitHub cloud validation

The public repository's anonymous demo configuration passed all 20 automated tests and the production build on GitHub Actions. The `mx-orbit-web-build` artifact was uploaded successfully: https://github.com/mazenmix/orbit/actions/runs/39109236441 . Personal default birth data and the personal natal fixture were excluded from this public source. Development setup is provided for GitHub Codespaces; no local checkout is required.

## Live Qwen3 integration — 2026-10-18

- Qwen3 runs on Cloudflare Workers AI using `@cf/qwen/qwen3-30b-a3b-fp8` through the server-side `AI` binding.
- The GitHub tests and production build passed for commit `b1a280396c489c96214b45c0134a42d8e088e4ca`; Cloudflare Pages deployed it successfully to the mxastro project.
- `GET https://mxastro.pages.dev/api/explain` returned HTTP 200 with `configured: true` and `provider: cloudflare`.
- An actual live POST using synthetic, nonpersonal evidence returned HTTP 200 and a generated Arabic explanation with the Qwen3 model identifier. No API key, model weights or project checkout were stored on the user's computer.
- Six added gateway/Workers AI tests cover binding status, actual invocation shape using a mock binding, allowlisting, quota/error behavior, malformed JSON and hidden-reasoning exclusion; total automated test count is 26.
- This validates the deployed server-side Qwen3 path, not native on-device llama.cpp parity or quality guarantees for every interpretation.

- Follow-up: supporting/challenging classifications and strongest-factor selection are now supplied deterministically by the calculation layer. Qwen3 is instructed to preserve them, and an all-challenging packet is covered by a regression test. Total automated tests: 27.

## Live follow-up — 2026-10-18 08:41 UTC

- Continued **the existing live mxastro project**, backed by `mazenmix/orbit`, rather than creating a separate site.
- Commit `fef9e90ccf12c7c742c4cb57ae9a874c3860964f` followed the initial presentation patch to normalize Unicode whitespace/punctuation reliably.
- GitHub Actions run [39112340310](https://github.com/mazenmix/orbit/actions/runs/39112340310) passed `pnpm test`, `pnpm build`, and artifact upload; 39 tests including four distinct-highlight regressions.
- A fresh fetch of https://mxastro.pages.dev/ after that run returned the anonymous-demo explanation and distinct secondary signal actions, confirming visible live deployment.
- `GET https://mxastro.pages.dev/api/explain` returned `configured: true`, `provider: cloudflare`, and `model: @cf/qwen/qwen3-30b-a3b-fp8`. That is connection-state evidence, **not** a fresh model-inference success test.
- The default demo remains Greenwich/UTC by design until the visitor enters their own local profile. This is now made explicit to avoid misrepresenting anonymous readings as a personal natal chart.
- Native v2.3.2 UI parity, iPhone Safari lifecycle, push scheduling, and advanced event/asteroid engines remain unverified or unimplemented as documented in SOURCE_AUDIT.md.

## Functional continuation — 2026-10-18 09:06 UTC

- Moon VOC/ingress root search, classical five-angle exact scan and 15-minute lead calendar reminder export implemented.
- Added secondary progressions, solar arc directions, exact Solar Return near the selected birthday and the next future return.
- Added 23 derived symbolic indicators, WHY NOW evidence, and four Go Mode heuristic summaries. None are event probabilities.
- Added AES-256-GCM password-protected backup export/import using PBKDF2-SHA256 (310,000 iterations), no password persistence. Browser localStorage itself is not encrypted.
- Added opt-in foreground Moon, hourly and daily reminders with deduplication. Background push and watchOS are not claimed.
- GitHub Actions run 39113962881 passed 61/61 tests, production build and artifact upload; later runs cover the follow-up next Solar Return change.
- Live inspections confirmed /#lunar, /#intel, /#advanced, /#settings and configured Qwen3 server binding on mxastro.pages.dev.
- Remaining: v2.3.2 source/UI parity, 56 named asteroid resources, eclipse/event catalogue, backend Web Push, native widgets and Apple Watch integration.

## 2026-10-18 precision, source recovery and publishing verification

- GitHub Actions 39116397461 passed **79 tests out of 79** and production TypeScript/Vite build, covering new exact aspect roots (including retrograde), mix-of-evidence audit, heatmaps, syzygy/near-node screening, private journal validation, and 56 asteroid identifiers.
- Navigation correction commit e6f65373ddee3065b87f2baf068fbb6cd61264dd also passed GitHub Actions 39116421554.
- Actual public site was inspected on https://mxastro.pages.dev/#asteroids (56 original catalog entries and explicit missing datasets), https://mxastro.pages.dev/#eclipses (six new/full Moon events in a 90-day demo interval and honest near-node screening), and https://mxastro.pages.dev/#time (calculated 30-day heatmap).
- Qwen3 server-side prompt was expanded to discuss actual both-sided evidence with no predictive certainty. Server integration tests passed but **no fresh end-to-end content-quality evaluation on the live provider** is claimed.
- Native 56-asteroid position data and dedicated global/local eclipse geometry are not part of the current Swiss WASM build. App Store/watchOS parity, closed-app push, UI pixel matching, real iPhone installation and encrypted cross-device sync remain unverified/unimplemented.

## Swiss eclipse and all-56-asteroid validation — 2026-10-18 10:13 UTC

- Tested Swiss WebAssembly solar/lunar global eclipse search, classification and greatest eclipse position against NASA's 2027 February 6 annular solar eclipse and February 20 penumbral lunar eclipse. Verified [live eclipse screen](https://mxastro.pages.dev/#eclipses) with the 2027 February, July and August events. Birth-location visibility checks only run on explicit user request.
- Retrieved original 56 numbered asteroid SE1 files via Cloudflare Pages' allowlisted ephemeris proxy, with a successful live JSON availability probe for Eros #433 (145,645 bytes) and Psyche #16 (36,130 bytes).
- GitHub Actions [run 39118204756](https://github.com/mazenmix/orbit/actions/runs/39118204756) checked **56 out of 56 real downloaded binary sources** successfully mounted in existing Swiss WASM, and each returned a valid changing 2026 and 2027 longitude. This is an actual numerical integration check, not a catalog-only test.
- GitHub Actions [run 39118371658](https://github.com/mazenmix/orbit/actions/runs/39118371658) passed 92 default tests (plus 1 skipped online-gated test) and a separate **56/56** live online test. The TypeScript + Vite production build succeeded.
- Users opt in to fetching additional asteroid files; CacheStorage avoids network re-downloads when supported and malformed/unavailable files are not given invented longitudes. Qwen3 optionally receives up to eight server-allowlisted calculated asteroid/natal contacts without private birth profile metadata.
- Native iPhone Safari lifecycle, full Swift v2.3.2 parity, reliable closed-app push delivery, watchOS/WidgetKit and end-to-end encrypted sync are still unimplemented or unverified.

## 2026-10-18 MX Astro owner-facing release verification

- Automated CI run [39122919420](https://github.com/mazenmix/orbit/actions/runs/39122919420): **118 passing automated checks, zero failures, one opt-in integration test skipped inside the default suite**. Production TypeScript/Vite build passed. Separate **56/56 live Swiss WASM binary integration check passed**.
- Source tests cover counterclockwise house-cusp geometry, separate readable glyphs and colors, actual natal owner dossier, Male/Female grammatical handling with neutral fallback, 12-month calculation samples, 21-day relationship score windows and actual 30/90/365-day sampling intervals.
- The PWA service-worker test validates incoming push display and click handling plus an allowlisted internal destination. It does **not** prove server delivery or subscription persistence; those remain unimplemented.
- The website was retrieved and checked at [/#chart](https://mxastro.pages.dev/#chart), [/#advanced](https://mxastro.pages.dev/#advanced), [/#time](https://mxastro.pages.dev/#time) after deployment: geometric wheel heading, chart owner dossier, monthly reading and long-heatmap controls appeared in the rendered document.
- **Not certified**: native Apple Watch/iOS WidgetKit, closed-app background subscription flow, real iPhone Safari/Web Push lifecycle tests, encrypted-at-rest cross-device sync, and complete native v2.3.2 source parity.


## 2026-10-19 — calculation and narrative reliability revision

Calculation version: `2026-10-19.1`. This revision supersedes earlier notes about six-hour applying projections and linear peak estimates.

- Today, Time Machine, calendar checkpoints and supplemental asteroid contacts now use the same instantaneous applying/separating calculation. The adaptive step cannot cross exactness; ordinary aspect records no longer contain guessed exact timestamps. Numerical crossing searches remain available.
- Required Sun-through-Pluto coordinates and signed velocities must be present and finite. Missing required data stop a reading; optional minor-body failures are explicitly omitted and marked incomplete. Invalid house cusps/angles are rejected. Unknown birth time, missing natal angles and pre-birth moments receive no invented annual-house score bonus.
- All eligible natal-transit aspects remain available; the old global 48-contact truncation is removed. Domain summaries and the bounded AI packet retain the strongest support and challenge, including counter-evidence below a plain top-N cutoff. This intentionally changes symbolic scores in affected cases; it is not a new empirical probability model.
- AI output review checks localized percentages, unauthorized bodies, common unsupplied sign/house statements, incorrect explicit aspect pairs, unsourced angular numbers, missing counter-evidence and unsupported numeric dates. Rejected text is replaced by a readable deterministic explanation of the actual supplied factors. These are bounded output checks, not proof that every possible model hallucination is detectable.
- Every AI explanation shows the calculation instant it describes. Profile/time changes invalidate previous requests; a failed calculation clears prior results rather than displaying stale scores. Technical exports include the method version, timezone and calculation conventions.
- The rolling calendar still uses three independently calculated local checkpoints (04:00, 12:00, 20:00), with sampled minimum/maximum and the unchanged color thresholds. A daily composite is distinct from its noon Time Machine snapshot. Leap-day anniversaries constrain to Feb 28. Failed days remain unavailable across rerenders, and cancelled old calendar jobs cannot reset a new generation.
- VOC requires Moon plus all six convention bodies. Root brackets now refine to one second; this is numerical search tolerance, not a claim of one-second absolute physical accuracy. The scan no longer drops the first/last minute of a sign.

Verification: 237 automated tests passed; one opt-in online asteroid test skipped. Production TypeScript check and Vite build passed. Existing independent native Swiss snapshots remain checked at their recorded tolerance. New real-ephemeris regressions compare report/calendar contacts across twelve monthly 2027 snapshots and check motion against positions one second later. Fault injection covers missing planets, nonfinite velocities and corrupt houses. Browser QA completed all 365 demo calendar days without failed/pending cells and exercised Moon timing.

Numerical agreement and software tests do not validate symbolic personality, luck, relationship or event predictions. Historical time conversion still depends on the host IANA/ICU timezone database. Three samples do not resolve every intraday maximum or event.

Production follow-up: three actual explanation requests exposed a reversed applying/separating statement and awkward Arabic terminology in model output. Added pair-specific motion/orb checks, mandatory symbolic framing, unsupported-comparison rejection, Iraqi terminology instructions, and regressions using these observed failure patterns.

Verified fallback explanations now tailor their action and observation to the actual target domain (work, relationships, communication, energy, reflection, planning or priorities), retaining calculated factors without repeating a generic action.

## 2026-10-19 — missing-evidence and natal-output review

- Unknown birth time now excludes the natal Moon from both chart dossiers and other bodies’ nearest-natal-aspect narratives. Chart highlights, natal topic bases and placement cards reject nonfinite positions/velocities; invalid angles do not supply natal evidence.
- Each of the 200 natal topics requires at least two valid, relevant indicators before producing symbolic traits, challenges or illustrative examples. Missing/limited data return an explicit insufficient-data state, disable optional AI inference and hide stale AI text. This is an editorial completeness gate, not an empirically validated personality threshold.
- The natal AI endpoint checks topic relevance, supplied birth-time status, sign/longitude consistency and aspect geometry before inference. Common outcome checks are shared with transit explanations: localized percentages, explicit future certainty, selected private-desire claims and diagnosis patterns cause replacement rather than display. A disclaimer cannot excuse another certainty claim in the same sentence. Symbolic framing is required for a generated natal response.
- Responses disclose client-provided ephemeris evidence separately from generated/editorial interpretation, the input checks performed, bounded output-review status and `predictionValidated: false`. The server validates the submitted coordinates’ consistency; it does not independently reconstruct a birth chart without birth inputs.
- The calendar’s compact score label explicitly identifies a symbolic index sampled at three times. Layout and existing color thresholds are retained. Empty transit evidence no longer produces a dominant personal theme from default/bonus scores.

Verification before publication: **250 automated tests passed, zero failed; one optional online asteroid integration test skipped**. TypeScript check and production Vite build passed. New regressions cover all 200 topics without evidence, the unknown-time Moon leaking into another body’s aspect narrative, unavailable-data UI, pre-inference rejection and claims rejected despite numerically valid placements. These tests establish the behavior of these safeguards, not scientific accuracy of astrological personality or event predictions. Output checks are deliberately bounded and cannot prove that every possible unsupported statement is detected.

Production follow-up for commit `630523d7e73602726f8c0ab39358db6013a142eb`:

- Cloudflare Pages check **mxastro** succeeded. [Build and test run 39224255990](https://github.com/mazenmix/orbit/actions/runs/39224255990) succeeded. The unrelated legacy `orbit` Pages project is not the deployment being verified.
- Actual same-origin requests to `/api/soul` returned `422 INSUFFICIENT_EVIDENCE`, `400 UNRELATED_EVIDENCE` and `400 UNKNOWN_BIRTH_TIME` for the corresponding insufficient, unrelated and time-sensitive evidence cases.
- Three fresh real-provider requests used Swiss-calculated anonymous Greenwich demo coordinates: natal topic 1 with known time, natal topic 67 with unknown time and a transit explanation for `2027-03-04T12:00:00.000Z`. All returned HTTP 200 with the reviewed fallback: topic 1 failed the unsupported-claim/framing check, topic 67 failed repetition review, and the transit response used the grounded fallback. Final returned text passed the corresponding bounded claim/evidence review. This verifies exclusion and replacement behavior; **no raw-model content-quality pass is claimed for these three samples**.
- Browser inspection confirmed the deployed `index-DUNnejmI.js` bundle, natal evidence disclosure and the compact calendar label “مؤشر رمزي · 3 أوقات”. The live demo calendar completed **365/365** days with zero pending and zero unavailable cells.

## 2026-10-19 — complete evidence and conclusion sensitivity

Calculation version: `2026-10-19.2`. This revision changes symbolic domain scores; celestial coordinates, calendar scoring and color thresholds are unchanged.

- Reproduced a concrete ranking error with the anonymous Greenwich demo at `2027-01-15T12:00:00.000Z`. The former career display used four factors, net `+1.836`, and returned `97/100` / `exceptional`. All ten available career factors instead totaled support `3.377` and challenge `3.774` (rounded), net `-0.397`. The revised signal uses all ten factors and returns `46/100` / `watch`, explicitly mixed. Four representative contacts remain in the compact disclosure.
- Domain scores and conclusions now use the complete, deduplicated calculated set. Duplicate labels cannot multiply a contact; conflicting copies fail closed. Zero-weight, invalid-angle and nonfinite-orb records cannot establish a direction. A near-neutral total no longer inherits the lead factor’s direction, and an exactly balanced total receives 50.
- S-tier requires distinct transiting bodies rather than three contacts from one body. Each review checks whether removing every contact from one transiting body reverses or erases the aggregate direction. This is a deterministic sensitivity test, not statistical confidence or proof that different bodies are independent evidence about real-life outcomes.
- Advice and visible tone labels consider the complete domain basis and explicitly retain mixed context. Go Mode checks each unique source category behind all of its derived drivers; missing, conflicting or source-sensitive evidence cannot authorize GO. Default averages do not establish a recommendation. Transit overviews select a domain with actual contacts, rather than promoting the highest default/bonus score.
- Hour/day comparisons use complete calculated sets before limiting transmitted examples to 12 per change type. Full counts, comparison scope and truncation are preserved, so packet-ranking churn cannot fabricate entry/exit or stability. Unavailable historical calculations remain null, never a synthetic stable observation. The server rejects malformed comparisons and inconsistent totals before inference.
- AI review additionally checks explicit symbolic classifications against the named aspect and rejects common one-sided claims that deny supplied counter-evidence. These remain bounded checks, with deterministic fallback on rejection.

Prepublication verification: **271 tests passed, zero failed; one optional online asteroid integration test skipped**. TypeScript and production build passed. Real Swiss ephemeris regressions cover all domain balances across twelve monthly 2027 demo snapshots, including the observed January reversal. Additional checks cover grouped source sensitivity, duplicates, near-neutral direction, missing Go Mode sources, ranking churn, truncated comparison counts and incorrect model classifications. Numerical consistency and these safeguards do not validate astrological predictions empirically.

Production follow-up for `62e020083aa4684dd7effa166f4189e246a5d67a`: the **mxastro** Pages deployment and [build/test run 39227329850](https://github.com/mazenmix/orbit/actions/runs/39227329850) succeeded. In the browser, the actual old `index-DUNnejmI.js` bundle displayed career `97/100` for the January demo case; after loading `index-BH2EeFKX.js`, the same profile/instant displayed `46/100`, mixed-contact labels and the qualified practical action. Go Mode displayed both supporting and challenging contacts and retained CHECK for the sampled missing/source-sensitive conditions. No horizontal overflow was observed in these desktop views.

Three actual `/api/explain` requests used full-set hour/day comparisons for the demo at `2027-01-15T12:00:00.000Z`, `2027-03-04T12:00:00.000Z` and `2027-05-22T12:00:00.000Z`. All returned HTTP 200 and `grounded-fallback`; their final text passed the strict bounded aspect/orb/motion/classification review. This demonstrates working replacement behavior, not a raw-model quality pass. A malformed historical-comparison request returned HTTP 400. The separate responsive-browser CI job was still running when these results were recorded; no pass is claimed for it.

## 2026-10-25 — interpretation and missing-evidence corrections

Method `2026-10-25.1` repairs the audited mismatch between a narrative's described pair and its actual natal aspect, removes sign-only replacement paragraphs from the displayed Soul reading, and makes topic strengths, challenges, examples and actions depend on selected natal factors. New regressions strip topic introductions before measuring substantive distinctness, change the chart before comparing each personalized field, verify actual pair references and MC meaning, and keep sensory topics separate from relationship/career assumptions.

Heatmap callbacks now require report evidence coverage. Missing domain indices are null, not neutral 50; averages and summaries exclude them and retain coverage. Contextual Go Mode reviews the contributors that produced the contextual value, with regressions for supported work/travel GO and missing, mixed and source-sensitive cases. Narrow close-contact review remains a separate API.

AI tests now include the exact generic-prose bypass and natural Arabic/Iraqi wrong-placement examples found in the audit. Explanation responses use bounded semantic-factor review and preserve model/fallback provenance, which the UI displays. This is an improved bounded guard, not a proof of complete semantic correctness. Original native Swiss fixture comparisons remain in the default suite; astronomical coordinate formulas were not replaced.

Local validation: 493 tests passed, one optional live asteroid test skipped; TypeScript and production build passed. Twelve focused Chromium browser tests passed across desktop/mobile configurations, exercising real WASM initialization, natal topic interaction, unavailable heatmap cells and both explanation source labels. Source-label cases mock the API response deliberately. Chromium mobile viewports do not establish physical iPhone/Safari behavior; the broader CI browser suites remain separate checks.
