# QVANIX v118 — Strategy Lab Visual Comparison

Date: 2026-10-06

## Scope

Second large professional-tools pass. Adds a collision-free shared-scale visual comparison to the existing historical strategy laboratory without changing its financial methodology.

## Delivered

- shared-scale indexed history chart for Scenario A and B, both starting at 100;
- exact end-index values, period and point count;
- descriptive final-gap, maximum-divergence date/value, crossing count and share of observations where A is above B;
- common-scale max/current drawdown rails;
- explicit wording that observed historical path diagnostics are not forecasts, probabilities or rankings;
- no point/bubble markers; solid/dashed lines avoid overlap ambiguity;
- mobile chart heights and one-column fact cards at <=430px;
- reduced-motion/content-visibility safeguards;
- regression coverage in `strategyLabVisualComparisonV118.test.ts`.

## Preserved

Historical data source, MCFTR/RGBITR methodology, monthly rebalancing, CAGR/max drawdown/volatility math and current-snapshot scenario comparison are unchanged. No broker writes, trade actions, personalized recommendations, forecasts, DNA or Living World changes.
