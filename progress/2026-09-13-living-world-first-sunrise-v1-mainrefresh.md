# QVANIX DNA · Living World first sunrise v1 · main refresh

Date: 2026-09-13
Base main: `8f5125a35e20b5f2dfdc6829774adf69fcc4504a`.

## Why refreshed

The original first-sunrise PR #253 was prepared from `8acb0c2b...`, but `main` independently advanced with the deterministic user-authored Terminal screener. The stale branch was not force-merged. This refreshed branch preserves the screener test registration and reapplies only the isolated Living World lifecycle files.

## Scope

- Emits one semantic candidate `world:first-sunrise` only on an explicitly observed `dawn` with a valid timestamp.
- Existing Chronicle ID suppresses all retries/replays; Chronicle remains the sole long-term history owner.
- Event has `intensity: null` and no XP, RUB capital, return, weather, recommendation, animation or art semantics.
- Production adapter only connects canonical Chronicle IDs to the dependency-free policy.

## Council / release

- Quant/product: local sunrise has no financial meaning and cannot change XP, level or analytics.
- Code: fixed ID and canonical Chronicle lookup preserve idempotency; current Terminal screener regression remains registered.
- Mobile: no UI/CSS/navigation change.
- Release: no backend/broker/secrets/legal/payment/dependency/infrastructure change.
- Merge only after the refreshed PR is green and both Render services have settled on the current main.
