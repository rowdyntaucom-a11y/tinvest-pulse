# QVANIX — Samurai Operations + Event Integrity v1

Date: 2026-09-25

## Scope completed

The Samurai reference shell now includes the first missing Snowball+ workflow after the fail-closed atlas pass: a real operations journal plus explicit event-integrity diagnostics.

### Samurai product surface

Added to the deep Assets workspace:
- **06 · Операции** — executed broker-event journal;
- **07 · Целостность событий** — source/coverage/traceability checks.

The operations workspace:
- reads the existing broker-backed `/api/operations-summary` route;
- separates trades, passive-income events, external cash flows, fees and other operations;
- exposes the observed date range and event counts;
- supports compact filtering and a longer journal without turning the first viewport into a wall of rows;
- keeps operations distinct from TWR/XIRR and from daily market movement;
- stays unavailable in the synthetic demo so demo mode never calls the user's live broker endpoint.

### API contract hardening

`/api/operations-summary` now also exposes:
- broker operation id;
- instrument UID;
- quantity when present;
- `contractVersion: 2.0`;
- response `fetchedAt`;
- observed operation coverage;
- the effective 10 × 1000 row cap and a `possiblyTruncated` flag.

The v3 client re-normalizes the payload and fails closed:
- malformed rows are rejected;
- duplicate broker operation IDs are discarded and counted;
- traceable-ID coverage is measured;
- instrument-identity coverage is measured for trade/income events;
- client totals for passive income and external cash flows are reconciled against server aggregates;
- any truncation, rejection, duplicate, aggregate mismatch or missing operation IDs downgrades integrity to `PARTIAL`.

## Corporate-action rule

This pass does **not** pretend that a broker operations journal proves full corporate-action coverage.

The UI explicitly marks corporate-action completeness as unverified until QVANIX has a separate defensible event/corporate-action source contract. Missing dividends, splits, amortizations or other actions must never be invented just to match Snowball breadth.

## Fail-closed behavior

When the main portfolio source is not trusted, the Samurai functional atlas now still shows that Operations and Integrity are part of the product map, but it displays no fabricated operation values.

## Validation

PR: #690

Required gates on the final code head:
- v3 build: PASS;
- v3 test suite: PASS;
- V3 free-preview artifact: PASS;
- v2 build: PASS.

New regressions cover:
- operations normalization and classification;
- duplicate/rejected rows;
- aggregate reconciliation;
- Samurai chapter wiring;
- demo isolation from the live operations endpoint;
- explicit corporate-action uncertainty;
- server operations-summary contract.

## Next Snowball+ gaps in Samurai

Continue serially in the same reference shell:
1. Report + category + currency drill-down;
2. expanded payout/calendar surface, including the separation between portfolio payouts and broad-market discovery;
3. rebalancing workflow UI on top of the existing deterministic engine;
4. Portfolio Laboratory / historical strategy comparison;
5. technical discovery / fallen-assets tooling;
6. user-facing screener;
7. verified fundamentals and bond-yield metrics only after source contracts are defensible.

DNA WORLD remains frozen. Other shells should not receive incomplete copies of these modules yet.
