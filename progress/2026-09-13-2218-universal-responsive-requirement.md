# QVANIX checkpoint — universal responsive requirement

Date: 2026-09-13 22:18 MSK
Starting main: `d3c0cfd8d8d98ee17302964ae02c16215ca77748`
Branch: `qvanix/universal-responsive-requirement`

## User requirement

The user clarified a hard product constraint: QVANIX must be usable on any real-world smartphone and any PC across screen resolutions. The current Samsung/Android device remains a valuable regression target, but must not define the application layout.

## Durable decision

Created `QVANIX_RESPONSIVE_REQUIREMENTS.md` as the canonical responsive contract and updated the continuity checkpoint so future autonomous work cannot silently fall back to a Samsung-only/mobile-only interpretation.

The responsive contract requires fluid behavior across narrow/foldable phones, common phones, tablets/small windows, laptops, desktop, HiDPI/4K-class and ultrawide browser viewports, portrait/landscape, touch/keyboard, browser zoom/text scaling and safe-area/dynamic viewport conditions.

## Important implementation rule

Do not satisfy narrow screens by making critical text unreadably small. Prefer reflow, stacking, pagination, collapse or explicit local drill-down. Do not merely stretch the mobile layout on desktop; wide screens should use space intentionally while preserving the same information architecture and financial semantics.

## Known first audit target

`v2/src/styles.css` currently contains `body { min-width: 320px; }` and the project has accumulated several mobile-specific one-screen density compromises. These must be reviewed against the universal requirement. The first runtime responsive pass should audit root overflow/min-width assumptions, top navigation, desktop reflow, dense data labels, charts and Living World canvas sizing before making broad visual changes.

## Scope

Documentation/product-requirement pass only. No financial formulas, data boundaries, navigation implementation, broker/backend routes, legal/payment behavior, credentials or DNA semantics changed.
