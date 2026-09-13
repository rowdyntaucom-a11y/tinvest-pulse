# QVANIX DNA / XP Engine groundwork

## Non-negotiable rules

- DNA progression must never use absolute RUB capital as level input.
- Current portfolio quality and persistent accumulated XP are separate concepts.
- A bad market month may worsen atmosphere/current signals, but must not erase previously earned XP.
- Contribution discipline is amount-neutral: many tiny deposits must not farm more XP than the intended monthly habit credit.
- Performance contribution is capped/risk-aware so raw high return cannot dominate progression.
- Passive-income growth is relative to the user's own stable baseline and must not use a tiny denominator that creates absurd growth percentages.
- Every XP award is a versioned event with a stable id so retries cannot double-count it.
- Final level thresholds and award weights are not silently inferred from portfolio size or the current short sample; they must remain explicit/versioned.

## Current v0.1 boundary

The deterministic DNA core is intentionally split into five responsibilities:

1. `buildQualitySnapshot(...)` in `xpEngine.ts` — normalized current signals and availability/coverage only. It does not award persistent XP.
2. `xpRules.ts` — stable, versioned event factories for reviewed award rules. Contribution-habit inputs contain no deposit amount.
3. `xpPersistence.ts` — fail-closed persisted-document parser plus idempotent event merge. Existing event ids win, invalid payloads are ignored/countable, timestamps are normalized and event ordering is deterministic. It has no browser-storage, account-id or RUB-capital dependency, so a future encrypted backend/database adapter can persist the same document without changing progression math.
4. `worldState.ts` — compact resolved state boundary for the renderer; it consumes progression/quality/time/weather/events and must not recalculate financial metrics inside PixiJS.
5. `worldEventQueue.ts` — renderer-neutral semantic presentation cursor. It resolves which already-valid WorldState events are still pending, acknowledges them idempotently by stable event id, and deliberately knows nothing about animation, sound, particles, camera motion or reward amounts.

`WorldState.weather = neutral` is the fail-closed default when no reviewed weather rule has resolved an atmosphere. The renderer must not silently convert missing market state into clear/rain/storm.

## Renderer ownership and input rules

The v2 world runtime follows two strict lifecycle invariants:

**ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.**

**FINANCIAL CORE / XP RULES → RESOLVED WORLDSTATE → SEMANTIC EVENT QUEUE → PIXI RENDERER.**

`worldRuntimeOwnership.ts` owns the process-local lease. A second mounted world must fail closed instead of creating another Pixi application, canvas or ticker. Releasing an old/stale lease must never tear down a newer owner. `WorldStage.tsx` is responsible for acquiring the lease before Pixi is imported/initialized and releasing it on boot failure or React cleanup.

`WorldStage.tsx` consumes the complete already-resolved `WorldState`; it no longer accepts a naked level as its application boundary. The current temporary scene still projects only `state.level` into its placeholder geometry. `timePhase`, `weather` and semantic events are intentionally not mapped to art until the production art/animation mapping is reviewed. This prevents the render loop from inventing market logic, XP rules or atmosphere.

### Semantic event acknowledgement

`worldEventQueue.ts` stores only acknowledged semantic event ids. It does not persist Pixi objects or select a visual treatment. The cursor parser fails closed to an empty acknowledgement set when malformed, which can at worst replay a legitimate visible event but cannot silently suppress one. Acknowledgement is idempotent and deterministic, pending events preserve the ordering already resolved by `WorldState`, and newly arriving event ids remain visible without disturbing acknowledged history.

Only ids that are actually present in the current resolved `pending` queue may be acknowledged. Unknown, stale or already-acknowledged ids are ignored, so a caller cannot pre-acknowledge an id and later suppress a legitimate event that happens to receive that identity. Cursor ids are strict non-empty strings; a malformed persisted id list fails closed to the empty cursor.

The queue deliberately has no browser-storage adapter yet. Multi-user persistence belongs behind authenticated account scoping; do not place broker credentials, sensitive account data or mutable XP authority in frontend storage. Animation selection will be a separate versioned presentation mapping after the production asset pipeline is reviewed.

This boundary exists because the legacy DNA implementation accumulated multiple scene owners and update loops that could overwrite one another. The new v2 path must never restore that pattern. Financial calculations, XP rules, semantic event identity and `WorldState` resolution stay outside the Pixi render loop.

## Persistence rules

- Persistence stores versioned XP events, not a mutable `level = capital` snapshot.
- Replaying the same XP event id must never increase XP twice.
- Presenting the same semantic world event id must be separately idempotent through the event cursor.
- Invalid/corrupt persisted payloads fail closed rather than manufacturing XP or hiding legitimate events.
- A retry cannot rewrite an existing XP event with a new award; changing an XP rule requires a new rule version and therefore a new stable event id.
- Storage technology is deliberately not selected in these deterministic layers. Real multi-user persistence belongs on the backend with authenticated account scoping.

## Still gated

Final XP award weights, long-term level thresholds/economy, production persistence schema and the mapping from resolved `timePhase` / `weather` / semantic events into final art remain gated on validation. The current short portfolio history is not enough to tune a durable progression economy, and no subjective DNA art-direction changes should be inferred from this groundwork.
