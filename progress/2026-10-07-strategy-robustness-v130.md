# QVANIX v130 — Strategy Robustness

- Base: merged v129 `112e7e63ea4aa263a8428b57dd016baf3ef62732`.
- Extends Strategy Lab rolling comparison from return leadership into three-dimensional historical robustness.
- Every window uses exact common scenario dates and computes return, annualized realized volatility and maximum drawdown for A/B.
- Reports leadership share, lower-volatility share, shallower-MaxDD share and simultaneous three-metric share.
- Fixes v124 extremes: bestA exists only when A actually led; bestB only when B actually led.
- 21/63/126/252 trading-day controls, recent chronology rail, responsive 4→2→1 layout.
- Historical overlapping-window evidence only; no winner recommendation, probability or forecast.
