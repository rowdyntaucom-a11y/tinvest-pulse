# Кряхтящий фонд — v4.0

Mobile-first T-Invest portfolio dashboard.

## v4.0
- Five switchable visual styles: Neon, Emerald, Graphite, Cyber, Aurora.
- PULSE screenshot button.
- Accurate TWR portfolio history vs IMOEX.
- New chart modes: Рост / Стоимость / Прибыль.
- VS MOEX spread in percentage points on the latest common date.
- Passive income shows month / day / year.
- Historical value and invested series are returned by the dashboard.
- CBR key rate and next meeting are fetched live.
- Token remains server-side in Render environment variable `TINvest_API_TOKEN`.

## Deploy
Build: `npm install`
Start: `node server.js`


Version 4.5: VS MOEX compares the actual plotted portfolio and IMOEX series without requiring identical date serialization.
