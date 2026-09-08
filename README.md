# tinvest-pulse v6.4 — FUND INTEL

Mobile-first T-Invest portfolio dashboard.

### Added in v6.4
- FUND INTEL button in the header.
- Real-time-ish public news search for the largest portfolio positions.
- News filtered to the last 72 hours.
- Sentiment signal: positive / negative / neutral.
- Importance score that considers freshness and portfolio weight.
- Context: why the event matters for this portfolio.
- Action guidance: hold / observe / check source, deliberately avoiding automatic buy/sell commands.
- Direct source link for every item.
- 10-minute server-side cache.

### Security
The T-Invest token is read only from Render environment variable `TINvest_API_TOKEN` and is never sent to the browser.
