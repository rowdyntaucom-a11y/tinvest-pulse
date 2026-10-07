# QVANIX v137 — Fallen Asset Breadth

- Adds cross-series breadth above the existing per-asset drawdown scanner.
- Counts current-history rows in <=-30%, -20..-30%, -10..-20% and near-high buckets.
- Reports share of available rows at least 10% and 20% below window highs.
- Reports median distance from window high and median rebound from window low.
- Counts rows below available SMA50/SMA200 without treating missing SMA as below-average.
- Uses only rows already accepted by the existing VALID-history scanner.
- Historical breadth only; explicitly not an oversold indicator or trading signal.
