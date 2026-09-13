# QVANIX DNA · Living World memory presentation v1

Date: 2026-09-13
Starting main: `4d9dcfd54990a0ee5d3570d051127e29be166cfa`.

## Scope

- Adds a renderer-neutral presentation snapshot derived only from persisted Chronicle events.
- Exposes deterministic total history count, first/last recorded timestamps, per-channel counts, first/last event identity and a bounded recent-moment list.
- Each memory moment receives only an existing semantic presentation channel plus recurrence metadata (`sequenceInChannel`, `isFirstInChannel`).
- Unknown future event kinds fail safely to the existing generic presentation channel.
- The contract deliberately does not choose scars, monuments, buildings, colors, animations, sound, particles, camera motion, visual intensity or reward magnitude.

## Council

- Quant/product: no finance calculation, XP award, level economy, wealth input, recommendation or weather inference.
- Code: reuses the existing Chronicle parser and event-presentation mapping; no second event source or acknowledgement state is introduced.
- Mobile: recent moments are explicitly bounded; this pass adds no UI/layout/navigation change.
- Release: frontend deterministic boundary/tests/docs only; no backend/broker route, secret, legal/payment wording, dependency or infrastructure change.

## Validation

- Initial CI build passed TypeScript/Vite and bundle budgets, but direct Node `test:core` could not resolve production bundler-style extensionless imports.
- Fixed without changing application-wide import conventions: recurrence aggregation is extracted into dependency-free `worldMemoryPresentationPolicy.ts`, while `worldMemoryPresentation.ts` remains the production Chronicle + channel adapter.
- Policy regression covers empty history, deterministic per-channel first/last occurrence, recurrence sequence, recent-list limits and stable ordering.
- Existing Chronicle and event-presentation regressions continue to cover corrupt-envelope fail-closed behavior, duplicate-ID immutability and unknown-kind generic fallback.
- Test remains registered in mandatory `test:core`.
- Merge only after the replacement `v2 build` is fully green and both Render queues remain healthy/settled.

## Next

- Add an explicit lifecycle-milestone boundary for world-native milestones such as first observed sunrise. It must be idempotent and must not infer financial meaning from local time.
- Later reviewed art may map memory metadata to visible scars/monuments/terrain changes; that mapping is intentionally not chosen in this pass.
