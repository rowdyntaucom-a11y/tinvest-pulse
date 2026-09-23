# 2026-09-23 — Samurai Home command deck

Approved direction after the phone review and concept exploration: stop placing the capital block over the theme artwork.

## Product decision
- Keep the one-screen / no-scroll contract.
- Treat the Samurai artwork as a scene, not as a background for large financial text.
- Move capital below the art into an integrated command deck.
- Keep TWR/XIRR/income/assets immediately below it as telemetry.
- Compress lower chart/formation modules rather than introducing scroll.

## Implementation
- Removed the old `sam-world__answer` overlay from the Samurai hero.
- Added a full-width `sam-world__capital` deck below the art stage.
- Capital, result and percentage are now aligned to the same horizontal grid as telemetry, chart and formation.
- Reclaimed the hero scene for the samurai/torii composition.
- Tightened chart and formation heights to keep the full Home screen inside one phone viewport.
- Added <360px tuning and reduced-motion handling.
- Financial values, formulas, API behavior and trust boundaries are unchanged.
