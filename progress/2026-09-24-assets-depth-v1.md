# 2026-09-24 — Assets Depth v1

## Direction lock
This is the next major product stage after Samurai/Cosmos shell work.

The architecture is now explicit:
- shell/art first;
- visible down cue;
- shared product terminal below;
- the finance/data model is common to all shells;
- Samurai and Cosmos change composition/material/motion, not financial semantics.

## Implemented in this pass
- Added a shared `V3AssetsDepth` workspace used by both Samurai and Cosmos.
- The themed first viewport keeps the existing atmospheric composition and gets a real down cue into Assets Depth.
- Assets Depth exposes:
  - current portfolio value and position count;
  - Top-1 / Top-3 concentration;
  - HHI-derived effective position count;
  - canonical broker P/L attribution with gross-absolute contribution shares;
  - asset-class composition;
  - sector coverage from confirmed metadata only;
  - bond share / OFZ share / maturity coverage / weighted time-to-maturity / floater count;
  - issuer and sector metadata coverage for bonds;
  - the existing deep Holdings Explorer;
  - the existing canonical Asset Workspace drill-down.
- Existing v2 deterministic calculators are reused instead of creating a second Cosmos/Samurai analytics stack.

## Data-honesty boundary
- Broker expectedYield remains accumulated broker P/L, not daily return and not TWR attribution.
- Sector remains unknown when normalized metadata is absent.
- YTM, duration and accrued coupon interest (НКД) are not fabricated. They stay explicitly unavailable until a verified source/semantics contract exists.
- Calendar time to maturity is not labelled duration.

## Shell rule
Cosmos and Samurai may style Assets Depth differently, but they consume the same component and the same calculations.

## Next product steps
1. Real-device polish of Assets Depth on Samsung / Chrome.
2. Expand exact verified bond analytics only when source semantics permit.
3. Then apply the same architecture to Analysis Depth and Income Depth.
