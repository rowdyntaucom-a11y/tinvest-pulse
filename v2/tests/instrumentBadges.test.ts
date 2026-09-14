import assert from 'node:assert/strict'
import { findInstrumentBadge, instrumentFallbackLabel, instrumentLogoUrl, normalizeInstrumentBadgePayload } from '../src/features/portfolio/instrumentBadges.ts'
import type { PositionSnapshot } from '../src/lib/portfolioApi.ts'

const payload = normalizeInstrumentBadgePayload({
  logoCdn: 'https://attacker.invalid/',
  items: [{ figi: 'BBG000', instrumentUid: 'uid-1', ticker: 'TEST', instrumentType: 'share', brand: { logoName: 'verified-logo.png' } }],
})
const position = { figi: 'BBG000', instrumentUid: 'uid-1', instrumentType: 'share' } as PositionSnapshot
const item = findInstrumentBadge(payload, position)
assert.equal(item?.ticker, 'TEST')
assert.equal(instrumentLogoUrl(payload, item), 'https://invest-brands.cdn-tinkoff.ru/verified-logox160.png')
assert.equal(instrumentLogoUrl(payload, item, 320), 'https://invest-brands.cdn-tinkoff.ru/verified-logox320.png')
assert.equal(instrumentLogoUrl(payload, null), null)
assert.equal(findInstrumentBadge(payload, { ...position, figi: 'missing' })?.ticker, 'TEST')
assert.deepEqual(['bond', 'share', 'etf', 'currency', 'future', 'unknown'].map(instrumentFallbackLabel), ['О', 'А', 'Ф', '₽', 'F', '•'])
console.log('instrument badges tests: ok')
