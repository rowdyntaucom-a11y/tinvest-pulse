# QVANIX Broker Hot Read Cache v29 — 2026-09-29

Real-device follow-up showed that v28 removed repeated OperationsByCursor work, but the early dashboard warmup still had no completion log while history warmup finished. That exposed a second duplication path: dashboard warmup and history warmup could issue independent GetAccounts/GetPortfolio calls during startup.

This pass adds:
- 60 s single-flight cache for GetAccounts;
- 15 s single-flight cache for GetPortfolio;
- concurrent dashboard/history/user refreshes now share the same in-flight broker reads;
- portfolio cache stays deliberately short so valuation remains close to live while preventing startup fan-out.

Together with v28, expensive operations history is cached for 5 min with background refresh after 60 s, while the live portfolio itself is cached only briefly.

No trading, no secrets in logs, no fabricated portfolio values, DNA unchanged.
