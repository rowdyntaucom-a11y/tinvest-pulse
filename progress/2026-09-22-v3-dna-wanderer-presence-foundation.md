# Living World checkpoint — wanderer/samurai presence foundation

Date: 2026-09-22
Starting main: `401d3d779c3f4640808b75c4c91914626b00400b`.

## Goal

Continue directly after the inhabited-settlement pass with a stronger authored identity for the Living World wanderer/samurai while preserving one Pixi runtime owner and the mobile performance envelope.

## Foundation in this branch

- Added a data-only authored silhouette contract for hat, cloak, sleeves, sword and lantern.
- Added a restrained material palette for skin, layered cloth, leather, steel and warm lantern light.
- Added deterministic presentation-only micro-motion resolved from the existing ticker time; no timer, requestAnimationFrame, Application or ticker ownership is introduced.
- Reduced-motion resolves to a completely stable pose and lantern state.
- Motion stays deliberately small so the character feels present without becoming a distracting game-avatar loop.
- No fal.ai credits used: this stage establishes geometry/motion contracts before any reviewed asset-generation decision.

## Regression

`dnaWandererPresence.test.ts` guards authored geometry, palette, motion bounds and the stable reduced-motion state.

## Integration gate

Do not merge this foundation by itself. The next commit must bind this contract into the existing `world:hero-wanderer` node in `V3WorldStage.tsx`, keep the reviewed hero asset fail-closed, register the regression in the full V3 suite, and pass build/security/full tests before the PR is eligible for squash merge.
