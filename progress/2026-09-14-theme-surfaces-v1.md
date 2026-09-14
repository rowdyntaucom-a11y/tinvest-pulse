# QVANIX · theme surfaces v1

Date: 2026-09-14
Starting main: `ad2138f9941cd26ce44ce2c3611062dd26261e4a`
Branch: `qvanix-theme-surfaces-v1-r2`

## Scope

Visualization only. This pass extends the existing Core / Horizon / Carbon / Aurora / Minimal visual language from Board to Portfolio, Analytics, Income and DNA without changing data, calculations or workspace behavior.

## Why

Board already had distinct theme surfaces, while the rest of the product still shared nearly identical panels. A concurrent Income pass added a realized-payout history chart while this work was in progress, so the first branch was not merged; this refreshed branch starts from the newer main and includes that new chart in the same visual language.

## Implemented

- Added `v2/src/themeSurfaces.css` as a dedicated presentation layer.
- Horizon uses restrained blue-glass surfaces and blue-tinted inactive controls.
- Carbon uses flatter matte-black surfaces with neutral borders.
- Aurora uses navy/violet surfaces with restrained mint/violet depth.
- Minimal removes decorative shadow and keeps flat near-black panels.
- The new realized Income history surface and its inactive mode controls inherit the selected theme without changing its chart values or observation semantics.
- DNA frame edge/background follows the selected theme without touching the Living World canvas or runtime state.
- Existing active states and semantic mint/amber colors remain unchanged.
- Full/reduced/off motion profiles only affect short surface transition timing; OS reduced-motion disables those transitions.
- Mobile lowers shadow depth to keep rendering lighter on small screens.

## Concurrency note

Original PR branch was based on `0dbfd4a2...`. Main advanced through Income visual/product work to `ad2138f9...`, including runtime CSS/components. The original branch is superseded rather than merged onto a stale base. This branch was recreated from the fresh main and adapted only at the presentation layer.

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
