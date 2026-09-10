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

## 8. Current production state — 2026-09-10
Financial dashboard remains healthy. Current production checkpoint is **v14.8.4 SAME-ORIGIN ATMOSPHERIC DNA ART**. `public/dna-world-engine-v141.js` remains the single production renderer, `public/dna-game-assets-v147.js` remains the single asset registry, and `public/dna-art-scene-v148.js` now points to a same-origin image route `/dna-art-v148.webp?rev=1484`.

The Samsung screenshots established three distinct delivery failures before this fix:
- v14.8.1: production dependency order was correct but the baked Base64 scene did not decode; only primitive overlays/fallback were visible.
- v14.8.2: Blob conversion still did not make the atmospheric art visible; the structured fallback rendered correctly, proving the renderer itself was alive.
- v14.8.3: direct browser loading from the OpenArt CDN also failed on the Samsung production path; again only fallback rendered.

v14.8.4 removes browser/CDN delivery from the critical path. `server.js` injects a same-origin cached proxy before the catch-all route. Render fetches the approved OpenArt scene server-side, caches the bytes in memory, serves them from `/dna-art-v148.webp`, and exposes `/api/dna-art/status` diagnostics. Render application logs confirmed the preload succeeded: **650108 bytes, `image/webp`**. This is the strongest evidence yet that the actual art bytes are now available to the production origin. All DNA URLs use `rev=1484`; finance/history logic remains unchanged.

The user approved a new high-quality art direction generated during GAME ASSET PASS. Two cohesive asset-sheet images were created/approved: (1) environment/world assets with mountains, forest, distant illuminated city/castle, mine entrance, construction, workshop, warehouse, crane, rail/tunnel/materials; (2) character/prop assets with detailed miner roles, carts, cyan crystals, masonry, logs, crates, barrels, lamps, smoke, glow/particles and crane/rail props. This art direction is now the preferred visual basis; do not revert to simplistic geometric SVG as the intended final look.

OpenArt is connected and was used for an atmospheric image-to-image pass from the user's approved reference. The desired result is explicitly **more atmospheric, larger-feeling, deeper, richer and easier on the eye**, with mountain/forest/water/city depth beyond the playable foreground.

Figma subscription reports tier **`student`** for `Роман's team` (`team::1679809924021318972`), while MCP previously reported seat **`View`**. Do not assume Figma writes are impossible solely from the seat label; test a real create/write operation when needed and report the concrete tool error if permission fails.

## 9. DNA level model
Thresholds: `0, 100k, 250k, 500k, 1m, 2.5m, 5m, 10m, 25m, 50m, 100m RUB`, mapping to 11 levels. Historical names: 1 ФУНДАМЕНТ, 2 ДОМ, 3 МАСТЕРСКАЯ, 4 УСАДЬБА, 5 КАПИТАЛЬНЫЙ ДОМ, 6 БАШНЯ, 7 КРЕПОСТЬ, 8 ЦИТАДЕЛЬ, 9 ГОРОД, 10 ИМПЕРИЯ, 11 ЛЕГЕНДА. Names/art can evolve if a stronger coherent progression is designed.

## 10. Implemented vs remaining
Implemented/established: live T-Bank data; portfolio positions/capital; passive-income calculations; dashboard analytics; independent history/IMOEX loading architecture; INTEL engines; PULSE presentation; Investor DNA concept; animated Level 1; 11-level capital model; single-renderer architecture; real-time day/night; market-weather; environment/lights/detail layers; stable production-owned version labels; mine→cart→delivery animation loop; external game-asset registry/pipeline; role-aware worker/logistics animation state machine; approved reference-quality art direction; first coherent environment/character asset sheets; atmospheric sceneBase packaging; cache-safe production ordering; structured renderer fallback; same-origin Render art proxy in v14.8.4.

Remaining priorities: validate v14.8.4 visually on Samsung/Android; once the real atmospheric base is visible, decompose approved art into independent production-ready transparent PNG/WebP sprites/layers; replace temporary SVG workers/carts with detailed animated sprites; tie visible construction progress continuously to capital; build distinct evolution across Levels 2–11; deeper Portfolio DNA diagnostics; analytics validation; mobile performance.

## 11. Development/deployment architecture
Repo `rowdyntaucom-a11y/tinvest-pulse`, primary branch `main`, Render Auto-Deploy. Important files: `server.js`, `server-core.js`, `public/index.html`, historical `public/v*.js`, `public/dna-world-engine-v141.js` (single production world renderer), `public/dna-game-assets-v147.js` (asset registry/pipeline), `public/dna-art-scene-v148.js` (scene source pointer), `production-bootstrap.js`, `render.yaml`, `package.json`, `PROJECT_CONTEXT.md`. Do not confuse root historical `index.html` with served `public/index.html`.

Important current delivery architecture: OpenArt remains the creative source, but production browser rendering should prefer **same-origin assets**. v14.8.4 proves the pattern with the cached server proxy. Long-term, final art should be stored as normal production assets rather than depending permanently on third-party hotlinks.

## 12. Working agreement
Normal feature rhythm: assistant analyzes/proposes next step → user says `Ок`/correction → assistant implements, tests, commits and pushes to `main` without asking again → user sends production screenshot → if good, discuss next step and await next `Ок`.
Bug rhythm: if screenshot shows a clear bug/regression/wrong data/version conflict, do not ask approval. Diagnose, fix, test, commit/push, then tell user what to check. Do not require repeated `Ок`.
The user does not want repeated status-only replies. After approval, continue tool work to a real checkpoint whenever possible and report the result rather than saying only “continuing”.

## 13. Source-of-truth hierarchy
New chat: read `PROJECT_CONTEXT.md`; inspect current `main` and recent commits; inspect relevant files; use memory/prior-chat context for product intent. If docs/code disagree on implementation, current `main` wins; this file records intent unless user changed it. Update this file after meaningful decisions/milestones.

## 14. Safety / secrets
Never commit T-Bank API token/credentials. Keep secrets in Render/environment variables. Avoid exposing account identifiers/secrets.

## 15. Immediate next milestone
**Validate v14.8.4 on the user's Samsung production browser.** Expected header: `INVESTOR DNA · v14.8.4`. Render has already confirmed that the same-origin proxy cached the atmospheric scene successfully at 650108 bytes / `image/webp`. The next screenshot should therefore distinguish any remaining client rendering/composition issue from network delivery.

If the atmospheric base is now visible, continue GAME ASSET PASS by splitting the baked scene into independent layers/sprites: background depth, mine, workshop/warehouse, construction/foundation, crane, workers, carts, crystals/resources, light/FX. Preserve fallbacks until each replacement group is visually validated. Do not expand Levels 2–11 until Level 1 reaches the visual quality gate.

## 16. Continuity / project memory policy
The user explicitly asks that **requirements, wishes, plans, ideas, approved/rejected visual directions, architecture constraints, bug lessons, workflow decisions and current resume point** be preserved so a new chat can continue without re-explaining the project.

Practical rule: after any meaningful product decision, visual approval, architectural change, milestone, failure lesson or roadmap change, update this file in the same development cycle. Do not rely on chat history alone. At the start of a new chat, treat this file + current `main` + recent commits as the continuity package. Keep it concise enough to remain maintainable, but complete enough to resume work accurately.