# QVANIX · Goal projection foundation v1

Date: 2026-09-14

## Purpose
Prepare the deterministic calculation boundary for the requested future `ЦЕЛЬ` workspace. This is deliberately separated from UI so the scenario math can be tested before exposing controls.

## Inputs
All future-looking values are explicit user-authored assumptions:
- current capital;
- target capital in today's rubles;
- horizon in years;
- monthly contribution;
- annual contribution indexation;
- annual inflation;
- annual price-return assumption;
- annual payout-yield assumption;
- reinvest payouts on/off;
- optional annual benchmark/index return assumption.

## Important modelling rule
Price return and payout yield are separate assumptions. Reinvestment adds the explicitly modelled payout stream back to capital; when reinvestment is off, payouts accumulate separately. This avoids silently treating a total-return assumption as both price growth and reinvested income.

Inflation explicitly grows the nominal target and also produces real ending capital in today's-ruble terms. Optional benchmark growth is a separate user-authored scenario using the same contribution stream; QVANIX never invents a future index return.

## Output
The boundary returns yearly scenario points, ending nominal/real capital, inflation-adjusted target, contribution total, payouts kept outside the portfolio, optional benchmark ending capital and the first month where the scenario crosses the inflation-adjusted target.

The crossing month is a scenario result, not a promised forecast date.

## Gates
Invalid/non-finite inputs fail closed. Horizon is limited to 1–50 years. Payout yield is limited to 0–100% annually. Rates below −100% are rejected.

## Next integration
Build the visible Goal workspace on top of this boundary with clear `СЦЕНАРИЙ, НЕ ПРОГНОЗ` labelling, flexible controls, a detailed trajectory chart and BASE/PRO access policy. Do not duplicate Income goal widgets: the current compact annual passive-income goal should become a contextual link/summary once the broader Goal workspace is accepted.
