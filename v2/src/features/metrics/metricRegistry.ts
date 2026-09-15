import { GLOSSARY } from '../help/glossary.ts'

export type MetricId = 'twr' | 'xirr' | 'health' | 'portfolio-vs-imoex' | 'payout-coverage'
export type MetricStatus = 'available' | 'preview' | 'unavailable' | 'incomplete'

export type MetricDetailModel = {
  id: MetricId
  title: string
  value: string
  status: MetricStatus
  explanation: string
  methodology: string
  methodVersion: string
  period: string
  coverage: string
  source: string
  freshness: string
  limitations: string[]
  deeperAction?: { label: string; onSelect: () => void }
  components?: Array<{ label: string; value: string; note: string }>
}

export const METRIC_REGISTRY = {
  twr: { title: GLOSSARY.twr.label, explanation: GLOSSARY.twr.simple },
  xirr: { title: GLOSSARY.xirr.label, explanation: GLOSSARY.xirr.simple },
  health: { title: GLOSSARY.health.label, explanation: GLOSSARY.health.simple },
  'portfolio-vs-imoex': { title: 'Портфель против IMOEX', explanation: 'Сравнение портфеля и IMOEX на общей нормализованной шкале и только по совпадающим датам.' },
  'payout-coverage': { title: GLOSSARY.payoutCoverage.label, explanation: GLOSSARY.payoutCoverage.simple },
} as const satisfies Record<MetricId, { title: string; explanation: string }>

type PerformanceInput = { value: number | null; displayedValue: string; from: string | null; to: string | null; points: number; source: string; freshness: string }
const period = (from: string | null, to: string | null) => from && to ? `${from} → ${to}` : 'Период не подтверждён'

export function buildTwrDetail(input: PerformanceInput): MetricDetailModel {
  return { id: 'twr', ...METRIC_REGISTRY.twr, value: input.value == null ? 'Недоступно' : input.displayedValue, status: input.value == null ? 'unavailable' : input.points < 252 ? 'preview' : 'available', methodology: 'Существующий TWR-индекс нейтрализует влияние внешних пополнений и выводов; значение в sheet не пересчитывается.', methodVersion: 'Portfolio analytics 1.1', period: period(input.from, input.to), coverage: input.points >= 2 ? `${input.points} дневных точек${input.points < 252 ? ' · предварительная история' : ' · зрелая история'}` : 'Недостаточно истории: нужны минимум 2 точки', source: input.source, freshness: input.freshness, limitations: ['Не обещает будущую доходность.', 'Не является broker expectedYield или дневным изменением.'] }
}

export function buildXirrDetail(input: PerformanceInput): MetricDetailModel {
  return { id: 'xirr', ...METRIC_REGISTRY.xirr, value: input.value == null ? 'Недоступно' : input.displayedValue, status: input.value == null ? 'unavailable' : 'available', methodology: 'Существующий XIRR использует фактические даты и размеры денежных потоков. Drill-down не меняет cash-flow methodology.', methodVersion: 'Backend XIRR contract', period: period(input.from, input.to), coverage: input.value == null ? 'Недостаточно подтверждённых денежных потоков для XIRR' : 'Расчёт доступен по подтверждённым денежным потокам', source: input.source, freshness: input.freshness, limitations: ['Это личная годовая money-weighted доходность; TWR отвечает на другой вопрос.', 'Недоступное значение не заменяется нулём и не является прогнозом.'] }
}

export function buildHealthDetail(input: PerformanceInput & { version: string; components: MetricDetailModel['components'] }): MetricDetailModel {
  return { id: 'health', ...METRIC_REGISTRY.health, value: input.value == null ? 'Недоступно' : input.displayedValue, status: input.value == null ? 'unavailable' : input.points < 252 ? 'preview' : 'available', methodology: 'Прозрачная взвешенная композиция только доступных deterministic-компонентов; причины показаны ниже.', methodVersion: `Health ${input.version} · analytics 1.1`, period: period(input.from, input.to), coverage: input.value == null ? 'Не все обязательные компоненты доступны' : `${input.points} дневных точек`, source: input.source, freshness: input.freshness, limitations: ['Диагностический индекс состояния, не прогноз доходности и не команда купить или продать.'], components: input.components }
}

export function buildImoexDetail(input: { spread: number | null; paired: number; portfolioPoints: number; lastDate: string | null; period: string }): MetricDetailModel {
  const available = input.spread != null && input.paired >= 2
  return { id: 'portfolio-vs-imoex', ...METRIC_REGISTRY['portfolio-vs-imoex'], value: available ? `${input.spread! >= 0 ? '+' : ''}${input.spread!.toFixed(1)} п.` : 'Недоступно', status: available ? (input.paired < input.portfolioPoints ? 'incomplete' : 'available') : 'unavailable', methodology: 'Последняя разница двух нормализованных индексов. Используются только verified paired history points; пропуски IMOEX не интерполируются.', methodVersion: 'Paired history contract', period: input.period, coverage: available ? `${input.paired}/${input.portfolioPoints} точек портфеля · последняя общая ${input.lastDate}` : 'Нужно минимум 2 совпадающие точки портфеля и IMOEX', source: 'История портфеля + IMOEX', freshness: input.lastDate ?? 'Общей точки нет', limitations: ['Это не alpha, не прогноз и не персональная инвестиционная рекомендация.'] }
}

export function buildPayoutCoverageDetail(input: { coverage: number | null; resolved: number; eligible: number; complete: boolean; source: string; freshness: string }): MetricDetailModel {
  const available = input.coverage != null
  return { id: 'payout-coverage', ...METRIC_REGISTRY['payout-coverage'], value: available ? `${input.coverage!.toFixed(1)}%` : 'Недоступно', status: !available ? 'unavailable' : input.complete ? 'available' : 'incomplete', methodology: 'Доля eligible-активов, для которых официальный boundary разрешил расписание выплат.', methodVersion: 'Payout coverage contract', period: 'Текущее подтверждённое расписание 12М', coverage: available ? `${input.resolved}/${input.eligible} активов · ${input.complete ? 'полное' : 'неполное'} покрытие` : 'Покрытие источника неизвестно', source: input.source, freshness: input.freshness, limitations: ['Низкое покрытие означает потенциально неполный календарь.', 'Отсутствующие выплаты не превращаются в 0 ₽ или утверждение «выплат нет».'] }
}
