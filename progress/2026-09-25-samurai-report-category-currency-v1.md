# QVANIX — Samurai Report + Categories + Currencies v1

Date: 2026-09-25

## Source

User-provided Samsung recording `1000031733.mp4` confirmed that the 1731 real-device hierarchy fixes are live:
- fail-closed Home no longer repeats the outer “История портфеля” heading;
- Goal Lab no longer uses the native white checkbox treatment;
- Assets/Analysis/Income/Goal remain coherent as one Samurai system.

With those regressions cleared, work returned to the planned Snowball+ breadth milestone.

## New Samurai chapters

Added to Assets depth:
- **08 · Report**
- **09 · Categories**
- **10 · Currencies**

### Report
Shows, from the current confirmed positions:
- current portfolio value;
- available cost basis;
- broker P/L;
- position count;
- explicit reconciliation of broker P/L vs `currentValue - costBasis`.

If those two concepts disagree, QVANIX surfaces the discrepancy instead of silently rewriting one from the other. Broker P/L remains broker-sourced `expectedYield`.

### Categories
Explicit asset-class drill-down with:
- current value;
- cost basis;
- broker P/L;
- portfolio share;
- position count.

Class logic follows the existing normalized instrument-type semantics.

### Currencies
Explicit currency drill-down with:
- coverage ratio;
- current value;
- cost basis;
- broker P/L;
- portfolio share.

Important: current normalized PositionSnapshot only carries verified currency where that metadata is actually available (notably bond metadata today). Missing currency is kept in an explicit unclassified bucket. QVANIX does **not** infer RUB from exchange, ticker, issuer or name.

## Fail-closed behavior

The Samurai Assets Atlas now advertises Report / Categories / Currencies even when portfolio data is not trusted, but shows no fabricated financial values.

## UX

- Added all three sections to the Samurai vertical chapter navigator.
- Operations + Event Integrity flow directly into Report instead of ending with a large bottom gap.
- Report rows reflow to a readable two-column mobile structure on Samsung widths.
- Other shells still do not receive this incomplete parity work.

## Validation

PR #695:
- v3 build: PASS;
- full v3 test suite: PASS;
- V3 free preview artifact: PASS.

The first CI pass exposed two implementation errors during development:
1. literal escaped newlines in the V3Assets patch;
2. a missing Report mount despite the navigation entries existing.

Both were fixed before merge, and the final PR head passed all required gates.

## Next Snowball+ gap

The Report / Categories / Currencies milestone is now complete at v1 depth.

Next active functional surface:
1. expanded portfolio payout/calendar UX;
2. clear separation between portfolio payouts and broad-market dividend discovery;
3. then rebalancing workflow UI;
4. Portfolio Laboratory / historical strategy comparison;
5. technical discovery / fallen-assets tooling;
6. user-facing screener;
7. source-gated fundamentals and bond yield metrics.

DNA WORLD remains frozen.
