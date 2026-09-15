# UX architecture + comprehension clean recovery

Date: 2026-09-15
Base: `origin/main` at `5fc5dc96bc52bbce1ba2dcddcd1eb98eac5a0e8d`

## Why PR #341 remains blocked

PR #341 combines its new UX work with an obsolete branch history and previously merged production/API/Asset recovery. Its six equal mobile navigation columns also forced labels to about 10 px, and fallback broker data could be presented as an actually empty portfolio. It must not be merged or repaired in place.

## Fresh-main recovery

This branch was created directly from the fetched latest `origin/main`. No broad cherry-pick was used. Only navigation, progressive disclosure, Pult hierarchy, contextual comprehension, responsive styling, and focused regression coverage were re-applied manually or selected by file, then reviewed against current main.

## Delivered UX delta

- Primary navigation uses five readable persistent phone destinations plus a separate, explicit first-class DNA action. At narrow phone width labels remain 12 px and targets are at least 44–52 px; desktop retains the complete navigation row.
- Reusable `SectionSelector` replaces secondary pill forests in Portfolio, Analytics, Risk, and Income. Risk options are grouped into primary, historical, and statistical meaning.
- Pult promotes verified capital and cumulative broker P/L, explicitly stating that P/L is not a daily change. Source and freshness remain visible.
- Portfolio UI has separate LOADING, LIVE, FALLBACK, and ERROR presentation. Only LIVE with zero confirmed positions shows the true empty state. FALLBACK/ERROR show no financial zero model.
- Contextual help is attached at meaningful first occurrences for TWR, XIRR, Health Score, tail risk, historical stress, rebalance tolerance/drift, and payout coverage. The glossary remains a shared source for concise human explanations.
- Deep workspaces retain vertical page scrolling without page-level horizontal overflow; selectors retain keyboard focus and semantic labels.

## Gated / intentionally untouched

No daily move, Daily Movers, VWAP, YTM/duration, forecast, fabricated payout, or new calculation was added. TWR, XIRR, IMOEX, risk, drift, bond, and payout methodologies are unchanged. PARTIAL/STALE were not invented because the current portfolio source boundary does not expose them safely.

Living World/DNA renderer, scene/runtime, Pixi implementation, visual assets, characters, animations, pipeline, and `#iwScene` ownership were intentionally untouched because that layer is being developed in parallel. DNA remains reachable and the existing deferred Pixi chunk remains separate.

## Review passes and gates

- QUANT: calculations unchanged; cumulative P/L is labelled honestly; missing/fallback is not zero/live.
- CODE: clean latest-main delta; reusable navigation/help models; request cleanup and existing async ownership preserved.
- MOBILE: 5 + DNA navigation, readable labels/touch targets, safe-area support, vertical depth, no page-level horizontal overflow.
- RELEASE: no old production/API/Asset recovery, canonical docs, previous checkpoints, binary artifacts, or DNA runtime changes.

Results:
- `npm run build` (v2): passed; main JS 444.35 KiB / 450 KiB budget; Pixi DNA 505.95 KiB deferred; CSS 144.07 KiB.
- `npm run test:core` (v2): passed, including UX navigation/glossary and data-state regressions.
- `npm run test:api` (root): passed.
- `npm audit --audit-level=high` (v2): 0 vulnerabilities.
- Root audit remains unavailable because the root package intentionally has no lockfile; v2 dependency audit is clean.
