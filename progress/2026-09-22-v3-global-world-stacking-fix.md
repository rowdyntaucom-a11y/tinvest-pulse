# QVANIX v3 global world stacking fix — 2026-09-22

Real Samsung screenshot after #554 showed a blank dark Home canvas: the new app-level artwork layer used `z-index:-1` inside an isolated stacking context and could fall behind the app background.

- Keep the world layer at z-index 0 inside the app.
- Lift interactive/content children to z-index 1.
- Preserve fixed topbar/nav behavior.
- Keep Home's dedicated cinematic layer authoritative and hide the global continuation there.
- Mobile world continuation remains absolute/no blur for scroll performance.
- No asset generation and no financial/data changes.
