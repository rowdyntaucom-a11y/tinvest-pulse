import assert from 'node:assert/strict'
import {
  BOND_MATURITY_DIAGNOSTICS_CALC_VERSION,
  buildBondMaturityDiagnostics,
} from '../src/features/portfolio/bondMaturityDiagnostics.ts'
import type { BondMetadata, PositionSnapshot } from '../src/lib/portfolioApi.ts'

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000
const NOW = Date.parse('2030-01-01T00:00:00.000Z')

function meta(overrides: Partial<BondMetadata> = {}): BondMetadata {
  return {
    maturityDate: null,
    nominal: null,
    currency: null,
    couponQuantityPerYear: null,
    floatingCoupon: null,
    perpetual: null,
    amortizing: null,
    issueKind: null,
    countryOfRisk: null,
    countryOfRiskName: null,
    sector: null,
    issuerUid: null,
    issuerName: null,
    ...overrides,
  }
}

function position(
  ticker: string,
  instrumentType: string,
  currentValue: number,
  bond: BondMetadata | null,
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
    currentValue,
    expectedYield: 0,
    weight: 0,
    bond,
  }
}

function close(actual: number | null, expected: number, tolerance = 1e-10) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

function bucketValue(rows: Array<{ key: string; value: number }>, key: string) {
  return rows.find(row => row.key === key)?.value ?? 0
}

const positions = [
  position('SHORT', 'bond', 100, meta({
    maturityDate: '2031-01-01T00:00:00.000Z', currency: 'RUB', floatingCoupon: false, couponQuantityPerYear: 2,
  })),
  position('SU2624200000', 'share', 200, meta({
    maturityDate: '2035-01-01T00:00:00.000Z', currency: 'RUB', floatingCoupon: true,
  })),
  position('LONG', 'bond', 300, meta({
    maturityDate: '2040-01-01T00:00:00.000Z', currency: 'CNY', amortizing: true,
  })),
  position('VERY_LONG', 'bond', 400, meta({
    maturityDate: '2050-01-01T00:00:00.000Z', currency: 'CNY', floatingCoupon: false, couponQuantityPerYear: 1,
  })),
  position('PERP', 'bond', 50, meta({ perpetual: true, currency: 'USD', floatingCoupon: true })),
  position('PAST', 'bond', 60, meta({
    maturityDate: '2029-01-01T00:00:00.000Z', currency: 'RUB', floatingCoupon: false, couponQuantityPerYear: 1,
  })),
  position('INVALID_DATE', 'bond', 70, meta({ maturityDate: '2030-02-30' })),
  position('UNVERIFIED', 'bond', 80, null),
  position('NAN_VALUE', 'bond', Number.NaN, meta({ maturityDate: '2032-01-01T00:00:00.000Z' })),
  position('SBER', 'share', 1000, null, 'Сбер'),
]

const result = buildBondMaturityDiagnostics(positions, NOW)
assert.equal(result.calcVersion, BOND_MATURITY_DIAGNOSTICS_CALC_VERSION)
assert.equal(result.calcVersion, '1.0')
assert.equal(result.bondCount, 9)
close(result.total, 1260)
close(result.metadataValue, 1110)
close(result.metadataCoverage, 1110 / 1260)
close(result.datedMaturityValue, 1000)
close(result.maturityDateCoverage, 1000 / 1260)
close(result.ofzValue, 200)
close(result.ofzShare, 200 / 1260)
assert.equal(result.floatingCount, 2)
assert.equal(result.amortizingCount, 1)

close(bucketValue(result.maturityRows, '0-3'), 100)
close(bucketValue(result.maturityRows, '3-7'), 200)
close(bucketValue(result.maturityRows, '7-15'), 300)
close(bucketValue(result.maturityRows, '15+'), 400)
close(bucketValue(result.maturityRows, 'perpetual'), 50)
close(bucketValue(result.maturityRows, 'unknown'), 210)
close(result.maturityRows.reduce((sum, row) => sum + row.value, 0), result.total)

const expectedWeightedYears = (
  (Date.parse('2031-01-01T00:00:00.000Z') - NOW) / YEAR_MS * 100
  + (Date.parse('2035-01-01T00:00:00.000Z') - NOW) / YEAR_MS * 200
  + (Date.parse('2040-01-01T00:00:00.000Z') - NOW) / YEAR_MS * 300
  + (Date.parse('2050-01-01T00:00:00.000Z') - NOW) / YEAR_MS * 400
) / 1000
close(result.weightedYearsToMaturity, expectedWeightedYears)
assert.equal(result.nearest?.ticker, 'SHORT')
assert.equal(result.nearest?.maturityDate, '2031-01-01T00:00:00.000Z')
close(result.nearest?.years ?? null, (Date.parse('2031-01-01T00:00:00.000Z') - NOW) / YEAR_MS)

close(bucketValue(result.couponRows, 'floating'), 250)
close(bucketValue(result.couponRows, 'nonfloating'), 560)
close(bucketValue(result.couponRows, 'unknown'), 450)
close(result.couponRows.reduce((sum, row) => sum + row.value, 0), result.total)

assert.deepEqual(
  result.currencyRows.map(row => [row.label, row.value]),
  [['CNY', 700], ['RUB', 360], ['Нет данных', 150], ['USD', 50]],
)
close(result.currencyRows.reduce((sum, row) => sum + row.value, 0), result.total)

const falseBooleanMetadata = buildBondMaturityDiagnostics([
  position('FIXED_FLAG_ONLY', 'bond', 10, meta({ floatingCoupon: false })),
], NOW)
close(falseBooleanMetadata.metadataCoverage, 1)
close(falseBooleanMetadata.metadataValue, 10)
close(bucketValue(falseBooleanMetadata.couponRows, 'unknown'), 10)
assert.equal(falseBooleanMetadata.weightedYearsToMaturity, null)
assert.equal(falseBooleanMetadata.nearest, null)

const invalidValues = buildBondMaturityDiagnostics([
  position('NAN', 'bond', Number.NaN, meta({ maturityDate: '2031-01-01' })),
  position('INF', 'bond', Number.POSITIVE_INFINITY, meta({ maturityDate: '2031-01-01' })),
  position('NEG', 'bond', -10, meta({ maturityDate: '2031-01-01' })),
  position('ZERO', 'bond', 0, meta({ maturityDate: '2031-01-01' })),
], NOW)
assert.equal(invalidValues.bondCount, 4)
close(invalidValues.total, 0)
close(invalidValues.metadataValue, 0)
close(invalidValues.metadataCoverage, 0)
close(invalidValues.datedMaturityValue, 0)
close(invalidValues.maturityDateCoverage, 0)
assert.equal(invalidValues.weightedYearsToMaturity, null)
assert.equal(invalidValues.nearest, null)
assert.deepEqual(invalidValues.maturityRows, [])
assert.deepEqual(invalidValues.couponRows, [])
assert.deepEqual(invalidValues.currencyRows, [])

const noBonds = buildBondMaturityDiagnostics([
  position('YNDX', 'share', 100, null, 'Яндекс'),
], NOW)
assert.equal(noBonds.bondCount, 0)
close(noBonds.total, 0)
close(noBonds.ofzShare, 0)
assert.equal(noBonds.nearest, null)

console.log('bond maturity diagnostics regression: ok')
