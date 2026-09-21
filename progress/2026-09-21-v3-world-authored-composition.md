# QVANIX v3 — authored settlement composition

Date: 2026-09-21

## Real-device finding
The first authored workshop/mine promotion is confirmed LIVE on Samsung. The asset pipeline works, but the capture exposes a composition defect: reviewed structures are drawn over the combined procedural starter settlement, producing duplicate roofs/frames and making the hero compete with the buildings.

## Changes
- Separate the small starter residence from the combined procedural workshop/mine fallback.
- Keep the residence as a stable level-1 anchor.
- Recompose reviewed workshop and mine with wider spacing and a clearer silhouette hierarchy.
- Move the wanderer into the intentional gap between work zones instead of directly over the workshop.
- Retire the combined procedural settlement only when both reviewed workshop and mine are successfully mounted.
- If either reviewed structure fails, keep the procedural fallback visible: no empty settlement and no optimistic mount state.

## Boundary
This is a composition/ownership pass only. Level remains 1 / XP 0; no financial values drive visual progression.
