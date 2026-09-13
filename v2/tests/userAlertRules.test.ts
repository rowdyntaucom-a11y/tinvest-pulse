import assert from 'node:assert/strict'
import { calculateTechnicalSnapshot, type OhlcvCandle } from '../src/features/terminal/technicalIndicators.ts'
import { evaluateUserAlertRule, USER_ALERT_RULES_VERSION, type UserAlertRule } from '../src/features/terminal/userAlertRules.ts'

function candle(observation: number, close: number): OhlcvCandle {
  const timestamp = Date.UTC(2026, 0, 1) + ((observation - 1) * 86_400_000)
  const date = new Date(timestamp).toISOString().slice(0, 10)
  return { date, open: close, high: close + 1, low: close - 1, close, volume: 1000 + observation }
}

const rising39 = calculateTechnicalSnapshot(Array.from({ length: 39 }, (_, i) => candle(i + 1, 100 + i)))
const rising40 = calculateTechnicalSnapshot(Array.from({ length: 40 }, (_, i) => candle(i + 1, 100 + i)))

assert.equal(USER_ALERT_RULES_VERSION, '1.0')

const above: UserAlertRule = { id: 'rsi-high', metric: 'rsi14', comparator: 'ABOVE', threshold: 70 }
const aboveResult = evaluateUserAlertRule(above, rising40)
assert.equal(aboveResult.status, 'MATCH')
assert.equal(aboveResult.matched, true)
assert.equal(aboveResult.currentValue, 100)

const below: UserAlertRule = { id: 'rsi-low', metric: 'rsi14', comparator: 'BELOW', threshold: 30 }
assert.equal(evaluateUserAlertRule(below, rising40).status, 'NO_MATCH')

const crossAbove: UserAlertRule = { id: 'sma-cross', metric: 'sma20', comparator: 'CROSSES_ABOVE', threshold: 129 }
const crossAboveResult = evaluateUserAlertRule(crossAbove, rising40, rising39)
assert.equal(crossAboveResult.status, 'MATCH')
assert.ok(crossAboveResult.previousValue != null && crossAboveResult.previousValue <= 129)
assert.ok(crossAboveResult.currentValue != null && crossAboveResult.currentValue > 129)

const missingPrevious = evaluateUserAlertRule(crossAbove, rising40)
assert.equal(missingPrevious.status, 'INSUFFICIENT_DATA')
assert.equal(missingPrevious.matched, false)

const short = calculateTechnicalSnapshot(Array.from({ length: 5 }, (_, i) => candle(i + 1, 100 + i)))
const unavailableMetric = evaluateUserAlertRule(above, short)
assert.equal(unavailableMetric.status, 'INSUFFICIENT_DATA')
assert.equal(unavailableMetric.currentValue, null)

const matureInput = Array.from({ length: 40 }, (_, i) => candle(i + 1, 100 + i))
const conflictVariant = { ...matureInput[5], close: matureInput[5].close + 0.5, high: matureInput[5].high + 0.5 }
const conflict = calculateTechnicalSnapshot([...matureInput, conflictVariant])
const conflictResult = evaluateUserAlertRule(above, conflict)
assert.equal(conflict.integrity, 'CONFLICT')
assert.equal(conflictResult.status, 'INSUFFICIENT_DATA')
assert.equal(conflictResult.matched, false)

const invalidThreshold = evaluateUserAlertRule({ ...above, threshold: Number.NaN }, rising40)
assert.equal(invalidThreshold.status, 'INVALID_RULE')
assert.equal(invalidThreshold.threshold, null)

const invalidComparator = evaluateUserAlertRule({ ...above, comparator: 'BUY' as never }, rising40)
assert.equal(invalidComparator.status, 'INVALID_RULE')

const invalidMetric = evaluateUserAlertRule({ ...above, metric: 'priceTarget' as never }, rising40)
assert.equal(invalidMetric.status, 'INVALID_RULE')

console.log('user-authored alert rules regression: ok')
