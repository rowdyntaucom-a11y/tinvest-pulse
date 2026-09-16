# Living World asset mount policy regression v1

Date: 2026-09-16

## Factual base
- `origin/main`: `532e1a804bae139d081a690907ff4605515cdb91`.
- Data Trust clean-recovery remains active (`#379` open), so this Living World pass must not merge.
- Existing reviewed-art PRs `#368/#370/#371/#372/#373/#375` and loader guard `#378` remain separate and are not duplicated or modified.

## Decision
Add regression coverage around the existing pure `resolveWorldAssetMountDecision(...)` boundary instead of mounting more art while the coordination gate is active. The regression proves that reviewed art activates only when canonical readiness and loading both succeed, and that missing, failed, or non-ready assets preserve procedural fallback.

## Scope
- New `v2/tests/worldAssetMountPolicy.test.ts`.
- Register it in `test:core`.
- No production runtime changes; no Pixi Application/ticker changes; no `Assets.load(...)`; no new art or binaries.
- No financial formulas, broker/API, Data Trust, Metric Drill-down, navigation, Codex or v1 changes.

## Coordination
Hold the PR unmerged while Data Trust recovery is active. After that gate closes, fetch factual latest main and re-check ancestry/diff before considering this isolated regression pass for squash merge.
