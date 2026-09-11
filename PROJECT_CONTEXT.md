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
- Approved visual language: premium atmospheric mining/construction world at night; cool blue moonlit mountains/forest/water/distant settlement contrasted with warm amber mine/workshop/crane lighting; rich rock, wood, metal and cloth materials; the world should feel larger than the visible Level 1 district.

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
Capital controls **world development**, while real local time controls **world state/lighting**. Day/night, market-weather, environmental detail and local lights are established layers. Drawdowns alter atmosphere but never stop production; recovery clears weather; future passive-income events may become grounded resources/events.

Technical direction: do not migrate the whole application. Keep Node/Express, T-Bank integration, Render and existing financial screens. Replace/evolve only the DNA WORLD renderer. First quality gate remains reference-quality Level 1 `ФУНДАМЕНТ` before scaling to Levels 2–11.

## 8. Current production state — historical checkpoint 2026-09-10
Financial dashboard remains healthy. Current production checkpoint at this historical point was **v14.8.5 NATIVE ATMOSPHERIC DNA LAYER**. This section is retained for failure lessons; see the latest-state override at the end of this file for the current direction.

Samsung screenshots established several delivery/rendering failures before later architecture work. Important lesson: repeatedly stacking multiple DNA renderers, CSS loops, observers and runtime patches caused performance regressions and made version ownership unclear.

The user approved a high-quality visual direction generated during GAME ASSET PASS: environment/world assets with mountains, forest, distant illuminated city/castle, mine entrance, construction, workshop, warehouse, crane, rail/tunnel/materials; and character/prop assets with detailed miner roles, carts, cyan crystals, masonry, logs, crates, barrels, lamps, smoke, glow/particles and crane/rail props. This art direction remains preferred; do not revert to simplistic geometric SVG as the intended final look.

OpenArt is connected and was used for an atmospheric image-to-image pass from the user's approved reference. Figma is also connected and should be used when it materially improves UI/art/system design. Do not generate or send images merely because the user says visual quality is poor; treat such feedback as an instruction to improve the project unless the user explicitly asks for image generation.

## 9. DNA level model
Thresholds: `0, 100k, 250k, 500k, 1m, 2.5m, 5m, 10m, 25m, 50m, 100m RUB`, mapping to 11 levels. Historical names evolved during development. Current preferred conceptual progression is world-scale growth rather than small object additions. Levels must visibly differ in territory, infrastructure, population and completion state. Final levels should complete construction rather than leave permanent scaffolding/cranes everywhere.

## 10. Implemented vs remaining
Implemented/established in v1: live T-Bank data; portfolio positions/capital; passive-income calculations; dashboard analytics; independent history/IMOEX architecture; INTEL engines; PULSE presentation; Investor DNA concept; 11-level capital model; multiple experiments with animated world rendering; Samsung/Android performance diagnostics; desktop responsiveness experiments.

Key remaining priorities are now being moved into v2 rather than patched indefinitely in v1: reliable analytics core, historical chart, IMOEX, TWR/XIRR/Sharpe/health score, portfolio categories, dividend/coupon calendar, broker abstraction, future AI chat, and a performant living DNA WORLD.

## 11. Development/deployment architecture
Repo `rowdyntaucom-a11y/tinvest-pulse`, primary branch `main`, Render Auto-Deploy. v1 remains the production fallback and source for working T-Bank integration. Do not break v1 while v2 is under construction.

### TInvest Pulse 2.0 architecture
A clean `/v2` application now exists in the same repository and is the forward development path.
- UI: React + TypeScript + Vite.
- DNA WORLD: PixiJS/WebGL, isolated from normal financial UI rendering.
- Data: v2 initially consumes the existing `/api/portfolio` and other stable v1 API routes.
- Responsive target: one coherent product for phone, tablet and desktop; do not simply stretch the mobile layout on desktop.
- Performance: world renderer must pause offscreen/in background, control DPR, avoid multiple concurrent renderers, and keep static scenery static.
- Future backend evolution: modular Node backend, PostgreSQL for normalized financial data, Redis/queue for broker sync/background work, encrypted read-only broker credentials.
- Distribution path: web/PWA first; later Capacitor or a dedicated mobile client only when the web core is stable.

Reference architecture source provided by user: `Архитектура_Ладья.pdf`. Product-feature synthesis source provided by user: `Анализ_HADL_Intelinvest_Snowball.pdf`. Use them as design inputs, not as unquestioned truth where implementation/legal/current-market details need verification.

## 12. Working agreement
Normal feature rhythm: assistant analyzes/proposes next step → user says `Ок`/correction → assistant implements, tests, commits and pushes without asking again when the task is clear → user sends screenshot/video → if good, continue to the next meaningful checkpoint.

Bug rhythm: if screenshot/video shows a clear bug, regression, wrong data, version conflict or performance issue, do not ask approval. Diagnose, fix, test, commit/push, then tell the user what to check. Do not require repeated `Ок`.

The user does not want repeated status-only replies. After approval, continue tool work to a real checkpoint whenever possible and report the result rather than saying only “continuing”.

The user explicitly trusts the assistant to make implementation decisions within the agreed architecture. Do not stop the project to ask about minor choices that can be resolved safely from context.

## 13. Source-of-truth hierarchy
New chat: read `PROJECT_CONTEXT.md`; inspect current `main` and recent commits; inspect relevant files; use memory/prior-chat context for product intent. If docs/code disagree on implementation, current `main` wins; this file records intent unless user changed it. Update this file after meaningful decisions/milestones.

## 14. Safety / secrets
Never commit T-Bank API token/credentials. Keep secrets in Render/environment variables. Avoid exposing account identifiers/secrets. Future multi-user product must use read-only broker access and encrypted server-side credential storage; never store broker API keys in frontend/localStorage or the repository.

## 15. Product target expansion — investment platform
The user supplied a synthesized target concept combining strong ideas from HADL, Intelinvest and Snowball Income. Treat it as the long-term product map, not as an instruction to implement everything at once.

Target layers:
1. Data: multi-broker import, unified assets/transactions, multi-currency, manual/non-traded assets.
2. Intelligence: portfolio-aware AI chat, market context, natural-language screeners, controlled external AI/MCP access.
3. Analytics: portfolio health score, TWR/XIRR, Sharpe, drawdown, true diversification/look-through, bond diversification, passive-income analytics, benchmarks.
4. Action: scenario-based rebalancing (`перекладка`, `довнести`, `вывести`) and target allocations. Prefer scenarios/explanations over direct personalized buy/sell commands.
5. Life context: optional personal budget, later optional business finance, community/public portfolios and eventual B2B/white-label only after the core product is mature.

## 16. Continuity / project memory policy
The user explicitly asks that **requirements, wishes, plans, ideas, approved/rejected visual directions, architecture constraints, bug lessons, workflow decisions and current resume point** be preserved so a new chat can continue without re-explaining the project.

Practical rule: after any meaningful product decision, visual approval, architectural change, milestone, failure lesson or roadmap change, update this file in the same development cycle. Do not rely on chat history alone. At the start of a new chat, treat this file + current `main` + recent commits as the continuity package. Keep it concise enough to remain maintainable, but complete enough to resume work accurately.

A complete verbatim archive of every chat message is not guaranteed by the assistant. Therefore important conversation outcomes must be converted into durable project context in this repository.

## 17. Latest-state override — 2026-09-11
This section overrides stale implementation-specific instructions above when they conflict.

- v1 production reached `v15.8.0 SINGLE RUNTIME` after performance debugging. The core lesson was that stacking many generations of DNA scripts caused severe FPS degradation; never repeat that architecture in v2.
- The user approved pivoting active development to **TInvest Pulse 2.0** instead of continuing to patch v1 indefinitely.
- `/v2` foundation has been merged to `main` and its isolated build CI passed.
- v2 starts with React + TypeScript + Vite + PixiJS/WebGL and a live adapter to current portfolio API data.
- v1 remains available as working production/reference while v2 grows in parallel.
- Immediate v2 milestones: real portfolio dashboard data → historical chart/IMOEX → analytics core → performant DNA WORLD using proper assets/scene graph → later PWA/mobile packaging.
- DNA WORLD population should feel alive but not crowded. Approved future life elements include male and female adults in varied roles, a small number of children as residents (never workers), sparse birds, 1–2 animals, vegetation and weather. Density should remain restrained and level-dependent.
- Level transitions should visibly communicate construction/progress without heavy effects; final stages should finish construction and remove temporary scaffolding/cranes where appropriate.
- User feedback like “quality is poor” means improve the actual project. **Do not generate/send standalone images unless the user explicitly asks for image generation.**
- The user wants the project to work well both on smartphone and desktop with preserved composition/proportions.
- When a plugin/connector could materially improve implementation, proactively search/suggest it. Existing useful connections include GitHub, Render, Figma and OpenArt. Connecting/installing new plugins still requires the user's explicit action; avoid adding tools just for novelty.
