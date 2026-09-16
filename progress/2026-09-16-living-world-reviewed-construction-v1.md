# Living World — reviewed construction art v1

## Coordination

Factual base at pass start: `532e1a804bae139d081a690907ff4605515cdb91`.

Data Trust PR #369 and clean-recovery replacement #374 are still open. This pass is therefore development/CI only and MUST NOT merge into `main` while that coordination gate remains active.

Existing Living World PRs #368/#370/#371/#372/#373 were not modified or duplicated.

## Scope

Admit exactly one additional reviewed-local production-art slot: `structures.construction`.

- Added textual SVG `/assets/world/construction-v1.svg` on the canonical 1600×900 scene canvas.
- Registered explicit `reviewed-local` provenance in the canonical reviewed asset registry.
- Added a dedicated manifest/readiness/SVG-safety regression and registered it in `test:core`.
- No renderer mount in this pass: procedural construction remains the runtime fallback until a separate reviewed mount pass.

## Visual review

The SVG was rasterized locally at 1600×900 before registry promotion and visually inspected. The layer is transparent outside the intended lower-right construction zone, keeps the central playfield clear, and contains only scaffolding/build materials/cart geometry. It contains no actors, UI, financial text, transaction values, XP values, or remote resources.

## Guardrails

- one runtime owner / one Pixi Application / one ticker unchanged;
- no `Assets.load(...)`;
- no Pixi/runtime code changed;
- no financial formulas, broker/API, Data Trust, Metric Drill-down, Codex or v1 changes;
- no binary assets;
- no bundle-budget exception or test/security weakening.

## Next

After Data Trust resolves, refresh factual `main` and reconcile the accumulated reviewed-art PRs before mounting additional structure slots. Mounts must continue to use browser-native `loadWorldAssetEntries(...)`, canonical readiness/mount policy and caller-owned `Sprite.from(...)`, preserving procedural fallback on every failure path.
