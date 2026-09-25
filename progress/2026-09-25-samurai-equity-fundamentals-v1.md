# QVANIX — Samurai Equity Fundamentals Depth v1

Date: 2026-09-25
Feature PR: #717
Merged main SHA: `b6f8125154cfd5d6ea75374a8890ddb369ab964b`
Render deploy: `dep-dar6m28ae00c73e62gs0` — LIVE

## Goal
Continue Snowball+-level functional depth in the Samurai reference shell after Bond Intelligence. The next missing layer was a real, verified equity-fundamentals workspace rather than more static labels.

## Implemented
- Added **Assets → Акции / Equity Intelligence v1** before the bond chapter.
- Reused the existing server-side T-Invest `GetAssetFundamentals` boundary instead of creating a second source of truth.
- Current equity holdings are resolved only from confirmed portfolio positions and exact `instrumentUid` identities.
- Requests are concurrency-limited to 4; the existing server fundamentals route keeps private caching.
- Added four interactive metric groups:
  - multipliers: P/E, P/S, P/BV, EV/EBITDA;
  - profitability: ROE, ROA, ROIC, Net Debt/EBITDA;
  - financials: revenue, EBITDA, net income, FCF;
  - shareholder context: dividend yield and market cap.
- Added verified-company count, equity capital, verified-capital coverage and metric-specific capital coverage.
- Missing / zero / unverified source values remain explicit `—`; no interpolation or pseudo-values.
- Every company can open the canonical Asset Intelligence workspace for deeper instrument context.
- Samurai chapter navigation now includes the dedicated **Акции** chapter.
- Mobile tabs scroll locally; company and metric grids collapse responsively without creating page-level horizontal overflow.

## Methodology guardrails
- T-Invest remains the only accepted fundamentals source in this layer.
- T-Invest zero semantics remain fail-closed as already defined in `assetFundamentals.ts`.
- No portfolio-wide weighted P/E or other potentially misleading aggregate ratio was invented.
- No QVANIX proprietary score is published.
- No “cheap/expensive”, buy/sell or expected-return verdict is generated.
- Capital coverage is shown explicitly so missing fundamentals cannot silently look complete.

## Validation
GitHub PR #717:
- **v3 build** — PASS;
- **full v3 test suite** — PASS inside the v3 build workflow;
- **V3 free preview artifact** — PASS;
- new `equityFundamentalsDepth.test.ts` registered and passed;
- existing Assets Depth contract updated and passed.

Automated Codex review did not run because the connected review bot reported its usage limit; there were no review threads. This was not treated as evidence of code correctness. The executable CI gates above were used as the release gates.

Render:
- auto-deploy triggered from merged main SHA `b6f8125`;
- deploy `dep-dar6m28ae00c73e62gs0` reached **LIVE**.

## Real-device acceptance
Not yet confirmed on Samsung for this new chapter. The deployed build is ready for user verification. Pay special attention to:
- local scrolling of the fundamentals tabs;
- whether the chapter-nav jump lands cleanly;
- company cards / “Открыть карточку” interaction;
- no return-to-top or nested-scroll regression;
- actual T-Invest field coverage for current holdings.

## Next
1. Accept / correct Equity Intelligence on the real Samsung device.
2. Build **broad-market dividend discovery** from verified market data rather than only current holdings.
3. Continue replacing remaining Atlas preview-only chapters with functional tools.
4. Keep Samurai as the reference shell; only after accepted functional parity, carry the finished systems into the other shells with their own presentation.
