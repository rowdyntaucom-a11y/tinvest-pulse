# QVANIX autonomous checkpoint — 2026-09-13

## Terminal MACD + Bollinger foundation v1.2

Starting main: `fcdee0bfed87dcd8f2e2bf2784a9cc1be62e941c`.

Completed through PR #202 (`Terminal: add deterministic MACD and Bollinger diagnostics`) and squash-merged as `45d8ba30c6c1e7247b18ed16dbcc486c8c82e616`.

### Why
The approved Terminal decision record includes deterministic MACD and Bollinger indicators as safe Technical Analysis primitives. The existing v1.1 boundary already validated daily OHLCV input and exposed SMA20, EMA20, RSI14 and ATR14, so these indicators could be added without creating a new shell or attaching signal/recommendation semantics.

### Accepted change
- `TECHNICAL_INDICATORS_VERSION` bumped from `1.1` to `1.2`.
- Added MACD 12/26 line, EMA-9 signal and histogram.
- MACD uses SMA-seeded EMAs with the standard multiplier `2/(period+1)`; the signal EMA is seeded from the first 9 available MACD observations.
- MACD line requires 26 closes; signal/histogram require 34 closes.
- Added Bollinger 20-period middle/upper/lower bands at ±2 population standard deviations over the latest 20 closes.
- Bollinger middle is the same 20-period mean used by SMA20.
- Existing SMA20/EMA20/RSI14/ATR14 formulas and observation gates remain unchanged.
- Any conflicting same-date valid OHLCV candle still fails the complete snapshot closed, including all new indicators.
- No buy/sell state, ranking, target price, expected return, forecast or personalized recommendation is emitted.

### Validation
Scoped GitHub `v2 build` PR run #314 completed `success`: `npm ci`, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression and current runtime syntax checks all passed before merge.

Regression coverage locks short-history gating, Bollinger availability at 20 observations, MACD line availability at 26, signal/histogram availability at 34, conflict nulling and flat-series invariants.

### Council / scope
- Quant: deterministic standard indicators only; conventions and minimum samples are explicit/versioned.
- Code: pure TypeScript calculation boundary and regression tests; no side effects or network/storage changes.
- Mobile: no React/CSS/navigation/widget changes and no new default screen.
- Release: no broker/backend route, credentials, alert execution, trading behavior, legal/payment text or DNA runtime changes.

### Next safe focus
Continue Terminal calculation maturity before exposing a separate shell. Stochastic is a safer next daily-OHLCV primitive than VWAP because the current data boundary is date-only/daily and does not yet establish session/intraday volume semantics. User-authored alert-rule evaluation remains valid later if it stays explicit, informational and non-executing.
