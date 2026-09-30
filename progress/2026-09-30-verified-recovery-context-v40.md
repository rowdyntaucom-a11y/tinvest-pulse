# QVANIX Verified Recovery Context v40 — 2026-09-30

The previous v39 client fallback attempted `/api/portfolio`, but the canonical `server-core.js` did not expose that route. That meant the recovery policy could be correct in the light Core while the production API still had no guaranteed endpoint behind it.

This patch closes the recovery chain end to end.

## API

- Adds a real isolated read-only `GET /api/portfolio` route.
- The route requires only T-Bank accounts + GetPortfolio.
- It deliberately does **not** request operations, history, MOEX or CBR, so a slow secondary source cannot hide a healthy broker portfolio.
- Returns verified account context, current broker positions/value, broker expected yield and source-health metadata.
- Keeps no-store cache semantics and logs only bounded error metadata; no token/account values are written to logs.

## Client recovery

- `/api/dashboard` remains the preferred full-fidelity source.
- On dashboard failure the Core reads the isolated portfolio route with an 8 s deadline.
- After the portfolio is recovered, account context and `/api/operations-summary` are independently attempted with finite deadlines.
- A non-truncated operations contract may restore real accumulated coupon/dividend income and derive monthly/annual averages from the first confirmed positive external cash flow.
- If operations coverage is marked truncated, passive-income totals are **not** promoted as complete.
- Recovery coverage is carried explicitly in `recoveryContext` and the mobile recovery banner states which independently confirmed parts are available.

## Data-honesty boundary

The degraded source still never invents:
- history;
- XIRR;
- CAGR;
- benchmark/IMOEX;
- CBR context.

Those remain unavailable until the full dashboard or their independent verified contracts recover.

## Regression coverage

- v2 normalization regression covers dashboard 503 → isolated portfolio + account + complete operations context.
- v3 source-observability regression proves the backend fallback route exists and excludes operations/history/market dependencies.
- Existing cold-start retry guard remains in force: a verified fallback stays visible while the full dashboard self-heals in the background.

No trading, no broker-secret changes, no DNA/Living World work.
