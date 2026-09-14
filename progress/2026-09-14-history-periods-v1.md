# QVANIX · history periods v1

Date: 2026-09-14
Starting main: `080338c095f93f82afb6cbbf1cf9dad0b541904f`
Branch: `qvanix-history-periods-v1`

## Why this pass

Continue the approved Snowball/HADL direction: increase flexibility inside an existing chart instead of creating more static widgets. The control must remain truthful on short history, so QVANIX must not advertise time windows it cannot actually cover.

## Implemented

- Added in-chart period controls for Portfolio vs IMOEX.
- Period options appear only when the real history span is mature enough for the requested window:
  - `1М` from 28+ calendar days;
  - `3М` from 80+ days;
  - `6М` from 170+ days;
  - `1Г` from 350+ days;
  - `ВСЁ` always available.
- Selecting a period slices only the existing normalized history rows by date; no interpolation, resampling or forecast is introduced.
- Transaction-date markers and benchmark coverage are recalculated only for the visible period.
- The latest paired Portfolio/IMOEX narrative continues to use a same-date observation inside the visible period.
- The selector displays the actual total available history span so short-history limitations remain visible.

## Council review

- Quant: raw normalized series and same-date benchmark semantics are unchanged; unavailable windows are hidden rather than fabricated.
- Code: local view state and deterministic date slicing only; no API, persistence or dependency change.
- Responsive/mobile: compact buttons; phone touch targets remain bounded and controls do not create horizontal page scrolling.
- Release: two presentation files plus this checkpoint; no backend, broker API, credentials, legal/payment, DNA state, recommendation or trading behavior.

## Next

- Reusable metric drill-down / chart mode controls only where real history exists.
- Income visual upgrade using verified payout fact/schedule boundaries.
- Daily movers remain GATED until all-position verified daily-change data is available.
