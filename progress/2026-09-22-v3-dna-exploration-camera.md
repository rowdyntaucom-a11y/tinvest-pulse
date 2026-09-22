# QVANIX v3 DNA exploration camera — 2026-09-22

Starting main: `fc6e18f859f697ba1d99a20576b81c8f06bd043b`.

The first exploration pass made four landmarks tappable, but its authored points were percentages of the DOM viewport. That is not truthful once the portrait Pixi camera crops and recenters the 1600×900 world: a marker could sit over empty space while the real structure was off-screen.

This pass makes camera geometry canonical and shared between renderer and exploration UI.

- Added `worldCamera.ts` as the single pure camera/projection boundary for the 1600×900 DNA world.
- Pixi now uses that shared resolver for portrait/landscape fit instead of owning a duplicate formula.
- Portrait framing is clamped so the 8% cinematic push-in cannot expose blank canvas at the bottom/edges.
- Workshop, wanderer, mine and distant settlement are anchored to real world-space coordinates.
- DOM exploration markers are projected through the exact same camera as Pixi.
- Off-camera landmarks remain discoverable as dashed edge markers instead of being falsely placed over an unrelated visible object.
- Selecting an off-camera landmark pans the portrait camera to that authored world coordinate; landscape/tablet keeps the full-world framing.
- The camera change does not create a second Pixi Application/ticker and does not alter world progression, events, asset loading or finance.
- Added numeric regression coverage for portrait coverage, edge clamping, focused pan and landscape centering.

No fal.ai generation was needed for this architecture pass. Next art-focused pass can improve the reviewed wanderer/environment knowing overlays and camera now stay spatially correct.
