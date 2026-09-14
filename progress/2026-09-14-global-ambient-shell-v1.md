# QVANIX · global ambient shell v1

Date: 2026-09-14
Starting main: `59a3d66b454231d0098b7df8605f35e0dd0f2355`
Branch: `qvanix-global-ambient-shell-v1`

## Scope

Visualization and animation only. Financial calculations, analytics, portfolio/income logic, API/backend boundaries, storage, access policy and navigation behavior are unchanged.

## Why

`App` already renders a dedicated `.qv-ambient` layer, but it had no visual implementation. The design contract calls for a recognizable QVANIX signature layer that improves depth and identity without competing with data.

## Implemented

- Added `v2/src/ambientShell.css` and loaded it after the existing shell CSS.
- Existing `.qv-ambient` now renders a restrained perspective grid plus soft depth lighting.
- Full-motion mode gets one short launch scanner sweep; there is no continuous loop.
- Core, Horizon, Carbon, Aurora and Minimal receive different ambient treatments without changing widget geometry or data.
- Mobile uses a denser grid and narrower scan footprint so the effect does not overwhelm small screens.
- `reduced`, `off`, and OS `prefers-reduced-motion` disable non-essential motion.
- Minimal intentionally suppresses the grid/scanner and keeps only a faint static light field.

## Guardrails

- No metric, formula, benchmark, payout, tax, risk, TWR/XIRR, portfolio normalization or access-policy change.
- No React state change and no new runtime dependency.
- No pointer interception: ambient layer uses `pointer-events: none`.
- No layout animation: only transform/opacity on the presentation layer.
- No wealth-based visual intensity.

## Runtime files

- `v2/src/ambientShell.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after existing v2 security, build, bundle and core regression checks are green.
