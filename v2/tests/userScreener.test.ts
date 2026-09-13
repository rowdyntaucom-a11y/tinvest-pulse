import assert from 'node:assert/strict'
import { calculateTechnicalSnapshot, type OhlcvCandle } from '../src/features/terminal/technicalIndicators.ts'
import {
  MAX_USER_SCREENER_RULES,
  USER_SCREENER_VERSION,
  evaluateUserScreener,
  type UserScreenerConfig,
} from '../src/features/terminal/userScreener.ts'

function candle(observation: number, close: number): OhlcvCandle {
  const timestamp = Date.UTC(2026, 0, 1) + ((observation - 1) * 86_400_000)
  const date = new Date(timestamp).toISOString().slice(0, 10)
  return { date, open: close, high: close + 1, low: close - 1, close, volume: 1000 + observation }
}

const previous = calculateTechnicalSnapshot(Array.from({ length: 39 }, (_, i) => candle(i + 1, 100 + i)))
const current = calculateTechnicalSnapshot(Array.from({ length: 40 }, (_, i) => candle(i + 1, 100 + i)))

assert.equal(USER_SCREENER_VERSION, '1.0')
assert.equal(MAX_USER_SCREENER_RULES, 8)

const all: UserScreenerConfig = {
  id: 'all-demo',
  mode: 'ALL',
  rules: [
    { id: 'rsi', metric: 'rsi14', comparator: 'ABOVE', threshold: 70 },
    { id: 'macd', metric: 'macdHistogram', comparator: 'ABOVE', threshold: 0 },
  ],
}

let result = evaluateUserScreener(all, current, previous)
assert.equal(result.status, 'MATCH')
assert.equal(result.matched, true)
assert.equal(result.evaluatedRules, 2)
assert.equal(result.matchedRules, 2)
assert.deepEqual(result.matchedRuleIds, ['rsi', 'macd'])
assert.equal(Object.prototype.hasOwnProperty.call(result, 'action'), false)
assert.equal(Object.prototype.hasOwnProperty.call(result, 'recommendation'), false)

result = evaluateUserScreener({
  ...all,
  rules: [
    { id: 'false', metric: 'rsi14', comparator: 'BELOW', threshold: 30 },
    { id: 'missing', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, calculateTechnicalSnapshot(Array.from({ length: 15 }, (_, i) => candle(i + 1, 100 + i))))
assert.equal(result.status, 'NO_MATCH')

result = evaluateUserScreener({
  id: 'any-demo',
  mode: 'ANY',
  rules: [
    { id: 'true', metric: 'rsi14', comparator: 'ABOVE', threshold: 70 },
    { id: 'missing', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, current, previous)
assert.equal(result.status, 'MATCH')
assert.equal(result.matchedRules, 1)
assert.deepEqual(result.matchedRuleIds, ['true'])

const short = calculateTechnicalSnapshot(Array.from({ length: 5 }, (_, i) => candle(i + 1, 100 + i)))
result = evaluateUserScreener({
  id: 'all-missing',
  mode: 'ALL',
  rules: [
    { id: 'rsi', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 },
    { id: 'stoch', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, short)
assert.equal(result.status, 'INSUFFICIENT_DATA')
assert.equal(result.matched, false)

result = evaluateUserScreener({
  id: 'duplicate',
  mode: 'ALL',
  rules: [
    { id: 'same', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 },
    { id: 'same', metric: 'macdHistogram', comparator: 'ABOVE', threshold: 0 },
  ],
}, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')
assert.equal(result.evaluatedRules, 0)

result = evaluateUserScreener({ id: 'empty', mode: 'ALL', rules: [] }, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')

result = evaluateUserScreener({
  id: 'too-many',
  mode: 'ANY',
  rules: Array.from({ length: MAX_USER_SCREENER_RULES + 1 }, (_, index) => ({
    id: `rule-${index}`,
    metric: 'rsi14' as const,
    comparator: 'ABOVE' as const,
    threshold: 50,
  })),
}, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')

result = evaluateUserScreener({
  id: 'invalid-threshold',
  mode: 'ALL',
  rules: [{ id: 'bad-rsi', metric: 'rsi14', comparator: 'ABOVE', threshold: 150 }],
}, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')
assert.equal(result.rules.length, 0)

const staleCurrent = { ...current, calcVersion: '1.3' as never }
result = evaluateUserScreener({
  id: 'stale',
  mode: 'ANY',
  rules: [{ id: 'rsi', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 }],
}, staleCurrent, previous)
assert.equal(result.status, 'INSUFFICIENT_DATA')

result = evaluateUserScreener({
  id: 'cross',
  mode: 'ALL',
  rules: [{ id: 'sma-cross', metric: 'sma20', comparator: 'CROSSES_ABOVE', threshold: 129 }],
}, current, current)
assert.equal(result.status, 'INSUFFICIENT_DATA')

console.log('user-authored screener regression: ok')
