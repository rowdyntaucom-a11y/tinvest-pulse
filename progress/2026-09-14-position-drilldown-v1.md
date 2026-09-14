# QVANIX · Position drill-down v1

Date: 2026-09-14
Starting main: `ad2138f9941cd26ce44ce2c3611062dd26261e4a`

## Why

Continue the Snowball-like progressive-disclosure direction without duplicating full widgets. The existing selected-position inspector mixed current holding facts, P/L methodology and passive-income context into one dense block.

## Implemented

- Added two switchable views inside the existing selected-position inspector: `ПОЗИЦИЯ` and `ДОХОД`.
- `ПОЗИЦИЯ` keeps quantity, average/current price, current value and broker P/L in one compact view.
- `ДОХОД` reuses the existing exact-FIGI position-income boundary and exposes realized net income, share of observed realized income, confirmed 12-month gross schedule and share of the confirmed schedule.
- If a selected holding has no defensible income data, the Income view fails closed with a plain unavailable state instead of inventing a yield or forecast.
- No second portfolio widget or second income calendar was created; this is contextual drill-down for the selected holding only.

## Council review

- Quant: no calculation formula changed; current P/L and passive-income bases remain explicitly separate. FACT remains after-tax observed income; 12M remains confirmed gross schedule.
- Code: presentation state only; existing deterministic calculation boundaries are reused. No backend, broker route, storage or dependency change.
- Responsive/mobile: the two-view control replaces one dense mixed paragraph. Income detail uses four compact cells on wide screens and 2×2 on narrow phones; no horizontal page scroll.
- Release: no credentials, trading behavior, subscription enforcement, payment flow, DNA state or final legal publication changed.

## Product direction

Use this same pattern where it reduces density: one primary widget or inspector, then switchable contextual views. Do not duplicate full Portfolio / Analytics / Income widgets across workspaces.
