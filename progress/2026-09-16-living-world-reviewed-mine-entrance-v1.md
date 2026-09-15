# Living World — reviewed mine entrance art v1

## Context
Data Trust recovery PR #369 remains open, so Living World may advance only in independent green PRs and must not move `main`. Factual base for this pass is `532e1a804bae139d081a690907ff4605515cdb91`. Existing green/unmerged world work includes #368 terrain renderer mount, #370 reviewed workshop art, and #371 reviewed storage art.

## Decision
Admit exactly one independent reviewed-local production-art slot: `terrain.mine-entrance`. The asset is a UTF-8 text SVG on the canonical 1600×900 scene canvas. It was rasterized locally at 1600×900 and visually reviewed before registry promotion: the entrance remains confined to the left/lower mine zone, preserves transparent surroundings, and contains no baked UI, financial text, transaction values, XP magnitude, or semantic actor replacement.

## Safety / architecture
- explicit `reviewed-local` provenance and timestamp;
- dedicated manifest/readiness/SVG-safety regression registered in `test:core`;
- no renderer mount in this pass;
- no Pixi `Assets.load(...)`; prior blocker remains 554.1 KiB versus hard 525 KiB budget;
- no second Application, ticker, runtime owner, binary asset, broker/API/Data Trust/Metric Drill-down/Codex/v1 change;
- procedural mine entrance remains the production fallback until a later isolated mount pass passes canonical load/readiness/mount policy.

## Coordination gate
Even with green CI this PR must remain unmerged while #369 is open. After Data Trust finishes, fetch factual latest `main`, verify ancestry/diff, clean-transplant only this world delta if needed, rerun CI after any head change, and merge only with zero cross-scope drift.

## Next priority
If #369 remains active, another independent reviewed-local art slot may be prepared without renderer dependency. If Data Trust closes first, reconcile #368/#370/#371 and this pass against the new factual main before choosing mount order.
