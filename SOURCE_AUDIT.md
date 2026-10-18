# Source audit and parity ledger

Inspected 2026-10-18 before architecture selection.

## Evidence available

- Connected private repository: `mazenmix/MazenmiXOracle`, default branch `main`.
- Tree commit: `5f9b1990f5f2ad154ee325e68fd229666b80ff5a`.
- Root archives: `MazenmiXOracle-v1.1.0.zip`, `MazenmiXOracle-v1.1.1.zip`.
- Current overlay README identifies the product as **MX Eye 1.9.1**, with Tropical zodiac, Placidus houses, Swiss Ephemeris Swift package pinned at 0.0.99, and a personal default profile (excluded from this public repository).
- Read `AstrologyEngine.swift`, `OracleModels.swift`, `InterpretationEngine.swift`, `CompatibilityEngine.swift`, `AdvancedForecastModels.swift`, `SwissEphemerisRuntime.swift`, `RootView.swift`, `SecondaryViews.swift`, `MXOptionalAI.swift`, `SignalResolver.swift`, `OracleMathTests.swift` and `BaghdadHistoricalTimeZoneTests.swift`.
- Fetched and visually inspected the original gold-eye `BrandLogo.png`; used as the app mark and install icon.
- Read referenced **MX Orbit** and **Astro app** chats. Their assistant turns resolve only to content-reference placeholders. The available attachment records are screenshots, not the v2.3.2 source archive.
- Opened ChatGPT Library in the available browser. It showed the signed-out interface, so source files in the user's library could not be inspected. No library-search connector is available in this session.

**No v2.3.2 source or screenshots of its actual screens were recovered. Do not claim visual or functional v2.3.2 parity.**

## Architecture decision

Static Vite + TypeScript app, local Swiss Ephemeris WebAssembly, Temporal civil-time conversion, localStorage profiles, and optional same-origin Cloudflare Pages Functions for Qwen explanations. This keeps the mathematical path on the device, enables PWA offline use, and avoids exposing credentials in frontend code. A separate UI framework is unnecessary for this bounded application state; all user-supplied text is HTML escaped.

Vendored Swiss module loading is separated from Vite transformation so its WASM/data file paths stay correct. All assets, including fonts, are same-origin. No native iOS binaries are embedded in the web application.

## Parity ledger

| Area | Implemented | Remaining / differences |
| --- | --- | --- |
| Navigation | Original five main destinations plus Time Machine, evidence and AI; mobile/desktop layouts | Exact v2.3.2 navigation unknown |
| Appearance | Source-inspired dark cyan/violet panels, original gold-eye logo, Arabic RTL and English LTR | Pixel matching unverified; no v2.3.2 screenshot baseline |
| Celestial coordinates | 10 planets + 6 minor bodies, tropical longitudes/speeds/retrograde; Placidus cusp/ASC/MC calculations | Swift package's exact ephemeris resource version not independently recovered; three-date native/WASM agreement verified |
| Aspect evidence | Five major angles, original body-specific orbs, six-hour applying projection, natal importance, weights, top-48 sorting and linear peak estimates | `SignalTimingRefiner` rate/root-search enhancement not ported |
| Core signals | Grouping, top-four factors, supportive/challenging rules, evidence tiers, tone, directional scores, annual-house +5 boost | `SignalResolver` live-asteroid augmentation, `DecisionEngine` humanization/finalization and contradiction/timing refinement not ported |
| Interpretation copy | Clear Iraqi Arabic/English, based on the source's practical guidance | Curated condensed copy; exact stable-hash variant selection and every original narrative not ported |
| Synastry | Source aspect orbs/influence, relevance/geometry tables, overlay bonuses, six dimensions, role-aware overall weighting, unknown-time handling | Partner timing/intimacy narrative, relationship history, CRM and notification workflows not ported |
| Profiles | CRUD, local storage, JSON backup/restore, optionally password-encrypted AES-256-GCM backups, and calculation-receipt export | Existing localStorage is still unencrypted; native Keychain, migration and cross-device sync not ported |
| Charts | Natal/transit/overlay SVG wheels, positions, speeds and cusps | v2.3.2 chart interaction design unknown |
| Time Machine | Moment recalculation, 24-hour trend, secondary progressions (day-for-year), solar arc, exact selected-year and next Solar Return | Advanced convergence beyond Moon/Sun roots, full profection narratives, heatmaps and v2.3.2 parity outstanding |
| Astrology extensions | Six minor bodies, conventional classical Moon VOC, exact aspect roots, lunar sign ingress and calendar export | 56 further named asteroid resources, eclipse catalogue, alternative VOC systems and backend push schedules not ported |
| Qwen3 | Actual Cloudflare-hosted Qwen3, evidence-packet copy, 23 explicitly derived symbolic indicators, Go Mode and calculated WHY NOW evidence | Original v2.3.2 prompts and native llama.cpp not recovered; derived values are not 23 independent validated forecasts |
| PWA | Install manifest, offline shell, optional foreground MX Eye reminders and lunar calendar export | Full Web Push while closed, watchOS, and iOS widgets not implemented |

Core synastry tables preserve the source's pair-key entries exactly. Some source keys are not in the sorted pair-key order used by its lookup; no silent model corrections were introduced. Source score matching therefore must be distinguished from changing the scoring model.

## Required for exact continuation

Recover the v2.3.2 source archive and representative iPhone screens, then reconcile the ledger against that build. Run shared fixed-date/profile vectors through the actual Swift app and this web build, including the complete post-processing pipeline. Until then, the current web application is runnable and deployment-ready as a clearly labeled partial port.

## Updated parity ledger — 2026-10-18 09:44 UTC (supersedes older rows above)

- **Asteroid source restoration:** all 56 *original* MX Eye `LiveAsteroidCatalog.definitions` names, official MPC integers, Swiss body IDs, source categories and short ephemeris file paths have been copied to the web source and tested. **Actual additional asteroid coordinates remain unavailable**: the deployed swisseph-wasm 0.1.0 package preloads the six built-in minor bodies but not these 56 numbered-asteroid files. The new UI is transparently a catalogue.
- **New/Full Moon and eclipse screening:** real geocentric Sun–Moon angular root searches over a 90-day window, using actual Moon ecliptic latitude and an explicit 2-degree near-node screening threshold. **Not a genuine global/local eclipse detector, not a prediction of visibility, magnitude, peak, type or contacts.** Dedicated Swiss eclipse functions are not exposed by this wrapper.
- **Precision inspector:** opt-in Swiss-resampled transit-to-fixed-natal-body exact-root search within ±21 days (retrograde returns supported); no invented timing outside this interval. The native complete SignalTimingRefiner remains unmatched.
- **Decision audit:** separate opposing-weight comparison displays mixed evidence explicitly and retains the source's eight symbolic categories. No predictive statistics.
- **Time Machine:** 30-day visual heatmap, selecting any one core category or the aggregate, sampled at successive 24-hour instants; real date selection.
- **Qwen3:** system prompt now uses supplied supporting/challenging factors and calibrated uncertainty; still hosted server-side, not on-device/native.
- **Relationship history:** local observation journal tied to saved person IDs, classification and prose protected against HTML injection, included in separately encrypted or plaintext backups. Comparisons are descriptive self-selected samples, **not** validation of astrology. localStorage itself is not encrypted.
- **Remaining:** complete 56-asteroid ephemeris assets plus WASM mounting/verification, real eclipse geometry/visibility API, original MX Orbit v2.3.2 source/UI parity, secure persistent Web Push delivery and opt-in subscriptions, native Watch/WidgetKit/iOS signing, and at-rest encrypted cross-device sync.

## Latest validated state — 2026-10-18 10:13 UTC (overrides old missing-engine rows)

**Original 56 asteroids:** ALL 56 source-matched MPC-numbered SE1 files have now been served through the deployed allowlisted /api/asteroid endpoint, retrieved in the live GitHub Actions integration check, mounted into the existing Emscripten Swiss Ephemeris virtual filesystem, and used to calculate independently changing 2026 vs. 2027 longitudes. Users explicitly click to download/cache the data; loading is not automatic and failures are shown without invented values. This resolves the original missing-coordinate-blocker for supported dates while keeping original eight core scores unchanged until full Swift SignalResolver equivalence is established. The additional verified aspects are made available separately and optionally to Qwen3 under strict 8-contact server allowlisting.

**Confirmed eclipses:** dedicated Swiss Ephemeris solar/lunar global eclipse search functions, classification, maximum times, supported contacts, solar greatest-eclipse coordinates, and user-initiated stored-birth-location local-visibility checks are now wired. Automated output agrees on eclipse type/date with NASA's 2027 February solar and lunar records. This is distinct from the still-accessible 90-day preliminary near-node screen. Browser location is NOT inferred; saved coordinates are the birthplace, not automatic current GPS.

**Validation:** GitHub Actions run 39118371658, 92 automated tests passed and one online-gated test skipped by the default test suite, plus a separately executed 56/56 production binary/WASM smoke test. Earlier claims in this file that this particular WASM wrapper lacked eclipse search routines or that all 56 asteroid positions were unavailable are superseded.

**Still outstanding:** verified exact screen/function parity with unavailable v2.3.2 native source; watchOS, WidgetKit, signed native app, full backend Web Push/trigger scheduler and device-permission testing; encryption-at-rest/opt-in cross-device sync; production iPhone Safari background/offline E2E certification; and source-identical complete DecisionEngine narrative postprocessing.
