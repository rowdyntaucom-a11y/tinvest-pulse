# Samsung DNA mobile touch clean v2 — 2026-09-16

## Factual base
- Branch: `fix/dna-mobile-touch-clean-v2`
- Base: `cd8b04813a1fe7023d8d3e8141e151d17f9163c1`
- Data Trust historical-payout recovery is already on this base.

## Confirmed regression and architecture
Samsung mobile navigation reported a visible DNA/Living World destination that could not be tapped reliably. The current clean base already contains the narrow interaction repair: the topbar stacking context is raised above the scroll owner, the fixed mobile nav and its buttons explicitly accept pointer events with `touch-action: manipulation`, and floating personalization/help controls are moved out of the primary target lane.

The navigation architecture deliberately remains five equal primary flow destinations plus a distinct raised DNA action. It does **not** use six micro-typographic columns. Labels keep a 12px floor in portrait, primary buttons retain a 52px minimum height, and DNA retains a separate 64px × 44px minimum action. This preserves discoverability at 360/390/412px without shrinking all destinations to 10–11px labels.

## Regression coverage
`v2/tests/uxNavigation.test.ts` is registered in `test:core` and asserts:
- all six destinations including DNA remain in the navigation model;
- topbar/nav stacking and pointer/touch policy remain explicit;
- floating personalization/help controls stay above the nav lane;
- the interaction stylesheet loads after other shell/readability CSS.

## Scope guardrails
No financial formula, broker/API, Data Trust, Metric Drill-down, Living World runtime, Pixi Application/ticker, asset loader, bundle budget, security policy or v1 change is part of this pass.

## Release gate
Before merge: factual race-check against latest `main`, full v2 CI/security/build/test/bundle gates, then Render verification. Do not merge stale history or the old six-column #380 implementation.
