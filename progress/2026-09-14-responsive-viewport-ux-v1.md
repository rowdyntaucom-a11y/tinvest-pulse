# QVANIX · responsive viewport UX v1

Date: 2026-09-14
Starting main: `042dca9a1cfc0ed183531e357e0ebd167c51a8c6`
Branch: `qvanix-responsive-viewport-ux-v1`

## Trigger

Live user screen recording confirmed that the product must be comfortable across modern phones, tablets and desktop; Samsung is a real test device, not the product target. The pass therefore hardens responsive behavior rather than tuning one handset.

## Scope

- Keep the existing mobile-first shell and financial/DNA behavior unchanged.
- Remove the Analytics subnav's sixth-column squeeze on phones by moving the sample-quality badge to its own compact row.
- Replace fixed 112px mobile risk rows with bounded flexible rows so shorter and taller phone viewports distribute space more naturally.
- Add a compact-height tablet/landscape rule without inheriting the phone-only 100dvh lock.
- Add narrow-phone handling below 360px.
- Add short-phone handling below 740px height, including safe-area-aware top/bottom padding.
- Preserve the existing desktop composition and avoid horizontal scrolling.

## Council review

- Quant: CSS-only; no financial calculation, source, threshold, recommendation or data semantics changed.
- Code: one override stylesheet only; no React/runtime/API dependency change.
- Responsive/mobile: rules are viewport-class based, not Samsung-specific. The pass covers narrow phones, normal phones, short phones and compact-height tablet/landscape states while leaving desktop rules intact.
- Release: low-risk presentation-only diff plus this checkpoint; no backend, broker API, credentials, legal/payment, DNA state or dependencies.

## Deliberate non-goals

- No subjective visual redesign.
- No new widgets or duplicated metrics.
- No pseudo-VWAP, trading behavior or recommendation logic.
- No final legal publication.

## Validation required before merge

- GitHub `v2 build` must pass.
- Inspect PR diff for presentation-only scope.
- Immediately before merge, both Render queues (`tinvest-pulse-v2-preview` and `tinvest-pulse`) must be settled/healthy.
- After merge, wait until both services are live on the accepted main commit before asking the user to verify.
