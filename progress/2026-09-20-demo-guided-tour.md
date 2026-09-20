# 2026-09-20 — Guided public demo tour

## Scope
- Built on fresh `main` after the Pulse screenshot pass.
- Extends the existing isolated `/demo` fixture rather than touching live broker data or financial methodology.
- Adds a five-step guided product tour across Пульт → Портфель → Аналитика → Доход → Цель.
- Tour copy explicitly labels synthetic data, separates income from market-value movement, and calls goal output a scenario rather than a forecast.
- Deep Asset Workspace and Pulse remain disabled in demo; no live API calls were introduced.
- Tour can be closed and reopened, and is compact for 360–430 px mobile widths.

## Regression contract
- Added `demoGuidedTour.test.ts` and included it in the full v3 test chain.
- Existing public-demo isolation remains the source boundary.

## Product intent
This advances S0/public demo and UX comprehension without starting multi-user infrastructure early. It gives a first-time visitor a deliberate path through the existing analytical depth while preserving QVANIX fail-closed/data-honesty rules.
