export const DATA_TRUST_METHOD_VERSION = 'qvanix-data-trust-v1' as const

export type DataTrustStatus = 'LOADING' | 'LIVE' | 'PARTIAL' | 'STALE' | 'FALLBACK' | 'ERROR' | 'UNAVAILABLE'
export type DataSourceType = 'BROKER' | 'MARKET' | 'PAYOUT' | 'FUNDAMENTALS' | 'CACHE' | 'UNKNOWN'
export type DataFreshness = 'FRESH' | 'STALE' | 'UNKNOWN'
export type DataCoverage = 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT' | 'UNKNOWN'

export type DataTrustInput = {
  sourceId: string | null
  sourceType: DataSourceType
  sourceState: 'LOADING' | 'LIVE' | 'FALLBACK' | 'ERROR' | 'UNAVAILABLE'
  fetchedAt?: string | null
  sourceTimestamp?: string | null
  lastSuccessfulLiveAt?: string | null
  staleAfterMs?: number
  coverage?: DataCoverage
  hasData: boolean
  partialReason?: string | null
  errorReason?: string | null
  nowMs: number
}

export type DataTrustSnapshot = {
  status: DataTrustStatus
  sourceId: string | null
  sourceType: DataSourceType
  fetchedAt: string | null
  sourceTimestamp: string | null
  lastSuccessfulLiveAt: string | null
  freshness: DataFreshness
  ageMs: number | null
  coverage: DataCoverage
  partialReason: string | null
  staleReason: string | null
  safeToDisplay: boolean
  safeToCalculate: boolean
  verifiedLive: boolean
  shortReason: string
  method: typeof DATA_TRUST_METHOD_VERSION
}

const timestamp = (value?: string | null) => {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Pure policy boundary. Unknown timestamps remain UNKNOWN and are never fabricated. */
export function evaluateDataTrust(input: DataTrustInput): DataTrustSnapshot {
  const sourceTime = timestamp(input.sourceTimestamp)
  const fetchedTime = timestamp(input.fetchedAt)
  const ageBase = sourceTime ?? fetchedTime
  const ageMs = ageBase == null ? null : Math.max(0, input.nowMs - ageBase)
  const isStale = input.sourceState === 'LIVE' && ageMs != null && input.staleAfterMs != null && ageMs > input.staleAfterMs
  const coverage = input.coverage ?? 'UNKNOWN'

  let status: DataTrustStatus
  if (input.sourceState === 'LOADING') status = 'LOADING'
  else if (input.sourceState === 'ERROR') status = 'ERROR'
  else if (input.sourceState === 'UNAVAILABLE' || (input.sourceState === 'LIVE' && !input.hasData)) status = 'UNAVAILABLE'
  else if (input.sourceState === 'FALLBACK') status = 'FALLBACK'
  else if (isStale) status = 'STALE'
  else if (coverage === 'PARTIAL' || coverage === 'INSUFFICIENT') status = 'PARTIAL'
  else status = 'LIVE'

  const verifiedLive = status === 'LIVE' || status === 'PARTIAL' || status === 'STALE'
  const safeToDisplay = input.hasData && !['LOADING', 'ERROR', 'UNAVAILABLE'].includes(status)
  const safeToCalculate = status === 'LIVE' && coverage === 'COMPLETE'
  const reasons: Record<DataTrustStatus, string> = {
    LOADING: 'Данные загружаются', LIVE: 'Источник подтверждён', PARTIAL: input.partialReason || 'Покрытие неполное',
    STALE: 'Данные источника устарели', FALLBACK: 'Используется резервный источник', ERROR: input.errorReason || 'Ошибка источника',
    UNAVAILABLE: 'Подтверждённые данные недоступны',
  }
  return {
    status, sourceId: input.sourceId, sourceType: input.sourceType,
    fetchedAt: input.fetchedAt ?? null, sourceTimestamp: input.sourceTimestamp ?? null,
    lastSuccessfulLiveAt: input.lastSuccessfulLiveAt ?? null,
    freshness: isStale ? 'STALE' : ageMs == null ? 'UNKNOWN' : 'FRESH', ageMs, coverage,
    partialReason: status === 'PARTIAL' ? input.partialReason ?? 'Недостаточное покрытие' : null,
    staleReason: status === 'STALE' ? `Возраст данных превышает ${input.staleAfterMs} мс` : null,
    safeToDisplay, safeToCalculate, verifiedLive, shortReason: reasons[status], method: DATA_TRUST_METHOD_VERSION,
  }
}

export type MetricRequirement = 'LIVE_SOURCE' | 'COMPLETE_COVERAGE' | 'MATURE_HISTORY' | 'DATED_CASHFLOWS' | 'PAIRED_BENCHMARK'
export function resolveMetricEligibility(trust: DataTrustSnapshot, requirements: MetricRequirement[], evidence: {
  historyPoints?: number; minimumHistoryPoints?: number; datedCashflows?: number; pairedPoints?: number; minimumPairedPoints?: number
} = {}) {
  const blockedBy: MetricRequirement[] = []
  if (requirements.includes('LIVE_SOURCE') && trust.status !== 'LIVE') blockedBy.push('LIVE_SOURCE')
  if (requirements.includes('COMPLETE_COVERAGE') && trust.coverage !== 'COMPLETE') blockedBy.push('COMPLETE_COVERAGE')
  if (requirements.includes('MATURE_HISTORY') && (evidence.historyPoints ?? 0) < (evidence.minimumHistoryPoints ?? 2)) blockedBy.push('MATURE_HISTORY')
  if (requirements.includes('DATED_CASHFLOWS') && (evidence.datedCashflows ?? 0) < 2) blockedBy.push('DATED_CASHFLOWS')
  if (requirements.includes('PAIRED_BENCHMARK') && (evidence.pairedPoints ?? 0) < (evidence.minimumPairedPoints ?? 2)) blockedBy.push('PAIRED_BENCHMARK')
  return { allowed: blockedBy.length === 0, blockedBy }
}

export function evaluateHistoryTrust(points: Array<{ date: string; portfolio?: number | null; imoex?: number | null }>, nowMs: number) {
  const valid = points.filter(point => /^\d{4}-\d{2}-\d{2}$/.test(point.date))
  const portfolioPoints = valid.filter(point => point.portfolio != null)
  const benchmarkPoints = valid.filter(point => point.imoex != null)
  const pairedPoints = valid.filter(point => point.portfolio != null && point.imoex != null)
  const latestPairedDate = pairedPoints.at(-1)?.date ?? null
  const missingSegments = valid.length - pairedPoints.length
  const trust = evaluateDataTrust({ sourceId: 'T_INVEST+IMOEX', sourceType: 'MARKET', sourceState: valid.length ? 'LIVE' : 'UNAVAILABLE',
    sourceTimestamp: valid.at(-1)?.date ?? null, staleAfterMs: 7 * 86_400_000, coverage: missingSegments ? 'PARTIAL' : valid.length >= 2 ? 'COMPLETE' : 'INSUFFICIENT',
    hasData: valid.length > 0, partialReason: missingSegments ? `${missingSegments} дат без подтверждённой пары` : 'Недостаточно истории', nowMs })
  return { trust, portfolioPoints: portfolioPoints.length, benchmarkPoints: benchmarkPoints.length, pairedPoints: pairedPoints.length, latestPairedDate, missingSegments }
}

export function evaluatePayoutTrust(input: { available: boolean; stale: boolean; generatedAt: string | null; eligibleAssets: number; resolvedAssets: number; errors: number }, nowMs: number) {
  const complete = input.eligibleAssets > 0 && input.resolvedAssets === input.eligibleAssets && input.errors === 0
  const coverage: DataCoverage = complete ? 'COMPLETE' : input.available ? 'PARTIAL' : 'UNKNOWN'
  return evaluateDataTrust({ sourceId: 'T_INVEST_PAYOUTS', sourceType: 'PAYOUT', sourceState: input.available ? 'LIVE' : 'UNAVAILABLE',
    fetchedAt: input.generatedAt, staleAfterMs: input.stale ? -1 : 24 * 60 * 60_000, coverage, hasData: input.available,
    partialReason: 'Не все активы имеют подтверждённые данные о выплатах', nowMs })
}

export function evaluateAssetHistoryTrust(input: { available: boolean; source: string | null; to: string | null; requested: number; availableSeries: number; points: number }, nowMs: number) {
  const coverage: DataCoverage = input.availableSeries < input.requested ? 'PARTIAL' : input.points >= 2 ? 'COMPLETE' : 'INSUFFICIENT'
  return evaluateDataTrust({ sourceId: input.source, sourceType: 'MARKET', sourceState: input.available ? 'LIVE' : 'UNAVAILABLE', sourceTimestamp: input.to,
    staleAfterMs: 7 * 86_400_000, coverage, hasData: input.available && input.points > 0, partialReason: 'Диапазон истории покрыт не полностью', nowMs })
}

export function evaluateFundamentalsTrust(input: { loading?: boolean; available: boolean; source: string; updatedAt: string | null; reason: string }, nowMs: number) {
  const sourceState: DataTrustInput['sourceState'] = input.loading ? 'LOADING' : input.available && input.source === 'T_INVEST' ? 'LIVE' : input.reason === 'API_ERROR' ? 'ERROR' : 'UNAVAILABLE'
  return evaluateDataTrust({ sourceId: input.source === 'T_INVEST' ? 'T_INVEST_GET_ASSET_FUNDAMENTALS' : null, sourceType: 'FUNDAMENTALS', sourceState,
    sourceTimestamp: input.updatedAt, staleAfterMs: 30 * 86_400_000, coverage: input.available ? 'COMPLETE' : 'UNKNOWN', hasData: input.available, errorReason: 'Ошибка официального источника fundamentals', nowMs })
}
