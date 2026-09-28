const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeDividendDiscovery } = require('../dividend-discovery-core');

test('joins fundamentals only by exact asset UID and never by ticker', () => {
  const result = normalizeDividendDiscovery([
    { assetUid: 'asset-a', uid: 'instrument-a', ticker: 'SAME', name: 'Alpha' },
    { assetUid: 'asset-b', uid: 'instrument-b', ticker: 'SAME', name: 'Beta' },
  ], [
    { asset_uid: 'asset-a', dividend_yield_daily_ttm: 8.4, market_capitalization: 1000 },
    { asset_uid: 'unknown-asset', dividend_yield_daily_ttm: 99, market_capitalization: 5000 },
  ]);

  assert.deepEqual(result.rows.map((row) => row.assetUid), ['asset-a']);
  assert.equal(result.rows[0].instrumentUid, 'instrument-a');
  assert.equal(result.coverage.matchedFundamentals, 1);
});

test('keeps missing, zero and negative dividend yield distinct and excludes all three', () => {
  const shares = ['a', 'b', 'c', 'd'].map((assetUid) => ({
    assetUid,
    uid: `instrument-${assetUid}`,
    ticker: assetUid.toUpperCase(),
  }));
  const result = normalizeDividendDiscovery(shares, [
    { asset_uid: 'a' },
    { asset_uid: 'b', dividend_yield_daily_ttm: null, forward_annual_dividend_yield: 12 },
    { asset_uid: 'c', dividend_yield_daily_ttm: 0 },
    { asset_uid: 'd', dividend_yield_daily_ttm: -1 },
  ]);

  assert.deepEqual(result.rows, []);
  assert.equal(result.coverage.missingDividendYieldTtm, 2);
  assert.equal(result.coverage.nonPositiveDividendYieldTtm, 2);
  assert.equal(result.coverage.dividendRows, 0);
});

test('orders deterministically by yield, market cap, ticker and asset identity', () => {
  const shares = [
    { assetUid: 'asset-z', uid: 'instrument-z', ticker: 'AAA' },
    { assetUid: 'asset-a', uid: 'instrument-a', ticker: 'AAA' },
    { assetUid: 'asset-b', uid: 'instrument-b', ticker: 'BBB' },
    { assetUid: 'asset-c', uid: 'instrument-c', ticker: 'CCC' },
  ];
  const fundamentals = [
    { asset_uid: 'asset-c', dividend_yield_daily_ttm: 8, market_capitalization: 10 },
    { asset_uid: 'asset-z', dividend_yield_daily_ttm: 8, market_capitalization: 20 },
    { asset_uid: 'asset-a', dividend_yield_daily_ttm: 8, market_capitalization: 20 },
    { asset_uid: 'asset-b', dividend_yield_daily_ttm: 9, market_capitalization: 1 },
  ];
  const first = normalizeDividendDiscovery(shares, fundamentals);
  const second = normalizeDividendDiscovery([...shares].reverse(), [...fundamentals].reverse());

  assert.deepEqual(first.rows.map((row) => row.assetUid), ['asset-b', 'asset-a', 'asset-z', 'asset-c']);
  assert.deepEqual(second.rows, first.rows);
});

test('rejects duplicate identities instead of merging ambiguous records', () => {
  const result = normalizeDividendDiscovery([
    { assetUid: 'a', uid: 'instrument-a', ticker: 'AAA' },
    { assetUid: 'a', uid: 'instrument-other', ticker: 'OTHER' },
  ], [
    { asset_uid: 'a', dividend_yield_daily_ttm: 4 },
    { asset_uid: 'a', dividend_yield_daily_ttm: 40 },
  ]);

  assert.deepEqual(result.rows.map((row) => row.ticker), ['AAA']);
  assert.equal(result.rows[0].dividendYieldDailyTtm, 4);
  assert.equal(result.coverage.duplicateShares, 1);
  assert.equal(result.coverage.duplicateFundamentals, 1);
});

test('normalizes the documented upstream capitalization and TTM yield fields', () => {
  const result = normalizeDividendDiscovery([
    { asset_uid: 'real-asset', uid: 'real-instrument', ticker: 'REAL' },
  ], [{
    asset_uid: 'real-asset',
    market_capitalization: 125_000_000_000,
    dividend_yield_daily_ttm: 6.75,
    forward_annual_dividend_yield: 99,
  }]);

  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].dividendYieldDailyTtm, 6.75);
  assert.equal(result.rows[0].marketCapitalization, 125_000_000_000);
  assert.equal('forwardAnnualDividendYield' in result.rows[0], false);
});
