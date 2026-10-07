# QVANIX v120 — Result reconciliation bridge

- Base: v119 merged main `07d19707844b305bcb14be1d86630768be464c9c`.
- Adds a FACT-only reconciliation between total observed result, broker open-position P/L and confirmed realized payouts.
- The residual is deliberately labelled “прочие реализованные эффекты”; QVANIX does not infer a separate fee, tax or closed-trade attribution without confirmed operation-level evidence.
- Signed arithmetic is preserved. Absolute magnitudes are used only to size the visual rail and are explicitly disclosed.
- The model fails closed unless every required input is finite and the portfolio snapshot is trusted.
- No broker writes, trading actions, forecasts, target prices or personal recommendations.
- Responsive layout collapses to one readable column on phones.
- Regression suite is wired into mandatory `npm test`.
