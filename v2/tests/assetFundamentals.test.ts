import assert from 'node:assert/strict'
import {
  ASSET_FUNDAMENTALS_VERSION,
  deriveQvanixFundamentalInterpretation,
  formatAssetFundamentalMetric,
  normalizeAssetFundamentals,
  unavailableAssetFundamentals,
} from '../src/features/portfolio/assetFundamentals.ts'

const unavailable = unavailableAssetFundamentals()
assert.equal(unavailable.version, ASSET_FUNDAMENTALS_VERSION)
assert.equal(unavailable.available, false)
assert.equal(unavailable.source, 'UNAVAILABLE')
assert.equal(unavailable.metrics.every(metric => metric.value == null), true)
assert.equal(deriveQvanixFundamentalInterpretation(unavailable).reason, 'NO_VERIFIED_METRICS')

const rejectedSource = normalizeAssetFundamentals({ source: 'SCRAPED_SITE', metrics: { pe_ratio_ttm: 8.2 } })
assert.equal(rejectedSource.available, false)
assert.equal(rejectedSource.reason, 'NO_VERIFIED_SOURCE')

const normalized = normalizeAssetFundamentals({
  source: 'T_INVEST',
  assetUid: 'asset-1',
  updatedAt: '2026-09-14T10:00:00+03:00',
  metrics: {
    market_cap: '1250000000000',
    market_capitalization: '1250000000000',
    pe_ratio_ttm: '7,25',
    price_to_sales_ttm: 0,
    roe_ttm: 18.4,
    net_debt_to_ebitda: { value: '1.35' },
    dividend_yield: '6.5',
  },
})

assert.equal(normalized.available, true)
assert.equal(normalized.source, 'T_INVEST')
assert.equal(normalized.assetUid, 'asset-1')
assert.equal(normalized.updatedAt, '2026-09-14T07:00:00.000Z')
assert.equal(normalized.metrics.find(metric => metric.key === 'peRatioTtm')?.value, 7.25)
assert.equal(normalized.metrics.find(metric => metric.key === 'marketCap')?.value, 1_250_000_000_000)
assert.equal(normalized.metrics.find(metric => metric.key === 'priceToSalesTtm')?.value, null)
assert.equal(normalized.metrics.find(metric => metric.key === 'roeTtm')?.value, 18.4)
assert.equal(normalized.metrics.find(metric => metric.key === 'netDebtToEbitda')?.value, 1.35)
assert.equal(normalized.metrics.find(metric => metric.key === 'dividendYield')?.value, 6.5)
assert.match(formatAssetFundamentalMetric(normalized.metrics.find(metric => metric.key === 'peRatioTtm')!), /7[,.]25/)
assert.match(formatAssetFundamentalMetric(normalized.metrics.find(metric => metric.key === 'dividendYield')!), /6[,.]5%/)
assert.equal(formatAssetFundamentalMetric(normalized.metrics.find(metric => metric.key === 'priceToSalesTtm')!), '—')

const interpretation = deriveQvanixFundamentalInterpretation(normalized)
assert.equal(interpretation.available, false)
assert.equal(interpretation.reason, 'METHODOLOGY_GATED')
assert.equal(interpretation.components.some(component => component.metric === 'peRatioTtm' && component.value === 7.25), true)
assert.equal(interpretation.components.some(component => component.metric === 'priceToSalesTtm'), false)

const emptyVerified = normalizeAssetFundamentals({ source: 'T_INVEST', metrics: { pe_ratio_ttm: 0, roe_ttm: '0' } })
assert.equal(emptyVerified.available, false)
assert.equal(emptyVerified.reason, 'NO_USABLE_METRICS')
assert.equal(deriveQvanixFundamentalInterpretation(emptyVerified).reason, 'NO_VERIFIED_METRICS')

assert.equal(normalizeAssetFundamentals(null).reason, 'INVALID_PAYLOAD')
assert.equal(unavailableAssetFundamentals('UNSUPPORTED_INSTRUMENT').reason, 'UNSUPPORTED_INSTRUMENT')
assert.equal(unavailableAssetFundamentals('API_ERROR').reason, 'API_ERROR')

console.log('asset fundamentals tests: ok')
