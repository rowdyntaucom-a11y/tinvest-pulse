'use strict';

const ASSET_HISTORY_VALUATION_VERSION = '1.0';

function finiteMoney(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === 'object') {
    const units = Number(value.units ?? 0);
    const nano = Number(value.nano ?? 0);
    if (!Number.isFinite(units) || !Number.isFinite(nano)) return null;
    const parsed = units + nano / 1e9;
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function bondNominal(meta) {
  const candidates = [
    meta?.nominal,
    meta?.initialNominal,
    meta?.bond?.nominal,
    meta?.assetBond?.nominal,
  ];
  for (const candidate of candidates) {
    const value = finiteMoney(candidate);
    if (value != null && value > 0) return value;
  }
  return null;
}

/**
 * Current market value used only for ranking instruments before requesting
 * daily history. T-Bank bond prices are percentage-of-nominal quotations, so
 * a bond must have verified nominal metadata before it can be ranked.
 *
 * Unsupported instrument types fail closed instead of pretending that a raw
 * quotation is a monetary portfolio value.
 */
function assetHistoryPositionMarketValue(position, meta = null) {
  const quantity = finiteMoney(position?.quantity);
  const price = finiteMoney(position?.currentPrice);
  if (quantity == null || quantity <= 0 || price == null || price <= 0) return null;

  const type = String(position?.instrumentType || '').trim().toUpperCase();
  if (type.includes('BOND')) {
    const nominal = bondNominal(meta);
    if (nominal == null) return null;
    const nkdRaw = finiteMoney(position?.currentNkd);
    const nkd = nkdRaw != null && nkdRaw > 0 ? nkdRaw : 0;
    const value = quantity * ((price / 100) * nominal + nkd);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (type.includes('SHARE') || type.includes('STOCK') || type.includes('ETF') || type.includes('CURRENCY')) {
    const value = quantity * price;
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  return null;
}

module.exports = {
  ASSET_HISTORY_VALUATION_VERSION,
  assetHistoryPositionMarketValue,
};
