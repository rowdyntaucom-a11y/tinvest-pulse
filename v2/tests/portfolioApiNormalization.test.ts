import assert from 'node:assert/strict'
import {
  loadPortfolio,
  PORTFOLIO_NORMALIZATION_VERSION,
} from '../src/lib/portfolioApi.ts'

let dashboardPayload: Record<string, unknown> = {}
let dashboardStatus = 200
let legacyPortfolioPayload: Record<string, unknown> | null = null
let operationsSummaryPayload: Record<string, unknown> | null = null
let accountsPayload: Record<string, unknown> | null = null

;(globalThis as { fetch: typeof fetch }).fetch = async input => {
  const url = String(input)
  if (url === '/api/dashboard') {
    return new Response(JSON.stringify(dashboardPayload), {
      status: dashboardStatus,
      headers: { 'content-type': 'application/json' },
    })
  }
  if (url === '/api/portfolio' && legacyPortfolioPayload) {
    return new Response(JSON.stringify(legacyPortfolioPayload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  if (url === '/api/operations-summary' && operationsSummaryPayload) {
    return new Response(JSON.stringify(operationsSummaryPayload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  if (url === '/api/accounts' && accountsPayload) {
    return new Response(JSON.stringify(accountsPayload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  throw new Error(`unexpected fetch ${url}`)
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

assert.equal(PORTFOLIO_NORMALIZATION_VERSION, '1.5')

dashboardPayload = {
  portfolio: {
    value: { units: '1000', nano: 500_000_000 },
    profit: '50,5',
    profitPercent: '0,0505',
    xirr: 'not-a-number',
    cagr: { value: '' },
    startDate: '2026-07-26T12:34:56.000Z',
    positions: [
      {
        ticker: 'TESTBOND',
        name: 'Test Bond',
        instrumentType: 'bond',
        quantity: '2',
        averagePrice: { units: '100', nano: 0 },
        currentPrice: '125,5',
        currentValue: '',
        expectedYield: '51,2',
        bond: {
          maturityDate: '2030-02-30',
          nominal: 'NaN',
          currency: ' rub ',
          couponQuantityPerYear: 'oops',
          floatingCoupon: false,
          perpetual: false,
          amortizing: false,
          issueKind: '  GOVERNMENT  ',
          countryOfRisk: ' RU ',
          countryOfRiskName: ' Россия ',
          sector: ' Государственный ',
          issuerUid: ' issuer-1 ',
          issuerName: ' Минфин ',
        },
      },
    ],
  },
  passiveIncome: {
    total: '75,25',
    averageMonthly: '12,5',
    averageAnnual: '150',
  },
  account: { id: 'acc-1', name: 'Кряхтящий фонд', type: 'ACCOUNT_TYPE_TINKOFF_IIS', status: 'ACCOUNT_STATUS_OPEN', openedDate: '2026-07-26T00:00:00.000Z', accessLevel: 'ACCOUNT_ACCESS_LEVEL_READ_ONLY' },
  cbr: {
    rate: 'Infinity',
    rateDate: '2026-09-12',
    nextMeeting: '2026-10-23T13:30:00+03:00',
  },
  updatedAt: '2026-09-12T08:00:00.000Z',
  history: {
    points: [
      { date: '2026-09-01T15:20:00.000Z', portfolio: '1,25', imoex: 'bad' },
      { date: '2026-02-30', portfolio: 2, imoex: 3 },
      { date: 'not-a-date', portfolio: 4, imoex: 5 },
    ],
    valuePoints: [
      { date: '2026-09-01', value: { units: '1000', nano: 500_000_000 } },
      { date: '2026-09-02', value: { units: 'bad', nano: 1 } },
    ],
    investedPoints: [
      { date: '2026-09-02', value: '900' },
      { date: '2026-13-01', value: 777 },
    ],
  },
}

const invalidNullable = await loadPortfolio()
assert.equal(invalidNullable.source, 'dashboard')
close(invalidNullable.value, 1000.5)
close(invalidNullable.profit, 50.5)
close(invalidNullable.profitPct, 5.05)
close(invalidNullable.passiveIncome, 75.25)
close(invalidNullable.averageMonthlyPassiveIncome, 12.5)
close(invalidNullable.averageAnnualPassiveIncome, 150)
assert.equal(invalidNullable.xirr, null)
assert.equal(invalidNullable.cagr, null)
assert.equal(invalidNullable.riskFreeRate, null)
assert.equal(invalidNullable.riskFreeRateDate, '2026-09-12')
assert.equal(invalidNullable.nextRateMeeting, '2026-10-23')
assert.equal(invalidNullable.startDate, '2026-07-26T12:34:56.000Z')
assert.equal(invalidNullable.updatedAt, '2026-09-12T08:00:00.000Z')
assert.equal(invalidNullable.positions, 1)
assert.equal(invalidNullable.accountContext?.available, true)
assert.equal(invalidNullable.accountContext?.type, 'ACCOUNT_TYPE_TINKOFF_IIS')
assert.equal(invalidNullable.accountContext?.status, 'ACCOUNT_STATUS_OPEN')
assert.equal(invalidNullable.accountContext?.openedDate, '2026-07-26T00:00:00.000Z')
assert.equal(invalidNullable.accountContext?.accessLevel, 'ACCOUNT_ACCESS_LEVEL_READ_ONLY')

const bondPosition = invalidNullable.positionItems[0]
close(bondPosition.quantity, 2)
close(bondPosition.averagePrice, 100)
close(bondPosition.costBasis, 200)
close(bondPosition.currentPrice, 125.5)
close(bondPosition.currentValue, 251)
close(bondPosition.expectedYield, 51.2)
assert.equal(bondPosition.bond?.maturityDate, null)
assert.equal(bondPosition.bond?.nominal, null)
assert.equal(bondPosition.bond?.couponQuantityPerYear, null)
assert.equal(bondPosition.bond?.currency, 'RUB')
assert.equal(bondPosition.bond?.floatingCoupon, false)
assert.equal(bondPosition.bond?.perpetual, false)
assert.equal(bondPosition.bond?.amortizing, false)
assert.equal(bondPosition.bond?.issueKind, 'GOVERNMENT')
assert.equal(bondPosition.bond?.countryOfRisk, 'RU')
assert.equal(bondPosition.bond?.countryOfRiskName, 'Россия')
assert.equal(bondPosition.bond?.sector, 'Государственный')
assert.equal(bondPosition.bond?.issuerUid, 'issuer-1')
assert.equal(bondPosition.bond?.issuerName, 'Минфин')

assert.deepEqual(invalidNullable.history.map(point => point.date), ['2026-09-01', '2026-09-02'])
const firstHistory = invalidNullable.history[0]
close(firstHistory.portfolio, 1.25)
assert.equal(firstHistory.imoex, null)
close(firstHistory.value, 1000.5)
assert.equal(firstHistory.invested, null)
const secondHistory = invalidNullable.history[1]
assert.equal(secondHistory.portfolio, null)
assert.equal(secondHistory.imoex, null)
assert.equal(secondHistory.value, null)
close(secondHistory.invested, 900)

dashboardPayload = {
  portfolio: {
    value: '1',
    profit: '0',
    profitPercent: 0,
    xirr: 0,
    cagr: '0',
    positions: [
      {
        ticker: 'ZERO',
        name: 'Zero-safe',
        instrumentType: 'bond',
        quantity: 1,
        averagePrice: 1,
        currentPrice: 1,
        currentValue: 1,
        expectedYield: 0,
        bond: {
          maturityDate: '2030-12-31T00:00:00.000Z',
          nominal: '0',
          currency: ' usd ',
          couponQuantityPerYear: 0,
          floatingCoupon: false,
          perpetual: false,
          amortizing: false,
        },
      },
    ],
  },
  account: { name: 'Zero Test' },
  cbr: {
    rate: { value: '0' },
    rateDate: '2026-09-12T13:30:00+03:00',
    nextMeeting: '2026-02-30',
  },
  history: {
    points: [
      { date: '2026-09-03', portfolio: 0, imoex: { value: '0' } },
    ],
    valuePoints: [
      { date: '2026-09-03', value: '0' },
    ],
    investedPoints: [
      { date: '2026-09-03', value: 0 },
    ],
  },
}

const legitimateZeros = await loadPortfolio()
close(legitimateZeros.xirr, 0)
close(legitimateZeros.cagr, 0)
close(legitimateZeros.riskFreeRate, 0)
assert.equal(legitimateZeros.riskFreeRateDate, '2026-09-12')
assert.equal(legitimateZeros.nextRateMeeting, null)
assert.equal(legitimateZeros.history.length, 1)
close(legitimateZeros.history[0].portfolio, 0)
close(legitimateZeros.history[0].imoex, 0)
close(legitimateZeros.history[0].value, 0)
close(legitimateZeros.history[0].invested, 0)
assert.equal(legitimateZeros.positionItems[0].bond?.maturityDate, '2030-12-31')
close(legitimateZeros.positionItems[0].bond?.nominal ?? null, 0)
close(legitimateZeros.positionItems[0].bond?.couponQuantityPerYear ?? null, 0)
assert.equal(legitimateZeros.positionItems[0].bond?.currency, 'USD')

// Same-day duplicates are safe only when their finite values agree. A
// conflicting duplicate must not win by array order, because that would make
// TWR/benchmark/value diagnostics depend on arbitrary transport ordering.
dashboardPayload = {
  portfolio: { value: 100, profit: 0, profitPercent: 0, positions: [] },
  account: { name: 'History Conflict Test' },
  history: {
    points: [
      { date: '2026-09-04', portfolio: 1.1, imoex: 2.2 },
      { date: '2026-09-04T18:00:00Z', portfolio: 1.1, imoex: 2.2 },
      { date: '2026-09-05', portfolio: 1.2, imoex: 2.3 },
      { date: '2026-09-05T19:00:00Z', portfolio: 1.25, imoex: 2.3 },
      { date: '2026-09-05', portfolio: 1.2, imoex: 2.3 },
      { date: '2026-09-06', portfolio: 'bad', imoex: 2.4 },
      { date: '2026-09-06', portfolio: 1.3, imoex: 2.4 },
    ],
    valuePoints: [
      { date: '2026-09-04', value: 100 },
      { date: '2026-09-04', value: 100 },
      { date: '2026-09-05', value: 110 },
      { date: '2026-09-05', value: 111 },
      { date: '2026-09-05', value: 110 },
    ],
    investedPoints: [
      { date: '2026-09-04', value: 90 },
      { date: '2026-09-04', value: 'bad' },
      { date: '2026-09-05', value: 95 },
      { date: '2026-09-05', value: 96 },
    ],
  },
}

const conflictGuard = await loadPortfolio()
assert.deepEqual(conflictGuard.history.map(point => point.date), ['2026-09-04', '2026-09-05', '2026-09-06'])
close(conflictGuard.history[0].portfolio, 1.1)
close(conflictGuard.history[0].imoex, 2.2)
close(conflictGuard.history[0].value, 100)
close(conflictGuard.history[0].invested, 90)
assert.equal(conflictGuard.history[1].portfolio, null)
close(conflictGuard.history[1].imoex, 2.3)
assert.equal(conflictGuard.history[1].value, null)
assert.equal(conflictGuard.history[1].invested, null)
close(conflictGuard.history[2].portfolio, 1.3)
close(conflictGuard.history[2].imoex, 2.4)
assert.equal(conflictGuard.history[2].value, null)
assert.equal(conflictGuard.history[2].invested, null)

// A transient full-dashboard failure may fall back to the independently verified
// read-only broker portfolio route. The reduced contract stays visibly reduced:
// no history, XIRR or benchmark values are invented.
dashboardStatus = 503
legacyPortfolioPayload = {
  totalValue: 1250,
  expectedYield: 250,
  fetchedAt: '2026-09-30T03:00:00.000Z',
  account: {
    name: 'Recovery IIS',
    type: 'ACCOUNT_TYPE_TINKOFF_IIS',
    status: 'ACCOUNT_STATUS_OPEN',
    openedDate: '2026-07-26T00:00:00.000Z',
    accessLevel: 'ACCOUNT_ACCESS_LEVEL_READ_ONLY',
  },
  positions: [
    {
      ticker: 'FALLBACK',
      name: 'Verified broker fallback',
      instrumentType: 'share',
      quantity: 2,
      averagePrice: 500,
      currentPrice: 625,
      currentValue: 1250,
      expectedYield: 250,
    },
  ],
}
operationsSummaryPayload = {
  passiveIncomeTotal: 120,
  coverage: { possiblyTruncated: false, observedFrom: '2026-07-26T00:00:00.000Z' },
  operations: [
    { date: '2026-07-27T10:00:00.000Z', payment: 1000, isExternalCash: true },
    { date: '2026-08-10T10:00:00.000Z', payment: 60, isIncome: true },
  ],
}
const recoveredLegacy = await loadPortfolio()
assert.equal(recoveredLegacy.source, 'portfolio')
close(recoveredLegacy.value, 1250)
close(recoveredLegacy.profit, 250)
assert.equal(recoveredLegacy.positions, 1)
assert.equal(recoveredLegacy.positionItems[0].ticker, 'FALLBACK')
assert.equal(recoveredLegacy.accountName, 'Recovery IIS')
assert.equal(recoveredLegacy.accountContext?.available, true)
assert.equal(recoveredLegacy.accountContext?.type, 'ACCOUNT_TYPE_TINKOFF_IIS')
assert.equal(recoveredLegacy.startDate, '2026-07-27T10:00:00.000Z')
close(recoveredLegacy.passiveIncome, 120)
assert.ok(recoveredLegacy.averageMonthlyPassiveIncome > 0)
assert.ok(recoveredLegacy.averageAnnualPassiveIncome > 0)
assert.deepEqual(recoveredLegacy.recoveryContext, {
  brokerPortfolio: true,
  account: true,
  operations: true,
  passiveIncomeComplete: true,
})
assert.equal(recoveredLegacy.history.length, 0)
assert.equal(recoveredLegacy.xirr, null)
assert.equal(recoveredLegacy.cagr, null)
assert.equal(recoveredLegacy.riskFreeRate, null)
assert.equal(recoveredLegacy.updatedAt, '2026-09-30T03:00:00.000Z')
dashboardStatus = 200
legacyPortfolioPayload = null
operationsSummaryPayload = null
accountsPayload = null

console.log('portfolio API normalization regression: ok')

// A malformed dashboard plus unavailable legacy source must remain an explicit transport failure.\ndashboardPayload = { portfolio: { positions: [] }, account: { name: 'Missing value' } }\nawait assert.rejects(() => loadPortfolio(), /Broker source unavailable/)
