# MX Orbit — web edition

A working mobile-first Iraqi Arabic / English PWA, built from inspected MazenmiXOracle Swift source. This is a source-backed web foundation, not a verified pixel-for-pixel port of MXOrbit v2.3.2.

## Work on GitHub

The source of truth is this repository. Open **Code → Codespaces → Create codespace on main** to develop in GitHub’s cloud without a local checkout. The **Build and test** Actions workflow runs the tests and produces a downloadable `mx-orbit-web-build` artifact. The live Pages project is https://mxastro.pages.dev .

## Run

Node 22+ and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

`dev` and `build` copy the pinned Swiss Ephemeris package to same-origin assets. Production output is `dist/`. `build` also generates a versioned offline service worker. The supplied `dist/` can be served directly by a static HTTP server. Opening index.html with file:// is unsupported because WebAssembly and ES modules require HTTP(S).

## Working features

- Today dashboard, symbolic category indices and auditable contact details.
- Signals, natal chart, transits, dual chart overlay, planetary speeds/retrograde, and Placidus house cusps.
- Time Machine: historical/future dates, profile-zone civil time, recalculated positions/evidence, and a 24-hour index chart.
- Ten major planets and six minor bodies: Chiron, Ceres, Pallas, Juno, Vesta, Pholus.
- Local profiles with edit/delete, known/unknown birth times, role-aware synastry dimensions, house overlays, backup/import and calculation-receipt export.
- Iraqi Arabic RTL / English LTR, mobile navigation and desktop sidebar.
- PWA manifest, install icons, static offline caching, and original repository brand asset.
- Qwen3 explanation engine through the Cloudflare Workers AI binding; optional custom gateway support. No browser model download or client-side API key.
- Moon VOC period and sign ingress from a specific classical-aspect convention with ephemeris root refinement, plus .ics calendar alarms.
- Secondary progressions (one-day-per-year), solar arc directions and exact solar return near/after the selected birthday.
- MX Intelligence: 23 derived symbolic indices from eight core categories, four Go Mode summaries and evidence-backed WHY NOW.
- Optional AES-256-GCM password-protected JSON backup export/import.
- Opt-in MX Eye foreground lunar, hourly, and daily alerts with one-shot deduplication; background Web Push is not included.

## Calculations and limits

Swiss Ephemeris 2.10.03 runs locally through `swisseph-wasm@0.1.0`; the engine, ephemeris and fonts are all served from the same origin. No runtime CDN or analytics. Numerical core, aspect orbs, weights, signal scores and synastry scoring are ported from the inspected Swift files. See [SOURCE_AUDIT.md](SOURCE_AUDIT.md) for exact coverage and differences.

Supported dates: 1800–2399. The bundled data cover these centuries; a missing body is omitted and reported, never substituted with invented coordinates. Placidus angles/houses are omitted at latitude |φ| ≥ 66° instead of silently substituting another system. Unknown birth times use noon for planetary display, exclude that person's Moon/angles/houses from synastry, and reduce the emotional dimension factor.

Civil-time conversion uses IANA zones through Temporal + the host ICU database. DST gaps and ambiguous folds are rejected. Historical conversion therefore also depends on the browser's timezone database version. The public repository starts with an anonymous J2000 Greenwich demo profile. Enter personal birth details inside the app; they stay in your browser.

All interpretation scores are symbolic indices out of 100. They are not measured event probabilities, diagnoses, guarantees or claims about another person's private feelings. Linear exact-window estimates are labeled estimates; a full event root-search/timing-refinement port is pending.

## Privacy

Profiles are stored only in this origin's localStorage. They are not encrypted. Browser data clearing removes them; use the JSON backup feature when needed. Backups are unencrypted and should be kept private. There is no account, profile synchronization, telemetry or automatic location request.

Qwen requests occur only after pressing the request button. The packet preview lists the fields. Server-side allowlisting sends planet/contact evidence to the configured model; profile names, birth dates, coordinates and CRM records are excluded. API responses are not cached by the service worker. Gateway tokens stay in server environment variables.

## Cloudflare Pages and Qwen3

Live project: https://mxastro.pages.dev . Build command: `pnpm build`; output: `dist`. The `functions/` directory stays at repository root.

`wrangler.toml` declares a Workers AI binding named `AI`. The explanation endpoint invokes the actual Cloudflare-hosted Qwen3 model `@cf/qwen/qwen3-30b-a3b-fp8`; there is no model download on the visitor's device. New commits trigger the connected Pages deployment.

If Cloudflare does not apply the binding automatically, open **Workers & Pages → mxastro → Settings → Bindings → Add → Workers AI**, set variable name **AI**, then redeploy. Workers AI must be available in the account and have remaining usage quota. This change does not upgrade the account to a paid plan.

`GET /api/explain` reports whether a binding or gateway is configured, without credentials or inference. A real explanation occurs only on `POST /api/explain` after the user clicks the button. Inputs are limited to twelve calculated contacts and allowlisted symbolic indices. Names, birth dates, coordinates, free-form user prompts and CRM fields are not forwarded. The endpoint supports Cloudflare's chat-completion and legacy response shapes and strips reasoning tags.

Workers AI usage follows Cloudflare's account quota and billing settings. The public endpoint bounds payload size and output tokens but is not an authentication or billing-quota system; apply account-side access/rate controls if restricting use is required.

An existing private OpenAI-compatible Qwen3 server remains optional. Set `QWEN_GATEWAY_URL` to a complete HTTPS chat-completions endpoint, `QWEN_GATEWAY_TOKEN` as a server secret, and `QWEN_MODEL` to the server model name. When explicitly configured, that gateway takes precedence. No token belongs in frontend code.

Original native llama.cpp inference is not running in the browser. This implementation runs Qwen3 on Cloudflare servers and returns its explanation to the browser; it does not impersonate on-device inference.

References: [Cloudflare Pages AI bindings](https://developers.cloudflare.com/pages/functions/bindings/#workers-ai), [Qwen3 model API](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/).

## Native-only features

| Native feature | Web equivalent / status |
| --- | --- |
| Apple Watch companion | Responsive installable dashboard; no watchOS app |
| iOS widgets | PWA home-screen icon and quick dashboard; no WidgetKit widgets |
| Background local alert scheduling | Foreground reminders while the web page is open; no OS-level background Web Push or watch integration |
| Native on-device llama.cpp Qwen3 | Cloudflare-hosted Qwen3; evidence sent only on explicit explanation request |
| Native calendar integration | Downloadable .ics reminders with a 15-minute alarm; no native EventKit integration |

## Verification

92 automated tests passed, one opt-in online test skipped in the default suite; a separate live check successfully calculated all 56 original named asteroids: direct Swift mathematical vectors, historical timezones, source score/synastry cases, three independent official native Swiss Ephemeris reference snapshots, Time Machine, unknown-time exclusions, polar-house handling and gateway privacy/input checks. The native/WASM reference tolerance is 0.000001° across all 16 bodies' longitude/speed, 12 cusps, ASC and MC at three dates. Native fixture provenance is in `tests/fixtures/native-swiss.json`.

This does **not** establish complete Swift-app or v2.3.2 score equivalence: post-processing and advanced source layers remain pending. See the audit and verification notes.

## Third-party notices

Swiss Ephemeris/WASM distribution includes the wrapper's license in `public/vendor/swiss/LICENSE`. The wrapper is GPL-3.0-or-later; Swiss Ephemeris has its own upstream licensing terms. Source links and font notices are in [THIRD_PARTY.md](THIRD_PARTY.md). No proprietary deployment license is asserted by this build.

## 2026-10-18 further implementation

Shipped: bounded exact natal-transit root refinement, 30-day selectable time heatmap, explicit contradictory-evidence audit, geocentric 90-day new/full Moon and near-node *screening* (not confirmed eclipses), private observation journal included in backups, source-matched names/numbers for 56 additional asteroids, and a grounded Qwen3 WHY NOW prompt. The native six main minor bodies remain distinct from the new 56-item source catalogue.

**Now supported on demand:** all 56 original MX Eye named asteroid .se1 files via a strictly allowlisted Cloudflare proxy, persistent browser CacheStorage when allowed, mounting in the existing Swiss WASM filesystem, actual astrological longitudes/speeds and new supplementary natal aspects; Qwen3 receives at most 8 validated optional additional contacts. All 56 returned valid 2026/2027 positions in online production smoke tests. A full OS-level Safari/iPhone lifecycle regression test remains outstanding.

**Certified solar/lunar eclipses:** existing Swiss global and optional birth-location visibility routines now provide event type, UTC maximum, available contact times and greatest-eclipse coordinates. Confirmed 2027 events agree with NASA. The older near-node screen remains separately labeled *preliminary*.

**Still not implemented/verified:** persistent background Web Push service and permissions/device tests, native watchOS/WidgetKit, exact original v2.3.2 UI/component parity, and encrypted-at-rest multi-device synchronization. See SOURCE_AUDIT.md and VERIFICATION.md.
