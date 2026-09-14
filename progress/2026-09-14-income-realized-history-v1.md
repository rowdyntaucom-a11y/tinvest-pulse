# QVANIX · Income realized history v1

Date: 2026-09-14
Starting main: `8ef977e6f09fed67d2623d7519504b20457cc328`

## Why

Continue the Snowball-like product direction through progressive disclosure and truthful history rather than duplicated forecast widgets. After the duplicate six-month forecast chart was removed from `Доход → Обзор`, the Income workspace still needed a compact visual history of what was actually received.

## Implemented

- Added one realized monthly income chart inside `Доход → Источники`, next to existing FACT diagnostics rather than creating a new top-level section.
- The same chart switches between `ВСЕ / КУПОНЫ / ДИВИДЕНДЫ`.
- It uses only `buildRealizedIncomeHistory(...)` output and therefore only FACT payouts.
- Values are net (after tax), never mixed with the future confirmed schedule.
- Complete, partial and unverified observation months remain visually distinct.
- A zero is shown only for a complete observed month; partial/unverified months are not silently converted to zero.
- Latest available 12 history rows are shown; no missing months are synthesized outside the verified observation boundary.

## Council review

- Quant: no new calculation formula; presentation consumes the existing versioned realized-history boundary.
- Code: local component state only for chart mode; no backend/API/storage/dependency changes.
- Responsive: 12 columns desktop, 6 on medium phones/tablets and 4 on narrow phones; vertical growth is preferred over unreadably small bars.
- Release: no broker calls, credentials, trading behavior, DNA state, subscription enforcement, payments or legal publication changed.

## Product ownership

- Future confirmed payout chart remains in `Доход → Налоги` with gross/tax/net modes.
- Realized payout history lives in `Доход → Источники` because it explains where actual passive income came from.
- `Доход → Обзор` remains summary-only.

## Next

- Continue removing literal translated copy where it survives in deep analytics.
- Continue Snowball-like switchable/drill-down patterns without creating duplicate full widgets.
- Keep BASE/PRO enforcement inactive until registration, authenticated entitlements and server-side authorization exist end-to-end.
