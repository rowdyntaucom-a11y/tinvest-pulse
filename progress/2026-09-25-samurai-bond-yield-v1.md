# QVANIX — Samurai Bond Yield Intelligence v1

Date: 2026-09-25

## Source

Samsung recording `1000031745.mp4`.

The recording confirms the latest fail-closed Analysis interaction is stable:
- Screener opens inline inside its Atlas card;
- the Analysis page no longer jumps upward after Screener load;
- Screener controls remain visible in place;
- no new blocking scroll regression was observed in the 11.5s Samsung recording.

## Completed

PR #715 adds verified bond intelligence to the trusted Samurai Assets > Bonds chapter.

### Backend contract

Route:
- `/api/shield/bonds`

Verified inputs:
- T-Bank `BondBy` metadata;
- T-Bank `GetBondCoupons` future coupon cashflows;
- T-Bank `GetMarketValues` with `INSTRUMENT_VALUE_YIELD`.

Bond price semantics use the documented percent-of-nominal quote plus accrued coupon income (ACI) for dirty price.

### Metrics

Portfolio-level:
- weighted YTM;
- modified duration where the cashflow model is defensible;
- weighted years to maturity;
- source coverage for yield / duration / maturity;
- maturity ladder;
- rate-shock diagnostics at -2 / -1 / +1 / +2 percentage points.

Per issue:
- YTM and source;
- modified duration;
- maturity date / years;
- accrued coupon per bond;
- dirty price;
- fixed / floater / amortizing / perpetual classification.

### Trust boundary

- YTM prefers direct T-Bank market yield.
- A cashflow fallback is used only for simple fixed, non-amortizing, non-perpetual issues.
- Modified duration is calculated only when the future cashflows are confirmed enough to support it.
- Missing or complex values remain `—`; maturity is not relabeled as duration.
- Rate-shock values are duration approximations, not price forecasts.

## Validation

Merged PR: #715
Feature commit in main: `4c4ef00ed862ea07ff923320a79a1f13c30bb761`

Final required gates:
- v3 build: PASS;
- full v3 tests: PASS;
- v2 build + root API regressions: PASS;
- V3 free-preview artifact: PASS.

The final feature-head fix was a TypeScript row-filter annotation only; all final gates passed after it.

## Resume direction

Samurai remains the sole Snowball+ reference shell.

Next active work:
1. verified fundamentals depth for equities;
2. broad-market dividend discovery source integration;
3. continue replacing preview-only Atlas chapters with direct functional surfaces;
4. only after Samurai reaches functional parity, port the finished systems to other shells.

DNA WORLD remains frozen.
