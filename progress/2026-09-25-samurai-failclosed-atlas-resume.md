# QVANIX resume checkpoint — 2026-09-25 — Samurai fail-closed atlas

## Active strategy
- Build **Samurai first** as the complete Snowball+ functional reference shell.
- Snowball remains the **minimum product-breadth benchmark**, not a UI template.
- Do not spread incomplete parity work across Cosmos/NORD yet.
- After Samurai reaches the agreed breadth, port shared finance engines/workflow contracts into other shells while preserving each shell's own visual language.
- Ordinary tabs are vertically extensible workspaces: first screen answers quickly, deeper chapters may continue as far as needed. Pulse/Screenshot remains the one-screen exception.
- DNA WORLD remains frozen / last priority.

## Latest completed work
Merged PR #689 into main:
`c7576fd15431776e6674a820d5117005232ad365`
`feat(v3): expose full Samurai product map in fail-closed mode`

What changed:
- Added `SamuraiFailClosedAtlas` for Home / Assets / Analysis / Income.
- When broker/live data is unverified, Samurai now shows the **real functional architecture** with em-dash values instead of hiding almost everything behind one source gate.
- Home preview exposes the history/benchmark structure: TWR, XIRR, IMOEX and chart geometry without invented values.
- Assets preview exposes composition, classes, sectors, bonds and asset drill-down.
- Analysis preview exposes Return / Risk / Structure / Market with labels for TWR, MaxDD, VaR/CVaR, beta, Sharpe/Sortino, IMOEX, tracking error / IR.
- Income preview exposes FACT vs scheduled separation, a 12M payout-calendar shape and Calendar / Fact / Sources chapters.
- Source verification remains explicit below the functional preview.
- The legacy Samurai viewport-lock contract is preserved for regression compatibility, but mobile CSS now allows fail-closed workspaces to extend vertically instead of trapping them in one screen.
- No fake financial values were added.
- Trusted finance engines/calculations were not changed.
- DNA untouched.

## Existing Samurai Snowball+ reference depth
Already in main before this pass:
- Analysis: Overview → Return → Risk → Structure → Market.
- Assets: classes → broker P/L attribution → sectors → bonds → holdings/drill-down.
- Income: calendar → realized income → source concentration.
- Goal: target → route → Goal Lab; scenario + historical bootstrap.
- Samurai chapter navigation and in-flow downward transitions.

## Snowball benchmark inventory
Detailed observed inventory remains:
`progress/2026-09-25-snowball-mobile-recording-inventory.md`

Core missing surfaces to implement next in Samurai:
1. Operations + event/corporate-action integrity.
2. Report + category + currency drill-down.
3. Expanded payout / dividend calendar.
4. Rebalancing workflow UI using existing deterministic engines.
5. Portfolio Laboratory / historical strategy comparison.
6. Technical discovery / fallen-assets tooling.
7. User-facing screener UI.
8. Verified fundamentals and bond-yield metrics only when source contracts are defensible.
9. Later: public/social/account/subscription surfaces.

## Real-device notes still active
- Keep one clear down cue per transition; avoid duplicated chevrons.
- Down controls must never float over finance UI.
- Shared shell art may stay constant across tabs; uniqueness comes from workspace composition, materials, effects and instrument geometry.
- Functional and thematic language should be separated: normal finance labels stay primary, shell vocabulary stays secondary.

## Preview
https://qvanix-v3-preview-1jso.onrender.com

Continue from current `main` + this checkpoint. Do not claim full Snowball parity yet.
