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

assert.equal(USER_ALERT_RULES_VERSION, '1.4')

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

// A crossing is a temporal event, so two values from the same observation date
// must never be interpreted as a crossing even if their numeric values straddle
// the threshold.
const sameDatePrevious = { ...rising40, sma20: 128.5 }
const sameDateResult = evaluateUserAlertRule(crossAbove, rising40, sameDatePrevious)
assert.equal(sameDateResult.status, 'INSUFFICIENT_DATA')
assert.equal(sameDateResult.matched, false)

// Reversed snapshots could otherwise manufacture a false crossing direction.
const crossBelow: UserAlertRule = { id: 'sma-cross-down', metric: 'sma20', comparator: 'CROSSES_BELOW', threshold: 129 }
const reversedResult = evaluateUserAlertRule(crossBelow, rising39, rising40)
assert.equal(reversedResult.status, 'INSUFFICIENT_DATA')
assert.equal(reversedResult.matched, false)

// Alert evaluation accepts only the current technical calculation version, even
// for a simple threshold rule. A stale snapshot can remain displayable elsewhere
// but must not drive a current user-authored alert.
const staleCurrent = { ...rising40, calcVersion: '1.3' as never }
const staleCurrentResult = evaluateUserAlertRule(above, staleCurrent)
assert.equal(staleCurrentResult.status, 'INSUFFICIENT_DATA')
assert.equal(staleCurrentResult.matched, false)

// Crossing values produced by different calculation versions are not directly
// comparable and must fail closed.
const mismatchedVersion = { ...rising39, calcVersion: '1.3' as never }
const mismatchedVersionResult = evaluateUserAlertRule(crossAbove, rising40, mismatchedVersion)
assert.equal(mismatchedVersionResult.status, 'INSUFFICIENT_DATA')
assert.equal(mismatchedVersionResult.matched, false)

const invalidPreviousDate = { ...rising39, sampleTo: 'bad-date' }
const invalidDateResult = evaluateUserAlertRule(crossAbove, rising40, invalidPreviousDate)
assert.equal(invalidDateResult.status, 'INSUFFICIENT_DATA')
assert.equal(invalidDateResult.matched, false)

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

// Technical diagnostics deliberately retain calculations when malformed source rows
// were discarded, but alert execution is stricter: a dirty sample must not trigger.
const dirtyCurrent = calculateTechnicalSnapshot([
  ...matureInput,
  { date: '2026-04-30', open: 0, high: 1, low: 0.5, close: 0.8, volume: 1 },
])
assert.equal(dirtyCurrent.integrity, 'OK')
assert.equal(dirtyCurrent.invalidRowsDiscarded, 1)
assert.ok(dirtyCurrent.rsi14 != null)
const dirtyCurrentResult = evaluateUserAlertRule(above, dirtyCurrent)
assert.equal(dirtyCurrentResult.status, 'INSUFFICIENT_DATA')
assert.equal(dirtyCurrentResult.matched, false)
assert.equal(dirtyCurrentResult.currentValue, null)

// Exact duplicate source rows are deterministic rather than dirty. Their collapse
// count reconciles raw input to observations, so they may still drive an alert.
const duplicateCurrent = calculateTechnicalSnapshot([...matureInput, { ...matureInput[5] }])
assert.equal(duplicateCurrent.invalidRowsDiscarded, 0)
assert.equal(duplicateCurrent.duplicateRowsCollapsed, 1)
assert.equal(evaluateUserAlertRule(above, duplicateCurrent).status, 'MATCH')

// A dirty previous snapshot blocks crossing evaluation even when the current sample
// is clean and both numeric values would otherwise satisfy the crossing rule.
const dirtyPrevious = { ...rising39, invalidRowsDiscarded: 1, inputRows: rising39.inputRows + 1 }
const dirtyPreviousResult = evaluateUserAlertRule(crossAbove, rising40, dirtyPrevious)
assert.equal(dirtyPreviousResult.status, 'INSUFFICIENT_DATA')
assert.equal(dirtyPreviousResult.matched, false)

// Raw-row provenance must reconcile. Forged counts cannot be treated as clean data.
const inconsistentProvenance = { ...rising40, inputRows: rising40.inputRows + 1 }
const inconsistentProvenanceResult = evaluateUserAlertRule(above, inconsistentProvenance)
assert.equal(inconsistentProvenanceResult.status, 'INSUFFICIENT_DATA')
assert.equal(inconsistentProvenanceResult.matched, false)

const invalidThreshold = evaluateUserAlertRule({ ...above, threshold: Number.NaN }, rising40)
assert.equal(invalidThreshold.status, 'INVALID_RULE')
assert.equal(invalidThreshold.threshold, null)

// Threshold domains must respect the mathematical range/semantics of each metric.
assert.equal(evaluateUserAlertRule({ ...above, threshold: 100 }, rising40).status, 'NO_MATCH')
assert.equal(evaluateUserAlertRule({ ...above, threshold: 150 }, rising40).status, 'INVALID_RULE')
assert.equal(evaluateUserAlertRule({ id: 'stoch-negative', metric: 'stochasticK14', comparator: 'ABOVE', threshold: -0.1 }, rising40).status, 'INVALID_RULE')
assert.equal(evaluateUserAlertRule({ id: 'atr-negative', metric: 'atr14', comparator: 'BELOW', threshold: -1 }, rising40).status, 'INVALID_RULE')
assert.equal(evaluateUserAlertRule({ id: 'sma-zero', metric: 'sma20', comparator: 'ABOVE', threshold: 0 }, rising40).status, 'INVALID_RULE')
assert.equal(evaluateUserAlertRule({ id: 'ema-negative', metric: 'ema20', comparator: 'BELOW', threshold: -1 }, rising40).status, 'INVALID_RULE')
assert.equal(evaluateUserAlertRule({ id: 'boll-zero', metric: 'bollingerUpper20', comparator: 'ABOVE', threshold: 0 }, rising40).status, 'INVALID_RULE')

// A Bollinger lower band is not itself a price: mean - 2σ can legitimately be
// zero or negative even though every source close is positive.
const lowerZeroThreshold = evaluateUserAlertRule({ id: 'boll-lower-zero', metric: 'bollingerLower20', comparator: 'BELOW', threshold: 0 }, rising40)
assert.notEqual(lowerZeroThreshold.status, 'INVALID_RULE')
const lowerNegativeThreshold = evaluateUserAlertRule({ id: 'boll-lower-negative', metric: 'bollingerLower20', comparator: 'BELOW', threshold: -100 }, rising40)
assert.notEqual(lowerNegativeThreshold.status, 'INVALID_RULE')

// MACD values are signed differences, so negative and zero thresholds remain valid.
const macdNegative = evaluateUserAlertRule({ id: 'macd-negative', metric: 'macdHistogram', comparator: 'ABOVE', threshold: -100 }, rising40)
assert.notEqual(macdNegative.status, 'INVALID_RULE')
const macdZero = evaluateUserAlertRule({ id: 'macd-zero', metric: 'macd12_26', comparator: 'ABOVE', threshold: 0 }, rising40)
assert.notEqual(macdZero.status, 'INVALID_RULE')

// Runtime snapshots are validated at the alert boundary too. A forged or stale
// OK snapshot must not make mathematically impossible values look actionable.
const impossibleRsi = evaluateUserAlertRule(above, { ...rising40, rsi14: 150 })
assert.equal(impossibleRsi.status, 'INSUFFICIENT_DATA')
assert.equal(impossibleRsi.currentValue, null)
const impossibleAtr = evaluateUserAlertRule({ id: 'atr-check', metric: 'atr14', comparator: 'ABOVE', threshold: 1 }, { ...rising40, atr14: -1 })
assert.equal(impossibleAtr.status, 'INSUFFICIENT_DATA')
assert.equal(impossibleAtr.currentValue, null)
const impossibleSma = evaluateUserAlertRule({ id: 'sma-check', metric: 'sma20', comparator: 'ABOVE', threshold: 1 }, { ...rising40, sma20: 0 })
assert.equal(impossibleSma.status, 'INSUFFICIENT_DATA')
assert.equal(impossibleSma.currentValue, null)

// Signed lower-band values remain valid at runtime as well.
const signedLowerSnapshot = { ...rising40, bollingerLower20: -5 }
const signedLowerResult = evaluateUserAlertRule({ id: 'lower-signed', metric: 'bollingerLower20', comparator: 'BELOW', threshold: 0 }, signedLowerSnapshot)
assert.equal(signedLowerResult.status, 'MATCH')
assert.equal(signedLowerResult.currentValue, -5)

const invalidComparator = evaluateUserAlertRule({ ...above, comparator: 'BUY' as never }, rising40)
assert.equal(invalidComparator.status, 'INVALID_RULE')

const invalidMetric = evaluateUserAlertRule({ ...above, metric: 'priceTarget' as never }, rising40)
assert.equal(invalidMetric.status, 'INVALID_RULE')

console.log('user-authored alert rules regression: ok')
