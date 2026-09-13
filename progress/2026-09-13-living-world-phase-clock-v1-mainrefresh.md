# QVANIX DNA · Living World phase clock v1 · main refresh

Date: 2026-09-13
Base main: `2273823f31203fca85a14ec2a57f5678c700d360`.

## Scope

- Recreates the accepted phase-clock pass from the latest main after Terminal alert sample-floor hardening landed in parallel.
- Preserves all current Terminal alert/screener behavior and tests.
- DNA local time now refreshes immediately when the DNA tab opens and then only at the next existing WorldState phase boundary (`05:00 / 08:00 / 17:00 / 20:00`).
- App passes the live local date into the existing deterministic runtime-state boundary; Pixi still consumes resolved WorldState rather than deriving time itself.
- No minute polling and no active world clock while DNA is closed.

## Council

- Quant/product: no financial, XP, level, weather, return or recommendation logic changed.
- Code: one timeout at a time with cleanup; pure boundary scheduler is independently regression-tested.
- Mobile: no layout/CSS change and minimal wakeups while DNA is open only.
- Release: frontend runtime + regression only; no backend/broker/secrets/legal/payment/dependency/infrastructure change.

## Release gate

- Run normal `v2 build` and complete `test:core` including current Terminal sample-floor tests.
- Merge only after both Render services are settled on `2273823f...` and main lineage remains unchanged.
