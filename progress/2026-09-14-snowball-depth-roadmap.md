# QVANIX · Snowball-like depth roadmap

Date: 2026-09-14

User direction: move QVANIX closer to the functional depth, convenience, information density and flexibility of Snowball while keeping QVANIX visual identity, deterministic calculations and the one-home-per-widget rule.

Approved priorities:
1. Exchange-style semantic instrument badges for shares, bonds, funds, currency, futures and other supported types. These are taxonomy labels, not fake exchange/issuer logos.
2. Richer charts: axes/context, interactive point detail, benchmark/period controls, event markers and readable drill-down instead of a bare line on a canvas.
3. More visual payout calendar with month-level navigation, totals and event drill-down, without duplicating the existing forecast/tax chart.
4. New Goal workspace. It must support explicit user assumptions for target capital/income, recurring contributions, contribution indexation, inflation, reinvestment and benchmark/scenario comparison. No hidden return assumptions and no fake exact goal date.
5. Keep BASE/PRO separation in mind: BASE remains useful but deliberately limited; advanced scenario depth, richer goal modelling and automation can be PRO once authenticated subscription enforcement exists.

Methodology guardrails:
- Goal calculations are deterministic and scenario-labelled, never promises.
- Reinvestment must not double-count a total-return assumption. If payout yield is modelled separately, price growth and income yield must be explicit separate inputs.
- Inflation changes the real/nominal target interpretation explicitly.
- Benchmark/index comparison uses either historical measured series or explicit user-authored future assumptions; QVANIX must not invent an expected index return.
- No full widget duplication across Portfolio / Analytics / Income / Goal.
