# QVANIX DNA · Living World asset manifest

Date: 2026-09-13
Starting main: `664d950e7d9d8833fbfcc72d3c4d74ca0456ab02`.

## Scope

- Adds a fail-closed manifest boundary between reviewed art exports and the Pixi Living World renderer.
- Only packaged local files under `/assets/world/` with PNG/WebP/SVG extensions can resolve as runtime assets.
- Figma exports must carry explicit file/node provenance and review timestamp; reviewed local assets carry the same review timestamp requirement.
- Unknown slot ids, remote URLs, path traversal/query/hash paths, malformed provenance and duplicate registrations are rejected.
- Duplicate registrations invalidate the entire slot rather than choosing an arbitrary asset.
- The manifest does not select art direction, animation, color, weather reaction or XP intensity.

## Council

- Quant/product: no financial calculation, XP award, level economy, recommendation or weather inference changed.
- Code: pure deterministic validation boundary; no network fetch, storage, backend route or renderer ownership change.
- Mobile: no UI/layout/render-object change.
- Release: frontend-only calculation metadata; no credentials, legal/payment, trading, dependency or infrastructure change.

## Validation

- Existing world core regression now covers valid reviewed local assets, Figma provenance, remote URL rejection, traversal rejection, malformed provenance, non-array input and duplicate-slot fail-closed behavior.
- Normal `v2 build` required before merge.
- Merge only while both Render services are settled on the current `main`.

## Figma blocker

- Current authenticated Figma seat is View-only in the available plan, so direct modification of the existing DNA World master remains blocked in this session.
- This manifest keeps development moving without inventing or shipping unreviewed art; real asset paths remain empty until reviewed exports exist.

## Next

- Once Figma edit access is available, register the first reviewed background/terrain exports through this manifest and replace placeholder geometry layer-by-layer.
