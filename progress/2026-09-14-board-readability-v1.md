# QVANIX · Board readability v1

Date: 2026-09-14
Starting main: `865e681184a50246580b3f8d27b2706fd8e341b0`
Branch: `qvanix-board-readability-v1`

## Scope

Visualization only. Improve readability of dense Board micro-copy while preserving the existing single-screen grid, card count and data ownership.

## Audit finding

The Board uses several micro labels around 5.0–5.9 px in rail, Q-LENS facts, module headers and module cards. These remain technically present but are visually weaker than the rest of the newly improved mobile hierarchy.

## Implemented

- Raised rail labels/supporting copy while keeping one-line ellipsis behavior.
- Raised Q-LENS tab labels, kicker/supporting copy and fact labels.
- Raised module header micro-copy and module-card labels/supporting text.
- Raised the Health ring supporting label slightly.
- Reduced dense letter-spacing so wider text does not force extra rows.
- Recovered small amounts of horizontal room from card padding only.

## Guardrails

- No Board data, Q-LENS state, module routing or calculations changed.
- No card count/grid ownership changes.
- No Portfolio/Income/Analytics/Health/Drift/TWR/XIRR/benchmark changes.
- No API/backend/storage/access-policy/dependency changes.
- No new animation.

## Runtime files

- `v2/src/boardReadability.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after current v2 security, build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green. Live-device visual QA remains pending because this environment has no graphical phone renderer.
