const assert = require('node:assert/strict');
const test = require('node:test');
const { registerDividendDiscovery } = require('../dividend-discovery');

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function captureHandler(tbankRequest) {
  let handler = null;
  registerDividendDiscovery({
    get(path, routeHandler) {
      assert.equal(path, '/api/dividend-discovery');
      handler = routeHandler;
    },
  }, { tbankRequest });
  return handler;
}

test('route batches read-only fundamentals requests and exposes coverage', async () => {
  const calls = [];
  const shares = Array.from({ length: 101 }, (_, index) => ({
    asset_uid: `asset-${index}`,
    uid: `instrument-${index}`,
    ticker: `T${String(index).padStart(3, '0')}`,
  }));
  const handler = captureHandler(async (method, body) => {
    calls.push({ method, body });
    if (method.endsWith('/Shares')) return { instruments: shares };
    return { fundamentals: body.assets.map((assetUid) => ({
      asset_uid: assetUid,
      dividend_yield_daily_ttm: 5,
      market_capitalization: 1_000_000,
    })) };
  });

  const response = createResponse();
  await handler({}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.available, true);
  assert.equal(response.body.rows.length, 101);
  assert.equal(response.body.coverage.requestedAssets, 101);
  assert.equal(response.body.coverage.matchedFundamentals, 101);
  assert.equal(response.body.rows[0].dividendYieldDailyTtm, 5);
  assert.equal(response.body.rows[0].marketCapitalization, 1_000_000);
  assert.equal(response.body.yieldField, 'dividend_yield_daily_ttm');
  assert.equal(response.body.yieldSemantics, 'trailing_twelve_months');
  assert.equal(calls[0].method, 'tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares');
  assert.equal(calls[1].body.assets.length, 100);
  assert.equal(calls[2].body.assets.length, 1);
  assert.equal(response.body.semantics, 'descriptive_market_discovery');
});

test('route reports insufficient coverage without inventing rows', async () => {
  const handler = captureHandler(async (method) => {
    if (method.endsWith('/Shares')) {
      return { instruments: [{ assetUid: 'a', uid: 'instrument-a', ticker: 'AAA' }] };
    }
    return { fundamentals: [{
      asset_uid: 'a',
      dividend_yield_daily_ttm: 0,
      market_capitalization: 0,
    }] };
  });
  const response = createResponse();
  await handler({}, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.available, false);
  assert.deepEqual(response.body.rows, []);
  assert.equal(response.body.coverage.nonPositiveDividendYieldTtm, 1);
});

test('route fails closed without leaking the upstream error', async () => {
  const handler = captureHandler(async () => { throw new Error('secret-token-value'); });
  const response = createResponse();
  await handler({}, response);

  assert.equal(response.statusCode, 502);
  assert.equal(response.body.available, false);
  assert.deepEqual(response.body.rows, []);
  assert.doesNotMatch(JSON.stringify(response.body), /secret-token-value/);
});
