# Living World — reviewed asset mount policy v1

Date: 2026-09-15
Base: `4e412af6623d688f265e6c7b6766535def06e05d`

## Why

The first reviewed Living World SVG (`background.distant-settlement`) and the current fail-closed readiness boundary are already in `main`. The remaining renderer gap is not just image loading: the renderer needs a deterministic answer for whether a successfully loaded object is actually permitted to replace/add to a reviewed asset slot.

A browser load success alone is not sufficient trust. A path may be unreviewed, the canonical manifest may contain a rejection, or the exact reviewed slot may have failed/missed during loading.

## Change

Added pure `worldAssetMountPolicy.ts`.

For a requested slot it now resolves exactly one of two modes:

- `reviewed-asset` only when the canonical manifest is ready for that slot, has zero rejected records and the loader produced the exact same slot;
- `procedural-fallback` for unreviewed/missing slots, manifest rejection, explicit load failure or missing loaded value.

The policy does not import Pixi and does not create a renderer object. It is a presentation-safety boundary that the subsequent `WorldStage` binding pass can execute without re-deciding asset trust inside Pixi code.

## Regression coverage

Extended the mandatory `worldReviewedAssets.test.ts` with current real manifest cases:

- reviewed + exact loaded slot → `reviewed-asset`;
- reviewed but not loaded → fallback;
- explicit load failure → fallback;
- accepted slot plus any rejected manifest record → fallback;
- spoofed loaded object for an unreviewed slot → fallback.

Existing provenance, local-path and SVG safety assertions remain.

## Guardrails

- no `WorldStage`/Pixi/ticker/canvas change in this pass;
- no financial/broker/API/Data Trust/Metric Drill-down/Codex/v1 change;
- no new asset or binary file;
- canonical reviewed manifest and procedural fallback remain authoritative;
- no test, bundle or security threshold weakened.

## Next

Renderer binding pass on fresh `main`: after `loadWorldAssetEntries(...)`, call this mount decision for `background.distant-settlement`; only the `reviewed-asset` decision may create the Pixi display object. Load failure or any non-ready decision must leave the procedural scene intact. Keep one Pixi Application, one existing ticker and deferred `pixi.js`.
