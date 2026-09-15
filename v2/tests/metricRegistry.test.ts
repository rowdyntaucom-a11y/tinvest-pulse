import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildImoexDetail, buildPayoutCoverageDetail, buildTwrDetail, buildXirrDetail, METRIC_REGISTRY } from '../src/features/metrics/metricRegistry.ts'
import { GLOSSARY } from '../src/features/help/glossary.ts'

assert.deepEqual(Object.keys(METRIC_REGISTRY), ['twr', 'xirr', 'health', 'portfolio-vs-imoex', 'payout-coverage'])
assert.equal(METRIC_REGISTRY.twr.explanation, GLOSSARY.twr.simple)
assert.equal(METRIC_REGISTRY.xirr.explanation, GLOSSARY.xirr.simple)
const base = { value: null, displayedValue: '0%', from: null, to: null, points: 0, source: 'test', freshness: 'test' }
assert.equal(buildTwrDetail(base).value, 'Недоступно')
assert.equal(buildXirrDetail(base).status, 'unavailable')
assert.match(buildTwrDetail(base).limitations.join(' '), /expectedYield/)
assert.equal(buildImoexDetail({ spread: null, paired: 0, portfolioPoints: 10, lastDate: null, period: 'all' }).status, 'unavailable')
assert.equal(buildImoexDetail({ spread: 2, paired: 1, portfolioPoints: 10, lastDate: '2026-01-01', period: 'all' }).status, 'unavailable')
assert.match(buildImoexDetail({ spread: null, paired: 0, portfolioPoints: 10, lastDate: null, period: 'all' }).methodology, /не интерполируются/)
const incomplete = buildPayoutCoverageDetail({ coverage: 50, resolved: 1, eligible: 2, complete: false, source: 'T', freshness: 'now' })
assert.equal(incomplete.status, 'incomplete')
assert.match(incomplete.coverage, /неполное/)
assert.equal(buildPayoutCoverageDetail({ coverage: null, resolved: 0, eligible: 0, complete: false, source: 'T', freshness: 'now' }).value, 'Недоступно')
const sheet = readFileSync(new URL('../src/features/metrics/MetricDetailSheet.tsx', import.meta.url), 'utf8')
assert.match(sheet, /aria-modal="true"/)
assert.match(sheet, /event.key === 'Escape'/)
assert.match(sheet, /prior\?\.focus\(\)/)
console.log('metric registry tests passed')
