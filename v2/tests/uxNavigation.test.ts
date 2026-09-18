import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ANALYTICS_SECTIONS, INCOME_SECTIONS, PORTFOLIO_SECTIONS, PRIMARY_NAVIGATION, RISK_SECTIONS, sectionLabel } from '../src/features/navigation/navigationModel.ts'
import { GLOSSARY } from '../src/features/help/glossary.ts'

assert.deepEqual(PRIMARY_NAVIGATION.map(item => item.id), ['board', 'portfolio', 'analytics', 'income', 'goals', 'dna'])
assert.equal(new Set(PRIMARY_NAVIGATION.map(item => item.id)).size, PRIMARY_NAVIGATION.length)
assert.equal(sectionLabel(ANALYTICS_SECTIONS, 'montecarlo'), 'Сценарии')
assert.equal(sectionLabel(RISK_SECTIONS, 'tail'), 'Редкие потери')
assert.equal(sectionLabel(RISK_SECTIONS, 'corr'), 'Связи активов')
assert.deepEqual(RISK_SECTIONS.flatMap(group => group.options.map(option => option.id)), ['portfolio', 'benchmark', 'rolling', 'stress', 'tail', 'corr'])
assert.deepEqual(RISK_SECTIONS.flatMap(group => group.options.map(option => option.label)), ['Портфель','Сравнение с IMOEX','История риска','Стресс-тесты','Редкие потери','Связи активов'])
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

const finalShellCss=readFileSync(new URL('../src/final-shell.css', import.meta.url), 'utf8')
assert.match(finalShellCss, /\.analytics-subnav\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s)
assert.match(finalShellCss, /\.analytics-subnav button\s*\{[^}]*min-height:\s*44px/s)
assert.match(finalShellCss, /\.analytics-subnav \.sample-badge\s*\{[^}]*min-height:\s*44px/s)
assert.doesNotMatch(finalShellCss,/\.analytics-subnav button\s*\{[^}]*font-size:\s*6\.4px/s,'narrow analytics nav must not fall back to microtype')
assert.match(finalShellCss,/@media \(max-width: 359px\)[\s\S]*?\.analytics-subnav button\s*\{[^}]*font-size:\s*8px[^}]*padding-inline:\s*8px/s,'very narrow phones must preserve readable analytics labels')
const iaCss=readFileSync(new URL('../src/informationArchitecture.css', import.meta.url), 'utf8')
assert.match(iaCss, /\.topbar__nav \.chip\{[^}]*min-height:44px/s)
assert.match(iaCss, /\.subnav\{[^}]*overflow-x:auto/s)
assert.match(iaCss, /\.subnav button\{[^}]*min-height:44px/s)
for(const file of ['portfolio/portfolio.css','portfolio/positionInspector.css','portfolio/bondAnalytics.css']) { const source=readFileSync(new URL(`../src/features/${file}`, import.meta.url),'utf8'); assert.ok(source.includes('min-height:44px'), `${file} must retain 44px mobile controls`) }
for(const file of ['income/incomeCompact.css','income/incomeRealizedHistory.css','income/incomeTax.css']) { const source=readFileSync(new URL(`../src/features/${file}`, import.meta.url),'utf8'); assert.ok(source.includes('min-height:44px'), `${file} must retain 44px mobile controls`) }
const goalCss=readFileSync(new URL('../src/features/goals/goalWorkspace.css', import.meta.url),'utf8'); assert.match(goalCss, /\.goal-chart__years button \{ min-width:44px; min-height:44px/)
const assetCss=readFileSync(new URL('../src/features/asset/assetWorkspace.css', import.meta.url),'utf8'); assert.match(assetCss, /\.asset-back,\.asset-nav button,\.asset-dual button,\.asset-unavailable button\{min-height:44px\}/)
const boardCss=readFileSync(new URL('../src/features/board/qvanixBoard.css',import.meta.url),'utf8')
assert.match(boardCss,/\.qv-board-card>small\{display:block;font-size:7px/,'Board supporting copy must remain readable on narrow phones')
const boardShellCss=readFileSync(new URL('../src/features/board/boardShell.css',import.meta.url),'utf8')
assert.match(boardShellCss,/\.topbar__nav \.chip\{min-height:44px[^}]*font-size:7\.5px/,'Board shell nav must retain mobile target and reading floor')
assert.match(helpCss,/\.context-help>summary\{width:44px;height:44px/,'mobile Help launcher must retain 44px target')
assert.match(helpCss,/\.context-help__close\{width:44px;height:44px/,'mobile Help close must retain 44px target')
assert.match(helpCss,/\.context-help__card>p\{font-size:11px/,'mobile Help body copy must remain readable')
assert.match(helpCss,/\.context-help-term>summary\{width:44px;height:44px/,'inline Help terms must retain mobile touch floor')
console.log('UX navigation and glossary regression: ok')

// Analytics selector uses concise user-facing labels while keeping stable view ids.
assert.deepEqual(ANALYTICS_SECTIONS.flatMap(group => group.options.map(option => option.label)), ['Доходность','Риски','Здоровье','Доли и цель','Сценарии'])
assert.equal(sectionLabel(ANALYTICS_SECTIONS, 'montecarlo'), 'Сценарии')
