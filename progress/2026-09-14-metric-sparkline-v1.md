# QVANIX · metric sparkline v1

Date: 2026-09-14
Starting main: `c0ad4393064dad99805a74dd19b7c61de0269eb9`
Branch: `qvanix-metric-sparkline-v1`

## Why this pass

Continue the no-AI data-visualization priority from the user's UX recording and visualization review: make already-calculated data visually informative before adding more static cards or new top-level navigation.

## Implemented

- Added reusable `MetricSparkline` primitive with no chart dependency.
- Sparkline uses at most the latest 30 raw observations and preserves null gaps instead of joining across missing data.
- Fewer than two finite observations renders nothing rather than inventing a trend.
- Flat series render as a neutral horizontal path rather than dividing by zero.
- Analytics Overview TWR card now shows the real normalized TWR-index history.
- QVANIX Board reuses the same component for pinned `CAPITAL` (real historical portfolio value points) and pinned `TWR` (real normalized portfolio index points).
- Semantic Board tone is inherited visually: capital/mint, TWR/blue, while the generic primitive remains theme-compatible.
- No sparkline was added to XIRR, Health, broker P/L or payout cards because the current model does not expose a trustworthy historical series for those metrics at this UI boundary.

## Methodology / honesty rules

- No interpolation or forward-fill across missing observations.
- No historical XIRR/Health/P&L series is reconstructed from unrelated fields.
- No forecast, expected return, recommendation or LLM-derived number is introduced.
- The sparkline is context for an existing metric, not a new metric or duplicated full widget.

## Council review

- Quant: display-only use of existing `HistoryPoint.portfolio` and `HistoryPoint.value`; missing data stays missing.
- Code: dependency-free SVG primitive; no backend/API/state-storage change.
- Responsive/mobile: desktop height 28px, phone height 18px, pinned Board cards use 12px sparkline height to avoid growing the mobile grid.
- Release: frontend presentation only; no broker route, secrets, dependencies, DNA state, legal/payment or trade behavior.

## Release history note

An accidental no-op draft PR #269 was created during branch setup and immediately closed without merge. No production code came from it.

## Next visual priorities

1. Semantic asset-class tokens + compact portfolio structure visualization.
2. Verified dividend/coupon event overlays where timestamp/identity are trustworthy.
3. Reusable metric drill-down after sparkline/structure/event primitives are stable.
4. Continue density cleanup only where live recordings show real wasted space or unreadability.

Do not fabricate fallback forecasts to make gated screens look busy. Keep drift as neutral target-vs-actual diagnostics, not personalized buy/sell output.
