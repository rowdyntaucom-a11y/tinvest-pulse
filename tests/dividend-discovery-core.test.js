const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeDividendDiscovery } = require('../dividend-discovery-core');

test('joins fundamentals only by exact asset UID and never by ticker', () => {
  const result = normalizeDividendDiscovery([
    { assetUid: 'asset-a', uid: 'instrument-a', ticker: 'SAME', name: 'Alpha' },
    { assetUid: 'asset-b', uid: 'instrument-b', ticker: 'SAME', name: 'Beta' },
  ], [
    { assetUid: 'asset-a', dividendYield: 8.4, marketCap: 1000 },
    { assetUid: 'unknown-asset', dividendYield: 99, marketCap: 5000 },
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
    { assetUid: 'a' },
    { assetUid: 'b', dividendYield: null },
    { assetUid: 'c', dividendYield: 0 },
    { assetUid: 'd', dividendYield: -1 },
  ]);

  assert.deepEqual(result.rows, []);
  assert.equal(result.coverage.missingDividendYield, 2);
  assert.equal(result.coverage.nonPositiveDividendYield, 2);
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
    { assetUid: 'asset-c', dividendYield: 8, marketCap: 10 },
    { assetUid: 'asset-z', dividendYield: 8, marketCap: 20 },
    { assetUid: 'asset-a', dividendYield: 8, marketCap: 20 },
    { assetUid: 'asset-b', dividendYield: 9, marketCap: 1 },
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
    { assetUid: 'a', dividendYield: 4 },
    { assetUid: 'a', dividendYield: 40 },
  ]);

  assert.deepEqual(result.rows.map((row) => row.ticker), ['AAA']);
  assert.equal(result.rows[0].dividendYield, 4);
  assert.equal(result.coverage.duplicateShares, 1);
  assert.equal(result.coverage.duplicateFundamentals, 1);
});
