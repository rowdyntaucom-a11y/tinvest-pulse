# QVANIX autonomous checkpoint — 2026-09-13

## Terminal Stochastic oscillator v1.3

Starting branch base: `9c66b7e28c42512ea14ec24c19c3aa768df4d163`. A concurrent reviewed DNA commit landed on `main` before PR creation; PR #205 targeted that newer main and merged cleanly.

Completed through PR #205 (`Terminal: add deterministic Stochastic oscillator`) and squash-merged as `555e3925c21c7071a2d77f0be1e705f0bd5cafbf`.

### Why
The approved Terminal decision record includes Stochastic as a deterministic OHLCV primitive. It is safer to mature now than VWAP because the current Technical Analysis boundary is daily/date-only and does not yet define intraday/session-volume semantics.

### Accepted change
- `TECHNICAL_INDICATORS_VERSION` bumped from `1.2` to `1.3`.
- Added Stochastic `%K(14)` from the current close relative to the trailing 14-candle high/low range.
- Added `%D(3)` as the simple average of the latest three valid `%K` observations.
- `%K` requires 14 accepted candles; `%D` requires 16 accepted candles.
- A zero trailing high-low range returns `null` for Stochastic rather than inventing an oscillator value.
- Same-date OHLCV conflicts continue to fail the complete Technical snapshot closed.
- Existing SMA20, EMA20, RSI14, ATR14, MACD and Bollinger formulas/gates are unchanged.
- No overbought/oversold state, buy/sell label, ranking, forecast, target price or recommendation is emitted.

### Validation
Scoped GitHub `v2 build` PR run #318 completed `success`: `npm ci`, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression and runtime syntax checks all passed before merge.

Regression coverage locks the 13/14/15/16-observation Stochastic gates, conflict nulling, flat-range-with-width behavior, and true zero-range fail-closed behavior.

### Council / scope
- Quant: calculation-only oscillator with explicit/versioned lookback and smoothing; no semantic signal thresholds.
- Code: pure TypeScript addition inside the existing Technical snapshot and existing mandatory regression suite.
- Mobile: no UI/CSS/navigation/widget changes.
- Release: no backend/broker route, credentials, alert execution, trading behavior, legal/payment text or DNA behavior changed by this PR.

### Next safe focus
Do not add daily VWAP until source semantics can distinguish a defensible session/volume basis. Safer next work is either a non-executing user-authored alert-rule boundary or another fail-closed/data-quality audit. A separate Terminal shell remains deferred until enough real calculation modules justify it.
