# QVANIX — PR #336 review recovery

Date: 2026-09-15
Base: current `main` at `aec047cd90d906a50229ef8adc990a4b35851f0d`

## Continuity decision
PR #336 was treated only as an implementation and review source. Its conflicting branch was not rebased or merged. The useful IA, Pulse mode, targeted history, explicit loading state, API JSON fallback, canonical Asset Workspace, and Holdings Explorer changes were reapplied on a new branch from released `main`, preserving the fundamentals runtime escaping and preview proxy hotfixes already shipped there.

## Blocking review resolution
- Asset secondary requests use an active request-generation guard and abort signal. A superseded fundamentals, history, or badge response cannot commit data or clear the loading state of the newly selected asset.
- The Samsung/mobile rail remains single-line and horizontally scrollable, but top navigation is 12px, analytical metadata is at least 11px, and controls retain 40px touch height rather than using 8–9px text.
- Fundamentals distinguish unsupported instruments, transport/API failure, invalid responses, and an official response with no usable metrics. Missing data is never rendered as zero.
- The API policy covers both bare `/api` and `/api/*`. Its regression executes the actual v162 injection template against `server-core.js`, syntax-checks the generated server, and proves the JSON catch-all precedes the SPA wildcard.
- Holdings uses `ФЬЮЧЕРСЫ`; the RUB `expectedYield` view is named `НАКОПЛЕННЫЙ P/L`, not return/yield.

## Additional automated-review fixes
- Top-level navigation closes Asset Workspace and honors the selected destination.
- Historical income rows without an exact current-position match are disabled.
- Bond price quotations in Asset Workspace are displayed in percent rather than mislabeled as rubles.

## Remaining scope
Period controls, axes/current/min-max context and tap details for asset history, stronger Pulse modal focus management, and the complete PARTIAL/STALE/ERROR freshness taxonomy remain follow-up scope. They do not alter the fail-closed data contract delivered here.
