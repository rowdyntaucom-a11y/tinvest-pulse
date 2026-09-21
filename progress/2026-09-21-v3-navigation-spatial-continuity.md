# QVANIX v3 — Navigation spatial continuity

Date: 2026-09-21

## Why this pass
The canonical UX direction says first screen must answer while deep workspaces may scroll. Once workspaces became meaningfully deep, navigation also needed to own spatial context: opening another workspace or Asset Workspace should start at its top, while browser/Android Back should return the investor to the exact depth they came from.

## Changes
- Extend canonical v3 history entries with an optional, sanitized `scrollY`.
- Snapshot the current entry's scroll position immediately before pushing a new workspace/asset/Pulse history entry.
- New navigation layers always open at the top rather than inheriting the previous workspace's deep scroll offset.
- Browser/Android Back restores the saved position after React restores the corresponding canonical workspace/layer.
- Set browser scroll restoration to manual while QVANIX owns this history model, preventing browser and app restoration from fighting each other.
- Invalid, negative, non-finite or string scroll values fail closed and are ignored.
- Asset identity fallback still returns to the originating workspace; no duplicate Asset Workspace was introduced.

## Methodology boundary
No portfolio, return, scenario, income, benchmark or other financial methodology changed. No data defaults were introduced.

## Regression boundary
`navigationContinuity.test.ts` now covers safe scroll-state parsing plus the snapshot-before-push / top-on-forward / restore-on-pop contract, alongside the existing canonical workspace, asset and Pulse history tests.
