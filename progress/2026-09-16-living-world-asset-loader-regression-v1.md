# Living World — asset loader regression v1

## Factual base
- `origin/main`: `532e1a804bae139d081a690907ff4605515cdb91`.
- Data Trust clean-recovery PR #379 is still open, so the coordination gate remains active.
- Existing Living World PRs remain isolated and unmerged; this pass does not duplicate reviewed art or renderer mounts.

## Decision
Protect the existing browser-native `loadWorldAssetEntries(...)` boundary with a focused core regression before additional reviewed art is mounted. The regression proves deterministic slot ordering, per-slot failure isolation, explicit `EMPTY_ASSET` / `LOAD_FAILED` reporting, and preservation of successful reviewed assets when a neighboring asset fails.

## Scope
- Add `v2/tests/worldAssetLoader.test.ts`.
- Register it in `test:core`.
- No production runtime changes.
- No Pixi `Assets.load(...)`, Application/ticker changes, art/binaries, finance, broker/API, Data Trust, Metric Drill-down, navigation, Codex, v1, security or bundle-budget changes.

## Coordination / merge
This PR must remain UNMERGED while Data Trust #379 (or its replacement) is active. After that gate closes, re-fetch factual latest main, audit ancestry/diff, and rerun the full release gate before any merge.
