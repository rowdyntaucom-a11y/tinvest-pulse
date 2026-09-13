import assert from 'node:assert/strict'
import type { TechnicalSnapshot } from '../src/features/terminal/technicalIndicators.ts'
import {
  USER_SCREENER_VERSION,
  evaluateUserScreener,
  type UserScreener,
} from '../src/features/terminal/userAlertRules.ts'

assert.equal(USER_SCREENER_VERSION, '0.1')

function snapshot(overrides: Partial<TechnicalSnapshot> = {}): TechnicalSnapshot {
  return {
    calcVersion: '1.4',
    integrity: 'OK',
    inputRows: 40,
    invalidRowsDiscarded: 0,
    observations: 40,
    sampleFrom: '2026-07-01',
    sampleTo: '2026-09-13',
    duplicateRowsCollapsed: 0,
    conflictingDates: 0,
    sma20: 100,
    ema20: 101,
    rsi14: 60,
    atr14: 2,
    macd12_26: 1,
    macdSignal9: 0.5,
    macdHistogram: 0.5,
    bollingerMiddle20: 100,
    bollingerUpper20: 110,
    bollingerLower20: 90,
    stochasticK14: 70,
    stochasticD3: 65,
    ...overrides,
  }
}

const current = snapshot()
const previous = snapshot({ sampleTo: '2026-09-12', rsi14: 49, macdHistogram: -0.1 })

const allMatch: UserScreener = {
  id: 'quality-filter',
  mode: 'ALL',
  rules: [
    { id: 'rsi', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 },
    { id: 'hist', metric: 'macdHistogram', comparator: 'ABOVE', threshold: 0 },
  ],
}

let result = evaluateUserScreener(allMatch, current, previous)
assert.equal(result.status, 'MATCH')
assert.equal(result.matched, true)
assert.equal(result.matchedRules, 2)
assert.equal(result.evaluatedRules, 2)
assert.equal(Object.prototype.hasOwnProperty.call(result, 'action'), false)
assert.equal(Object.prototype.hasOwnProperty.call(result, 'recommendation'), false)

result = evaluateUserScreener({
  ...allMatch,
  rules: [
    { id: 'false', metric: 'rsi14', comparator: 'BELOW', threshold: 50 },
    { id: 'missing', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, snapshot({ stochasticD3: null }), previous)
assert.equal(result.status, 'NO_MATCH')

result = evaluateUserScreener({
  ...allMatch,
  rules: [
    { id: 'true', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 },
    { id: 'missing', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, snapshot({ stochasticD3: null }), previous)
assert.equal(result.status, 'INSUFFICIENT_DATA')

result = evaluateUserScreener({
  id: 'any-filter',
  mode: 'ANY',
  rules: [
    { id: 'true', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 },
    { id: 'missing', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, snapshot({ stochasticD3: null }), previous)
assert.equal(result.status, 'MATCH')

result = evaluateUserScreener({
  id: 'any-missing',
  mode: 'ANY',
  rules: [
    { id: 'false', metric: 'rsi14', comparator: 'BELOW', threshold: 50 },
    { id: 'missing', metric: 'stochasticD3', comparator: 'ABOVE', threshold: 50 },
  ],
}, snapshot({ stochasticD3: null }), previous)
assert.equal(result.status, 'INSUFFICIENT_DATA')

result = evaluateUserScreener({
  id: 'crossing',
  mode: 'ALL',
  rules: [{ id: 'cross', metric: 'rsi14', comparator: 'CROSSES_ABOVE', threshold: 50 }],
}, current, previous)
assert.equal(result.status, 'MATCH')

result = evaluateUserScreener({
  id: 'crossing-bad-order',
  mode: 'ALL',
  rules: [{ id: 'cross', metric: 'rsi14', comparator: 'CROSSES_ABOVE', threshold: 50 }],
}, current, snapshot({ sampleTo: '2026-09-13', rsi14: 49 }))
assert.equal(result.status, 'INSUFFICIENT_DATA')

result = evaluateUserScreener({
  id: 'duplicate',
  mode: 'ALL',
  rules: [
    { id: 'same', metric: 'rsi14', comparator: 'ABOVE', threshold: 50 },
    { id: 'same', metric: 'ema20', comparator: 'ABOVE', threshold: 100 },
  ],
}, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')
assert.deepEqual(result.rules, [])

result = evaluateUserScreener({ id: 'empty', mode: 'ALL', rules: [] }, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')

result = evaluateUserScreener({
  id: 'too-many',
  mode: 'ALL',
  rules: Array.from({ length: 9 }, (_, index) => ({
    id: `rule-${index}`,
    metric: 'rsi14' as const,
    comparator: 'ABOVE' as const,
    threshold: index,
  })),
}, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')

result = evaluateUserScreener({ id: 'bad-mode', mode: 'OR' as 'ALL', rules: allMatch.rules }, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')

// Screener inherits metric-domain validation from current alert rules.
result = evaluateUserScreener({
  id: 'invalid-domain',
  mode: 'ALL',
  rules: [{ id: 'bad-rsi', metric: 'rsi14', comparator: 'ABOVE', threshold: 120 }],
}, current, previous)
assert.equal(result.status, 'INVALID_CONFIG')

result = evaluateUserScreener(allMatch, snapshot({ rsi14: 120 }), previous)
assert.equal(result.status, 'INSUFFICIENT_DATA')

console.log('user screener regression: ok')
