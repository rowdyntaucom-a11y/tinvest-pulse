# QVANIX — Saved Chat / Bond Yield Depth Resume

Date: 2026-09-25

## Why this checkpoint exists

The user explicitly asked: **«Сохрани чат»**.

This file is the continuation point for the current development thread. It preserves both the recently verified Samsung UX state and the unfinished bond-yield implementation so a new chat can resume without reconstructing the sequence.

## Latest real-device UX state

Latest reviewed Samsung recording: `1000031744.mp4`.

Confirmed on the real device:
- fail-closed Atlas cards are interactive;
- selected cards open inline directly beneath the tapped card;
- the earlier Analysis scroll-bounce fixes are holding in the sampled navigation;
- Home / Assets / Analysis / Income / Goal keep the established Samurai vertical hierarchy;
- the latest recording did **not** open the real Market Screener, so the final Screener-specific no-bounce confirmation still needs one explicit real-device check.

Recent relevant merged fixes already in `main` before this bond branch:
- Atlas full-card interaction;
- removal of automatic selection scroll;
- inline Atlas detail accordion;
- removal of detached fail-closed Screener bottom mount;
- fail-closed Screener now belongs to the tapped Atlas card;
- internal deep jumps no longer leave long smooth-scroll tails.

Development completion rule remains:
1. visually present;
2. interactive;
3. functional with verified data.

Static labels do not count as completed functionality.

## Active work: Samurai Bond Yield Depth v1

Active branch:
`feat/samurai-bond-yield-depth-v1`

Current branch head at save time:
`173a84c729c7582d08af858bd663460e773de94f`

Current main at save time:
`69c9050fe395caaa1440c0eda3693d123358c58e`

Important: this feature branch is currently **diverged from main**. Do not blindly merge it before reconciling the latest main fixes.

### Work already implemented on the branch

Backend:
- new `bond-analytics-core.js`;
- expanded `bond-analytics.js`;
- registered `/api/shield/bonds` in `server-core.js`;
- tests for bond analytics core and route;
- CI/test script changes.

Bond model direction:
- prefer T-Bank `INSTRUMENT_VALUE_YIELD` for YTM when available;
- fallback YTM only from explicit fixed-coupon cashflows when the bond is non-floating, non-amortizing and non-perpetual;
- dirty-price calculation from clean price + ACI;
- modified duration only where the cashflow model is defensible;
- maturity buckets;
- rate-sensitivity scenarios from modeled duration;
- explicit coverage metrics;
- last-good stale fallback without fabricating missing live fields.

Frontend:
- new `v3/src/assets/bondYieldApi.ts`;
- new `v3/src/assets/V3BondYieldDepth.tsx`;
- new `v3/src/styles/bondYieldDepth.css`;
- `V3AssetsDepth.tsx` already wired for bond-yield depth on this branch;
- `v3/tests/bondYieldDepth.test.ts` added;
- `assetsDepthV1.test.ts` adjusted.

Current branch diff also contains:
- workflow/test registration updates;
- package script changes.

## Trust / finance boundary for bond work

Do not infer:
- YTM from ticker/name alone;
- duration for floating/amortizing/perpetual bonds without a defensible model;
- coupon schedule when T-Bank does not return it;
- issuer/currency/maturity from display text.

Expose coverage and unknown states instead.

This is descriptive portfolio analytics, not a buy/sell recommendation.

## Immediate next steps

1. Reconcile `feat/samurai-bond-yield-depth-v1` with current `main` first, preserving all Samsung 1740–1744 UX fixes.
2. Inspect the already-added `V3BondYieldDepth.tsx` and finish any incomplete wiring/styling.
3. Run:
   - v3 build;
   - full v3 tests;
   - root API regression suite;
   - preview artifact.
4. Only then open/merge the bond-yield PR.
5. After merge, perform Samsung real-device verification of:
   - Bonds deep chapter;
   - Screener no-bounce behavior;
   - Atlas inline interactions.

## Broader product direction

Samurai remains the only Snowball+ reference shell until its functional breadth is complete.

After Bond Yield Depth:
- source-gated fundamentals;
- broad-market dividend discovery source integration;
- continue converting preview-only Atlas modules into directly usable tools where sensible.

DNA WORLD remains frozen.
