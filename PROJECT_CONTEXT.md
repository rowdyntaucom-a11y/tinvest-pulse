# TInvest Pulse — Project Context

> Canonical project memory for future ChatGPT sessions and development work.
> Read this file together with the current `main` branch before changing the project.
> Never store API tokens, credentials or other secrets here.

## 1. Product idea

TInvest Pulse is a mobile-first personal investment dashboard for a long-term T-Bank / Tinkoff Investments portfolio. It should not look like a conventional broker terminal. The core idea is to turn dry portfolio data into an understandable, visual and living system that answers:

- What is happening with the portfolio now?
- How is capital structured and how healthy is it?
- What real business events matter for current holdings?
- How much passive income is actually being generated?
- How is the investor progressing over years rather than trading day-to-day?

The product is designed first for a smartphone and for clean screenshots that can be published to Tinkoff Pulse.

## 2. Product philosophy

- Long-term investing, not trading or market-timing.
- Investment horizon: 10+ years.
- Drawdowns are acceptable; the product should not encourage panic or speculation.
- Target strategy discussed for the portfolio: roughly 50% equities / 50% OFZ, with regular purchases and rebalancing toward target weights.
- The UI should explain meaning, not just display numbers.
- Percentages are primary where they communicate structure/risk; rubles are secondary context.
- Human-readable labels come first. Technical metrics can live under `Подробнее`.
- Scenario tools such as WHAT IF must be explicitly presented as scenarios, **not forecasts**.
- Include explanations such as `Как читать показатели` where metrics are not self-evident.
- It is better for INTEL to say `ТИХО` than invent importance from weak news.

## 3. UX / visual requirements

- Mobile-first. Samsung/Android browser is a primary real-world test environment.
- Historically the main dashboard target was one smartphone screen without unnecessary scrolling/scrollbars.
- Strong visual identity rather than simple recoloring: complete shells/themes, illustrations, effects and distinctive widget treatments.
- Desired feel: premium futuristic / game-like dashboard; earlier inspiration included PS5-style shells, scanner effects and dynamic fills.
- `Пульс` mode/button exists for a clean shareable screenshot.
- Visual effects must never break live data, calculations or interaction.
- The project may grow into several modes/screens, but each should remain understandable on mobile.

## 4. Core portfolio analytics

Important/implemented or historically required capabilities include:

- total portfolio value;
- portfolio start/current date;
- holdings and weights;
- top gainers / losers;
- passive income from real operations, excluding deposits from income;
- average monthly passive income;
- historical portfolio chart;
- comparison with IMOEX;
- CAGR / XIRR based on actual history and external cash flows;
- portfolio structure and concentration;
- risk/health diagnostics;
- scenario / WHAT IF analysis with clear non-forecast labeling.

T-Bank endpoints used by the project include accounts, portfolio and operations. Historical fixes established working access to T-Bank from Render, including the required Russian certificate chain. Do not casually replace or remove the TLS/certificate solution in `server.js`.

## 5. Passive income / payout engine

By v7.9 the project direction included a real payout engine using T-Bank schedules for current bonds/stocks:

- 12-month schedules;
- deduplication;
- gross / tax / net representation;
- real monthly payout calendar;
- validation against actual portfolio data rather than hardcoded totals.

A historical validation target was 4,935.78 ₽; it must never be hardcoded as the answer.

## 6. INTEL — event intelligence

INTEL evolved from a news feed into an event-understanding layer for portfolio holdings.

### v6.7 — Event Engine

Introduced event-oriented portfolio intelligence.

### v6.8 — Quality Engine

Added:

- `ФАКТ / СИГНАЛ / ФОН / ШУМ`;
- source-quality assessment;
- relevance checking for the specific security/company;
- penalties for broad multi-ticker roundup articles;
- filtering of `ШУМ` before the main INTEL cards;
- permission to show `ТИХО — значимых событий нет` instead of filling space with weak material.

### v6.9 — Event Understanding

Made INTEL distinguish a real business/company event from a simple price-move headline. Added stronger checks for facts, numbers and causal relationships and corrected `СОБЫТИЙ / ТИХО` logic.

INTEL principle: significance must come from a meaningful event and its relationship to the user's portfolio, not merely from a sensational headline or price movement.

## 7. Investor DNA / Living Portfolio / DNA WORLD

The major product direction after INTEL is to make the portfolio itself feel alive.

Concept: capital is represented as a world that grows and changes with the portfolio. The user should feel long-term compounding/progress visually rather than stare only at financial tables.

Current world language includes:

- mine / extraction;
- crystals/resources;
- workers;
- pickaxe/work cycle;
- cart / delivery;
- construction;
- workshop/warehouse;
- environment that evolves as capital grows;
- progression through investor levels.

The visual work cycle is conceptually `ДОБЫЧА → ДОСТАВКА → СТРОЙКА`.

The world should evolve through 11 investor levels using capital thresholds. Current level 1 is `ФУНДАМЕНТ`. The world must be driven by live portfolio capital and must not alter financial mechanics.

v8.2 PIXEL WORLD introduced a 16-bit animated mine, workers, pickaxe, cart, crystals and building stages while keeping financial mechanics unchanged.

Later DNA WORLD iterations moved toward a richer vector/sprite living scene. The intended direction is not a decorative animation only: future stages should visibly communicate investor progress, capital accumulation and world development.

## 8. Current DNA WORLD production state — 2026-09-09

Current intended visible version: **v10.2.1**.

Recent production bug: several historical renderer scripts were loaded at the same time and fought over `#iwScene`. Symptoms included the displayed world/version switching among v10.2.0, v10.2.1 and older `2D SPRITE WORLD · v8.6` while the page was open.

Root causes found:

- old renderers used independent timers (`setInterval`);
- some old renderers rewrote `#iwScene.innerHTML`;
- v960/v1021 could repeatedly reassert ownership/version;
- browser caching made stale asset URLs more visible, but cache was not the only cause;
- Render startup initially bypassed some bootstrap attempts because the canonical start path was inconsistent.

Production mitigation now uses `production-bootstrap.js` and a single-renderer strategy. At startup it removes historical DNA renderer script tags and appends one unique current renderer generated from the current v960 implementation. `package.json` and `render.yaml` were aligned to launch the production bootstrap.

Latest known single-renderer fix commit at the time this context file was created: `84ea628e4003ce3cf1f4befca7485f3bf59e6ab3`.

Important: always inspect current `main` before trusting this SHA; this section is a historical checkpoint, not a substitute for Git history.

### Current renderer invariant

**ONE WORLD → ONE RENDERER → ONE UPDATE LOOP.**

Never reintroduce several historical DNA renderer generations into production HTML. Old visual experiments can remain in the repository for history if useful, but must not all execute in production.

## 9. DNA level model

Current threshold model used by the DNA code:

`0, 100k, 250k, 500k, 1m, 2.5m, 5m, 10m, 25m, 50m, 100m RUB`

This maps to 11 levels, with names historically including:

1. ФУНДАМЕНТ
2. ДОМ
3. МАСТЕРСКАЯ
4. УСАДЬБА
5. КАПИТАЛЬНЫЙ ДОМ
6. БАШНЯ
7. КРЕПОСТЬ
8. ЦИТАДЕЛЬ
9. ГОРОД
10. ИМПЕРИЯ
11. ЛЕГЕНДА

The exact art/evolution of each level is still a design area. The system should make progression feel meaningful, not merely change a number.

## 10. What is implemented vs what remains

### Implemented / established direction

- live T-Bank portfolio/account/operations integration;
- real portfolio positions and capital;
- passive-income calculations from operations;
- multiple dashboard analytics iterations;
- INTEL Event Engine + Quality Engine + Event Understanding;
- PULSE/share-oriented presentation;
- Investor DNA / Living Portfolio concept;
- animated DNA WORLD level 1 with mine, workers, transport, construction and warehouse;
- 11-level capital progression model;
- production renderer conflict investigation and single-renderer architecture.

### Still to develop / refine

- make all 11 DNA levels visually distinct and compelling;
- define the exact evolution of mine, buildings, workers, logistics, environment and activity at each capital stage;
- make construction progress inside a level visually meaningful rather than merely cosmetic;
- deepen Portfolio DNA diagnostics (structure, concentration, resilience, income flow, risks, contribution by position, unified DNA/health score) without turning it into an opaque technical terminal;
- continue improving INTEL relevance and event understanding using real screenshots/results;
- continue validating CAGR/XIRR/history/IMOEX and passive-income calculations against real portfolio history;
- preserve a clean mobile layout while adding depth;
- eventually remove/retire obsolete historical renderer files once they are no longer needed for reference, instead of accumulating runtime patches forever.

## 11. Development / deployment architecture

Repository: `rowdyntaucom-a11y/tinvest-pulse`

Primary branch: `main`

Hosting: Render with Auto-Deploy from GitHub.

Current important files include:

- `server.js` — Express backend, T-Bank API proxy/integration, TLS handling, static serving;
- `public/index.html` — production UI entry point;
- `public/v*.js` — historical incremental UI/DNA patches; treat with care because several generations previously conflicted;
- `production-bootstrap.js` — current production normalization/single-renderer bootstrap;
- `render.yaml` — Render service configuration;
- `package.json` — Node startup configuration;
- `PROJECT_CONTEXT.md` — this canonical project memory.

Do not confuse the repository-root historical `index.html` with the actual `public/index.html` served by Express.

## 12. Working agreement with the user

This is important and should be followed in future chats.

Normal feature-development rhythm:

1. Assistant analyzes the current state and proposes the next meaningful development step.
2. User replies `Ок` (or gives corrections).
3. Assistant implements the agreed step, tests as far as available tools allow, commits and pushes it to GitHub/`main`, without asking a second time for permission to upload.
4. User sends a screenshot of production.
5. If the screenshot is good, assistant discusses the next step and waits for the next `Ок`.

Bug rhythm is different:

- If the screenshot clearly shows a bug, regression, broken layout, wrong data or version conflict, **do not ask for approval**.
- Diagnose it, fix it, test it, commit/push it, then tell the user exactly what to check.
- Do not make the user repeatedly answer `Ок` for the same bug.
- Do not say `исправляю` and then wait for another user message before actually doing the work. Finish the work in the same response/tool sequence whenever possible, then report the result.

The user explicitly wants the assistant to operate GitHub directly and does not want a manual ZIP → download → re-upload workflow for normal development.

## 13. Source-of-truth hierarchy

When a new chat starts:

1. Read this `PROJECT_CONTEXT.md`.
2. Inspect current `main` and recent commits.
3. Inspect the actual files relevant to the requested change.
4. Use prior-chat/memory context for product intent and preferences.
5. If documentation and code disagree about implementation state, **current `main` wins for what is actually deployed**, while this file wins for product intent unless the user has since changed the requirement.
6. Update this file after meaningful product decisions, architecture changes, completed milestones or roadmap changes.

## 14. Safety / secrets

- Never commit the T-Bank API token or other credentials.
- Keep tokens in Render/environment variables.
- Do not expose account identifiers or secrets in documentation/screenshots unnecessarily.

## 15. Immediate next product direction

Once the v10.2.1 renderer is confirmed stable on the user's phone, the next work is **not another version/cache patch**. Return to product development of DNA WORLD.

First design the evolution logic of the living world: what changes during level 1, what unlocks at 100k and subsequent thresholds, how workers/resources/construction communicate progress, and how to keep the scene attractive but readable on one mobile screen. Then implement after the user's `Ок`.

The goal remains: **make a long-term investment portfolio feel like a living world whose growth is driven by real capital and real portfolio events.**
