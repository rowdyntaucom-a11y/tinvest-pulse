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

The deterministic DNA core is intentionally split into four responsibilities:

1. `buildQualitySnapshot(...)` in `xpEngine.ts` — normalized current signals and availability/coverage only. It does not award persistent XP.
2. `xpRules.ts` — stable, versioned event factories for reviewed award rules. Contribution-habit inputs contain no deposit amount.
3. `xpPersistence.ts` — fail-closed persisted-document parser plus idempotent event merge. Existing event ids win, invalid payloads are ignored/countable, timestamps are normalized and event ordering is deterministic. It has no browser-storage, account-id or RUB-capital dependency, so a future encrypted backend/database adapter can persist the same document without changing progression math.
4. `worldState.ts` — compact resolved state boundary for the renderer; it consumes progression/quality/time/weather/events and must not recalculate financial metrics inside PixiJS.

## Renderer ownership rule

The v2 world runtime follows one strict lifecycle invariant:

**ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.**

`worldRuntimeOwnership.ts` owns the process-local lease. A second mounted world must fail closed instead of creating another Pixi application, canvas or ticker. Releasing an old/stale lease must never tear down a newer owner. `WorldStage.tsx` is responsible for acquiring the lease before Pixi is imported/initialized and releasing it on boot failure or React cleanup.

This boundary exists because the legacy DNA implementation accumulated multiple scene owners and update loops that could overwrite one another. The new v2 path must never restore that pattern. Financial calculations, XP rules and `WorldState` resolution stay outside the Pixi render loop.

## Persistence rules

- Persistence stores versioned XP events, not a mutable `level = capital` snapshot.
- Replaying the same event id must never increase XP twice.
- Invalid/corrupt persisted payloads fail closed to an empty v0.1 document rather than manufacturing XP.
- A retry cannot rewrite an existing event with a new award; changing an XP rule requires a new rule version and therefore a new stable event id.
- Storage technology is deliberately not selected in this layer. Real multi-user persistence belongs on the backend with authenticated account scoping; do not place broker credentials or sensitive account data in frontend storage.

## Still gated

Final XP award weights, long-term level thresholds/economy and production persistence schema remain gated on validation. The current short portfolio history is not enough to tune a durable progression economy, and no subjective DNA art-direction changes should be inferred from this groundwork.
