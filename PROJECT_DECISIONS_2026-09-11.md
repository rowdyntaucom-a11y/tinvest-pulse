# Project decisions — 2026-09-11

## Public brand
Approved public product name: **QVANIX / КВАНИКС**.

`TInvest Pulse` / `Пульс` is retired as the public-facing product brand to avoid confusion with T-Investments' own Pulse product. Historical repository, Render service and route names may remain until a controlled infrastructure migration.

`Кряхтящий фонд` remains the current personal portfolio/account name, not the public product brand.

## Product shell before world rebuild
Before returning to the full DNA WORLD art/animation pass, finish the QVANIX product shell and deterministic analytics so no data or widgets are duplicated across sections.

Current target navigation:
- `Портфель` — capital, positions, asset allocation/account context.
- `Аналитика` — TWR/XIRR, benchmark, drawdown, volatility, Sharpe, Sortino, HHI, transparent versioned Health Score.
- `Доход` — dividends/coupons, calendar, YoC and passive-income growth.
- `DNA` — world state and gamification, driven by XP rather than absolute capital.

Full AI chat remains hidden/deferred until monetization can cover model usage.

## DNA rules
DNA level must not depend on absolute RUB capital. The next stage after the product shell is XP Engine v1 using relative/behavioral metrics, then world events, share card and later biomes/collectibles.

## Analytics milestone — 2026-09-11
The next deterministic-analytics checkpoint is implemented in `main`:
- restore IMOEX history from MOEX ISS for the v2 historical benchmark;
- normalize IMOEX to the same 100-point baseline as the portfolio TWR index;
- carry the latest official close across non-trading/holiday gaps after the benchmark starts instead of fabricating prices;
- expose benchmark coverage and history integrity metadata from the history builder;
- show the current normalized Portfolio/IMOEX values and benchmark coverage in the v2 chart legend.

Implementation commits were pushed to `main`; live Render behavior still needs the normal post-auto-deploy verification.

Next product order remains: finish `Доход` (`Источники`, YoC, payout growth) → Monte Carlo / drift-based rebalancing → XP Engine v1 → DNA world events/share card.

## Launch naming caution
Before a commercial public launch, repeat formal trademark/domain/store clearance for QVANIX, including similar-sounding marks. Preliminary exact-name web/app searches did not surface a clear exact match, but this is not legal clearance.
