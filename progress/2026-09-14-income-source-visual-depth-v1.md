# QVANIX — Income Sources visual depth v1

Date: 2026-09-14
Branch: `qvanix-income-source-visual-depth-v1`
Starting main: `9844569a5ac11f53b7c0853bd7561f54b685878e`

## Scope
Presentation-only refinement of `ДОХОД → ИСТОЧНИКИ` on the current production line. The existing source rows already expose fact, confirmed 12M schedule and YoC; this pass changes only their visual hierarchy so those meanings are easier to distinguish on a phone.

## Implemented
- Turn the source table into a compact ledger surface instead of three visually equivalent text columns.
- Give `Получено` a quiet realized/fact lane and `12М / YoC` a distinct mint-tinted forward-schedule lane.
- Add a stable vertical separator between realized and forward-looking values, clearer row grouping and stronger header alignment.
- Tighten the same hierarchy at <=760px and <=430px without adding another screen, horizontal page scroll or animation.

## Guardrails
- CSS only; no React/data helper changes.
- No new metric, ratio, ranking, normalization or value-derived bar is introduced.
- Fact and forecast values are not combined or reinterpreted.
- No TWR/XIRR, IMOEX, Portfolio/Income/Health/Risk/Drift calculation, payout/tax logic, broker API, backend, storage, access policy, trading behavior or DNA runtime state changes.
- Active Board/Q-LENS copy PR #289 is intentionally untouched.

## Release discipline
Merge only after diff review, full v2 CI, current-main race check and confirmation that no overlapping runtime change landed while this branch was under test.
