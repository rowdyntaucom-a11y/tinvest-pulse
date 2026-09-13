# QVANIX autonomous checkpoint — 2026-09-13

## Terminal OHLCV conflict provenance v1.1

Starting main: `b99e6ffe4c34aa7064ad58a18e89338c43364e61`.

Completed through PR #199 (`Terminal: make candle conflict provenance order-independent`) and squash-merged as `728c30eb9a521e83d08f0cadcd9ef8c786da8425`.

### Why
Technical Indicators v1.0 already failed closed when two valid OHLCV candles disagreed on the same date, but its diagnostic counters were dependent on which variant appeared first. Equivalent conflicting inputs could report different duplicate/conflict counts even though the integrity result was the same.

### Accepted change
- `TECHNICAL_INDICATORS_VERSION` bumped from `1.0` to `1.1`.
- Valid candles are grouped by calendar date and exact OHLCV signature before duplicate/conflict evaluation.
- `conflictingDates` now counts unique conflicting calendar dates rather than conflicting rows.
- `duplicateRowsCollapsed` counts exact redundant rows independently of which variant appears first.
- Any conflicting date still fails the full technical snapshot closed: no SMA20, EMA20, RSI14 or ATR14 value is published.
- Existing SMA20/EMA20/RSI14/ATR14 formulas and observation gates remain unchanged.
- Regression coverage proves equivalent same-date variant orderings produce identical provenance.

### Validation
Scoped GitHub `v2 build` PR run #311 completed `success`: `npm ci`, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression and current runtime syntax checks all passed before merge.

### Council / scope
- Quant: no indicator formula, smoothing rule, period or sample gate changed; only input-integrity provenance became deterministic.
- Code: normalization is still pure TypeScript and now uses date/signature grouping rather than first-row ownership.
- Mobile: no React/CSS/navigation/widget change.
- Release: no broker/backend route, credentials, alert service, execution/trading behavior, legal/payment text or DNA renderer change.

### Next safe focus
Continue deterministic Terminal calculation maturity before exposing a separate shell. Safe candidates remain additional versioned indicators or an explicit user-authored non-executing alert-rule boundary. Preserve fail-closed data handling and do not create system-generated personalized trade signals.
