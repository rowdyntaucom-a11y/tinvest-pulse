import assert from 'node:assert/strict'
import {
  calculatePortfolioPnlAttribution,
  findPositionPnlAttribution,
  PORTFOLIO_PNL_ATTRIBUTION_CALC_VERSION,
} from '../src/features/portfolio/portfolioAttribution.ts'
import type { PositionSnapshot } from '../src/lib/portfolioApi.ts'

function position(
  ticker: string,
  instrumentType: string,
  expectedYield: number,
  name = ticker,
): PositionSnapshot {
  return {
    figi: null,
    instrumentUid: null,
    ticker,
    name,
    instrumentType,
    quantity: 1,
    averagePrice: 1,
    costBasis: 1,
    currentPrice: 1,
    currentValue: 1,
    expectedYield,
    weight: 0,
    bond: null,
  }
}

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const positions = [
  position('SHARE_WIN', 'share', 100),
  position('SHARE_LOSS', 'stock', -40),
  position('BOND_LOSS', 'bond', -60),
  position('FUND_FLAT', 'etf', 0),
  position('RUB', 'currency', 20),
  position('FUT', 'future', -20),
  position('OTHER', 'other', Number.NaN),
]

const result = calculatePortfolioPnlAttribution(positions)
assert.equal(result.calcVersion, PORTFOLIO_PNL_ATTRIBUTION_CALC_VERSION)
assert.equal(result.calcVersion, '1.0')
close(result.netPnl, 0)
close(result.grossAbsolutePnl, 240)
close(result.positivePnl, 120)
close(result.negativePnl, -120)
assert.equal(result.positions.length, positions.length)
assert.equal(result.positions[0].ticker, 'SHARE_WIN')
assert.equal(result.positions[0].direction, 'positive')
close(result.positions[0].grossPnlShare, 100 / 240)
assert.equal(result.positions.at(-1)?.direction, 'flat')

const positionShareTotal = result.positions.reduce((sum, row) => sum + (row.grossPnlShare ?? 0), 0)
close(positionShareTotal, 1)

const classes = new Map(result.assetClasses.map(row => [row.assetClass, row]))
const equities = classes.get('Акции')!
close(equities.pnl, 60)
close(equities.grossAbsolutePnl, 140)
close(equities.grossPnlShare, 140 / 240)
assert.equal(equities.direction, 'positive')

const bonds = classes.get('Облигации')!
close(bonds.pnl, -60)
close(bonds.grossAbsolutePnl, 60)
assert.equal(bonds.direction, 'negative')

const funds = classes.get('Фонды')!
close(funds.pnl, 0)
close(funds.grossAbsolutePnl, 0)
assert.equal(funds.direction, 'flat')
close(funds.grossPnlShare, 0)

const currency = classes.get('Валюта')!
close(currency.pnl, 20)
close(currency.grossAbsolutePnl, 20)

const futures = classes.get('Фьючерсы')!
close(futures.pnl, -20)
close(futures.grossAbsolutePnl, 20)

const other = classes.get('Прочее')!
close(other.pnl, 0)
close(other.grossAbsolutePnl, 0)
assert.equal(other.direction, 'flat')

const classShareTotal = result.assetClasses.reduce((sum, row) => sum + (row.grossPnlShare ?? 0), 0)
close(classShareTotal, 1)

const found = findPositionPnlAttribution(result, positions[2])
assert.notEqual(found, null)
assert.equal(found?.ticker, 'BOND_LOSS')
close(found?.pnl ?? null, -60)
assert.equal(findPositionPnlAttribution(result, position('MISSING', 'share', 0)), null)

const zero = calculatePortfolioPnlAttribution([
  position('A', 'share', 0),
  position('B', 'bond', 0),
])
close(zero.netPnl, 0)
close(zero.grossAbsolutePnl, 0)
close(zero.positivePnl, 0)
close(zero.negativePnl, 0)
assert.equal(zero.positions.every(row => row.grossPnlShare === null), true)
assert.equal(zero.assetClasses.every(row => row.grossPnlShare === null), true)
assert.equal(zero.positions.every(row => row.direction === 'flat'), true)

const nonFinite = calculatePortfolioPnlAttribution([
  position('NAN', 'share', Number.NaN),
  position('INF', 'bond', Number.POSITIVE_INFINITY),
  position('NINF', 'fund', Number.NEGATIVE_INFINITY),
])
close(nonFinite.netPnl, 0)
close(nonFinite.grossAbsolutePnl, 0)
assert.equal(nonFinite.positions.every(row => row.pnl === 0), true)
assert.equal(nonFinite.positions.every(row => row.grossPnlShare === null), true)

const cancellation = calculatePortfolioPnlAttribution([
  position('WIN', 'share', 1000),
  position('LOSS', 'bond', -999),
])
close(cancellation.netPnl, 1)
close(cancellation.grossAbsolutePnl, 1999)
close(cancellation.positions[0].grossPnlShare, 1000 / 1999)
close(cancellation.positions[1].grossPnlShare, 999 / 1999)
assert.ok((cancellation.positions[0].grossPnlShare ?? 0) < 0.51)

console.log('portfolio attribution regression: ok')
