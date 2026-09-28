# QVANIX — Dividend Discovery Income → Market integration

Date: 2026-09-28
Base: `origin/main` at `d695b7e72ed980e3dad5cf5c06f1bbd5555663fd`
Integration branch: `integration/dividend-discovery-income-market-v1`

## Audit and transfer decision

`origin/feat/dividend-discovery-v1` was 11 commits ahead of current main and had no divergent main commits. Its deterministic core, read-only API route, API tests and responsive presentation were retained as the coherent feature boundary, then tightened during integration.

The old branch's two navigation commits were deliberately not replayed: one temporarily added Market as a fifth peer section and the next reverted it because the workspace was not mounted. Replaying that pair would preserve neither the requested information architecture nor a working route. The old checkpoint was used as evidence, but a new checkpoint records the completed integration.

## Integrated architecture

- Income's stable top level is `Обзор / История / Рынок` on phone, tablet and desktop.
- Existing capabilities are preserved through local progressive disclosure:
  - Overview: Summary and Calendar;
  - History: Sources and Taxes/IIS;
  - Market: Broad-Market Dividend Discovery.
- Dividend Discovery is lazy-loaded only when Market is selected.
- The backend calls the existing server-side T-Invest request boundary for Shares and GetAssetFundamentals. No broker credential or account identity is added to the browser contract.

## Financial/data contract

- Exact identity join: `share.assetUid === fundamental.assetUid`; ticker and name never select a fundamental record.
- Deterministic ordering: dividend yield descending, market capitalization descending, ticker, then asset UID.
- Only positive reported dividend yields appear. Missing, zero and negative values are counted separately and remain unavailable.
- Market capitalization stays nullable and is rendered as `нет данных`, never zero.
- Coverage exposes share count, fundamental identities, exact matches, usable dividend rows, missing yields, non-positive yields and duplicate identities.
- Duplicate share/fundamental identities are rejected after the first deterministic source record and surfaced in coverage.
- Upstream failure returns HTTP 502 with an empty unavailable payload. Raw upstream errors are not returned or logged.

## Product and security guarantees

- Descriptive, read-only analytics only.
- No QVANIX score, forecast, personalized recommendation, buy/sell CTA, broker execution or order API.
- No synthetic dividends or fallback fundamentals.
- No frontend/localStorage broker secret and no new credential transport.
- Living World / DNA untouched.

## Validation

- Dividend core and route regression tests cover exact identity, deterministic ordering, missing/zero/negative yield, duplicate identity, batching, coverage and fail-closed response.
- Income navigation regression fixes the canonical top level and verifies Calendar, Sources, Taxes/IIS and Dividend Discovery remain mounted.
- Root API suite, v2 core suite and v2 production build pass locally.

## Remaining review risk

- GetAssetFundamentals coverage depends on live T-Invest availability and field population; the UI intentionally reports insufficient coverage when no usable rows exist.
- The first 40 matching rows are presented to cap DOM density; server ordering and full coverage counts remain intact.
- Real Samsung/Android and wide-desktop visual acceptance remain project-lead review items after the PR preview is available.
