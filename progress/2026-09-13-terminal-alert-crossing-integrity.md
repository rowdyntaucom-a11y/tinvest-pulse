# QVANIX autonomous checkpoint — 2026-09-13

## User-authored technical alert crossing integrity

Starting main observed before this pass: `21ce8f168807a222a03af9854ddf183eefe03ae7`.

Completed through PR #216 (`Terminal alerts: fail closed on ambiguous crossings`) and squash-merged as `b2487a2a41862218b9b893a843705f701cb6f035`.

### Why
The approved Terminal plan allows user-authored technical alerts, but crossing rules are temporal events. The existing v1.0 boundary compared any two valid indicator snapshots without proving that the previous snapshot was actually older than the current snapshot or that both values came from the same indicator calculation version. Same-date, reversed, or mixed-version pairs could therefore manufacture a false crossing direction.

### Accepted change
- Bumped `USER_ALERT_RULES_VERSION` from 1.0 to 1.1.
- `CROSSES_ABOVE` / `CROSSES_BELOW` now require valid ISO `sampleTo` dates with strict `previous.sampleTo < current.sampleTo` ordering.
- Crossing snapshots must use the same technical-indicator calculation version.
- Same-date, reversed-order, invalid-date and version-mismatched pairs fail closed as `INSUFFICIENT_DATA`.
- Simple `ABOVE` / `BELOW` threshold rules are unchanged.
- No alert scheduling, persistence, notification delivery, generated thresholds or execution behavior was added.

### Regression / validation
- Extended `v2/tests/userAlertRules.test.ts` with same-date false-crossing, reversed chronology, version-mismatch and invalid-date cases.
- Existing valid crossing and threshold behavior remains covered.
- GitHub `v2 build` PR run #336 completed fully `success`: dependency gates, TypeScript/Vite build, mandatory `test:core`, asset-history regression and runtime syntax checks all passed before merge.

### Concurrency note
A parallel autonomous path landed the initial user-authored alert-rule boundary on `main` while a duplicate implementation was being prepared. Duplicate PR #214 was intentionally closed unmerged once `main` commit `4cd1d7e1…` was detected. PR #216 was then based on the already-landed implementation and only tightened its temporal provenance.

### Council / scope
- Quant: prevents false temporal event classification; no forecast or recommendation semantics.
- Code: two-file deterministic change, no network/storage/runtime side effects.
- Mobile: no React/CSS/navigation changes.
- Release: no broker/backend routes, credentials, DNA rendering, legal/payment or trading execution changes.

### Next safe focus
Continue fail-closed Terminal maturity rather than adding UI density. Safe candidates are explicit alert-rule provenance/serialization boundaries or another deterministic indicator/data-integrity audit. Do not add system-generated personalized trade signals or realtime/order-book infrastructure without separately approved data, cost and legal architecture.
