# QVANIX Light Core Professional Workspaces v24 — 2026-09-29

## Goal
Replace the shallow Core-only tools with the existing deep financial engines while keeping the active light QVANIX Core as the product shell.

## Product changes
- Portfolio gets a third **Глубина** mode backed by the canonical V3AssetsDepth workspace:
  - composition and concentration;
  - broker P/L attribution;
  - sectors;
  - equity fundamentals;
  - bond maturity/risk and verified yield layer;
  - holdings explorer and asset drill-down.
- Market promotes the full Market Intelligence workspace:
  - market pulse;
  - screener;
  - technical history / fallen-assets discovery.
- Tools promotes the full professional toolbox:
  - user-authored rebalance scenarios;
  - historical Portfolio Lab;
  - futures WHAT IF / basis / margin stress;
  - portfolio report with class/currency/P&L reconciliation.
- Market is removed from the light-Core toolbox instance because it has its own top-level workspace.
- Heavy workspace chunks are lazy-loaded and prefetched only after the trusted first paint.
- Switching Portfolio depth, Income modes, or Analytics/Market/Tools resets the mobile viewport immediately to avoid opening a new workspace midway down the previous one.
- Added a dedicated light material layer for legacy shared deep modules. The financial engines are reused; Samurai styling is not the active product target.

## Guardrails
- No order creation, trade execution, or auto-trading.
- Futures and rebalance remain WHAT IF / read-only.
- Market and fundamentals remain source-gated/fail-closed.
- No secrets in frontend/localStorage/repository.
- DNA/Living World untouched.
