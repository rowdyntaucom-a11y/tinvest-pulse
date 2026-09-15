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

### Reviewed actor-atlas contract and loading pipeline

Added:
- `worldActorAtlasManifest.ts`;
- `worldReviewedActorAtlases.ts`;
- `worldActorAnimationSelection.ts`;
- `worldActorAtlasDocument.ts`;
- `worldActorAtlasLoader.ts`;
- `worldActorFramePlayback.ts`.

The reviewed character pipeline now fails closed before any production sprite can replace fallback art:
- only local `/assets/world/...` PNG/WebP + JSON atlas paths are allowed;
- each reviewed role pack must provide all four choreography states: `idle`, `walk`, `carry`, `work`;
- frame dimensions/count/FPS are bounded and validated;
- duplicate role packs invalidate that role instead of picking an arbitrary winner;
- malformed provenance, remote URLs, traversal/query/hash paths and incomplete animation sets are rejected;
- Figma provenance must contain valid file/node identifiers;
- atlas JSON must match reviewed image bounds, exact frame size and exact per-action frame counts;
- unknown extra animation names are rejected instead of being silently accepted;
- actor packs load independently, so one broken role cannot abort every other reviewed role;
- reduced-motion playback freezes reviewed animation rather than creating a separate behavioral meaning;
- when a reviewed atlas is absent or invalid, selection explicitly returns `procedural-fallback` rather than pretending temporary geometry is final art.

The deferred Pixi runtime can now bind validated reviewed role packs into sprites per role. The production registry remains intentionally empty until visual review approves real art, so current visuals remain procedural fallback rather than silently promoting temporary graphics.

### Semantic event caravans

Added a dedicated `events` scene layer plus `worldEventCaravanPresentation.ts` and `worldEventCaravanRuntime.ts`.

Already-semantic pending world events can now appear as restrained visible processions:
- discipline → supplies;
- health → repair;
- performance → courier;
- passive-income semantic event → treasury;
- strategy → builders;
- achievement → celebration;
- unknown future semantic kind → generic courier.

The visible event roster is hard-capped at three. The event renderer does not inspect transaction values, portfolio capital, returns, raw broker operations or XP totals; it does not acknowledge events or mutate WorldState. See `progress/2026-09-15-living-world-semantic-events-v1.md` for the detailed boundary.

### Deferred renderer boundary

The first implementation placed too much renderer code in `WorldStage.tsx`. CI #573 correctly caught a main-bundle regression above the existing hard guard. The budget was **not raised**.

The renderer was split into the dynamically loaded `worldPixiRuntime.ts`. `WorldStage.tsx` remains a small ownership/lifecycle boundary and imports the renderer only when DNA is mounted. Living World richness stays behind the deferred DNA boundary while Pixi remains separately deferred.

### Mobile/runtime lifecycle hardening

The runtime now:
- receives an `AbortSignal` so slow Pixi/asset initialization cannot attach after React unmount;
- releases the single runtime lease safely;
- pauses/resumes on document visibility;
- stops when Living World is outside the viewport through `IntersectionObserver`;
- respects `prefers-reduced-motion` by freezing decorative motion/lightning and lowering ticker pressure;
- avoids rebuilding deterministic presentation plans every ticker frame when the snapshot did not change;
- caps mobile DPR;
- uses the approved visible mobile target of 30 FPS and a 15 FPS reduced-motion ceiling.

A pure `worldRuntimePerformance.ts` regression boundary now codifies the mobile/desktop/reduced-motion envelope for future runtime cleanup.

### Regression

Registered Living World regressions in `test:core` for:
- presentation/weather/level semantics;
- actor choreography work/travel/return phases;
- role-specific cargo behavior;
- actor atlas manifest/document/loading/selection/frame playback;
- semantic event caravan mapping/cap/determinism;
- dedicated event scene-layer ordering;
- mobile/desktop/reduced-motion performance policy.

The regression locks:
- neutral weather has no invented rain/lightning;
- actor/cart density grows only from resolved level;
- time phase changes presentation pace only;
- semantic income event maps to the existing `income` channel;
- unknown semantic event kinds fail to generic;
- event processions are capped at three;
- malformed level fails closed to level-one presentation density;
- actor work/travel/return phases remain deterministic;
- cargo is limited to intended outbound worker roles;
- resident/keeper behavior does not invent cargo work;
- incomplete, unsafe or internally inconsistent production actor packs cannot replace fallback art.

## CI history / verification

- CI #573: failed the hard main-bundle gate after the first monolithic renderer implementation. Fixed by code splitting; budget not weakened.
- CI #575: build/bundle gate passed; `test:core` exposed a Node strip-types runtime import-resolution issue. Fixed without changing test/compiler flags.
- CI #578: fully green after initial runtime split and lifecycle fixes.
- CI #583: fully green after actor choreography and power-aware runtime work.
- CI #592 / #600: atlas contract/type/runtime-import issues caught and corrected without weakening compiler/test settings.
- CI #604: fully green after atlas/choreography pipeline stabilization.
- CI #610: fully green after deterministic frame playback.
- CI #613: caught one actor action type import mismatch; fixed by re-exporting the shared type at the atlas boundary.
- CI #614: fully green with reviewed-sprite runtime binding.
- CI #622 / #623 / #624: event-layer regression expectation plus Node/TypeScript import-boundary mistakes caught and corrected; no settings weakened.
- CI #625 on head `7bfce3988f1241cfbadf5d5028509faa5d93b690`: fully green after semantic event caravans.
- CI #628 on code-bearing head `21f12d38643eb278f470ecebc1532ab9502a2625`: **fully green** after performance-policy regression.
  - dependency security gates: success;
  - TypeScript + Vite production build: success;
  - full `test:core`: success;
  - Living World runtime-state regression: success;
  - asset-history, payout/server/production syntax checks: success;
  - production runtime/API regression suite: success.

No financial methodology, broker/API contracts, credential handling or bundle/security/test thresholds were changed.

## Still intentionally gated

- reviewed production sprite/environment asset pack;
- actual approved character atlas files and visual frame timing;
- long-term XP thresholds/economy;
- persistent multi-user world storage;
- sound design;
- raw broker-operation → world-event interpretation beyond the approved semantic event boundary;
- weather/biome rules requiring new financial interpretation.

The next safe autonomous visual step remains approved art: add reviewed role/environment packs one at a time and perform Samsung visual/performance QA. Until that review exists, procedural geometry remains explicit fallback.
