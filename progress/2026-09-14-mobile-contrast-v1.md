# QVANIX · mobile contrast v1

Date: 2026-09-14
Starting main: `4762c39f9278a8bbc47a09a7094ed9612329ed49`
Branch: `qvanix-mobile-contrast-v1`

## Scope

Visualization only. Improve mobile contrast of supporting text after the readability-size passes, without changing layout, values, semantic states or component behavior.

## Why

The mobile readability passes increased several micro labels, but some supporting copy still used very dark muted colors against the near-black AMOLED-oriented surface. The text was present and larger, yet still visually weak compared with primary values.

## Implemented

- Reused the existing `mobileReadability.css` and `boardReadability.css`; no extra runtime stylesheet/import was added.
- Raised only supporting-copy contrast by mixing the existing muted token with a small amount of the existing light text tone.
- Portfolio, Analytics, Income and DNA supporting text receive the same restrained contrast lift on phones.
- Board rail, Q-LENS support/fact labels, module headers and module-card supporting copy receive the same treatment.
- Primary values, active controls and semantic mint/amber states remain untouched.

## Guardrails

- No font-size or geometry changes in this pass.
- No financial formula, TWR/XIRR, benchmark, Portfolio, Income, Health, Risk or Drift calculation change.
- No Board/Q-LENS state or routing change.
- No API/backend/storage/access-policy/dependency change.
- No new animation.

## Runtime files

- `v2/src/mobileReadability.css`
- `v2/src/boardReadability.css`

## Release gate

Merge only after current v2 security, build, bundle, `test:core`, Living World, asset-history and runtime syntax checks are green. Live-device contrast QA remains pending because this environment has no graphical phone renderer.
