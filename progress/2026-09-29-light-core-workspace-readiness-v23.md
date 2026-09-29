# QVANIX Light Core Workspace Readiness v23 — 2026-09-29

## Scope
Large follow-up pass from the real-device recording after the light Core entry and history fixes.

## Changes
- Slow read-only workspaces (MOEX market + payout calendar) are prewarmed after trusted portfolio data appears, so opening those tabs does not always start from a cold request.
- Payout responses that are unavailable are no longer cached as healthy for five minutes.
- Payout calendar now has explicit finite states, bounded retries, automatic recovery and a manual retry path.
- MOEX workspace now performs bounded automatic retries before requiring manual action.
- Retry copy distinguishes a slow source from a confirmed unavailable source.
- All behavior remains read-only and fail-closed; unavailable financial data is never replaced by zero or an estimate.

## Product checkpoint
Active product remains the light QVANIX Financial Core. Samurai/shell work is not the current target. DNA remains frozen.
