# QVANIX stale push patchers cleanup P0

Base: `7c156231a642594986a75c2222a287fe66ea5883`.

## Problem
Two historical one-shot migration workflows still run on every push to main. Their target anchors have already been superseded, so they now create unrelated red CI noise after otherwise valid merges.

## Delta
- Remove `.github/workflows/cache-v7114.yml`.
- Remove `.github/workflows/v7169-bond-lastgood.yml`.
- Do not modify product/runtime code.

## Guardrails
No financial formulas, broker/API, Data Trust semantics, Metric Drill-down, navigation, Living World/Pixi, v1 runtime, security policy, or bundle-budget changes.

## Next
Run current CI on this narrow PR, race-check factual main, merge only if green, then continue audit-driven mobile floating-control consolidation.
