# QVANIX · history chart motion v1

Date: 2026-09-14
Starting main: `c1d196bca6e3e671b07acd0bd3775176dfde9174`
Branch: `qvanix-history-chart-motion-v1`

## Scope

Visualisation and animation only. Existing TWR/IMOEX paths, relative spread, period slicing, transaction-marker dates and all underlying financial calculations are unchanged.

## Implemented

- Existing history SVG remounts only when the user switches the visible period, so the visual transition can replay without changing chart data.
- Portfolio and IMOEX paths use their existing geometry and receive a short line-draw reveal in `full` motion mode.
- Relative-performance spread polygons softly reveal from transparent to their existing configured opacity.
- Existing transaction date ticks rise/fade in after the lines, still using the same date-only positioning contract.
- The deterministic relative-performance narrative gets a short entrance transition when the period changes.
- Period chips gain restrained press feedback.
- `reduced`, `off`, and OS `prefers-reduced-motion` paths remove non-essential animation.

## Guardrails

- No edits to analytics metrics, history normalization, TWR/XIRR, IMOEX acquisition, relative-performance arithmetic, transaction-marker calculation, API/backend or persistence.
- No interpolation, reconstructed prices, forecast values or financial semantics added.
- No animation library or dependency added.
- Motion is short-lived, period/mount driven, and uses opacity/stroke/transform only.

## Files

- `v2/src/features/portfolio/HistoryChart.tsx`
- `v2/src/features/portfolio/transactionMarkers.css`

## Release gate

Merge only after the existing v2 build, bundle/security and core regression suite are green.
