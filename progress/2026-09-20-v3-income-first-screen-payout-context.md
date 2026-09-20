# QVANIX v3 — Income first-screen payout context

## Decision
The simple Income workspace now answers both sides of the income story: already-realized passive income remains the primary fact, while a compact future payout context is shown only when the existing canonical payout trust boundary says the official 12-month schedule is safe to calculate.

## Implementation
- Added lazy `V3IncomePreview` for Simple mode.
- Reused `buildV3IncomeDepth` / `evaluatePayoutTrust`; no new financial methodology or forecast formula was introduced.
- Shows next verified event, its gross amount when available, and official 12-month scheduled gross/count.
- If schedule coverage is incomplete, stale, unavailable or invalid, future amounts fail closed and the realized-income figures remain separate.
- Explicitly labels future schedule as non-forecast and never adds it to realized income.
- Responsive layout collapses from 3 columns to 2 and then 1 without microscopic labels.

## Guardrails
No `expectedYield`, inferred dividends, invented dates, zero-filling or personalized buy/sell guidance. Detailed mode retains the canonical full calendar/history/source workspace.
