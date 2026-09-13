# QVANIX DNA · Living World phase clock v1

Date: 2026-09-13
Starting main: `339a2b1516f5d5503bb889b6ce7e8d7df3ad58bc`.

## Scope

- Fixes a concrete runtime gap: DNA `timePhase` previously refreshed only when TWR/Health changed because App memoization had no live local-time dependency.
- Adds a dependency-free phase-boundary scheduler for the existing WorldState phase model (`05:00 dawn`, `08:00 day`, `17:00 sunset`, `20:00 night`).
- Adds an active-only React clock hook: it starts only while the DNA tab is visible, refreshes immediately on entry, then sleeps until the next phase boundary instead of polling every minute.
- App passes the resolved local `Date` into the existing `buildWorldRuntimeStateFromQualityInputs(...)` boundary and includes it in memo dependencies.
- No renderer-side financial/time calculation is introduced; WorldState remains the resolved source consumed by Pixi.

## Council

- Quant/product: no financial metric, XP award, level, return, weather or recommendation logic changed.
- Code: one timeout at a time, cleaned up on tab exit/unmount; invalid dates fail to a conservative 60s retry.
- Mobile: no UI/CSS/layout change; no background timer while DNA is closed; boundary wakeups are materially lighter than minute polling.
- Release: frontend runtime + pure scheduler regression only; no backend/broker/secrets/legal/payment/dependency/infrastructure change.

## Validation

- Regression covers every existing local-time phase boundary, next-day dawn rollover and invalid-date fallback.
- Test registered in mandatory `test:core` alongside current Terminal screener and Living World regressions.
- Normal `v2 build` required before merge.
- Merge only if current main lineage is unchanged and both Render queues are healthy/settled.

## Next

- With live phase transitions now observable, wire the already-reviewed `world:first-sunrise` lifecycle candidate into a session-safe Chronicle composition boundary without adding browser-local permanent storage or a second history owner.
