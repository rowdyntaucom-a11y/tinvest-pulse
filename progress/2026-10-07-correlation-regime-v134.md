# QVANIX v134 — Correlation Regime

- Extends pairwise risk correlations with historical regime comparison.
- Uses exact common return dates across all matched risk series.
- Splits common history into two sequential halves and recalculates Pearson correlation per pair.
- Compares median absolute correlation and counts pairs with meaningful |rho| increase/decrease (>0.05).
- Surfaces largest historical strengthening and weakening pair.
- Requires at least 20 common returns and 10 observations per half; otherwise remains unavailable.
- Historical descriptive structure only; no assumption that the latest regime persists.
