'use strict';

module.exports = function registerPayoutCalendar(app, deps) {
  const {
    tbankRequest,
    buildDashboard,
    getAccounts,
    selectAccount,
    getOperations,
    isIncomeOperation,
    operationCash
  } = deps || {};

  const INSTRUMENTS = 'tinkoff.public.invest.api.contract.v1.InstrumentsService/';
  const CACHE_MS = 5 * 60 * 1000;
  let cache = null;

  function moneyValue(v) {
    if (v == null) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    const units = Number(v.units ?? v.unit ?? 0);
    const nano = Number(v.nano ?? v.nanos ?? 0);
    return (Number.isFinite(units) ? units : 0) + (Number.isFinite(nano) ? nano : 0) / 1e9;
  }

  function safeDate(v) {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  function iso(d) {
    const x = safeDate(d);
    return x ? x.toISOString() : null;
  }

  function monthKey(d) {
    const x = safeDate(d);
    return x ? `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}` : null;
  }

  function taxEstimate(gross) {
    const g = Math.max(0, Number(gross) || 0);
    const tax = Math.min(g, 2400000) * 0.13 + Math.max(0, g - 2400000) * 0.15;
    return { gross: g, tax, net: g - tax, rate: g ? tax / g * 100 : 13 };
  }

  function classifyAsset(a) {
    const type = String(a?.instrumentType || a?.type || '').toUpperCase();
    const ticker = String(a?.ticker || '').toUpperCase();
    const name = String(a?.name || '').toLowerCase();
    if (type.includes('BOND') || /^SU\d/.test(ticker) || /^RU000A/.test(ticker) || /офз|облигац/.test(name)) return 'bond';
    if (type.includes('SHARE') || type.includes('STOCK')) return 'share';
    return 'other';
  }

  function eventNet(gross) {
    const t = taxEstimate(gross);
    return { gross: round2(t.gross), tax: round2(t.tax), net: round2(t.net), taxRate: round2(t.rate) };
  }

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  async function fetchAssetSchedule(asset, from, to) {
    const kind = classifyAsset(asset);
    const instrumentId = asset?.figi || asset?.instrumentUid || asset?.instrumentId;
    const qty = Math.max(0, Number(asset?.quantity) || 0);
    if (!instrumentId || qty <= 0 || kind === 'other') return [];

    if (kind === 'bond') {
      const data = await tbankRequest(`${INSTRUMENTS}GetBondCoupons`, {
        instrumentId,
        from: from.toISOString(),
        to: to.toISOString()
      });
      const rows = Array.isArray(data?.events) ? data.events : [];
      return rows.map(row => {
        const date = safeDate(row?.couponDate || row?.coupon_date);
        const perSecurity = moneyValue(row?.payOneBond || row?.pay_one_bond);
        const calc = eventNet(perSecurity * qty);
        return {
          kind: 'COUPON',
          ticker: asset?.ticker || asset?.name || instrumentId,
          name: asset?.name || asset?.ticker || instrumentId,
          figi: asset?.figi || null,
          date: iso(date),
          recordDate: iso(row?.fixDate || row?.fix_date),
          quantity: qty,
          perSecurity: round2(perSecurity),
          currency: row?.payOneBond?.currency || row?.pay_one_bond?.currency || 'rub',
          ...calc,
          confidence: 'HIGH',
          source: 'TBANK_SCHEDULE'
        };
      }).filter(x => x.date && x.net >= 0);
    }

    const data = await tbankRequest(`${INSTRUMENTS}GetDividends`, {
      instrumentId,
      from: from.toISOString(),
      to: to.toISOString()
    });
    const rows = Array.isArray(data?.dividends) ? data.dividends : [];
    return rows.filter(row => !/cancel/i.test(String(row?.dividendType || row?.dividend_type || ''))).map(row => {
      const recordDate = safeDate(row?.recordDate || row?.record_date);
      const paymentDate = safeDate(row?.paymentDate || row?.payment_date);
      const lastBuyDate = safeDate(row?.lastBuyDate || row?.last_buy_date);
      const perSecurity = moneyValue(row?.dividendNet || row?.dividend_net);
      const calc = eventNet(perSecurity * qty);
      return {
        kind: 'DIVIDEND',
        ticker: asset?.ticker || asset?.name || instrumentId,
        name: asset?.name || asset?.ticker || instrumentId,
        figi: asset?.figi || null,
        date: iso(paymentDate || recordDate || lastBuyDate),
        recordDate: iso(recordDate),
        lastBuyDate: iso(lastBuyDate),
        declaredDate: iso(row?.declaredDate || row?.declared_date),
        quantity: qty,
        perSecurity: round2(perSecurity),
        currency: row?.dividendNet?.currency || row?.dividend_net?.currency || 'rub',
        ...calc,
        confidence: paymentDate ? 'HIGH' : 'MEDIUM',
        source: 'TBANK_SCHEDULE'
      };
    }).filter(x => x.date && x.net >= 0);
  }

  function currentYearActual(operations, now) {
    const year = now.getUTCFullYear();
    const rows = (Array.isArray(operations) ? operations : []).filter(op => {
      const d = safeDate(op?.date);
      return d && d.getUTCFullYear() === year && (!isIncomeOperation || isIncomeOperation(op));
    }).map(op => {
      const d = safeDate(op?.date);
      const cash = Math.abs(operationCash ? Number(operationCash(op)) || 0 : moneyValue(op?.payment));
      const type = String(op?.type || '').toUpperCase();
      const name = String(op?.name || '').toLowerCase();
      const kind = type.includes('DIVIDEND') || name.includes('дивид') ? 'DIVIDEND' : (type.includes('COUPON') || name.includes('купон') ? 'COUPON' : 'INCOME');
      return {
        kind,
        ticker: op?.ticker || op?.figi || op?.name || '—',
        name: op?.name || op?.ticker || op?.figi || '—',
        figi: op?.figi || null,
        date: iso(d),
        net: round2(cash),
        gross: null,
        tax: null,
        currency: 'rub',
        source: 'TBANK_OPERATION',
        status: 'FACT'
      };
    }).filter(x => x.net > 0).sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      year,
      items: rows,
      totalNet: round2(rows.reduce((s, x) => s + x.net, 0)),
      count: rows.length
    };
  }

  function buildMonths(now, events) {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
      const key = monthKey(d);
      const items = events.filter(e => monthKey(e.date) === key);
      months.push({
        key,
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        gross: round2(items.reduce((s, x) => s + (Number(x.gross) || 0), 0)),
        tax: round2(items.reduce((s, x) => s + (Number(x.tax) || 0), 0)),
        net: round2(items.reduce((s, x) => s + (Number(x.net) || 0), 0)),
        count: items.length,
        items
      });
    }
    return months;
  }

  async function buildPayouts() {
    const now = new Date();
    const to = new Date(now);
    to.setUTCMonth(to.getUTCMonth() + 12);

    const dashboard = await buildDashboard();
    const assets = Array.isArray(dashboard?.assets)
      ? dashboard.assets
      : (Array.isArray(dashboard?.portfolio?.assets) ? dashboard.portfolio.assets : []);

    const eligible = assets.filter(a => Number(a?.quantity) > 0 && ['bond', 'share'].includes(classifyAsset(a)));
    const future = [];
    const errors = [];

    for (let i = 0; i < eligible.length; i += 3) {
      const batch = eligible.slice(i, i + 3);
      const rows = await Promise.all(batch.map(async asset => {
        try {
          return await fetchAssetSchedule(asset, now, to);
        } catch (err) {
          errors.push({ ticker: asset?.ticker || asset?.figi || '—', error: err?.message || String(err) });
          return [];
        }
      }));
      future.push(...rows.flat());
    }

    const normalizedFuture = future
      .filter(e => String(e.currency || 'rub').toLowerCase() === 'rub')
      .filter(e => {
        const d = safeDate(e.date);
        return d && d >= now && d <= to;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let actual = { year: now.getUTCFullYear(), items: [], totalNet: 0, count: 0 };
    try {
      if (getAccounts && selectAccount && getOperations) {
        const accounts = await getAccounts();
        const account = selectAccount(accounts);
        if (account?.id) actual = currentYearActual(await getOperations(account.id), now);
      }
    } catch (err) {
      errors.push({ ticker: 'FACT', error: err?.message || String(err) });
    }

    const months = buildMonths(now, normalizedFuture);
    const forecast = {
      gross: round2(normalizedFuture.reduce((s, x) => s + x.gross, 0)),
      tax: round2(normalizedFuture.reduce((s, x) => s + x.tax, 0)),
      net: round2(normalizedFuture.reduce((s, x) => s + x.net, 0)),
      count: normalizedFuture.length
    };
    const next = normalizedFuture[0] || null;
    const daysToNext = next ? Math.max(0, Math.ceil((new Date(next.date).getTime() - now.getTime()) / 86400000)) : null;

    return {
      version: '7.2',
      generatedAt: now.toISOString(),
      period: { from: now.toISOString(), to: to.toISOString() },
      basis: 'CURRENT_HOLDINGS',
      taxModel: {
        label: 'ESTIMATE_13_15',
        thresholdRub: 2400000,
        baseRate: 13,
        highRate: 15,
        note: 'Прогнозный НДФЛ. Факт берётся из денежных операций брокера и повторно не облагается в интерфейсе.'
      },
      actual,
      forecast,
      next: next ? { ...next, days: daysToNext } : null,
      months,
      events: normalizedFuture,
      coverage: {
        eligibleAssets: eligible.length,
        scheduledEvents: normalizedFuture.length,
        errors
      }
    };
  }

  app.get('/api/payouts', async (req, res) => {
    try {
      if (cache && Date.now() - cache.createdAt < CACHE_MS) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        return res.json(cache.data);
      }
      const data = await buildPayouts();
      cache = { createdAt: Date.now(), data };
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.json(data);
    } catch (err) {
      res.status(500).json({
        version: '7.2',
        available: false,
        error: err?.message || 'Payout calendar unavailable'
      });
    }
  });
};
