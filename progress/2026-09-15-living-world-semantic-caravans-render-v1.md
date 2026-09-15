# Living World — Semantic Caravans Renderer v1

Date: 2026-09-15
Branch: `chatgpt/living-world-semantic-caravans-render-v1`
Base: `262ab74e0494c4c3a79080949870d2c5671fb4be` (`main` after semantic caravan policy v1)

## Why this pass exists

The semantic caravan policy is now reviewed and isolated in `main`. This pass attaches that already-semantic presentation plan to the actual Living World renderer without adding another runtime owner, another animation clock or a financial-data path.

## What changed

- `WorldStage` now converts pending renderer snapshot events through the canonical `buildWorldEventPresentation(...)` boundary and then into the capped caravan presentation plan.
- At most two procedural fallback caravans can be visible.
- Caravans reuse the existing `logistics` scene layer; arrival glow reuses the existing `effects` layer. No new scene-layer ownership was introduced.
- Each caravan approaches a deterministic semantic destination, dwells long enough to read as an arrival, then departs.
- Destination mapping remains presentation-only: mine yard, workshop, construction yard, storehouse, settlement gate or town square.
- Event id is only a stable seed for visual phase/direction; it is not used as a financial quantity.
- Reduced motion freezes each visible caravan at its destination with a restrained arrival glow.
- The existing single Pixi ticker drives caravan motion together with atmosphere, workers and carts.
- Renderer diagnostics expose only caravan version/count, not financial event payloads.

## Data honesty

Renderer input remains `WorldRenderSnapshot` only. Caravan rendering sees semantic pending-event identity/kind already admitted to the renderer boundary; it does not read transaction amounts, portfolio value, returns, holdings, payout amounts, broker data, expectedYield or raw XP totals.

Caravans do not acknowledge, mutate or remove events. They are a visual interpretation of the existing pending queue only.

## Runtime ownership

Preserved:

- one `worldRuntimeRegistry` lease;
- one Pixi `Application`;
- one existing Pixi ticker;
- existing visibility/ResizeObserver cleanup;
- existing deferred Pixi chunk;
- existing scene-layer order.

No CSS animation loop, React animation loop or second requestAnimationFrame owner was added.

## Art boundary

The caravan body/flag/wheels and destination glow are procedural fallback geometry. They are not approved production art and do not modify the reviewed asset manifest or binary pipeline.

## Parallel Codex boundary

Codex Metric Drill-down work remains separate. This pass touches only Living World renderer/progress files and does not change metrics, ContextHelp, Board, Income, HistoryChart, navigation, Asset Workspace, Pulse or financial methodology.

## Review passes

QUANT
- no financial calculations changed;
- no daily metrics, recommendations or amount-derived visuals;
- missing/unknown future event kinds continue to fail safely through the existing generic semantic channel.

CODE
- canonical event presentation boundary reused;
- existing caravan policy reused;
- no duplicate event owner;
- existing single ticker is the only motion owner.

MOBILE
- caravan count capped at two;
- no DOM/layout changes;
- reduced motion is stationary rather than hidden;
- no additional canvas or scroll owner.

RELEASE
- branch starts at latest main after caravan policy v1;
- no binaries;
- no bundle-budget increase;
- no Codex files;
- no stale PR #342 history reused.

## Verification target

Before merge:
- TypeScript/Vite build;
- full `test:core`;
- Living World runtime-state regression;
- dependency/security gates;
- production/API checks;
- bundle budgets unchanged;
- clean diff against current main.
