import assert from 'node:assert/strict'
import { calculateTechnicalSnapshot, type OhlcvCandle } from '../src/features/terminal/technicalIndicators.ts'
import { evaluateUserAlertRule, evaluateUserScreener } from '../src/features/terminal/userAlertRules.ts'

function candle(observation: number, close: number): OhlcvCandle {
  const timestamp = Date.UTC(2026, 0, 1) + ((observation - 1) * 86_400_000)
  const date = new Date(timestamp).toISOString().slice(0, 10)
  return { date, open: close, high: close + 1, low: close - 1, close, volume: 1000 + observation }
}

const current = calculateTechnicalSnapshot(Array.from({ length: 40 }, (_, i) => candle(i + 1, 100 + i)))

const malformedRules: unknown[] = [
  null,
  undefined,
  'rsi14 > 70',
  42,
  [],
  {},
  { id: 'missing-threshold', metric: 'rsi14', comparator: 'ABOVE' },
  { id: 'bad-metric', metric: 'priceTarget', comparator: 'ABOVE', threshold: 1 },
]

for (const malformed of malformedRules) {
  const result = evaluateUserAlertRule(malformed as never, current)
  assert.equal(result.status, 'INVALID_RULE')
  assert.equal(result.matched, false)
  assert.equal(result.currentValue, null)
  assert.equal(result.previousValue, null)
}

const malformedScreeners: unknown[] = [
  null,
  undefined,
  'rsi screen',
  42,
  [],
  {},
  { id: 'missing-mode', rules: [] },
  { id: 'bad-rules', mode: 'ANY', rules: null },
  { id: 'bad-child', mode: 'ALL', rules: [null] },
  { id: 'primitive-child', mode: 'ALL', rules: ['rsi14'] },
]

for (const malformed of malformedScreeners) {
  const result = evaluateUserScreener(malformed as never, current)
  assert.equal(result.status, 'INVALID_CONFIG')
  assert.equal(result.matched, false)
  assert.equal(result.evaluatedRules, 0)
  assert.equal(result.matchedRules, 0)
  assert.deepEqual(result.matchedRuleIds, [])
  assert.deepEqual(result.rules, [])
}

// Invalid objects can preserve harmless provenance for diagnostics without
// attempting evaluation.
const finiteThreshold = evaluateUserAlertRule({
  id: 'bad-comparator',
  metric: 'rsi14',
  comparator: 'BUY',
  threshold: 70,
} as never, current)
assert.equal(finiteThreshold.status, 'INVALID_RULE')
assert.equal(finiteThreshold.ruleId, 'bad-comparator')
assert.equal(finiteThreshold.threshold, 70)

const knownMode = evaluateUserScreener({ id: 'bad-child', mode: 'ANY', rules: [null] } as never, current)
assert.equal(knownMode.status, 'INVALID_CONFIG')
assert.equal(knownMode.screenerId, 'bad-child')
assert.equal(knownMode.mode, 'ANY')

console.log('user alert malformed-input regression: ok')
