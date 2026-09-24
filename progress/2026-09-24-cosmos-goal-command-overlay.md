# 2026-09-24 — Cosmos Goal command overlay

Evidence: Samsung recording `1000031546.mp4`.

## Finding
Assets / Analysis / Income are now much closer to the intended HUD-in-world composition. The remaining visual regression was Goal: its generic `v3-page-head` still rendered a large "ЦЕЛЬ" banner and the generic goal hero still dominated the upper-right of the scene. This broke the same art-safe rule the other Cosmos tabs now follow.

## Correction
- Cosmos Goal no longer renders the generic page head.
- Cosmos Goal no longer renders the generic goal hero.
- A dedicated right-side `cos-goal-command` owns target display/editing.
- Capital / route / scenarios remain as lightweight edge instruments.
- Target is not duplicated in the mission deck.
- A scene spacer reserves the first viewport so deeper Goal analytics continue below the artwork instead of colliding with it.
- Samurai and non-Cosmos Goal rendering remain unchanged.
- No financial formulas or data semantics changed.
