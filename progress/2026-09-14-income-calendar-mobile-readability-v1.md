# QVANIX — Income Calendar mobile readability v1

Date: 2026-09-14
Branch: `qvanix-income-calendar-mobile-readability-v1`
Starting main: `68fe167a1d4a11fb5fdef7a8d3281dc691ce36ac`

## Scope
Presentation-only refinement of `ДОХОД → КАЛЕНДАРЬ` for narrow screens. Current mobile CSS compresses several labels to 4.9–6.5px and reduces month buttons to 43px, which harms readability and touch comfort.

## Implemented
- Raise month ribbon touch height to 46px on narrow screens while keeping horizontal density.
- Increase month label/count/amount sizes modestly and strengthen secondary text contrast.
- Increase payout amount and status-chip text in the event list without changing event layout semantics.
- Slightly widen the event tail at <=430px to avoid amount clipping.
- Improve filter-summary readability without adding another row or screen.

## Guardrails
- CSS only; no React, payout data, filtering, pagination or calculation changes.
- No new metrics, events, forecasts, normalization or value-derived visual encoding.
- No TWR/XIRR, IMOEX, Portfolio/Income/Health/Risk/Drift calculation, payout/tax logic, broker API, backend, storage, access policy, trading behavior or DNA runtime state changes.
- Active Board/Q-LENS PR #289 remains untouched.

## Release discipline
Merge only after diff review, full v2 CI, current-main race check and confirmation that no overlapping runtime change landed while this branch was under test.
