# 2026-09-23 — Samurai secondary workspace suite

## Trigger
Real Samsung recording after the home-screen Samurai pass showed that the shell identity drops sharply when leaving Home. Analysis and Income in particular still looked like generic dark dashboard pages sitting on top of Samurai wallpaper. The user asked for fewer, larger passes instead of incremental button-sized changes.

## Decision
Treat Samurai as one complete interface system across all primary workspaces before starting the other shells. Preserve the current Home composition and financial semantics, but give Assets, Analysis, Income and Goal their own authored Samurai grammar.

## Implemented
- Added one reusable `SamuraiWorkspaceChrome` boundary for secondary workspaces.
- Added workspace-specific identity marks:
  - Assets: `陣 / FORMATION // 02`
  - Analysis: `眼 / TACTICAL // 03`
  - Income: `禄 / TREASURY // 04`
  - Goal: `道 / PATH // 05`
- Rebuilt secondary page headers as cinematic Samurai scene strips using the existing approved art asset, with different crops by workspace.
- Assets now uses a formation-roster / war-chest grammar instead of generic rounded cards.
- Analysis now reads as a tactical matrix with a continuous ruled grid and metric sigils.
- Income now reads as a treasury ledger with a coin/seal motif and one-column cash-flow register.
- Goal now uses a path / torii grammar with a route-like progress rail.
- Reused existing data, click behavior, selectors and drill-downs. No financial calculations or API contracts changed.
- Kept mobile readability floors and reduced-motion behavior.
- Added regression coverage and import-order guard.

## Scope unchanged
Home Samurai remains the visual reference. DNA remains preserved but is not the active visual epic. After Samurai reaches a coherent end-to-end quality bar, the next shells should be built as genuinely different systems rather than recolors.