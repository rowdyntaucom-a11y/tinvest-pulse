# QVANIX v3 — Data quality inspector

Date: 2026-09-20

## Why
The canonical trust states already prevent unsafe calculations, but the user needs a compact explanation of what is actually trusted: snapshot freshness, current-position coverage and confirmed history points. This closes a Product Depth / UX gap without changing financial methodology.

## Implemented
- Expanded the existing source-state disclosure with a compact `КОНТУР ДОВЕРИЯ` inspector.
- Shows whether calculations are open or fail-closed, the current canonical load state, verified snapshot timestamp/age, current position count and confirmed history-point count.
- Missing portfolio-history observations remain explicit gaps and are counted as such; they are never interpolated into the trust summary.
- Non-LIVE states do not expose position/history counts as if they were usable inputs.
- Demo remains isolated from this live-source inspector.
- Added shell-aware responsive styling and a canonical regression test.

## Product rule
Data-quality presentation may explain verified inputs and freshness, but must never promote partial, stale, fallback or unavailable data into calculation-ready LIVE data.
