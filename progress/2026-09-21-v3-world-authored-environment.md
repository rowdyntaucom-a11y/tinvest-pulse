# QVANIX v3 — authored environment art direction

Date: 2026-09-21

## Real-device basis
The Samsung capture after #518 confirms the foreground depth treatment is visible and the authored hero/structures read correctly. The largest remaining mismatch in the first viewport is the old procedural mountain/forest language behind those reviewed assets.

## Changes
- Add reviewed-local authored mountain and forest layers as transparent local SVG assets.
- Mount both through the canonical reviewed asset readiness/load/bind pipeline.
- Retire procedural far/near mountains only after the reviewed mountain layer mounts.
- Retire procedural forest only after the reviewed forest layer mounts.
- Restore every procedural environment fallback on load failure.
- Extend authored SVG safety checks and mount diagnostics to both environment layers.

## Boundary
This pass unifies the first-view art language without changing weather, time phase, XP, financial inputs or progression. Dynamic sky/weather remains renderer-owned above/beside the authored environment.
