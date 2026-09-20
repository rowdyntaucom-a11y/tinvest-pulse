# QVANIX v3 — guided public demo tour

## Why
The credential-free `/demo` foundation existed, but a first-time visitor still had to decode the product hierarchy alone. Master Direction explicitly calls for a guided demo tour and progressive onboarding copy.

## Delivered
- Added a four-step guided tour scoped only to the synthetic public demo.
- Explains Pult hierarchy, TWR vs XIRR, canonical Asset Workspace, analytics/fail-closed behavior, income and goal scenarios.
- Keeps synthetic-data disclosure inside the tour and persistent demo badge.
- Remembers dismissal locally and provides a persistent `Экскурсия` restart control.
- Added keyboard Escape/arrow navigation, dialog semantics and mobile/short-height layouts.
- Live broker root is untouched; no credentials, network calls, analytics SDK or financial methodology changes were introduced.
- Test runner now discovers all `tests/*.test.ts`, preventing future regressions from being silently omitted from the explicit script list.

## Integrity
Demo remains synthetic and cannot be confused with verified broker data. Pulse remains unavailable for demo values under the existing trust boundary.
