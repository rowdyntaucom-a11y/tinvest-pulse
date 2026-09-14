# QVANIX · workspace transition v1

Date: 2026-09-14
Starting main: `16414d1ba086019d0f3e9472aefc4380d814739c`
Branch: `qvanix-workspace-transition-v1`

## Scope

Visualization and animation only. Existing top-level workspace state and navigation behavior are unchanged.

## Implemented

- Added short entry transitions for Board, Portfolio, Analytics and Income using their existing `.app-view` workspace classes.
- DNA uses opacity-only entry so the Living World canvas is not transformed as a composite layer.
- Top-level nav chips get restrained press/active visual feedback.
- Each workspace uses a distinct animation name so changing the existing class retriggers the transition without React remount logic.
- Mobile uses shorter durations.
- Reduced/off motion paths stay static and OS `prefers-reduced-motion` disables all added motion.

## Guardrails

- No React state, routing, workspace ownership or navigation target changes.
- No financial calculations, APIs, backend, storage, access policy, payout/risk logic or dependencies changed.
- No layout dimensions are animated; only transform/opacity/box-shadow presentation.
- DNA financial/runtime state is untouched.

## Runtime files

- `v2/src/workspaceMotion.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after existing v2 security, build, bundle and core regression checks are green.
