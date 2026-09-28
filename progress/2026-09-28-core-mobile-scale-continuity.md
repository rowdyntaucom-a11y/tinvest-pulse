# QVANIX Core mobile scale continuity — 2026-09-28

## Latest real-device decision
The user explicitly prefers the larger mobile interface visible before the post-load jump. That decision supersedes the older v8 regression lock that deliberately shrank the live Core after data arrived.

## Root cause
`v3/src/core/snowballCore.css` contained a late `v8` mobile override that changed the final live surface to a smaller scale: capital 34px → 27px, history chart 108px → 82px, narrower content width, smaller headers, assets, controls and 5.5–7px supporting text. Because the final Core tree stays mounted during loading, these late live rules created the perceived scale change rather than solving it.

## v18 correction
- Removed the legacy v8 compact-live override.
- Added one final mobile continuity layer that keeps the approved pre-jump scale after live data arrives.
- Kept the overview chart contained at 108px so the larger typography does not reintroduce horizontal/vertical chart overflow.
- Raised the mobile reading floor across deep analytics, asset detail, market, rebalance and tool surfaces.
- Preserved vertical scrolling: deep workspaces are allowed to become taller rather than shrinking important text.
- Updated the old v8 regression tests so they no longer protect the rejected compact scale.
- Wired the recent v14/v15/v16 Core regression suites into `npm test`, then added v18 continuity coverage.

## Boundaries unchanged
No financial methodology, Data Trust rule, broker contract, order execution, credential handling or DNA/Living World behavior changes in this patch.
