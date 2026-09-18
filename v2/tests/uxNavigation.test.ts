import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ANALYTICS_SECTIONS, INCOME_SECTIONS, PORTFOLIO_SECTIONS, PRIMARY_NAVIGATION, RISK_SECTIONS, sectionLabel } from '../src/features/navigation/navigationModel.ts'
import { GLOSSARY } from '../src/features/help/glossary.ts'

assert.deepEqual(PRIMARY_NAVIGATION.map(item => item.id), ['board', 'portfolio', 'analytics', 'income', 'goals', 'dna'])
assert.equal(new Set(PRIMARY_NAVIGATION.map(item => item.id)).size, PRIMARY_NAVIGATION.length)
assert.equal(sectionLabel(ANALYTICS_SECTIONS, 'montecarlo'), 'Сценарии')
assert.equal(sectionLabel(RISK_SECTIONS, 'tail'), 'Хвостовые риски')
assert.equal(sectionLabel(RISK_SECTIONS, 'corr'), 'Связи активов')
assert.deepEqual(RISK_SECTIONS.flatMap(group => group.options.map(option => option.id)), ['portfolio', 'benchmark', 'rolling', 'stress', 'tail', 'corr'])
for (const groups of [ANALYTICS_SECTIONS, RISK_SECTIONS, PORTFOLIO_SECTIONS, INCOME_SECTIONS]) {
  for (const option of groups.flatMap(group => group.options)) assert.doesNotMatch(option.label, /Сцен\.|Хвост$/i)
}
assert.deepEqual(Object.keys(GLOSSARY), ['twr', 'xirr', 'health', 'tailRisk', 'stress', 'rebalanceTolerance', 'payoutCoverage', 'outsideModel', 'iisTaxReturn'])
for (const item of Object.values(GLOSSARY)) { assert.ok(item.label.trim()); assert.ok(item.simple.length > 40) }

const interactionCss = readFileSync(new URL('../src/mobileControlLayer.css', import.meta.url), 'utf8')
const mainSource = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
assert.match(interactionCss, /\.app-shell \.topbar\s*\{[^}]*z-index:\s*30/s)
assert.match(interactionCss, /\.mobile-primary-nav\s*\{[^}]*z-index:\s*40\s*!important[^}]*pointer-events:\s*auto[^}]*touch-action:\s*manipulation/s)
assert.match(interactionCss, /\.mobile-primary-nav button\s*\{[^}]*pointer-events:\s*auto[^}]*touch-action:\s*manipulation/s)
assert.match(interactionCss, /\.context-help,\s*\.qv-personalize\s*\{[^}]*left:\s*10px\s*!important[^}]*right:\s*auto\s*!important[^}]*z-index:\s*45\s*!important/s)
assert.match(interactionCss, /\.context-help\s*\{[^}]*bottom:\s*calc\(74px \+ env\(safe-area-inset-bottom\)\)\s*!important/s)
assert.match(interactionCss, /\.qv-personalize\s*\{[^}]*bottom:\s*calc\(124px \+ env\(safe-area-inset-bottom\)\)\s*!important/s)
assert.match(interactionCss, /\.context-help > summary,\s*\.qv-personalize > summary\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px[^}]*touch-action:\s*manipulation/s)
assert.ok(interactionCss.includes('body:has(.qv-personalize[open]) .context-help {'))
assert.ok(interactionCss.includes('visibility: hidden;'))
assert.ok(interactionCss.includes('pointer-events: none;'))
const helpSource = readFileSync(new URL('../src/features/help/ContextHelp.tsx', import.meta.url), 'utf8')
const helpCss = readFileSync(new URL('../src/features/help/contextHelp.css', import.meta.url), 'utf8')
assert.ok(helpSource.includes('aria-label="Закрыть подсказку"'))
assert.ok(helpCss.includes('max-height:min(440px,48dvh)'))
assert.ok(helpCss.includes('bottom:calc(138px + env(safe-area-inset-bottom))'))
assert.doesNotMatch(interactionCss, /grid-template-columns:\s*repeat\(6\s*,/)
assert.ok(mainSource.lastIndexOf("import './mobileControlLayer.css'") > mainSource.lastIndexOf("import './boardReadability.css'"), 'mobile interaction layer must load after other shell/readability CSS')

console.log('UX navigation and glossary regression: ok')

// Analytics selector uses concise user-facing labels while keeping stable view ids.
assert.deepEqual(ANALYTICS_SECTIONS.flatMap(group => group.options.map(option => option.label)), ['Доходность','Риски','Здоровье','Доли и цель','Сценарии'])
assert.equal(sectionLabel(ANALYTICS_SECTIONS, 'montecarlo'), 'Сценарии')
