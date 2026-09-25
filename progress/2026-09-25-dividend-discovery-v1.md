# Dividend Discovery v1 checkpoint

Broad-market dividend discovery now has a deterministic exact-identity core and a read-only API boundary backed by T-Invest Shares + GetAssetFundamentals. The route batches asset UIDs, joins fundamentals only by exact asset UID, drops missing/non-positive dividend yield, exposes coverage, caches results, and fails closed on upstream errors. It is descriptive analytics only: no QVANIX score, forecast, order path, or buy/sell verdict.

API tests cover exact identity, deterministic ordering, batching contract and fail-closed behavior. The API suite includes both dividend discovery core and route tests.

A responsive Income-market presentation component is staged, but mounting it into permanent Income navigation is intentionally not claimed complete until the navigation/workspace edits pass policy and CI. Living World/DNA was not touched.

Next: mount the staged discovery component under Income > Market without adding a new primary tab; run full API + v2 core/build CI; merge only green.
