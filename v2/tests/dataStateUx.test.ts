import assert from 'node:assert/strict'
import fs from 'node:fs'

const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert.match(app, /useState<DataTrustStatus>\("LOADING"\)/)
assert.match(app, /portfolioStatus === "LIVE" && snapshot\.positions === 0/)
assert.match(app, /portfolioStatus === "FALLBACK" \|\| portfolioStatus === "ERROR"/)
assert.match(app, /ДАННЫЕ НЕ ПОДТВЕРЖДЕНЫ/)
assert.doesNotMatch(app, /expectedYield[^\n]*(day|daily|день|днев)/i)
console.log('Portfolio data-state UX regression: ok')
