# QVANIX full-gate manual dispatch P0

Base: `3a4f84b69d1f30e74f972912a5121ccd0008d692`.

## Problem
The canonical `v2 build` workflow is path-filtered. Narrow coordination/CI cleanup changes can therefore merge without an observable full security/build/test/bundle run, blocking the required post-merge race gate for Samsung DNA and Living World work.

## Delta
- Add `workflow_dispatch` to the existing canonical `.github/workflows/v2-build.yml`.
- Keep all existing PR/push path filters and every existing job/step unchanged.
- Do not add a second build workflow or weaken any gate.

## Guardrails
No product/runtime code, financial formulas, broker/API, Data Trust semantics, Metric Drill-down, navigation, Living World/Pixi, v1 runtime, security threshold, test expectation, or bundle budget changes.

## Verification intent
This workflow-file change itself triggers the canonical PR `v2 build`. After merge, maintainers/automation can explicitly run the same full gate on factual main when a narrow change would otherwise be excluded by path filters.

## Next
Require full green CI on this PR, race-check factual main, then use the explicit full gate before advancing Samsung/DNA or a single clean-transplanted Living World pass.
