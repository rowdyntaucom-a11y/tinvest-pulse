require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TBANK_URL = 'https://invest-public-api.tbank.ru/rest/';
const TOKEN = process.env.TINvest_API_TOKEN;

const METHODS = {
  accounts:
    'tinkoff.public.invest.api.contract.v1.UsersService/GetAccounts',

  portfolio:
    'tinkoff.public.invest.api.contract.v1.OperationsService/GetPortfolio',

  operations:
    'tinkoff.public.invest.api.contract.v1.OperationsService/GetOperationsByCursor',

  instrument:
    'tinkoff.public.invest.api.contract.v1.InstrumentsService/GetInstrumentBy'
};

function num(value) {
  if (value == null) return 0;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    return Number(value.replace(',', '.')) || 0;
  }

  if (typeof value === 'object') {
    return (
      Number(value.units || 0) +
      Number(value.nano || 0) / 1000000000
    );
  }

  return 0;
}

function money(value) {
  return num(value);
}

function quotation(value) {
  return num(value);
}

function jsonError(error) {
  return {
    error: error?.message || 'Unknown error',
    name: error?.name || null,
    code: error?.code || error?.cause?.code || null,
    cause: error?.cause
      ? String(error.cause)
      : null,
    status: error?.status || null,
    details: error?.details || null
  };
}

async function tbankRequest(method, body = {}) {
  if (!TOKEN) {
    const error = new Error(
      'TINvest_API_TOKEN is not configured'
    );

    error.status = 500;

    throw error;
  }

  let response;

  try {
    response = await fetch(
      TBANK_URL + method,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },

        body: JSON.stringify(body)
      }
    );
  } catch (error) {
    const networkError = new Error(
      `T-Bank connection failed: ${error.message}`
    );

    networkError.name = error.name;
    networkError.code = error.code;
    networkError.cause = error;

    throw networkError;
  }

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
      data?.error ||
      `T-Bank API returned HTTP ${response.status}`
    );

    error.status = response.status;
    error.details = data;

    throw error;
  }

  return data;
}


/* =========================
   ACCOUNTS
========================= */

async function getAccounts() {
  return await tbankRequest(
    METHODS.accounts,
    {
      status: 'ACCOUNT_STATUS_OPEN'
    }
  );
}


async function getOpenAccount() {
  const data = await getAccounts();

  const accounts =
    data.accounts ||
    [];

  if (!accounts.length) {
    const error = new Error(
      'T-Invest did not return any open accounts'
    );

    error.status = 404;
    error.details = data;

    throw error;
  }

  const fullAccess =
    accounts.find(account =>
      String(
        account.accessLevel || ''
      ).includes('FULL')
    );

  return fullAccess ||
    accounts[0];
}


/* =========================
   PORTFOLIO
========================= */

async function getPortfolio(accountId) {
  return await tbankRequest(
    METHODS.portfolio,
    {
      accountId,
      currency: 'RUB'
    }
  );
}


/* =========================
   OPERATIONS
========================= */

async function getOperations(
  accountId,
  fromDate = null
) {
  const allOperations = [];

  let cursor = '';

  for (
    let pageNumber = 0;
    pageNumber < 50;
    pageNumber++
  ) {
    const request = {
      accountId,

      status:
        'OPERATION_STATE_EXECUTED',

      limit: 1000,

      to:
        new Date().toISOString()
    };

    if (fromDate) {
      request.from =
        new Date(fromDate).toISOString();
    }

    if (cursor) {
      request.cursor = cursor;
    }

    const page =
      await tbankRequest(
        METHODS.operations,
        request
      );

    const operations =
      page.items ||
      page.operations ||
      [];

    allOperations.push(
      ...operations
    );

    const nextCursor =
      page.nextCursor;

    if (
      !nextCursor ||
      !operations.length
    ) {
      break;
    }

    cursor = nextCursor;
  }

  return allOperations;
}


/* =========================
   INSTRUMENTS
========================= */

async function getInstrument(figi) {
  if (!figi) {
    return null;
  }

  try {
    const data =
      await tbankRequest(
        METHODS.instrument,
        {
          idType:
            'INSTRUMENT_ID_TYPE_FIGI',

          id: figi
        }
      );

    return (
      data.instrument ||
      data ||
      null
    );
  } catch {
    return null;
  }
}


async function enrichPositions(
  positions
) {
  const result = [];

  for (
    const position of
    (positions || []).slice(0, 20)
  ) {
    const instrument =
      await getInstrument(
        position.figi
      );

    const quantity =
      quotation(
        position.quantity
      );

    const currentPrice =
      money(
        position.currentPrice
      );

    const value =
      quantity *
      currentPrice;

    const yieldRub =
      quotation(
        position.expectedYield
      );

    const yieldPercent =
      quotation(
        position.expectedYieldRelative
      );

    result.push({
      figi:
        position.figi || null,

      instrumentUid:
        position.instrumentUid ||
        null,

      ticker:
        instrument?.ticker ||
        position.ticker ||
        position.figi ||
        '—',

      name:
        instrument?.name ||
        position.name ||
        instrument?.ticker ||
        position.figi ||
        'Без названия',

      quantity,

      currentPrice,

      value,

      yieldRub,

      yieldPercent
    });
  }

  return result;
}


/* =========================
   OPERATION HELPERS
========================= */

function operationType(operation) {
  return String(
    operation.operationType ||
    operation.type ||
    ''
  ).toUpperCase();
}


function operationDate(operation) {
  return (
    operation.date ||
    operation.operationDate ||
    operation.timestamp ||
    operation.createdAt ||
    null
  );
}


function operationCash(operation) {
  if (
    operation.payment != null
  ) {
    return money(
      operation.payment
    );
  }

  if (
    operation.amount != null
  ) {
    return money(
      operation.amount
    );
  }

  if (
    operation.operationAmount != null
  ) {
    return money(
      operation.operationAmount
    );
  }

  return 0;
}


function isPassiveIncome(
  operation
) {
  const type =
    operationType(operation);

  return (
    type.includes('DIVIDEND') ||
    type.includes('COUPON')
  );
}


function isMoneyInput(
  operation
) {
  const type =
    operationType(operation);

  return (
    type.includes('INPUT') &&
    !type.includes('SECURITIES')
  );
}


function isMoneyOutput(
  operation
) {
  const type =
    operationType(operation);

  return (
    (
      type.includes('OUTPUT') ||
      type.includes('WITHDRAW')
    ) &&
    !type.includes('SECURITIES')
  );
}


/* =========================
   XIRR
========================= */

function xnpv(
  rate,
  cashFlows
) {
  if (
    rate <= -0.999999
  ) {
    return Infinity;
  }

  const firstDate =
    cashFlows[0].date.getTime();

  let result = 0;

  for (
    const cashFlow of cashFlows
  ) {
    const years =
      (
        cashFlow.date.getTime() -
        firstDate
      ) / 31557600000;

    result +=
      cashFlow.amount /
      Math.pow(
        1 + rate,
        years
      );
  }

  return result;
}


function xirr(
  cashFlows
) {
  if (
    !cashFlows ||
    cashFlows.length < 2
  ) {
    return null;
  }

  let low = -0.9999;
  let high = 10;

  let lowValue =
    xnpv(
      low,
      cashFlows
    );

  let highValue =
    xnpv(
      high,
      cashFlows
    );

  for (
    let attempt = 0;
    attempt < 10 &&
    lowValue * highValue > 0;
    attempt++
  ) {
    high *= 2;

    highValue =
      xnpv(
        high,
        cashFlows
      );
  }

  if (
    !Number.isFinite(
      lowValue
    ) ||
    !Number.isFinite(
      highValue
    ) ||
    lowValue * highValue > 0
  ) {
    return null;
  }

  for (
    let i = 0;
    i < 100;
    i++
  ) {
    const middle =
      (low + high) / 2;

    const middleValue =
      xnpv(
        middle,
        cashFlows
      );

    if (
      Math.abs(
        middleValue
      ) < 0.01
    ) {
      return middle;
    }

    if (
      lowValue *
      middleValue <= 0
    ) {
      high = middle;
      highValue =
        middleValue;
    } else {
      low = middle;
      lowValue =
        middleValue;
    }
  }

  return (
    low + high
  ) / 2;
}


/* =========================
   MOEX
========================= */

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

    const response =
      await fetch(
        url,
        {
          headers: {
            Accept:
              'application/json'
          }
        }
      );

    if (!response.ok) {
      return null;
    }

    const data =
      await response.json();

    const rows =
      data?.history?.data ||
      [];

    if (!rows.length) {
      return null;
    }

    return {
      date:
        rows[0][0],

      value:
        Number(
          rows[0][1]
        ) || null
    };

  } catch {
    return null;
  }
}


/* =========================
   HEALTH
========================= */

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      ok: true,
      tokenConfigured:
        Boolean(TOKEN),

      serverTime:
        new Date().toISOString()
    });
  }
);


/* =========================
   ACCOUNTS DEBUG
========================= */

app.get(
  '/api/accounts',
  async (req, res) => {
    try {
      const data =
        await getAccounts();

      res.json(data);

    } catch (error) {
      console.error(
        'GET /api/accounts ERROR:',
        error
      );

      res
        .status(
          error.status || 500
        )
        .json(
          jsonError(error)
        );
    }
  }
);


/* =========================
   DASHBOARD
========================= */

app.get(
  '/api/dashboard',
  async (req, res) => {
    try {
      console.log(
        'Loading T-Invest dashboard...'
      );

      const account =
        await getOpenAccount();

      console.log(
        'Account found:',
        account.id
      );

      const accountId =
        account.id;

      const portfolio =
        await getPortfolio(
          accountId
        );

      const operations =
        await getOperations(
          accountId
        );

      const assets =
        await enrichPositions(
          portfolio.positions
        );

      const portfolioValue =
        money(
          portfolio.totalAmountPortfolio
        );

      /*
       * T-Bank's expectedYield is a
       * relative percentage.
       *
       * Therefore it is used as
       * percentage, NOT as ruble profit.
       */

      const returnPercent =
        quotation(
          portfolio.expectedYield
        );

      /*
       * Absolute profit:
       * use current portfolio value
       * minus net external deposits.
       */

      const externalFlows =
        operations
          .filter(
            operation =>
              isMoneyInput(
                operation
              ) ||
              isMoneyOutput(
                operation
              )
          )
          .map(
            operation => ({
              date:
                new Date(
                  operationDate(
                    operation
                  )
                ),

              amount:
                isMoneyInput(
                  operation
                )
                  ? Math.abs(
                      operationCash(
                        operation
                      )
                    )
                  : -Math.abs(
                      operationCash(
                        operation
                      )
                    )
            })
          )
          .filter(
            flow =>
              !isNaN(
                flow.date.getTime()
              ) &&
              Number.isFinite(
                flow.amount
              )
          );

      const netInvested =
        externalFlows.reduce(
          (
            sum,
            flow
          ) =>
            sum +
            flow.amount,
          0
        );

      const absoluteProfit =
        portfolioValue -
        netInvested;


      /* =====================
         START DATE
      ===================== */

      const operationDates =
        operations
          .map(
            operation =>
              operationDate(
                operation
              )
          )
          .filter(Boolean)
          .map(
            date =>
              new Date(date)
          )
          .filter(
            date =>
              !isNaN(
                date.getTime()
              )
          );

      let startDate = null;

      if (
        operationDates.length
      ) {
        startDate =
          new Date(
            Math.min(
              ...operationDates.map(
                date =>
                  date.getTime()
              )
            )
          );
      } else if (
        account.openedDate
      ) {
        startDate =
          new Date(
            account.openedDate
          );
      }


      /* =====================
         PASSIVE INCOME
      ===================== */

      const passiveOperations =
        operations
          .filter(
            isPassiveIncome
          )
          .map(
            operation => ({
              date:
                new Date(
                  operationDate(
                    operation
                  )
                ),

              amount:
                Math.abs(
                  operationCash(
                    operation
                  )
                ),

              type:
                operationType(
                  operation
                )
            })
          )
          .filter(
            item =>
              !isNaN(
                item.date.getTime()
              ) &&
              item.amount > 0
          );

      const passiveTotal =
        passiveOperations.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.amount,
          0
        );

      let months = 1;

      if (startDate) {
        months =
          Math.max(
            1,

            (
              Date.now() -
              startDate.getTime()
            ) /
              (
                30.4375 *
                86400000
              )
          );
      }

      const passiveMonthly =
        passiveTotal /
        months;

      const passiveAnnual =
        passiveMonthly *
        12;


      /* =====================
         XIRR
      ===================== */

      const xirrFlows =
        externalFlows
          .map(
            flow => ({
              date:
                flow.date,

              amount:
                -flow.amount
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              a.date -
              b.date
          );

      xirrFlows.push({
        date:
          new Date(),

        amount:
          portfolioValue
      });

      const xirrValue =
        xirr(
          xirrFlows
        );


      /* =====================
         CAGR
      ===================== */

      let cagr = null;

      const firstInvestment =
        externalFlows
          .filter(
            flow =>
              flow.amount > 0
          )
          .sort(
            (
              a,
              b
            ) =>
              a.date -
              b.date
          )[0];

      if (
        firstInvestment &&
        portfolioValue > 0
      ) {
        const years =
          Math.max(
            1 / 365,

            (
              Date.now() -
              firstInvestment.date.getTime()
            ) /
              31557600000
          );

        const initial =
          firstInvestment.amount;

        if (
          initial > 0
        ) {
          cagr =
            Math.pow(
              portfolioValue /
                initial,

              1 / years
            ) - 1;
        }
      }


      /* =====================
         LEADERS
      ===================== */

      const sortedAssets =
        [...assets].sort(
          (
            a,
            b
          ) =>
            b.yieldRub -
            a.yieldRub
        );

      const gainers =
        sortedAssets
          .filter(
            asset =>
              asset.yieldRub >= 0
          )
          .slice(
            0,
            3
          );

      const losers =
        [...sortedAssets]
          .filter(
            asset =>
              asset.yieldRub < 0
          )
          .sort(
            (
              a,
              b
            ) =>
              a.yieldRub -
              b.yieldRub
          )
          .slice(
            0,
            3
          );


      /* =====================
         IMOEX
      ===================== */

      const imoex =
        await getMoex();


      /* =====================
         RESPONSE
      ===================== */

      res.json({
        account: {
          id:
            accountId,

          name:
            account.name ||
            'T-Invest'
        },

        portfolio: {
          value:
            portfolioValue,

          profit:
            absoluteProfit,

          profitPercent:
            returnPercent,

          startDate:
            startDate
              ? startDate.toISOString()
              : null,

          cagr,

          xirr:
            xirrValue
        },

        assets,

        leaders: {
          gainers,

          losers
        },

        income: {
          total:
            passiveTotal,

          monthly:
            passiveMonthly,

          annual:
            passiveAnnual
        },

        imoex,

        operationCount:
          operations.length,

        updatedAt:
          new Date().toISOString()
      });

    } catch (error) {
      console.error(
        'GET /api/dashboard ERROR:',
        error
      );

      res
        .status(
          error.status || 500
        )
        .json(
          jsonError(error)
        );
    }
  }
);


/* =========================
   SPA FALLBACK
========================= */

app.get(
  '*',
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        'public',
        'index.html'
      )
    );
  }
);


/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT ||
  10000;

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `T-Invest Pulse running on port ${PORT}`
    );
  }
);
