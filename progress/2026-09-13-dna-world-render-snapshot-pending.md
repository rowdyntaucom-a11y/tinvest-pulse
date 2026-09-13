# QVANIX DNA · WorldRenderSnapshot checkpoint

Date: 2026-09-13
Status: feature branch validated; production merge waiting for existing Render queue to settle.

## What changed

- Added `v2/src/features/dna/worldRenderSnapshot.ts` as the final deterministic hand-off before PixiJS.
- `WorldStage` now resolves the semantic event queue before creating a renderer snapshot.
- Pixi receives only presentation-relevant `level`, `timePhase`, `weather` and still-pending semantic events.
- XP totals, `xpToNext`, quality coverage, financial metrics and acknowledgement history do not enter the Pixi render boundary.
- Already-acknowledged semantic events cannot reach the renderer snapshot.
- Pending events are copied so renderer-side mutation cannot mutate authoritative `WorldState`.

## Validation

- Initial PR run #337 exposed a Node `--experimental-strip-types` runtime-resolution defect in the new module while TypeScript/Vite build itself was green.
- The defect was fixed by resolving `worldEventQueue` before `WorldRenderSnapshot`; the snapshot module now has only a type dependency on the queue contract.
- Follow-up GitHub Actions `v2 build` run #341 completed successfully.
- Mandatory `worldRenderSnapshot.test.ts` is included in `test:core`.

## Council pass

- Methodology: no financial calculation or XP-economy change.
- Code: renderer boundary narrowed; event acknowledgement/filtering remains outside Pixi.
- Mobile: no layout, density or art change.
- Release: frontend DNA-only scope plus tests/docs; no backend, broker API, credentials, legal/payment or trade behavior.

## Production gate

Do not merge while either Render service has a non-settled recent main deployment. At checkpoint time both preview and primary were still processing the previous `b239134...` rollout, with `ef51fc8...` queued behind it.

## Next

After both Render services settle: refresh main ancestry, merge PR #218 only if still conflict-free, monitor preview + primary to live, then replace this pending checkpoint with/alongside a production-live checkpoint. Production art/event animation mapping remains separately gated on the asset pipeline and user-reviewed visual direction.
