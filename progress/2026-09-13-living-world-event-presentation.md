# QVANIX DNA · Living World event presentation boundary

Date: 2026-09-13
Starting main: `420ded8b0f1e14b8ccaeafef0807bcab0425b6eb`.

## Scope

- Adds a renderer-facing semantic presentation channel for pending world events.
- Known XP event kinds map only to neutral categories: discipline, health, performance, income, strategy and achievement.
- Unknown future event kinds fail safely to `generic` / `СОБЫТИЕ`.
- Presentation objects deliberately omit XP amount, event intensity, sprite choice, animation name, color, particles, camera, sound and weather changes.
- `WorldPresentationMetadata` exposes the pending event presentation list and primary channel; the current DOM surface exposes only the primary channel as metadata for later reviewed rendering.

## Council review

- Quant/product: no financial calculation, XP award, progression threshold, market signal or recommendation.
- Code: mapping consumes only the already-resolved `WorldRenderSnapshot.pendingEvents`; no broker/backend/storage boundary changed.
- Mobile: no new visible card or layout block; existing renderer diagnostic remains the same size.
- Release: frontend-only, no secrets, legal/payment text, trading behavior, dependency or infrastructure change.

## Validation

- Regression test locks all current XP semantic kinds and unknown-kind fail-safe behavior.
- Test asserts that intensity/sprite/animation are absent from renderer presentation objects.
- Normal `v2 build` is required before merge.
- Production merge is allowed only while both Render queues are settled on the current main.

## Next safe step

After this boundary is accepted, reviewed visual treatment can be implemented separately in Pixi/Figma without reaching back into financial or XP calculations. Final art direction remains subject to user review.
