# QVANIX autonomous checkpoint — 2026-09-13

## Terminal user-alert clean provenance v1.4

Accepted through PR #238 (`Terminal alerts: require clean OHLCV provenance`) and squash-merged as `c85ced88d5c722b2c348f2fcb65d040680ca4da0`.

### Context
Current Technical Indicators v1.4 deliberately preserves calculations when malformed OHLCV rows are discarded, while exposing `inputRows` and `invalidRowsDiscarded`. That is useful for diagnostics, but user-authored alerts are a stricter action boundary: dirty or internally inconsistent history must not produce `MATCH` / `NO_MATCH` as if the sample were clean.

A competing PR #235 that tried to change Technical Indicators v1.4 itself to fail closed was closed without merge after main concurrently landed the accepted provenance model. The safety improvement was moved to the alert boundary instead, preserving the accepted diagnostic contract.

### Accepted change
- `USER_ALERT_RULES_VERSION` bumped from `1.3` to `1.4`.
- Alert evaluation requires the current Technical Indicators calculation version.
- Metric reads require clean/reconciling provenance: zero discarded rows, zero conflicting dates, finite non-negative integer counters, `inputRows = observations + duplicateRowsCollapsed`, positive observations and valid ordered sample dates.
- `ABOVE` / `BELOW` fail closed on dirty, stale or inconsistent snapshots.
- Crossing rules require both current and previous snapshots to pass the same clean-provenance gate.
- Exact duplicate source rows remain allowed because collapse is deterministic and the raw-row count reconciles exactly.
- Existing metric-domain guards remain unchanged.

### Validation
The first PR run exposed an ESM/runtime-import mismatch: a value import without extension passed TypeScript/Vite but failed Node strip-types; adding `.ts` fixed Node but was rejected by TypeScript. The final implementation keeps the technical import type-only and pins the required calculation version through `TechnicalSnapshot['calcVersion']`, so a future technical-version bump forces a compile-time review without adding a runtime module dependency.

Final scoped GitHub `v2 build` run #371 completed successfully: dependency security gates, TypeScript/Vite build, full `test:core`, Living World runtime-state regression, asset-history regression and runtime syntax checks all passed.

### Scope
No technical-indicator formula, sample gate, user threshold generation, notification scheduler, persistence, recommendation, trade execution, UI/navigation, broker/backend, legal/payment, credential or DNA rendering behavior changed.

### Next safe focus
Continue deterministic data-quality review and sync the Advanced Investor Audit so Terminal indicator and user-authored alert boundaries are recorded as DONE calculation foundations without implying a separate Terminal shell or VWAP readiness.
