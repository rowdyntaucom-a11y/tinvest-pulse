# QVANIX Terminal · user-authored screener checkpoint

Date: 2026-09-13
Status: refreshed on current alert-rule boundary v1.3; awaiting PR CI/release gate.

## Scope

- Adds deterministic ALL / ANY evaluation over conditions explicitly authored by the user.
- Reuses current alert-rule validation, including metric-domain checks and strict chronological/version checks for crossing rules.
- Invalid, duplicate, empty or oversized configurations fail closed.
- Missing-data propagation follows logical short-circuit semantics: ALL can resolve false from one known false rule; ANY can resolve true from one known true rule.
- Maximum 8 rules per screener.

## Safety/product boundary

The screener does not rank assets, infer a strategy, generate candidates, recommend trades, or create execution instructions. It only evaluates user-authored conditions against deterministic technical snapshots.

## Review

- Quant: no expected-return model or hidden normalization.
- Code: inherits the current alert metric-domain/crossing gates rather than duplicating older validation.
- Mobile: no UI/layout change in this package.
- Release: frontend deterministic boundary + regression only; no backend, broker API, credentials, legal/payment or execution behavior.
