import assert from 'node:assert/strict'
import {
  loadPortfolio,
  PORTFOLIO_NORMALIZATION_VERSION,
} from '../src/lib/portfolioApi.ts'

let dashboardPayload: Record<string, unknown> = {}

;(globalThis as { fetch: typeof fetch }).fetch = async input => {
  const url = String(input)
  if (url !== '/api/dashboard') throw new Error(`unexpected fetch ${url}`)
  return new Response(JSON.stringify(dashboardPayload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

assert.equal(PORTFOLIO_NORMALIZATION_VERSION, '1.1')

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
  account: { name: 'Кряхтящий фонд' },
  cbr: {
    rate: 'Infinity',
    rateDate: '2026-09-12',
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
assert.equal(invalidNullable.startDate, '2026-07-26T12:34:56.000Z')
assert.equal(invalidNullable.updatedAt, '2026-09-12T08:00:00.000Z')
assert.equal(invalidNullable.positions, 1)

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
  cbr: { rate: { value: '0' }, rateDate: '2026-09-12T13:30:00+03:00' },
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
assert.equal(legitimateZeros.history.length, 1)
close(legitimateZeros.history[0].portfolio, 0)
close(legitimateZeros.history[0].imoex, 0)
close(legitimateZeros.history[0].value, 0)
close(legitimateZeros.history[0].invested, 0)
assert.equal(legitimateZeros.positionItems[0].bond?.maturityDate, '2030-12-31')
close(legitimateZeros.positionItems[0].bond?.nominal ?? null, 0)
close(legitimateZeros.positionItems[0].bond?.couponQuantityPerYear ?? null, 0)
assert.equal(legitimateZeros.positionItems[0].bond?.currency, 'USD')

console.log('portfolio API normalization regression: ok')
