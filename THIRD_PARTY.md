# Third-party assets and computation

- `swisseph-wasm@0.1.0`: https://github.com/prolaxu/swisseph-wasm — wrapper license GPL-3.0-or-later, copied to `public/vendor/swiss/LICENSE`. Corresponding source for the pinned release: https://github.com/prolaxu/swisseph-wasm/tree/v0.1.0 . Uses Swiss Ephemeris 2.10.03, compiled to WASM, with ephemeris files bundled in `swisseph.data`.
- Swiss Ephemeris official source and data: https://github.com/aloistr/swisseph . Upstream licensing: https://www.astro.com/swisseph/ . Preserve the upstream and wrapper terms when distributing this application.
- The native reference executable used for tests came from the official Astrodienst repository: https://github.com/aloistr/swisseph/blob/master/windows/programs/swetest64.exe . It is not distributed with this web build; its SHA-256 is recorded in the fixture.
- Original `BrandLogo.png`: user's connected `mazenmix/MazenmiXOracle` repository at audited commit; retained as `public/original-brand.png`.
- Manrope and Noto Sans Arabic: Google Fonts, SIL Open Font License. Fonts are bundled and served locally. License files are included in `public/fonts/`.
- `@js-temporal/polyfill@0.5.1`: ISC license, https://github.com/js-temporal/temporal-polyfill . Its purpose is precise civil-time conversion with the host's IANA timezone data.
- Vite and TypeScript: development dependencies, versions locked in `pnpm-lock.yaml`.

No license ownership or commercial rights for the user's original application are inferred. This package does not assert that closed-source redistribution of third-party GPL/AGPL components is licensed.
