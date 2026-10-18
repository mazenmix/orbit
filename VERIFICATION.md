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
