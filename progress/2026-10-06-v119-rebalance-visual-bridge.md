# QVANIX v119 — Rebalance Visual Bridge

Date: 2026-10-06

## Scope

Large professional-tools readability pass for deterministic class-level rebalancing. The existing v1.1 scenario math remains the single calculation source; this pass visualizes its outputs without introducing target advice or instrument-level actions.

## Delivered

- shared 0–100% rail comparing current sleeve share with the user-defined target for equities and bonds;
- exact current value → target value bridge for each class with signed scenario delta;
- assigned capital before / after user-supplied flow plus explicit model coverage and unassigned sleeve share;
- common-scale class delta magnitudes derived from existing scenario rows;
- for existing-capital rebalance, movement is shown as one-way internal transfer (`Σ |delta| / 2`) instead of double-counting both class legs;
- for add/withdraw modes, absolute class deltas remain explicitly labelled `Σ |delta|`;
- add/withdraw threshold view comparing user-supplied flow with `minimumFlowForExactTarget`, including signed gap to that threshold;
- explicit direction-conflict detection when add-only would require reducing a class or withdraw-only would require increasing one;
- fail-closed mounting only after both drift and scenario calculations are available;
- deterministic mobile layouts at <=760px and <=430px, no bubble/circle visualizations;
- reduced-motion and content-visibility safeguards;
- regression coverage in `rebalanceVisualBridgeV119.test.ts`.

## Preserved

No changes to `calculateAllocationDrift`, `calculateRebalanceScenario`, strategy tolerance methodology or broker data. The module does not create orders, instrument-level trade lists, personalized recommendations, target prices or forecasts. DNA/Living World untouched.
