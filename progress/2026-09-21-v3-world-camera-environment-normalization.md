# QVANIX v3 — environment camera normalization

Date: 2026-09-21

## Real-device finding
Samsung validation of the authored environment confirms the pipeline and multilayer background are live, but the reviewed mountain SVG is fitted to the full 1600×900 world. In the immersive portrait crop this makes the upper ridge oversized and vertically clipped, while structures still float slightly above the ground plane.

## Changes
- Reframe the authored mountain layer lower and at reduced vertical scale while preserving full world width.
- Give the authored forest its own slightly lower/deeper fit and restrained opacity, instead of sharing the mountain transform.
- Add renderer-owned grounding shadows for the residence, workshop, mine and wanderer.
- Preserve reviewed-asset fail-closed behavior and the existing immersive camera.
- Add regressions for the independent environment transforms and grounding layer.

## Boundary
Camera/art composition only. No world progression, XP, financial data, weather semantics or asset provenance changed.
