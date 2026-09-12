import assert from 'node:assert/strict'
import {
  BOND_RISK_DIMENSIONS_CALC_VERSION,
  buildBondRiskDimensions,
} from '../src/features/portfolio/bondRiskDimensions.ts'
import type { BondMetadata, PositionSnapshot } from '../src/lib/portfolioApi.ts'

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

function close(actual: number | null, expected: number, tolerance = 1e-12) {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

const positions = [
  position('BOND_A', 'bond', 60, meta({
    countryOfRisk: 'RU', countryOfRiskName: 'Россия', sector: 'Государственный', issuerUid: 'issuer-1', issuerName: 'Минфин',
  })),
  position('SU2624200000', 'share', 40, meta({
    countryOfRisk: 'ru', countryOfRiskName: 'Россия', sector: 'государственный', issuerUid: 'issuer-1', issuerName: 'Минфин',
  })),
  position('OTHER_OFX', 'other', 100, meta({
    countryOfRisk: 'KZ', countryOfRiskName: 'Казахстан', sector: 'Корпоративный', issuerUid: 'issuer-3', issuerName: 'Эмитент 3',
  }), 'ОФЗ тест'),
  position('BOND_UNCOVERED', 'bond', 50, meta()),
  position('BOND_NAN', 'bond', Number.NaN, meta({
    countryOfRisk: 'RU', countryOfRiskName: 'Россия', sector: 'Государственный', issuerUid: 'issuer-1', issuerName: 'Минфин',
  })),
  position('SHARE', 'share', 1000, null),
]

const result = buildBondRiskDimensions(positions)
assert.equal(result.calcVersion, BOND_RISK_DIMENSIONS_CALC_VERSION)
assert.equal(result.calcVersion, '1.1')
assert.equal(result.bondCount, 5)
close(result.totalBondValue, 250)

for (const dimension of [result.countryOfRisk, result.sector, result.issuer]) {
  assert.equal(dimension.available, true)
  close(dimension.totalBondValue, 250)
  close(dimension.coveredValue, 200)
  close(dimension.coverageRatio, 0.8)
  close(dimension.hhi, 0.5)
  close(dimension.effectiveCount, 2)
  close(dimension.topShare, 0.5)
  close(dimension.rows.reduce((sum, row) => sum + row.shareOfCovered, 0), 1)
}

assert.deepEqual(
  result.countryOfRisk.rows.map(row => [row.label, row.value]),
  [['Казахстан', 100], ['Россия', 100]],
)
assert.deepEqual(
  result.sector.rows.map(row => [row.label, row.value]),
  [['Государственный', 100], ['Корпоративный', 100]],
)
assert.deepEqual(
  result.issuer.rows.map(row => [row.label, row.value]),
  [['Минфин', 100], ['Эмитент 3', 100]],
)

const missingIssuerName = buildBondRiskDimensions([
  position('BOND_UID', 'bond', 25, meta({ issuerUid: '1234567890abcdef' })),
])
assert.equal(missingIssuerName.issuer.available, true)
assert.equal(missingIssuerName.issuer.rows[0].label, 'Эмитент 12345678…')
close(missingIssuerName.issuer.coverageRatio, 1)
close(missingIssuerName.issuer.hhi, 1)
close(missingIssuerName.issuer.effectiveCount, 1)
close(missingIssuerName.issuer.topShare, 1)

const invalidValues = buildBondRiskDimensions([
  position('NAN', 'bond', Number.NaN, meta({ countryOfRisk: 'RU' })),
  position('INF', 'bond', Number.POSITIVE_INFINITY, meta({ countryOfRisk: 'RU' })),
  position('NEG', 'bond', -10, meta({ countryOfRisk: 'RU' })),
  position('ZERO', 'bond', 0, meta({ countryOfRisk: 'RU' })),
])
assert.equal(invalidValues.bondCount, 4)
close(invalidValues.totalBondValue, 0)
assert.equal(invalidValues.countryOfRisk.available, false)
close(invalidValues.countryOfRisk.coveredValue, 0)
close(invalidValues.countryOfRisk.coverageRatio, 0)
assert.equal(invalidValues.countryOfRisk.hhi, null)
assert.equal(invalidValues.countryOfRisk.effectiveCount, null)
assert.equal(invalidValues.countryOfRisk.topShare, null)
assert.deepEqual(invalidValues.countryOfRisk.rows, [])

const noBonds = buildBondRiskDimensions([
  position('SBER', 'share', 100, null, 'Сбер'),
])
assert.equal(noBonds.bondCount, 0)
close(noBonds.totalBondValue, 0)
for (const dimension of [noBonds.countryOfRisk, noBonds.sector, noBonds.issuer]) {
  assert.equal(dimension.available, false)
  close(dimension.coverageRatio, 0)
  assert.equal(dimension.rows.length, 0)
}

console.log('bond risk dimensions regression: ok')
