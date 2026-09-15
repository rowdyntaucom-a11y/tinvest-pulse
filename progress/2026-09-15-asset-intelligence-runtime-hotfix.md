# QVANIX — Asset Intelligence runtime hotfix

Date: 2026-09-15

## Incident

PR #332 (`QVANIX: Asset Intelligence workspace, T-Invest fundamentals bridge and flexible holdings explorer`) was squash-merged to `main` as `b709702aed592d77b2afe19cbf9e77a361e2f53b` after full GitHub CI and review fixes.

The preview Render service successfully deployed that commit, but the primary Render service failed during runtime startup. The previous production revision `c12f1acbda7d8aeae442e8bd7450d5cf70a650d2` remained live, so there was no production outage.

## Failure

The Render build itself succeeded. Startup failed with:

`SyntaxError: Invalid or unexpected token`

The generated `server-core.js` contained literal `\\n` text immediately before the injected fundamentals route.

## Root cause

`assetFundamentalsInjectedCode` in `production-v162.js` used one extra escaping level for two newline boundaries:

- generated route line join;
- insertion before the wildcard route.

The existing asset-history, transaction-marker, and instrument-badge runtime bridges already use the correct single escaped newline contract.

The existing CI command `node --check production-v162.js` checked only the wrapper source. It did not validate the dynamically generated downstream runtime source, so this class of escaping bug passed CI and appeared only at Render startup.

## Fix

Branch: `qvanix-fundamentals-runtime-hotfix`

The fundamentals bridge newline handling was aligned with the proven v162 runtime bridges. No API semantics, financial calculation, frontend behavior, credentials, bundle budgets, DNA runtime, or trading behavior changed.

A dedicated regression test was added:

`tests/production-v162-fundamentals-injection.test.js`

The v2 CI workflow now executes it after the existing `production-v162.js` syntax check. The regression explicitly rejects double-escaped newline boundaries so this startup failure cannot silently recur through the same path.

## Release gate

The incident is not closed until:

1. hotfix PR CI is fully green;
2. hotfix is merged to `main` with an exact-head check;
3. both Render services are `live` on the same resulting main commit;
4. the primary service no longer falls back to the previous revision.

## Continuity note

The Asset Intelligence product work from PR #332 remains approved in scope. This hotfix changes only runtime source composition and its regression coverage. Future dynamically injected production bridges should include a generated-source/runtime-composition regression rather than relying only on static `node --check` of the wrapper.
