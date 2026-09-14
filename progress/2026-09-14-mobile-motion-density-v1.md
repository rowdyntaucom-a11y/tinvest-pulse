# QVANIX · mobile motion density v1

Date: 2026-09-14
Starting main: `4c501a4025747a866b8d0d5560f91a2f0c9efb93`
Branch: `qvanix-mobile-motion-density-v1`

## Scope

Animation/presentation only. Reduce simultaneous motion on phones without removing the visual identity or changing any data/state behavior.

## Audit finding

On first mobile render, several independent presentation effects can overlap: ambient scan/grid arrival, top-level workspace entry, and data-fill/stagger animations. Each effect is short by itself, but together they compete for attention on a small screen and increase compositing work.

## Implemented

- On phones (`<=620px`) the ambient grid remains visible but static in full-motion mode.
- The ambient scanner is suppressed on phones; the existing workspace transition becomes the single primary entrance motion.
- Existing data-fill animations remain, but shorten to 0.32s on phones.
- Mobile row stagger delays are removed so multiple bars settle together instead of cascading across the screen.
- Drift target-marker timing is shortened and starts almost immediately.
- Desktop/full-width motion is unchanged.
- Reduced/off and OS reduced-motion behavior remains unchanged.

## Guardrails

- No data, calculation, routing or component state changes.
- No financial formula, Portfolio/Income/Health/Risk/Drift/TWR/XIRR/benchmark changes.
- No API/backend/storage/access-policy/dependency changes.
- No new animation; this pass only removes/reduces existing mobile motion.

## Runtime files

- `v2/src/ambientShell.css`
- `v2/src/dataFillMotion.css`

## Release gate

Merge only after current v2 security, build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green. Live-device motion-density QA remains pending because this environment has no graphical phone renderer.
