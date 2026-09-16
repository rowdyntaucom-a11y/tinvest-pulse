# Data Trust XIRR clean recovery — 2026-09-16

## Factual base
- Fresh branch from `main` at `cd8b04813a1fe7023d8d3e8141e151d17f9163c1`.
- That main already contains the historical-payout Data Trust recovery.
- Audit of superseded PR #376 found one still-relevant unresolved P1: App passes `datedCashflows: 0`, which permanently hid a finite canonical server XIRR.
- The P2 Health confirmation-copy finding is already fixed on factual main and is not duplicated here.

## Narrow repair
- Keep `DATED_CASHFLOWS` fail-closed for ordinary sources.
- Treat only LIVE + COMPLETE canonical `DASHBOARD` / `PORTFOLIO` broker snapshots as eligible to carry the deterministic server XIRR aggregate when raw dated cashflows are not exposed to the client contract.
- FALLBACK, PARTIAL, STALE and unrelated broker payloads remain blocked.
- No financial formula, broker/API, payout, Living World, Pixi, navigation, v1, bundle-budget or security changes.

## Regression
`dataTrustXirr.test.ts` proves:
1. canonical LIVE+COMPLETE DASHBOARD/PORTFOLIO can preserve server XIRR;
2. FALLBACK cannot promote it;
3. PARTIAL coverage cannot promote it;
4. unrelated broker payloads still require explicit dated-cashflow evidence.

## Release gate
Do not merge until full v2 CI/security/build/test/bundle gates are green and a final race-check confirms factual main has not moved incompatibly.
