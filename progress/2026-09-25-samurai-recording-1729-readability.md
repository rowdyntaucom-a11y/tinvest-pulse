# QVANIX — Samsung recording 1000031729 readability correction

Date: 2026-09-25

## Source

User-provided Samsung recording `1000031729.mp4` after the Samurai Operations + Event Integrity deploy.

## What the recording exposed

The new fail-closed functional Atlas was working and the Operations / Integrity chapters were visible, but the old Samurai trust-canvas chrome still rendered on top of the Atlas.

Visible problems:
- duplicated Formation / Tactical / Treasury chapter identity;
- title collisions around Assets, Analysis and Income;
- seven Assets preview rows compressed into microtype;
- Analysis and Income labels technically present but too small for comfortable phone reading;
- the “below / verification route” cue inherited conflicting absolute positioning from the pre-Atlas trust canvas;
- Home fail-closed chart skeleton looked too much like real performance even though all financial values were locked;
- fixed bottom navigation could visually cover the beginning of the next explanatory Home block.

## Correction

`samuraiRecording1729Correction.css` now:
- makes the Atlas the sole visual owner of fail-closed chapter identity;
- hides only the superseded chapter/header/watermark layer in the Atlas state;
- keeps compatibility DOM intact;
- increases real-phone typography and spacing;
- reflows Assets Formation to a full-width readable vertical list;
- gives Analysis one calm radar instrument followed by readable metric cards;
- enlarges Income calendar labels and shared chapter cards;
- turns the Home placeholder lines into faint dashed schematic guides;
- restores the “НИЖЕ · МАРШРУТ ПРОВЕРКИ” control as an actual clickable button placed directly after the Atlas;
- places route/action depth immediately below Atlas instead of after another mostly-empty viewport;
- adds Home bottom safe space so the dock does not mask the next explanatory block.

## Validation

PR #691:
- v3 build: PASS
- full v3 test suite: PASS
- V3 free preview artifact: PASS

No financial source logic, calculations, trust gates, Operations normalization, or DNA WORLD behavior changed.

## Direction

This is a UX correction, not a change in the Snowball+ functional roadmap.
After this patch, active product work returns to:
1. Report;
2. category drill-down;
3. currency drill-down;
then payout/calendar breadth, rebalancing, Portfolio Lab, technical discovery and screener.
