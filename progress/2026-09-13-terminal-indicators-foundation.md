# QVANIX autonomous checkpoint — 2026-09-13

## Deterministic Technical Analysis foundation

Timestamp: `2026-09-13 11:03 MSK`.

Starting main: `f28a65f3eceaedf1f11b74ad8d8694aa29970518`.

Completed through PR #196 (`Terminal: add deterministic technical indicators foundation`) and squash-merged as `80c2591bbf8046ebbaf240dff384d2e8195d6ce6`.

### Why
`QVANIX_TERMINAL_DECISIONS.md` explicitly approves deterministic OHLCV indicators and user-authored alerts as the next Technical Analysis foundation, while personalized system-generated trade signals remain outside the approved product model. The existing risk/portfolio stack had matured enough to add a calculation-only Terminal primitive without creating a new mobile shell.

### Accepted change
- Added `v2/src/features/terminal/technicalIndicators.ts`, calculation version `1.0`.
- Input candles are accepted only with valid ISO calendar dates, finite positive OHLC prices, consistent OHLC geometry, and optional finite non-negative volume.
- Exact duplicate candles for the same date collapse deterministically and are counted.
- Conflicting valid candles on the same date fail closed: the snapshot returns `integrity=CONFLICT` and publishes no indicators.
- Snapshot exposes sample provenance and observation count.
- Initial indicator set: SMA20, EMA20, RSI14 and ATR14.
- Each indicator remains unavailable until its actual observation requirement is satisfied; short samples are not padded or extrapolated.
- RSI and ATR use Wilder-style smoothing after their initial seed windows; EMA uses a simple-average seed followed by the standard multiplier `2/(period+1)`.
- No buy/sell classification, ranking, forecast, target price, expected return, personalized recommendation or execution behavior is produced.

### Regression / validation
- Added `v2/tests/technicalIndicators.test.ts` and registered it in mandatory `test:core`.
- Regression coverage locks short-history behavior, sample provenance, exact-duplicate collapse, conflicting-date fail-closed behavior, invalid candle rejection, mature indicator availability and flat-series RSI handling.
- GitHub `v2 build` PR run #308 completed fully `success`: `npm ci`, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression and all current runtime syntax checks passed before merge.

### Council / scope
- Quant: formulas are deterministic standard indicators; no financial forecast or signal semantics are attached. Data sufficiency and duplicate-date integrity are explicit.
- Code: pure TypeScript module, regression test and test-runner registration only; no network/storage/runtime side effects.
- Mobile: no React/CSS/navigation/widget changes. Samsung/Android density and the no-duplication rule are unchanged.
- Release: no broker/backend route, credentials, DNA runtime, legal/payment wording, alerts service or trading execution path changed.

### Production / blockers
- Render was not manually deployed; `main` remains the auto-deploy source.
- Read-only Render verification remains blocked because no workspace is user-confirmed in the connector. Autonomous workspace selection is prohibited, so `tinvest-pulse-v2-preview` / `tinvest-pulse` status is not guessed.
- `LEGAL_REVIEW_2026-09-11.md` remains a publication blocker. No RU/EN offer, privacy, consent, marketing-consent, subscription or payment wording was published or changed.
- `WEEKEND_PROGRESS.md` was re-read before work. The available GitHub write primitive still requires full replacement of the large canonical file rather than append/patch; this checkpoint preserves the completed pass without risking accidental historical-log corruption. Canonical catch-up remains a documentation task.

### Next safe focus
Continue Terminal calculation maturity before creating a separate Pro shell. A safe follow-up is deterministic MACD/Bollinger/Stochastic/VWAP or a user-authored alert-rule DSL over validated indicator values, provided it remains informational, explicit and non-executing. Do not add system-generated personalized trade signals or realtime/order-book infrastructure without the separately approved data/cost/legal architecture.
