function finite(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function text(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function firstDefined(object, keys) {
  for (const key of keys) {
    if (object?.[key] != null) return object[key];
  }
  return null;
}

function normalizeDividendDiscovery(shares, fundamentals) {
  const shareByAsset = new Map();
  let duplicateShares = 0;

  for (const share of Array.isArray(shares) ? shares : []) {
    const assetUid = text(firstDefined(share, ['assetUid', 'asset_uid']));
    const instrumentUid = text(firstDefined(share, ['uid', 'instrumentUid', 'instrument_uid']));
    const ticker = text(share?.ticker);
    if (!assetUid || !instrumentUid || !ticker) continue;
    if (shareByAsset.has(assetUid)) {
      duplicateShares += 1;
      continue;
    }
    shareByAsset.set(assetUid, {
      assetUid,
      instrumentUid,
      figi: text(share?.figi),
      ticker,
      name: text(share?.name) || ticker,
      lotSize: finite(share?.lot),
      currency: text(share?.currency),
    });
  }

  const rows = [];
  const seenFundamentals = new Set();
  let duplicateFundamentals = 0;
  let matchedFundamentals = 0;
  let missingDividendYield = 0;
  let nonPositiveDividendYield = 0;

  for (const item of Array.isArray(fundamentals) ? fundamentals : []) {
    const assetUid = text(firstDefined(item, ['assetUid', 'asset_uid', 'assetId', 'asset_id']));
    if (!assetUid) continue;
    if (seenFundamentals.has(assetUid)) {
      duplicateFundamentals += 1;
      continue;
    }
    seenFundamentals.add(assetUid);

    const share = shareByAsset.get(assetUid);
    if (!share) continue;
    matchedFundamentals += 1;

    const dividendYield = finite(firstDefined(item, ['dividendYield', 'dividend_yield']));
    if (dividendYield == null) {
      missingDividendYield += 1;
      continue;
    }
    if (dividendYield <= 0) {
      nonPositiveDividendYield += 1;
      continue;
    }

    const marketCap = finite(firstDefined(item, ['marketCap', 'market_cap']));
    rows.push({
      ...share,
      dividendYield,
      marketCap: marketCap != null && marketCap > 0 ? marketCap : null,
    });
  }

  rows.sort((left, right) => (
    right.dividendYield - left.dividendYield
    || (right.marketCap ?? -1) - (left.marketCap ?? -1)
    || left.ticker.localeCompare(right.ticker, 'en')
    || left.assetUid.localeCompare(right.assetUid, 'en')
  ));

  return {
    rows,
    coverage: {
      shares: shareByAsset.size,
      fundamentals: seenFundamentals.size,
      matchedFundamentals,
      dividendRows: rows.length,
      missingDividendYield,
      nonPositiveDividendYield,
      duplicateShares,
      duplicateFundamentals,
    },
  };
}

module.exports = { normalizeDividendDiscovery };
