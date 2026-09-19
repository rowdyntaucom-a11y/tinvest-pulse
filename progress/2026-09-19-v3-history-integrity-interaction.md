# QVANIX v3 — history integrity + interaction

## Scope
Strengthen the Home portfolio-value history without changing financial methodology.

## Delivered
- Missing portfolio-value observations now break the chart line instead of being visually bridged.
- Invested-capital gaps follow the same fail-closed geometry rule.
- Detailed mode adds compact min/max scale context.
- Tap/pointer inspection snaps only to a real confirmed observation and exposes its date/value.
- Changing the period clears stale point selection.
- Mobile interaction preserves vertical page scrolling (`touch-action: pan-y`).

## Trust boundary
The chart remains explicitly portfolio **value**, not return. No missing observation is interpolated, no daily return is inferred, and no future/benchmark value is fabricated.

## Regression
`historyInteraction.test.ts` locks gap segmentation, nearest confirmed point selection, interaction semantics and removal of the old continuous area geometry.
