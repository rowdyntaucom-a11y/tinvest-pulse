# QVANIX · theme surfaces v1

Date: 2026-09-14
Starting main: `0dbfd4a2e99c4d0fb0a516f7e6c5ba7bf416eeb2`
Branch: `qvanix-theme-surfaces-v1`

## Scope

Visualization only. This pass extends the existing Core / Horizon / Carbon / Aurora / Minimal visual language from Board to the rest of the application without changing data, calculations or workspace behavior.

## Why

Board already had distinct theme surfaces, while Portfolio, Analytics, Income and DNA still shared nearly identical panel styling. That made theme switching feel incomplete and reduced the visual identity of QVANIX outside the main Board.

## Implemented

- Added `v2/src/themeSurfaces.css` as a dedicated presentation layer.
- Horizon now uses restrained blue-glass surfaces and blue-tinted controls.
- Carbon now uses flatter matte-black surfaces with neutral borders.
- Aurora now uses navy/violet surfaces with restrained mint/violet depth.
- Minimal now removes decorative shadow and keeps flat near-black panels.
- DNA frame edge/background follows the selected theme without touching the Living World canvas or runtime state.
- Existing active states and semantic mint/amber colors remain unchanged.
- Full/reduced/off motion profiles only affect short surface transition timing; OS reduced-motion disables those transitions.
- Mobile lowers shadow depth to keep rendering lighter on small screens.

## Guardrails

- No financial formula, TWR/XIRR, benchmark, Health, Drift, Income, tax, payout or portfolio calculation change.
- No API/backend/storage/access-policy/routing change.
- No React state or component logic change.
- No new dependency.
- No Board theme rewrite; this pass only extends the already-established theme vocabulary to other workspaces.
- No continuous animation.

## Runtime files

- `v2/src/themeSurfaces.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after current v2 security, TypeScript/Vite build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green.
