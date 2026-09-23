# 2026-09-23 — Samurai since-inception analytics

Source: Samsung recording `1000031405.mp4` and user request to make broker creation date the anchor for portfolio analytics.

## Product requirement

The Home screen must show:
- when the brokerage account/portfolio was opened;
- how long the account has existed as of the current confirmed snapshot;
- portfolio performance for the common historical period;
- IMOEX performance for the same period;
- excess performance in percentage points;
- explicit coverage wording when benchmark history does not reach the broker opening date.

The UI must not call a later benchmark sample "since opening" when the evidence starts later.

## Data provenance

- Broker opening date comes from `PortfolioSnapshot.accountContext.openedDate`, which is populated from `/api/accounts`.
- `PortfolioSnapshot.startDate` is only a fallback when account metadata is unavailable.
- Relative portfolio/IMOEX/excess metrics reuse the existing `calculateRelativePerformance` pipeline via `buildV3RelativeDepth`.
- If the first common history point is within three days of the broker-open date (to allow for a weekend/non-trading-day open), the panel is labelled `С МОМЕНТА ОТКРЫТИЯ`.
- Otherwise the UI says `ДОСТУПНАЯ ИСТОРИЯ` and shows the actual comparison start date.

## Samurai Home changes

- Added a dedicated inception intelligence strip under Capital.
- Added broker-open date + account age.
- Added Portfolio / IMOEX / excess return for the common confirmed history.
- Replaced the static Samurai graph with a graph generated from real paired portfolio/IMOEX history.
- Replaced hardcoded capital, profit, TWR, XIRR, income, asset count and top holdings with the live Home model.
- Formation now uses the actual top three holdings.
- No fake values remain in the Samurai Home prototype path.
- Kept the one-screen / no-scroll contract by compressing the secondary telemetry rail and lower chart.

## Boundaries

No broker write operations, trading actions, financial formulas, trust evaluation, or DNA behavior changed.
