# QVANIX · Board no-duplicate v1

Date: 2026-09-14
Starting main: `7e15f7e79f84e4126d887642cf3dbc25a97f92a2`

## Goal
Apply the product rule that the Board is a compact overview/navigation surface, not a second full Portfolio/Analytics/Income screen.

## Change
- Removed the separate Q-LENS metric surface because it repeated capital, TWR/XIRR, income and risk already represented by the configurable Board modules and their primary workspaces.
- Removed capital/P&L/Health metric presentations from the Board hero. The hero now identifies the Board/account and explains that detailed analytics live in profile sections.
- Preserved the compact data-context rail and user-selected module grid.
- Pinned module semantics, navigation targets and financial values are unchanged.

## Guardrails
- No formula, API, broker data, auth, subscription, legal/payment or DNA runtime changes.
- No metric is deleted from its primary Portfolio/Analytics/Income home.
- No new widget is introduced.
- The pass reduces mobile vertical density rather than adding another surface.

## Council
Quant: presentation-only; no financial semantics changed.
Code: removes state/types/render branches instead of adding a second abstraction.
Responsive: fewer large sections and no new CSS geometry; vertical density decreases.
Release: isolated Board React file + progress note; reversible and low-risk.