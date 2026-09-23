# Living World checkpoint — wanderer presence

Date: 2026-09-23
Starting main: `401d3d779c3f4640808b75c4c91914626b00400b`.

## Evidence

Real Samsung recording after #569 showed that shell art remained visually dominant while the authored Living World character and inhabited details were too easy to miss at phone scale.

## Goal

Make the wanderer/samurai a readable human anchor of the canonical Living World without introducing a second renderer, animation owner or expensive mobile effect.

## Implementation

- Strengthened the fallback wanderer silhouette with a kasa/hood profile, layered travel coat/light armour, grounded stance, belt hardware and a clearly readable scabbard/hilt.
- Added a restrained ground presence ring so the character separates from the settlement path at portrait scale.
- Increased the canonical hero group to 1.16 scale rather than adding a duplicate foreground character.
- Added low-amplitude cloak and presence micro-motion to the existing single Pixi ticker.
- Reduced-motion freezes the cloak and presence treatment in a stable authored pose.
- Moved the exploration landmark onto the character's actual ground position and updated its description to match visible scene evidence.
- No fal.ai credits used; this pass is geometry/composition work and preserves reviewed-art replacement slots.

## Performance / safety

No new Application, ticker, timer, requestAnimationFrame, texture download, blur/filter or runtime owner. Financial methodology, broker/API, Data Trust, Pulse and formulas are unchanged.

## Regression

`dnaWandererPresence.test.ts` guards character layers, reduced-motion, one-ticker ownership, no local Application creation and truthful landmark alignment.
