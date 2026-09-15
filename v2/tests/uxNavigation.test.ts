import assert from 'node:assert/strict'
import { ANALYTICS_SECTIONS, INCOME_SECTIONS, PORTFOLIO_SECTIONS, PRIMARY_NAVIGATION, RISK_SECTIONS, sectionLabel } from '../src/features/navigation/navigationModel.ts'
import { GLOSSARY } from '../src/features/help/glossary.ts'

assert.deepEqual(PRIMARY_NAVIGATION.map(item => item.id), ['board', 'portfolio', 'analytics', 'income', 'goals', 'dna'])
assert.equal(new Set(PRIMARY_NAVIGATION.map(item => item.id)).size, PRIMARY_NAVIGATION.length)
assert.equal(sectionLabel(ANALYTICS_SECTIONS, 'montecarlo'), 'Сценарии Монте-Карло')
assert.equal(sectionLabel(RISK_SECTIONS, 'tail'), 'Хвостовые риски')
assert.equal(sectionLabel(RISK_SECTIONS, 'corr'), 'Связи активов')
assert.deepEqual(RISK_SECTIONS.flatMap(group => group.options.map(option => option.id)), ['portfolio', 'benchmark', 'rolling', 'stress', 'tail', 'corr'])
for (const groups of [ANALYTICS_SECTIONS, RISK_SECTIONS, PORTFOLIO_SECTIONS, INCOME_SECTIONS]) {
  for (const option of groups.flatMap(group => group.options)) assert.doesNotMatch(option.label, /Сцен\.|Хвост$/i)
}
assert.deepEqual(Object.keys(GLOSSARY), ['twr', 'xirr', 'health', 'tailRisk', 'stress', 'rebalanceTolerance', 'payoutCoverage', 'outsideModel', 'iisTaxReturn'])
for (const item of Object.values(GLOSSARY)) { assert.ok(item.label.trim()); assert.ok(item.simple.length > 40) }
console.log('UX navigation and glossary regression: ok')
