# QVANIX v3 DNA cinematic shell frame — 2026-09-22

Starting main: `85480207b6d051be7acc0896e1736c9c3d3e830c`.

Night Living World work starts from the canonical single Pixi renderer. This pass improves the immersive frame around it without creating a second renderer or inventing progression.

- DNA now exposes the real world phase and weather on the scene wrapper.
- Dawn / day / sunset / night receive distinct static frame lighting while the Pixi atmosphere remains authoritative.
- Phase copy changes with the actual time phase instead of repeating one generic sentence.
- Weather copy is derived from world state rather than hard-coded to neutral.
- All six shells now have their own DNA frame/HUD material language.
- Mobile gives the world more vertical viewport and raises the back/HUD targets.
- Fixed DNA chrome disables backdrop blur on phones to protect the Samsung scroll/performance budget.
- No world asset slot, event logic, XP rule, finance input or renderer ownership changed.
- No fal.ai generation was required for this pass.

Next night target: improve authored scene/hero fidelity through the existing reviewed-asset pipeline; use fal.ai only if a generated candidate is materially better and can be reviewed/packaged fail-closed.