# QVANIX Living World — actor animation pipeline v1 — 2026-09-15

## Context

Continuation of draft PR #342 on branch `qvanix-living-world-autonomous-v1` while the separate Codex UX task is rate-limited. This checkpoint extends the already-green Living World choreography/runtime work toward production sprite animation without approving or committing placeholder art.

## Guardrails preserved

- ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.
- DNA progression remains XP-based; RUB capital is not a level input.
- Renderer/presentation code does not read broker data or financial calculations.
- `neutral` weather remains fail-closed.
- Pixi remains deferred; main bundle budget is not raised.
- Procedural actors remain explicit fallback until a real role pack passes visual review.

## Implemented

### Choreography v0.2

`worldActorChoreography.ts` now exposes a deterministic `actionProgress` in `[0,1]` for the currently resolved `idle / walk / carry / work` segment. Route semantics still live in choreography, not in Pixi or sprite code. This gives final character animation a stable local phase without re-deriving gameplay meaning in the renderer.

### Deterministic frame playback

Added `worldActorFramePlayback.ts`.

It maps a reviewed animation clip plus choreography-local `actionProgress` to a deterministic frame index:
- looping clips wrap cleanly at the segment boundary;
- one-shot clips settle on the final frame;
- malformed frame counts fail closed to frame zero;
- reduced motion freezes on frame zero;
- no wall-clock or financial input is used.

### Reviewed actor art path already in the branch

The animation pipeline is now explicitly staged as:

`reviewed local manifest → validated atlas document → isolated per-role load → animation selection → choreography actionProgress → deterministic frame playback → Pixi sprite binding`

The reviewed registry is intentionally empty. No temporary geometry has been promoted to production art.

### Runtime binding

The deferred Pixi runtime now consumes only successfully loaded reviewed role packs:
- atlas image + JSON are loaded with the existing fail-closed per-role loader;
- validated atlas frames become Pixi sub-textures only inside the lazy DNA runtime;
- `idle / walk / carry / work` selection is driven by already-resolved choreography and `actionProgress`;
- one missing or invalid role never disables the other roles;
- missing/invalid/unavailable packs keep the procedural actor visible for that role;
- reduced-motion selection freezes the reviewed sprite deterministically;
- actor atlas requests are aborted with the world runtime;
- created sub-textures are destroyed during runtime cleanup.

`WorldStage` now exposes separate actor-asset diagnostics (`configured / loaded / failed`) in addition to environment-asset diagnostics. These are runtime diagnostics only and have no financial or XP meaning.

Because `REVIEWED_WORLD_ACTOR_ATLAS_ENTRIES` remains intentionally empty, this infrastructure does not silently change current production visuals. A real visual replacement still requires a reviewed role pack.

## Regression

Updated/added tests lock:
- choreography version/action-local progress;
- progress stays bounded at all segment boundaries;
- wrapping remains deterministic;
- looping/non-looping frame selection;
- terminal one-shot frame behavior;
- reduced-motion freezing;
- malformed frame-count fallback.

The tests are registered in `test:core`.

## Verification

CI **#610** on head `b9b2f4c80910bd98041bcea501f76d37b984404f`: **fully green** for the pure frame-playback layer.

Runtime binding then exposed one TypeScript import-contract mismatch during CI #613. The fix re-exported the shared actor action type through the atlas manifest boundary rather than weakening compiler settings.

CI **#614** on head `74cacc434c02d366bd97dbde13ead86c7dc1018e`: **fully green** with reviewed-sprite runtime binding enabled.

Passed:
- dependency security gates;
- TypeScript + Vite production build;
- full `test:core`, including actor animation/atlas regressions;
- Living World runtime-state regression;
- asset-history regression;
- payout/server/production syntax checks;
- production API regressions.

No bundle/security/test threshold was weakened. Reviewed art remains gated.

## Next safe step

Add only visually approved role atlases to `REVIEWED_WORLD_ACTOR_ATLAS_ENTRIES`, one role at a time, then perform Samsung visual/performance QA. Procedural fallback must remain per-role until every pack is explicitly reviewed.
