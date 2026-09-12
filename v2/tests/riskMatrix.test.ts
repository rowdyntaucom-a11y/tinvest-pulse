import assert from 'node:assert/strict'
import { calculateCorrelationMatrix, type PricePoint, type RiskSeries } from '../src/features/analytics/riskMatrix.ts'

const close = (actual: number | null, expected: number, tolerance = 1e-10) => {
  assert.notEqual(actual, null)
  assert.ok(Math.abs((actual as number) - expected) <= tolerance, `expected ${expected}, got ${actual}`)
}

function pointsFromReturns(returns: number[]): PricePoint[] {
  let value = 100
  const points: PricePoint[] = [{ date: '2025-01-01', value }]
  for (let index = 0; index < returns.length; index += 1) {
    value *= 1 + returns[index]
    const date = new Date(Date.UTC(2025, 0, 2 + index)).toISOString().slice(0, 10)
    points.push({ date, value })
  }
  return points
}

function pair(result: ReturnType<typeof calculateCorrelationMatrix>, a: string, b: string) {
  return result.cells.find(cell => (cell.a === a && cell.b === b) || (cell.a === b && cell.b === a))
}

const base60 = Array.from({ length: 60 }, (_, index) => index % 4 === 0 ? -0.012 : index % 3 === 0 ? 0.008 : 0.002)
const opposite60 = base60.map(value => -value)
const same59 = base60.slice(0, 59)

const short = calculateCorrelationMatrix([
  { key: 'A', label: 'A', points: pointsFromReturns(same59) },
  { key: 'B', label: 'B', points: pointsFromReturns(same59) },
])
assert.equal(short.version, '1.2')
assert.equal(short.minimumPairedReturns, 60)
assert.equal(short.maturePairedReturns, 252)
const shortPair = pair(short, 'A', 'B')!
assert.equal(shortPair.pairedReturns, 59)
assert.equal(shortPair.available, false)
assert.equal(shortPair.mature, false)
assert.equal(shortPair.correlation, null)

const perfectSeries: RiskSeries[] = [
  { key: 'A', label: 'A', points: pointsFromReturns(base60) },
  { key: 'B', label: 'B', points: pointsFromReturns(base60) },
  { key: 'C', label: 'C', points: pointsFromReturns(opposite60) },
]
const perfect = calculateCorrelationMatrix(perfectSeries)
const plusOne = pair(perfect, 'A', 'B')!
const minusOne = pair(perfect, 'A', 'C')!
assert.equal(plusOne.pairedReturns, 60)
assert.equal(plusOne.available, true)
assert.equal(plusOne.mature, false)
close(plusOne.correlation, 1)
assert.equal(minusOne.pairedReturns, 60)
assert.equal(minusOne.available, true)
close(minusOne.correlation, -1)

const diagonal = pair(perfect, 'A', 'A')!
assert.equal(diagonal.available, true)
close(diagonal.correlation, 1)

const constantReturns = Array.from({ length: 60 }, () => 0.005)
const zeroVariance = calculateCorrelationMatrix([
  { key: 'A', label: 'A', points: pointsFromReturns(base60) },
  { key: 'CONST', label: 'CONST', points: pointsFromReturns(constantReturns) },
])
const zeroVariancePair = pair(zeroVariance, 'A', 'CONST')!
assert.equal(zeroVariancePair.available, true)
assert.equal(zeroVariancePair.pairedReturns, 60)
assert.equal(zeroVariancePair.correlation, null)

const matureReturns = Array.from({ length: 252 }, (_, index) => index % 5 === 0 ? -0.01 : 0.004)
const mature = calculateCorrelationMatrix([
  { key: 'A', label: 'A', points: pointsFromReturns(matureReturns) },
  { key: 'B', label: 'B', points: pointsFromReturns(matureReturns) },
])
const maturePair = pair(mature, 'A', 'B')!
assert.equal(maturePair.pairedReturns, 252)
assert.equal(maturePair.available, true)
assert.equal(maturePair.mature, true)
close(maturePair.correlation, 1)

// One missing intermediate candle invalidates both adjacent exact intervals.
// Matching only on the ending date would incorrectly retain the wider return
// ending after the gap and count 59 rather than 58 common observations.
const missingDateB = pointsFromReturns(base60).filter((_, index) => index !== 20)
const missingDate = calculateCorrelationMatrix([
  { key: 'A', label: 'A', points: pointsFromReturns(base60) },
  { key: 'B', label: 'B', points: missingDateB },
])
const missingPair = pair(missingDate, 'A', 'B')!
assert.equal(missingPair.pairedReturns, 58)
assert.equal(missingPair.available, false)
assert.equal(missingPair.correlation, null)

// Protect the 60-return availability gate itself: 61 nominal returns with one
// internal missing candle leave only 59 exact shared intervals, not 60.
const base61 = Array.from({ length: 61 }, (_, index) => index % 4 === 0 ? -0.012 : index % 3 === 0 ? 0.008 : 0.002)
const gatedGap = calculateCorrelationMatrix([
  { key: 'A', label: 'A', points: pointsFromReturns(base61) },
  { key: 'B', label: 'B', points: pointsFromReturns(base61).filter((_, index) => index !== 20) },
])
const gatedGapPair = pair(gatedGap, 'A', 'B')!
assert.equal(gatedGapPair.pairedReturns, 59)
assert.equal(gatedGapPair.available, false)
assert.equal(gatedGapPair.correlation, null)

console.log('risk matrix regression: ok')
