# Board device density v1 — 2026-09-15

## Trigger
Real Samsung device QA showed two presentation-only issues on the Board: the four context cells clipped useful status text, while the six pinned metric cards consumed too much vertical space relative to their content.

## Root cause
The mobile Board CSS kept context `strong`/`small` copy on one line with ellipsis and forced the pinned-modules surface to a `min-height` of 300px at `<=620px`.

## Change
- Keep all four context cells visible.
- Allow context value/support copy to wrap to at most two lines on phones instead of truncating immediately.
- Reduce the pinned module surface minimum height from the base 300px to 228px at `<=620px` and 216px at `<=430px`.
- Preserve the existing 3×2 module grid, labels, values, sparklines, destinations, themes and motion behavior.

## Scope guard
CSS-only. No Portfolio/Income/Analytics calculations, TWR/XIRR, IMOEX, payouts/tax, Risk/Health/Drift, broker API, backend, storage, trading behavior or DNA runtime state changed.

## Review intent
This is an evidence-based device QA correction, not another generic CSS layer. If the compact heights cause content collision on a real device, revert/tune the height rather than hiding data.
