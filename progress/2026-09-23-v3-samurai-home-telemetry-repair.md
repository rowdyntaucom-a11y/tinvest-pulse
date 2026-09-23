# 2026-09-23 — Samurai Home telemetry rail repair

Source: user screenshot `1000031398.jpg` with the TWR / XIRR / 12M income / asset-count block circled, plus Samsung recording `1000031400.mp4`.

## Visible defect

The right-hand telemetry rows still used a three-column grid (label / value / descriptor). On the real Samsung viewport, descriptors such as "ЛИЧНАЯ", "ВЫПЛАТЫ" and "В ПОРТФЕЛЕ" ran out of the available width and left clipped fragments at the right edge. The whole answer rail therefore looked unfinished even though the core values were readable.

## Repair

- Converted the Home pulse slab into a true two-column grid: TWR answer + telemetry stack.
- Removed absolute positioning from the right telemetry stack.
- Each telemetry row now owns only label + value in the visible rail; the redundant descriptors remain in semantic markup but are visually suppressed on phone.
- Added explicit min-width/overflow guards so no microcopy can leak past the phone edge.
- Preserved the colored node/rail language and tightened the decorative polygon away from readable values.
- Added small-screen tuning below 360px.
- No values, formulas, API behavior, trust logic, or navigation changed.
