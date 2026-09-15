# QVANIX Living World autonomous pass v1 — 2026-09-15

## Why this pass exists

The user explicitly approved continuing Living World implementation in parallel while the separate Codex UX task is rate-limited. This branch is deliberately isolated from the Codex UX branch and must not touch financial methodology, broker/API contracts or current information-architecture work.

Starting point: current `main` at branch creation.

## Permanent guardrails

- ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.
- DNA level remains XP-based. Absolute RUB capital is never a level input.
- Pixi receives only `WorldRenderSnapshot`; it cannot read XP totals, portfolio metrics, broker data or financial calculations.
- `neutral` weather remains fail-closed and does not create invented rain/storm/market atmosphere.
- Semantic events are already resolved before presentation mapping; renderer effects cannot create XP or financial meaning.
- The current procedural art is an integration/runtime fallback, not the final visual-quality target. Final production art must still pass visual review and enter through `REVIEWED_WORLD_ASSET_MANIFEST`.
- Do not restore the legacy multi-renderer/multi-loop architecture.

## Implemented in this pass

### Deterministic living presentation policy

Added `v2/src/features/world/worldLivingPresentation.ts`.

It maps only already-resolved renderer state into presentation-only behavior:
- local time phase → activity pace, light intensity and sky/atmosphere tint;
- explicitly resolved weather → haze/rain/storm presentation;
- level → restrained actor/logistics density;
- already-resolved semantic event → one presentation accent channel.

No financial inputs are read by this module.

### World activity

`WorldStage.tsx` now has a first real activity loop inside the existing single Pixi ticker:
- miners, haulers, builders, keeper and resident routes;
- level-gated actor density with a hard small roster rather than crowding the scene;
- one/two mine carts unlocked by world development level;
- mine entrance, rails, settlement, forest depth, smoke and work lights;
- local-time stars/lighting;
- resolved rain/storm effects only when weather is explicitly present;
- semantic-event beacon as a presentation-only accent.

All motion is deterministic and renderer-only. It does not mutate WorldState or XP.

### Regression

Added `v2/tests/worldLivingPresentation.test.ts` and registered it in `test:core`.

The regression locks:
- neutral weather has no invented rain/lightning;
- actor/cart density grows only from resolved level;
- time phase changes presentation pace only;
- semantic income event maps to the existing `income` channel;
- malformed level fails closed to level-one presentation density.

## Still intentionally gated

- reviewed production sprite/environment asset pack;
- final character animation atlas and frame timing;
- long-term XP thresholds/economy;
- persistent multi-user world storage;
- sound design;
- any visual rule that would require new financial interpretation.

The next visual step should replace procedural fallback pieces through the reviewed asset manifest without changing runtime ownership or financial boundaries.
