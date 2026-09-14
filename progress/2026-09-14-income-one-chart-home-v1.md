# QVANIX · Income one-chart-home v1

Date: 2026-09-14
Starting main: `5dc90073d3f1f505206ab8dac8f4fdebeb9e8b28`

## Why

Continue the approved Snowball-like progressive-disclosure direction without duplicating full widgets. The Income overview had a simple six-month payout bar chart while `Доход → Налоги` already contained the richer confirmed 12-month chart with `ДО НАЛОГА / НАЛОГ / НА РУКИ` modes.

## Implemented

- Removed the duplicate six-month payout chart from `Доход → Обзор` rather than adding another visualization.
- Kept the overview as a concise summary: realized income, confirmed 12-month schedule summary and next confirmed payout.
- Renamed the overview summary from `ПОДТВЕРЖДЁННЫЙ ГРАФИК` to `ПОДТВЕРЖДЁННЫЕ ВЫПЛАТЫ` so the card does not pretend to be the chart itself.
- The richer switchable 12-month visualization remains the single full payout chart.
- Removed the unused overview chart formatter/calculation and compacted the overview grid after deleting the widget.

## Council review

- Quant: no financial formula, payout normalization or FACT/forecast boundary changed.
- Code: removed unused month-chart calculations and rendering; no backend/API/storage/dependency changes.
- Responsive/mobile: overview becomes shorter and less repetitive on phones; no horizontal page scroll introduced.
- Release: isolated Income presentation cleanup; no broker calls, credentials, trading behavior, DNA state, payment flow or final legal publication.

## Next

- Continue Snowball-like progressive disclosure with one primary home per visualization.
- Keep tightening Russian product copy where literal English-derived wording remains.
- Do not activate BASE/PRO commercial enforcement until registration, authenticated entitlements and server-side authorization are implemented end-to-end.
