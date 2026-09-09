# TInvest Pulse — Project Context

> Canonical project memory for future ChatGPT sessions and development work.
> Read this file together with the current `main` branch before changing the project.
> Never store API tokens, credentials or other secrets here.

## 1. Product idea
TInvest Pulse is a mobile-first personal investment dashboard for a long-term T-Bank / Tinkoff Investments portfolio. It should not look like a conventional broker terminal. The core idea is to turn dry portfolio data into an understandable, visual and living system: what is happening now, how capital is structured, what real events matter, how much passive income is generated, and how the investor progresses over years rather than trades day-to-day. The product is designed first for smartphone use and clean screenshots for Tinkoff Pulse.

## 2. Product philosophy
- Long-term investing, not trading or market-timing; horizon 10+ years; drawdowns are acceptable.
- Discussed target strategy: roughly 50% equities / 50% OFZ with regular purchases/rebalancing.
- Explain meaning, not just numbers. Percentages primary for structure/risk; rubles secondary context.
- Human-readable labels first; technical metrics can live under `Подробнее`.
- WHAT IF/scenario tools must be explicitly scenarios, not forecasts.
- Prefer INTEL `ТИХО` over invented significance from weak news.

## 3. UX / visual requirements
- Mobile-first; Samsung/Android browser is a primary real-world test environment.
- Strong visual identity, complete shells/themes, illustrations and effects rather than recoloring.
- `Пульс` presentation exists for shareable screenshots.
- Effects must never break live data/calculations/interaction.
- DNA WORLD target quality is a detailed original 2D game scene with layered depth, high readability and game-quality character/environment art.
- Stop treating schematic SVG stick-figures/basic geometry as the final visual target.

## 4. Core portfolio analytics
Important/historical requirements: total value; dates; holdings/weights; gainers/losers; real passive income excluding deposits; monthly passive income; historical chart; IMOEX comparison; CAGR/XIRR from actual history/cash flows; concentration; risk/health diagnostics; WHAT IF with non-forecast labeling. T-Bank accounts/portfolio/operations integration works. Preserve the Russian TLS/certificate-chain solution in the application server.

## 5. Passive income / payout engine
Direction by v7.9 included real T-Bank payout schedules for current holdings: 12-month schedules, deduplication, gross/tax/net, real monthly calendar. Historical validation target 4,935.78 ₽ must never be hardcoded.

## 6. INTEL — event intelligence
v6.7 Event Engine introduced portfolio-event intelligence. v6.8 Quality Engine added `ФАКТ / СИГНАЛ / ФОН / ШУМ`, source quality, company relevance, multi-ticker penalties, noise filtering and `ТИХО`. v6.9 Event Understanding strengthened real-event vs price-headline detection, facts/numbers/causal checks and event/quiet counts. Significance must come from meaningful events related to holdings.

## 7. Investor DNA / Living Portfolio / DNA WORLD
Core concept: capital becomes a living world. World language: mine/extraction, crystals/resources, workers, tools, carts/logistics, construction, workshops/warehouses, environment evolution and investor levels. Work cycle: `ДОБЫЧА → ДОСТАВКА → СТРОЙКА`.

### GAME WORLD target
- layered background/midground/foreground and atmospheric depth;
- original detailed worker sprites/models;
- idle, walk, mine, carry, load/unload, build and rest states;
- mine, rails, carts, cranes/scaffolding, workshops, storage, lights, smoke/steam, particles and crystals;
- continuous believable activity: miner extracts → resource loaded → cart delivers → builder receives → construction advances;
- capital movement inside a level changes construction progress continuously; threshold crossing unlocks meaningful world upgrade;
- financial UI remains TInvest Pulse, not a game HUD hiding real portfolio data;
- ONE WORLD → ONE RENDERER → ONE UPDATE LOOP.

### Living real-time environment — approved permanent mechanic
Capital controls **world development**, while real local time controls **world state/lighting**.
- dawn: cool sunrise, lamps gradually switch off;
- day: sun, brighter sky/environment and readable active production;
- sunset: warm golden light and long shadows, windows/lamps begin switching on;
- night: moon, stars, warm mine/workshop/window lights, fireflies and stronger local lighting;
- transitions should be gradual rather than hard reload/switches.
Implemented as v11.3 REAL-TIME WORLD using the browser/device local time, without external weather API.

### MARKET WEATHER / PORTFOLIO MOOD — approved next environment layer
Portfolio drawdown should affect weather/atmosphere, not punish the investor or stop production. The world must communicate resilience consistent with a 10+ year buy-and-hold philosophy.
- small drawdown: subtle cloud/wind change;
- moderate drawdown: rain/fog, warmer importance of local lamps;
- deep drawdown: harsher weather/atmosphere while mine, cart and construction keep operating;
- recovery: weather gradually clears;
- new portfolio high: rare short celebratory world event rather than trading-style reward spam;
- future dividends/coupons may appear as positive resources/events grounded in actual portfolio data.
System meaning: capital = development; local time = day/night; drawdown = weather/mood; recovery = clearing weather; passive income = resources/events; new high = rare celebration.

Technical direction: do not migrate the whole application. Keep Node/Express, T-Bank integration, Render and existing financial screens. Replace/evolve only the DNA WORLD renderer. First quality gate remains reference-quality Level 1 `ФУНДАМЕНТ` before scaling to Levels 2–11.

## 8. Current production state — 2026-09-09
DNA development line reached v11.3.0 REAL-TIME WORLD after v11.2 CINEMATIC COMPOSITION, v11.1 LIGHTING & DEPTH and v11.0 GAME WORLD. Historical renderer conflicts were caused by independent intervals and competing `#iwScene` rewrites. Preserve the single-renderer invariant and inspect current `main` before every DNA change. The healthy financial/main dashboard must remain frozen while DNA art evolves.

## 9. DNA level model
Thresholds: `0, 100k, 250k, 500k, 1m, 2.5m, 5m, 10m, 25m, 50m, 100m RUB`, mapping to 11 levels. Historical names: 1 ФУНДАМЕНТ, 2 ДОМ, 3 МАСТЕРСКАЯ, 4 УСАДЬБА, 5 КАПИТАЛЬНЫЙ ДОМ, 6 БАШНЯ, 7 КРЕПОСТЬ, 8 ЦИТАДЕЛЬ, 9 ГОРОД, 10 ИМПЕРИЯ, 11 ЛЕГЕНДА. Names/art can evolve if a stronger coherent progression is designed.

## 10. Implemented vs remaining
Implemented/established: live T-Bank data; portfolio positions/capital; passive-income calculations; dashboard analytics; INTEL engines; PULSE presentation; Investor DNA concept; animated Level 1; 11-level capital model; single-renderer architecture; game-world composition; lighting/depth; cinematic composition; real-time local day/night system.
Remaining priorities: reference-quality Level 1 art; MARKET WEATHER / PORTFOLIO MOOD; high-quality original characters/environment; believable production refinements; progressive construction; distinct evolution across 11 levels; deeper Portfolio DNA diagnostics; analytics validation; mobile performance.

## 11. Development/deployment architecture
Repo `rowdyntaucom-a11y/tinvest-pulse`, primary branch `main`, Render Auto-Deploy. Important files: `server.js`, `server-core.js`, `public/index.html`, historical `public/v*.js`, current DNA renderer, `production-bootstrap.js`, `render.yaml`, `package.json`, `PROJECT_CONTEXT.md`. Do not confuse root historical `index.html` with served `public/index.html`.

## 12. Working agreement
Normal feature rhythm: assistant analyzes/proposes next step → user says `Ок`/correction → assistant implements, tests, commits and pushes to `main` without asking again → user sends production screenshot → if good, discuss next step and await next `Ок`.
Bug rhythm: if screenshot shows a clear bug/regression/wrong data/version conflict, do not ask approval. Diagnose, fix, test, commit/push, then tell user what to check. Do not require repeated `Ок`.

## 13. Source-of-truth hierarchy
New chat: read `PROJECT_CONTEXT.md`; inspect current `main` and recent commits; inspect relevant files; use memory/prior-chat context for product intent. If docs/code disagree on implementation, current `main` wins; this file records intent unless user changed it. Update this file after meaningful decisions/milestones.

## 14. Safety / secrets
Never commit T-Bank API token/credentials. Keep secrets in Render/environment variables. Avoid exposing account identifiers/secrets.

## 15. Immediate next milestone
Validate **v11.3 REAL-TIME WORLD** on the user's phone at the current local time. Confirm sky state, local clock label, sun/moon, automatic mine/workshop lights, stars/fireflies and unchanged live portfolio values. If stable, implement **MARKET WEATHER / PORTFOLIO MOOD** from actual portfolio drawdown while keeping production active.
