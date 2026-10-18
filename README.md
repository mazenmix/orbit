# MX Orbit — web edition

A working mobile-first Iraqi Arabic / English PWA, built from inspected MazenmiXOracle Swift source. This is a source-backed web foundation, not a verified pixel-for-pixel port of MXOrbit v2.3.2.

## Work on GitHub

The source of truth is this repository. Open **Code → Codespaces → Create codespace on main** to develop in GitHub’s cloud without a local checkout. The **Build and test** Actions workflow runs the tests and produces a downloadable `mx-orbit-web-build` artifact. Website publication remains pending domain selection.

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
- Qwen3 evidence-packet export/copy and an optional Cloudflare Pages explanation endpoint. AI is off until configured.

## Calculations and limits

Swiss Ephemeris 2.10.03 runs locally through `swisseph-wasm@0.1.0`; the engine, ephemeris and fonts are all served from the same origin. No runtime CDN or analytics. Numerical core, aspect orbs, weights, signal scores and synastry scoring are ported from the inspected Swift files. See [SOURCE_AUDIT.md](SOURCE_AUDIT.md) for exact coverage and differences.

Supported dates: 1800–2399. The bundled data cover these centuries; a missing body is omitted and reported, never substituted with invented coordinates. Placidus angles/houses are omitted at latitude |φ| ≥ 66° instead of silently substituting another system. Unknown birth times use noon for planetary display, exclude that person's Moon/angles/houses from synastry, and reduce the emotional dimension factor.

Civil-time conversion uses IANA zones through Temporal + the host ICU database. DST gaps and ambiguous folds are rejected. Historical conversion therefore also depends on the browser's timezone database version. The public repository starts with an anonymous J2000 Greenwich demo profile. Enter personal birth details inside the app; they stay in your browser.

All interpretation scores are symbolic indices out of 100. They are not measured event probabilities, diagnoses, guarantees or claims about another person's private feelings. Linear exact-window estimates are labeled estimates; a full event root-search/timing-refinement port is pending.

## Privacy

Profiles are stored only in this origin's localStorage. They are not encrypted. Browser data clearing removes them; use the JSON backup feature when needed. Backups are unencrypted and should be kept private. There is no account, profile synchronization, telemetry or automatic location request.

Qwen requests occur only after pressing the request button. The packet preview lists the fields. Server-side allowlisting sends planet/contact evidence to the configured model; profile names, birth dates, coordinates and CRM records are excluded. API responses are not cached by the service worker. Gateway tokens stay in server environment variables.

## Cloudflare Pages preparation — deployment pending domain

Source repository: https://github.com/mazenmix/orbit . No domain has been selected and no website has been deployed.

After the owner chooses a domain, connect this source directory as a Pages project (or publish a dedicated repository/branch). Use `pnpm build` and output directory `dist`. The `functions/` directory must remain at project root for Pages Functions. A static drag-and-drop upload of only `dist` provides the offline app but does **not** deploy the optional Qwen endpoint. Configure the chosen custom domain in Pages after deployment.

Optional server environment settings:

| Setting | Meaning |
| --- | --- |
| `QWEN_GATEWAY_URL` | Complete HTTPS OpenAI-compatible `/chat/completions` URL |
| `QWEN_GATEWAY_TOKEN` | Gateway credential; set as a server secret |
| `QWEN_MODEL` | Exact deployed model name, default `qwen3` |

Local full-stack preview can use `wrangler pages dev dist`; the Vite preview is static and intentionally reports that the AI gateway is unavailable. Copy `.dev.vars.example` to `.dev.vars` only when configuring a local gateway. Keep `.dev.vars` untracked. Before enabling a paid/public gateway, configure access/rate controls in Cloudflare or at the gateway: the supplied route enforces same-origin requests and bounded input, but does not implement user authentication or billing quotas.

Original native llama.cpp Qwen3 inference is not running in the browser. A future WebGPU/WebLLM implementation needs a compatible Qwen3 quantization, model download UX, memory/device capability checks and separate validation. It is not represented here as completed.

## Native-only features

| Native feature | Web equivalent / status |
| --- | --- |
| Apple Watch companion | Responsive installable dashboard; no watchOS app |
| iOS widgets | PWA home-screen icon and quick dashboard; no WidgetKit widgets |
| Background local alert scheduling | Not implemented; Web Push requires a server, permission and supported installed PWA conditions |
| Native on-device llama.cpp Qwen3 | Evidence packet + optional hosted/private gateway; no automatic cloud upload |
| Native calendar integration | Not implemented; future explicit calendar-file export is feasible |

## Verification

20 automated tests: direct Swift mathematical vectors, historical timezones, source score/synastry cases, three independent official native Swiss Ephemeris reference snapshots, Time Machine, unknown-time exclusions, polar-house handling and gateway privacy/input checks. The native/WASM reference tolerance is 0.000001° across all 16 bodies' longitude/speed, 12 cusps, ASC and MC at three dates. Native fixture provenance is in `tests/fixtures/native-swiss.json`.

This does **not** establish complete Swift-app or v2.3.2 score equivalence: post-processing and advanced source layers remain pending. See the audit and verification notes.

## Third-party notices

Swiss Ephemeris/WASM distribution includes the wrapper's license in `public/vendor/swiss/LICENSE`. The wrapper is GPL-3.0-or-later; Swiss Ephemeris has its own upstream licensing terms. Source links and font notices are in [THIRD_PARTY.md](THIRD_PARTY.md). No proprietary deployment license is asserted by this build.
