# QVANIX v3 — adaptive desktop shell

## Why
The canonical product requirement is one coherent product across phone, tablet and desktop. Mobile composition is mature, but v3 still largely stretched that composition across wide browsers. This pass adds a deliberate wide-screen shell without changing mobile semantics or financial methodology.

## Product changes
- 768px+: financial workspaces are bounded instead of spanning the full browser; Home primary metrics become a four-column scan row.
- 1024px+: primary navigation becomes a persistent left rail, freeing the bottom edge and making desktop navigation feel native to the viewport.
- Deep workspaces keep vertical depth and a single natural page scroll; no fixed-height dashboard trap is introduced.
- Portfolio history receives more chart height on desktop while retaining the same verified observations and gap semantics.
- 1440px+: content width expands modestly but remains capped to preserve reading rhythm.
- Pulse screenshot mode is intentionally untouched; it remains its own phone-viewport output surface.

## Trust / methodology
Presentation only. No TWR/XIRR/CAGR, payout, risk, goal, benchmark, trust-state, broker, demo or Asset Workspace methodology changed.

## Regression
`v3/tests/adaptiveDesktop.test.ts` asserts the tablet/desktop breakpoints, bounded workspace set, persistent rail, four-column summary behavior, preserved vertical scrolling and Pulse isolation.

## Validation gate
Run dependency security, production build and the full v3 regression suite in CI before squash merge. After merge, verify the exact squash SHA on Render.
