# 2026-09-23 — Samurai telemetry rail refinement

## Trigger
Real Samsung/Android recording after PR #599 showed the katana removal was correct, but the compact replacement still had two weaknesses: the secondary metrics were too small to read comfortably, and the remaining `74` marker had no clear financial meaning.

## Decision
Keep Samurai visual-first and compact. Do not reintroduce a large decorative object. Replace the ambiguous instrument residue with a readable asymmetric telemetry rail.

## Changes
- TWR remains the dominant secondary answer.
- XIRR, 12-month income and asset count are presented as three readable telemetry rows.
- Added short semantic subtitles: `ЛИЧНАЯ`, `ВЫПЛАТЫ`, `В ПОРТФЕЛЕ`.
- Removed the unexplained `74` number entirely.
- The bottom rail is now decorative only and `aria-hidden`.
- Reduced the rail height from 104px to 94px to lift `ПУТЬ КАПИТАЛА` further into the first screen.
- Preserved the no-katana decision and existing finance/API/DNA boundaries.
- Added regression coverage for the new labels and retirement of the ambiguous 74 marker.

## Product order
The approved sequence remains:
1. Finish Samurai shell end-to-end.
2. Build the remaining shells as genuinely different interface systems, not recolors.
3. Only then reconnect/finalize real data and financial math in the visual shells.
