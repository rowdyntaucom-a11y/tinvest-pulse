# QVANIX · Income chart modes v1

Date: 2026-09-14
Starting main: `692a2018470c66b5ccd3b270460093d4822c83b1`

## Why

Continue the approved Snowball-like direction using QVANIX styling and deterministic data: one existing data block should expose multiple useful views instead of adding more static cards.

## Implemented

- `Доход → Налоги` now includes an interactive 12-month payout chart.
- The same confirmed payout schedule can be switched between `ДО НАЛОГА`, `НАЛОГ`, and `НА РУКИ`.
- Tapping a month reveals the month key, payout count, gross, tax and net together.
- No forecast is created by the chart; it only changes presentation of existing `calendar.months` data.
- Mobile uses 6 columns at tablet/phone widths and 4 columns on narrow phones, allowing vertical flow instead of shrinking labels to unreadable sizes.

## Council review

- Quant: presentation-only transformation of confirmed payout rows; FACT and 12M forecast remain separate.
- Code: local view state only; no backend/API/storage/dependency changes.
- Responsive/mobile: chart reflows to 6/4 columns and uses vertical scrolling naturally inside the taxes view; no horizontal page scroll introduced.
- Release: two runtime presentation files + checkpoint; no broker calls, credentials, trading behavior, DNA state, payment flow or final legal publication.

## Next

- Bring the same switchable-view pattern to the main Income overview where it improves readability.
- Continue Snowball-style progressive disclosure on the Board and Portfolio summary without copying Snowball visual branding.
