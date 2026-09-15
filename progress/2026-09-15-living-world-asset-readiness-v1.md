# Living World — reviewed asset readiness v1

Date: 2026-09-15

## Why

The Living World already has a canonical reviewed-local/Figma asset manifest and resilient loader, but there was no pure boundary answering a crucial production-art question: which required slots are actually backed by reviewed provenance, and which must remain procedural fallback. Activating art ad hoc would weaken the existing fail-closed asset contract.

## Change

Added `worldAssetReadiness.ts`. It consumes only an already-resolved canonical manifest and a caller-owned list of required world slots. It deterministically reports reviewed slots, procedural fallback slots, rejected manifest count, and a strict `productionArtReady` flag.

`productionArtReady` is true only when every requested slot is reviewed and the manifest contains zero rejected records. Missing/rejected art never disables the Living World and never invents a replacement asset: the renderer remains on its existing procedural fallback until reviewed assets exist.

Added `worldAssetReadiness.test.ts` and registered it in `test:core`. Coverage fixes ordering/deduplication, partial readiness, complete readiness and fail-closed rejected provenance/path behavior.

## Guardrails

- no new art or binary assets in this pass;
- no Pixi Application/ticker/canvas/runtime ownership change;
- no WorldStage renderer change;
- no financial, broker/API, Data Trust, Metric Drill-down, navigation or v1 files;
- no invented financial/XP magnitude;
- existing manifest provenance and local-path validation remains authoritative.

## Next

Use this readiness boundary when introducing the first reviewed production-art slot. Prefer a small reviewed text SVG/Figma export with explicit provenance and retain the current procedural geometry as fallback. Do not activate unreviewed binaries.
