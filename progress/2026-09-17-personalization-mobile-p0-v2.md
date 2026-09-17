# QVANIX Personalization mobile P0 v2

Base: `4b1c9f88ea4d34e18efd6def980bd90785bf33c8`.

Priority follows the UI audits and Samsung screen-recording feedback. Living World development is paused; PR #391 was closed unmerged.

## Delta
- Personalization becomes a full-screen mobile sheet instead of an ambiguous floating panel.
- Explicit 44px `НАЗАД` control closes the sheet and returns to the unchanged workspace.
- Q launcher is 44px and respects bottom safe area.
- Mobile theme choices become readable two-column controls instead of five micro-columns.
- Compact and Focus density now create materially different card padding, height and layout gaps on mobile and desktop.
- Motion Reduced visibly suppresses ambient animation; Off removes ambient effects and transitions.

## Guardrails
No finance formulas, broker/API, Data Trust semantics, Metric Drill-down, Living World runtime, Pixi, navigation architecture, v1, security or bundle-budget changes.

## Next
Run full CI. Then continue P0 control consolidation and human-readable trust copy before adding additional shells.
