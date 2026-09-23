# 2026-09-23 — Samurai trust-gate / first-viewport pass

## Trigger
The latest Samsung recording showed that the visual shell is now strong, but fallback/untrusted data states still produced weak screens: Assets became one small line in a large empty field, Analysis became a matrix of dashes, and Income showed dash-filled financial cards. Home also still hid most of the Formation deck behind the fixed command dock.

## Decision
Do not relax fail-closed finance rules and do not invent demo values. Instead, make the unavailable state itself a designed Samurai state that explains what must be confirmed before numbers appear.

## Implemented
- Added reusable authored Samurai trust gates for Assets, Analysis and Income.
- Each gate shows the real data pipeline (source/history/coverage/linking) without fake currency, percentages or recommendations.
- Removed old dash-filled / dead scaffolding from those Samurai screens while trust is false.
- Preserved the existing trust rules and financial calculations unchanged.
- Tightened Home again: hero and Capital Path are shorter and Formation cards are more compact so the actual formation deck can enter the first phone viewport above the fixed dock.
- Added reduced-motion-safe ambient motion only to the decorative signal layer.
- Added regression coverage and import-order guards.

## Quality bar
An unavailable state must still look authored, informative and complete, but it must never imply that missing financial data exists.