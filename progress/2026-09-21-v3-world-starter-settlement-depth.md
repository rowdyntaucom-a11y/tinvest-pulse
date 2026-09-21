# QVANIX v3 — Living World starter settlement depth

Date: 2026-09-21

## Real-device finding
The latest Samsung capture exposed the next root issue: the 16:9 world was being fitted with `contain` inside a tall portrait viewport. Most of the DNA card therefore became empty dark space and the actual world collapsed into a thin horizontal strip. Improving assets alone could not solve that camera problem.

## Changes
- Add a portrait-specific immersive camera: tall mobile surfaces now cover the world viewport and focus the canonical scene center instead of letterboxing the entire 16:9 map.
- Keep desktop/tablet landscape on the existing contain camera.
- Build a level-1 starter settlement around the portrait focal area: shelter, workshop, mine frame, warm work light details and foreground depth.
- Add a readable wanderer/samurai-inspired hero silhouette at the canonical focal point with restrained idle motion.
- Respect reduced-motion by freezing hero idle movement.
- Preserve reviewed terrain/settlement loading and all procedural fail-closed fallbacks.

## Methodology boundary
Starter settlement and wanderer are visual world identity, not financial progression. Level remains 1 / XP 0; no capital, profit or expected yield is converted into game progress.
