# QVANIX Living World autonomous pass v1 — 2026-09-15

## Why this pass exists

The user explicitly approved continuing Living World implementation in parallel while the separate Codex UX task is rate-limited. This branch is deliberately isolated from the Codex UX branch and must not touch financial methodology, broker/API contracts or current information-architecture work.

Starting point: `main` at branch creation (`5fc5dc96bc52bbce1ba2dcddcd1eb98eac5a0e8d`).
Working branch: `qvanix-living-world-autonomous-v1`.
Draft PR: #342.

## Permanent guardrails

- ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.
- DNA level remains XP-based. Absolute RUB capital is never a level input.
- Pixi receives only `WorldRenderSnapshot`; it cannot read XP totals, portfolio metrics, broker data or financial calculations.
- `neutral` weather remains fail-closed and does not create invented rain/storm/market atmosphere.
- Semantic events are already resolved before presentation mapping; renderer effects cannot create XP or financial meaning.
- The current procedural art is an integration/runtime fallback, not the final visual-quality target. Final production art must still pass visual review and enter through reviewed manifests.
- Do not restore the legacy multi-renderer/multi-loop architecture.

## Implemented in this pass

### Deterministic living presentation policy

Added `v2/src/features/world/worldLivingPresentation.ts`.

It maps only already-resolved renderer state into presentation-only behavior:
- local time phase → activity pace, light intensity and sky/atmosphere tint;
- explicitly resolved weather → haze/rain/storm presentation;
- resolved level → restrained actor/logistics density;
- already-resolved semantic event kind → one presentation accent channel.

No financial inputs are read by this module.

### World activity

The Living World now has a first real deterministic activity loop inside the existing single Pixi ticker:
- miners, haulers, builders, keeper and resident routes;
- level-gated actor density with a hard small roster rather than crowding the scene;
- one/two mine carts unlocked by resolved world development level;
- mine entrance, rails, settlement, forest depth, smoke and work lights;
- local-time stars/lighting;
- resolved rain/storm effects only when weather is explicitly present;
- semantic-event beacon as a presentation-only accent.

All motion is renderer-only. It does not mutate `WorldState`, XP or financial state.

### Actor choreography pass

Added `v2/src/features/world/worldActorChoreography.ts` as a pure deterministic presentation boundary.

Workers no longer move continuously like conveyor-belt markers. Each route is resolved into a small work loop:
- pause/work at the origin;
- outbound travel;
- pause/work at the destination;
- return travel;
- repeat.

Role behavior is restrained and readable:
- miners, haulers and builders can visibly carry a small material load on the outbound leg;
- keeper travels without cargo and inspects endpoints;
- residents pause rather than pretending to perform industrial work;
- work phases receive a small local spark/action cue;
- no choreography result changes XP, world state, event semantics or finance state.

The choreography is deliberately pure and sprite-agnostic so final character atlases can replace the procedural fallback later without replacing route semantics.

### Reviewed actor-atlas contract

Added `worldActorAtlasManifest.ts`, `worldReviewedActorAtlases.ts` and a separate animation-selection boundary.

The reviewed character pipeline now fails closed before any production sprite can replace fallback art:
- only local `/assets/world/...` PNG/WebP + JSON atlas paths are allowed;
- each reviewed role pack must provide all four choreography states: `idle`, `walk`, `carry`, `work`;
- frame dimensions/count/FPS are bounded and validated;
- duplicate role packs invalidate that role instead of picking an arbitrary winner;
- malformed provenance, remote URLs, traversal/query/hash paths and incomplete animation sets are rejected;
- Figma provenance must contain valid file/node identifiers;
- reduced-motion playback freezes reviewed animation rather than creating a separate behavioral meaning;
- when a reviewed atlas is absent, selection explicitly returns `procedural-fallback` rather than pretending temporary geometry is final art.

The production registry intentionally remains empty until visual review approves real art. This gives future asset work a concrete, tested contract without prematurely blessing placeholder graphics.

### Deferred renderer boundary

The first implementation placed too much renderer code in `WorldStage.tsx`. CI #573 correctly caught a main-bundle regression above the existing 450 KiB hard guard. The budget was **not raised**.

The renderer was split into the dynamically loaded `worldPixiRuntime.ts`. `WorldStage.tsx` remains a small ownership/lifecycle boundary and imports the renderer only when DNA is mounted. The verified build keeps Living World implementation in its own async chunk while Pixi remains deferred in its existing separate chunk.

This is now a permanent implementation lesson: Living World richness must grow behind the deferred DNA boundary rather than inflate the normal financial-app startup path.

### Mobile/runtime lifecycle hardening

The runtime now:
- receives an `AbortSignal` so a slow Pixi initialization cannot attach a canvas after React unmount;
- releases the single runtime lease safely;
- pauses/resumes on document visibility;
- pauses the Pixi application when the Living World is outside the viewport through `IntersectionObserver`;
- respects `prefers-reduced-motion` by freezing decorative movement/lightning and lowering ticker pressure while preserving the static world state;
- avoids rebuilding the deterministic presentation plan every ticker frame by caching it until the renderer snapshot object changes;
- caps mobile DPR/FPS through the existing renderer policy.

### Regression

Registered Living World regressions in `test:core` for:
- presentation/weather/level semantics;
- actor choreography work/travel/return phases;
- role-specific cargo behavior;
- actor atlas manifest validation and duplicate/fail-closed behavior;
- reviewed-animation selection and reduced-motion freezing.

The regression locks:
- neutral weather has no invented rain/lightning;
- actor/cart density grows only from resolved level;
- time phase changes presentation pace only;
- semantic income event maps to the existing `income` channel;
- malformed level fails closed to level-one presentation density;
- actor work/travel/return phases remain deterministic;
- cargo is limited to intended outbound worker roles;
- resident/keeper behavior does not invent cargo work;
- incomplete or unsafe production actor packs cannot replace fallback art.

## CI history / verification

- CI #573: failed the hard main-bundle gate after the first monolithic renderer implementation. Fixed by code splitting; budget not weakened.
- CI #575: build/bundle gate passed; `test:core` exposed a Node strip-types runtime import-resolution issue in the new presentation module. Fixed by keeping the external event-presentation dependency type-only and mapping already-resolved event kinds locally.
- CI #578 on head `d91d166041217a8d323e162a803e19b0ed6bc69b`: fully green after the initial runtime split and lifecycle fixes.
- CI #583 on head `8c896b6b21596d880c09b749039e388f3cd64998`: fully green after actor choreography and power-aware runtime work.
- The actor-atlas contract/selection pass is now included in the same draft branch and is gated by the next full PR CI before any merge decision.

No financial methodology, broker/API contracts, credential handling or bundle thresholds were changed.

## Still intentionally gated

- reviewed production sprite/environment asset pack;
- actual approved character atlas files and frame timing;
- runtime replacement of procedural actors with those reviewed atlases;
- long-term XP thresholds/economy;
- persistent multi-user world storage;
- sound design;
- any visual rule that would require new financial interpretation.

The next safe autonomous step is to wire the reviewed-atlas contract into the deferred Pixi runtime only when a validated role pack exists, while retaining procedural fallback per role and keeping art approval outside renderer logic.
