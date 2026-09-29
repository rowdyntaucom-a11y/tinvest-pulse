# QVANIX Trusted Portfolio Source Isolation v26 — 2026-09-29

## Real-device evidence
The light Core UI and public MOEX workspace recover, while the broker portfolio remains in “no confirmed data”. Render startup logs also show the live API is healthy enough to warm broker history, so the failure boundary is the dashboard composition path rather than a dead service.

## Root cause addressed
The primary /api/dashboard contract previously waited on broker portfolio, broker operations, MOEX and CBR in one Promise.all. Any optional public macro failure rejected the entire dashboard and hid a healthy broker portfolio. The client then also performed a second /api/accounts request before it could trust/display the already-returned dashboard, and the preview proxy could keep a dashboard request open for almost a minute across retries.

## Patch
- Broker portfolio + operations remain the required dashboard truth.
- MOEX and CBR are isolated optional sources with a 2.5 s latency ceiling and explicit sourceHealth flags.
- Dashboard embeds read-only account context directly, eliminating the blocking second /api/accounts fetch.
- Missing selected broker account is now an explicit 503 source state rather than a 200 payload missing portfolio value.
- Client dashboard fetch has a hard 20 s deadline and treats timeout as transient recovery.
- Preview proxy gives /api/dashboard a bounded two-attempt recovery path (12 s per attempt, 900 ms backoff) instead of the generic long retry chain.
- Safe server/proxy observability logs only status, latency, source booleans and position count; no tokens, account ids, names, balances or holdings are logged.
- Regression coverage is wired into root API tests and portfolio normalization.

## Guardrails
No trading. No fabricated data. No credential changes. Public macro failure cannot relabel itself as broker truth. Light Core remains the active product; DNA remains frozen.
