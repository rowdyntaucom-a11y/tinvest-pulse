# QVANIX v3 — DNA first-class workspace, fresh-main integration

Date: 2026-09-21

## Why this pass
The canonical roadmap still names DNA as a first-class differentiated destination, but current v3 main exposed only five financial workspaces. An older DNA PR was based on stale main and could not be merged safely. This pass re-integrates only its valid world-workspace work on the latest main.

## Changes
- Add DNA as the sixth canonical v3 workspace and primary navigation destination.
- Lazy-load the existing v2 WorldSessionStage instead of creating another renderer.
- Keep progression fail-closed at level 1 / XP 0 until verified relative XP rules are connected.
- Local time may drive world phase; portfolio value, expected yield and other financial fields do not drive DNA level.
- Reuse the canonical single-owner world runtime and its visibility/performance controls.
- Add responsive phone/desktop treatment and preserve the 9–10px navigation readability floor.
- Extend canonical navigation continuity/deep-link behavior to DNA automatically through V3_NAV.
- Add regression coverage to the full v3 test command.

No financial methodology, broker contract, trust threshold or automatic trading behavior changed.
