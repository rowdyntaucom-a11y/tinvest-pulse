# QVANIX v3 — Asset Identity + Observed Risk Pass

Date: 2026-09-19

## Starting point
- Starting `main` SHA: `e3e951010049fca452ad07ed765b0bea0650b19d`
- Branch: `v3/asset-identity-risk-v1`
- Continuation after verified fundamentals + instrument income shipped live.

## Product problem
The Asset Workspace had useful depth but still looked visually generic and lacked an honest instrument-level risk/context surface. QVANIX already had a reviewed T-Invest instrument-brand boundary and verified asset price history, plus normalized bond metadata. The missing product layer was to combine those sources without introducing synthetic daily movers, annualized risk from unknown cadence, YTM/duration guesses or opaque scores.

## Implemented
1. Added official instrument identity to the Asset Workspace hero:
   - exact FIGI / instrument UID matching through the existing instrument-badges boundary;
   - reviewed T-Invest brand CDN only;
   - automatic class fallback when no official logo exists or the image fails.
2. Added a sixth focused Asset Workspace tab: Risk.
3. Added a deterministic observed price-path risk lens using only verified GetCandles history:
   - maximum observed peak-to-trough drawdown;
   - current distance from the observed historical peak;
   - observed price range;
   - source point count and calendar span.
4. Added portfolio concentration context using the current verified position weight. It is explicitly labelled as capital concentration, not risk contribution.
5. Added bond structure context when normalized broker metadata exists:
   - issuer;
   - sector;
   - country of risk;
   - maturity/perpetual flag;
   - coupon frequency;
   - fixed/floating coupon flag;
   - amortization flag;
   - nominal/currency.
6. Explicitly withholds YTM and duration because a separate verified bond cash-flow/price methodology is required.
7. The Asset Workspace remains one lazy-loaded drill-down; no sixth primary app workspace was added.
8. Six asset tabs use a compact control-level horizontal rail on narrow phones only. Page-level horizontal overflow remains prohibited.

## Methodology / trust guarantees
- No broker/server/API changes.
- No fabricated instrument logos or arbitrary image hosts.
- No annualized volatility from unknown/unchecked sampling cadence.
- No VaR claim.
- No YTM or duration guessing.
- No black-box risk score.
- No personalized buy/sell language.
- Observed price risk is retrospective context from verified price points, not a forecast.
- Conflicting asset-history series continue to fail closed before the risk lens receives them.

## Regression coverage
- Added deterministic observed-risk lens test.
- Added identity/risk contract test for official badge loading, fallback behavior, Risk tab, bond metadata and explicit YTM/duration withholding.
- Updated the existing intelligence regression to the six-tab Asset Workspace.
- Registered the new regressions in the full v3 suite.

## Validation required
- GitHub v3 build + dependency security gate.
- Full v3 tests.
- Confirm initial JS remains stable and identity/risk code stays inside the deferred Asset Workspace chunk.
- Samsung Internet + Chrome Android:
  1. official logos remain sharp and do not distort the hero;
  2. class fallback is readable when logos are unavailable;
  3. six-tab rail is usable at 360–430 px without page overflow;
  4. Risk cards remain legible across Core/Horizon/Carbon;
  5. bond structure does not create horizontal overflow for long issuer names;
  6. non-bond assets do not show bond-only structure;
  7. Back/top chrome remain stable.

## Recommended next pass
After live-device validation, improve the Asset Workspace history chart interaction itself: explicit axis labels / selected-point details and source freshness where the verified history contract can support them. Keep events and corporate actions out until an exact source boundary exists.
