# QVANIX v3 — Pult TWR hierarchy

Date: 2026-09-20

## Why
The canonical roadmap says the first screen should answer and that TWR is the primary strategy-return metric for benchmark comparison, while XIRR describes the investor's money-weighted experience. The Pult still promoted CAGR beside XIRR and passive income while TWR lived deeper in Analytics.

## Implemented
- Home view model now exposes the latest finite verified TWR value already present in canonical portfolio history; no new financial formula was introduced.
- Pult primary grid now leads with TWR, passive income, XIRR and portfolio breadth.
- Labels explicitly distinguish `Стратегия · без внешних потоков` from `Личный результат · с потоками`.
- CAGR remains available in Detailed mode as secondary context instead of competing with the primary return pair.
- TWR inherits the existing positive/negative/neutral semantic treatment.
- Fail-closed behavior is preserved: untrusted/fallback data never exposes TWR.

## Methodology boundary
This pass does not recalculate TWR. It only promotes the latest finite `history[].portfolio` value from the already verified canonical history contract. Missing or untrusted history stays unavailable rather than becoming zero.

## Regression
`homeTwrHierarchy.test.ts` locks latest-finite selection, fail-closed behavior, primary-card ordering and CAGR demotion.
