# QVANIX autonomous checkpoint — 2026-09-13

## Terminal user-authored alert rules v1

Starting main: `c8731560fe6f774279ec5d93eaa06f5e0eb90ab0`.

Runtime change: PR #212, squash-merged as `4cd1d7e1bdfbcf5c1562cef04f00e00fabcf1ed5`.

### Scope
- Added deterministic evaluation for explicit user-authored technical-indicator alert rules.
- Supported conditions: `ABOVE`, `BELOW`, `CROSSES_ABOVE`, `CROSSES_BELOW`.
- Rules may reference only resolved fields already present in `TechnicalSnapshot`: SMA20, EMA20, RSI14, ATR14, MACD line/signal/histogram, Bollinger bands and Stochastic K/D.
- A planned raw `close` metric was removed during council review because `TechnicalSnapshot` does not currently carry a verified close field; the boundary does not invent or smuggle an unverified value into alerts.
- Crossing rules require a previous valid snapshot for the same metric. Missing prior data fails closed.
- Conflicting OHLCV integrity, unavailable short-history indicators, invalid metric/comparator IDs and non-finite thresholds fail closed.
- Output is only whether the user's own condition matched. There is no generated rule, buy/sell semantic, expected-return claim, ranking or execution action.

### Validation
- Added `v2/tests/userAlertRules.test.ts` and registered it in mandatory `test:core`.
- Regression covers match/no-match, cross-above, missing previous snapshot, short-history unavailable metric, OHLCV conflict, NaN threshold, unsupported comparator and unsupported metric.
- GitHub `v2 build` run #332 completed `success` before merge, including dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history regression and root runtime syntax checks.

### Council
- Quant methodology: alert evaluation is a direct deterministic comparison against a threshold authored by the user. It does not create financial forecasts or personalized recommendations.
- Code quality: pure TypeScript boundary; no network, broker, storage or UI dependency.
- Mobile UX: no UI/layout change.
- Release: no backend route, credentials, payment/legal text, DNA art, system-generated recommendation or trading execution.

### Production
- Render auto-deploy started automatically for both `tinvest-pulse-v2-preview` and `tinvest-pulse` after the runtime merge. No manual deploy was triggered.
- Final settled status is recorded after both queues complete; no further production merge is allowed while either service is non-settled.

### Legal
`LEGAL_REVIEW_2026-09-11.md` remains a publication blocker. No legal draft or consent wording was published or changed.

### Documentation note
`WEEKEND_PROGRESS.md` was read before the change. The current GitHub connector only provides whole-file replacement for this large log; its response is truncated in the tool channel, so an append cannot be performed safely without risking loss of existing history. This dated checkpoint is therefore the durable record for this pass until a safe append-capable path is available.

### Next safe focus
Continue RU-first Portfolio/Income terminology only through safely reviewable file edits, or mature another deterministic Terminal boundary. Do not expose a separate Terminal shell until several real modules justify it, and keep all user alerts explicitly user-authored.
