# QVANIX — Living World Pixi loader boundary v1

Date: 2026-09-16
Status: isolated Living World regression pass; Data Trust coordination gate remains active, so this pass must stay unmerged until the active recovery is resolved.

## Factual base

Fresh branch `qvanix/living-world-pixi-loader-guard-v1` was created directly from factual `origin/main` `532e1a804bae139d081a690907ff4605515cdb91` after checking the open PR queue. Data Trust recovery is still active (newest open replacement/audit PR #377), therefore no Living World merge is allowed in this pass.

Existing Living World PRs #368/#370/#371/#372/#373/#375 are intentionally not duplicated or modified.

## Decision

The previous Pixi `Assets.load(...)` experiment demonstrated a concrete release-budget failure: it inflated the deferred Pixi/DNA chunk beyond the hard 525 KiB budget. The accepted reviewed-asset path is browser-native `loadWorldAssetEntries(...)`, canonical readiness/mount policy, and caller-owned `Sprite.from(...)`.

This pass turns that architectural constraint into a mandatory core regression. `worldPixiLoaderBoundary.test.ts` scans Living World TypeScript/TSX source and fails if a direct `Assets.load(...)` call is introduced. It is registered in `test:core` next to the existing reviewed-asset regressions.

## Scope

Changed only:

- `v2/tests/worldPixiLoaderBoundary.test.ts`
- `v2/package.json` test registration
- this progress checkpoint

No production runtime, Pixi ownership, ticker, renderer, asset manifest, reviewed SVG, financial formula, broker/API, Data Trust, Metric Drill-down, navigation, Codex branch, or v1 file is changed.

## Next priority

After CI is green, leave this PR unmerged while the Data Trust gate is active. Once Data Trust lands, re-fetch factual main and reconcile the prepared Living World queue one isolated pass at a time. Renderer/art integration must continue to preserve browser-native loading and procedural fallback.
