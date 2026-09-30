# QVANIX Market + Tools Depth v51 — 2026-09-30

This patch follows the latest real-device recording after v50 and moves the active light Financial Core from navigation polish into functional depth.

## Market × portfolio coverage
The market pulse now reports how much of the current confirmed portfolio capital is represented by exact ticker matches in the current public MOEX TQBR slice.

Added:
- matched portfolio capital;
- total current portfolio capital;
- TQBR capital coverage ratio;
- explicit list of portfolio tickers that are outside the TQBR slice.

This is not a quality score. A missing ticker is shown as “outside the TQBR slice”, not as missing from the portfolio or as an inferred market match.

## Portfolio-only screener
The public TQBR screener now supports an exact **“Только мой портфель”** filter when current portfolio tickers are available.

The filter:
- uses exact ticker identity only;
- does not fuzzy-match names;
- composes with existing move / turnover / listing / sort filters;
- remains descriptive, not a recommendation engine.

## Futures tool: current portfolio context
The manual futures WHAT IF tool now receives the current confirmed positions and displays a separate context block:
- number of current futures positions;
- absolute contract quantity;
- broker P/L across current futures positions;
- current futures tickers.

The scenario inputs remain manual. Existing positions are never copied into WHAT IF contract specifications because point value, margin, expiry and basis inputs require separate confirmed specification data.

If there are no current futures positions, QVANIX states that explicitly while leaving the manual scenario calculator available.

## Guardrails
- no order entry or trading;
- no fuzzy market identity;
- no inferred contract specification;
- no fabricated daily returns;
- no financial formula changes;
- expectedYield remains broker open-position P/L context only;
- Living World / DNA remains frozen.
