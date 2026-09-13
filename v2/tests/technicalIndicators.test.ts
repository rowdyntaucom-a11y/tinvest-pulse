import assert from 'node:assert/strict'
import { calculateTechnicalSnapshot, TECHNICAL_INDICATORS_VERSION, type OhlcvCandle } from '../src/features/terminal/technicalIndicators.ts'

function candle(day: number, close: number): OhlcvCandle {
  const date = `2026-01-${String(day).padStart(2, '0')}`
  return { date, open: close, high: close + 1, low: close - 1, close, volume: 1000 + day }
}

assert.equal(TECHNICAL_INDICATORS_VERSION, '1.1')

const short = calculateTechnicalSnapshot(Array.from({ length: 10 }, (_, i) => candle(i + 1, 100 + i)))
assert.equal(short.calcVersion, TECHNICAL_INDICATORS_VERSION)
assert.equal(short.integrity, 'OK')
assert.equal(short.observations, 10)
assert.equal(short.sma20, null)
assert.equal(short.ema20, null)
assert.equal(short.rsi14, null)
assert.equal(short.atr14, null)

const matureInput = Array.from({ length: 25 }, (_, i) => candle(i + 1, 100 + i))
const mature = calculateTechnicalSnapshot(matureInput)
assert.equal(mature.integrity, 'OK')
assert.equal(mature.observations, 25)
assert.equal(mature.sampleFrom, '2026-01-01')
assert.equal(mature.sampleTo, '2026-01-25')
assert.ok(mature.sma20 != null)
assert.ok(mature.ema20 != null)
assert.equal(mature.rsi14, 100)
assert.ok(mature.atr14 != null && mature.atr14 > 0)

const exactDuplicate = calculateTechnicalSnapshot([...matureInput, { ...matureInput[5] }])
assert.equal(exactDuplicate.integrity, 'OK')
assert.equal(exactDuplicate.observations, 25)
assert.equal(exactDuplicate.duplicateRowsCollapsed, 1)
assert.equal(exactDuplicate.conflictingDates, 0)

const conflictVariant = {
  ...matureInput[5],
  close: matureInput[5].close + 0.5,
  high: matureInput[5].high + 0.5,
}
const conflict = calculateTechnicalSnapshot([
  ...matureInput,
  conflictVariant,
])
assert.equal(conflict.integrity, 'CONFLICT')
assert.equal(conflict.observations, 0)
assert.equal(conflict.conflictingDates, 1)
assert.equal(conflict.sma20, null)
assert.equal(conflict.ema20, null)
assert.equal(conflict.rsi14, null)
assert.equal(conflict.atr14, null)

// Conflict provenance must describe unique dates and exact redundant rows,
// independent of which valid candle variant happens to appear first.
const withoutConflictDay = matureInput.filter((_, index) => index !== 5)
const original = matureInput[5]
const originalFirst = calculateTechnicalSnapshot([
  ...withoutConflictDay,
  original,
  { ...original },
  conflictVariant,
])
const variantFirst = calculateTechnicalSnapshot([
  ...withoutConflictDay,
  conflictVariant,
  { ...conflictVariant },
  original,
])
for (const result of [originalFirst, variantFirst]) {
  assert.equal(result.integrity, 'CONFLICT')
  assert.equal(result.observations, 0)
  assert.equal(result.conflictingDates, 1)
  assert.equal(result.duplicateRowsCollapsed, 1)
}

const invalidGeometry = calculateTechnicalSnapshot([
  { date: '2026-01-01', open: 100, high: 99, low: 98, close: 100, volume: 1 },
  { date: 'bad-date', open: 100, high: 101, low: 99, close: 100, volume: 1 },
])
assert.equal(invalidGeometry.integrity, 'OK')
assert.equal(invalidGeometry.observations, 0)

const flat = calculateTechnicalSnapshot(Array.from({ length: 20 }, (_, i) => candle(i + 1, 100)))
assert.equal(flat.rsi14, 50)

console.log('technical indicators regression: ok')
