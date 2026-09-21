# QVANIX v3 — Income progressive disclosure

## Why
The canonical UX direction is `FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.` and deep workspaces should expose one clear secondary selector instead of rendering every analytical layer at once. Portfolio already follows this pattern; Income still mounted its entire payout calendar/history/source surface whenever Detailed mode was enabled.

## Change
- Keep the trusted income hero, monthly average and annualized context immediately visible.
- In Detailed mode add one shared `V3SectionSelector` at the Income workspace boundary:
  - `Обзор` — ratios and human-readable methodology;
  - `Календарь и факт` — canonical deep payout surface.
- Lazy-mount `V3IncomeDepth` only when the user explicitly opens the deep section.
- Preserve the existing nested canonical selector inside Income Depth for `Календарь / Факт / Источники`.
- Preserve payout trust gates, exact-FIGI drill-down and all financial methodology unchanged.
- Add a regression contract so deep payout work cannot silently return to eager rendering.

## Trust boundary
No financial calculation, source contract, payout gate or forecast semantics changed. Untrusted data cannot open the deep payout surface.
