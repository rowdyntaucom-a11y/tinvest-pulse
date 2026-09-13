# QVANIX autonomous checkpoint — 2026-09-13

## Asset-history conflict integrity

Starting main: `dcfc0a85b33ce9e2bee7c97683a6a421840abb8a`.

Completed through PR #186 (`Analytics: fail closed raw asset-history conflicts`) and squash-merged as `cccb9da1a6d756d857871e87392a99f4151ff1c6`.

### Why
The risk/correlation/allocation calculation layers had already learned to reject conflicting same-day market-history values, but the client asset-history normalization boundary still removed only the conflicting date and allowed the rest of that series through. That could hide the conflict before the downstream integrity gates saw it.

### Accepted change
- `ASSET_HISTORY_NORMALIZATION_VERSION` bumped from `1.0` to `1.1`.
- Per-series normalization now records `VALID` / `CONFLICT`, exact duplicate rows collapsed, and conflicting-date count.
- Exact same-day duplicates with identical finite positive values remain harmless and collapse deterministically.
- Conflicting finite positive values for the same normalized date invalidate the entire affected series: its points fail closed instead of becoming an artificially shortened history.
- Only valid series with at least two observations count toward usable market-history coverage.
- Regression coverage locks both exact-duplicate and conflict behavior.

### Validation
Scoped GitHub `v2 build` PR run #293 succeeded end-to-end: `npm ci`, both dependency-security gates, TypeScript/Vite build, full `test:core`, asset-history core regression and runtime syntax checks all passed.

### Council / scope
- Quant: no return, covariance, correlation, allocation-solver or current-risk formula changed; this only narrows accepted input history.
- Code: normalization remains deterministic and local to the existing client boundary.
- Mobile: no UI/CSS/layout/navigation change.
- Release: no backend/broker route, credential, trade behavior, legal/payment text or DNA renderer change.

### Next safe focus
Continue the same data-honesty audit at API/calculation boundaries and only integrate strategy-scenario comparison into DRIFT when explicit user-authored inputs fit the existing compact shell without inventing candidate strategies or adding another default-mobile screen.
