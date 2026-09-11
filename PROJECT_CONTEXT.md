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
Capital historically controlled **world development**, while real local time controlled **world state/lighting**. This has now evolved in v2: capital amount must NOT determine DNA level. See sections 18–19 for the XP-based model that overrides the old capital-threshold system.

## 8. Current production state — historical checkpoint 2026-09-10
Financial dashboard remains healthy. Current production checkpoint at this historical point was **v14.8.5 NATIVE ATMOSPHERIC DNA LAYER**. This section is retained for failure lessons; see the latest-state override at the end of this file for the current direction.

Samsung screenshots established several delivery/rendering failures before later architecture work. Important lesson: repeatedly stacking multiple DNA renderers, CSS loops, observers and runtime patches caused performance regressions and made version ownership unclear.

The user approved a high-quality visual direction generated during GAME ASSET PASS: environment/world assets with mountains, forest, distant illuminated city/castle, mine entrance, construction, workshop, warehouse, crane, rail/tunnel/materials; and character/prop assets with detailed miner roles, carts, cyan crystals, masonry, logs, crates, barrels, lamps, smoke, glow/particles and crane/rail props. This art direction remains preferred; do not revert to simplistic geometric SVG as the intended final look.

OpenArt was previously connected and used for an atmospheric pass, but the user currently has no paid OpenArt subscription and considers it effectively not useful for the working pipeline. Do not make the project depend on OpenArt. Figma remains available and should be used when it materially improves UI/art/system design. Do not generate or send images merely because the user says visual quality is poor; treat such feedback as an instruction to improve the project unless the user explicitly asks for image generation.

## 9. DNA level model — historical, superseded in v2
Old v1 thresholds were `0, 100k, 250k, 500k, 1m, 2.5m, 5m, 10m, 25m, 50m, 100m RUB`, mapping to 11 levels. This model is retained only as history. **Do not use absolute ruble capital to determine levels in v2.** The v2 XP model in section 18 supersedes it.

## 10. Implemented vs remaining
Implemented/established in v1: live T-Bank data; portfolio positions/capital; passive-income calculations; dashboard analytics; independent history/IMOEX architecture; INTEL engines; PULSE presentation; Investor DNA concept; 11-level capital model; multiple experiments with animated world rendering; Samsung/Android performance diagnostics; desktop responsiveness experiments.

Key remaining priorities are now being moved into v2 rather than patched indefinitely in v1: reliable analytics core, historical chart, IMOEX, TWR/XIRR/Sharpe/Sortino/health score, portfolio categories, dividend/coupon calendar, broker abstraction, future optional AI layer, and a performant living DNA WORLD.

## 11. Development/deployment architecture
Repo `rowdyntaucom-a11y/tinvest-pulse`, primary branch `main`, Render Auto-Deploy. v1 remains the production fallback and source for working T-Bank integration. Do not break v1 while v2 is under construction.

### TInvest Pulse 2.0 architecture
A clean `/v2` application now exists in the same repository and is the forward development path.
- UI: React + TypeScript + Vite.
- DNA WORLD: PixiJS/WebGL, isolated from normal financial UI rendering.
- Data: v2 initially consumes the existing stable v1 API routes.
- Responsive target: one coherent product for phone, tablet and desktop; do not simply stretch the mobile layout on desktop.
- Performance: world renderer must pause offscreen/in background, control DPR, avoid multiple concurrent renderers, and keep static scenery static.
- Future backend evolution: modular Node backend, PostgreSQL for normalized financial data, Redis/queue for broker sync/background work, encrypted read-only broker credentials.
- Distribution path: web/PWA first; later Capacitor or a dedicated mobile client only when the web core is stable.

Reference architecture source provided by user: `Архитектура_Ладья.pdf`. Product-feature synthesis sources include the HADL/Intelinvest/Snowball comparison and the later analytics/gamification documents supplied in project chats. Use them as design inputs, not as unquestioned truth where implementation/legal/current-market details need verification.

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
2. Intelligence: future optional portfolio-aware AI, market context, natural-language screeners, controlled external AI/MCP access.
3. Analytics: portfolio health score, TWR/XIRR, Sharpe/Sortino, drawdown, true diversification/look-through, bond diversification, passive-income analytics, benchmarks.
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
- `/v2` foundation is in `main`, with React + TypeScript + Vite + PixiJS/WebGL and live portfolio/history adapters.
- v2 is available both via a separate Render preview service and via the primary domain under `/v2/`; this dual path exists because the preview subdomain produced `ERR_CONNECTION_RESET` on at least one PC network while mobile worked.
- v2 mobile navigation uses functional tabs (`Портфель / Аналитика / DNA / ИИ`) rather than one long vertical page. Desktop uses a broader analytics layout.
- Historical chart now loads separately from core portfolio data so heavy history work does not block the basic dashboard.
- v1 remains available as working production/reference while v2 grows in parallel.
- Immediate v2 milestone currently underway: real analytics core (Max Drawdown, Volatility, Sharpe, Sortino, HHI, transparent Health Score v1), followed by XP Engine v1 and the new DNA WORLD state model.
- DNA WORLD population should feel alive but not crowded. Approved future life elements include male and female adults in varied roles, a small number of children as residents (never workers), sparse birds, 1–2 animals, vegetation and weather. Density should remain restrained and level-dependent.
- Level transitions should visibly communicate construction/progress without heavy effects; final stages should finish construction and remove temporary scaffolding/cranes where appropriate.
- User feedback like “quality is poor” means improve the actual project. **Do not generate/send standalone images unless the user explicitly asks for image generation.**
- The user wants the project to work well both on smartphone and desktop with preserved composition/proportions.
- When a plugin/connector could materially improve implementation, proactively search/suggest it. Existing useful connections include GitHub, Render and Figma. OpenArt should not be treated as an available paid production resource. Connecting/installing new plugins still requires the user's explicit action; avoid adding tools just for novelty.

## 18. Analytics methodology and monetization direction — approved 2026-09-11
The analytics layer should be deterministic, explainable and versioned. AI/LLM must never be the source of calculated financial numbers.

### Core methodology
- TWR: primary performance metric for benchmark comparison because it neutralizes external cash flows.
- XIRR/MWR: personal money-weighted return reflecting timing of deposits/withdrawals.
- CAGR: only where methodologically valid; do not misuse it on a portfolio with ongoing cash flows.
- Risk: annualized volatility, Max Drawdown, Sharpe, Sortino; later Beta and VaR for advanced users.
- Concentration/diversification: HHI as an explicit formula, plus `1 / HHI` as the intuitive “equivalent number of equally weighted positions”.
- Look-through: later aggregate fund constituents where reliable composition data exists.
- Health Score: transparent composite score with visible component breakdown and `calc_method` / `calc_version`; never a black box.
- Drift-based rebalancing: compare actual vs target weights and trigger when a configured absolute/relative deviation threshold is crossed. This complements the scenarios `довнести / переложить / вывести` rather than replacing them.
- Monte Carlo: preferred goal forecasting approach; show distribution (P10 / median / P90), not a fake precise date. Prefer historical bootstrap over a simplistic normal-distribution assumption when enough history exists.
- Passive-income analytics: Yield on Cost, payout growth, forecast goal progress and dividend/coupon calendar.

### Product rules
- No “magic number” without drill-down into inputs/calculation.
- Clicking XIRR/Health/HHI/Monte Carlo should reveal methodology/inputs in human-readable form.
- Health methodology must be versioned so formula changes are explainable.
- Sortino should be shown alongside Sharpe because downside risk is especially meaningful for mixed equity/bond portfolios.

### AI cost decision
The user explicitly decided to **freeze the full AI chat for the launch/MVP**. The project should first reach a monetizable product using deterministic analytics that has near-zero per-query model cost. Preserve the architecture so AI can be added later as a paid/limited feature (`Pro AI`, credits, or usage limits) funded by revenue. Rule-based explanations and alerts are allowed now because they require no LLM tokens.

### Indicative monetization split
Free should prove value with core tracking and understandable analytics (e.g. TWR/XIRR, basic HHI/Health, benchmark, calendar). Pro should monetize depth/automation (advanced risk metrics, Monte Carlo, drift rebalancing, look-through, multi-broker sync, multiple strategies/portfolios, richer reports). Exact pricing/tier boundaries remain product decisions to test later.

## 19. DNA WORLD 2.0 — XP, personalization and world-state model — approved 2026-09-11
The old idea `level = absolute capital in RUB` is rejected for v2 because it makes starting wealth determine game status. DNA WORLD must reward discipline and portfolio development in relative terms so a small and large portfolio can progress on equal rules.

### XP principles
DNA level is based on **accumulated XP**, not ruble capital. Inputs are relative/normalized, not absolute wealth:
- cumulative TWR / risk-aware performance contribution;
- contribution consistency (reward the habit, not amount: a monthly 500 ₽ deposit can count the same as 50,000 ₽);
- transparent Health Score (0–100);
- growth of passive income relative to the user’s own baseline, not absolute RUB income.

Important refinement: distinguish a current normalized quality/progress score from **persistent accumulated XP**. The source document’s illustrative `100 × weighted_norm(...)` score and the 1550+ level thresholds cannot be the same raw quantity without an accumulation rule. v2 must explicitly define this rather than copy an internally inconsistent formula.

Accumulated level XP should not collapse after one bad month. Current market state affects the world atmosphere; earned progression remains persistent. Avoid rewarding raw high TWR so strongly that users are incentivized to take reckless risk. Performance XP should be capped/risk-aware.

Consistency must be anti-gaming: award at most the intended monthly habit credit rather than allowing many tiny deposits to farm XP. Income-growth calculations need a stable baseline/floor so a tiny initial value cannot create absurd percentage growth.

### World levels
Keep the 11-step progression concept (`Фундамент → Дом → Поселение → Город → Крепость → Королевство → Столица → Цитадель → Империя → Легенда → Бесконечность`) but thresholds are XP-based and equal for all users. Level 11 becomes an ongoing/seasonal progression rather than a dead end.

### Three-layer world composition
Do NOT build separate art for every `level × weather × time` combination.
1. Base level scene / structure.
2. Lighting/time-of-day layer driven by the user’s local device/browser time (dawn/day/sunset/night).
3. Weather/event overlay driven by analytics/world-state.

Weather should update on a daily/close-of-day cadence, not twitch intraday. Drawdown can map to clear/cloud/rain/storm ranges, but negative states must remain atmospheric rather than frightening or punitive. A drawdown should never visually pressure a user into panic selling. A new all-time high may trigger a positive special layer such as aurora/fireworks.

Backend direction: a lightweight `gamification-service` or analytics module should emit compact world state JSON (`level`, `xp`, `xp_to_next`, `weather`, achievements/events/biome state); local time phase can be computed client-side. Heavy analytics is calculated in background/cache; PixiJS receives a small state object.

### Make the world personal, not decorative
- Transactions become world events: purchase → resource delivery/construction advance; dividend/coupon → caravan/gold/resource arrival; rebalancing completion → building milestone; recovery from drawdown → weather clearing.
- Portfolio composition influences biome/skin without requiring a completely separate world: bond-heavy → stone/fortress stability; dividend-heavy → gardens/harvest; growth/crypto-heavy → industrial/futuristic; diversified → trade city/port/caravans. Biomes may blend according to weights.
- Collectible landmarks record personal history: e.g. disciplined recovery from a major drawdown, a year-long contribution streak, passive-income milestones. Avoid hard-coding “never sell” as virtue; reward adherence to the user’s plan rather than blindly holding any asset.
- Sharing card should expose world/level/XP/discipline/visual identity without exposing exact capital. This is an intended organic growth channel.
- Social comparisons, if later built, should compare discipline/streak/achievements rather than wealth or raw portfolio size/return leaderboards.
- A future “portfolio spirit” companion may live inside the world and remember the user’s history, but LLM-powered personality is deferred until monetization. MVP can use rule-based comments/events with zero token cost.
- Chronicle/monthly story and friend-world/social features are later-stage ideas after real active-user density exists.

### MVP order for the flagship world
1. Analytics foundation and XP Engine v1.
2. Transactions as world events.
3. Share card without capital disclosure.
4. Rule-based portfolio companion / world commentary (LLM later if paid economics work).
5. Biomes and collectible landmarks.
6. Social/chronicle features only after product traction.

DNA WORLD should become a reason to return because it reflects the user’s own history and behavior, not merely a pretty visualization of the same numbers competitors show.
