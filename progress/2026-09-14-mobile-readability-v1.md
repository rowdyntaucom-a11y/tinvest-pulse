# QVANIX · mobile readability v1

Date: 2026-09-14
Starting main: `ae4ec3bd1c2e8f6bfa8242b54ed2c6f8864c1e59`
Branch: `qvanix-mobile-readability-v1`

## Scope

Visualization only. Improve mobile information hierarchy and readability without changing data, calculations, component structure or workspace behavior.

## Audit finding

The current phone layout preserves the single-screen requirement by compressing some secondary labels to roughly 6–6.4 px and several values to about 7 px. This pass raises critical labels and values slightly while recovering space from decorative gaps and letter-spacing instead of hiding data or increasing page scroll.

## Implemented

- Increased phone top-nav, metric labels and supporting values slightly.
- Increased Portfolio position subtitles, weights/values and allocation subtitles.
- Increased Analytics subnav, score labels, risk labels, health metadata and methodology text.
- Increased Income explanatory copy and DNA supporting text.
- Reduced letter-spacing on dense controls where it improves legibility.
- Recovered horizontal/vertical space by trimming panel/gap decoration only.
- Very narrow phones keep a slightly smaller but still improved scale.

## Guardrails

- No formulas, TWR/XIRR, benchmark, Portfolio, Income, Health, Risk or Drift calculation changes.
- No broker/API/backend/storage/access-policy/routing change.
- No React state/component logic change.
- No hidden data and no new scrolling behavior.
- No dependency changes.

## Runtime files

- `v2/src/mobileReadability.css`
- `v2/src/main.tsx` (CSS import only)

## Release gate

Merge only after current v2 security, TypeScript/Vite build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green. Live-device visual QA remains a separate required validation because this environment has no graphical browser/device renderer.
