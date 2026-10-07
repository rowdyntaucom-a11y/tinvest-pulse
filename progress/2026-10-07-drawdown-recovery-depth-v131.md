# QVANIX v131 — Drawdown Recovery Depth

- Base: merged v130 `2ab927818ba3eaa7ee272f5b2eaa81be35153aa1`.
- Extends historical drawdown episodes with recovery-distribution statistics.
- Closed episodes only drive median depth, median peak-to-recovery days, median trough-to-recovery days and P90 underwater duration.
- Current open drawdown remains visible in episode counts but is excluded from recovery duration statistics to avoid censoring bias being presented as a forecast.
- Same-date conflicting portfolio values fail closed.
- Recent five closed episodes provide an auditable chronology.
- Responsive 4→2→1 KPIs plus horizontal mobile chronology.
- Historical descriptive evidence only; no predicted recovery date or recommendation.
