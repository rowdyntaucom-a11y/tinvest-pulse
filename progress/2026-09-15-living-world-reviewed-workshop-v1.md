# QVANIX — Living World reviewed workshop art v1

Date: 2026-09-15
Status: implementation complete on an isolated branch; keep unmerged while Codex/Data Trust PR #369 is active.

## Conversation / coordination context

The user explicitly asked to keep Living World moving while Codex finishes Data Trust. To stop the recurring ancestry race, current coordination policy is: Living World may be implemented and fully CI-validated in separate PRs, but `main` must not move until the active Data Trust recovery is reviewed and merged/closed.

At branch creation factual `main` was `532e1a804bae139d081a690907ff4605515cdb91` (reviewed `terrain.ground` asset v1). PR #368 already contains the green renderer mount for that terrain asset and is intentionally unmerged. This pass therefore stays independent of #368 and adds only the next reviewed art slot.

## Reviewed art delta

Added exactly one production-art candidate:

- slot: `structures.workshop`
- asset: `/assets/world/workshop-v1.svg`
- provenance: `reviewed-local`
- logical canvas: `1600 × 900`

The workshop is a transparent scene layer positioned around the existing workshop semantic destination near the middle-left settlement zone. It uses a restrained timber/stone palette, warm window light, chimney, workbench details and a static wheel silhouette. It contains no UI copy, portfolio values, finance semantics, XP magnitude, external image links or executable content.

Before promotion to the reviewed registry the SVG was rasterized locally at the canonical 1600×900 canvas and visually inspected. The structure remained isolated on a transparent background, readable at scene scale and did not occupy unrelated world regions.

## Pipeline / safety

The reviewed registry now contains `structures.workshop` with explicit `reviewedAt` provenance. A dedicated regression verifies:

- canonical slot/path/provenance;
- manifest acceptance;
- readiness resolves to reviewed art rather than procedural fallback;
- canonical 1600×900 viewBox;
- no `<script>`;
- no `<foreignObject>`;
- no external HTTP(S) href/src or CSS URL;
- no baked `<text>` content.

No renderer mount is added in this pass. Procedural structures remain the active fallback and current visual source until a separate reviewed mount pass is approved.

## Architecture invariants

Unchanged:

- one Living World runtime owner;
- one Pixi Application;
- one ticker;
- deferred `pixi.js`;
- no Pixi `Assets.load(...)`;
- no bundle-budget exception;
- reduced-motion/mobile/Samsung safeguards;
- no financial formulas, broker/API, Data Trust, Metric Drill-down, Codex, v1 or DNA-state changes;
- no binary assets.

## Release posture

This branch must receive normal PR-triggered security/build/test/bundle gates. Even if CI is fully green, keep the PR unmerged while Data Trust #369 is active so `main` remains stable for Codex. After Data Trust finishes, fetch factual latest `main`, verify ancestry and isolate/transplant this art delta if required before merge.

## Next Living World priority

After coordination clears:

1. land/revalidate terrain mount #368 on factual latest `main`;
2. land this reviewed workshop asset if its diff remains isolated;
3. follow with a separate `structures.workshop` renderer-binding pass using the existing browser-native reviewed loader + canonical readiness/mount policy + caller-owned `Sprite.from(...)`;
4. preserve procedural structures on every failure path.
