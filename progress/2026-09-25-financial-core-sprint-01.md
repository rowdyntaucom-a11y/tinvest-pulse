# QVANIX — Financial Core Sprint checkpoint 01

Date: 2026-09-25
Branch: `epic/samurai-financial-core-pre-monday`
Starting main: `7f66ab9250e4dd78b95f8f3f83d50311cb431699`

## User direction captured

- Freeze Living World / DNA indefinitely; keep it addable later.
- Develop financial functions, math, widgets, tabs and charts before Monday.
- Snowball is a breadth/usability benchmark, but QVANIX must stay original and deeper where methodology supports it.
- PC is a first-class target, not an enlarged mobile layout.
- Multi-user registration and user-owned read-only broker API connections are mandatory future architecture.
- Professional analytics must expand to futures, derivatives and scalping/microstructure tools.
- QVANIX must never trade or submit broker orders.
- Samurai remains the reference shell before cross-shell transfer.
- Monday is reserved for composition / widget hierarchy review after the financial core sprint.

## Patch 01 implementation

### Navigation simplification
Four separate Samurai analysis chapters:
- Rebalance;
- Portfolio Lab;
- Drawdown discovery;
- Screener;

are consolidated behind one **Professional Tools** workspace. This immediately reduces permanent chapter density while preserving all existing functionality.

### Futures foundation
Added a deterministic read-only futures scenario engine:
- notional;
- total entered margin;
- notional-to-margin leverage;
- user-authored scenario P/L;
- scenario return relative to entered margin;
- futures basis;
- simple annualized basis.

The engine is fail-closed. Missing specification inputs produce unavailable values instead of guesses.

Explicit non-goals:
- no order entry;
- no liquidation-price estimate;
- no broker margin-call estimate;
- no exchange variation-margin emulation;
- no commissions/taxes without a verified contract.

### Responsive toolbox
Professional tools use:
- local horizontally scrollable selector on mobile;
- full-width selector on tablet;
- side navigation + work surface on desktop.

This is the first concrete step toward one information architecture with different compositions by viewport.

## Next large patches

1. Finish CI and merge Patch 01 if green.
2. Add a canonical financial module registry / ownership model for Monday layout work.
3. Audit and extend chart contracts and period controls.
4. Add market/instrument capability boundaries for futures/options/order-book analytics.
5. Continue Income and market-discovery parity without growing permanent navigation depth.
6. Prepare secure multi-user broker-connection architecture (no frontend secrets).
