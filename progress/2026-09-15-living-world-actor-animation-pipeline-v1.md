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

### Reviewed actor art path

The animation pipeline is now explicitly staged as:

`reviewed local manifest → validated atlas document → isolated per-role load → animation selection → choreography actionProgress → deterministic frame playback → Pixi sprite binding`

The reviewed registry is intentionally empty. No temporary geometry has been promoted to production art.

### Deferred Pixi sprite binding v1

`worldPixiRuntime.ts` now consumes the reviewed actor pipeline directly inside the already-deferred DNA runtime.

Behavior:
- local reviewed image + atlas JSON are loaded only from the validated actor registry;
- atlas transport and document validation remain fail-closed per role;
- successful packs are converted into shared Pixi texture frames;
- each actor keeps the procedural figure as its fallback;
- a reviewed sprite is created lazily only when a successfully loaded pack exists for that role;
- choreography still decides `idle / walk / carry / work` and route position;
- `actionProgress` plus the deterministic frame-playback boundary selects the atlas frame;
- if a role pack is absent, fails loading, fails validation or cannot produce a frame, the procedural actor remains visible;
- reduced motion freezes reviewed sprite playback on frame zero rather than changing world semantics;
- loaded actor textures are destroyed on runtime teardown;
- actor-atlas configured/loaded/failed counts are exposed as DOM diagnostics on `WorldStage`.

Current visual behavior is intentionally unchanged because `REVIEWED_WORLD_ACTOR_ATLAS_ENTRIES` is still empty. The runtime path is production-ready for reviewed packs without silently approving placeholder art.

## Regression

Updated/added tests lock:
- choreography version/action-local progress;
- progress stays bounded at all segment boundaries;
- wrapping remains deterministic;
- looping/non-looping frame selection;
- terminal one-shot frame behavior;
- reduced-motion freezing;
- malformed frame-count fallback;
- strict actor manifest/document loading contracts already present in the branch.

The tests are registered in `test:core`.

## Verification

CI **#610** on head `b9b2f4c80910bd98041bcea501f76d37b984404f`: fully green for the choreography/frame-playback pass.

CI **#613** exposed one TypeScript-only integration defect: the Pixi runtime imported the actor action type from the atlas manifest although that type originated in choreography. The contract now explicitly re-exports the type; no runtime semantics changed.

CI **#614** on head `74cacc434c02d366bd97dbde13ead86c7dc1018e`: **fully green** after the reviewed-sprite runtime binding.

Passed:
- dependency security gates;
- TypeScript + Vite production build;
- full `test:core`, including all Living World actor/atlas/frame regressions;
- Living World runtime-state regression;
- asset-history regression;
- payout/server/production syntax checks;
- production API regressions.

Bundle observation from #614:
- normal app chunk: ~456.26 KiB raw / 138.31 KiB gzip;
- deferred `worldPixiRuntime`: ~20.88 KiB raw / 7.70 KiB gzip;
- deferred Pixi vendor chunk: ~497.56 KiB raw / 142.13 KiB gzip.

The Living World growth stays behind the deferred DNA boundary. No bundle/security/test threshold was changed.

## Still intentionally gated

- actual reviewed production character images/atlases;
- final visual frame timing and per-role anchor/scale polish;
- environment production art replacement;
- long-term XP/economy thresholds;
- persistent multi-user world storage;
- sound design.

## Next safe step

The code path from reviewed role pack to live Pixi sprite now exists. The next meaningful visual step is to produce and visually review the first real production actor pack (one role first, preferably miner/hauler), package it under `/assets/world`, add it to the reviewed registry, and validate the result on Samsung before expanding to the remaining roles.
