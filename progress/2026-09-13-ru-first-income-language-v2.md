# QVANIX autonomous checkpoint — 2026-09-13

## RU-first Income language v2

Starting main: `ef51fc8d9a94eb16224a8c1d5376a0b882b2e154`.

### Scope
- Removed remaining unexplained English-first presentation from `Доход`: `gross`, `net`, `OBS`, `TOP SOURCE`, `MATURE/PREVIEW`, `BOND → INCOME`, `forecast`, `reconciliation`, `schedule`, `Cost basis`, `Ticker/name`.
- Replaced them with concise Russian-first wording while preserving standard technical identifiers `YoC`, `FIGI`, and `HHI`.
- Internal field names and deterministic payout calculations are unchanged.

### Methodology
- Forecast amounts remain gross / before tax internally and are now labelled `до налога` for the user.
- Realized amounts remain net / after tax internally and are now labelled `после налога` where that basis matters.
- FACT and forecast remain separate streams; no realized payment is matched to a scheduled coupon without a shared verified event identity.
- No annualization, reinvestment assumption, payout-growth forecast, goal-date forecast or recommendation was added.

### Council
- Quant: presentation-only terminology pass; payout bases, YoC denominator, coverage, observation gates, concentration math and comparable-period math unchanged.
- Code: one existing React/TypeScript presentation file changed; no API/data contract changes.
- Mobile: no new widget, row, navigation level or scroll region. Long method explanations remain inside the already scrollable explicit Sources detail.
- Release: no backend/broker route, credential, DNA, legal/payment, personalized recommendation or execution behavior changed.

### Legal
`LEGAL_REVIEW_2026-09-11.md` remains controlling and publication remains blocked. No legal or consent wording changed.

### Next safe focus
Continue RU-first cleanup in Portfolio account/source labels (`READ ONLY`, `FULL ACCESS`, `NO ACCESS`, `API WAIT`, raw status jargon) only if it can be done without adding UI density. Keep `FIGI`, `TWR`, `XIRR`, `HHI`, `VaR/CVaR` and similar professional identifiers where useful, paired with Russian meaning.
