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
| Profiles | CRUD, local storage, JSON backup/restore and calculation-receipt export | Native encrypted backup migration and Keychain storage not ported |
| Charts | Natal/transit/overlay SVG wheels, positions, speeds and cusps | v2.3.2 chart interaction design unknown |
| Time Machine | Requested moment recalculation and 24-hour symbolic-index chart | Advanced convergence, secondary progressions, solar arcs, solar returns, profection narrative and heatmaps not ported |
| Astrology extensions | Six minor bodies supported | 56 live/named asteroid augmentation, VOC root search, eclipse/event catalogue and notification schedules not ported |
| Qwen3 | Actual Cloudflare-hosted Qwen3 through the AI binding, connection status, evidence-packet copy and optional custom gateway; live HTTP 200 Arabic explanation verified | Original v2.3.2 prompt templates and native llama.cpp runtime remain unavailable; hosted inference is not native on-device parity |
| PWA | Install manifest and same-origin offline shell/assets | Browser/OS push notifications and native widget/watch integrations are not implemented |

Core synastry tables preserve the source's pair-key entries exactly. Some source keys are not in the sorted pair-key order used by its lookup; no silent model corrections were introduced. Source score matching therefore must be distinguished from changing the scoring model.

## Required for exact continuation

Recover the v2.3.2 source archive and representative iPhone screens, then reconcile the ledger against that build. Run shared fixed-date/profile vectors through the actual Swift app and this web build, including the complete post-processing pipeline. Until then, the current web application is runnable and deployment-ready as a clearly labeled partial port.
