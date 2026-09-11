import type { PositionSnapshot } from '../../lib/portfolioApi'
import type { StressExposure, StressScenario } from './stress'

export type HistoricalStressClass = 'equity_ru' | 'ofz' | 'unassigned'

export type HistoricalStressScenario = StressScenario & {
  version: '1.0'
  period: {
    from: string
    to: string
    label: string
  }
  methodology: string
  sourceUrl: string
  verifiedAt: string
  benchmarks: Array<{
    classKey: 'equity_ru' | 'ofz'
    symbol: 'MCFTR' | 'RGBITR'
    label: string
  }>
}

export const HISTORICAL_STRESS_CATALOG_VERSION = '1.0'

export const HISTORICAL_STRESS_SCENARIOS: HistoricalStressScenario[] = [
  {
    id: 'ru-2020-q1-covid-oil',
    version: '1.0',
    label: 'I кв. 2020 · COVID / OIL',
    source: 'Банк России · рыночные индикаторы НПФ',
    sourceDate: '2020-03-31',
    period: { from: '2020-01-01', to: '2020-03-31', label: 'I квартал 2020' },
    methodology: 'Фактическая доходность индексов полной доходности MCFTR и RGBITR за один календарный период. Шоки линейно применяются только к текущим акциям РФ и ОФЗ.',
    sourceUrl: 'https://www.cbr.ru/analytics/RSCI/activity_npf/dokhodnost-npf-1-20/',
    verifiedAt: '2026-09-11',
    benchmarks: [
      { classKey: 'equity_ru', symbol: 'MCFTR', label: 'Акции РФ · total return' },
      { classKey: 'ofz', symbol: 'RGBITR', label: 'ОФЗ · total return' },
    ],
    shocks: {
      equity_ru: -0.174,
      ofz: -0.007,
    },
  },
  {
    id: 'ru-2022-9m-market-break',
    version: '1.0',
    label: '9 мес. 2022 · MARKET BREAK',
    source: 'Банк России · рыночные индикаторы НПФ',
    sourceDate: '2022-09-30',
    period: { from: '2022-01-01', to: '2022-09-30', label: '9 месяцев 2022' },
    methodology: 'Фактическая доходность индексов полной доходности MCFTR и RGBITR за один календарный период. Шоки линейно применяются только к текущим акциям РФ и ОФЗ.',
    sourceUrl: 'https://www.cbr.ru/analytics/RSCI/activity_npf/dokhodnost-npf-3-22/',
    verifiedAt: '2026-09-11',
    benchmarks: [
      { classKey: 'equity_ru', symbol: 'MCFTR', label: 'Акции РФ · total return' },
      { classKey: 'ofz', symbol: 'RGBITR', label: 'ОФЗ · total return' },
    ],
    shocks: {
      equity_ru: -0.471,
      ofz: -0.018,
    },
  },
]

export function classifyHistoricalStress(position: PositionSnapshot): HistoricalStressClass {
  const type = String(position.instrumentType || '').trim().toLowerCase()
  const ticker = String(position.ticker || '').trim().toUpperCase()
  const name = String(position.name || '').trim().toLowerCase()

  if (/^SU\d/.test(ticker) || /офз/.test(name)) return 'ofz'
  if (type.includes('share') || type.includes('stock') || type === 'equity') return 'equity_ru'
  return 'unassigned'
}

export function buildHistoricalStressExposures(positions: PositionSnapshot[]): StressExposure[] {
  return positions
    .filter(position => Number.isFinite(position.currentValue) && position.currentValue > 0)
    .map(position => ({
      key: position.ticker || position.name,
      label: position.ticker || position.name,
      classKey: classifyHistoricalStress(position),
      currentValue: position.currentValue,
    }))
}
