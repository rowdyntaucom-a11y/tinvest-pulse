# QVANIX v3 — DNA six-world integration v21

Date: 2026-09-22
Starting main: `ec784b63a266b1710dcdcb7569eda528075055a3`.

## Why this pass
The financial workspaces and persistent navigation now carry the six authored shell identities, while DNA still used mostly one generic frame/HUD treatment with only two legacy background exceptions. That made the flagship Living World feel detached from the selected QVANIX world.

## Changes
- Keep the canonical Pixi scene, reviewed asset slots and one-renderer ownership unchanged.
- Add a complete shell-aware DNA presentation layer for Samurai, Cosmos, Neon, Zen, Nord and Imperium.
- Each world now owns the Living World frame geometry, lens tint, HUD material, accent mark and scene-edge treatment rather than merely recoloring the page.
- Preserve the authored scene itself as the visual source of truth; the shell is a lens/frame around the same truthful world state.
- Remove live CSS backdrop blur from DNA chrome on mobile. The canvas already supplies depth, so this avoids redundant GPU composition on Samsung/Android-class devices.
- Reduce the mobile world-frame shadow cost while keeping depth.
- Add regression guards requiring all six DNA shell signatures and the mobile no-blur rule.

## Boundaries
No financial calculations, broker data, XP methodology, navigation behavior, Pulse behavior, fal.ai credits, reviewed art assets or Pixi ownership changed. No new renderer or animation loop was introduced.

## Next
Continue Living World itself: improve authored character/environment depth or runtime lifecycle only from fresh main after real-device evidence. Prefer reviewed local assets and canonical slots over more procedural geometry.
