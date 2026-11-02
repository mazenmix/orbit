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
