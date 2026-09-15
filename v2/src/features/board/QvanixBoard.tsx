import { useMemo } from 'react'
import type { PortfolioAnalytics } from '../analytics/metrics'
import { usePayoutSnapshot } from '../../lib/payoutSnapshot'
import type { PortfolioSnapshot } from '../../lib/portfolioApi'
import type { UiModuleId, UiWorkspace } from '../../lib/uiPreferences'
import { MetricSparkline } from '../shared/MetricSparkline'
import './qvanixBoard.css'
import { ContextHelpTerm } from '../help/ContextHelpTerm'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' })

type BoardDestination = {
  workspace: Exclude<UiWorkspace, 'board'>
  analyticsView?: 'overview' | 'risk' | 'health'
}

type BoardModule = {
  id: UiModuleId
  eyebrow: string
  label: string
  value: string
  note: string
  tone: 'mint' | 'amber' | 'blue' | 'neutral'
  destination: BoardDestination | null
  sparklineValues?: Array<number | null>
  sparklineLabel?: string
}

type Props = {
  snapshot: PortfolioSnapshot
  analytics: PortfolioAnalytics
  xirrPercent: number | null
  pinnedModules: UiModuleId[]
  onNavigate: (destination: BoardDestination) => void
}

function signedMoney(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${money.format(Math.abs(value))} ₽`
}

function signedPercent(value: number | null, ratio = true) {
  if (value == null || !Number.isFinite(value)) return '—'
  const normalized = ratio ? value * 100 : value
  const sign = normalized > 0 ? '+' : normalized < 0 ? '−' : ''
  return `${sign}${pct.format(Math.abs(normalized))}%`
}

function safeDate(value: string | null | undefined) {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

function snapshotStamp(value: string | null) {
  const date = safeDate(value)
  if (!date) return 'время не подтверждено'
  return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function workspaceLabel(workspace: BoardDestination['workspace']) {
  if (workspace === 'portfolio') return 'Портфель'
  if (workspace === 'analytics') return 'Аналитику'
  if (workspace === 'income') return 'Доход'
  if (workspace === 'dna') return 'DNA'
  return 'раздел'
}

export function QvanixBoard({ snapshot, analytics, xirrPercent, pinnedModules, onNavigate }: Props) {
  const { calendar, loading: incomeLoading } = usePayoutSnapshot(true)

  const modules = useMemo(() => {
    const next = calendar?.next ?? null
    const nextDate = safeDate(next?.date)
    const nextAmount = next?.gross != null && Number.isFinite(next.gross) ? next.gross : null
    const actualAvailable = calendar?.available === true && calendar.actual?.observation?.available === true
    const actualNet = actualAvailable && Number.isFinite(calendar?.actual?.totalNet) ? calendar!.actual.totalNet : null
    const actualYear = actualAvailable && calendar?.actual?.year ? calendar.actual.year : null
    const valueHistory = snapshot.history.map(point => point.value)
    const twrHistory = snapshot.history.map(point => point.portfolio)

    const all: Record<UiModuleId, BoardModule> = {
      'portfolio.value': {
        id: 'portfolio.value', eyebrow: 'ПОРТФЕЛЬ', label: 'КАПИТАЛ',
        value: snapshot.value > 0 ? `${money.format(snapshot.value)} ₽` : '—',
        note: `${snapshot.positions} позиций · данные ${snapshot.source === 'dashboard' ? 'счёта' : snapshot.source === 'portfolio' ? 'портфеля' : 'резервного источника'}`,
        tone: 'mint', destination: { workspace: 'portfolio' },
        sparklineValues: valueHistory,
        sparklineLabel: 'Стоимость портфеля · последние 30 доступных дневных точек',
      },
      'portfolio.pnl': {
        id: 'portfolio.pnl', eyebrow: 'ПО ДАННЫМ БРОКЕРА', label: 'ДЕНЕЖНЫЙ РЕЗУЛЬТАТ',
        value: signedMoney(snapshot.profit),
        note: `текущий P/L · ${signedPercent(snapshot.profitPct, false)}`,
        tone: snapshot.profit >= 0 ? 'mint' : 'amber', destination: { workspace: 'portfolio' },
      },
      'analytics.twr': {
        id: 'analytics.twr', eyebrow: `TWR · v${analytics.calcVersion}`, label: 'СТРАТЕГИЯ',
        value: signedPercent(analytics.twr),
        note: analytics.historyPoints ? `${analytics.historyPoints} точек · без влияния размера пополнений` : 'история ещё не готова',
        tone: 'blue', destination: { workspace: 'analytics', analyticsView: 'overview' },
        sparklineValues: twrHistory,
        sparklineLabel: 'TWR-индекс · последние 30 доступных дневных точек',
      },
      'analytics.xirr': {
        id: 'analytics.xirr', eyebrow: 'XIRR', label: 'ЛИЧНАЯ ДОХОДНОСТЬ',
        value: xirrPercent == null ? '—' : signedPercent(xirrPercent, false),
        note: 'годовая · с учётом дат денежных потоков',
        tone: 'blue', destination: { workspace: 'analytics', analyticsView: 'overview' },
      },
      'analytics.health': {
        id: 'analytics.health', eyebrow: `СОСТОЯНИЕ · v${analytics.healthVersion}`, label: 'ЗДОРОВЬЕ ПОРТФЕЛЯ',
        value: analytics.healthScore == null ? '—' : `${Math.round(analytics.healthScore)}/100`,
        note: analytics.historyDays >= 365 ? 'история достаточной длины' : `${analytics.historyDays || 0} дней · предварительная оценка`,
        tone: 'mint', destination: { workspace: 'analytics', analyticsView: 'health' },
      },
      'analytics.risk': {
        id: 'analytics.risk', eyebrow: 'РИСК', label: 'МАКС. ПРОСАДКА',
        value: analytics.maxDrawdown == null ? '—' : `−${pct.format(analytics.maxDrawdown * 100)}%`,
        note: analytics.volatility == null ? 'волатильность недоступна' : `волатильность ${pct.format(analytics.volatility * 100)}% · по истории`,
        tone: 'amber', destination: { workspace: 'analytics', analyticsView: 'risk' },
      },
      'income.fact': {
        id: 'income.fact', eyebrow: 'ДОХОД · ФАКТ', label: actualYear ? `ПОЛУЧЕНО ${actualYear}` : 'ПОЛУЧЕНО',
        value: actualNet == null ? '—' : `${money.format(actualNet)} ₽`,
        note: incomeLoading ? 'обновляем данные выплат' : actualAvailable ? 'на руки · подтверждённый период наблюдения' : 'нет подтверждённого периода наблюдения',
        tone: 'mint', destination: { workspace: 'income' },
      },
      'income.next': {
        id: 'income.next', eyebrow: 'ДОХОД · 12 МЕСЯЦЕВ', label: 'БЛИЖАЙШАЯ ВЫПЛАТА',
        value: nextAmount == null ? '—' : `${money2.format(nextAmount)} ₽`,
        note: nextDate ? `${next?.ticker || next?.name || '—'} · ${dateFmt.format(nextDate)} · до налога, подтверждённый календарь` : 'подтверждённое событие не найдено',
        tone: 'blue', destination: { workspace: 'income' },
      },
      'macro.keyRate': {
        id: 'macro.keyRate', eyebrow: 'БАНК РОССИИ', label: 'КЛЮЧЕВАЯ СТАВКА',
        value: snapshot.riskFreeRate == null ? '—' : `${number.format(snapshot.riskFreeRate)}%`,
        note: snapshot.riskFreeRateDate ? `данные на ${snapshot.riskFreeRateDate}` : 'дата ставки не подтверждена',
        tone: 'neutral', destination: null,
      },
    }

    return pinnedModules.map(id => all[id]).filter((item): item is BoardModule => Boolean(item))
  }, [analytics, calendar, incomeLoading, pinnedModules, snapshot, xirrPercent])

  const sourceLabel = snapshot.source === 'dashboard' ? 'ДАННЫЕ СЧЁТА' : snapshot.source === 'portfolio' ? 'ПОРТФЕЛЬ' : 'РЕЗЕРВНЫЙ ИСТОЧНИК'
  const historyState = analytics.historyPoints > 0 ? `${analytics.historyPoints} точек / ${analytics.historyDays} д.` : 'истории пока нет'
  const payoutCoverage = calendar?.coverage?.coverageRatio != null && Number.isFinite(calendar.coverage.coverageRatio)
    ? `${pct.format(calendar.coverage.coverageRatio * 100)}%`
    : '—'

  return (
    <div className="qv-board">
      <section className="qv-board__hero">
        <div className="qv-board__hero-copy">
          <span className="qv-board__kicker">КАПИТАЛ · {snapshot.accountName || 'ПОРТФЕЛЬ'}</span>
          <div className="qv-board__capital"><strong>{money.format(snapshot.value)}</strong><span>₽</span></div>
          <div className="qv-board__pnl"><b className={snapshot.profit > 0 ? 'is-positive' : snapshot.profit < 0 ? 'is-negative' : ''}>{signedMoney(snapshot.profit)}</b><small>накопленный P/L брокера · не изменение за день</small></div>
          <p>{sourceLabel} · {snapshotStamp(snapshot.updatedAt)}</p>
        </div>
        <div className="qv-board__trace" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="qv-board__rail" aria-label="Контекст данных">
        <article><span>ИСТОЧНИК</span><strong>{sourceLabel}</strong><small>{snapshotStamp(snapshot.updatedAt)}</small></article>
        <article><span>ИСТОРИЯ</span><strong>{historyState}</strong><small>{analytics.historyIntegrity === 'OK' ? 'данные согласованы' : 'есть расхождения'}</small></article>
        <article><span>ПОКРЫТИЕ ВЫПЛАТ <ContextHelpTerm topic="payoutCoverage" /></span><strong>{payoutCoverage}</strong><small>{calendar?.integrity?.complete ? 'календарь полный' : 'покрытие рассчитано явно'}</small></article>
        <article><span>КЛЮЧЕВАЯ СТАВКА</span><strong>{snapshot.riskFreeRate == null ? '—' : `${number.format(snapshot.riskFreeRate)}%`}</strong><small>{snapshot.nextRateMeeting ? `заседание ${snapshot.nextRateMeeting}` : 'дата следующего заседания —'}</small></article>
      </section>

      <section className="qv-board__modules">
        <header>
          <div><span>ИЗБРАННЫЕ ПОКАЗАТЕЛИ</span><strong>МОЯ ПАНЕЛЬ</strong></div>
          <small>{modules.length}/6 · настраивается через Q</small>
        </header>
        <div className="qv-board__module-grid">
          {modules.map(module => (
            <button
              type="button"
              key={module.id}
              className={`qv-board-card is-${module.tone}`}
              onClick={() => module.destination && onNavigate(module.destination)}
              disabled={!module.destination}
              title={module.destination ? `Открыть ${workspaceLabel(module.destination.workspace)}` : module.note}
            >
              <span>{module.eyebrow}</span>
              <strong>{module.value}</strong>
              {module.sparklineValues && module.sparklineLabel ? (
                <MetricSparkline values={module.sparklineValues} label={module.sparklineLabel} />
              ) : null}
              <b>{module.label}</b>
              <small>{module.note}</small>
              {module.destination ? <i aria-hidden="true">↗</i> : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
