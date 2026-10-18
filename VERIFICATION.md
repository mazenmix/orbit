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
