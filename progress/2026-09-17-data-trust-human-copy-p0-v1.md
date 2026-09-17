# QVANIX Data Trust human copy P0 v1

Base: `2ae0e95d68ba2566d9c79c9b8acd4c8fc40da43e`.

Audit-driven production UX cleanup. Living World remains paused.

## Delta
- Preserve canonical Data Trust status and fail-closed semantics.
- Stop rendering raw internal source identifiers in the user-facing indicator.
- Humanize known fallback/T-Invest/MOEX source labels.
- Replace technical age wording with `Обновлено ... назад` / clear unavailable-time copy.
- Add production UX regression so raw `trust.sourceId` cannot be rendered directly.

## Guardrails
No Data Trust evaluator, eligibility, financial formula, broker/API, Metric Drill-down, navigation, Living World/Pixi, v1, security or bundle-budget changes.

## Next
Full CI, diff/race review, then continue P0 mobile floating-control consolidation from factual latest main.
