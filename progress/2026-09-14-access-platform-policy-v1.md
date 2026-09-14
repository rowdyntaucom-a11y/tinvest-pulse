# QVANIX · platform access policy v1

Date: 2026-09-14
Starting main: `0c3b3831c375785b78a53b5e2fce8dab81e3f93d`
Branch: `qvanix-access-model-v1-mainrefresh`

## User direction captured

- QVANIX must continue moving toward the functional depth/flexibility of the reference portfolio platforms without copying their visual identity.
- Russian product copy must read as native Russian product writing, not word-for-word machine translation.
- Full widgets must not be duplicated across workspaces. Board may summarize/navigate but canonical widgets stay in their owning workspace.
- Commercial product must have a deliberate Free/Base vs paid Pro split.
- Initial Base direction: portfolio calculations/presentation limited to 10 instruments and only minimal analytics.
- QVANIX remains a future registered web platform: user registration, account identity, secure read-only broker/API connections, subscriptions/entitlements and later multi-account/multi-broker support.

## Implemented in this pass

- Added `PRODUCT_ACCESS_MODEL_V1.md` as the first durable product contract for Base/Pro capabilities, no-duplication rules, native Russian UX copy, registration flow and secure broker-connection architecture.
- Added deterministic `accessPolicy.ts` with versioned BASE/PRO capabilities and a 10-position BASE limit.
- Added a full-portfolio metric gate so future Free enforcement cannot silently calculate a full-portfolio metric from a truncated first-10 subset and present it as complete.
- Added regression coverage and registered it in mandatory `test:core`.

## Important release decision

The access policy is intentionally **not enforced in the current personal development runtime yet**. The current account remains unrestricted until authenticated user identity, subscription state, explicit plan UX and backend authorization exist end-to-end. This prevents the development/test account from suddenly losing positions or analytics merely because the commercial policy has been defined.

## Security direction

- Broker/API credentials never belong in frontend/localStorage/repository.
- Future multi-user credentials require encrypted server-side storage, read-only scopes where possible, revocation/rotation and auditability.
- Entitlements become server-authoritative once auth exists; CSS-only hiding is not authorization.

## Next

1. RU-first cleanup of visible mixed English/Russian product copy, starting with Board/Q-LENS and continuing screen by screen.
2. Establish auth/user/broker-connection backend architecture without enabling real-user registration before legal P0 blockers are resolved.
3. Add subscription/entitlement service boundary and locked-feature UX.
4. Only after that enforce the 10-instrument Base limit for actual registered Free users.
