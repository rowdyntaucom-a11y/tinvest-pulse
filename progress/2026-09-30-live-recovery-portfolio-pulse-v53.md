# QVANIX Live Recovery + Portfolio Pulse v53 — 2026-09-30

Large patch continuing the active light Financial Core and Snowball-parity direction. DNA / Living World remains frozen.

## Live recovery hardening

The Core reconnect path now:
- cancels stale scheduled retries when a fresh refresh starts;
- retries immediately when the browser returns online;
- refreshes immediately on focus/visibility while there is still no trusted snapshot;
- keeps the existing trusted session snapshot behavior and fail-closed semantics.

This targets the real Render cold-start sequence where the UI can open before the broker API is ready and must recover without the user repeatedly reloading.

## Portfolio pulse

The home screen gains a compact verified-data pulse:
- open-position P/L total;
- positive vs negative open positions;
- largest current holding and its portfolio weight;
- drawdown from the peak of the confirmed portfolio-value history;
- four largest absolute contributors/detractors to current open-position P/L;
- official verified instrument avatars are reused where available;
- each attribution row opens the existing asset detail.

The UI explicitly states that open-position P/L is **not** a daily price move. No daily mover data is fabricated.

## Responsive behavior

The pulse uses:
- a 2-column phone KPI layout with the main P/L answer spanning the row;
- compact contribution bars on phone;
- larger typography and spacing on desktop;
- existing QVANIX light-Core visual language.

## Guardrails

- no expectedYield reinterpretation beyond the existing broker open-position P/L meaning;
- no fabricated quotes, daily moves or forecasts;
- no trading capability;
- no benchmark prediction;
- no DNA / Living World changes.
