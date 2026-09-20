# QVANIX v3 — Adaptive tablet / desktop shell

Date: 2026-09-20

## Why
The canonical responsive requirement says desktop must not be a stretched phone and narrow/foldable widths must not be excluded by an artificial 320px floor. After the mobile readability/accessibility pass, the next UX hardening step is to make the same v3 information architecture deliberately adapt across tablet, desktop and ultrawide layouts without changing financial meaning.

## Implemented
- Added a final-cascade responsive shell dedicated to layout adaptation rather than financial component styling.
- At 600px+, constrains reading width, uses four-column summary/action groups where space supports them, and keeps bottom navigation centered.
- At 1024px+, converts the five primary destinations into a stable left navigation rail and expands the analytical canvas to a bounded 1180px workspace.
- At 1440px+, caps the canvas at 1320px and turns Home into a deliberate two-column command-center composition instead of stretching the mobile stack.
- At sub-320px widths, removes any dependency on a 320px page floor, tightens chrome and preserves two-column primary/action groups without horizontal page scrolling.
- Keeps Pulse screenshot mode, trust/data-state semantics, demo isolation, calculations and Asset Workspace ownership unchanged.
- Added a canonical regression for tablet/desktop/wide/narrow breakpoints and no 320px minimum-width dependency.

## Product rule
Responsive adaptation may change composition and navigation placement, but never financial values, provenance, trust state or methodology.
