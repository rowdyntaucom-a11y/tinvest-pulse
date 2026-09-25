# QVANIX — Samurai Income Calendar v2

Date: 2026-09-25

## Source

Samsung recording `1000031734.mp4`.

The recording confirmed that the latest real-device Samurai fixes are live and that the new Report / Category / Currency chapters are visible in the Assets fail-closed Atlas without a new blocking UI regression.

## Completed

PR #697 adds the next Snowball+ income milestone:

- **Ближайшие выплаты** with selectable 3M / 6M / 12M horizons;
- forward gross total for the selected horizon;
- average gross payout per month for that horizon;
- coupon vs dividend event counts;
- amount-coverage ratio;
- nearest scheduled events with:
  - payment date;
  - countdown;
  - ticker / kind / confidence;
  - per-security amount when supplied;
  - current-position quantity when supplied;
  - expected portfolio gross amount;
  - record date or last-buy date when supplied;
- a separate **Рынок** chapter for broad-market dividend discovery.

## Trust boundary

- The user's portfolio payout calendar and broad-market dividend discovery are separate product surfaces.
- Future schedule remains gross and never merges with received FACT income.
- Market-wide discovery stays fail-closed until an independent verified market-wide source is connected.
- No market events are synthesized from the user's own holdings calendar.

## Validation

Merged PR: #697
Main feature commit: `c139fdd888c267e071c6021142fff5eb56634ca2`

Final required gates:
- v3 build: PASS;
- full v3 tests: PASS;
- V3 free-preview artifact: PASS.

## Resume direction

Samurai remains the single Snowball+ reference shell.

Next active milestone:
1. rebalancing workflow UI;
2. Portfolio Laboratory / historical strategy comparison;
3. technical discovery / fallen-assets tooling;
4. user-facing screener;
5. verified fundamentals and bond-yield metrics only after source contracts are defensible.

Broad-market dividend discovery also remains a source-integration task after a defensible market-wide feed is chosen.

DNA WORLD remains frozen.
