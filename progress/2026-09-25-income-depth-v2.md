# 2026-09-25 — Income Depth v2

## Scope
Continues the shared deep-workspace architecture for Samurai and Cosmos without touching DNA.

## Delivered
- Added a fourth Income Depth view: **Удержания**.
- Reuses the existing deterministic `buildIncomeTaxBridge` instead of creating shell-specific finance logic.
- Shows actual gross / withheld / net only where those fields are explicitly present in normalized payout data.
- Shows the verified 12-month schedule bridge only while the existing payout trust gate is open.
- Missing gross/tax/net values are not reconstructed and no universal tax rate is applied.
- Fact and future schedule remain separate.
- Samurai and Cosmos receive distinct material treatment through the shared component.

## Data-honesty boundary
No YTM, duration, daily move, inferred payout, inferred tax, event or forecast was introduced.

## Next
Continue Income/Goal product depth and real-device polish, then fill any remaining parity gaps in Assets/Analysis.
