# QVANIX Broker Read Cache v28 — 2026-09-29

## Evidence from real-device recording
At 11:13 local device time the light Core still showed “Нет подтверждённых данных” across Overview, Portfolio, Result and Payouts. The public Market workspace had already recovered.

Render correlation for the exact recording window showed:
- preview dashboard proxy: repeated 502 upstream timeout after ~24.9 s;
- live API: the same dashboard requests eventually succeeded with 15 positions, but took 12.7–28.3 s.

So the remaining failure was not trust logic or missing broker data. The API produced valid broker data too slowly for the preview/client deadlines.

## Root cause
buildDashboard requests the full 10-year OperationsByCursor history on every refresh. That paginated read is expensive and was repeated concurrently by retries and by startup/history work.

## Patch
- Split raw OperationsByCursor transport into fetchOperations.
- Add per-account server-memory operations cache.
- Hard cache TTL: 5 minutes.
- Soft refresh threshold: 60 seconds.
- Stale-within-TTL responses are served immediately while one background refresh runs.
- Concurrent cold reads share one in-flight promise instead of multiplying T-Bank traffic.
- Startup dashboard warmup moves from after history reconstruction to 1.5 seconds after server start.
- Historical chart warmup remains separate at 12 seconds and reuses the operations cache.
- Regression coverage protects TTLs, single-flight behavior and early warmup.

No balances, holdings, account IDs or tokens are written to cache diagnostics. No trading behavior is introduced. DNA remains frozen.
