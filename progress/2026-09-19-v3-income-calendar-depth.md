# QVANIX v3 — Verified Income Calendar + Source Depth

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `4af289ccb3c0bc2226ee46976ee9bf5c215cd25b`
- Branch: `v3/income-calendar-depth-v1`
- Continues Track A / Product Depth after canonical portfolio analytics and verified risk contribution.

## Product problem
The v3 Income workspace still showed only aggregate passive-income totals. The reviewed v2 codebase already contains stronger deterministic payout boundaries for:
- payout trust and coverage;
- fact vs future schedule separation;
- 12-month calendar visual;
- exact-FIGI source attribution;
- realized monthly history;
- source concentration;
- stability gates;
- comparable periods;
- bond-to-income linkage.

The next roadmap item is therefore not another new formula. It is to bring those verified boundaries into the v3 product without duplicating them or turning incomplete payout data into a forecast.

## Implemented

### 1. Canonical income-depth adapter
Added `incomeDepth.ts` which reuses:
- `evaluatePayoutTrust`
- `separateTrustedIncomeData`
- `getIncomeIntegrity`
- `buildIncomeCalendarVisual`
- `buildIncomeSourceRows`
- `buildRealizedIncomeHistory`
- `calculateIncomeSourceConcentration`
- `calculateIncomeStability`
- `calculateIncomeComparablePeriod`
- `buildBondIncomeLinkage`

No second payout methodology was added to v3.

### 2. Deferred detailed Income workspace
The existing compact Income first screen remains unchanged.
Detailed mode now lazy-loads the heavier payout workspace only when needed.

The detailed layer contains:
- Calendar
- Fact
- Sources

This preserves the “FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.” rule.

### 3. Verified 12M calendar
The Calendar layer shows:
- official 12-month payout schedule;
- next payout;
- horizontal month ribbon;
- event counts and confirmed gross amounts by month;
- selected-month drill-down;
- event date, instrument, kind, confidence and gross amount.

Future schedule is fail-closed:
- it opens only when payout trust is LIVE with complete coverage;
- partial/stale schedule is not shown as a confirmed forecast;
- FACT events are kept out of the future schedule;
- no missing event is fabricated.

### 4. Exact identity drill-down
Calendar events can open Asset Workspace only after exact FIGI matching to one current position.
Ticker/name are display aliases only and never select an asset or cost basis.

### 5. Realized monthly history
The Fact layer uses canonical observation metadata:
- complete months;
- partial months;
- monthly realized net income;
- payout vs zero-income months;
- largest month;
- coefficient of variation;
- same-month year comparison when canonical minimum paired months exist.

A zero-income month is counted as zero only when the source explicitly marks the calendar month as completely observed.
Partial and missing months remain unknown instead of being silently converted to zero.

### 6. Stability maturity gates
- fewer than 3 complete observed months: unavailable;
- 3–11 complete months: preview;
- 12+ complete months: mature.

No short-history annualization is introduced.

### 7. Source layer
Shows:
- realized FACT income by source;
- separate 12M scheduled gross;
- payout counts;
- YoC only on exact one-FIGI / one-position identity;
- fact-income source concentration and effective source count;
- bond schedule linkage by FIGI;
- schedule coverage / errors.

FACT and 12M schedule remain separate and are never added together.

### 8. Bond linkage
The bond section reuses existing scheduled coupon events.
It does not generate a second coupon forecast.
It reports only the portion of current bond value linked to existing schedule rows by FIGI.

### 9. Explainability
Added contextual help for:
- payout coverage;
- passive-income stability;
- income-source concentration.

The canonical v2 payout-coverage glossary copy is reused.

## Trust guarantees
- No invented payout date.
- No invented dividend.
- No forecast from historical averages.
- No missing month converted to zero.
- No FACT + schedule double counting.
- No ticker/name fallback for YoC or asset navigation.
- No future schedule when payout trust is partial or stale.
- No recommendation language.
- No broker/server API change.

## Performance
The detailed payout workspace is lazy-loaded from the compact v3 Income screen so Home and the normal Income summary do not need to eagerly load payout-history/source logic.

## Regression coverage
Added:
- canonical payout trust / schedule gate / fact-history regression;
- detailed Income UI trust contracts;
- lazy Income-depth contract.

The canonical fixture verifies that incomplete payout coverage removes future schedule rows while preserving realized FACT history.

## Validation required
- v3 build;
- dependency security gate;
- full v3 test suite;
- bundle split inspection;
- merge and Render exact-SHA live verification.

## Remaining real-device validation
Samsung Internet / Chrome Android still needs physical-device review for:
- month ribbon touch behavior;
- 360–430 px source-row readability;
- vertical scroll ownership;
- bottom-navigation clearance;
- Core/Horizon/Carbon contrast.
