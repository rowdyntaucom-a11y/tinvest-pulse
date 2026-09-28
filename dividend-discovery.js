const { normalizeDividendDiscovery } = require('./dividend-discovery-core');

const SHARES_METHOD = 'tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares';
const FUNDAMENTALS_METHOD = 'tinkoff.public.invest.api.contract.v1.InstrumentsService/GetAssetFundamentals';

function registerDividendDiscovery(app, { tbankRequest }) {
  if (!app || typeof app.get !== 'function') throw new Error('Express app is required');
  if (typeof tbankRequest !== 'function') throw new Error('tbankRequest is required');

  const cache = { expiresAt: 0, payload: null };
  app.get('/api/dividend-discovery', async (_request, response) => {
    try {
      const now = Date.now();
      if (cache.payload && cache.expiresAt > now) {
        response.setHeader('Cache-Control', 'private, max-age=300');
        return response.json(cache.payload);
      }

      const shareResponse = await tbankRequest(SHARES_METHOD, {
        instrumentStatus: 'INSTRUMENT_STATUS_BASE',
      });
      const shares = Array.isArray(shareResponse?.instruments) ? shareResponse.instruments : [];
      const assetUids = [...new Set(shares
        .map((row) => String(row?.assetUid ?? row?.asset_uid ?? '').trim())
        .filter(Boolean))];

      const fundamentals = [];
      for (let index = 0; index < assetUids.length; index += 100) {
        const assets = assetUids.slice(index, index + 100);
        const result = await tbankRequest(FUNDAMENTALS_METHOD, { assets });
        const items = Array.isArray(result?.fundamentals)
          ? result.fundamentals
          : Array.isArray(result?.items) ? result.items : [];
        fundamentals.push(...items);
      }

      const normalized = normalizeDividendDiscovery(shares, fundamentals);
      const payload = {
        version: '1.0',
        available: normalized.rows.length > 0,
        source: 'T-Invest Shares + GetAssetFundamentals',
        updatedAt: new Date().toISOString(),
        rows: normalized.rows,
        coverage: { ...normalized.coverage, requestedAssets: assetUids.length },
        semantics: 'descriptive_market_discovery',
        note: 'Reported dividend yield only; exact asset UID joins; no inferred values or trading recommendation.',
      };

      cache.payload = payload;
      cache.expiresAt = now + 1_800_000;
      response.setHeader('Cache-Control', 'private, max-age=300');
      return response.json(payload);
    } catch (error) {
      // Never include request bodies, credentials or the raw upstream response in logs/client errors.
      console.warn('QVANIX dividend discovery upstream unavailable');
      return response.status(502).json({
        version: '1.0',
        available: false,
        rows: [],
        source: 'UNAVAILABLE',
        error: 'dividend discovery unavailable',
      });
    }
  });
}

module.exports = { registerDividendDiscovery };
