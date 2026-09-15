import assert from 'node:assert/strict'
import fs from 'node:fs'

const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
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
