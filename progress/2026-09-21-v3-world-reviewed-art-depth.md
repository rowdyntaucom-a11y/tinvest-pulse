# QVANIX v3 — reviewed Living World art depth

Date: 2026-09-21

## Evidence
The live Samsung capture after the immersive viewport pass confirmed that composition improved, but the visible world remained dominated by procedural geometry. Investigation found a concrete delivery defect: the canonical reviewed world manifest referenced `/assets/world/*`, while v3 did not package those reviewed files in its own public build. The settlement therefore failed closed to procedural fallback. The reviewed terrain was registered but not mounted by the v3 renderer at all.

## Changes
- Package the already-reviewed settlement and terrain assets in the v3 public build at the canonical manifest paths.
- Preserve the existing fail-closed manifest/provenance/load boundary; no remote or unreviewed art is introduced.
- Mount the reviewed terrain through the same canonical sprite-binding policy as the reviewed settlement.
- Hide the procedural ground only after the reviewed terrain has actually loaded and mounted.
- Expose reviewed-terrain mount state for deterministic diagnostics/regression coverage.

## Boundary
This is an asset-delivery and renderer-depth pass, not a claim that current v1 reviewed art reaches the final game-quality target. The next art passes can replace or expand reviewed slots without bypassing provenance or creating a second world renderer.
