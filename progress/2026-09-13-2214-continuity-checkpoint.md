# QVANIX continuity checkpoint — 2026-09-13 22:14 MSK

Starting main: `bfdde195bb53038a0f84e21b27b2b54880256fbe`.

## User continuity requirement

The user explicitly requires autonomous work to preserve not only the resulting code, but also the project conversation outcomes and the assistant's development steps so a later chat can continue without repeating context.

From this checkpoint onward, every meaningful autonomous pass should preserve a dated repository checkpoint containing:
- starting `main` SHA and feature branch;
- what the user asked / approved / rejected when it materially changes the project;
- what was inspected before editing;
- what was changed and why;
- methodology/product decisions made during the pass;
- council review: quantitative/product correctness, code quality, universal responsive impact and release risk;
- tests / CI / bundle-budget results, including failures and how they were resolved;
- PR number and merge SHA when merged;
- Render preview + production cutover result;
- blockers and deferred/gated items;
- exact next safe implementation step.

This is a structured project record, not a promise to preserve a verbatim export of every chat message. Important instructions, decisions, rejections, failures and resume points must be converted into durable repository notes rather than relying on chat history alone.

## Current product principles that must survive chat changes

- Public product direction: QVANIX / КВАНИКС; legacy TInvest Pulse naming remains historical/code context.
- Universal responsive product: QVANIX must work across real-world smartphones, tablets, laptops and desktop PCs at narrow, wide, portrait and landscape browser viewports. Samsung/Android remains an important validation device, not the only target. No UI decision may depend on one fixed handset or desktop resolution. The canonical requirements are in `QVANIX_RESPONSIVE_REQUIREMENTS.md`.
- Financial numbers come only from deterministic calculations and explicit data sources; LLM is never the calculation source.
- Missing / corrupt / unsupported data fails closed.
- No system-generated personalized buy/sell recommendations and no real-money autoexecution.
- User-authored alerts, screeners, scenarios and calculators are allowed only with strict deterministic gates.
- DNA level is never based on RUB capital. XP/world progression stays relative/event-based and versioned.
- One Living World renderer / one update loop. Do not reintroduce stacked legacy renderers, CSS loops or competing scene owners.
- Subjective final art is reviewed separately; do not improve art by endlessly adding primitive Pixi/SVG geometry.
- Figma is the intended master-art workspace when editable access is available; GitHub owns runtime logic; Render publishes production.
- Final RU/EN legal documents remain blocked until the existing P0 checklist is resolved and final counsel review is complete.

## Universal responsive requirement added 2026-09-13 22:18 MSK

The user explicitly clarified that the application is for any real-world smartphone and any PC, not only the current Samsung target, and must adapt across screen resolutions. Treat this as a hard product requirement in all future UI/CSS/renderer work.

Practical consequences:
- Samsung screenshots remain useful regression evidence, but are not the design boundary.
- Narrow/foldable phones, common phones, tablets/small windows, laptops, desktop, HiDPI/4K-class and ultrawide browser viewports must be handled by fluid reflow rather than per-device hardcoding.
- Portrait/landscape, touch/keyboard, browser zoom/text scaling and safe-area/dynamic viewport behavior are part of responsive quality.
- Do not preserve one-screen density by making text unreadably small; use reflow, stacking, pagination, collapse or explicit local drill-down where appropriate.
- Avoid root/page fixed minimum widths that force horizontal scrolling on narrow devices.
- Wide desktop must use space deliberately rather than merely stretching the phone layout.

## Recent Living World work already completed

The recent autonomous sequence established the deterministic Living World pipeline rather than drawing final art prematurely:

1. Runtime-state bridge: reviewed quality + persisted XP + semantic events -> renderer-ready `WorldState`.
2. App wiring: live TWR/Health availability feeds quality coverage without inventing XP or weather.
3. Renderer presentation metadata: Russian time-phase labels and neutral presentation fields.
4. Semantic event presentation channels: `ДИСЦИПЛИНА / ЗДОРОВЬЕ / РЕЗУЛЬТАТ / ДОХОД / СТРАТЕГИЯ / ДОСТИЖЕНИЕ`, unknown -> `СОБЫТИЕ`; no sprite/color/animation/intensity inference.
5. Pixi scene layers: stable background / atmosphere / terrain / structures / characters / logistics / effects hierarchy.
6. Asset-slot contract: stable insertion points for sky, mountains, forest, mine, workshop, storage, workers, rails/carts, lighting, smoke/steam, crystals and related reviewed assets.
7. Reviewed asset manifest: only explicit local `/assets/world/...` reviewed assets are accepted; unknown slots, external URLs, traversal paths, duplicate slots and invalid provenance fail closed.
8. Resilient asset loader: one bad asset cannot blank the world; placeholder remains until a reviewed file loads successfully. A heavier Pixi `Assets` import was rejected after CI bundle-budget failure and replaced with a lighter browser preload path instead of raising the budget.
9. Chronicle v1: idempotent accumulated semantic world history; stores only stable identity/kind/time/title and never rewrites an accepted ID.
10. World memory presentation: first/last occurrence, repeat count and recent moments are derived neutrally from Chronicle without deciding how a scar/monument/building should look.
11. First-sunrise lifecycle policy: stable `world:first-sunrise` candidate appears only on an explicit dawn observation and only if Chronicle does not already contain it. It carries no XP/RUB/return/weather/art meaning.
12. Active-only phase clock: local `dawn/day/sunset/night` state now refreshes while DNA is open; the app wakes only at 05:00 / 08:00 / 17:00 / 20:00 phase boundaries instead of minute polling and does no background ticking when DNA is closed.

The current audit on this `main` already lists runtime state, live time phase, Chronicle and first sunrise as accepted deterministic DNA groundwork. Subjective world art/effects remain secondary until reviewed and until responsive/data-quality priorities are satisfied.

## Important implementation/release lessons preserved

- Production merge gate is mandatory: before every merge, BOTH Render services must be settled/healthy. If either is queued/building/updating/failed, keep working only on feature branches.
- Render auto-deploys from `main`; never manually trigger a deploy after a merge.
- Parallel work frequently advances `main`. Stale PRs must be closed/refreshed from the new head rather than force-merging and accidentally deleting parallel tests/changes.
- `v2/package.json` is a merge hotspot because many passes register tests. Refresh from current main before replacing it.
- Node `--experimental-strip-types` does not resolve some bundler-style extensionless source imports. When a pure policy needs direct Node regression, prefer a dependency-free policy module plus production adapter rather than changing application-wide import conventions.
- Do not raise the DNA bundle budget to make a feature pass. If a dependency bloats the deferred chunk, find a lighter implementation.
- Old v14/Figma SVG assets are provenance/history, not automatically approved final v2 art.
- Figma connector currently had view-only access in the recent session; do not claim write access until reverified.

## Current non-Living-World depth already present

Portfolio / Analytics / Income / Bonds contain mature deterministic groundwork including TWR, XIRR, IMOEX, drawdown, volatility, Sharpe/Sortino, HHI, Health Score, drift, Monte Carlo bootstrap, rolling/benchmark-relative analytics, historical VaR/CVaR, correlation, sourced stress, attribution, recovery diagnostics, allocation diagnostics, passive-income history/concentration/goal gating, bond maturity/issuer/sector/country/coupon/currency analytics and exact-FIGI schedule linkage where identity semantics are verified.

Terminal groundwork now includes deterministic daily OHLCV indicators, clean-provenance rules, metric-specific sample floors, user-authored alerts and user-authored ALL/ANY screeners. VWAP remains gated until verified session-aware intraday candles and volume semantics exist. No system-generated candidate ranking or trade execution is allowed.

## What remains / current blockers

### Living World
- Wire `world:first-sunrise` into a session/runtime Chronicle composition path without creating a second history owner or unsafe browser-local permanent source of truth.
- Expose Chronicle/world-memory into renderer-safe persistent-world signals suitable for future scars/milestones, still without choosing final visuals.
- Define reviewed two-layer weather/hysteresis only when deterministic source semantics are approved; do not derive weather directly from returns by guesswork.
- Final XP weights and long-term level economy remain gated on real-user/product validation.
- Replace primitive placeholder art with real reviewed layered assets once Figma/editable art workflow is available; do not auto-promote legacy SVGs.
- Later: progressive HUD/performance/accessibility polish after deterministic world behavior is stable.

### Financial / Terminal / product depth
- Start a universal responsive audit of the current shell instead of treating Samsung/mobile as the only UI boundary. Prioritize root overflow/min-width assumptions, navigation reachability, desktop reflow, dense labels, charts and Living World canvas sizing across narrow-to-ultrawide viewports.
- Continue Terminal/data-quality hardening and live-data validation before creating a separate Pro/Terminal shell.
- Keep exact received-coupon <-> scheduled-coupon reconciliation gated until shared verified event identity exists.
- Keep duration/YTM/yield-to-call gated until price/nominal/amortization semantics are verified end-to-end.
- Keep Income growth and goal-date forecasting gated until comparable history and every assumption are explicit.
- Legal publication remains blocked on existing P0 requirements.

## Immediate resume point

When the user says `продолжай`, `ок`, `делай` or equivalent, do not answer with a status-only message and wait for another confirmation.

Resume procedure:
1. Read current `main` SHA.
2. Read the six mandatory project documents from that head, including `QVANIX_RESPONSIVE_REQUIREMENTS.md` for any UI/CSS/renderer work.
3. Check BOTH Render queues before deciding whether any merge is allowed.
4. Inspect recent commits/PRs to avoid duplicating parallel work.
5. Continue one coherent approved pass on a fresh branch.
6. Run council review + CI/tests/bundle gates.
7. For UI/CSS/renderer work, validate narrow phone through desktop/ultrawide behavior instead of a single-device screenshot.
8. Recheck `main` + both Render queues immediately before merge.
9. Merge only if green and settled; then monitor both Render services to `live`.
10. Save a dated checkpoint with what was done, what failed, what is live and exactly what remains.

Nearest safe UI implementation step after this continuity update: audit the current root/shell responsive constraints beginning with `body { min-width: 320px; }`, top navigation, one-screen overflow assumptions and wide-desktop reflow, then fix one coherent responsive gap at a time without changing financial semantics.
