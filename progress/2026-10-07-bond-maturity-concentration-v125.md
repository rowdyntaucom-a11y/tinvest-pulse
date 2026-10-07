# QVANIX v125 — Bond Maturity Concentration

- Base: merged v124 `1776469caabdb6d8b1b343af32dd34829f9b8123`.
- Extends Bond Intelligence from coarse maturity buckets to exact maturity-year concentration.
- Uses only current positive bond value and confirmed maturity dates; perpetual and undated capital remain separate instead of receiving synthetic dates.
- Reports largest maturity year, confirmed capital due within 24 months, HHI concentration by maturity year, and maximum single-issuer share inside a maturity year.
- HHI is descriptive timing concentration only, not credit quality, duration, forecast or recommendation.
- Responsive year rail + 4→2→1 KPI layout.
- Regression is wired into mandatory `npm test`.
