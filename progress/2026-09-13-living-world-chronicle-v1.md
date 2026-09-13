# QVANIX DNA · Living World Chronicle v1

Date: 2026-09-13
Starting main: `3c251b78dc5338b9f85dbf9067340015970001f7`.

## Scope

- Adds a storage-agnostic deterministic Chronicle for already-resolved semantic world events.
- Chronicle stores only stable event identity, semantic kind, normalized occurrence timestamp and optional title.
- XP amount, RUB capital, visual intensity, animation, weather and art metadata are intentionally discarded even if a caller supplies them.
- Existing event IDs always win, so retries/replays cannot rewrite prior Chronicle history.
- Invalid document envelopes fail closed to an empty Chronicle; malformed rows inside a valid envelope are ignored.
- Entries are ordered deterministically by occurrence time then ID.

## Council

- Quant/product: no financial formula, XP award, level economy, recommendation or wealth input is introduced.
- Code: pure dependency-free TypeScript boundary suitable for the existing Node strip-types regression runner; no storage/network/browser dependency.
- Mobile: no UI/layout/navigation/rendering change.
- Release: no broker/backend route, credential, legal/payment wording, dependency or deployment configuration change.

## Validation

- Regression locks normalization, field minimization, corrupt-document fail-closed behavior, duplicate retry idempotency, immutable first-ID semantics and deterministic ordering.
- Test is registered in mandatory `test:core`.
- Normal `v2 build` required before merge.
- Merge only when both Render services are settled on current `main`.

## Next

- Later persistence adapter may store this document in an authenticated backend. UI Chronicle/scar presentation remains a separate reviewed mobile/visual pass and must not infer art intensity from XP or portfolio wealth.
