# QVANIX · control feedback v1

Date: 2026-09-14
Starting main: `cf8e1f155e05cefc6d8089ad5da36721d7dd1045`
Branch: `qvanix-control-feedback-v1`

## Scope

Visualization and interaction feedback only. No control behavior, navigation state or data logic changes.

## Implemented

- Added one consistent `:focus-visible` ring for buttons inside the QVANIX app shell.
- Added restrained tactile press feedback to existing navigation, subnav, chart-mode, pager, Position drill-down, Income mode, Q-LENS and personalization controls.
- Pointer hover feedback is only enabled on devices that actually support hover/fine pointers, so touch screens do not inherit fake hover states.
- Active/selected controls are excluded from the generic inactive hover treatment.
- Disabled controls are excluded from press/hover feedback.
- Full motion gets the tactile scale response; reduced shortens transitions; off and OS reduced-motion remove transition motion.
- Data cards, position rows and layout containers are intentionally not transformed.

## Guardrails

- No React/component state changes.
- No financial formulas, Portfolio/Income/Risk/Health/Drift/TWR/XIRR/benchmark changes.
- No API/backend/storage/routing/access-policy/dependency changes.
- No continuous animation.
- No change to control labels, semantics or click handlers.

## Runtime files

- `v2/src/controlFeedback.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after current v2 security, build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green.
