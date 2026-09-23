# 2026-09-23 — Samurai formation + command dock pass

## Trigger
Real Samsung screenshot after PR #600 confirmed that the hero, compact TWR telemetry and Capital Path now read as one authored composition. The weakest remaining visible area on the first screen was the lower third: the three holding tiles and the primary navigation still looked closer to a generic dashboard than to the Samurai shell.

## Decision
Keep the current hero/telemetry/chart composition intact. Deepen Samurai identity in the lower first-screen layers instead of adding another large decorative object.

## Changes
- Reworked `СТРОЙ` into an asymmetric formation deck with armor-plate geometry, crest signals and clearer ticker/weight hierarchy.
- Preserved the same three holdings and click behavior; no financial semantics changed.
- Reworked Samurai primary navigation into a lacquered command dock with a continuous cyan/gold/red rail and a stronger active state.
- Increased mobile navigation label legibility instead of shrinking labels to fit.
- Added reduced-motion-safe ambient animation for formation crests and the active command signal.
- Kept the first-screen vertical footprint compact.
- No changes to finance, API, broker, DNA or calculation code.

## Direction
Samurai remains the current shell to finish end-to-end before moving to the other shells.