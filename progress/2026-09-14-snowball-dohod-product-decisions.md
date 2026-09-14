# QVANIX — Snowball / ДОХОДЪ product decisions — 2026-09-14

This note preserves the latest user-approved direction so parallel/future chats can continue from GitHub rather than relying on chat history.

## Product target
- Move QVANIX closer to Snowball Analytics in functionality, usability, information density, flexible drill-down and switchable views, while preserving QVANIX visual language and deterministic methodology.
- Do not copy Snowball UI literally. Prefer one primary widget/home with switchable views and drill-downs over duplicated full widgets.
- Vertical depth/scroll is acceptable when it improves readability; do not over-compress mobile typography to force everything onto one screen.

## Real instrument badges / logos
- User wants every portfolio/security/instrument to show a recognizable real exchange/issuer-style badge/logo where a defensible source provides it: shares, bonds, funds and other supported instruments.
- Do not replace recognizable issuer/instrument logos with invented QVANIX class abbreviations when a real logo is available.
- Use a deterministic fallback badge by asset class only when no verified logo exists.
- Current T-Invest instrument normalization already preserves FIGI, instrument UID, ticker, name and instrument type; logo/brand enrichment should be added through a reviewed data boundary rather than a manually maintained visual guess-list.
- Commercial/public redistribution and logo/data licensing must be reviewed before multi-user launch. Current personal prototype must not imply that availability through a broker API grants unrestricted redistribution rights.

## Charts and payout calendar
- Charts should become information-rich, not just a line on an empty canvas: readable axes/context, tap/click point detail, date/value, useful reference levels, verified event markers, periods and switchable views where they answer distinct questions.
- Keep mobile legibility and avoid page-level horizontal scrolling.
- Payout calendar should become a first-class visual scenario: a clear month timeline/heat/intensity layer plus event list/detail. It should answer “when and what is expected/received”.
- Status provenance matters. Confirmed vs estimated must be visually explicit if/when an estimated-event methodology is implemented. Do not invent estimated dates from historical patterns until a reviewed deterministic source/method exists.
- Tax gross/tax/net analysis remains a separate semantic home; do not duplicate the same full chart in Calendar and Taxes.

## Goal workspace
- Add a flexible Goal workspace on top of the accepted deterministic `goalProjection` boundary.
- User-authored assumptions may include current capital, target in today’s RUB, horizon, monthly contributions, contribution indexation, inflation, price return, payout yield, reinvestment and optional benchmark/index return.
- Price return and payout yield remain separate so reinvestment cannot silently double-count total return.
- Output is a scenario, not a forecast or promise. Show nominal target, real/today-RUB ending capital, own contributions, reinvestment effect and benchmark scenario where explicitly supplied.

## Snowball audit adoption
User supplied `Консилиум_Аудит_Snowball.pdf`. Treat it as a design/methodology input. Highest-value accepted directions include:
- cross-workspace category/asset filtering in Analytics;
- switchable column/view presets rather than duplicated tables;
- richer diversification dimensions from one holdings dataset;
- distinct Portfolio History vs Current Assets History questions;
- transaction-aware benchmark simulation as a future quant pass rather than naive line overlay;
- portfolio-level cash-accounting mode because it changes XIRR semantics;
- dedicated company/security page reachable consistently from portfolio/calendar/screener;
- more capable rebalancing/top-up scenarios without turning calculations into system-generated buy/sell advice;
- dedicated, visual payout calendar with provenance/status.

Do not blindly copy every Snowball dashboard duplication. QVANIX no-duplication rule remains stronger.

## Russian fundamentals / ДОХОДЪ direction
- User proposes `ДОХОДЪ` (dohod.ru) as the main Russian reference for dividend/fundamental analytics.
- Dividend/company fundamentals are moved from “indefinitely gated” to an **investigate / PRO candidate** state, subject to source rights, data reliability and reproducible ingestion.
- QVANIX must not simply scrape/rebroadcast a third-party commercial site without verifying terms/licensing. If automated use is not permitted, use licensed/official issuer/exchange sources for equivalent inputs.
- A future dividend sustainability layer may use verified classical inputs such as dividend yield, DSI/history, payout ratio, DPS/growth, ROE/ROCE, leverage/debt, FCF, revenue/profit dynamics and related fundamentals when source semantics are verified.

## Classical metrics and QVANIX interpretation — permanent rule
- QVANIX scores/labels must never replace classical financial metrics.
- The same verified dataset should support two views in a company/security financial page:
  1. `ОЦЕНКА QVANIX` — human-readable interpretation (for example payout sustainability and component scores).
  2. `ПОКАЗАТЕЛИ` — classical financial names, values, units, periods and source dates.
- A QVANIX component score must drill down to the exact classical metrics used to produce it. No black-box score.
- Experienced users must be able to ignore QVANIX interpretation and work in a classical analytics view.
- Examples of classical metrics to expose when verified: Dividend Yield, DSI, Payout Ratio, DPS/CAGR, ROE, ROCE, P/E, P/BV, EV/EBITDA or source-equivalent valuation ratios, Net Debt/EBITDA, FCF, revenue, EBITDA, net income and margins.
- Do not fabricate unavailable metrics or silently substitute one ratio for another.

## Near-term sequence
1. Real verified AssetBadge/logo enrichment with safe fallback and licensing note.
2. More visual payout calendar and status/provenance presentation.
3. Visible Goal workspace v1 on the existing deterministic projection engine.
4. Richer company/security drill-down and classical/QVANIX dual-view architecture.
5. Cross-Analytics filters and richer switchable tables/views.
6. Transaction-aware benchmark simulation and portfolio cash-accounting mode after methodology/data review.
7. Fundamentals/Dividend Rating research using ДОХОДЪ as Russian reference, but only with defensible data rights and transparent classical inputs.
