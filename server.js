require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TBANK = 'https://invest-public-api.tbank.ru/rest/';
const TOKEN = process.env.TINvest_API_TOKEN;

const M = {
  accounts:
    'tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts',
  portfolio:
    'tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio',
  operations:
    'tinkoff.public.invest.api.contract.v1.OperationsService/GetOperationsByCursor',
  instrument:
    'tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy'
};

function num(x) {
  if (x == null) return 0;
  if (typeof x === 'number') return x;
  if (typeof x === 'string') {
    return Number(x.replace(',', '.')) || 0;
  }

  if (typeof x === 'object') {
    return (
      Number(x.units ?? 0) +
      Number(x.nano ?? 0) / 1e9
    );
  }

  return 0;
}

function money(x) {
  return num(x);
}

function quote(x) {
  return num(x);
}

function dateOf(x) {
  return x ? new Date(x) : null;
}

function errorJson(e) {
  return {
    error: e.message || 'API error',
    details: e.details || undefined
  };
}

async function tbank(method, body = {}) {
  if (!TOKEN) {
    const e = new Error(
      'TINvest_API_TOKEN is not configured on Render'
    );
    e.status = 500;
    throw e;
  }

  const r = await fetch(TBANK + method, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await r.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!r.ok) {
    const e = new Error(
      data?.message || `T-Bank API ${r.status}`
    );

    e.status = r.status;
    e.details = data;

    throw e;
  }

  return data;
}

async function getOpenAccount() {
  const data = await tbank(
    M.accounts,
    {
      status: 'ACCOUNT_STATUS_OPEN'
    }
  );

  const accounts = data.accounts || [];

  if (!accounts.length) {
    const e = new Error(
      'No open T-Invest account found'
    );

    e.status = 404;
    throw e;
  }

  const preferred = accounts.find(
    a =>
      String(a.type || '').includes('TINKOFF') &&
      String(a.accessLevel || '').includes('FULL')
  );

  return preferred || accounts[0];
}

async function getOperations(accountId, from) {
  const bodyBase = {
    accountId,
    state: 'OPERATION_STATE_EXECUTED',
    limit: 1000
  };

  if (from) {
    bodyBase.from = new Date(from).toISOString();
  }

  bodyBase.to = new Date().toISOString();

  const all = [];

  let cursor;

  for (let i = 0; i < 50; i++) {
    const body = {
      ...bodyBase
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const page = await tbank(
      M.operations,
      body
    );

    const items =
      page.items ||
      page.operations ||
      [];

    all.push(...items);

    const next = page.nextCursor;

    if (!next || !items.length) {
      break;
    }

    cursor = next;
  }

  return all;
}

function operationType(o) {
  return String(
    o.operationType ||
    o.type ||
    ''
  ).toUpperCase();
}

function opDate(o) {
  return (
    o.date ||
    o.operationDate ||
    o.timestamp ||
    o.createdAt
  );
}

function isPassive(o) {
  const t = operationType(o);

  return (
    t.includes('DIVIDEND') ||
    t.includes('COUPON') ||
    t.includes('BOND_REPAYMENT') ||
    t.includes('REPAYMENT')
  );
}

function isExternalIn(o) {
  const t = operationType(o);

  return (
    t.includes('INPUT') &&
    !t.includes('SECURITIES')
  );
}

function isExternalOut(o) {
  const t = operationType(o);

  return (
    (t.includes('OUTPUT') ||
      t.includes('WITHDRAW')) &&
    !t.includes('SECURITIES')
  );
}

function cash(o) {
  if (o.payment != null) {
    return money(o.payment);
  }

  if (o.amount != null) {
    return money(o.amount);
  }

  if (o.operationAmount != null) {
    return money(o.operationAmount);
  }

  return 0;
}

function xnpv(rate, flows) {
  if (rate <= -0.999999) {
    return Infinity;
  }

  const t0 =
    flows[0].date.getTime();

  return flows.reduce(
    (sum, f) => {
      const years =
        (f.date.getTime() - t0) /
        31557600000;

      return (
        sum +
        f.amount /
          Math.pow(1 + rate, years)
      );
    },
    0
  );
}

function xirr(flows) {
  if (flows.length < 2) {
    return null;
  }

  let lo = -0.9999;
  let hi = 10;

  let flo = xnpv(lo, flows);
  let fhi = xnpv(hi, flows);

  let tries = 0;

  while (
    flo * fhi > 0 &&
    tries++ < 8
  ) {
    hi *= 2;
    fhi = xnpv(hi, flows);
  }

  if (
    !Number.isFinite(flo) ||
    !Number.isFinite(fhi) ||
    flo * fhi > 0
  ) {
    return null;
  }

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const fm = xnpv(mid, flows);

    if (Math.abs(fm) < 0.01) {
      return mid;
    }

    if (flo * fm <= 0) {
      hi = mid;
      fhi = fm;
    } else {
      lo = mid;
      flo = fm;
    }
  }

  return (lo + hi) / 2;
}

async function enrichPositions(positions) {
  return Promise.all(
    (positions || [])
      .slice(0, 12)
      .map(async p => {
        let meta = {};

        if (p.figi) {
          try {
            const r = await tbank(
              M.instrument,
              {
                idType:
                  'INSTRUMENT_ID_TYPE_FIGI',
                id: p.figi
              }
            );

            meta =
              r.instrument ||
              r ||
              {};
          } catch (_) {}
        }

        return {
          figi: p.figi,

          uid:
            p.instrumentUid ||
            p.instrumentId,

          ticker:
            meta.ticker ||
            p.ticker ||
            p.figi,

          name:
            meta.name ||
            p.name ||
            meta.ticker ||
            p.figi,

          quantity:
            quote(p.quantity),

          currentPrice:
            money(p.currentPrice),

          value:
            money(p.quantity) *
            money(p.currentPrice),

          yieldRub:
            quote(p.expectedYield),

          yieldPct:
            quote(
              p.expectedYieldRelative ??
              p.expectedYieldPercent
            )
        };
      })
  );
}

async function getMoex() {
  try {
    const url =
      'https://iss.moex.com/iss/history/' +
      'engines/stock/markets/index/' +
      'boards/SNDX/securities/IMOEX.json' +
      '?iss.meta=off' +
      '&history.columns=TRADEDATE,CLOSE' +
      '&history.limit=1' +
      '&sort_order=desc';

    const r = await fetch(
      url,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    if (!r.ok) {
      return null;
    }

    const d = await r.json();

    const rows =
      d?.history?.data || [];

    if (!rows.length) {
      return null;
    }

    return {
      date: rows[0][0],
      value:
        Number(rows[0][1]) || null
    };
  } catch (_) {
    return null;
  }
}

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      ok: true,
      tokenConfigured: !!TOKEN
    });
  }
);

app.get(
  '/api/dashboard',
  async (req, res) => {
    try {
      const account =
        await getOpenAccount();

      const accountId =
        account.id;

      const [
        portfolio,
        operations
      ] = await Promise.all([
        tbank(
          M.portfolio,
          {
            accountId,
            currency: 'RUB'
          }
        ),

        getOperations(accountId)
      ]);

      const positions =
        portfolio.positions || [];

      const enriched =
        await enrichPositions(
          positions
        );

      const total =
        money(
          portfolio.totalAmountPortfolio
        );

      const profit =
        money(
          portfolio.expectedYield
        );

      const profitPct =
        quote(
          portfolio.expectedYield
        );

      const sorted =
        [...enriched].sort(
          (a, b) =>
            b.yieldRub -
            a.yieldRub
        );

      const startDates =
        operations
          .map(opDate)
          .filter(Boolean)
          .map(d => new Date(d))
          .filter(
            d =>
              !isNaN(
                d.getTime()
              )
          );

      const accountOpened =
        dateOf(
          account.openedDate
        );

      const startDate =
        startDates.length
          ? new Date(
              Math.min(
                ...startDates.map(
                  d =>
                    d.getTime()
                )
              )
            )
          : accountOpened;

      const passive =
        operations
          .filter(isPassive)
          .map(o => ({
            date: new Date(
              opDate(o)
            ),
            amount: Math.abs(
              cash(o)
            ),
            type:
              operationType(o)
          }))
          .filter(
            x =>
              !isNaN(
                x.date.getTime()
              ) &&
              x.amount > 0
          );

      const passiveTotal =
        passive.reduce(
          (sum, x) =>
            sum + x.amount,
          0
        );

      const months =
        startDate
          ? Math.max(
              1,
              (Date.now() -
                startDate.getTime()) /
                (365.25 /
                  12 *
                  86400000)
            )
          : 1;

      const monthlyPassive =
        passiveTotal /
        months;

      const annualPassive =
        monthlyPassive * 12;

      const flows =
        operations
          .filter(
            o =>
              isExternalIn(o) ||
              isExternalOut(o)
          )
          .map(o => ({
            date: new Date(
              opDate(o)
            ),

            amount:
              isExternalIn(o)
                ? -Math.abs(
                    cash(o)
                  )
                : Math.abs(
                    cash(o)
                  )
          }))
          .filter(
            x =>
              !isNaN(
                x.date.getTime()
              ) &&
              x.amount !== 0
          )
          .sort(
            (a, b) =>
              a.date - b.date
          );

      flows.push({
        date: new Date(),
        amount: total
      });

      const irr =
        xirr(flows);

      let cagr = null;

      const firstInvestment =
        flows.find(
          f => f.amount < 0
        );

      if (
        firstInvestment &&
        firstInvestment.amount !== 0 &&
        total > 0
      ) {
        const years =
          Math.max(
            1 / 365,
            (Date.now() -
              firstInvestment.date.getTime()) /
              31557600000
          );

        const invested =
          Math.abs(
            firstInvestment.amount
          );

        if (invested > 0) {
          cagr =
            Math.pow(
              total /
                invested,
              1 / years
            ) - 1;
        }
      }

      const moex =
        await getMoex();

      const payload = {
        account: {
          id: accountId,

          name:
            account.name ||
            account.type ||
            'T-Invest'
        },

        portfolio: {
          value: total,

          profit,

          profitPercent:
            profitPct,

          startDate:
            startDate
              ? startDate.toISOString()
              : null,

          cagr,

          xirr: irr
        },

        assets: enriched,

        leaders: {
          gainers:
            sorted.slice(0, 3),

          losers:
            sorted
              .slice(-3)
              .reverse()
        },

        income: {
          total:
            passiveTotal,

          monthly:
            monthlyPassive,

          annual:
            annualPassive
        },

        imoex: moex,

        updatedAt:
          new Date().toISOString(),

        operationCount:
          operations.length
      };

      res.json(payload);

    } catch (e) {
      res
        .status(
          e.status || 500
        )
        .json(
          errorJson(e)
        );
    }
  }
);

app.get(
  '/api/accounts',
  async (req, res) => {
    try {
      res.json(
        await tbank(
          M.accounts,
          {
            status:
              'ACCOUNT_STATUS_OPEN'
          }
        )
      );
    } catch (e) {
      res
        .status(
          e.status || 500
        )
        .json(
          errorJson(e)
        );
    }
  }
);

app.get(
  '*',
  (req, res) =>
    res.sendFile(
      path.join(
        __dirname,
        'public',
        'index.html'
      )
    )
);

const port =
  process.env.PORT ||
  10000;

app.listen(
  port,
  '0.0.0.0',
  () =>
    console.log(
      `T-Invest Pulse listening on ${port}`
    )
);
