# QVANIX v3 — canonical metric drill-down

Date: 2026-09-20

## Why this pass
The Pult now correctly promotes TWR over CAGR, but its primary metrics were still informational dead ends. The master direction requires progressive disclosure and reusable metric drill-down rather than a flat wall of numbers.

## Implemented
- TWR and XIRR on Pult now expose explicit depth actions.
- Both route to the existing canonical Analysis workspace, force Detailed mode, and open the Return section instead of creating a duplicate performance screen.
- Passive income routes to the canonical Income workspace.
- Holdings count routes to the canonical Assets workspace.
- Generic Analysis navigation resets to Overview so deep-link intent does not leak into later normal navigation.
- Analysis accepts a typed initial section and synchronizes when a new drill-down intent arrives.
- Drill-down actions remain hidden when the Home model is not trusted, preserving fail-closed behavior.
- Added dedicated responsive styling and a regression contract registered in the full v3 test suite.

## Methodology boundary
No financial formula or data source changed. TWR/XIRR values remain produced by the existing deterministic pipeline; this pass changes navigation/comprehension only.

## Validation target
Run full v3 tests and production build in CI before merge; merge only on a green relevant v3 gate, then verify the exact merged SHA on Render.
