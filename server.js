const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const TINVEST_TOKEN = process.env.TINvest_API_TOKEN;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TBANK_BASE = 'https://invest-public-api.tbank.ru/rest/';
const MOEX_BASE = 'https://iss.moex.com/iss/';

// Russian Trusted CA certificates used by T-Bank.
// Keep TLS verification enabled; never use NODE_TLS_REJECT_UNAUTHORIZED=0.
const CA_DIR = path.join(__dirname, 'certs');
const CA_FILES = [
  path.join(CA_DIR, 'russian_trusted_root_ca.pem'),
  path.join(CA_DIR, 'russian_trusted_sub_ca.pem')
];
const CA_CERTS = CA_FILES.filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f));

const tbankAgent = new https.Agent({
  ca: CA_CERTS.length ? CA_CERTS : undefined,
  rejectUnauthorized: true
});

function errorInfo(err) {
  return {
    name: err?.name || null,
    code: err?.code || err?.cause?.code || null,
    cause: err?.cause ? `${err.cause.name || 'Error'}: ${err.cause.message || String(err.cause)}` : null,
    status: err?.status || null,
    details: err?.details || null
  };
}

function moneyValue(x) {
  if (x == null) return 0;
  if (typeof x === 'number') return Number.isFinite(x) ? x : 0;
  if (typeof x === 'string') return Number(x) || 0;
  if (typeof x === 'object') {
    const units = Number(x.units || 0);
    const nano = Number(x.nano || 0);
    return units + nano / 1e9;
  }
  return 0;
}

function dateValue(op) {
  return op?.date || op?.operationDate || op?.timestamp || null;
}

function operationCash(op) {
  const candidates = [
    op?.payment,
    op?.operationAmount,
    op?.amount,
    op?.operationAmountRub
  ];

  for (const value of candidates) {
    const n = moneyValue(value);
    if (Number.isFinite(n) && n !== 0) return n;
  }
  return 0;
}

async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(15000)
    });
    const text = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      text: text.slice(0, 3000)
    };
  } catch (err) {
    return {
      ok: false,
      status: null,
      statusText: null,
      error: errorInfo(err)
    };
  }
}

async function tbankRequest(method, body) {
  if (!TINVEST_TOKEN) {
    const err = new Error('TINvest_API_TOKEN is not configured on Render');
    err.code = 'TOKEN_NOT_CONFIGURED';
    throw err;
  }

  const response = await fetch(`${TBANK_BASE}${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TINVEST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    dispatcher: undefined,
    agent: tbankAgent,
    signal: AbortSignal.timeout(20000)
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 4000) };
  }

  if (!response.ok) {
    const err = new Error(`T-Bank API HTTP ${response.status}`);
    err.status = response.status;
    err.code = data?.code || data?.errorCode || null;
    err.details = data;
    throw err;
  }

  if (data?.error) {
    const err = new Error(data.error);
    err.code = data.code || null;
    err.details = data;
    throw err;
  }

  return data;
}

async function getAccounts() {
  return tbankRequest(
    'tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts',
    { status: 'ACCOUNT_STATUS_OPEN' }
  );
}

function selectAccount(accounts) {
  const list = accounts?.accounts || [];
  if (!list.length) return null;
  return list.find(a => String(a.accessLevel || '').includes('FULL')) || list[0];
}

async function getPortfolio(accountId) {
  return tbankRequest(
    'tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio',
    { accountId, currency: 'RUB' }
  );
}

async function getOperations(accountId) {
  const operations = [];
  let cursor = '';

  for (let page = 0; page < 20; page++) {
    const body = {
      accountId,
      from: new Date(Date.now() - 3650 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
      state: 'OPERATION_STATE_EXECUTED',
      limit: 1000
    };

    if (cursor) body.cursor = cursor;

    const result = await tbankRequest(
      'tinkoff.public.invest.api.contract.v1.OperationsService/GetOperationsByCursor',
      body
    );

    const items = Array.isArray(result?.items) ? result.items : [];
    operations.push(...items);

    const next = result?.nextCursor || '';
    if (!next || next === cursor || items.length === 0) break;
    cursor = next;
  }

  return operations;
}

async function getInstrument(figi) {
  return tbankRequest(
    'tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy',
    { idType: 'INSTRUMENT_ID_TYPE_FIGI', id: figi }
  );
}

function classifyOperation(op) {
  const type = String(op?.type || '').toUpperCase();
  const name = String(op?.name || '').toLowerCase();

  if (type.includes('INPUT_SECURITIES')) return 'INPUT_SECURITIES';
  if (type.includes('OUTPUT_SECURITIES')) return 'OUTPUT_SECURITIES';
  if (type.includes('DIVIDEND') || name.includes('дивид')) return 'DIVIDEND';
  if (type.includes('COUPON') || name.includes('купон')) return 'COUPON';
  if (type.includes('BROKER_ACCOUNT_INPUT') || type.includes('_INPUT') || name.includes('пополн')) return 'INPUT';
  if (type.includes('BROKER_ACCOUNT_OUTPUT') || type.includes('_OUTPUT') || name.includes('вывод')) return 'OUTPUT';
  if (type.includes('BUY') || name.includes('покуп')) return 'BUY';
  if (type.includes('SELL') || name.includes('продаж')) return 'SELL';

  return type || 'UNKNOWN';
}

function xnpv(rate, cashflows) {
  const first = cashflows[0]?.date;
  if (!first || rate <= -1) return Infinity;

  return cashflows.reduce((sum, cf) => {
    const years = (cf.date - first) / (365.25 * 24 * 60 * 60 * 1000);
    return sum + cf.amount / Math.pow(1 + rate, years);
  }, 0);
}

function xirr(cashflows) {
  const flows = cashflows
    .filter(x => x.date && Number.isFinite(x.amount) && x.amount !== 0)
    .sort((a, b) => a.date - b.date);

  if (flows.length < 2) return null;

  let low = -0.9999;
  let high = 10;
  let fLow = xnpv(low, flows);
  let fHigh = xnpv(high, flows);

  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh) || fLow * fHigh > 0) {
    return null;
  }

  for (let i = 0; i < 150; i++) {
    const mid = (low + high) / 2;
    const fMid = xnpv(mid, flows);

    if (!Number.isFinite(fMid)) return null;
    if (Math.abs(fMid) < 1e-7) return mid;

    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return (low + high) / 2;
}

async function getMoexHistory() {
  const url =
    `${MOEX_BASE}history/engines/stock/markets/index/boards/SNDX/securities/IMOEX.json` +
    `?iss.meta=off&iss.only=history&history.columns=TRADEDATE,SECID,CLOSE&history.limit=2000`;

  const result = await safeFetch(url);

  if (!result.ok) {
    return {
      available: false,
      points: [],
      error: result.error || `HTTP ${result.status}`
    };
  }

  try {
    const data = JSON.parse(result.text);
    const rows = data?.history?.data || [];
    const points = rows
      .map(row => ({
        date: row?.[0] || null,
        value: Number(row?.[2]) || null
      }))
      .filter(p => p.date && p.value);

    return {
      available: points.length > 0,
      points,
      date: points.at(-1)?.date || null,
      value: points.at(-1)?.value || null
    };
  } catch (err) {
    return { available: false, points: [], error: errorInfo(err) };
  }
}

async function buildDashboard() {
  const accountsResponse = await getAccounts();
  const account = selectAccount(accountsResponse);

  if (!account?.id) {
    return {
      error: 'No open T-Bank investment account was returned for this token.',
      accounts: accountsResponse?.accounts || []
    };
  }

  const [portfolio, operations, moex] = await Promise.all([
    getPortfolio(account.id),
    getOperations(account.id),
    getMoexHistory()
  ]);

  const positions = (portfolio?.positions || []).map(p => ({
    figi: p.figi,
    ticker: p.ticker || p.instrumentUid || p.figi,
    name: p.name || p.ticker || p.figi,
    quantity: moneyValue(p.quantity),
    averagePrice: moneyValue(p.averagePositionPrice),
    currentPrice: moneyValue(p.currentPrice),
    expectedYield: moneyValue(p.expectedYield),
    currentValue: moneyValue(p.quantity) * moneyValue(p.currentPrice)
  }));

  for (const position of positions.slice(0, 30)) {
    if (position.figi && (!position.name || position.name === position.figi)) {
      try {
        const instrument = await getInstrument(position.figi);
        position.name =
          instrument?.instrument?.name ||
          instrument?.instrument?.ticker ||
          position.name;
        position.ticker =
          instrument?.instrument?.ticker ||
          position.ticker;
      } catch {}
    }
  }

  const portfolioValue = moneyValue(portfolio?.totalAmountPortfolio) ||
    positions.reduce((sum, p) => sum + p.currentValue, 0);

  const classified = operations.map(op => ({
    op,
    kind: classifyOperation(op),
    date: new Date(dateValue(op)),
    cash: operationCash(op)
  }));

  const inputs = classified.filter(x => x.kind === 'INPUT' && x.cash > 0);
  const outputs = classified.filter(x => x.kind === 'OUTPUT' && x.cash > 0);
  const dividends = classified.filter(x => x.kind === 'DIVIDEND');
  const coupons = classified.filter(x => x.kind === 'COUPON');

  const totalInputs = inputs.reduce((s, x) => s + x.cash, 0);
  const totalOutputs = outputs.reduce((s, x) => s + x.cash, 0);
  const passiveIncome = dividends.concat(coupons)
    .reduce((s, x) => s + Math.abs(x.cash), 0);

  const firstInput = inputs
    .filter(x => x.date instanceof Date && !Number.isNaN(x.date.getTime()))
    .sort((a, b) => a.date - b.date)[0];

  const cashflows = [
    ...inputs.map(x => ({ date: x.date, amount: -Math.abs(x.cash) })),
    ...outputs.map(x => ({ date: x.date, amount: Math.abs(x.cash) })),
    { date: new Date(), amount: portfolioValue }
  ];

  const irr = xirr(cashflows);

  const netInvested = totalInputs - totalOutputs;
  const growth = portfolioValue - netInvested;
  const growthPercent = netInvested > 0 ? (growth / netInvested) * 100 : null;

  let cagr = null;
  if (firstInput && firstInput.cash > 0 && portfolioValue > 0) {
    const years = (Date.now() - firstInput.date.getTime()) /
      (365.25 * 24 * 60 * 60 * 1000);
    if (years > 0.01) {
      cagr = (Math.pow(portfolioValue / firstInput.cash, 1 / years) - 1) * 100;
    }
  }

  const months = firstInput
    ? Math.max(1, (new Date().getFullYear() - firstInput.date.getFullYear()) * 12 +
        new Date().getMonth() - firstInput.date.getMonth() + 1)
    : 1;

  const leaders = [...positions]
    .filter(p => p.expectedYield > 0)
    .sort((a, b) => b.expectedYield - a.expectedYield)
    .slice(0, 3);

  const laggards = [...positions]
    .sort((a, b) => a.expectedYield - b.expectedYield)
    .slice(0, 3);

  return {
    updatedAt: new Date().toISOString(),
    account: {
      id: account.id,
      name: account.name || account.type || 'T-Invest account',
      type: account.type || null,
      openedDate: account.openedDate || null,
      accessLevel: account.accessLevel || null
    },
    portfolio: {
      value: portfolioValue,
      totalInputs,
      totalOutputs,
      externalFlows: netInvested,
      growth,
      growthPercent,
      cagr,
      xirr: irr == null ? null : irr * 100,
      createdAt: firstInput?.date?.toISOString() || account.openedDate || null,
      positions
    },
    passiveIncome: {
      total: passiveIncome,
      averageMonthly: passiveIncome / months,
      operationCount: dividends.length + coupons.length
    },
    leaders,
    laggards,
    moex,
    operationsSummary: {
      total: operations.length,
      inputs: inputs.length,
      outputs: outputs.length,
      dividends: dividends.length,
      coupons: coupons.length,
      buys: classified.filter(x => x.kind === 'BUY').length,
      sells: classified.filter(x => x.kind === 'SELL').length
    }
  };
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    tokenConfigured: Boolean(TINVEST_TOKEN),
    service: 'tinvest-pulse'
  });
});

app.get('/api/network-test', async (req, res) => {
  const [tbank, moex] = await Promise.all([
    safeFetch(`${TBANK_BASE}`),
    safeFetch(`${MOEX_BASE}history/engines/stock/markets/index/boards/SNDX/securities/IMOEX.json?iss.meta=off&iss.only=history&history.columns=TRADEDATE,SECID,CLOSE`)
  ]);

  res.json({
    ok: Boolean(tbank.ok || tbank.status || moex.ok || moex.status),
    tokenConfigured: Boolean(TINVEST_TOKEN),
    tbank: {
      reachable: Boolean(tbank.ok || tbank.status),
      status: tbank.status,
      statusText: tbank.statusText,
      error: tbank.error || null
    },
    moex: {
      reachable: Boolean(moex.ok || moex.status),
      status: moex.status,
      statusText: moex.statusText,
      error: moex.error || null
    },
    ca: {
      configured: CA_CERTS.length > 0,
      note: CA_CERTS.length
        ? 'T-Bank requests use the configured Russian Trusted CA chain.'
        : 'CA files were not found; default Node trust store is being used.'
    }
  });
});

app.get('/api/accounts', async (req, res) => {
  try {
    res.json(await getAccounts());
  } catch (err) {
    res.status(502).json({
      error: `T-Bank connection/API failed: ${err.message}`,
      ...errorInfo(err)
    });
  }
});

app.get('/api/operations-summary', async (req, res) => {
  try {
    const accounts = await getAccounts();
    const account = selectAccount(accounts);

    if (!account?.id) {
      return res.status(404).json({ error: 'No open account found.' });
    }

    const operations = await getOperations(account.id);

    const summary = operations.map(op => ({
      date: dateValue(op),
      type: op?.type || null,
      kind: classifyOperation(op),
      name: op?.name || null,
      figi: op?.figi || null,
      ticker: op?.ticker || null,
      quantity: moneyValue(op?.quantity),
      price: moneyValue(op?.price),
      payment: operationCash(op),
      currency: op?.currency || op?.operationCurrency?.currency || null
    }));

    const totals = {};
    for (const item of summary) {
      totals[item.kind] = (totals[item.kind] || 0) + item.payment;
    }

    res.json({
      account: {
        id: account.id,
        name: account.name || null
      },
      totalOperations: summary.length,
      totals,
      operations: summary.slice(0, 500)
    });
  } catch (err) {
    res.status(502).json({
      error: `T-Bank operations failed: ${err.message}`,
      ...errorInfo(err)
    });
  }
});

app.get('/api/moex-history', async (req, res) => {
  try {
    res.json(await getMoexHistory());
  } catch (err) {
    res.status(502).json({
      error: `MOEX history failed: ${err.message}`,
      ...errorInfo(err)
    });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    res.json(await buildDashboard());
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(502).json({
      error: `T-Bank connection/API failed: ${err.message}`,
      ...errorInfo(err)
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TInvest Pulse listening on port ${PORT}`);
});
