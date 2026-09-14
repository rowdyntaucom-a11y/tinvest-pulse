# QVANIX — DNA mobile label readability v1

Date: 2026-09-15

## Scope
Presentation-only mobile readability pass for existing DNA / Living World supporting labels.

## Finding
The shared mobile readability layer still rendered DNA state supporting labels at 6.4 px, with the Living World eyebrow and diagnostic copy at 6.8 px. These values were below the readability baseline already applied to surrounding analytics and portfolio secondary copy.

## Change
- Raise `.dna-state span` and `.dna-state small` from 6.4 px to 7 px and add compact `line-height: 1.2`.
- Raise `.world-panel__head .eyebrow` and `.world-stage__diagnostic` from 6.8 px to 7.1 px.
- Reduce eyebrow tracking from `.08em` to `.065em` to limit extra horizontal expansion.

## Non-goals / invariants
No DNA runtime state, XP/economy, event semantics, portfolio data, financial calculations, backend/API, storage, access policy, trading behavior, scene ownership or animation timing changes. No new motion or data.

## Release gate
Merge only after full v2 CI passes and a final main-SHA race-check confirms that `main` still matches this branch base. Parallel Board/Q-LENS PR #289 remains untouched.
