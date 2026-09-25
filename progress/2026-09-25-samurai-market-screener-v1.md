# QVANIX — Samurai Market Screener v1

Date: 2026-09-25

## Source

Samsung recording `1000031739.mp4`.

The recording confirms the Atlas interaction patch is live:
- fail-closed cards are now tappable;
- selected cards open a detail drawer;
- DATA LOCK / source requirements are readable;
- Home/Assets/Analysis/Income keep the same visual hierarchy;
- no new blocking interaction regression was found in the sampled 41s recording.

## Completed

PR #708 adds the first real **user-facing market screener** to Samurai Analysis.

### Public source

New backend route:
- `/api/market-screener`
- public MOEX ISS
- board: TQBR
- independent of broker credentials
- server-side 60-second cache

The source contract normalizes:
- SECID / short name;
- current/fallback market price;
- daily price change;
- turnover;
- traded volume;
- number of trades;
- open / high / low;
- daily range;
- lot size;
- listing level.

### Screener UI

Samurai Analysis now has a ninth chapter:
- **09 · Screener**

It is available even while the user's broker portfolio is fail-closed because its source is public MOEX market data.

Interactive filters:
- ticker/name search;
- listing level;
- day direction: all / gainers / losers / absolute move >=2% / >=5%;
- minimum turnover: any / 10M+ / 100M+ / 500M+;
- sort by turnover, price change, trades or daily range.

The result table shows:
- ticker and name;
- listing level and lot size;
- last price;
- daily change;
- turnover;
- number of trades;
- daily low/high and range.

The Atlas Screener card opens its detail drawer and has an **Open tool** action that scrolls directly to the public screener even in DATA LOCK.

### Product boundary

The screener:
- does not calculate attractiveness scores;
- does not rank assets as better/worse investments;
- does not create buy/sell instructions;
- does not show fundamentals until a separate defensible source contract exists.

It is a factual market filter, not an investment recommendation engine.

## Validation

Merged PR: #708
Feature commit in main: `382a110890a11217a0b7d3682f945ebbedaf30de`

Final required gates:
- v3 build: PASS;
- full v3 tests: PASS;
- v2 build + root API regressions: PASS;
- V3 free-preview artifact: PASS.

The first v3 attempt failed on one TypeScript implicit-any error in the row type guard. It was fixed before merge and all final checks passed.

## Completion tracking rule

Continue tracking major features separately as:
1. visually present;
2. interactive;
3. functional with verified data.

The Screener v1 now reaches all three levels using public MOEX data.

## Resume direction

Samurai remains the sole Snowball+ reference shell.

Next active work:
1. source-gated fundamentals;
2. bond-yield metrics and deeper bond scanner once data contracts are defensible;
3. broad-market dividend discovery source integration;
4. continue converting remaining Atlas preview-only chapters into direct functional navigation where sensible.

DNA WORLD remains frozen.
