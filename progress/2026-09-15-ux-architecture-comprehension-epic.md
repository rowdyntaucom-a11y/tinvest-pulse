# QVANIX — UX Architecture + Comprehension Epic

Date: 2026-09-15
Starting main SHA: `b754a6568e2823a43ca6377817408b3ac964b663`
Branch: `qvanix-ux-architecture-comprehension`

## Audit diagnosis
The released shell still exposed seven top pills in a horizontal mobile rail. Portfolio, Analytics, Income and Risk each added permanent pill rows; Risk used abbreviated `ХВОСТ`/`СВЯЗИ` and Analytics used `СЦЕН.`. Several feature CSS files retained 5–9px mobile typography. The Board stylesheet already described a capital/health hero, but its component rendered only an account title, leaving the first answer visually absent. ContextHelp was comprehensive but inferred location from the retired pill selectors and had no canonical glossary registry.

## Navigation architecture
A configuration-driven canonical model now owns all six primary destinations, including DNA. Phones use a persistent six-destination bottom navigation with 48px targets, safe-area padding, clear active state and a landscape side-rail adaptation. Desktop retains compact top navigation from the same model. No heavy icon dependency was added.

A reusable native-select-backed `SectionSelector` provides the current workspace and full section name on phones; desktop renders the same model as buttons. Portfolio, Analytics, Income and the nested Risk workspace use it. Risk options are grouped into Основное, Историческое and Статистическое; no target navigation label uses `Сцен.`, `ХВОСТ` or `СВЯЗИ` abbreviations.

## Pult hierarchy
The first Board card is now a real capital hero with account identity, verified snapshot source/time, explicitly cumulative broker P/L, and transparent Health status. It does not display or infer daily change. Data provenance remains secondary. On phones modules become readable vertical depth instead of compressed equal tiles.

## Glossary and contextual help
The existing ContextHelp system remains canonical and is now lazy-loaded. A typed glossary registry adds TWR, XIRR, Health, tail risk, stress tests, rebalance tolerance, payout coverage, outside-model assets, and the bounded IIS/tax-return explanation. The help surface exposes this via progressive disclosure and resolves location from the new navigation model.

## Responsive, contrast and accessibility decisions
- Persistent navigation uses `aria-current`, semantic `nav`, keyboard-native buttons, at least 48px phone targets, safe areas and a landscape variant.
- Section selection is a native `select` with labelled optgroups and a 44px target on phone; desktop active buttons use `aria-current`.
- Mobile Board body/caption text on touched surfaces is at least 10–11px and depth scrolls rather than compressing to fit.
- Negative P/L has a dedicated negative token fallback instead of warning amber.
- Pulse remains viewport-fixed; Asset identity/history/fundamentals loading, sticky back and lazy split were not changed.
- Empty data gets explanatory copy and never presents fake live zero metrics.

Exact WCAG contrast ratios and browser rendering still require automated browser tooling/real-device review; no conformance claim is made.

## Methodology and four review passes
- **Quant:** no formula or financial data boundary changed; no daily metric, Daily Movers, VWAP, YTM or duration was introduced; missing remains `—`.
- **Code:** one canonical navigation model, one reusable selector, one existing ContextHelp system; no credentials/backend boundary changes; Asset and DNA ownership unchanged.
- **Mobile:** reasoned for 360/375/390/430, safe areas and landscape; no page-level horizontal rail is used for primary navigation.
- **Release:** optional help moved to a deferred chunk to remain below the unchanged 450 KiB non-DNA budget; Asset, Goal, Pulse and Pixi remain deferred.

## Tests and bundle
`uxNavigation.test.ts` protects all canonical destinations, section reachability/grouping, full labels and required glossary content. Full CI-equivalent suite and security audits are required before PR publication.

Build result: main `441.21 kB` raw / `134.66 kB` gzip; ContextHelp `24.42/7.98 kB`; Asset `15.07/5.30 kB`; Goal `15.26/4.71 kB`; Pulse `1.55/0.80 kB`; Pixi `505.95/145.54 kB`. Budgets are unchanged.

## Remaining Samsung checks
At 360/375/390/430 portrait and landscape: confirm all six destinations are visible/tappable; Android back and scroll restoration; bottom safe-area and keyboard interaction; long Russian selector options; ContextHelp above bottom navigation; Board capital wrapping with large RUB values and font scaling; Pulse viewport fixation; Asset sticky back and identity/history availability; no horizontal page movement.

## Gated scope / recommended next Epic
Daily change/Movers, VWAP, YTM/duration/call analytics, unverified fundamentals, full PARTIAL/STALE/ERROR product-wide freshness, and personalized trading actions remain gated. Next: verified data-freshness state architecture plus browser-based responsive/accessibility automation, followed by Asset history chart maturity.
