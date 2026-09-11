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

`xpEngine.ts` provides two independent primitives:

1. `buildQualitySnapshot(...)` — normalized current signals and availability/coverage only. It does not award persistent XP.
2. `buildXpLedger(events)` — validates, de-duplicates and accumulates already-awarded versioned XP events. It never reads capital value.

The next implementation step is a deterministic rule layer that emits XP events from monthly contribution habit, mature Health/performance periods, validated passive-income growth and plan-adherence events. That rule layer must include anti-gaming limits before it is connected to world levels.
