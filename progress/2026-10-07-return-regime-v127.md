# QVANIX v127 — Return Regime Map

- Base: merged v126 `96224dab434bfb5a345a3418fe1aeca8c0ec83da`.
- Extends Return analytics from aggregate TWR/volatility into the observed shape of daily TWR outcomes.
- Computes positive/negative/flat day breadth, average up/down day, up/down magnitude ratio, best/worst day and longest positive/negative streak.
- Adds a compact last-60-observation regime tape.
- Same-date conflicting TWR values fail closed; non-positive/nonfinite index points are excluded and at least 3 confirmed points are required.
- Explicitly historical/descriptive: frequencies and streaks are not probabilities or forecasts.
- Responsive 4→2→1 KPI layout; mandatory regression.
