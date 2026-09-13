# QVANIX DNA · Living World asset-slot contract

Date: 2026-09-13
Starting main: `aca9ceec98c751a29b740d87cb6f0d3afa5fd795`.

## Scope

- Adds stable asset-slot ids for the already-approved Living World composition: sky, mountains, forest, distant settlement, atmosphere, terrain, mine entrance, workshop, storage, construction, workers/residents, rails/carts/materials and environmental effects.
- Every slot is assigned to one of the stable Pixi scene layers introduced in the previous pass.
- Current temporary Pixi geometry is labelled with representative slot ids so reviewed Figma/Pixi assets can later replace placeholders without rewriting scene ownership/layering.
- Slot ids do not select files, colors, animation names, weather reactions or XP-driven intensity.

## Council

- Quant/product: no financial math, XP award, progression threshold, recommendation or weather inference.
- Code: pure asset-integration metadata plus labels on existing placeholder objects; no new runtime owner/ticker.
- Mobile: no visible widget/layout growth and no extra render objects beyond metadata labels.
- Release: frontend-only; no backend, broker API, credentials, legal/payment, trading, dependency or infrastructure changes.

## Validation

- Existing world core regression verifies slot-id uniqueness, valid layer assignment, RU labels and selected lookup/grouping behavior.
- Requires normal `v2 build` before merge.
- Merge only while both Render services are settled on current main.

## Next

Use these slots to define the first reviewed Figma export manifest and replace placeholder geometry layer-by-layer without changing the deterministic WorldState/event boundaries.
