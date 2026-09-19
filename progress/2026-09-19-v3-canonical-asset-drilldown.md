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

## Validation
- dependency security gate: success, 0 vulnerabilities.
- TypeScript/Vite production build: success.
- full v3 regression suite: success.
- exact risk-history adapter and contribution pipeline: success.
- exact position identity resolver: success.
- canonical cross-workspace asset drill-down regression: success.
- first regression run exposed two stale contracts from the old Asset Workspace tab rail; both were updated to the new section-selector contract without weakening financial or identity guards.
- a later regression run exposed Node strip-types resolving an extensionless new helper import from the risk-history adapter. The adapter kept its existing exact UID/FIGI key derivation locally, while the canonical drill-down resolver remains centralized in `positionIdentity.ts`; this preserves browser build behavior and direct Node regression compatibility.
- initial JS: 280.96 kB / 86.74 kB gzip.
- initial CSS: 82.55 kB / 14.20 kB gzip.
- shared Section Selector: 0.52 kB / 0.32 kB gzip JS; 2.09 kB / 0.76 kB gzip CSS.
- deferred Asset Workspace: 30.36 kB / 9.13 kB gzip.
- deferred Analysis: 53.84 kB / 15.08 kB gzip.
- Codex review bot did not run because connected review quota is exhausted; no review finding was produced.
- squash merge and Render exact-SHA LIVE verification remain before completion.

## Physical-device status
Still not physically validated:
- Samsung Internet;
- Chrome Android;
- 360–430 px actual hardware;
- correlation-pair tap targets;
- native selector rendering;
- sticky back behavior under Android browser chrome.
