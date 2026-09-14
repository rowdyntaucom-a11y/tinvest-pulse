# QVANIX · theme surfaces v1

Date: 2026-09-14
Starting main: `2fd68ed51d88d9d752ffc1bf44ee0462714cb3c1`
Branch: `qvanix-theme-surfaces-v1-r3`

## Scope

Visualization only. Extend the existing Core / Horizon / Carbon / Aurora / Minimal theme language from Board across Portfolio, Analytics, Income and DNA without changing data, calculations or workspace behavior.

## Why

Board already had distinct theme surfaces, while the rest of the product still shared nearly identical panels. During this pass main advanced twice with new Income history and Portfolio position drill-down UI. Both earlier theme branches were closed without merge and this pass was rebuilt on the current runtime surface.

## Implemented

- Added `v2/src/themeSurfaces.css` as a dedicated presentation layer.
- Horizon uses restrained blue-glass surfaces and blue-tinted inactive controls.
- Carbon uses flatter matte-black surfaces with neutral borders.
- Aurora uses navy/violet surfaces with restrained mint/violet depth.
- Minimal removes decorative shadow and keeps flat near-black panels.
- The realized Income history surface/mode controls inherit the selected theme without changing chart values or observation semantics.
- The new Portfolio position drill-down tabs, income detail cells and unavailable state inherit the same theme language without touching their state or deterministic inputs.
- DNA frame edge/background follows the selected theme without touching the Living World canvas or runtime state.
- Existing active states and semantic mint/amber colors remain unchanged.
- Full/reduced/off motion profiles only affect short surface transition timing; OS reduced-motion disables those transitions.
- Mobile lowers shadow depth to keep rendering lighter on small screens.

## Concurrency history

- First branch started at `0dbfd4a2...`; superseded when Income runtime/UI advanced.
- Second branch started at `ad2138f9...`; superseded when Portfolio position drill-down advanced.
- This branch starts from `2fd68ed5...` and contains only presentation-layer changes relative to that main.

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
