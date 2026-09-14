# QVANIX · product surface catalog v1

Date: 2026-09-14

## Why

The user approved two launch rules that must be architectural, not just visual: full widgets must not be duplicated across sections, and BASE/PRO separation must remain explicit as QVANIX evolves into a registered multi-user web platform.

## Implemented

- Added one canonical product surface for every accepted capability in `accessPolicy.ts`.
- Every capability has exactly one owner workspace: Portfolio, Analytics, Income, Terminal, DNA or Reports.
- Added native-Russian titles/descriptions suitable for future pricing/paywall/account surfaces.
- BASE/PRO minimum plan is derived from the existing access policy rather than duplicated as a second tariff source of truth.
- Bond depth is explicitly owned by Portfolio, matching the current product structure and preventing a second full bond widget in Analytics.
- Added regression coverage that fails if a capability is missing from the catalog or appears twice.

## Guardrails

- No runtime paywall is enabled yet.
- No current personal portfolio is truncated to 10 positions.
- No registration, payment, broker credential storage or legal publication is added.
- No financial formula, broker API, route, UI widget or DNA state changes.

## Next

Use this catalog later as the single UI-facing source for tariff comparison, locked-feature explanations and account entitlements once authentication/subscription authorization exists server-side.
