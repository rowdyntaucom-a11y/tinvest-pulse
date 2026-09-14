# QVANIX · data fill motion v1

Date: 2026-09-14
Starting main: `70ab05c9dcf7405731b83c86b0f7c1bef2503004`
Branch: `qvanix-data-fill-motion-v1`

## Scope

Visualization and animation only. Existing widths/targets produced by Portfolio, Health and Drift calculations remain the only source of truth.

## Implemented

- Added a shared presentation-only fill animation for existing position-weight bars.
- Added the same reveal language to existing allocation bars and Health component bars.
- Drift actual bars reveal from the left while the existing target marker fades/scales into place.
- Short stagger is limited to the first visible rows so motion stays readable and finishes quickly.
- Mobile uses a slightly shorter duration.
- `prefers-reduced-motion` disables all added motion; non-full QVANIX motion profiles do not opt into it.

## Methodology guardrails

- No width, percentage, target or score is recalculated.
- No changes to allocation, Health, drift or rebalance logic.
- No React state, API, backend, storage, dependency or routing changes.
- Animation transforms the already-rendered bar only; inline/calculated width stays unchanged.

## Runtime files

- `v2/src/dataFillMotion.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after existing v2 security, build, bundle and core regression checks are green.
