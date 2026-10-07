# QVANIX v120 — Result evidence map

- Base: v119 merged main `07d19707844b305bcb14be1d86630768be464c9c`.
- Adds a FACT-only relation map for total observed result, broker open-position P/L and confirmed realized payouts.
- Explicitly treats those metrics as non-additive: QVANIX does not derive a synthetic residual or pretend it is fee/tax/closed-trade attribution.
- Adds evidence coverage for confirmed value history and the common portfolio/IMOEX comparison window.
- Fails closed unless the portfolio is trusted and every displayed headline FACT is finite.
- No broker writes, trading actions, forecasts, target prices or personal recommendations.
- Responsive layout collapses to one readable column on phones with an 11px secondary-text floor.
- Regression suite is wired into mandatory `npm test`.
