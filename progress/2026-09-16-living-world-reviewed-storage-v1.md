# QVANIX — Living World reviewed storage art v1

Date: 2026-09-16
Status: isolated implementation; keep unmerged while Codex/Data Trust PR #369 is active.

## Coordination

Factual main at branch creation: `532e1a804bae139d081a690907ff4605515cdb91`. Data Trust PR #369 remains open. Living World PR #368 (terrain mount) and #370 (reviewed workshop art) are already green and intentionally unmerged. This pass is independent of both and must not move main while Data Trust recovery is active.

## Art delta

Added exactly one reviewed-local text SVG slot: `structures.storage` at `/assets/world/storage-v1.svg`, canonical canvas 1600×900. The layer contains a compact timber storehouse, side shed, crates and ground pads around the right-side settlement/storage zone. It contains no text, financial semantics, XP magnitude, external resources, scripts or binary payloads.

Before registry promotion the SVG was rasterized locally at 1600×900 and visually inspected. It remained an isolated transparent structure layer, readable at scene scale and confined to the intended right-side zone.

## Safety / pipeline

The registry carries explicit `reviewed-local` provenance and `reviewedAt`. Dedicated regression checks canonical slot/path/provenance, manifest admission, readiness, 1600×900 viewBox and rejects script, foreignObject, external HTTP(S) references/CSS URLs and baked text.

No renderer mount is included. Procedural structures remain active. No Pixi `Assets.load(...)`, Application, ticker, runtime owner or bundle-budget change is introduced.

## Invariants

Unchanged: one runtime owner, one Pixi Application, one ticker, deferred Pixi, reduced-motion/mobile/Samsung safeguards, browser-native reviewed asset pipeline, no finance/broker/API/Data Trust/Metric Drill-down/Codex/v1 changes, no semantic actor replacement.

## Release posture

Run normal PR-triggered security/build/test/bundle gates. Even if green, keep unmerged while #369 is active. After Data Trust finishes, fetch factual latest main and clean-transplant/revalidate only this world delta if ancestry moved.

## Next priority

After coordination clears: revalidate/land #368, then reviewed structure assets in dependency order. Workshop/storage renderer mounts must be separate passes using the existing browser-native loader + canonical readiness/mount policy + caller-owned `Sprite.from(...)`, always preserving procedural fallback.
