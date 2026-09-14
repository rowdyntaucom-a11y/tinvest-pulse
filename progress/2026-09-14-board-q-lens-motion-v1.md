# QVANIX · Board Q-LENS motion v1

Date: 2026-09-14
Starting main: `8d6d134d8646153c256c8472e0d5c1b5f01290a3`
Branch: `qvanix-board-lens-motion-v1`

## Scope

Visualisation and animation only. The Q-LENS data model, lens state calculations, labels, values, facts, destinations and navigation behavior are unchanged.

## Implemented

- Q-LENS tabs gain restrained press/selection transitions.
- Switching between Capital / Return / Income / Risk now retriggers a short presentation morph using the existing active-tab state.
- A single soft QVANIX scanner sweep crosses the lens body during a full-motion switch.
- The scanner is presentation-only and sits behind lens content; it does not block pointer interaction or alter layout.
- The implementation is CSS-only: no React state, financial value or navigation code changed.
- `reduced`, `off`, and OS `prefers-reduced-motion` paths remove the non-essential scanner/morph behavior.

## Guardrails

- No analytics formulas, portfolio/income data, payout logic, broker/API boundary, storage, routing, dependencies or financial semantics changed.
- No continuous ambient loop. The scanner runs only when the active lens changes (and once on initial render in full motion).
- Motion uses opacity/transform only and does not animate layout dimensions.

## Files

- `v2/src/features/board/qvanixBoard.css`

## Release gate

Merge only after the existing v2 build, security, bundle and core regression suite are green.
