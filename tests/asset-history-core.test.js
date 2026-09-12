'use strict';

const assert = require('node:assert/strict');
const {
  ASSET_HISTORY_VALUATION_VERSION,
  assetHistoryPositionMarketValue,
} = require('../asset-history-core.js');

function money(units, nano = 0) {
  return { units: String(units), nano };
}

assert.equal(ASSET_HISTORY_VALUATION_VERSION, '1.0');

assert.equal(
  assetHistoryPositionMarketValue({ quantity: money(4), currentPrice: money(5004, 500000000), instrumentType: 'share' }),
  20018,
);

assert.equal(
  assetHistoryPositionMarketValue(
    { quantity: money(4), currentPrice: money(82, 349000000), currentNkd: money(12, 500000000), instrumentType: 'bond' },
    { nominal: money(1000) },
  ),
  3343.96,
);

assert.equal(
  assetHistoryPositionMarketValue(
    { quantity: 4, currentPrice: 82.349, instrumentType: 'bond' },
    { initialNominal: 1000 },
  ),
  3293.96,
);

assert.equal(
  assetHistoryPositionMarketValue(
    { quantity: 4, currentPrice: 82.349, instrumentType: 'bond' },
    null,
  ),
  null,
  'bond without verified nominal must fail closed',
);

assert.equal(
  assetHistoryPositionMarketValue({ quantity: 2, currentPrice: 100, instrumentType: 'future' }, null),
  null,
  'unsupported derivatives must not be ranked by raw quote',
);

assert.equal(assetHistoryPositionMarketValue({ quantity: Number.NaN, currentPrice: 100, instrumentType: 'share' }), null);
assert.equal(assetHistoryPositionMarketValue({ quantity: 1, currentPrice: Number.POSITIVE_INFINITY, instrumentType: 'share' }), null);
assert.equal(assetHistoryPositionMarketValue({ quantity: 0, currentPrice: 100, instrumentType: 'share' }), null);
assert.equal(assetHistoryPositionMarketValue({ quantity: 1, currentPrice: -1, instrumentType: 'share' }), null);

const share = assetHistoryPositionMarketValue({ quantity: 4, currentPrice: 5004.5, instrumentType: 'share' });
const bond = assetHistoryPositionMarketValue({ quantity: 4, currentPrice: 82.349, instrumentType: 'bond' }, { nominal: 1000 });
assert.ok(share > bond, 'ranking compares monetary values, not bond quote points');

console.log('asset history current-value regression: ok');
