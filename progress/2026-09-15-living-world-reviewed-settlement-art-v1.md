# QVANIX · Living World reviewed settlement art v1

Date: 2026-09-15

## Goal

Begin the production-art transition without bypassing the reviewed asset pipeline or replacing the procedural scene with an unreviewed image.

## What changed

- created the first packaged Living World art file: `v2/public/assets/world/distant-settlement-v1.svg`;
- promoted exactly one canonical slot, `background.distant-settlement`, through `REVIEWED_WORLD_ASSET_ENTRIES`;
- recorded `reviewed-local` provenance and review timestamp;
- added a regression that checks manifest acceptance and the packaged SVG safety contract;
- registered the regression in `test:core`.

## Visual review

The SVG was rendered locally at the production 1600×900 world aspect before promotion. Review confirmed:

- transparent background;
- distant/right-side composition that does not cover the main mine/work-chain stage;
- restrained mint window lights consistent with the current QVANIX atmosphere;
- no text, labels or financial semantics;
- no external resources or scripts.

## Safety / provenance

The asset is plain local SVG text, not a binary import. The regression rejects accidental promotion if the packaged file gains:

- `<script>`;
- `<foreignObject>`;
- remote `href`/`src` URLs;
- remote CSS `url(...)` references.

The manifest remains fail-closed for unknown slots, malformed provenance, remote paths and duplicate registrations.

## Runtime boundary

This pass intentionally does **not** mount the SVG in Pixi yet. Current `WorldStage` preloads reviewed entries independently and preserves the procedural scene if loading fails. The next isolated pass will bridge `loaded reviewed asset → existing background layer` without adding a second renderer, ticker or canvas.

This sequencing keeps review/promotion separate from renderer ownership and makes rollback trivial.

## Product/data guardrails

- no financial formulas changed;
- no broker/API/Data Trust/Metric Drill-down changes;
- no XP amount or reward magnitude mapping;
- no v1 asset reuse;
- no new dependency;
- no bundle/security/test budget changes;
- one World runtime owner / one Pixi application / one ticker invariant unchanged.

## Next priority

Reviewed asset renderer binding v1: mount only `background.distant-settlement` into the existing Pixi background layer after successful preload, keep procedural fallback on any failure, and preserve deferred `pixi.js` loading.
