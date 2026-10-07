# QVANIX v123 — Market Relative Context

- Base: merged v122 `2f87c5426c8dfb994392bca07914429a9924ec2e`.
- Extends Market Screener with same-snapshot relative context instead of adding a detached decorative dashboard.
- Computes median turnover, absolute daily move and intraday range from the current confirmed TQBR rows.
- Shows percentile position for the top turnover rows across turnover, |daily move| and range.
- Missing move/range values do not enter those distributions; invalid turnover rows fail out of the relative model.
- Percentiles are explicitly descriptive, not attractiveness scores, forecasts, recommendations or trading signals.
- Mobile layout converts the wide comparison table into labeled stacked rows with 11px secondary text.
- Regression is wired into mandatory `npm test`.
