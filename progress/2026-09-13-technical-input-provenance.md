# QVANIX autonomous checkpoint — 2026-09-13

## Terminal OHLCV input provenance v1.4

Starting main: `c211b6f1fa4a5e17884f490e44b8a83e3cc7d5cf`.

### Finding
The deterministic technical-indicator boundary validated candle date/geometry/price/volume, but invalid input rows were silently discarded. The resulting snapshot exposed accepted observations, duplicate collapse and date conflicts, yet it did not state how many raw rows were rejected. That could make a partially dirty OHLCV sample look cleaner than it actually was.

### Change
- `TECHNICAL_INDICATORS_VERSION` bumped to `1.4`.
- Every technical snapshot now exposes `inputRows` and `invalidRowsDiscarded`.
- Invalid rows remain excluded exactly as before; indicator formulas and sample gates are unchanged.
- Exact duplicate handling and conflicting-date fail-closed behavior are unchanged.
- Conflict snapshots preserve the same input-provenance counts even though indicator values remain withheld.

### Regression
`v2/tests/technicalIndicators.test.ts` now locks clean samples, exact duplicates, conflicting dates, fully invalid input and mixed valid/invalid input. Mixed dirty input must yield the same indicator values as the equivalent valid subset while explicitly reporting discarded rows.

### Council
- Quant: no indicator formula, period, threshold, signal or expected-return assumption changes.
- Code: pure TypeScript provenance fields only; no backend/API/dependency change.
- Mobile: no UI/CSS/layout change.
- Release: no broker route, storage, credentials, execution, DNA, legal/payment wording or deployment config change.

### Next safe focus
Continue deterministic Terminal/data-quality hardening. Keep VWAP gated until verified session-aware intraday data exists, and do not create a separate Terminal shell until several production-ready modules justify it.
