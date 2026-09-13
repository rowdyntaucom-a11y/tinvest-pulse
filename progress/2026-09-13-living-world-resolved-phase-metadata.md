# QVANIX DNA · resolved Living World phase metadata

Date: 2026-09-13
Starting main: `d755ab2111ba9dc93c899e6f28f4ea3ab52f1ea7`.

## Scope

- Exposes the already-resolved `WorldRenderSnapshot.timePhase` to the current Living World runtime as a compact RU-first diagnostic label: `РАССВЕТ / ДЕНЬ / ВЕЧЕР / НОЧЬ`.
- Adds DOM metadata for resolved `timePhase`, `weather` and pending semantic-event count so later reviewed art/animation mapping can consume the renderer boundary without reaching back into financial inputs.
- Does not map time/weather/events to colors, particles, camera, sound or other subjective art.
- Does not award XP, choose levels, infer weather, read RUB capital or change financial calculations.

## Council

- Quant/product: presentation-only projection of already-resolved state; no new financial or progression rule.
- Code: renderer continues to consume only `WorldRenderSnapshot`; financial/XP internals remain hidden.
- Mobile: existing one-line diagnostic gains one short Russian phase label; no new card or layout block.
- Release: frontend-only, no backend/broker/API/credentials/legal/payment/trading/dependency changes.

## Validation

Requires normal `v2 build` before merge. Production merge is allowed only while both Render queues are settled on current main.
