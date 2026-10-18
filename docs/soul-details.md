# Chart details: calculation and interpretation

The 25-category, 200-topic catalogue remains intact. Each topic has explicit
planet priorities and separately authored Arabic/English resource and challenge
prompts in `src/soulTopicRules.ts`. Topic slots no longer rotate through a generic
category planet list. The existing authored focus, illustrative case and action
each have one place in the page; the header does not repeat the summary.

`soulEngine.ts` uses available natal positions only. Close major aspects are
computed from the selected indicators with a 3-degree inclusion limit and shown
once per pair. A square/opposition alone is not labeled mixed evidence; that
label requires both a square/opposition and a sextile/trine. No close selected
aspect is distinct from having no aspects anywhere in the chart.

Birth-time reliability is passed explicitly from the profile. With unknown time,
the Moon, Ascendant, MC, houses and their aspects are excluded from details and
the optional model packet. Other positions remain local-noon approximations.
Known-time polar charts retain their Moon while identifying unavailable houses
as unavailable rather than mislabeling the birth time as unknown.

The evidence disclosure includes the original civil date/time, place, IANA zone,
calculation UTC instant, tropical zodiac, house convention and aspect limit.
Numerical precision does not establish the truth of personality interpretations.
Strengths/challenges are reflection prompts, examples are illustrative, and the
page explicitly distinguishes computed celestial data from unvalidated symbolic
personality meanings.

The optional Qwen endpoint strips nested extra fields, checks supplied aspect
geometry, supplies topic-specific editorial context, and rejects repeated
passages even when wrapped in a longer paragraph. Output guards check supported
planet/sign/house attributions and recognized aspect phrasings; these checks do
not constitute a proof of semantic or psychological validity. Rejected natal
claims produce a visibly labeled editorial fallback.

Regression coverage includes all 200 authored prompts, unknown time, polar
availability, aspect wraparound and limits, mixed evidence, numeric Arabic house
claims, invented aspects, nested privacy fields, copied model passages, single
summary rendering and calculation provenance. Existing native Swiss reference
vectors continue to cover the unchanged astronomical calculation engine.
