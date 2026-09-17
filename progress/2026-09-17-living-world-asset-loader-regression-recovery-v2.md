# Living World — asset loader regression clean recovery v2

## Factual base
- Fresh branch from `main` `5597b1427a6f5f81227ac1b25ec5cacc2896cbac` after Mobile Shell P0 cleanup.
- Data Trust canonical recovery and XIRR eligibility repair are already on main; no active Data Trust replacement blocks this pass.
- Old PR #382 is used only as a source delta. Its stale ancestry is not reused.

## Intended delta
- Add one focused regression for the existing browser-native `loadWorldAssetEntries(...)` boundary.
- Prove deterministic slot ordering, per-slot failure isolation, explicit `EMPTY_ASSET` / `LOAD_FAILED` reporting, and preservation of successful assets when a neighbor fails.
- Register the regression in current `test:core` without removing newer Data Trust, Samsung routing, world-quality, or production UX regressions.

## Guardrails
No production runtime changes, no Pixi `Assets.load(...)`, no Application/ticker changes, no art/binaries, no finance, broker/API, Data Trust, Metric Drill-down, navigation, v1, security or bundle-budget changes.

## Release gate
Full current CI must pass on the clean-recovery head. Before merge, race-check factual main and diff; maximum one Living World squash merge this pass, followed by Render verification.
