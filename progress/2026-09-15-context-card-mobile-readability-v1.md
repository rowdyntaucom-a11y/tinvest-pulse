# QVANIX — Context card mobile readability v1

Date: 2026-09-15

## Scope
Presentation-only mobile readability pass for context-card supporting copy.

## Finding
The shared mobile readability layer still rendered `.context-card span` at 6.5 px on screens up to 620 px. That supporting text had fallen behind the readability baseline already applied to metric, portfolio and analytics secondary labels.

## Change
- Raise `.context-card span` from 6.5 px to 7.2 px.
- Add compact `line-height: 1.2`.
- Reduce tracking from `.055em` to `.045em` so the larger text does not spend extra horizontal width.

## Non-goals / invariants
No grid, card structure, semantic state, data source, calculation, financial metric, backend/API, storage, access policy, trading behavior or DNA runtime state changes. No new animation or motion.

## Release gate
Merge only after full v2 CI passes and the current `main` SHA still matches the branch base during the final race-check. Parallel Board/Q-LENS work remains untouched.
