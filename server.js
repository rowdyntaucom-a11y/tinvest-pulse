require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API = "https://invest-public-api.tbank.ru/rest/";
const TOKEN = process.env.TINvest_API_TOKEN;

const METHODS = {
  accounts:
    "tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts",

  portfolio:
    "tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio"
};

async function tbank(method, body = {}) {
  if (!TOKEN) {
    throw new Error("TINvest_API_TOKEN is not configured");
  }

  const response = await fetch(API + method, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `T-Invest API error: ${response.status}`
    );
  }

  return data;
}

async function getAccountId() {
  const data = await tbank(METHODS.accounts, {
    status: "ACCOUNT_STATUS_OPEN"
  });

  const accounts = data.accounts || [];

  if (!accounts.length) {
    throw new Error("No open T-Invest account found");
  }

  return accounts[0].id;
}

function moneyValue(money) {
  if (!money) return 0;

  const units = Number(money.units || 0);
  const nano = Number(money.nano || 0);

  return units + nano / 1000000000;
}

app.get("/api/portfolio", async (req, res) => {
  try {
    const accountId = req.query.accountId || await getAccountId();

    const data = await tbank(METHODS.portfolio, {
      accountId,
      currency: "RUB"
    });

    const total = moneyValue(data.totalAmountPortfolio);
    const expectedYield = moneyValue(data.expectedYield);

    const positions = (data.positions || []).map((position) => {
      const current = moneyValue(position.currentPrice);
      const average = moneyValue(position.averagePositionPrice);

      const quantity =
        Number(position.quantity?.units || 0) +
        Number(position.quantity?.nano || 0) / 1000000000;

      const profit = moneyValue(position.expectedYield);

      return {
        figi: position.figi,
        ticker: position.ticker || position.instrumentUid || "—",
        name: position.name || "Актив",
        quantity,
        price: current,
        averagePrice: average,
        profit
      };
    });

    const invested = Math.max(total - expectedYield, 0);

    res.json({
      portfolio: {
        value: total,
        invested,
        profit: expectedYield,
        profitPercent:
          invested > 0 ? (expectedYield / invested) * 100 : 0,
        startDate: "-"
      },

      assets: positions,

      history: [],

      income: 0,

      imoex: 0
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TInvest Pulse started on port ${PORT}`);
});
