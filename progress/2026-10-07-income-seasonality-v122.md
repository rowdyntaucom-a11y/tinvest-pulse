# QVANIX v122 — Observed Income Seasonality

- Base: merged v121 `d42f6161c9100404260ab39ee55a123567e3658f`.
- Extends Income → FACT with a 12-calendar-month historical seasonality profile.
- Uses only complete observed FACT net months. Partial/unobserved months never become zeros; confirmed complete zero-income months remain real zero observations.
- Groups the same calendar month across available years and reports observation count, active-month regularity, average and median net fact.
- Requires at least three complete observations before rendering.
- Strong/quiet labels describe only observed history; no next-payment forecast or recommendation.
- Mobile matrix collapses 12 columns to a readable 4-column grid with 11px secondary copy.
- Regression is wired into mandatory `npm test`.
