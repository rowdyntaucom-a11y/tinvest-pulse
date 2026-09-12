import assert from 'node:assert/strict'
import {
  buildPortfolioDataContext,
  PORTFOLIO_DATA_CONTEXT_CALC_VERSION,
} from '../src/features/portfolio/portfolioDataContext.ts'
import type { HistoryPoint, PortfolioSnapshot, PositionSnapshot } from '../src/lib/portfolioApi.ts'

function history(date: string): HistoryPoint {
  return { date, portfolio: 1, imoex: 1, value: 1, invested: 1 }
}

function position(
  ticker: string,
  currentPrice: number,
  costBasis: number,
): PositionSnapshot {
  return {
    figi: null,
    instrumentUid: null,
    ticker,
    name: ticker,
    instrumentType: 'share',
    quantity: 1,
    averagePrice: 1,
    costBasis,
    currentPrice,
    currentValue: 1,
    expectedYield: 0,
    weight: 0,
    bond: null,
  }
}

function snapshot(overrides: Partial<PortfolioSnapshot> = {}): PortfolioSnapshot {
  return {
    accountName: '  Кряхтящий фонд  ',
    value: 100,
    profit: 0,
    profitPct: 0,
    passiveIncome: 0,
    averageMonthlyPassiveIncome: 0,
    averageAnnualPassiveIncome: 0,
    positions: 0,
    positionItems: [],
    xirr: null,
    cagr: null,
    riskFreeRate: null,
    riskFreeRateDate: null,
    startDate: null,
    updatedAt: null,
    history: [],
    source: 'dashboard',
    ...overrides,
  }
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const now = new Date('2026-09-12T08:30:00.000Z')
const reported = buildPortfolioDataContext(snapshot({
  updatedAt: '2026-09-12T08:00:00.000Z',
  history: [
    history('2026-09-10T15:20:00Z'),
    history('2026-09-01'),
    history('2026-02-30'),
    history('not-a-date'),
    history(''),
    history('2026-09-05'),
  ],
  positionItems: [
    position('A', 10, 20),
    position('B', 0, 30),
    position('C', Number.NaN, 0),
    position('D', 5, Number.POSITIVE_INFINITY),
  ],
}), now)

assert.equal(reported.calcVersion, PORTFOLIO_DATA_CONTEXT_CALC_VERSION)
assert.equal(reported.calcVersion, '1.1')
assert.equal(reported.accountName, 'Кряхтящий фонд')
assert.equal(reported.source, 'DASHBOARD')
assert.equal(reported.timestampState, 'REPORTED')
assert.equal(reported.reportedAt, '2026-09-12T08:00:00.000Z')
close(reported.ageMinutes, 30)
assert.equal(reported.history.points, 6)
assert.equal(reported.history.validDatePoints, 3)
assert.equal(reported.history.firstDate, '2026-09-01')
assert.equal(reported.history.lastDate, '2026-09-10')
assert.equal(reported.positions.total, 4)
assert.equal(reported.positions.priced, 2)
assert.equal(reported.positions.withCostBasis, 2)

const missing = buildPortfolioDataContext(snapshot({
  accountName: '   ',
  source: 'portfolio',
  updatedAt: null,
}), now)
assert.equal(missing.accountName, null)
assert.equal(missing.source, 'PORTFOLIO')
assert.equal(missing.timestampState, 'MISSING')
assert.equal(missing.reportedAt, null)
assert.equal(missing.ageMinutes, null)
assert.equal(missing.history.validDatePoints, 0)

const invalid = buildPortfolioDataContext(snapshot({
  source: 'fallback',
  updatedAt: 'definitely-not-a-timestamp',
  history: [history('2026-13-01'), history('2026-00-10'), history('2026-04-31')],
}), now)
assert.equal(invalid.source, 'FALLBACK')
assert.equal(invalid.timestampState, 'INVALID')
assert.equal(invalid.reportedAt, null)
assert.equal(invalid.ageMinutes, null)
assert.equal(invalid.history.points, 3)
assert.equal(invalid.history.validDatePoints, 0)
assert.equal(invalid.history.firstDate, null)
assert.equal(invalid.history.lastDate, null)

const futureReported = buildPortfolioDataContext(snapshot({
  updatedAt: '2026-09-12T09:00:00.000Z',
}), now)
assert.equal(futureReported.timestampState, 'REPORTED')
close(futureReported.ageMinutes, 0)

console.log('portfolio data context regression: ok')
