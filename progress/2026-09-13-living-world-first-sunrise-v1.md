# QVANIX DNA · Living World first sunrise lifecycle v1

Date: 2026-09-13
Starting main: `8acb0c2b047a739e29adb42470abe75af6fbfec0`.

## Scope

- Adds a dependency-free lifecycle-event policy for one world-native milestone: the first explicitly observed sunrise.
- Candidate is emitted only when `timePhase === dawn`, `observedAt` is a valid timestamp and canonical Chronicle does not already contain stable ID `world:first-sunrise`.
- Production adapter reads existing Chronicle IDs and emits at most one semantic `WorldEvent`; Chronicle remains the only long-term history/persistence owner.
- Event carries only stable identity, semantic kind, normalized timestamp, neutral title and `intensity: null`.
- No XP amount, RUB capital, returns, weather, recommendation, animation, sound, particle or art choice is derived from local time.

## Council

- Quant/product: local sunrise has no financial meaning and cannot change XP, level, score or portfolio analytics.
- Code: fixed event ID makes retries idempotent; no second lifecycle database or acknowledgement cursor is created.
- Mobile: no visible UI/layout/navigation change.
- Release: deterministic frontend boundary/tests/docs only; no backend/broker route, secret, legal/payment wording, dependency or infrastructure change.

## Validation

- Regression covers non-dawn rejection, invalid timestamp rejection, exact first-dawn candidate, stable normalized timestamp, absence of financial/art fields and duplicate suppression from existing Chronicle ID.
- Test registered in mandatory `test:core`.
- Normal `v2 build` required before merge.
- Merge only after current Render queues are settled and the PR is green.

## Next

- Later runtime wiring may observe the already-resolved local `timePhase` and merge this candidate into Chronicle once. Presentation remains generic until a separate reviewed lifecycle visual language is approved.
