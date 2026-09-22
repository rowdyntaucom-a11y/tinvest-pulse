# Living World checkpoint — inhabited settlement depth

Date: 2026-09-22
Starting main: `feac70afb9e858b838cd2104123216f7359216ca`.

## Goal

Continue the DNA authored-world pass after the canonical exploration camera and free preview artifact. The scene already had macro structures and ambient workers, but the middle ground still read more like progression geometry than a lived-in settlement.

## Implementation

- Added one authored `world:settlement-life` graphics layer inside the existing canonical structures layer.
- Added market canopy/stall goods, a drying line with cloth, water point, notice/shrine structure, firewood and a fence line as human-scale environmental storytelling.
- Added a restrained shared settlement glow for inhabited points; it is animated by the existing Pixi ticker only.
- Reduced-motion freezes the new glow at a stable authored state.
- No additional Pixi Application, ticker, runtime owner, timers, requestAnimationFrame loop or DOM animation was introduced.
- No fal.ai credits were used: this pass benefits from lightweight procedural detail and preserves the existing reviewed-art boundary.

## Performance / mobile

The pass adds two Graphics nodes and static geometry rebuilt only when the existing development signature changes (level/time phase/weather). Per-frame work is a single alpha assignment on the already-running ticker. No new texture downloads or blur filters were added.

## Safety boundaries

Financial methodology, broker/API, Data Trust, Pulse, formulas, progression semantics and event truth are unchanged. Settlement-life props are presentation-only and do not imply rewards or financial progress.

## Regression

Added `dnaSettlementLife.test.ts` to guard the authored layers, reduced-motion behavior and one-ticker ownership invariant. Full V3 tests/build/security remain merge gates.

## Next

After this lands, continue from factual latest main with the wanderer/samurai presence pass: stronger silhouette/material identity and context-aware micro-motion without adding runtime ownership or harming mobile performance.
