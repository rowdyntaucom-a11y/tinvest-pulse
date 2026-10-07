# QVANIX v133 — Income FIGI Continuity Matrix

- Surfaces existing strict FIGI continuity and source-month schedule models in the Income / Sources workspace.
- Separates current positions into FACT+FUTURE, FACT-only, FUTURE-only and no-event states.
- Adds HIGH-only source × month schedule matrix, active-cell density and peak confirmed cell.
- FACT net and FUTURE gross remain separate and are never summed.
- Unmatched/ambiguous FIGI stays outside matched rows through existing model boundaries.
- Copy explicitly warns that absence of a future event is not evidence of no future payout.
- Responsive 4→2→1 KPI layout and horizontally scrollable matrix on mobile.
