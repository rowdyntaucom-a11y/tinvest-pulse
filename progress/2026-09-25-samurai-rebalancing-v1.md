# QVANIX — Samurai Rebalancing Workflow v1

Date: 2026-09-25

## Source

Samsung recording `1000031735.mp4`.

The recording confirmed the current Samurai reference shell is visually stable enough to keep advancing functional breadth:
- Home fail-closed hierarchy remains clean;
- Assets Atlas is readable and the 10-chapter breadth remains visible;
- Analysis / Income transitions preserve the world atmosphere;
- Income exposes the separate Market chapter;
- Goal Lab keeps the Samurai-authored controls;
- no new blocking real-device regression was found in this pass.

## Completed

PR #699 adds the first full Samurai rebalancing workflow on top of the existing deterministic v2 engines.

### Product surface

Analysis now has a sixth Samurai chapter:
- **06 · Rebalancing**

The user explicitly defines a two-class target:
- equity percentage is entered by the user;
- bond percentage is shown transparently as `100% - equity`;
- values 0% / 100% remain invalid for the current two-class v1 engine.

The workspace shows:
- current equity share;
- current bond share;
- weight outside the two supported classes;
- current vs target drift in percentage points;
- whether the target is inside the configured tolerance;
- deterministic scenario modes:
  - reallocate existing assigned capital;
  - add capital;
  - withdraw capital;
- class-level target values and deltas;
- whether an exact target is reachable with the selected one-direction flow;
- the minimum flow needed for an exact target when the selected amount is insufficient.

### Safety / product boundary

The workflow intentionally does **not**:
- select individual securities;
- create orders;
- convert class deltas into buy/sell instructions;
- rank strategies;
- invent contribution or withdrawal amounts.

Unassigned assets remain unchanged and are explicitly surfaced.

## Validation

Merged PR: #699
Main feature commit: `54f12601833d4e466790986742ab29751ae06b1f`

Final required gates:
- v3 build: PASS;
- full v3 tests: PASS;
- V3 free-preview artifact: PASS.

## Resume direction

Samurai remains the single Snowball+ reference shell.

Next active milestone:
1. Portfolio Laboratory / historical strategy comparison;
2. technical discovery / fallen-assets tooling;
3. user-facing screener;
4. verified fundamentals and bond-yield metrics only after defensible source contracts exist.

Broad-market dividend discovery remains a separate source-integration task.

DNA WORLD remains frozen.
