# QVANIX · relative-performance narrative v1

Date: 2026-09-14
Starting main: `bf88df6495a617f19961806135e28af2db25a688`
Branch: `qvanix-relative-narrative-v1`

## Why this pass

Continue the approved Snowball-inspired narrative direction without introducing LLM-generated financial claims. The existing Portfolio-vs-IMOEX chart already has normalized series, spread shading and coverage; the missing layer is a compact human-readable statement grounded in the same deterministic data.

## Methodology correction

The previous legend delta used the last finite Portfolio value and the last finite IMOEX value independently. If benchmark coverage ended earlier than the Portfolio series, those values could come from different dates. That is acceptable for showing each latest series endpoint separately, but it is not safe for a relative-performance narrative.

This pass defines the relative endpoint as the **latest paired observation**: the most recent history row where both normalized Portfolio and IMOEX values are finite on the same date.

## Implemented

- Relative delta now comes from the latest paired same-date observation.
- The Portfolio and IMOEX legend values shown beside that delta use the same paired row.
- Added a compact deterministic narrative above the chart:
  - `Портфель выше IMOEX на X п.` or
  - `Портфель ниже IMOEX на X п.`
- Narrative includes the paired observation date.
- Explicitly labels the comparison as normalized-index points, not alpha and not a forecast.
- Existing spread shading, benchmark coverage, transaction-date markers and chart geometry remain unchanged.

## Council review

- Quant: same-date pairing prevents asynchronous endpoint comparison; units remain normalized index points (`п.`), not percentage return or alpha.
- Code: frontend deterministic presentation only; no API, state, dependency or storage change.
- Responsive/mobile: compact two-line/three-line responsive narrative; no horizontal page scroll, phone text can wrap.
- Release: two presentation files plus this checkpoint; no backend, broker API, credentials, legal/payment, DNA state, recommendation or trading behavior.

## Next safe visualization priorities

- Richer switchable chart periods/modes only where the existing history boundary supports truthful slicing.
- Reusable metric drill-down after stable chart primitives.
- Income visual upgrade from verified payout history/schedule.
- Daily movers remain GATED until the verified all-position daily-change boundary exists.
