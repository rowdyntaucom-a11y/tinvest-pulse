import assert from 'node:assert/strict'
import { calculateTechnicalSnapshot, type OhlcvCandle, type TechnicalSnapshot } from '../src/features/terminal/technicalIndicators.ts'
import {
  evaluateTechnicalAlertRule,
  evaluateTechnicalAlertRules,
  TECHNICAL_ALERT_RULES_VERSION,
  type UserAuthoredTechnicalAlertRule,
} from '../src/features/terminal/technicalAlertRules.ts'

function candle(observation: number, close: number): OhlcvCandle {
  const timestamp = Date.UTC(2026, 0, 1) + ((observation - 1) * 86_400_000)
  const date = new Date(timestamp).toISOString().slice(0, 10)
  return { date, open: close, high: close + 1, low: close - 1, close, volume: 1000 + observation }
}

assert.equal(TECHNICAL_ALERT_RULES_VERSION, '1.0')

const matureInput = Array.from({ length: 40 }, (_, index) => candle(index + 1, 100 + index))
const mature = calculateTechnicalSnapshot(matureInput)
assert.equal(mature.integrity, 'OK')
assert.equal(mature.rsi14, 100)

const triggered = evaluateTechnicalAlertRule(mature, {
  id: 'user-rsi-threshold',
  indicator: 'rsi14',
  comparator: 'GTE',
  threshold: 70,
})
assert.equal(triggered.status, 'TRIGGERED')
assert.equal(triggered.actualValue, 100)
assert.equal(triggered.threshold, 70)
assert.equal(triggered.sampleTo, mature.sampleTo)
assert.equal(triggered.snapshotCalcVersion, mature.calcVersion)

const clear = evaluateTechnicalAlertRule(mature, {
  id: 'user-rsi-low',
  indicator: 'rsi14',
  comparator: 'LT',
  threshold: 70,
})
assert.equal(clear.status, 'CLEAR')
assert.equal(clear.actualValue, 100)

const short = calculateTechnicalSnapshot(Array.from({ length: 10 }, (_, index) => candle(index + 1, 100 + index)))
const unavailable = evaluateTechnicalAlertRule(short, {
  id: 'user-macd-signal',
  indicator: 'macdSignal9',
  comparator: 'GT',
  threshold: 0,
})
assert.equal(unavailable.status, 'DATA_UNAVAILABLE')
assert.equal(unavailable.actualValue, null)

const conflictVariant = {
  ...matureInput[5],
  close: matureInput[5].close + 0.5,
  high: matureInput[5].high + 0.5,
}
const conflict = calculateTechnicalSnapshot([...matureInput, conflictVariant])
assert.equal(conflict.integrity, 'CONFLICT')
const blocked = evaluateTechnicalAlertRule(conflict, {
  id: 'user-conflicted-rsi',
  indicator: 'rsi14',
  comparator: 'GT',
  threshold: 70,
})
assert.equal(blocked.status, 'INTEGRITY_BLOCKED')
assert.equal(blocked.actualValue, null)

const invalidThreshold = evaluateTechnicalAlertRule(mature, {
  id: 'user-invalid-threshold',
  indicator: 'rsi14',
  comparator: 'GT',
  threshold: Number.NaN,
})
assert.equal(invalidThreshold.status, 'INVALID_RULE')
assert.equal(invalidThreshold.threshold, null)

const invalidIndicator = evaluateTechnicalAlertRule(mature, {
  id: 'user-unknown-field',
  indicator: 'priceTarget',
  comparator: 'GT',
  threshold: 1,
} as unknown as UserAuthoredTechnicalAlertRule)
assert.equal(invalidIndicator.status, 'INVALID_RULE')
assert.equal(invalidIndicator.indicator, 'priceTarget')

const malformedSnapshot = {
  ...mature,
  rsi14: Number.POSITIVE_INFINITY,
} as TechnicalSnapshot
const malformed = evaluateTechnicalAlertRule(malformedSnapshot, {
  id: 'user-malformed-snapshot',
  indicator: 'rsi14',
  comparator: 'GT',
  threshold: 70,
})
assert.equal(malformed.status, 'INVALID_SNAPSHOT')
assert.equal(malformed.actualValue, null)

const rules: UserAuthoredTechnicalAlertRule[] = [
  { id: 'first', indicator: 'stochasticK14', comparator: 'GTE', threshold: 50 },
  { id: 'second', indicator: 'macdHistogram', comparator: 'LTE', threshold: 0 },
]
const batch = evaluateTechnicalAlertRules(mature, rules)
assert.deepEqual(batch.map(item => item.ruleId), ['first', 'second'])
assert.equal(batch.length, 2)

console.log('technical alert rules regression: ok')
