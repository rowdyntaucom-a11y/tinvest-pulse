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

// T-Bank currently uses the Russian Trusted CA chain.
// The certificates are embedded locally so the server does not need to
// bootstrap a TLS connection to download its own trust anchors.
// T-Bank's official documentation says Node.js needs the Russian Trusted
// Root CA and Russian Trusted Sub CA for this API.
const RUSSIAN_TRUSTED_CA_ROOT = `-----BEGIN CERTIFICATE-----
MIIFwjCCA6qgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwcDELMAkGA1UEBhMCUlUx
PzA9BgNVBAoMNlRoZSBNaW5pc3RyeSBvZiBEaWdpdGFsIERldmVsb3BtZW50IGFu
ZCBDb21tdW5pY2F0aW9uczEgMB4GA1UEAwwXUnVzc2lhbiBUcnVzdGVkIFJvb3Qg
Q0EwHhcNMjIwMzAxMjEwNDE1WhcNMzIwMjI3MjEwNDE1WjBwMQswCQYDVQQGEwJS
VTE/MD0GA1UECgw2VGhlIE1pbmlzdHJ5IG9mIERpZ2l0YWwgRGV2ZWxvcG1lbnQg
YW5kIENvbW11bmljYXRpb25zMSAwHgYDVQQDDBdSdXNzaWFuIFRydXN0ZWQgUm9v
dCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMfFOZ8pUAL3+r2n
qqE0Zp52selXsKGFYoG0GM5bwz1bSFtCt+AZQMhkWQheI3poZAToYJu69pHLKS6Q
XBiwBC1cvzYmUYKMYZC7jE5YhEU2bSL0mX7NaMxMDmH2/NwuOVRj8OImVa5s1F4U
zn4Kv3PFlDBjjSjXKVY9kmjUBsXQrIHeaqmUIsPIlNWUnimXS0I0abExqkbdrXbX
YwCOXhOO2pDUx3ckmJlCMUGacUTnylyQW2VsJIyIGA8V0xzdaeUXg0VZ6ZmNUr5Y
Ber/EAOLPb8NYpsAhJe2mXjMB/J9HNsoFMBFJ0lLOT/+dQvjbdRZoOT8eqJpWnVD
U+QL/qEZnz57N88OWM3rabJkRNdU/Z7x5SFIM9FrqtN8xewsiBWBI0K6XFuOBOTD
4V08o4TzJ8+Ccq5XlCUW2L48pZNCYuBDfBh7FxkB7qDgGDiaftEkZZfApRg2E+M9
G8wkNKTPLDc4wH0FDTijhgxR3Y4PiS1HL2Zhw7bD3CbslmEGgfnnZojNkJtcLeBH
BLa52/dSwNU4WWLubaYSiAmA9IUMX1/RpfpxOxd4Ykmhz97oFbUaDJFipIggx5sX
ePAlkTdWnv+RWBxlJwMQ25oEHmRguNYf4Zr/Rxr9cS93Y+mdXIZaBEE0KS2iLRqa
OiWBki9IMQU4phqPOBAaG7A+eP8PAgMBAAGjZjBkMB0GA1UdDgQWBBTh0YHlzlpf
BKrS6badZrHF+qwshzAfBgNVHSMEGDAWgBTh0YHlzlpfBKrS6badZrHF+qwshzAS
BgNVHRMBAf8ECDAGAQH/AgEEMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsF
AAOCAgEAALIY1wkilt/urfEVM5vKzr6utOeDWCUczmWX/RX4ljpRdgF+5fAIS4vH
tmXkqpSCOVeWUrJV9QvZn6L227ZwuE15cWi8DCDal3Ue90WgAJJZMfTshN4OI8cq
W9E4EG9wglbEtMnObHlms8F3CHmrw3k6KmUkWGoa+/ENmcVl68u/cMRl1JbW2bM+
/3A+SAg2c6iPDlehczKx2oa95QW0SkPPWGuNA/CE8CpyANIhu9XFrj3RQ3EqeRcS
AQQod1RNuHpfETLU/A2gMmvn/w/sx7TB3W5BPs6rprOA37tutPq9u6FTZOcG1Oqj
C/B7yTqgI7rbyvox7DEXoX7rIiEqyNNUguTk/u3SZ4VXE2kmxdmSh3TQvybfbnXV
4JbCZVaqiZraqc7oZMnRoWrXRG3ztbnbes/9qhRGI7PqXqeKJBztxRTEVj8ONs1d
WN5szTwaPIvhkhO3CO5ErU2rVdUr89wKpNXbBODFKRtgxUT70YpmJ46VVaqdAhOZ
D9EUUn4YaeLaS8AjSF/h7UkjOibNc4qVDiPP+rkehFWM66PVnP1Msh93tc+taIfC
EYVMxjh8zNbFuoc7fzvvrFILLe7ifvEIUqSVIC/AzplM/Jxw7buXFeGP1qVCBEHq
391d/9RAfaZ12zkwFsl+IKwE/OZxW8AHa9i1p4GO0YSNuczzEm4=
-----END CERTIFICATE-----`;
const RUSSIAN_TRUSTED_CA_SUB = `-----BEGIN CERTIFICATE-----
MIIHQjCCBSqgAwIBAgICEAIwDQYJKoZIhvcNAQELBQAwcDELMAkGA1UEBhMCUlUx
PzA9BgNVBAoMNlRoZSBNaW5pc3RyeSBvZiBEaWdpdGFsIERldmVsb3BtZW50IGFu
ZCBDb21tdW5pY2F0aW9uczEgMB4GA1UEAwwXUnVzc2lhbiBUcnVzdGVkIFJvb3Qg
Q0EwHhcNMjIwMzAyMTEyNTE5WhcNMjcwMzA2MTEyNTE5WjBvMQswCQYDVQQGEwJS
VTE/MD0GA1UECgw2VGhlIE1pbmlzdHJ5IG9mIERpZ2l0YWwgRGV2ZWxvcG1lbnQg
YW5kIENvbW11bmljYXRpb25zMR8wHQYDVQQDDBZSdXNzaWFuIFRydXN0ZWQgU3Vi
IENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA9YPqBKOk19NFymrE
wehzrhBEgT2atLezpduB24mQ7CiOa/HVpFCDRZzdxqlh8drku408/tTmWzlNH/br
HuQhZ/miWKOf35lpKzjyBd6TPM23uAfJvEOQ2/dnKGGJbsUo1/udKSvxQwVHpVv3
S80OlluKfhWPDEXQpgyFqIzPoxIQTLZ0deirZwMVHarZ5u8HqHetRuAtmO2ZDGQn
vVOYJAjls+Hiueq7Lj7Oce7CQsTwVZeP+XQx28PAaEZ3y6sQEt6rL06ddpSdoTMp
BnCqTbxW+eWMyjkIn6t9GBtUV45yB1EkHNnj2Ex4GwCiN9T84QQjKSr+8f0psGrZ
vPbCbQAwNFJjisLixnjlGPLKa5vOmNwIh/LAyUW5DjpkCx004LPDuqPpFsKXNKpa
L2Dm6uc0x4Jo5m+gUTVORB6hOSzWnWDj2GWfomLzzyjG81DRGFBpco/O93zecsIN
3SL2Ysjpq1zdoS01CMYxie//9zWvYwzI25/OZigtnpCIrcd2j1Y6dMUFQAzAtHE+
qsXflSL8HIS+IJEFIQobLlYhHkoE3avgNx5jlu+OLYe0dF0Ykx1PGNjbwqvTX37R
Cn32NMjlotW2QcGEZhDKj+3urZizp5xdTPZitA+aEjZM/Ni71VOdiOP0igbw6asZ
2fxdozZ1TnSSYNYvNATwthNmZysCAwEAAaOCAeUwggHhMBIGA1UdEwEB/wQIMAYB
Af8CAQAwDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQWBBTR4XENCy2BTm6KSo9MI7NM
XqtpCzAfBgNVHSMEGDAWgBTh0YHlzlpfBKrS6badZrHF+qwshzCBxwYIKwYBBQUH
AQEEgbowgbcwOwYIKwYBBQUHMAKGL2h0dHA6Ly9yb3N0ZWxlY29tLnJ1L2NkcC9y
b290Y2Ffc3NsX3JzYTIwMjIuY3J0MDsGCCsGAQUFBzAChi9odHRwOi8vY29tcGFu
eS5ydC5ydS9jZHAvcm9vdGNhX3NzbF9yc2EyMDIyLmNydDA7BggrBgEFBQcwAoYv
aHR0cDovL3JlZXN0ci1wa2kucnUvY2RwL3Jvb3RjYV9zc2xfcnNhMjAyMi5jcnQw
gbAGA1UdHwSBqDCBpTA1oDOgMYYvaHR0cDovL3Jvc3RlbGVjb20ucnUvY2RwL3Jv
b3RjYV9zc2xfcnNhMjAyMi5jcmwwNaAzoDGGL2h0dHA6Ly9jb21wYW55LnJ0LnJ1
L2NkcC9yb290Y2Ffc3NsX3JzYTIwMjIuY3JsMDWgM6Axhi9odHRwOi8vcmVlc3Ry
LXBraS5ydS9jZHAvcm9vdGNhX3NzbF9yc2EyMDIyLmNybDANBgkqhkiG9w0BAQsF
AAOCAgEARBVzZls79AdiSCpar15dA5Hr/rrT4WbrOfzlpI+xrLeRPrUG6eUWIW4v
Sui1yx3iqGLCjPcKb+HOTwoRMbI6ytP/ndp3TlYua2advYBEhSvjs+4vDZNwXr/D
anbwIWdurZmViQRBDFebpkvnIvru/RpWud/5r624Wp8voZMRtj/cm6aI9LtvBfT9
cfzhOaexI/99c14dyiuk1+6QhdwKaCRTc1mdfNQmnfWNRbfWhWBlK3h4GGE9JK33
Gk8ZS8DMrkdAh0xby4xAQ/mSWAfWrBmfzlOqGyoB1U47WTOeqNbWkkoAP2ys94+s
Jg4NTkiDVtXRF6nr6fYi0bSOvOFg0IQrMXO2Y8gyg9ARdPJwKtvWX8VPADCYMiWH
h4n8bZokIrImVKLDQKHY4jCsND2HHdJfnrd2LJYw1qFskNO4cSNmZydw0Wkgjv9k
F+KxqrDKlB8MZu2Hclph6v/CZ0fQ9YuE8/lsHZ0Qc2HyiSMnvjgK5fDc3TD4fa8F
E8gMNurM+kV8PT8LNIM+4Zs+LKEV8nqRWBaxkIVJGekkVKO8xDBOG/aN62AZKHOe
GcyIdu7yNMMRihGVZCYr8rYiJoKiOzDqOkPkLOPdhtVlgnhowzHDxMHND/E2WA5p
ZHuNM/m0TXt2wTTPL7JH2YC0gPz/BvvSzjksgzU5rLbRyUKQkgU=
-----END CERTIFICATE-----`;

function loadTBankCA() {
  return Promise.resolve({
    rootPem: RUSSIAN_TRUSTED_CA_ROOT,
    subPem: RUSSIAN_TRUSTED_CA_SUB
  });
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

function httpsJsonRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);

    const req = https.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || 443,
      path: `${target.pathname}${target.search}`,
      method: options.method || 'GET',
      headers: options.headers || {},
      ca: RUSSIAN_TRUSTED_CA,
      timeout: options.timeout || 20000
    }, response => {
      let data = '';

      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        resolve({
          status: response.statusCode,
          statusText: response.statusMessage,
          text: data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('HTTPS request timeout'));
    });

    req.on('error', reject);

    if (options.body) req.write(options.body);
    req.end();
  });
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
    `?iss.meta=off&iss.only=history&history.columns=TRADEDATE,CLOSE`;

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
      value: Number(last?.[1]) || null
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
      configured: true,
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

app.get('/api/version', (req, res) => {
  res.json({ ok: true, version: '2.8-operations-route-fixed' });
});


app.get('/api/operations-summary', async (req, res) => {
  try {
    const accountsResponse = await getAccounts();
    const account = selectAccount(accountsResponse);
    if (!account?.id) {
      return res.status(404).json({
        error: 'No open T-Bank investment account was returned for this token.',
        accounts: accountsResponse?.accounts || []
      });
    }

    const operations = await getOperations(account.id);
    const rows = (Array.isArray(operations) ? operations : []).map(op => ({
      date: op.date || null,
      type: op.type || null,
      name: op.name || null,
      ticker: op.ticker || null,
      figi: op.figi || null,
      payment: operationCash(op),
      isExternalCash: isExternalCashOperation(op),
      isIncome: isIncomeOperation(op)
    }));

    res.json({
      ok: true,
      account: { id: account.id, name: account.name || account.type || 'T-Invest account' },
      count: rows.length,
      externalCashTotal: rows.filter(x => x.isExternalCash).reduce((s, x) => s + x.payment, 0),
      passiveIncomeTotal: rows.filter(x => x.isIncome).reduce((s, x) => s + Math.abs(x.payment), 0),
      operations: rows
    });
  } catch (err) {
    console.error('Operations summary error:', err);
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
    console.log('Russian Trusted CA loaded locally.');
  } catch (err) {
    console.error('WARNING: could not preload Russian Trusted CA:', err.message);
    console.error('T-Bank requests will report the certificate bootstrap error.');
  }

  app.listen(PORT, () => {
    console.log(`TInvest Pulse listening on port ${PORT}`);
  });
}

start();
