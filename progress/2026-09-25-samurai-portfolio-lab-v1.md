# QVANIX — Samurai Portfolio Laboratory v1

Date: 2026-09-25

## Source

Samsung recording `1000031736.mp4`.

The recording shows the Income Calendar v2 / Market-discovery architecture already live, while the Analysis fail-closed Atlas still reflects the build before Rebalancing v1. No new blocking layout regression is visible in the sampled real-device pass, so development continued on functional breadth rather than adding another cosmetic override.

## Completed

PR #701 adds **Portfolio Laboratory v1** as the next Samurai Analysis chapter.

### Current-snapshot comparison

Two user-authored equity/bond scenarios are compared against the same current portfolio snapshot using the existing deterministic strategy engine.

For each scenario the Lab shows:
- target equity / bond split;
- current maximum structural drift;
- class-level capital that would need to cross between supported classes;
- turnover ratio;
- weight outside the two-class model;
- tolerance status.

QVANIX does not pick a winner or recommend a scenario.

### Historical comparison

A new public market-history contract:
- `GET /api/strategy-lab-history`

provides five years of official MOEX total-return index history:
- **MCFTR** — MOEX Russia Total Return Index (gross-dividend equity benchmark);
- **RGBITR** — Russian Government Bond Index Total Return.

The client:
- aligns shared trading dates;
- supports 1Y / 3Y / 5Y windows;
- simulates a two-class constant-target strategy with monthly weight restoration;
- reports total return, CAGR, max drawdown and annualized volatility for both user-authored scenarios on the exact same sample.

### Methodology boundary

The historical model:
- is a class-level benchmark simulation, not a reconstruction of the user's actual historical holdings;
- uses total-return indices in RUB;
- ignores fees, taxes and slippage;
- rebalances monthly;
- does not infer missing market data;
- does not rank scenarios or convert them into trading instructions.

## Validation

Merged PR: #701
Main feature commit: `a2f4b6bc719ba176ca85ce0aee30375efb4cd044`

Required gates on the corrected head:
- v3 build: PASS;
- full v3 tests: PASS;
- V3 free-preview artifact: PASS;
- v2 build + runtime/API regressions: PASS.

## Resume direction

Samurai remains the single Snowball+ reference shell.

Next active milestone:
1. technical discovery / fallen-assets tooling;
2. user-facing screener;
3. verified fundamentals and bond-yield metrics where source contracts are defensible;
4. broad-market dividend discovery source integration.

DNA WORLD remains frozen.
