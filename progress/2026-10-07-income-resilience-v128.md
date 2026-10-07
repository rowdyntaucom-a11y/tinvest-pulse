# QVANIX v128 — Income Resilience

- Base: merged/live v127 `ad8bac217880793e96d1ae1b1dd20c6bbb71cde5`.
- Adds a FACT-only resilience layer after historical seasonality.
- Time axis: regularity, zero complete months, monthly HHI, effective payout months and largest-month share.
- Source axis: FIGI-only source HHI, effective sources, top-source share and explicit identified-net coverage.
- Unknown-source FACT remains visible through identity coverage and is not silently assigned to a source.
- Requires at least 3 complete observed months and positive complete-month FACT net.
- No future schedule is mixed into these metrics; no forecast or recommendation.
- Responsive 4→2→1 KPI layout; mandatory regression.
