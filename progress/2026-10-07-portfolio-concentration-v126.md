# QVANIX v126 — Portfolio Concentration Depth

- Base: merged v125 `a8a73be178b6f65bc765db7ba413a0a609cc7c96`.
- Converts the existing visual concentration view into explicit, auditable current-value metrics.
- Adds HHI, effective-position count (1/HHI), top-1/top-3/top-5, tail after top-5, median weight, largest/median ratio and counts above 5%/10%.
- Uses only finite positive current portfolio value; invalid/non-positive rows do not create exposure.
- Explicitly distinguishes capital concentration from correlation/factor diversification and does not recommend rebalancing.
- Responsive 4→2→1 KPI layout and compact weight rails.
- Regression wired into mandatory `npm test`.
