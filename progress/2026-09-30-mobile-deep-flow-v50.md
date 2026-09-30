# QVANIX Mobile Deep Flow v50 — 2026-09-30

This patch follows the 135-second real-device recording after v49.

The recording confirmed that the base light Core is coherent on mobile. The remaining friction is concentrated in the transition between quick and professional layers: sticky quick controls can overlap professional Analytics while scrolling, the Income overview leaves too much unused first-screen space, and Market loading still reads as an empty wait state.

## Professional Analytics transition

- The quick analytics wrapper now marks professional depth explicitly.
- When the user enters **Профи**, the quick context/switch stack is replaced by a compact **← Быстрая аналитика** handoff.
- On phone the handoff remains reachable without allowing the old sticky quick switch to sit over the professional header/content.
- The professional module keeps its own section selector and evidence hierarchy from v49.

This fixes the overlap visible in the real-device recording where the quick-layer tabs were floating over the “Профессиональная аналитика” header.

## Income overview

The overview now uses already verified values to add a compact **Контекст потока** block:
- received payouts / observed monthly average;
- 12M-equivalent / current portfolio value.

Both values are derived from existing confirmed model fields. The UI explicitly states that the second ratio is **not return and not a forecast**.

No new payout events or future cash flows are inferred.

## Market loading

The TQBR loading state now communicates useful, non-financial facts while the public source is loading:
- source boundary: MOEX TQBR;
- number of current portfolio positions that will be matched;
- explicit statement that market movement is not shown until the source confirms rows.

No placeholder prices, daily changes or synthetic market rows are rendered.

## Guardrails

- No financial methodology changed.
- No expectedYield reinterpretation.
- No missing value converted to zero.
- No trading/order actions.
- No new external data contract.
- Phone-first fixes preserve tablet/desktop composition.
- Living World / DNA remains frozen.
