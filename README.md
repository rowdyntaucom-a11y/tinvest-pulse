# tinvest-pulse v3.7 final

Mobile single-screen T-Invest portfolio dashboard.

## What's fixed
- CBR key rate is parsed automatically from the official Bank of Russia pages; no hardcoded current rate.
- Next CBR board meeting is parsed automatically from the official Bank of Russia homepage.
- Portfolio history cache is versioned to prevent an older in-process history from being reused.
- Dashboard and history API responses are explicitly no-cache.
- Frontend `app.js` has a version query string to prevent an old browser bundle from being reused.
- IMOEX history uses MOEX candles first with the official history endpoint as fallback.

## Render
Build: `npm install`
Start: `node server.js`
Environment variable: `TINvest_API_TOKEN`

Never commit a real API token to GitHub.
