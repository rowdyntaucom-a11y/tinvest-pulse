# QVANIX autonomous checkpoint — 2026-09-13

## DNA / Living World single-owner runtime

Production merge: `0b1b3bf37ad77c44887e6d4165b5814891294b2c` via PR #190.

### Why
The previous Living World implementation accumulated multiple scene owners/update loops. In v2, `WorldStage` still had no explicit ownership boundary, so a duplicate/parallel mount could create another Pixi `Application`, canvas and ticker and recreate the old class of scene-overwrite bugs.

### Accepted invariant

**ONE WORLD → ONE RUNTIME OWNER → ONE PIXI APPLICATION → ONE TICKER.**

- Added renderer-neutral `worldRuntimeOwnership.ts`.
- Only one `WorldStage` can acquire the process-local world lease at a time.
- Duplicate mounts fail closed instead of starting a second Pixi runtime.
- React cleanup and renderer boot failure release the lease.
- Stale/idempotent release cannot tear down a newer owner.
- Financial formulas, XP rules and `WorldState` stay outside the Pixi render loop.
- No art direction, XP economy, backend route or portfolio calculation changed.

### Regression coverage
`worldRuntimeOwnership.test.ts` locks:
- first-owner acquisition;
- duplicate-owner rejection;
- blocked release cannot affect active owner;
- reacquisition after clean release;
- stale-release safety;
- idempotent release;
- deterministic fallback owner id.

The regression is included in mandatory `test:core`.

### Bundle-budget incident and resolution
The first PR build failed after TypeScript/Vite transformation because the deferred `pixi-dna` chunk grew to about 857 KiB and breached the existing 525 KiB DNA/Pixi budget.

The budget was **not increased**. The renderer boot failure handling was moved outside the dynamic Pixi import path so Vite/Rollup could retain the existing tree-shaking behavior while the lease still releases correctly on asynchronous boot failure.

Repeat CI run #299 then passed the full pipeline, including build, dependency-security gates, `test:core`, asset-history regression, and backend/runtime syntax checks.

### Production validation
Render auto-deployed merge `0b1b3bf37ad77c44887e6d4165b5814891294b2c`.

- `tinvest-pulse-v2-preview`: `live`.
- `tinvest-pulse` primary: `live`.

No manual Render deploy was triggered.

### Council / scope
- Quant: no financial or XP calculation changed.
- Code: explicit lease boundary + deterministic regression.
- Mobile: no layout/CSS/art change; duplicate runtimes are prevented before Pixi initialization.
- Release: scoped to DNA runtime lifecycle, tests and documentation; both production services validated live.

### Next Living World architecture steps
Keep the renderer separated into: deterministic financial core → XP/event ledger → `WorldState` → world-event layer → single-owner renderer → layered production art. Do not return to versioned renderer patch chains or multiple modules owning `#iwScene`/Pixi lifecycle.
