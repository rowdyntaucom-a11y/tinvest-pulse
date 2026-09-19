# QVANIX v3 — Canonical Asset Drill-down

Date: 2026-09-19

Starting main: `01892d22e25e5a61cdf8b644e22e71eea69989dd`

## Product problem
The canonical Asset Workspace already existed and Income / Holdings could reach it, but Analysis still ended at portfolio-level tables. Risk contributors, correlation pairs and structure concentration were analytical dead ends.

The Asset Workspace itself also still had a six-pill horizontal section rail after the shared secondary-selector pass.

The master direction requires one canonical Asset / Company Workspace reused from Portfolio, Income, Analytics and Holdings Explorer.

## Implemented

### Exact identity boundary
Added `v3/src/assets/positionIdentity.ts`.

It resolves current positions only by:
- exact instrument UID; or
- exact FIGI.

There is no ticker or name fallback. Duplicate identity is ambiguous and fails closed.

### Risk contributor drill-down
Risk-contribution rows now expose the canonical Asset Workspace only when the row key resolves to exactly one current position.

The row explicitly shows when exact identity is not confirmed.

### Correlation pair drill-down
Correlation summaries now retain both exact series keys, not just presentation labels.

Each side of a displayed correlation pair can open its canonical asset card only when that exact key resolves uniquely.

### Structure drill-down
The top concentration rows in Analysis / Structure are now interactive and open the same Asset Workspace.

No duplicate asset detail page was created.

### Context-preserving return
`V3App` keeps the source workspace unchanged while an asset is open.

The Asset Workspace back action now receives the current workspace label, so a card opened from Analysis returns to Analysis, one opened from Income returns to Income, and one opened from Assets returns to Assets.

### Asset Workspace navigation
The Asset Workspace itself now uses the shared `V3SectionSelector` instead of six small horizontal tabs:
- Обзор
- Показатели
- История
- Риск
- Доход
- Позиция

Each option includes a plain-language description.

The selector is intentionally non-sticky inside Asset Workspace because the contextual back control is already sticky; this avoids stacked sticky controls on narrow phones.

### Removed obsolete Asset Workspace tab CSS
The six-column tab rail and its <=430 / <=359 overrides were removed.

## What did not change
- No financial formula.
- No TWR, risk-contribution or correlation methodology.
- No source API.
- No payout calculation.
- No fundamentals logic.
- No recommendation logic.
- No ticker/name identity fallback.

## Regression coverage
- exact UID/FIGI resolver;
- ambiguous duplicate identity fail-closed behavior;
- no ticker fallback;
- Analysis Structure drill-down contract;
- Risk contributor exact drill-down;
- Correlation-pair exact drill-down;
- context-aware Asset Workspace back route;
- Asset Workspace shared section selector;
- obsolete Asset Workspace pill-navigation CSS removal.

## Validation required
- dependency security gate;
- production TypeScript/Vite build;
- full v3 suite;
- inspect bundle effects;
- exact-head CI;
- squash merge only if green;
- exact merged SHA LIVE on Render.

## Physical-device status
Still not physically validated:
- Samsung Internet;
- Chrome Android;
- 360–430 px actual hardware;
- correlation-pair tap targets;
- native selector rendering;
- sticky back behavior under Android browser chrome.
