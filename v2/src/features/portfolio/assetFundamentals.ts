export const ASSET_FUNDAMENTALS_VERSION = '1.1' as const

export type AssetFundamentalSource = 'T_INVEST' | 'UNAVAILABLE'

export type AssetFundamentalMetricKey =
  | 'marketCap'
  | 'peRatioTtm'
  | 'priceToSalesTtm'
  | 'priceToBookTtm'
  | 'evToEbitdaTtm'
  | 'roeTtm'
  | 'roaTtm'
  | 'roicTtm'
  | 'revenueTtm'
  | 'ebitdaTtm'
  | 'netIncomeTtm'
  | 'freeCashFlowTtm'
  | 'netDebtToEbitda'
  | 'dividendYield'

export type AssetFundamentalMetric = {
  key: AssetFundamentalMetricKey
  label: string
  value: number | null
  unit: 'RUB' | 'RATIO' | 'PERCENT'
}

export type AssetFundamentalsSnapshot = {
  version: typeof ASSET_FUNDAMENTALS_VERSION
  available: boolean
  source: AssetFundamentalSource
  assetUid: string | null
  updatedAt: string | null
  metrics: AssetFundamentalMetric[]
  reason: 'OK' | 'NO_VERIFIED_SOURCE' | 'INVALID_PAYLOAD' | 'NO_USABLE_METRICS'
  note: string
}

const METRIC_DEFS: Array<{
  key: AssetFundamentalMetricKey
  aliases: string[]
  label: string
  unit: AssetFundamentalMetric['unit']
}> = [
  { key: 'marketCap', aliases: ['marketCap', 'market_cap', 'marketCapitalization', 'market_capitalization'], label: 'Капитализация', unit: 'RUB' },
  { key: 'peRatioTtm', aliases: ['peRatioTtm', 'pe_ratio_ttm'], label: 'P/E TTM', unit: 'RATIO' },
  { key: 'priceToSalesTtm', aliases: ['priceToSalesTtm', 'price_to_sales_ttm', 'psRatioTtm', 'ps_ratio_ttm'], label: 'P/S TTM', unit: 'RATIO' },
  { key: 'priceToBookTtm', aliases: ['priceToBookTtm', 'price_to_book_ttm', 'pbRatioTtm', 'pb_ratio_ttm'], label: 'P/BV TTM', unit: 'RATIO' },
  { key: 'evToEbitdaTtm', aliases: ['evToEbitdaTtm', 'ev_to_ebitda_ttm'], label: 'EV/EBITDA TTM', unit: 'RATIO' },
  { key: 'roeTtm', aliases: ['roeTtm', 'roe_ttm', 'roe'], label: 'ROE TTM', unit: 'PERCENT' },
  { key: 'roaTtm', aliases: ['roaTtm', 'roa_ttm', 'roa'], label: 'ROA TTM', unit: 'PERCENT' },
  { key: 'roicTtm', aliases: ['roicTtm', 'roic_ttm', 'roic'], label: 'ROIC TTM', unit: 'PERCENT' },
  { key: 'revenueTtm', aliases: ['revenueTtm', 'revenue_ttm', 'totalRevenue', 'total_revenue'], label: 'Выручка TTM', unit: 'RUB' },
  { key: 'ebitdaTtm', aliases: ['ebitdaTtm', 'ebitda_ttm', 'ebitda'], label: 'EBITDA TTM', unit: 'RUB' },
  { key: 'netIncomeTtm', aliases: ['netIncomeTtm', 'net_income_ttm', 'netIncome', 'net_income'], label: 'Чистая прибыль TTM', unit: 'RUB' },
  { key: 'freeCashFlowTtm', aliases: ['freeCashFlowTtm', 'free_cash_flow_ttm', 'freeCashFlow', 'free_cash_flow'], label: 'FCF TTM', unit: 'RUB' },
  { key: 'netDebtToEbitda', aliases: ['netDebtToEbitda', 'net_debt_to_ebitda'], label: 'Net Debt / EBITDA', unit: 'RATIO' },
  { key: 'dividendYield', aliases: ['dividendYield', 'dividend_yield'], label: 'Dividend Yield', unit: 'PERCENT' },
]

const NOTE = 'Классические показатели должны приходить из проверенного источника. QVANIX-интерпретация может строиться только поверх этих же значений и не заменяет их.'

function cleanText(value: unknown): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text || null
}

export async function loadAssetFundamentals(instrumentUid: string, signal?: AbortSignal): Promise<AssetFundamentalsSnapshot> {
  const uid = cleanText(instrumentUid)
  if (!uid || uid.length > 128) return unavailableAssetFundamentals('INVALID_PAYLOAD')
  try {
    const response = await fetch(`/api/asset-fundamentals?instrumentUid=${encodeURIComponent(uid)}`, { cache: 'no-store', signal })
    if (!response.ok) return unavailableAssetFundamentals(response.status === 404 ? 'NO_USABLE_METRICS' : 'NO_VERIFIED_SOURCE')
    const raw = await response.json() as unknown
    if (!raw || typeof raw !== 'object' || cleanText((raw as Record<string, unknown>).instrumentUid) !== uid) return unavailableAssetFundamentals('INVALID_PAYLOAD')
    return normalizeAssetFundamentals(raw)
  } catch {
    return unavailableAssetFundamentals('NO_VERIFIED_SOURCE')
  }
}

function finiteNonZero(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value !== 0 ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed !== 0 ? parsed : null
  }
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>
    if ('value' in row) return finiteNonZero(row.value)
    if ('units' in row) {
      const units = Number(row.units)
      const nano = row.nano == null ? 0 : Number(row.nano)
      if (!Number.isFinite(units) || !Number.isFinite(nano)) return null
      const parsed = units + nano / 1e9
      return Number.isFinite(parsed) && parsed !== 0 ? parsed : null
    }
  }
  return null
}

function isoDate(value: unknown): string | null {
  const raw = cleanText(value)
  if (!raw) return null
  const time = Date.parse(raw)
  return Number.isFinite(time) ? new Date(time).toISOString() : null
}

function metricValue(row: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (alias in row) return finiteNonZero(row[alias])
  }
  return null
}

export function unavailableAssetFundamentals(reason: AssetFundamentalsSnapshot['reason'] = 'NO_VERIFIED_SOURCE'): AssetFundamentalsSnapshot {
  return {
    version: ASSET_FUNDAMENTALS_VERSION,
    available: false,
    source: 'UNAVAILABLE',
    assetUid: null,
    updatedAt: null,
    metrics: METRIC_DEFS.map(def => ({ key: def.key, label: def.label, value: null, unit: def.unit })),
    reason,
    note: NOTE,
  }
}

/**
 * Normalizes a future verified T-Invest GetAssetFundamentals bridge response.
 * Per official T-Invest documentation, zero values from this method are treated
 * as unavailable rather than as verified zero fundamentals.
 */
export function normalizeAssetFundamentals(value: unknown): AssetFundamentalsSnapshot {
  if (!value || typeof value !== 'object') return unavailableAssetFundamentals('INVALID_PAYLOAD')
  const root = value as Record<string, unknown>
  const source = cleanText(root.source)?.toUpperCase()
  if (source !== 'T_INVEST') return unavailableAssetFundamentals('NO_VERIFIED_SOURCE')

  const rawMetricRoot = root.metrics && typeof root.metrics === 'object'
    ? root.metrics as Record<string, unknown>
    : root.fundamentals && typeof root.fundamentals === 'object'
      ? root.fundamentals as Record<string, unknown>
      : root

  const metrics = METRIC_DEFS.map(def => ({
    key: def.key,
    label: def.label,
    value: metricValue(rawMetricRoot, def.aliases),
    unit: def.unit,
  }))
  const available = metrics.some(metric => metric.value != null)

  return {
    version: ASSET_FUNDAMENTALS_VERSION,
    available,
    source: 'T_INVEST',
    assetUid: cleanText(root.assetUid ?? root.asset_uid ?? root.assetId ?? root.asset_id),
    updatedAt: isoDate(root.updatedAt ?? root.updated_at),
    metrics,
    reason: available ? 'OK' : 'NO_USABLE_METRICS',
    note: NOTE,
  }
}

export function formatAssetFundamentalMetric(metric: AssetFundamentalMetric, locale = 'ru-RU') {
  if (metric.value == null || !Number.isFinite(metric.value)) return '—'
  if (metric.unit === 'PERCENT') return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(metric.value)}%`
  if (metric.unit === 'RUB') return `${new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 2 }).format(metric.value)} ₽`
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(metric.value)
}

export type QvanixFundamentalInterpretation = {
  available: false
  reason: 'METHODOLOGY_GATED' | 'NO_VERIFIED_METRICS'
  components: Array<{ metric: AssetFundamentalMetricKey; value: number }>
  note: string
}

/**
 * Interpretation is intentionally gated until a reviewed scoring methodology is
 * approved. The boundary still exposes the exact raw inputs that a future score
 * would be allowed to use, preventing any hidden/demo score from entering UI.
 */
export function deriveQvanixFundamentalInterpretation(snapshot: AssetFundamentalsSnapshot): QvanixFundamentalInterpretation {
  const components = snapshot.metrics.flatMap(metric => metric.value == null ? [] : [{ metric: metric.key, value: metric.value }])
  return {
    available: false,
    reason: components.length ? 'METHODOLOGY_GATED' : 'NO_VERIFIED_METRICS',
    components,
    note: components.length
      ? 'Проверенные классические метрики доступны, но QVANIX-оценка ещё не публикуется до утверждения прозрачной версии методологии.'
      : 'Нет проверенных фундаментальных метрик для интерпретации.',
  }
}
