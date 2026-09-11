# QVANIX — Weekend progress log

> Working log for autonomous development. Production remains on `main`; coherent changes are prepared on short-lived branches first, checked, then promoted only when low-risk.

## 2026-09-11 — handoff baseline

### Completed and live
- Restored real IMOEX history from MOEX ISS for the QVANIX v2 benchmark chart.
- Portfolio TWR and IMOEX are normalized to a common base; benchmark coverage/integrity is exposed instead of silently faking missing data.
- Income → Sources now includes transparent 12M Yield on Cost using confirmed gross payout schedule / current position acquisition cost.
- Payout growth is intentionally gated until two comparable annual periods exist; short history is not annualized into a fake growth rate.
- Analytics → Drift v1 added for the approved personal 50% equities / 50% bonds strategy. Thresholds: absolute drift >= 5 pp or relative drift >= 20%. Diagnostic only, never a buy/sell instruction.
- Legal readiness checklist added. Final RU/EN offer, privacy policy and separate consent texts must not be published until source documents, operator requisites and current-law review are complete.
- Analytics → Monte Carlo v1 added and deployed. Method is deterministic historical daily-return bootstrap of TWR returns with P10 / median / P90. Minimum 60 daily returns before any output; mature status from 252 returns. Current short history therefore shows an explicit waiting state rather than an invented forecast.

### Validation
- `monteCarlo.ts` passed TypeScript standalone type-check with TypeScript 5.8.3.
- Monte Carlo branch was fast-forwarded into `main` only after a small diff/release review.
- Render `tinvest-pulse-v2-preview` deploy for commit `cb079369a6273bf459352f5e91eecdbfbdd9e51c`: LIVE.
- Render `tinvest-pulse` deploy for the same commit: LIVE.

### Methodology guardrails
- Financial numbers remain deterministic and explainable; no LLM-derived calculations.
- Monte Carlo is a distribution of scenarios, not a prediction or promised return.
- Future deposits/withdrawals are not silently injected into Monte Carlo.
- DNA/XP remains independent of absolute portfolio size.
- No subjective DNA art-direction changes without user review.

### Next approved work
1. Monte Carlo UX polish and methodology drill-down if needed after mobile review.
2. Mobile one-screen cleanup, especially remaining dead space and tab density.
3. Passive-income analytics integrity/payout-growth readiness.
4. Deterministic XP Engine v1 groundwork after analytics prerequisites are stable.
5. Transaction → world-event model and share card only after XP state is defined.

### Legal blockers awaiting user documents
- RU offer.
- RU privacy policy.
- Two separate RU consent checkbox texts, not preselected.
- EN equivalents with explicit Russian-version priority wording.
- Operator legal status / INN / contact email.
- Final decision on Russian personal-data hosting and Roskomnadzor notification before public registration/real-user collection.
