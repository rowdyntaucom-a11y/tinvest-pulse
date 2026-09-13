# QVANIX autonomous checkpoint — 2026-09-13

## Terminal user-alert metric-domain integrity v1.3

Starting main: `c4502992a41c332c152822d43961790a03c05e21`.

Completed through PR #229 (`Terminal alerts: validate runtime metric domains`) and squash-merged as `3d543a7cfc24888416b0f37504ea8c3a3c77b0f9`.

### Why
PR #228 correctly constrained user-authored alert thresholds, but the evaluation boundary still accepted any finite metric value from an `integrity: OK` snapshot. That meant a stale, forged or runtime-corrupted snapshot could make mathematically impossible RSI/ATR/price-derived values look actionable. The threshold domain also treated `bollingerLower20` as strictly positive even though `mean - 2σ` can legitimately be zero or negative.

### Accepted change
- `USER_ALERT_RULES_VERSION` bumped from `1.2` to `1.3`.
- Runtime metric values now pass the same mathematical-domain gate before rule evaluation.
- RSI/Stochastic are constrained to `0..100`; ATR to `>= 0`; SMA/EMA/Bollinger middle/upper to `> 0`.
- MACD line/signal/histogram remain signed.
- Bollinger lower band is explicitly signed for both runtime values and user-authored thresholds.
- Impossible runtime metric values fail closed as `INSUFFICIENT_DATA` rather than producing a match/no-match result.
- Regression coverage locks invalid runtime RSI/ATR/SMA handling and signed lower-band behavior.

### Validation
Scoped GitHub `v2 build` PR run #357 completed successfully: `npm ci`, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression and runtime syntax checks all passed.

### Scope / council
- Quant: no indicator formula changed; only the accepted domain at the alert-evaluation boundary was corrected.
- Code: one deterministic domain validator is reused for user thresholds and runtime metric values.
- Mobile: no UI/CSS/navigation change.
- Release: no broker/backend route, credentials, notification scheduler, persistence, recommendation, trade execution, legal/payment or DNA behavior changed.

### Next safe focus
Continue fail-closed review of Terminal calculation inputs before adding any separate Terminal shell. Invalid OHLCV-row handling is the next candidate: determine whether silently dropping malformed rows can hide data-quality loss and whether that loss needs explicit provenance rather than a formula change.
