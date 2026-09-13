# QVANIX autonomous checkpoint — 2026-09-13

## User-authored alert threshold domains v1.2

Starting main: `1509761e8f00546e46b3fb9d0f4cbbc67ddbc826`.

### Finding
The user-authored Terminal alert boundary accepted any finite numeric threshold for every technical metric. That allowed semantically impossible rules such as `RSI > 150`, negative ATR thresholds, or non-positive price-like SMA/EMA/Bollinger thresholds.

### Change
- `USER_ALERT_RULES_VERSION` bumped to `1.2`.
- RSI14 and Stochastic K/D thresholds are limited to the mathematical range 0–100.
- ATR14 thresholds must be non-negative.
- SMA20, EMA20 and Bollinger middle/upper/lower thresholds must be strictly positive because the current technical-indicator boundary validates positive price candles.
- MACD line/signal/histogram thresholds remain unrestricted finite signed values; negative and zero thresholds are valid.
- Invalid domain thresholds fail closed as `INVALID_RULE`; QVANIX still never generates a rule or threshold for the user.

### Regression
`v2/tests/userAlertRules.test.ts` now covers the accepted boundaries, impossible RSI/Stochastic/ATR/price-like thresholds, and valid negative/zero MACD thresholds in addition to the existing crossing-integrity tests.

### Council
- Quant: metric domains follow the deterministic indicator semantics; no signal, expected return, forecast or recommendation is introduced.
- Code: isolated pure TypeScript validation + existing regression suite only.
- Mobile: no UI/CSS/layout change.
- Release: no backend/broker route, credentials, storage, execution, DNA, legal/payment wording or dependency change.

### Legal
`LEGAL_REVIEW_2026-09-11.md` remains controlling. Rules remain explicitly user-authored; QVANIX does not produce personalized buy/sell recommendations.

### Documentation debt
`WEEKEND_PROGRESS.md` remains behind the dated checkpoints. The connector still requires full-file replacement for that large canonical log; this pass preserves the result here rather than risking historical content.

### Next safe focus
Continue hardening deterministic Terminal primitives or, when several production-ready modules justify it, define the separate Pro/Terminal information architecture without overloading the default mobile shell.
