const express = require('express');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const TINVEST_TOKEN = process.env.TINvest_API_TOKEN;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TBANK_BASE = 'https://invest-public-api.tbank.ru/rest/';
const MOEX_BASE = 'https://iss.moex.com/iss/';

// T-Bank currently uses the Russian Trusted CA chain. Node.js on Render
// does not necessarily include it in its default trust store.
// We download the two public CA certificates over HTTPS, verify their
// SHA-256 fingerprints, and then use them only for T-Bank connections.
// We NEVER disable certificate verification for the actual T-Bank request.
const RUSSIAN_ROOT_URL = 'https://gu-st.ru/content/Other/doc/russian_trusted_root_ca.cer';
const RUSSIAN_SUB_URL = 'https://gu-st.ru/content/Other/doc/russian_trusted_sub_ca.cer';

const RUSSIAN_ROOT_SHA256 =
  'D26D2D0231B7C39F92CC738512BA54103519E4405D68B5BD703E9788CA8ECF31';
const RUSSIAN_SUB_SHA256 =
  'BBBDE2103E790B999EC62BD03CF625A5A2E7C316E10AFE6A490EEDEAD8B3FD9B';

let tbankCaPromise = null;

function certificateSha256(pemOrDer) {
  const text = Buffer.isBuffer(pemOrDer)
    ? pemOrDer.toString('utf8')
    : String(pemOrDer);

  let der;
  if (text.includes('BEGIN CERTIFICATE')) {
    const base64 = text
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\s+/g, '');
    der = Buffer.from(base64, 'base64');
  } else {
    der = Buffer.from(pemOrDer);
  }

  return crypto.createHash('sha256').update(der).digest('hex').toUpperCase();
}

function downloadPublicCertificate(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      // Bootstrap only: no token or private data is sent here.
      // The downloaded certificate is accepted only after fingerprint verification.
      rejectUnauthorized: false,
      timeout: 15000,
      headers: { 'User-Agent': 'TInvest-Pulse/2.3' }
    }, response => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Certificate download HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });

    request.on('timeout', () => {
      request.destroy(new Error('Certificate download timeout'));
    });

    request.on('error', reject);
  });
}

async function loadTBankCA() {
  if (!tbankCaPromise) {
    tbankCaPromise = (async () => {
      const [rootPem, subPem] = await Promise.all([
        downloadPublicCertificate(RUSSIAN_ROOT_URL),
        downloadPublicCertificate(RUSSIAN_SUB_URL)
      ]);

      const rootFingerprint = certificateSha256(rootPem);
      const subFingerprint = certificateSha256(subPem);

      if (rootFingerprint !== RUSSIAN_ROOT_SHA256) {
        throw new Error(
          `Russian Trusted Root CA fingerprint mismatch: ${rootFingerprint}`
        );
      }

      if (subFingerprint !== RUSSIAN_SUB_SHA256) {
        throw new Error(
          `Russian Trusted Sub CA fingerprint mismatch: ${subFingerprint}`
        );
      }

      return {
        rootPem,
        subPem,
        fingerprints: {
          root: rootFingerprint,
          sub: subFingerprint
        }
      };
    })();
  }

  return tbankCaPromise;
}

async function tbankHttpsRequest(method, url, body, extraHeaders = {}) {
  const ca = await loadTBankCA();

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = body == null ? null : JSON.stringify(body);

    const request = https.request({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: `${parsed.pathname}${parsed.search}`,
      method,
      ca: [ca.rootPem, ca.subPem],
      rejectUnauthorized: true,
      servername: parsed.hostname,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...extraHeaders
      }
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: response.statusCode,
          statusText: response.statusMessage,
          text
        });
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error('T-Bank HTTPS request timeout'));
    });

    request.on('error', reject);

    if (payload) request.write(payload);
    request.end();
  });
}

function errorInfo(err) {
  return {
    name: err?.name || null,
    code: err?.code || err?.cause?.code || null,
    cause: err?.cause ? `${err.cause.name || 'Error'}: ${err.cause.message || String(err.cause)}` : null,
    status: err?.status || err?.response?.status || null,
    details: err?.details || err?.response?.data || null
  };
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
      text: text.slice(0, 2000)
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

  const response = await tbankHttpsRequest(
    'POST',
    `${TBANK_BASE}${method}`,
    body,
    {
      'Authorization': `Bearer ${TINVEST_TOKEN}`
    }
  );

  let data;
  try {
    data = JSON.parse(response.text);
  } catch {
    data = { raw: response.text.slice(0, 4000) };
  }

  if (response.status < 200 || response.status >= 300) {
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
  return tbankRequest('tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts', {
    status: 'ACCOUNT_STATUS_OPEN'
  });
}

function selectAccount(accounts) {
  const list = accounts?.accounts || [];
  if (!list.length) return null;

  // Prefer a full-access account when T-Bank returns accessLevel.
  return (
    list.find(a => String(a.accessLevel || '').toUpperCase().includes('FULL')) ||
    list[0]
  );
}

async function getPortfolio(accountId) {
  return tbankRequest('tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio', {
    accountId,
    currency: 'RUB'
  });
}

async function getOperations(accountId) {
  const operations = [];
  let cursor = '';

  for (let page = 0; page < 10; page++) {
    const body = {
      accountId,
      from: new Date(Date.now() - 3650 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
      state: 'OPERATION_STATE_EXECUTED',
      timeout: '30s',
      limit: 1000
    };

    if (cursor) body.cursor = cursor;

    const result = await tbankRequest(
      'tinkoff.public.invest.api.contract.v1.OperationsService/GetOperationsByCursor',
      body
    );

    if (Array.isArray(result?.items)) operations.push(...result.items);

    const next = result?.nextCursor || '';
    if (!next || next === cursor || !result?.items?.length) break;
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

function moneyValue(x) {
  if (x == null) return 0;
  if (typeof x === 'number') return x;
  if (typeof x === 'string') return Number(x) || 0;
  if (typeof x === 'object') {
    const units = Number(x.units || 0);
    const nano = Number(x.nano || 0);
    return units + nano / 1e9;
  }
  return 0;
}

function operationCash(op) {
  if (!op) return 0;

  const candidates = [
    op.payment,
    op.amount,
    op.operationAmount,
    op.operationAmountRub
  ];

  for (const value of candidates) {
    const n = moneyValue(value);
    if (Number.isFinite(n) && n !== 0) return n;
  }

  return 0;
}

function isExternalCashOperation(op) {
  const type = String(op?.type || '').toUpperCase();
  const name = String(op?.name || '').toLowerCase();

  return (
    type.includes('BROKER_ACCOUNT') ||
    type.includes('TRANSFER') ||
    type.includes('CASH') ||
    name.includes('пополн') ||
    name.includes('вывод') ||
    name.includes('перевод')
  );
}

function isIncomeOperation(op) {
  const type = String(op?.type || '').toUpperCase();
  const name = String(op?.name || '').toLowerCase();

  return (
    type.includes('DIVIDEND') ||
    type.includes('COUPON') ||
    name.includes('дивид') ||
    name.includes('купон')
  );
}

function safeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function xnpv(rate, cashflows) {
  if (rate <= -1) return Infinity;
  const first = cashflows[0]?.date;
  if (!first) return Infinity;

  return cashflows.reduce((sum, cf) => {
    const years = (cf.date - first) / (365 * 24 * 60 * 60 * 1000);
    return sum + cf.amount / Math.pow(1 + rate, years);
  }, 0);
}

function xirr(cashflows) {
  const flows = cashflows
    .filter(x => Number.isFinite(x.amount) && x.amount !== 0 && x.date)
    .sort((a, b) => a.date - b.date);

  if (flows.length < 2) return null;

  let low = -0.9999;
  let high = 10;

  const fLow = xnpv(low, flows);
  const fHigh = xnpv(high, flows);

  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh) || fLow * fHigh > 0) {
    return null;
  }

  for (let i = 0; i < 120; i++) {
    const mid = (low + high) / 2;
    const fMid = xnpv(mid, flows);

    if (!Number.isFinite(fMid)) return null;
    if (Math.abs(fMid) < 0.000001) return mid;

    if (fLow * fMid <= 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}

async function getMoex() {
  const url =
    `${MOEX_BASE}engines/stock/markets/index/boards/SNDX/securities/IMOEX.json` +
    `?iss.meta=off&iss.only=history&history.columns=TRADEDATE,SECID,CLOSE` +
    `&history.cursor=0`;

  const result = await safeFetch(url);

  if (!result.ok) {
    return { available: false, error: result.error || `HTTP ${result.status}` };
  }

  try {
    const data = JSON.parse(result.text);
    const rows = data?.history?.data || [];
    const last = rows[rows.length - 1];

    return {
      available: true,
      date: last?.[0] || null,
      value: Number(last?.[2]) || null
    };
  } catch (err) {
    return { available: false, error: errorInfo(err) };
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
    getMoex()
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

  // Enrich a small number of positions with instrument names.
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
      } catch {
        // Keep the portfolio response usable if one instrument lookup fails.
      }
    }
  }

  const portfolioValue =
    moneyValue(portfolio?.totalAmountPortfolio) ||
    positions.reduce((sum, p) => sum + p.currentValue, 0);

  const executed = Array.isArray(operations) ? operations : [];

  const externalFlows = executed
    .filter(isExternalCashOperation)
    .map(op => ({
      date: safeDate(op.date),
      amount: operationCash(op)
    }))
    .filter(x => x.date && x.amount !== 0);

  const totalExternal =
    externalFlows.reduce((sum, x) => sum + x.amount, 0);

  const incomeOperations = executed.filter(isIncomeOperation);
  const passiveIncome =
    incomeOperations.reduce((sum, op) => sum + Math.abs(operationCash(op)), 0);

  const firstInvestment = externalFlows
    .filter(x => x.amount > 0)
    .sort((a, b) => a.date - b.date)[0];

  const today = new Date();

  const cashflows = externalFlows.map(x => ({
    date: x.date,
    amount: -x.amount
  }));

  cashflows.push({ date: today, amount: portfolioValue });

  const irr = xirr(cashflows);

  let growthPercent = null;
  if (totalExternal > 0) {
    growthPercent = ((portfolioValue - totalExternal) / totalExternal) * 100;
  }

  let cagr = null;
  if (firstInvestment && portfolioValue > 0) {
    const years = (today - firstInvestment.date) / (365.25 * 24 * 60 * 60 * 1000);
    if (years > 0.01 && firstInvestment.amount > 0) {
      cagr = (Math.pow(portfolioValue / firstInvestment.amount, 1 / years) - 1) * 100;
    }
  }

  const months =
    firstInvestment
      ? Math.max(
          1,
          (today.getFullYear() - firstInvestment.date.getFullYear()) * 12 +
          (today.getMonth() - firstInvestment.date.getMonth()) + 1
        )
      : 1;

  const avgMonthlyPassiveIncome = passiveIncome / months;

  const sorted = [...positions].sort(
    (a, b) => b.expectedYield - a.expectedYield
  );

  const leaders = sorted.slice(0, 3);
  const laggards = [...positions]
    .sort((a, b) => a.expectedYield - b.expectedYield)
    .slice(0, 3);

  return {
    updatedAt: new Date().toISOString(),
    account: {
      id: account.id,
      name: account.name || account.type || 'T-Invest account'
    },
    portfolio: {
      value: portfolioValue,
      externalFlows: totalExternal,
      growth: portfolioValue - totalExternal,
      growthPercent,
      cagr,
      xirr: irr == null ? null : irr * 100,
      createdAt: firstInvestment?.date?.toISOString() || null,
      positions
    },
    passiveIncome: {
      total: passiveIncome,
      averageMonthly: avgMonthlyPassiveIncome,
      operationCount: incomeOperations.length
    },
    leaders,
    laggards,
    moex,
    note: 'CAGR is a simple estimate from the first external investment. XIRR is the preferred return metric when there are multiple cash flows.'
  };
}

// Basic health check. Does not contact T-Bank.
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    tokenConfigured: Boolean(TINVEST_TOKEN),
    service: 'tinvest-pulse'
  });
});

// Network diagnostic. This does NOT expose the token.
app.get('/api/network-test', async (req, res) => {
  const [tbank, moex] = await Promise.all([
    (async () => {
      try {
        const r = await tbankHttpsRequest('GET', 'https://invest-public-api.tbank.ru/rest/', null);
        return {
          ok: r.status >= 200 && r.status < 500,
          status: r.status,
          statusText: r.statusText,
          error: null
        };
      } catch (err) {
        return {
          ok: false,
          status: null,
          statusText: null,
          error: errorInfo(err)
        };
      }
    })(),
    safeFetch('https://iss.moex.com/iss/history/engines/stock/markets/index/boards/SNDX/securities/IMOEX.json?iss.meta=off&iss.only=history&history.columns=TRADEDATE,SECID,CLOSE')
  ]);

  res.json({
    ok: tbank.ok || moex.ok,
    tokenConfigured: Boolean(TINVEST_TOKEN),
    tbank: {
      reachable: tbank.ok || Boolean(tbank.status),
      status: tbank.status,
      statusText: tbank.statusText,
      error: tbank.error || null
    },
    moex: {
      reachable: moex.ok || Boolean(moex.status),
      status: moex.status,
      statusText: moex.statusText,
      error: moex.error || null
    },
    ca: {
      configured: Boolean(tbankCaPromise),
      note: 'T-Bank requests use the verified Russian Trusted Root/Sub CA chain.'
    },
    interpretation:
      tbank.ok || tbank.status
        ? 'T-Bank HTTPS connection is working with the Russian Trusted CA. If /api/accounts still fails, inspect the authenticated API response.'
        : 'T-Bank HTTPS is still failing. Check the error above; the server does not disable TLS verification for T-Bank.'
  });
});

app.get('/api/accounts', async (req, res) => {
  try {
    const data = await getAccounts();
    res.json(data);
  } catch (err) {
    res.status(502).json({
      error: `T-Bank connection/API failed: ${err.message}`,
      ...errorInfo(err)
    });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const data = await buildDashboard();
    res.json(data);
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

async function start() {
  try {
    await loadTBankCA();
    console.log('Russian Trusted CA loaded and fingerprint-verified.');
  } catch (err) {
    console.error('WARNING: could not preload Russian Trusted CA:', err.message);
    console.error('T-Bank requests will report the certificate bootstrap error.');
  }

  app.listen(PORT, () => {
    console.log(`TInvest Pulse listening on port ${PORT}`);
  });
}

start();
