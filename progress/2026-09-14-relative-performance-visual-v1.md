# QVANIX · relative-performance visual v1

Date: 2026-09-14
Starting main: `a5b33b51752d81dcb2de3eb1665dff031af7bd89`
Branch: `qvanix-relative-performance-visual-v1`

## Why this pass

The user's live UX recording and `QVANIX_графики_и_вкладки_без_ИИ.pdf` converge on the same priority: existing deterministic data is stronger than its visual presentation. The next product phase should improve information density and visual meaning before adding more static cards.

## Priority order preserved

1. Compact existing screens / remove low-information empty space when observed live.
2. Add history context and semantic visual encoding to already-calculated metrics.
3. Improve Portfolio structure visualization without duplicating the existing Structure home.
4. Make Portfolio-vs-IMOEX relative performance readable at a glance.
5. Add verified portfolio events to historical charts where event identity/time is trustworthy.
6. Build a reusable metric drill-down pattern only after the visual primitives are stable.

Do not fill short-history gates with invented deterministic-return scenarios. Do not turn drift diagnostics into buy/sell instructions.

## Implemented in this pass

- Existing TWR/IMOEX chart now shades the actual paired area between the two normalized series.
- Mint shading means portfolio index is above IMOEX; warm shading means IMOEX is above portfolio.
- Crossings are split at the interpolated crossing coordinate so a segment cannot be painted with the wrong semantic tone across a sign change.
- Latest normalized spread is shown as `Δ ... п.` beside the existing legend.
- Missing IMOEX points remain unfilled; no interpolation is used to manufacture benchmark coverage.
- Existing transaction-date markers remain unchanged and still do not claim execution-price coordinates.
- Mobile legend is allowed to wrap rather than squeeze or overflow.

## Council review

- Quant: uses only the already-normalized Portfolio TWR and IMOEX index values. The displayed delta is the difference of those normalized index levels, labelled `п.` rather than a new return/alpha metric. No missing benchmark value is invented.
- Code: renderer-only deterministic geometry; no API, state persistence or dependency change.
- Responsive/mobile: fill consumes no extra chart height; legend wraps below 620px and does not add a new full widget.
- Release: two runtime presentation files plus this checkpoint; no backend, broker API, credentials, legal/payment, DNA state, recommendations or trading behavior.

## History / continuity rule

Development history, rationale, failed approaches, release state and next priorities remain repository-owned context. Meaningful future passes should continue writing dated `progress/` checkpoints and update canonical project docs when the decision is durable enough to outlive the individual implementation pass.

## Next safe visualization passes

- Reusable compact sparkline primitive for metrics that have a truthful historical series.
- Semantic asset-class tokens and compact structure visualization.
- Income/coupon/dividend event overlays only from verified event timestamps and identities.
- General metric drill-down after the above primitives prove stable on phone/tablet/desktop.
