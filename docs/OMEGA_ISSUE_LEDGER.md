# MX Astro — Omega forensic issue ledger

**Inspection date:** 2026-11-03 (Asia/Baghdad)
**Repository:** `mazenmix/orbit`; target branch `main`
**Production:** https://mxastro.pages.dev/
**Status rule:** A successful unit test, browser preview, commit or Pages site load is **not** proof that a specific Cloudflare production deployment contains the commit.

## Evidence register

- Baseline repository commit: `41ce162d2d01c63facddb169019a05e3cca972bc`; pre-change build: https://github.com/mazenmix/orbit/actions/runs/41527584010
- Verified repair commit: `c61f918bad532ab6190a2978d9a5f238b24bb17c`; build: https://github.com/mazenmix/orbit/actions/runs/41529103752 ; Chromium, WebKit and live-Qwen browser workflow: https://github.com/mazenmix/orbit/actions/runs/41529103904
- Static inventory CI integration commit: `25baa560af93ab33b3a47adadce4739bcaaba3c3`; build/inventory: https://github.com/mazenmix/orbit/actions/runs/41529530511
- The inventory CI has generated the `mx-astro-omega-static-inventory` artifact (GitHub artifact ID `13181166612`). The scanner is **static**, and cannot prove live route activation, complete source-to-UI lineage, or semantic non-duplication.
- Independent native PySwissEph root checks against rendered public Greenwich-demo event timestamps on 2026-11-02/03 UTC agreed to less than one minute for Moon–Jupiter conjunction, Moon–Venus sextile, and Moon entry into Virgo. This is a *three-event sample*, not exhaustive ephemeris certification.
- Production homepage could be loaded and its rendered sky text inspected. The requested interactive production browser verification was not completed; therefore deployment propagation and corrected production behavior are **unconfirmed**.

## Issue ledger

| ID | Section / component | Severity | Defect / observation | Root cause | Actual correction | Regression test | Commit | CI | Deployment | Live verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OMEGA-001 | Lunar, timing / `exactCrossings` | High | A sampled zero-angle **touch**, without an actual sign change, could be recorded as a perfected exact aspect. | A zero bracket was accepted after bisection without checking the sign of angular error on both sides of the candidate. | Check signed angular error at ±1 minute about the candidate; retain only genuine crossings. | `tests/timing.test.ts`, `a sampled zero that only touches the aspect is NOT an exact event` | `c61f918` | **PASS:** build, Chromium and WebKit previews | Unconfirmed | Production loaded; corrected event edge case not exercised live |
| OMEGA-002 | Engineering / source inventory | Medium (process gap) | Audit had a local static inventory generator but no reliable CI-published machine-readable artifact for every build. | `scripts/omega-inventory.mjs` was not invoked/uploaded in the main build workflow. | Generate and validate `artifacts/omega-inventory.json`; upload `mx-astro-omega-static-inventory`. | CI artifact generation and basic schema presence checks | `25baa560` | **PASS** for inventory generation/upload steps; check overall run conclusion separately | Unconfirmed | Artifact confirmed in GitHub Actions; no production change required |
| OMEGA-003 | Today / generated sky notes and future-event explanatory copy | Medium (editorial risk, not yet fully reproduced across all states) | Rendered demo shows recurring short structures and thematically similar advice; six-level semantic non-redundancy across all profiles/sections remains unverified. | Multiple independent generators and per-section selection; `skyWeatherPanel` performs note-ID dedup but no demonstrated global semantic-claim equivalence validation. | None yet — avoid destructive blanket removals without full corpus and contributor matching. | Missing a full cross-section, bilingual semantic-claim corpus gate | — | Not applicable | Unchanged | Public default demo inspected; every possible state not sampled |
| OMEGA-004 | Deployment / Cloudflare Pages | Unverified control | Main-branch push and successful GitHub CI do not establish Cloudflare deployment success or its deployed commit SHA. | Available connector exposes repository and GitHub Actions, not a confirmed Cloudflare deployment record. | None. | Requires provider deployment status/commit and a versioned production smoke check | — | GitHub CI only | **Unconfirmed** | Production homepage accessible; deployed commit not proven |
| OMEGA-005 | All routes / full browser interaction & numerical acceptance | Unverified coverage | Complete real-browser matrix, full natal/profile/time cross-product, and independent numerical comparisons for all objects were not executed. | Scope exceeds inspected source paths and available browser automation context; dynamic production automation could not start due insufficient wallet balance. | None; retain as acceptance backlog. | Requires end-to-end production fixtures, snapshots, and numerical vectors | — | Preview QA only for tested fixtures | Unconfirmed | Not verified |

## Source inventory facts (repository tree at `25baa560`)

- 249 tracked blob files, including 85 `src/*.ts` TypeScript modules and 15 `src/*.css` style modules (100 source/style files).
- 96 `tests/*.test.ts` files; 18 `src/main.ts` route-dispatch identifiers; 6 `functions/` files; 4 GitHub workflow files.
- Runtime route inventory: `today`, `signals`, `chart`, `time`, `lunar`, `calendar`, `eclipses`, `asteroids`, `advanced`, `intel`, `go`, `travelmode`, `people`, `now`, `evidence`, `ai`, `settings`, `more`.

## Acceptance classification

**Confirmed repaired in source with regression and CI:** OMEGA-001.
**Delivered and exercised as CI engineering artifact:** OMEGA-002.
**Confirmed remaining critical/high-severity production defects:** not exhaustively determined; do not report zero as proof of absence.
**Unverified or partially sampled:** OMEGA-003–OMEGA-005, other numerical/event paths, live synchronization, every per-profile and bilingual UI state, and production deployed SHA.
**Semantic/editorial preference:** Retain clear modern Iraqi voice without random synonym substitution or unsupported factual conclusions.

> Note: Astronomical coordinates and timestamps can be independently checked. Astrology-based narrative and symbolic scores cannot be certified as scientifically predictive probabilities.


## Continuation: 2026-11-03 verified fixes

Additional root-cause work was committed to `main` and run through GitHub CI. The current source revision at this entry is `76cb5c30bd6ebc74dff1ac111ea71c49410e417d`.

| ID | Section / component | Severity | Reproducible defect | Root cause | Actual correction | Test | Commit | CI | Deployment | Live behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OMEGA-006 | Calendar / automatic refresh | High | On local midnight, live calendar refresh could reset a deliberately pinned historical or future instant. | Midnight branch ran before the `liveTimePinned` check. | `shouldAdvanceCalendarAnchor` guards the midnight reset. | `tests/astroCalendar.test.ts` pinned-calendar rollover case | `9c6201b` + regex correction `bfc4366` | **PASS** at head `76cb5c3` | Cloudflare mxastro provider check success for `76cb5c3` | Specific midnight transition in production unverified |
| OMEGA-007 | Whole sky / exact planetary aspects | High | When a sampled angular difference touched zero and reversed, `scanWholeSky` could emit an exact planetary contact without a real crossing. | Endpoint-zero bisection lacked confirmation of the sign change around the refined root. | Compare signed angular error one minute on both sides before emitting the event. | `tests/wholeSkyBroadcast.test.ts` tangent-versus-crossing regression | `55b8c7e` | **PASS** at head `76cb5c3` | Provider check success | Tangent boundary not reproducible by static live-page fetch |
| OMEGA-008 | Planet motion / stations | High | A speed curve touching zero at a scan boundary could create a false retrograde/direct station date. | Station bisection accepted a zero endpoint without requiring an actual sign reversal around the station. | Verify geocentric longitude velocity sign on both sides of the root. | `tests/planetMotion.test.ts` touch-only zero-speed regression | `8a735e9` | **PASS** at head `76cb5c3` | Provider check success | Exact tangent fixture not tested in production browser |
| OMEGA-009 | Today / same-aspect duplicate narration | Medium | Current-sky note could repeat the hero's astronomical claim when the localized or editorial headline changed. | Filtering used three words parsed from a language-specific headline instead of the actual aspect identity. | `sameSkyContact` matches the unordered planetary pair plus angle; hero returns its calculated `sourceEvent`. | `tests/skyAtmosphere.test.ts` same-source identity case | `4972880` + type fix `76cb5c3` | **PASS** at head `76cb5c3` | Provider check success | Default production demo loads; specific duplicate pair not yet live asserted |

### Continuation acceptance evidence

- Build/Test: https://github.com/mazenmix/orbit/actions/runs/41535675910 — **success** at source revision `76cb5c3`.
- Today live-wheel QA: https://github.com/mazenmix/orbit/actions/runs/41535676023 — **success** at `76cb5c3`.
- Screenshot-specific profile QA: https://github.com/mazenmix/orbit/actions/runs/41535675906 — **success** at `76cb5c3`.
- Chromium and WebKit visual QA: https://github.com/mazenmix/orbit/actions/runs/41535675833 — check latest run conclusion independently.
- GitHub Check Runs for `76cb5c3` show **Cloudflare Pages: mxastro = success**. The separate orbit check may have different status; do not conflate sites.
- `https://mxastro.pages.dev/` loaded with fresh rendered Greenwich demo and calculated-sky content after the provider deployment check. A successful live page load alone does not prove the four corrected edge cases were hit in production.

**Remaining acceptance work:** Dynamic browser interaction for the entire route/profile/time matrix, fully source-grounded bilingual semantic-claim audit, independently root-solved numerical vectors across the full ephemeris and historical range, and a production-version check coupled to the actual edge-case behavior. No “100% complete” claim is warranted.


## Full route/browser acceptance expansion — 2026-11-03

**Latest tested application revision:** `338093066936f15045da572367547407f300c399`.

### Corrected and regression-tested

| Issue | Source repair | Verification |
| --- | --- | --- |
| OMEGA-010 · Same sky event narrated twice in Today | `src/skyEventIdentity.ts` introduces timestamped astronomical identity (kind, moving body, target, angle/sign/direction). Hero/timeline share that ID, not localized title strings; Moon identification uses actual body IDs. Commits `a89b1e48`, `f37ef296` (legacy source test update). | `tests/skyEventIdentity.test.ts`, full unit/build PASS |
| OMEGA-011 · Numeric claims lost by text de-dup | `paragraphFingerprint` used to remove all punctuation, silently collapsing e.g. 1.2° and 12°, 10:30 and 1030, or signed measurements. Preserves significant numeric separators and signs while normalizing Arabic diacritics/letters. Commit `7dcb8322`. | `tests/reading.test.ts` arithmetic/angle/time regression PASS |
| OMEGA-012 · Same-planet interpretation duplicated across distinct aspect geometries | Former semantic template reused identical wording for square vs opposition and sextile vs trine. Five different practical meanings now authored for each principal self-planet aspect in natural Iraqi Arabic and English, without exposing angular jargon in the daily prose. Commits `7f702544`, `33809306`. | `tests/skyAtmosphere.test.ts` matrix for 10 planets × 5 aspects × 2 languages, editorial jargon-quality suite PASS |
| OMEGA-013 · Missing exhaustive route rendering gate | New browser smoke matrix exercises **all 18 route keys**, at **1440px desktop and 390px iPhone** widths, on **Chromium and WebKit**, asserting rendered content, no unhandled browser exception, no fatal error alert, no NaN/undefined in visible text, and bounded horizontal overflow. Commit `519989ff`. | https://github.com/mazenmix/orbit/actions/runs/41543051529 — both browser engines **SUCCESS** |
| OMEGA-014 · Independent astronomical reference regression not encoded | Added verified independent PySwissEph UTC fixtures for Moon–Jupiter conjunction 2026-11-02 22:50:34 UTC, Moon–Venus sextile 2026-11-03 00:10:29 UTC, Moon Virgo ingress 2026-11-03 08:27:45 UTC, plus Moon VOC ordering and location-independent geocentric coordinates. Commit `43731571`. | `tests/astronomyReference.test.ts` PASS on revision `33809306` |

### Verified acceptance for application revision `33809306`

- **Build/test** https://github.com/mazenmix/orbit/actions/runs/41543051510 — **SUCCESS**. The node test report recorded **581 tests, 580 passes, 0 fails** (one test not passed/skipped); build, static inventory, and Swiss smoke all successful.
- **Browser QA** https://github.com/mazenmix/orbit/actions/runs/41543051529 — **SUCCESS**, including **Chromium SUCCESS**, **WebKit SUCCESS**, and a successful `live-qwen` CI job.
- **Cloudflare Pages: mxastro** — GitHub commit check **SUCCESS** on `33809306`. **Cloudflare Pages: orbit** is a separate provider check and reports failure; do not mistake it for the target application's deployment.
- **Live site** https://mxastro.pages.dev/ — separately fetched JS-rendered production content for all 18 route URLs. Several snapshots were captured before asynchronous hydration completed; those cannot independently validate full loaded-page functionality. The desktop/iPhone browser test matrix did complete successfully on the build preview.
- Number of combinations of route × viewport × browser in the **route smoke matrix**: 18 × 2 × 2 = **72**. These are basic rendering/exception/overflow checks, **not 72 distinct user-action scenarios**.

### Strict 100% distinction

The above establishes **100% pass of the newly defined 18-route smoke matrix**, not 100% perfection of the entire application's astronomy, content generation, usability, security, integrations, user profiles, and actual production behavior. Full scientific validation of astrological predictions is not achievable from software tests; numerical ephemeris data and deterministic calculations can be verified, while narrative interpretation is editorial/symbolic.

**Open acceptance:** production interaction tests against authenticated/saved real user profiles, a comprehensive semantic-equivalence check for paraphrases across all narrative modules, independent multi-epoch/multi-location ephemeris comparison beyond the pinned 2026 sample, deeper security and resilience testing, and a robust live-release build identifier check. Do not claim these complete.


## Finalized 56-asteroid and 1800–2399 acceptance gates — 2026-11-03

**Tested source revision:** `4ac468947e0e5e494d4dd0599134a7e09c3ec4f9`.

| Gap | Source-level correction or test | Evidence | Classification |
| --- | --- | --- | --- |
| OMEGA-015 — Real named-asteroid CI failures could be silently ignored; ordinary suite had one deliberate skip | Moved live full-catalog Swiss test into `scripts/asteroid-live.test.ts`; it is now a mandatory **56/56** live network and real numerical computation CI gate, independent of offline tests. `ec708148` | [Required gate CI](https://github.com/mazenmix/orbit/actions/runs/41545116694) — **PASS**, 56/56, 582 local tests PASS, zero skips | **CLOSED — enforced in CI** |
| OMEGA-016 — Limited temporal numerical coverage | `tests/epochMatrix.test.ts` verifies finite longitudes/velocities for 10 principal planets at 10 instants spanning 1800–2399, across Baghdad, Manila and Denver; tests ±1h central-difference velocity and rejects out-of-range years. `a98fab4` | [Build](https://github.com/mazenmix/orbit/actions/runs/41545597923) and [later build](https://github.com/mazenmix/orbit/actions/runs/41545810237) — PASS | **CLOSED for defined 10-epoch matrix; full continuous time range cannot be proven exhaustively** |
| OMEGA-017 — Same category text recurs despite different factor/angle | `signalStory` practical examples depend on domain, natal factor and one of five angle families. Tests 8 domains × 10 natal targets × 5 aspect families × Arabic/English (800 narrative outputs), requiring distinct examples for each combination within a domain. `7ed4832` | [Build](https://github.com/mazenmix/orbit/actions/runs/41545597923) PASS | **CLOSED for covered matrix; not a formal semantic equivalence proof for all possible prose** |
| OMEGA-018 — Invalid asteroid SE1 could poison future attempts | On validation failure, loader drops catalog-ready state, removes bad Swiss virtual filesystem binary when unlink is available, and evicts its Cache Storage entry. Regression retries a once-failing Psyche entry then verifies all 56 mount. `4ac4689` | [Build](https://github.com/mazenmix/orbit/actions/runs/41545810237) PASS, 587 local tests PASS, zero skips, mandatory live 56/56 PASS | **CLOSED for retry-capable runtime; unavailable FS unlink is a separately detectable limitation** |
| OMEGA-019 — Navigation behavior needed interactive time/language coverage | `scripts/visual-qa.spec.cjs` adds actual Now -1h/+1h/LIVE and Iraqi-to-English test of pinned UTC instant and source score, on desktop and phone in both Chromium and WebKit. `f1ba22e` | [Browser workflow](https://github.com/mazenmix/orbit/actions/runs/41545810179) — check final conclusion independently | **CLOSED for defined browser interaction matrix on revision d843b319**; corrected run: https://github.com/mazenmix/orbit/actions/runs/41546502830 — Chromium, WebKit and live-Qwen **SUCCESS** |
| OMEGA-020 — Deployed Git commit could not be read directly | `scripts/finalize.mjs` produces `/build-info.json` with Cloudflare Pages commit SHA, no-store headers; `scripts/buildProvenance.mjs` fail-closed source validation and tests. `d345d36` | Public production `https://mxastro.pages.dev/build-info.json` returned SHA `4ac468947e0e5e494d4dd0599134a7e09c3ec4f9`; GitHub Cloudflare Pages: mxastro check was SUCCESS for this same revision. | **CLOSED for exact deployed revision identification** |

**Latest verified repository metrics:** 587/587 offline tests passed, zero failed, zero skipped; live 56/56 actual numbered asteroid files were mounted and computed; main CI produced build/inventory artifacts; Cloudflare target project `mxastro` reported successful deployment, production SHA read and matched.

**Independent fixed ephemeris references:** `tests/fixtures/native-swiss.json` already checks three official native Swiss dates with 16 bodies, Placidus cusps, ascendant and MC; `tests/astronomyReference.test.ts` compares three independently root-solved lunar events around 2026-11-02/03; `tests/epochMatrix.test.ts` now adds 10-time/3-city numeric invariants and derivative consistency. These combined checks are much broader than a single-sky demo, but they do not mathematically certify all real-number instants or empirically validate astrological interpretation.

**Still open / must not falsely certify:** production authenticated/saved real-profile lifecycle (without accessing personal secrets); all arbitrary AI-generated paraphrase equivalence across contexts; external origin abuse / rate limiting of costly AI endpoint without a configured managed rate-limit rule; full correctness of Cloudflare push scheduler with its D1/VAPID infrastructure; other unobserved dynamic browser/user-profile states. A green smoke matrix is not a claim of 100% defect-free software.

**Separate project caution:** Cloudflare Pages: `orbit` has at times failed to build; the `mxastro` target succeeded and serves the exact checked Git commit. Do not conflate those deployment checks.


## Production integration readiness: verified, not inferred (2026-11-03)

Public non-sensitive health endpoints on the deployed `d843b31905e2aa3d24cae5f3a9dde766024db9e9` application were interrogated directly. They returned:

- `GET /api/explain`: `configured: true`, provider `cloudflare`, model `@cf/qwen/qwen3-30b-a3b-fp8`. Live-Qwen CI also passes.
- `GET /api/sync`: `configured: false`, `storage: not-connected`. **OPEN INFRA-001**: Cloudflare Pages D1 binding `MX_SYNC_DB` must be provisioned for encrypted cross-device sync.
- `GET /api/push`: `configured: false`, `schedulerEnabled: false`, `vapidPublicKey: null`. **OPEN INFRA-002**: Cloudflare D1 binding `MX_SYNC_DB`, VAPID public/private keys and a working scheduled sender must be provisioned before claiming background notification delivery.
- `GET /build-info.json` returned exactly `d843b31905e2aa3d24cae5f3a9dde766024db9e9`, proving which source revision was served on `mxastro.pages.dev`.

No Cloudflare administrative write connector/account session was available to provision production D1, secrets, or scheduler in this audit. These deployment prerequisites must never be marked as tested or operational based merely on successful JavaScript unit tests.

**Application tests at this revision:**
- [Build with mandatory full 56-body Swiss asteroid smoke](https://github.com/mazenmix/orbit/actions/runs/41546502794) — success; latest measured source test count is at least 587 with zero skips from the prior build, with extra source-only E2E test corrections.
- [Profile screenshot/device QA](https://github.com/mazenmix/orbit/actions/runs/41546502815) — success.
- [Today live-wheel QA](https://github.com/mazenmix/orbit/actions/runs/41546502803) — success.
- [Chromium + WebKit visual and Qwen QA](https://github.com/mazenmix/orbit/actions/runs/41546502830) — **SUCCESS across Chromium, WebKit and live-Qwen**. The original E2E scenario incorrectly expected pinned Now time to persist across *re-entering* Now, conflicting with the explicitly tested LIVE-on-navigation rule. Updated scenario validates **in-place language switch** retains pinned time while **re-entering** Now resets to LIVE. Chromium and WebKit both passed on the corrected code in the completed matrix run.

### 100% scope accounting

The defined 18-screen × 2-viewport × 2-browser smoke coverage, full deterministic unit tests, 56/56 real named asteroid calculations and pinned historical numeric vectors can achieve 100% **for their stated finite test sets**. The claim "all defects in an open-ended application are proven absent" is not formally verifiable. The two unconfigured cloud integrations are explicit functional gaps. Keep them open until production API health endpoints and actual end-to-end encrypted sync and scheduled Web Push deliveries verify true.


## Browser acceptance sign-off (completed)

- [Run 41546502830](https://github.com/mazenmix/orbit/actions/runs/41546502830) is **SUCCESS**: responsive Chromium, responsive WebKit, and live-Qwen all succeeded.
- The newly added full route smoke checks cover all 18 sections on both desktop and iPhone for both browser engines; the Now interactive regressions cover ±1-hour selected-time movement, LIVE reset after re-navigation, and an in-place Iraqi/English language switch with unchanged instant and calculated score.
- [Build run 41546502794](https://github.com/mazenmix/orbit/actions/runs/41546502794) succeeded on that source revision with the mandatory 56/56 asteroid ephemeris test and complete deterministic suite.
- Live production build-info at the time of review identified the exact source revision `d843b31905e2aa3d24cae5f3a9dde766024db9e9`.
- **Scope completion:** all defined unit, binary ephemeris, 18-route display and added Now interaction checks green. **Remaining operational blockers:** Cloudflare D1 encrypted sync, VAPID background Push/scheduler, and rate limits for costly AI requests require Cloudflare-side configuration; they are not closed by source tests.
