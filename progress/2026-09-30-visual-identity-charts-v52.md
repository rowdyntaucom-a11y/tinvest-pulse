# QVANIX Visual Identity + Charts v52 — 2026-09-30

This patch starts the Snowball-parity visual layer requested in the latest project reminder: real instrument identity, richer interactive charts, longer period controls and clearer allocation visuals, while preserving QVANIX's verified-data rules.

## Official instrument identity

The canonical dashboard now enriches current broker positions with read-only instrument metadata from T-Invest InstrumentsService.

For positions with confirmed brand metadata, the API exposes:
- logo name;
- brand base color;
- brand text color;
- a 160px official T-Invest brand-logo CDN URL.

Metadata is cached for 24 hours and loaded in small batches. A metadata/logo failure never changes the position's financial values and never hides the broker position.

The isolated /api/portfolio recovery route intentionally remains free of instrument-metadata requests so the cold-start/fallback path keeps its low-latency purpose.

Frontend normalization v1.6 carries brand identity as optional metadata. If a logo fails to load or brand metadata is unavailable, QVANIX falls back to deterministic ticker initials instead of a broken image.

Brand avatars are now used in:
- portfolio asset rows;
- home asset rows;
- asset detail;
- quick concentration/P&L analytics;
- professional P/L attribution.

## History chart parity

Detailed portfolio history now supports:
- 7D;
- 1M;
- 3M;
- 6M;
- YTD;
- 1Y;
- 5Y;
- all history.

The detailed chart has two explicit modes:
1. **Стоимость** — portfolio value vs invested capital.
2. **TWR vs IMOEX** — both series rebased to 100 at the first confirmed point of the selected window.

The comparison reports TWR, IMOEX and the percentage-point difference for the same available period. It remains a historical comparison, not a forecast or ranking.

The existing pointer/touch inspection remains available.

## Allocation visual

Overview now adds a compact portfolio-class donut above the existing allocation bars. The center shows the largest class share. Existing bars remain for exact text reading.

## Guardrails

- no expectedYield reinterpretation;
- no fabricated logo mapping by ticker;
- no fuzzy issuer identity;
- no trading/order capability;
- no benchmark forecast;
- no missing history interpolation;
- broker fallback stays independent from optional metadata latency;
- Living World / DNA remains frozen.
