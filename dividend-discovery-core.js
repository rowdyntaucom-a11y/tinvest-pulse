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
  let missingDividendYieldTtm = 0;
  let nonPositiveDividendYieldTtm = 0;

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

    // tbankRequest returns parsed upstream JSON without transforming its keys.
    // Use only the documented trailing yield field; do not mix it with the
    // separate forward_annual_dividend_yield estimate.
    const dividendYieldDailyTtm = finite(firstDefined(item, [
      'dividend_yield_daily_ttm',
      'dividendYieldDailyTtm',
    ]));
    if (dividendYieldDailyTtm == null) {
      missingDividendYieldTtm += 1;
      continue;
    }
    // T-Invest documents zero fundamentals as unavailable. Negative yield is
    // likewise not a usable descriptive dividend-yield observation.
    if (dividendYieldDailyTtm <= 0) {
      nonPositiveDividendYieldTtm += 1;
      continue;
    }

    const marketCapitalization = finite(firstDefined(item, [
      'market_capitalization',
      'marketCapitalization',
    ]));
    rows.push({
      ...share,
      dividendYieldDailyTtm,
      marketCapitalization: marketCapitalization != null && marketCapitalization > 0
        ? marketCapitalization
        : null,
    });
  }

  rows.sort((left, right) => (
    right.dividendYieldDailyTtm - left.dividendYieldDailyTtm
    || (right.marketCapitalization ?? -1) - (left.marketCapitalization ?? -1)
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
      missingDividendYieldTtm,
      nonPositiveDividendYieldTtm,
      duplicateShares,
      duplicateFundamentals,
    },
  };
}

module.exports = { normalizeDividendDiscovery };
