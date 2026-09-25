# QVANIX — Samurai Technical Discovery / Fallen Assets v1

Date: 2026-09-25

## Source

Samsung recording `1000031737.mp4`.

The recording confirmed the latest Samurai reference shell is live on the real device:
- Home remains visually stable;
- Assets extended chapter stack remains readable;
- Analysis now visibly contains Rebalancing and Portfolio Laboratory in the fail-closed Atlas;
- Income and Goal keep the established vertical flow;
- no new blocking Samsung regression was found in the sampled 23.8s recording.

## Completed

PR #704 adds the next Snowball+ breadth milestone: **Technical Discovery / fallen-assets tooling**.

### Product surface

Samurai Analysis now has an eighth chapter:
- **08 · Просадки**

The scanner uses only confirmed asset-history rows returned by the existing broker-history contract and supports:
- 3M / 6M / 12M windows;
- current distance from the selected-window high;
- rebound from the selected-window low;
- return over the selected window;
- maximum drawdown;
- distance from SMA50 when enough observations exist;
- distance from SMA200 when enough observations exist;
- range position between window low and high;
- deterministic drawdown buckets.

Rows are sorted by factual current drawdown from the selected-window high.

### Trust / product boundary

The tool does **not**:
- infer fundamental cheapness;
- label an asset as a buy;
- create buy/sell instructions;
- use unverified or conflicting history;
- pretend that technical drawdown equals investment attractiveness.

The UI states this directly.

Fail-closed Samurai advertises the chapter without financial values.

## Validation

Merged PR: #704
Main feature commit: `4598174ba71b64a221666dc1fc5843a0e7df7351`

Final required gates:
- v3 build: PASS;
- full v3 tests: PASS;
- V3 free-preview artifact: PASS.

A first CI attempt failed because the Analysis wiring contained literal escaped newline characters; the wiring was repaired before merge and all final checks passed.

## Resume direction

Samurai remains the single Snowball+ reference shell.

Next active milestone:
1. user-facing screener;
2. verified fundamentals and bond-yield metrics only after defensible source contracts exist;
3. broad-market dividend discovery source integration.

DNA WORLD remains frozen.
