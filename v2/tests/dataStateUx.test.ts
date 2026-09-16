import assert from 'node:assert/strict'
import fs from 'node:fs'

const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(app, /useState<DataTrustStatus>\("LOADING"\)/)
assert.match(app, /allowsConfirmedEmptyPortfolio\(portfolioTrust, snapshot\.positions\)/)
assert.match(app, /portfolioStatus === "FALLBACK" \|\| portfolioStatus === "ERROR"/)
assert.match(app, /ДАННЫЕ НЕ ПОДТВЕРЖДЕНЫ/)
assert.doesNotMatch(app, /expectedYield[^\n]*(day|daily|день|днев)/i)
console.log('Portfolio data-state UX regression: ok')

// DNA is a workspace, not a broker-data view. Broker LOADING/FALLBACK/ERROR must not
// prevent the Living World branch from being selected. Financial signals inside DNA
// remain fail-closed through the existing quality-input/runtime boundary.
assert.match(app, /tab === "dna"[\s\S]*?ЖИВОЙ МИР/)
assert.match(app, /tab !== "dna" && portfolioStatus === "LOADING"/)
assert.match(app, /tab !== "dna" && \(portfolioStatus === "FALLBACK" \|\| portfolioStatus === "ERROR"\)/)
assert.match(app, /tab !== "dna" && snapshot\.positions === 0/)

assert.match(app, /twrEligibility\.allowed \? signedRatio/)
assert.match(app, /!xirrEligibility\.allowed/)
assert.match(app, /!healthEligibility\.allowed/)
assert.match(app, /\{healthEligibility\.allowed\s*\? "Расчёт на подтверждённой зрелой истории"/)
assert.match(app, /relativeEligibility\.allowed \? <HistoryChart/)
assert.match(app, /ownsLatestRequest\(sequence, requestSequence\.current, active\)\) setPortfolioStatus\("ERROR"\)/)

const board = fs.readFileSync(new URL('../src/features/board/QvanixBoard.tsx', import.meta.url), 'utf8')
assert.match(board, /sparklineValues: metricEligibility\.twr \? twrHistory : undefined/)
