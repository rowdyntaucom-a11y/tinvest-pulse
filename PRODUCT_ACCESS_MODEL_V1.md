# QVANIX — Access Model v1

Date: 2026-09-14
Status: approved product direction; pricing amounts are not fixed here.

## 1. Product form

QVANIX is not only a personal dashboard. The target is a registered web platform: a user creates an account, connects one or more supported brokers through a read-only connection/API credential flow, receives a normalized portfolio, and then uses portfolio, analytics, income, tax and later DNA/Terminal features inside one account.

Registration, broker connection, subscriptions and account settings are therefore first-class product architecture, not an afterthought. The current single-user T-Invest setup is a development source and reference implementation, not the final multi-user security model.

Broker/API credentials must never be stored in frontend code, localStorage, repository files or analytics payloads. Future multi-user credentials must be encrypted server-side, access-scoped, auditable and read-only wherever the broker allows it.

## 2. No duplicate widgets

One metric has one canonical home. Other screens may show a compact pointer, summary number or navigation affordance, but must not reproduce the same complete widget.

Canonical ownership remains:
- Portfolio: current capital, positions, weights, current broker P/L, structure.
- Analytics: TWR/XIRR, benchmark, risk, Health, drift, Monte Carlo and advanced diagnostics.
- Income: dividends/coupons, calendar, source breakdown, YoC, tax bridge and deduction calculators.
- DNA: XP/world state and achievements.
- Terminal/Pro: advanced market/quant tools when product/data gates are met.
- Board: summary/navigation only. Board must never become a second full copy of Portfolio/Analytics/Income.

Before a new widget is added, check whether the information already has a canonical home. Prefer a drill-down link, focus switcher, compact summary or contextual badge over duplication.

## 3. Free tier — BASE

Purpose: let a new user connect a real portfolio, trust the data and understand the basic state without giving away the entire professional analytics layer.

Initial BASE policy:
- 1 user account.
- 1 connected portfolio/account for the first commercial version.
- Up to **10 portfolio instruments** included in calculations/presentation.
- Current portfolio value.
- Current positions and weights for the included instruments.
- Basic asset-class structure.
- Current broker P/L.
- Basic received passive-income fact where source data is available.
- Minimal analytics: one clear portfolio-return view and basic concentration/health context only when the underlying sample is valid.
- Basic payout/calendar preview may be shown, but deep source/tax/scenario analytics belong to Pro.
- DNA may have a basic non-paywalled identity/progression surface; monetization must not make wealth determine XP.

BASE must remain genuinely useful. Limits should be explicit, not degrade silently and not fabricate totals from a truncated set. If a calculation requires the full portfolio, the UI must state that the result is unavailable/limited rather than pretend the first 10 positions represent the full portfolio.

## 4. Paid tier — PRO

Purpose: monetize depth, automation, history and professional diagnostics, not basic access to the user's own portfolio.

Initial PRO capability direction:
- More than 10 instruments / full supported portfolio coverage.
- Multiple portfolios/accounts when multi-account backend is ready.
- Full TWR/XIRR and benchmark analysis.
- Full Health methodology and component drill-down.
- Advanced risk: volatility, Sharpe, Sortino, drawdown recovery, VaR/CVaR, rolling metrics, beta/correlation, stress.
- Monte Carlo / scenario analytics.
- Drift/rebalancing diagnostics and explicit user-authored strategy scenarios.
- Advanced bond analytics.
- Full Income sources, comparable periods, concentration, YoC and goal tooling.
- Tax bridge, gross/tax/net analysis, IIS deduction calculators and later additional verified tax tooling.
- Terminal technical indicators, user-authored alerts/screeners and later advanced Pro modules where data/legal gates allow.
- Richer exports/reports when those features are implemented.
- Future richer DNA personalization/world features may be part of Pro, but core XP fairness remains independent of absolute wealth.

Exact pricing, trial period and annual/monthly discounts are separate commercial decisions. Do not hard-code prices into calculation policy.

## 5. Entitlement behavior

Product entitlements must be deterministic and server-authoritative once authentication exists.

Rules:
- Frontend may hide/lock a feature for UX, but backend/API authorization must enforce the same entitlement.
- Do not calculate a Pro-only financial result on the server and send it to a Free client merely hidden by CSS.
- Plan state, broker-connection state and user identity are separate domains.
- Subscription loss must not delete portfolio history immediately. Define a retention/export policy before launch.
- A locked feature should explain what it does and why it is Pro, without dark patterns.
- Never put a paywall between a user and required security/privacy/account-deletion controls.

## 6. Platform architecture direction

Target account flow:
1. Landing page.
2. Registration / sign in.
3. Required legal notices and separate versioned consent events where applicable.
4. Create portfolio connection.
5. Add read-only broker/API credential through a secure backend flow.
6. Validate connection and permissions.
7. Initial sync -> normalized portfolio model.
8. QVANIX workspace.
9. Plan/entitlement service determines limits and Pro modules.
10. User can revoke broker connection, rotate credential, export/delete account data according to policy.

Future backend domains should remain separable:
- auth/users;
- broker connections/credential vault;
- broker sync and normalized portfolio data;
- analytics calculation services/jobs;
- subscriptions/entitlements;
- consent/audit ledger;
- notification preferences/alerts;
- later Terminal market-data services.

## 7. Russian UX copy rule

Public Russian UI must be written as native product copy, not literal translation from English. English is retained only for established financial abbreviations/terms where it improves recognition (for example TWR, XIRR, IMOEX, VaR/CVaR) or for deliberate QVANIX brand names.

Avoid phrases such as `live workspace`, `verified observation window`, `gross schedule`, `historical`, `preview`, `mature` inside ordinary Russian interface copy when a natural Russian phrase exists.

Preferred pattern:
- `предварительная оценка`, not `preview`;
- `зрелая выборка` or `достаточная история`, not `mature`;
- `подтверждённое окно наблюдения`, not `verified observation window`;
- `расписание до налога`, not `gross schedule`;
- `исторические данные`, not `historical` used as an adjective in English.

Technical methodology may retain English abbreviations with a short Russian explanation.

## 8. Current release guard

This document defines architecture and product policy. It does not yet activate commercial restrictions on the current development account. The current personal/test production environment must not suddenly hide holdings or analytics until authentication, entitlement state and explicit plan UX are implemented end-to-end.

## 9. Next implementation order

1. Deterministic entitlement policy boundary + regression tests.
2. RU-first copy cleanup of currently visible mixed English/Russian phrases.
3. Registration/auth architecture and server-side user identity model.
4. Secure broker-connection/credential-vault design and migration path from the current single-token environment.
5. Subscription/entitlement backend and locked-feature UX.
6. Only then enforce the 10-instrument BASE limit for real registered Free users.
