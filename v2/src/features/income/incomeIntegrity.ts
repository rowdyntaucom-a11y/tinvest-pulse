import type { PayoutCalendar } from '../../lib/payoutsApi'

export type IncomeIntegrityState = 'loading' | 'verified' | 'stale' | 'partial' | 'unavailable'

export type IncomeIntegrity = {
  state: IncomeIntegrityState
  label: string
  detail: string
  coveragePct: number | null
  resolvedAssets: number
  eligibleAssets: number
  errors: number
}

export function getIncomeIntegrity(data: PayoutCalendar, loading: boolean): IncomeIntegrity {
  const eligibleAssets = Math.max(0, Number(data.coverage.eligibleAssets) || 0)
  const resolvedAssets = Math.max(0, Number(data.coverage.resolvedAssets) || 0)
  const rawCoverage = Number(data.coverage.coverageRatio)
  const coveragePct = eligibleAssets > 0 && Number.isFinite(rawCoverage)
    ? Math.max(0, Math.min(100, rawCoverage * 100))
    : null
  const errors = Array.isArray(data.coverage.errors) ? data.coverage.errors.length : 0

  if (loading) {
    return { state: 'loading', label: 'T-BANK · ЗАГРУЗКА', detail: 'получаем факт и расписание', coveragePct, resolvedAssets, eligibleAssets, errors }
  }

  if (!data.available) {
    return { state: 'unavailable', label: 'T-BANK · НЕТ ДАННЫХ', detail: 'источник временно недоступен', coveragePct, resolvedAssets, eligibleAssets, errors }
  }

  if (data.stale) {
    return { state: 'stale', label: 'T-BANK · STALE', detail: 'показан последний полный снимок', coveragePct, resolvedAssets, eligibleAssets, errors }
  }

  if (data.integrity.complete) {
    return { state: 'verified', label: 'T-BANK · VERIFIED', detail: 'факт и расписание прошли проверку', coveragePct, resolvedAssets, eligibleAssets, errors }
  }

  return {
    state: 'partial',
    label: 'T-BANK · PARTIAL',
    detail: eligibleAssets > 0 ? `расписание ${resolvedAssets}/${eligibleAssets}` : 'неполный ответ источника',
    coveragePct,
    resolvedAssets,
    eligibleAssets,
    errors,
  }
}
