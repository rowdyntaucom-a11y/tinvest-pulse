# QVANIX · drill-down motion v1

Date: 2026-09-14
Starting main: `d5ada3f7151d719f473539a6ff88d153900f9ab2`
Branch: `qvanix-drilldown-motion-v1`

## Scope

Animation and interaction presentation only. Existing Position drill-down state and realized Income history values remain unchanged.

## Implemented

- Position inspector tabs receive short press/focus feedback.
- Existing conditional Position / Income / unavailable inspector panes animate in on mount with a short opacity/translate/scale transition.
- Existing realized Income bars rise once when the chart mounts, using transform only over their already-calculated inline heights.
- Existing chart mode changes continue to use the component's existing height transition; no new data state was introduced.
- Stagger is limited to the first six visible bars and completes quickly.
- Mobile timings are shorter.
- QVANIX reduced/off and OS `prefers-reduced-motion` disable the added motion.

## Guardrails

- No Portfolio, Income, payout, tax, benchmark, Health, Drift, TWR/XIRR or broker calculation change.
- No React state or component logic change.
- No API/backend/storage/routing/dependency change.
- No continuous animation.
- No animation depends on wealth, profit or score magnitude beyond already-rendered bar height.

## Runtime files

- `v2/src/drilldownMotion.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after current v2 security, build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green.
