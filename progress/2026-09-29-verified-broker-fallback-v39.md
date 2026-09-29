# QVANIX Verified Broker Fallback v39 — 2026-09-29

Real-device Core still showed “Нет подтверждённых данных” when the composed /api/dashboard path was unavailable. The app already had an older read-only /api/portfolio broker path, but transient dashboard 5xx/timeout states deliberately skipped it, so one failing composition route could hide an otherwise healthy broker portfolio.

This patch changes recovery without weakening data honesty:

- /api/dashboard remains the preferred full-fidelity source.
- If dashboard fails, Core makes one bounded 8 s read to /api/portfolio.
- A successful fallback is marked as source `portfolio`, never as the full dashboard.
- Only real broker portfolio value/positions/P&L are shown from that reduced contract.
- History, XIRR, CAGR, income and market fields remain unavailable unless independently loaded; nothing is synthesized to fill gaps.
- Core keeps the verified fallback visible and retries the full dashboard in the background with the existing bounded recovery loop.
- The mobile header and recovery banner explicitly say “Базовые данные” / “Портфель восстановлен через резервный брокерский канал” so degraded source quality is visible rather than hidden.
- Session cache remains short-lived and trusted-only.

Regression coverage now verifies both the transport policy and an actual 503 dashboard → verified portfolio recovery case.

No trading, no token changes, no fabricated analytics, DNA remains frozen. Active product remains the light QVANIX Financial Core.
