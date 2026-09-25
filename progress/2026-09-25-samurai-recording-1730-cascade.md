# QVANIX — Samsung recording 1000031730 cascade correction

Date: 2026-09-25

## Source

User-provided Samsung recording `1000031730.mp4`.

## What the recording exposed

The 1729 readability pass fixed the biggest duplication problem, but three residual CSS-cascade issues were still visible on the real device:

1. **Assets / Income Atlas title squeezed into a narrow column.**
   A legacy descendant selector for `.sam-trust-gate header` was still reaching the nested Atlas header and replacing its intended geometry.

2. **The “НИЖЕ · МАРШРУТ ПРОВЕРКИ” cue overlapped the final Assets chapter.**
   Older absolute-position rules from the pre-Atlas trust canvas still won parts of the cascade.

3. **Home fail-closed source verification had a large dead tail after its three rows.**
   The compact verification block retained an older full-viewport minimum height through a more specific selector.

The recording otherwise showed:
- the Samurai Home composition remains visually strong;
- the new Operations + Integrity chapters are visible in Assets;
- Goal remains coherent and readable;
- the Analysis transition screen is acceptable and keeps the world atmosphere.

## Correction

Added `samuraiRecording1730Correction.css` as the final Samurai real-device cascade guard.

It now:
- isolates the Atlas header with a direct-child selector;
- forces a full-width flex composition for the title plus a fixed 44px glyph slot;
- prevents title words from breaking into the narrow legacy column;
- forces the verification cue into normal document flow;
- removes residual absolute/inset transforms from the cue;
- collapses `.sam-world__awaiting--compact` to content height;
- removes the old decorative tail from the compact Home source route;
- keeps the verification route above the fixed bottom navigation.

## Validation

PR #692:
- v3 build: PASS;
- full v3 test suite: PASS;
- V3 free-preview artifact: PASS.

Merged to `main` as:
`0ee64d1074a08bd359d4095abfdf3921dbe4bd3c`

No financial calculations, broker/trust contracts, Operations normalization, Goal logic, or DNA WORLD behavior changed.

## Resume direction

Samurai remains the only active Snowball+ reference shell.

Next active functional surface:
1. Report;
2. category drill-down;
3. currency drill-down;
4. then payout/calendar breadth;
5. rebalancing workflow;
6. Portfolio Lab;
7. technical discovery / fallen-assets tooling;
8. user-facing screener.

Do not fan these modules out to the other shells until the Samurai reference implementation is complete.
