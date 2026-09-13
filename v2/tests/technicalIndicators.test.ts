import assert from 'node:assert/strict'
import { calculateTechnicalSnapshot, TECHNICAL_INDICATORS_VERSION, type OhlcvCandle } from '../src/features/terminal/technicalIndicators.ts'

function candle(observation: number, close: number): OhlcvCandle {
  const timestamp = Date.UTC(2026, 0, 1) + ((observation - 1) * 86_400_000)
  const date = new Date(timestamp).toISOString().slice(0, 10)
  return { date, open: close, high: close + 1, low: close - 1, close, volume: 1000 + observation }
}

assert.equal(TECHNICAL_INDICATORS_VERSION, '1.3')

const short = calculateTechnicalSnapshot(Array.from({ length: 10 }, (_, i) => candle(i + 1, 100 + i)))
assert.equal(short.calcVersion, TECHNICAL_INDICATORS_VERSION)
assert.equal(short.integrity, 'OK')
assert.equal(short.observations, 10)
assert.equal(short.sma20, null)
assert.equal(short.ema20, null)
assert.equal(short.rsi14, null)
assert.equal(short.atr14, null)
assert.equal(short.macd12_26, null)
assert.equal(short.macdSignal9, null)
assert.equal(short.macdHistogram, null)
assert.equal(short.bollingerMiddle20, null)
assert.equal(short.bollingerUpper20, null)
assert.equal(short.bollingerLower20, null)
assert.equal(short.stochasticK14, null)
assert.equal(short.stochasticD3, null)

const matureInput = Array.from({ length: 40 }, (_, i) => candle(i + 1, 100 + i))
const mature = calculateTechnicalSnapshot(matureInput)
assert.equal(mature.integrity, 'OK')
assert.equal(mature.observations, 40)
assert.equal(mature.sampleFrom, '2026-01-01')
assert.equal(mature.sampleTo, matureInput.at(-1)!.date)
assert.ok(mature.sma20 != null)
assert.ok(mature.ema20 != null)
assert.equal(mature.rsi14, 100)
assert.ok(mature.atr14 != null && mature.atr14 > 0)
assert.ok(mature.macd12_26 != null && mature.macd12_26 > 0)
assert.ok(mature.macdSignal9 != null && mature.macdSignal9 > 0)
assert.ok(mature.macdHistogram != null)
assert.equal(mature.bollingerMiddle20, mature.sma20)
assert.ok(mature.bollingerUpper20 != null && mature.bollingerMiddle20 != null && mature.bollingerUpper20 > mature.bollingerMiddle20)
assert.ok(mature.bollingerLower20 != null && mature.bollingerMiddle20 != null && mature.bollingerLower20 < mature.bollingerMiddle20)
assert.ok(mature.stochasticK14 != null && mature.stochasticK14 > 0 && mature.stochasticK14 < 100)
assert.ok(mature.stochasticD3 != null && mature.stochasticD3 > 0 && mature.stochasticD3 < 100)

const stochastic13 = calculateTechnicalSnapshot(Array.from({ length: 13 }, (_, i) => candle(i + 1, 100 + i)))
assert.equal(stochastic13.stochasticK14, null)
assert.equal(stochastic13.stochasticD3, null)
const stochastic14 = calculateTechnicalSnapshot(Array.from({ length: 14 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(stochastic14.stochasticK14 != null)
assert.equal(stochastic14.stochasticD3, null)
const stochastic15 = calculateTechnicalSnapshot(Array.from({ length: 15 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(stochastic15.stochasticK14 != null)
assert.equal(stochastic15.stochasticD3, null)
const stochastic16 = calculateTechnicalSnapshot(Array.from({ length: 16 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(stochastic16.stochasticK14 != null)
assert.ok(stochastic16.stochasticD3 != null)
assert.ok(Math.abs(stochastic16.stochasticK14 - stochastic16.stochasticD3) <= 1e-12)

const bollinger19 = calculateTechnicalSnapshot(Array.from({ length: 19 }, (_, i) => candle(i + 1, 100 + i)))
assert.equal(bollinger19.bollingerMiddle20, null)
assert.equal(bollinger19.bollingerUpper20, null)
assert.equal(bollinger19.bollingerLower20, null)
const bollinger20 = calculateTechnicalSnapshot(Array.from({ length: 20 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(bollinger20.bollingerMiddle20 != null)
assert.ok(bollinger20.bollingerUpper20 != null)
assert.ok(bollinger20.bollingerLower20 != null)

const macd25 = calculateTechnicalSnapshot(Array.from({ length: 25 }, (_, i) => candle(i + 1, 100 + i)))
assert.equal(macd25.macd12_26, null)
assert.equal(macd25.macdSignal9, null)
assert.equal(macd25.macdHistogram, null)
const macd26 = calculateTechnicalSnapshot(Array.from({ length: 26 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(macd26.macd12_26 != null)
assert.equal(macd26.macdSignal9, null)
assert.equal(macd26.macdHistogram, null)
const macd33 = calculateTechnicalSnapshot(Array.from({ length: 33 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(macd33.macd12_26 != null)
assert.equal(macd33.macdSignal9, null)
assert.equal(macd33.macdHistogram, null)
const macd34 = calculateTechnicalSnapshot(Array.from({ length: 34 }, (_, i) => candle(i + 1, 100 + i)))
assert.ok(macd34.macd12_26 != null)
assert.ok(macd34.macdSignal9 != null)
assert.ok(macd34.macdHistogram != null)

const exactDuplicate = calculateTechnicalSnapshot([...matureInput, { ...matureInput[5] }])
assert.equal(exactDuplicate.integrity, 'OK')
assert.equal(exactDuplicate.observations, 40)
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
assert.equal(conflict.macd12_26, null)
assert.equal(conflict.macdSignal9, null)
assert.equal(conflict.macdHistogram, null)
assert.equal(conflict.bollingerMiddle20, null)
assert.equal(conflict.bollingerUpper20, null)
assert.equal(conflict.bollingerLower20, null)
assert.equal(conflict.stochasticK14, null)
assert.equal(conflict.stochasticD3, null)

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

const flat = calculateTechnicalSnapshot(Array.from({ length: 40 }, (_, i) => candle(i + 1, 100)))
assert.equal(flat.rsi14, 50)
assert.equal(flat.macd12_26, 0)
assert.equal(flat.macdSignal9, 0)
assert.equal(flat.macdHistogram, 0)
assert.equal(flat.bollingerMiddle20, 100)
assert.equal(flat.bollingerUpper20, 100)
assert.equal(flat.bollingerLower20, 100)
assert.equal(flat.stochasticK14, 50)
assert.equal(flat.stochasticD3, 50)

const zeroRange = calculateTechnicalSnapshot(Array.from({ length: 20 }, (_, i) => {
  const timestamp = Date.UTC(2026, 2, 1) + (i * 86_400_000)
  const date = new Date(timestamp).toISOString().slice(0, 10)
  return { date, open: 100, high: 100, low: 100, close: 100, volume: 1 }
}))
assert.equal(zeroRange.stochasticK14, null)
assert.equal(zeroRange.stochasticD3, null)

console.log('technical indicators regression: ok')
