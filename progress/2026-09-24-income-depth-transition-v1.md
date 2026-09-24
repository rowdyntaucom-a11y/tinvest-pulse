# 2026-09-24 — Income Depth transition v1

## Scope
Completes the same two-stage mobile architecture already used by Assets and Analysis for the Income workspace in Samurai and Cosmos.

## Delivered
- The atmospheric Income first viewport stays concise.
- A visible down cue on Samurai and Cosmos smooth-scrolls into the real Income workspace.
- Reduced-motion users get an immediate non-animated jump.
- The verified Income depth is no longer hidden behind the global detailed-mode toggle: trusted users can reach Calendar / Fact / Sources directly.
- Existing deterministic income logic is reused unchanged:
  - actual positive coupon/dividend cash flows only;
  - complete-month observation rules;
  - stability and concentration;
  - comparable periods;
  - official future payout calendar only behind the existing fail-closed trust gate;
  - exact FIGI source linkage and bond schedule coverage.
- Samurai and Cosmos share the same financial semantics while using different depth materials.

## Honesty boundary
No future payout, YTM, duration, tax amount, daily move or event is invented. The future calendar remains unavailable when schedule coverage is incomplete or stale.

## Next
Goal already has its deep lab. Continue real-device polish and then improve cross-workspace navigation/summary continuity without touching DNA.
