# QVANIX Living World — semantic events v1 — 2026-09-15

## Context

Continuation of draft PR #342 while the separate Codex UX task remains rate-limited. This pass follows the approved Living World direction: real already-resolved world events should create restrained visible life in the scene, while the renderer must never reinterpret raw financial data or create XP/portfolio meaning.

## Implemented

### Dedicated semantic event layer

`worldSceneLayers.ts` is now version `0.2` and contains a dedicated `events` z-layer between persistent logistics and transient effects:

`background → atmosphere → terrain → structures → actors → logistics → events → effects`

This keeps temporary event processions separate from permanent transport infrastructure and from weather/lighting FX.

### Deterministic event caravan presentation

Added `worldEventCaravanPresentation.ts`.

Only already-semantic pending `WorldEvent`s are accepted. No transaction amount, RUB value, portfolio value, return, broker payload or XP total is read.

Presentation mapping is restrained and fail-closed:
- discipline → supply caravan;
- health → repair caravan;
- performance → courier;
- passive-income semantic event → treasury caravan;
- strategy → builder caravan;
- achievement → celebration caravan;
- unknown future semantic kind → generic courier.

The visible event roster is hard-capped at **3** so replayed/pending events cannot turn the world into a noisy particle stream. Route and starting phase are deterministic from event identity.

### Deferred Pixi event runtime

Added `worldEventCaravanRuntime.ts` and connected it only inside lazy `worldPixiRuntime.ts`.

Event plans now become small visible processions on two scene roads. The procedural fallback differentiates event categories with cargo silhouettes (coins/crates/repair marker/building material/flag/courier pack). This is presentation-only fallback, not final reviewed art.

The event runtime:
- never acknowledges events;
- never mutates `WorldState`;
- never creates XP;
- never reads financial values;
- preserves reduced-motion by showing stationary processions instead of hiding semantic state;
- is destroyed with the single Pixi runtime owner.

### Mobile performance budget

The visible mobile ticker is now capped at **30 FPS**; reduced-motion uses 15 FPS. Hidden/offscreen worlds still stop completely through the existing lifecycle policy.

Added `worldRuntimePerformance.ts` plus regression coverage to codify the approved mid-tier mobile envelope:
- mobile `<900px`: 30 max / 15 min FPS, DPR cap 1.35;
- desktop: 60 max / 20 min FPS, DPR cap 1.75;
- reduced motion: 15 max / 8 min FPS;
- malformed numeric inputs fail closed to conservative mobile defaults.

The current runtime values match this policy; future runtime cleanup should consume this pure policy directly rather than duplicate numeric constants.

## Regression / CI lessons

Useful gates caught integration mistakes during this pass:

- CI #622: `worldRenderSnapshot.test.ts` still expected scene-layer contract `0.1`; updated to `0.2` and explicitly verifies the `events` layer is before `effects` and owns no persistent asset slots.
- CI #623: Node strip-types caught an extensionless runtime import from the new caravan presentation boundary.
- CI #624: TypeScript correctly rejected the attempted `.ts` runtime import because `allowImportingTsExtensions` is not enabled.
- Fix: keep the caravan boundary runtime-local with a type-only channel dependency and the stable semantic kind→channel mapping. No compiler/test flag was weakened.
- CI #625 on head `7bfce3988f1241cfbadf5d5028509faa5d93b690`: **fully green** after semantic-event/runtime fixes.
- CI #628 on code-bearing head `21f12d38643eb278f470ecebc1532ab9502a2625`: **fully green** after adding the explicit performance-policy regression.

CI #628 passed:
- dependency security gates;
- TypeScript + Vite production build;
- full `test:core`, including event caravan, event layer and performance policy tests;
- Living World runtime-state regression;
- asset-history regression;
- payout/server/production syntax checks;
- production API regressions.

No bundle/security/test threshold, financial formula, broker API, credential contract or XP methodology was changed.

## Still gated

- final event caravan art/sprites;
- reviewed production actor/environment atlas assets;
- sounds;
- raw broker-operation → world-event interpretation beyond the already-approved semantic event boundary;
- any weather or biome rule derived from financial data without a verified contract.

PR #342 remains draft and isolated from the Codex UX branch.
