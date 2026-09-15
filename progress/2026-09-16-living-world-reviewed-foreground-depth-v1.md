# Living World — reviewed foreground depth v1

## Context
Data Trust recovery PR #369 remains open, so Living World may advance only in independent green PRs and must not move `main`. Factual base remains `532e1a804bae139d081a690907ff4605515cdb91`. Existing unmerged world work #368/#370/#371/#372 is not used as ancestry for this pass.

## Decision
Admit exactly one independent reviewed-local production-art slot: `terrain.foreground-depth`. The UTF-8 SVG uses the canonical 1600×900 scene canvas and adds only lower-edge rock/moss silhouette framing. It was rasterized locally at 1600×900 and visually reviewed before registry promotion: the central playfield stays open, the layer is transparent outside the lower framing, and it contains no UI, financial text, transaction values, XP magnitude, or semantic actors.

## Safety / architecture
- explicit `reviewed-local` provenance and timestamp;
- dedicated manifest/readiness/SVG-safety regression registered in `test:core`;
- no renderer mount in this pass;
- no Pixi `Assets.load(...)`; prior blocker remains 554.1 KiB versus hard 525 KiB budget;
- no second Application, ticker, runtime owner, binary asset, broker/API/Data Trust/Metric Drill-down/Codex/v1 change;
- procedural foreground remains production fallback until a later isolated mount pass passes canonical load/readiness/mount policy.

## Coordination gate
Even with green CI this PR must remain unmerged while #369 is open. After Data Trust finishes, fetch factual latest `main`, verify ancestry/diff, clean-transplant only this world delta if needed, rerun CI after any head change, and merge only with zero cross-scope drift.

## Next priority
If #369 remains active, prefer stopping after this additional independent art slot rather than building a long queue of overlapping mounts. Once Data Trust closes, reconcile the existing green Living World PRs against factual latest `main` and establish a safe mount order.