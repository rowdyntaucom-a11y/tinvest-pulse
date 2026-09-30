# QVANIX Render Cold-Start Recovery v41 — 2026-09-30

A real-device screenshot showed the light Core still entering an empty untrusted state even though the broker backend itself had passed its startup warmup. Render logs exposed the missing failure mode: after the preview service woke, its upstream probe to the free live API received HTTP 502 while the API was still cold, and the dashboard proxy exhausted its two retries before the API became routable.

## Root cause

- Core Preview and Live API are separate Render free web services.
- Opening the preview can wake the preview first and the live API second.
- During that second cold start Render may answer 502 immediately at the edge.
- The previous dashboard proxy retried only twice ([0, 900] ms), so it converted a normal cold start into a visible data failure.
- The v40 isolated portfolio route was correct, but fallback broker routes could hit the same short cold-start window.

## v41 changes

### Proxy resilience
- Dashboard GET/HEAD proxy now uses a longer bounded retry window: [0, 1200, 2500, 4500, 6500] ms.
- Individual dashboard upstream attempts use a 4.5 s deadline.
- Critical fallback broker routes (/api/portfolio, /api/accounts, /api/operations-summary) receive their own bounded retry window [0, 800, 1600, 2600] ms with 3.5 s attempt deadlines.
- Secondary/public API routes retain the existing shorter generic policy.
- Adds QVANIX_BROKER_RECOVERY_PROXY diagnostics without logging balances, account ids or tokens.

### Client deadline
- The preferred dashboard request deadline is increased from 20 s to 32 s so the browser does not abort the preview bridge while Render is legitimately waking the API.
- The verified /api/portfolio fallback remains independently bounded at 8 s once dashboard recovery is exhausted.

### Mobile UX
- A temporary upstream warm-up no longer presents itself as a hard red “Нет подтверждённых данных” failure.
- The Core shows a neutral “Подключаем брокерские данные” state while automatic retry is active.
- Hard source failures still retain the explicit no-confirmed-data treatment.
- No zero portfolio is promoted as real data.

## Guardrails
No trading. No secrets changed. No fabricated history, XIRR, CAGR, benchmark or market data. DNA/Living World remains frozen.
