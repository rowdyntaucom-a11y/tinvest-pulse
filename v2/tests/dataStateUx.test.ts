import assert from 'node:assert/strict'
import fs from 'node:fs'

const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const board = fs.readFileSync(new URL('../src/features/board/QvanixBoard.tsx', import.meta.url), 'utf8')
assert.match(app, /useState<DataTrustStatus>\("LOADING"\)/)
assert.match(app, /allowsConfirmedEmptyPortfolio\(portfolioTrust, snapshot\.positions\)/)
assert.match(app, /portfolioStatus === "FALLBACK" \|\| portfolioStatus === "ERROR"/)
assert.match(app, /ДАННЫЕ НЕ ПОДТВЕРЖДЕНЫ/)
assert.doesNotMatch(app, /expectedYield[^\n]*(day|daily|день|днев)/i)
console.log('Portfolio data-state UX regression: ok')

assert.match(app, /twrEligibility\.allowed \? signedRatio/)
assert.match(app, /!xirrEligibility\.allowed/)
assert.match(app, /!healthEligibility\.allowed/)
assert.match(app, /relativeEligibility\.allowed \? <HistoryChart/)
assert.match(app, /ownsLatestRequest\(sequence, requestSequence\.current, active\)\) setPortfolioStatus\("ERROR"\)/)
assert.match(app, /setInterval\(\(\) => setTrustNow\(Date\.now\(\)\), 60_000\)/)
assert.match(app, /clearInterval\(timer\)/)
assert.match(app, /evaluateHistoryTrust\(snapshot\.history, trustNow\)/)

assert.match(board, /value: metricEligibility\.twr \? signedPercent\(analytics\.twr\) : '—'/)
assert.match(board, /sparklineValues: metricEligibility\.twr \? twrHistory : undefined/)
assert.match(board, /const next = payoutTrust\.safeToCalculate \? calendar\?\.next \?\? null : null/)
assert.match(board, /actualAvailable = calendar\?\.actual\?\.observation\?\.available === true/)
assert.match(board, /payoutTrust\.safeToCalculate \? 'календарь подтверждён'/)
