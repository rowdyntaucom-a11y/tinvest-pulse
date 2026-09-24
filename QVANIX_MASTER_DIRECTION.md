# QVANIX — Master Direction and Unified Roadmap

> Canonical strategic direction for QVANIX as of 2026-09-15.
> This document unifies the current product state, approved UX direction, Snowball benchmark lessons, growth/distribution roadmap, data-honesty constraints and scale architecture.
> Future ChatGPT/Codex sessions should read this document together with `PROJECT_CONTEXT.md`, current `main`, recent `progress/*.md`, `QVANIX_RESPONSIVE_REQUIREMENTS.md`, `QVANIX_DESIGN_SYSTEM.md` and `PRODUCT_ACCESS_MODEL_V1.md` before making material product changes.

> **Real-device correction — 2026-09-24:** Cosmos Home keeps the approved clean Mix C first screen, but its smooth-scroll arrow must be visible immediately without requiring a preliminary scroll. Secondary Cosmos workspaces follow the Samurai composition principle: multiple compact functional widgets may sit over art-safe zones, with deeper content below. A workspace must never collapse into one decorative card merely because data is unavailable. Fail-closed states should reveal the module architecture with unavailable values shown as unavailable, never fabricated. QVANIX product depth remains benchmarked against Snowball-level usability/functionality while preserving the deeper deterministic analytics already implemented (TWR/XIRR, benchmark, risk, holdings drill-down, income/calendar, goals/scenarios and verified asset intelligence).\n\n> **Samurai secondary parity update — 2026-09-24:** real Samsung footage `1000031561.mp4` confirmed that Goal improved, but Assets / Analysis / Income still read as stacked title + status + instrument walls. Their fail-closed first viewport now follows the same product architecture as Cosmos while keeping Samurai language: open Ronin art, compact asymmetrical chapter/status plates, one side instrument, visible actionable down cue, then verification depth below. Do not cover the central character corridor with full-width panels.\n\n> **Samurai parity update — 2026-09-24:** Cosmos currently sets the quality bar for integrated shell + deep-workspace composition. Samurai must catch up without copying Cosmos geometry: keep the approved Ronin art, reduce first-screen card coverage, use asymmetrical path/scroll instruments, and expose the same deep analytical workspaces below the first viewport. Goal is the first parity target: compact art-safe command plate, visible downward cue, full Goal Lab v2 below, and Samurai-specific material language.\n\n> **Goal depth update — 2026-09-24:** the first themed Goal viewport is a summary/command surface only. A visible arrow/smooth swipe must lead into a deep Goal Lab below it. Goal Lab should support user-authored target, horizon, monthly contributions, contribution growth, inflation adjustment, payout reinvestment, price-return and payout-yield assumptions, optional benchmark scenario, deterministic alternative-contribution solver, annual trajectory chart/table, and verified-history bootstrap. Snowball is the benchmark for flexibility/usability here, but QVANIX must keep explicit assumptions, deterministic math and clear scenario-vs-forecast boundaries.\n\n> **Priority update — 2026-09-24 (latest):** visual development remains deliberately serial. **Samurai is sufficiently mature for broad iteration to stop; preserve its approved artwork and Home composition. Cosmos is now the active shell.** Build Cosmos around the approved sharp Mix C direction as a complete interface system: vivid Blue Singularity palette, sentinel-order atmosphere, distinct geometry/material/typography/motion, and art-aware composition that keeps the singularity and guardian silhouettes readable. Do not use OpenArt and do not replace the approved Mix C artwork unless the user explicitly asks. Other shells remain paused until Cosmos reaches an accepted checkpoint.\n\n> **Priority update — 2026-09-23:** after real-device review, further Living World/DNA scene work is paused. The active presentation priority is the main workspaces and six complete, readable shell design systems. A shell must change interface material, geometry, typography, hierarchy and chrome—not merely background artwork or hue. DNA remains preserved as a first-class destination, but is not the current visual-development epic.

## 1. Product thesis

QVANIX is not trying to become a clone of Snowball Income or a generic broker dashboard.

The target position is:

**QVANIX is a portfolio intelligence product for private investors who have outgrown basic portfolio tracking and want deeper, transparent, explainable analytics without turning the product into a trading terminal.**

Snowball is an important benchmark for usability, onboarding, distribution, broker connectivity, mobile presence, portfolio switching and growth loops. It is not the center of the QVANIX brand. Public positioning should sell QVANIX on its own strengths rather than define it only as “Snowball, but deeper”.

Internal benchmark phrase is acceptable:

> “A tracker for people for whom a basic tracker is no longer enough.”

Public copy must remain respectful of competitors and must not use unverified competitor statistics, ratings, download counts, broker counts, pricing or growth claims without checking current sources.

## 2. QVANIX competitive advantage

The core competitive advantage is already the analytical layer, not a lack of metrics.

Existing/approved deterministic capabilities include substantial parts of:
- portfolio value and structure;
- TWR;
- XIRR / MWR;
- benchmark comparison with IMOEX;
- drawdown;
- volatility;
- Sharpe;
- Sortino;
- HHI / concentration;
- transparent Health Score;
- drift / target-allocation diagnostics;
- historical stress diagnostics;
- Monte Carlo bootstrap / scenario diagnostics where implemented;
- passive income analytics;
- dividend/coupon calendar and payout coverage;
- bond analytics where the data contract is verified;
- tax / IIS-related deterministic calculations where already implemented;
- Asset / Company detail foundation;
- Goal scenario foundation;
- DNA WORLD as a differentiated engagement surface.

Do not simplify or remove these capabilities merely to imitate a simpler product.

The product gap is now concentrated in four areas:
1. **Comprehension and information architecture** — deep analytics exist, but hierarchy/navigation can still make them feel harder than they are.
2. **Data onboarding and scale architecture** — current T-Invest integration works for the existing project, but a real multi-user product needs authentication, tenant isolation and secure user-owned broker connections.
3. **Distribution and retention** — public demo, product analytics, PWA/store presence, referrals, sharing and notifications.
4. **Commercial productization** — trial, Free/Pro boundaries, payments, entitlement and multi-portfolio value.

## 3. Non-negotiable methodology and data-honesty rules

QVANIX must remain deterministic, explainable and fail-closed.

### Never do the following
- Never use broker `expectedYield` as daily price change or daily return.
- Never create Daily Movers until a verified previous-session close or official daily-change contract exists for the displayed instruments.
- Never create VWAP until verified session-aware intraday price/volume semantics exist.
- Never invent YTM, duration or yield-to-call without verified price, nominal, cash-flow, amortization and call contracts.
- Never fabricate history, corporate events, payout dates or fundamentals.
- Never turn missing values into zero merely for UI convenience.
- Never present scraped/unverified fundamentals as official data.
- Never let an LLM generate financial calculation outputs that should come from deterministic code.
- Never create a black-box QVANIX score without approved and versioned methodology with visible inputs.
- Never convert drift/rebalancing diagnostics into personalized “buy/sell” instructions.
- Never add automatic trading.
- Never store broker tokens in frontend, localStorage or source control.

### Performance terminology
- TWR is the primary benchmark-comparison return where cash flows must be neutralized.
- XIRR/MWR represents the investor’s money-weighted experience with dated cash flows.
- CAGR is used only where mathematically valid; do not force it onto a portfolio with repeated contributions/withdrawals.

### Scenarios
Every forward-looking scenario must be clearly labelled as a scenario, not a forecast or promise.

## 4. Product UX principle — approved replacement for the old one-screen rule

The universal requirement “everything must fit on one phone screen with no vertical scroll” is retired.

New canonical rule:

> **FIRST SCREEN MUST ANSWER. DEPTH MAY SCROLL.**

Meaning:
- the first viewport should communicate context, key result, strongest visual and next obvious action;
- deep workspaces may and should scroll vertically when useful;
- no page-level horizontal overflow;
- do not shrink text merely to satisfy viewport height;
- avoid dense walls of equally weighted cards;
- prefer progressive disclosure: summary → visual → detail → drill-down;
- use one primary vertical scroll owner per workspace where possible.

### Workspace scroll policy
- `ПУЛЬТ`: highly compact; key state should normally be visible in the first viewport.
- `ПОРТФЕЛЬ`: vertical depth allowed.
- `АНАЛИТИКА`: vertical depth allowed.
- `ДОХОД`: vertical depth allowed.
- `ЦЕЛЬ`: vertical depth allowed.
- `ASSET / COMPANY WORKSPACE`: vertical depth allowed.
- `DNA`: immersive/world-specific interaction model may remain different.

### Horizontal scrolling
Allowed only for intentional controls such as:
- short tab rails;
- period selectors;
- compact chip rails;
- horizontal chart controls.

It must not become the primary page navigation pattern when a clearer selector/dropdown is available.

## 5. Pulse / Screenshot mode

The original “single-screen” concept is preserved as a special output mode, not as a universal application-layout constraint.

Pulse/Screenshot mode should:
- be a true viewport-fixed presentation;
- fit a phone screenshot where practical;
- hide secondary controls;
- show QVANIX identity and portfolio identity;
- present a selected set of large readable metrics;
- include one strong visual such as performance or allocation;
- use only verified data;
- never require scrolling;
- be suitable for sharing in T-Investments Pulse / Telegram / social channels.

This mode is also the foundation for future share cards and public portfolio showcases.

## 6. Information architecture direction

The problem is not “too much analytics”. The problem is exposing too much navigation structure at the same time.

### Primary navigation
Current top-level product spaces:
- Пульт / Главная
- Портфель
- Аналитика
- Доход
- Цель
- DNA

On narrow mobile, move toward a familiar, persistent primary-navigation pattern rather than a wide row of pills that wraps or clips.

Preferred direction:
- adaptive bottom navigation on phone;
- all important spaces reachable without clipped labels;
- DNA remains a first-class differentiated destination and must not disappear solely to force a five-item pattern;
- if six equal items do not remain readable at ~360 px, use a clearly designed 5+DNA pattern or another explicit adaptive treatment;
- tablet/desktop may use a different presentation of the same information architecture.

Do not treat “bottom nav with exactly five items” as a dogma. The requirement is usability, not imitation.

### Secondary and tertiary navigation
Replace forests of nested pill rows with progressive disclosure.

Preferred pattern:
- one visible section selector for the current workspace;
- a dropdown/sheet/menu can expose all second- and third-level sections;
- group deeper analytics by meaning.

Example for Risk:
- Portfolio / summary
- Historical: Stress, Windows
- Statistical: Tail Risk, Correlations
- Benchmark / comparison where relevant

Users should not need to decode clipped labels such as `Сцен.`, `Хвост`, `Связи` without context.

## 7. Naming, glossary and contextual help

Human-readable naming is mandatory.

Canonical glossary topics that require a simple explanation and, when useful, a deeper “Подробнее” layer:
- TWR — portfolio return with external cash-flow effects neutralized;
- XIRR — personal money-weighted return accounting for dated contributions/withdrawals;
- Health Score / Здоровье портфеля — transparent 0–100 composite with visible components and version;
- Хвостовые риски — extreme-loss/tail-risk context;
- Исторический шок / стресс-тест — applying a verified historical shock/scenario to the current portfolio under documented assumptions;
- Допуск по ребалансировке — how far actual allocation may deviate from target before attention is required;
- Покрытие выплат — share/coverage of payout data confirmed by the verified source boundary;
- Вне модели — assets for which no applicable target/classification model is available;
- НДФЛ к возврату / ИИС — deterministic tax-return estimate where the implemented legal/methodological boundary supports it.

Use existing `ContextHelp` infrastructure where possible. Do not scatter `?` icons beside every label. Provide contextual help at the first meaningful occurrence of complex terms and preserve a deeper explanatory layer.

## 8. Visual hierarchy and design system direction

QVANIX remains visually distinct: dark, quantitative, technological, calm and premium rather than “broker neon”.

### Hierarchy
The Pult/Home must not treat every metric as equal.

Preferred hierarchy:
1. Hero: portfolio capital / key current state.
2. Primary metrics: TWR, income, health/benchmark context where verified.
3. Secondary context: central-bank rate, freshness, source, timestamps, coverage.

Do not create a hero daily-change number until the daily-change data contract is verified.

### Typography
Readability wins over artificial density.
- Do not use 8–9 px mobile text as a normal solution.
- Labels may be compact, but must remain readable on real Samsung/Android devices.
- Establish a coherent scale for hero, primary metric, section title, body, caption and metadata.

### Semantic color
- positive: one consistent semantic positive treatment;
- negative: one consistent semantic negative/coral/red treatment;
- warning/attention: distinct from financial loss;
- neutral: separate muted hierarchy.

### Themes
Current dark-green QVANIX identity remains primary for now.
- Improve contrast and card hierarchy first.
- Do not replace the brand with a Snowball-like light theme.
- A light theme may later be implemented as a complete switchable shell for daylight/casual use.
- Final contrast values must be validated with tooling rather than assumed.

## 9. Three parallel development tracks

The project roadmap is organized into three coordinated tracks.

### TRACK A — Product Depth
Purpose: finish the analytical product before scaling traffic aggressively.

Priority areas:
- Asset / Company Workspace production maturity;
- verified instrument history;
- official fundamentals identity/data path;
- richer history charts with period controls, axes, point details and only verified events;
- asset income/risk/position drill-down;
- holdings explorer and structure dimensions;
- visual payout calendar and month drill-down;
- Goal scenario UX;
- data-quality/freshness visibility;
- reusable metric drill-down;
- verified company/asset intelligence later.

Do not add decorative features before correctness and readability.

### TRACK B — UX / Comprehension
Purpose: make existing analytical depth understandable on first use.

Priority areas:
- mobile primary navigation;
- one secondary selector instead of repeated pill rows;
- progressive disclosure for deep analytics;
- Pult hero hierarchy;
- clear Russian presentation labels;
- glossary/context help;
- contrast/readability;
- empty/loading/error/partial/stale states;
- usability tests and Samsung validation.

This track is the immediate priority before major scale/growth work.

### TRACK C — Scale / Growth
Purpose: convert a strong personal product into a real multi-user product.

Sequence:
1. public demo + minimum product analytics;
2. multi-user architecture foundation;
3. secure broker connection architecture;
4. multi-portfolio;
5. report import and manual/off-market assets;
6. trial/Free/Pro/paywall/payments;
7. PWA and later Capacitor/store wrapper;
8. sharing/referrals/public read-only showcases;
9. notifications/digests/retention loops.

Do not start several infrastructure eras in one PR.

## 10. Scale roadmap — corrected for actual QVANIX state

### Phase S0 — Public demo and product analytics
Create a public, read-only `/demo` experience using static/anonymized fixture data and no broker credentials.

Objectives:
- demonstrate real product value before sign-up;
- load quickly;
- be indexable where technically appropriate;
- include a clear but non-aggressive CTA to connect/create an account;
- instrument a minimal onboarding funnel.

Potential product events (exact stack/product decision to be audited first):
- demo_view
- signup_started / signup_completed
- broker_connect_started / broker_connected
- first_portfolio_ready
- paywall_view
- trial_started
- subscribe

Do not add a third-party analytics SDK until privacy/legal/technical impact is reviewed.

### Phase S1 — Multi-user foundation
This is the real prerequisite for external users.

Need architecture for:
- user identity/authentication;
- user-owned portfolios;
- tenant isolation;
- database model;
- encrypted secrets;
- broker connection ownership;
- auditability;
- account/data deletion;
- migration from the current personal/default portfolio without breaking deterministic analytics.

Do not retrofit user IDs piecemeal into calculations without a deliberate model boundary.

### Phase S2 — T-Invest Connect 2.0
Current T-Invest data access is a working foundation, not a missing feature.

The scale task is to turn it into a safe per-user product flow:
- read-only connection;
- choose account(s);
- initial sync;
- freshness and failure state;
- reconnect/revoke;
- multi-account support;
- background synchronization;
- encrypted server-side credential storage;
- OAuth where genuinely available/supported, otherwise a safe documented token-based flow.

Never store login/password. Never expose token in browser/client storage.

### Phase S3 — Multi-portfolio
After user/account ownership exists:
- portfolio entity and ownership;
- multiple strategies/accounts;
- active portfolio switch;
- optional aggregate “all portfolios” view;
- deterministic analytics scoped to one portfolio or explicitly aggregated under a documented methodology;
- Free/Pro entitlement can later use portfolio count.

### Phase S4 — Broker report imports and off-market assets
Build import architecture incrementally.
- Start with one actually tested format.
- Add adapters rather than one giant parser.
- Do not claim support for dozens of brokers until fixtures and regressions exist.
- Manual/off-market assets can later cover deposits, loans, real estate and custom positions under a clearly separate asset-class/data model.

### Phase S5 — Monetization
Only after identity/entitlement foundations exist.

Principles:
- Free must prove value rather than feel crippled.
- Pro monetizes depth, automation and scale.
- Do not permanently hide the very analytics required to understand QVANIX’s value before users experience them.
- A time-limited full trial may be tested.
- Payment providers for the intended market must be verified at implementation time.
- Entitlements and billing status must be server-authoritative.

### Phase S6 — Mobile presence
Sequence:
1. PWA quality and installability;
2. reliable notifications if useful/consented;
3. store wrapper only once onboarding/retention is strong enough to justify distribution.

Capacitor is a plausible future wrapper for the existing web stack, but this is an implementation choice to re-audit when the phase starts.

### Phase S7 — Growth loops
Potential product loops:
- public read-only portfolio showcase with privacy-safe percentages and no forced RUB amounts;
- Pulse/share card export;
- referral bonuses;
- shareable analytics snapshots;
- collaboration/influencer portfolio walkthroughs.

### Phase S8 — Retention
Examples:
- weekly digest;
- upcoming verified dividend/coupon event;
- rebalance-drift attention event;
- benchmark summary;
- account data freshness/problem alert.

All notifications must be useful, source-backed and user-controllable.

## 11. Growth, marketing and positioning workstream

ChatGPT/non-code work should proceed in parallel without blocking product engineering.

### Positioning
Develop:
- 2–3 target audience segments;
- concise positioning statements;
- honest comparison of QVANIX vs basic trackers vs spreadsheet workflows.

Likely segments to validate rather than assume:
- long-term IIS/private investors who care about tax and portfolio structure;
- income/dividend/bond investors who care about payout accuracy and money-weighted returns;
- risk-aware investors who care about drawdowns, stress tests and allocation control.

### Content/community
Potential channels:
- Telegram/editorial content;
- explainers for TWR/XIRR/Health/risk;
- portfolio case studies with privacy safeguards;
- IIS/tax explainers where legally/methodologically verified;
- SEO pages for portfolio-return, XIRR, rebalancing and competitor-alternative queries.

Do not invent influencer/channel names or reach numbers without fresh research.

### Onboarding copy
Need a guided demo tour around the existing “Кряхтящий фонд” fixture/demo experience, clear privacy copy and progressive CTAs.

### Referral and tariffs
Copy/mechanics should be tested after entitlement architecture exists.

### Comparative landing
A “QVANIX vs Snowball Income” page may be useful for search intent, but tone must remain respectful and claims must be current/verified.

## 12. Mobile usability validation

Samsung Internet / Android remains a primary real-device regression target.

Also reason/test for:
- ~360 px Android;
- 375 / 390 px phone widths;
- Chrome Android;
- phone landscape;
- tablet portrait/landscape;
- desktop;
- text scaling;
- safe areas/dynamic viewport.

Real screenshot/video findings outrank abstract assumptions. If a real device reveals clipped navigation, wrong scroll ownership, unavailable data or visual confusion, treat that as actionable product evidence.

## 13. Loading/data state model

The app must distinguish at least:
- LOADING
- LIVE
- PARTIAL
- STALE
- FALLBACK
- ERROR

Never show a temporary zero-value model (`0 ₽`, `0 positions`) in a way that appears to be real broker data while a request is merely pending.

Deep-data states such as fundamentals/history must also distinguish:
- loading;
- available;
- official source returned no usable data;
- unsupported identity/type;
- network/API error;
- stale/cached where applicable.

## 14. Asset Intelligence direction

One canonical Asset / Company Workspace should be reused from Portfolio, Income, Analytics and Holdings Explorer.

Immediate rules:
- render known portfolio identity/value/quantity/P&L immediately from the current snapshot;
- load history/fundamentals/income/risk independently;
- avoid request waterfalls;
- cancel stale requests;
- use canonical verified identity (`FIGI`, `instrumentUid`, asset UID as required by the source contract);
- do not match income only by ticker if exact identity is available/required;
- show provenance and honest unavailable states.

Classical fundamentals remain visible when officially available. A QVANIX score remains gated until methodology is approved.

## 15. DNA WORLD role

DNA is a differentiator, not the financial calculation engine.

Preserve:
- one renderer / one update loop;
- Pixi/WebGL isolation;
- deferred loading;
- XP-based development rather than absolute-capital status;
- restrained population density;
- premium atmospheric mining/construction art direction;
- financial UI remains usable without DNA.

Do not sacrifice analytical startup/performance or mobile navigation for decorative DNA work.

## 16. AI policy

Full AI chat remains frozen for MVP/launch unless a later explicit product decision changes this.

Reason:
- deterministic analytics should reach monetizable maturity first;
- avoid unnecessary model-query cost;
- preserve architecture for future paid/limited AI features.

Rule-based explanations, deterministic narratives and source-backed summaries are acceptable.

## 17. Development and release workflow

Normal implementation rhythm:
1. read `PROJECT_CONTEXT.md` + this master direction + relevant progress docs + current `main`;
2. audit before coding;
3. use a dedicated branch;
4. keep each Epic coherent;
5. add regression tests for new business/data logic;
6. do not weaken security/bundle/test gates;
7. run Quant / Code / Mobile / Release review passes;
8. create PR with problem/root cause/implementation/methodology/mobile/tests/bundle/release notes;
9. inspect automated review findings;
10. merge only when real correctness blockers are resolved;
11. wait for Render auto-deploy on both preview and primary;
12. verify both services are live on the same new `main` SHA;
13. write a `progress/YYYY-MM-DD-*.md` checkpoint for meaningful work.

### Bundle policy
Existing bundle budgets are hard guards. Do not raise them merely to make CI green. Lazy-load/code-split/de-duplicate instead.

## 18. Source of truth and continuity policy

For all future QVANIX chats and agent sessions, use this reading order:

1. `AGENTS.md`
2. `QVANIX_MASTER_DIRECTION.md`
3. `PROJECT_CONTEXT.md`
4. current `main`
5. latest relevant `progress/*.md`
6. `QVANIX_RESPONSIVE_REQUIREMENTS.md`
7. `QVANIX_DESIGN_SYSTEM.md`
8. `PRODUCT_ACCESS_MODEL_V1.md`
9. feature-specific methodology/docs

If code and old documentation disagree about current implementation, current `main` wins.
If a newer explicit user decision conflicts with this file, the newer decision wins and this file should be updated in the same development cycle.

Do not rely only on chat memory for major project decisions. Convert important decisions into repository documentation.

## 19. Current priority order — 2026-09-15

### Immediate
1. finish current Samsung/Asset/Pulse runtime validation;
2. execute **UX Architecture + Comprehension Epic**;
3. validate the redesigned navigation and hierarchy on Samsung with video;
4. continue Product Depth gaps exposed by real-device testing.

### Next major product phase
5. **Scale Foundation Epic**: public demo + multi-user architecture design + secure broker connection boundary;
6. then implement multi-user foundation in small gated PRs;
7. then multi-portfolio / import / monetization / PWA / growth loops in separate phases.

Do not skip the UX comprehension pass and jump directly into acquisition-scale infrastructure.

## 20. Definition of product direction

A successful QVANIX should feel like this:

- On first open, the investor understands the important state in seconds.
- Deeper analytics are available without being visually dumped on the user.
- Every number can be traced to a deterministic source/methodology.
- Missing data is admitted rather than fabricated.
- Mobile navigation is familiar and calm.
- The product remains visually recognizably QVANIX rather than a Snowball clone.
- A sophisticated investor can drill much deeper than in a basic tracker.
- A new investor can still understand the words and navigation.
- The product can later scale to real users without compromising security or methodology.
- Distribution, monetization and engagement are built around a strong product rather than used to hide weak fundamentals.
