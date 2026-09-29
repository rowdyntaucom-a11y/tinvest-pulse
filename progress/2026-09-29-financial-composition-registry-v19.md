# QVANIX Financial Composition Registry v19 — 2026-09-29

## Purpose
Turn the financial module registry from a static inventory into the canonical composition contract for Samurai/Core across phone and desktop.

## Changes
- Added explicit module surface classification: first answer, workspace, deep tool, account infrastructure.
- Added explicit data-boundary ownership for portfolio, history, operations, payouts, market, fundamentals, scenario input and account architecture.
- Added deterministic module availability with fail-closed reasons:
  - portfolio required;
  - verified market data required;
  - source contract required;
  - not implemented;
  - architecture only.
- Added deterministic mobile/desktop composition ordering that preserves canonical module ownership.
- Source-gated options and order-book/microstructure remain blocked even when other market data is available.
- Broad-market dividend discovery is now registered as live because the repository already contains a strict TTM API contract, normalizer, loader and user-facing discovery workspace.
- Added stronger registry invariants for unique ids, read-only boundaries, live data ownership and source-gated contracts.

## Product effect
Future Samurai/Core composition can use one deterministic source of truth instead of hard-coded feature lists. The same finance engines remain shared; shells may reorder presentation without forking calculations or data ownership.

## Boundaries
- No trading or order execution.
- No broker tokens in frontend/localStorage/repository.
- No fabricated data.
- No DNA/Living World work.
- Options and microstructure remain unavailable until dedicated verified source contracts exist.
