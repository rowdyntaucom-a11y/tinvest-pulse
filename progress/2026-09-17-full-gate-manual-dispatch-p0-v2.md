# QVANIX full-gate manual dispatch P0 v2

Base: `e0d04bdde4dea3147e86a9261e93619e6d872cab`.

## Recovery
PR #395 passed canonical CI on its old head, but factual main advanced before merge and #395 became non-mergeable. Per clean-branch policy this pass does not continue that stale history.

## Delta
- Add only `workflow_dispatch` to the existing canonical `.github/workflows/v2-build.yml`.
- Preserve all pull-request/push path filters and every existing security/build/test/runtime step.
- Do not add a second workflow or weaken any gate.

## Guardrails
No product/runtime code, financial formulas, broker/API, Data Trust semantics, Metric Drill-down, navigation, Living World/Pixi, v1 runtime, security threshold, test expectation, or bundle-budget changes.

## Gate
Require full green PR-triggered canonical CI and a factual main/head race-check before merge. After merge, use explicit canonical dispatch as the observable full-main gate before advancing Samsung/DNA or one Living World clean transplant.
