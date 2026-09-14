import { useMemo, useState } from 'react'
import type { PortfolioAnalytics } from '../analytics/metrics'
import { usePayoutSnapshot } from '../../lib/payoutSnapshot'
import type { PortfolioSnapshot } from '../../lib/portfolioApi'
import type { UiModuleId, UiWorkspace } from '../../lib/uiPreferences'
import { MetricSparkline } from '../shared/MetricSparkline'
import './qvanixBoard.css'

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

type BoardLens = 'capital' | 'return' | 'income' | 'risk'

type BoardLensState = {
  label: string
  eyebrow: string
  value: string
  note: string
  destination: BoardDestination
  facts: Array<{ label: string; value: string }>
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
  return 'DNA'
}

export function QvanixBoard({ snapshot, analytics, xirrPercent, pinnedModules, onNavigate }: Props) {
  const { calendar, loading: incomeLoading } = usePayoutSnapshot(true)
  const [lens, setLens] = useState<BoardLens>('capital')

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
        note: `${snapshot.positions} позиций · ${snapshot.source.toUpperCase()}`,
        tone: 'mint', destination: { workspace: 'portfolio' },
        sparklineValues: valueHistory,
        sparklineLabel: 'Стоимость портфеля · последние 30 доступных дневных точек',
      },
      'portfolio.pnl': {
        id: 'portfolio.pnl', eyebrow: 'P/L БРОКЕРА', label: 'ДЕНЕЖНЫЙ РЕЗУЛЬТАТ',
        value: signedMoney(snapshot.profit),
        note: `текущий P/L · ${signedPercent(snapshot.profitPct, false)}`,
        tone: snapshot.profit >= 0 ? 'mint' : 'amber', destination: { workspace: 'portfolio' },
      },
      'analytics.twr': {
        id: 'analytics.twr', eyebrow: `TWR · v${analytics.calcVersion}`, label: 'СТРАТЕГИЯ',
        value: signedPercent(analytics.twr),
        note: analytics.historyPoints ? `${analytics.historyPoints} точек · без влияния размера пополнений` : 'история пока не готова',
        tone: 'blue', destination: { workspace: 'analytics', analyticsView: 'overview' },
        sparklineValues: twrHistory,
        sparklineLabel: 'TWR-индекс · последние 30 доступных дневных точек',
      },
      'analytics.xirr': {
        id: 'analytics.xirr', eyebrow: 'XIRR', label: 'ЛИЧНАЯ ДОХОДНОСТЬ',
        value: xirrPercent == null ? '—' : signedPercent(xirrPercent, false),
        note: 'годовая · учитывает даты денежных потоков',
        tone: 'blue', destination: { workspace: 'analytics', analyticsView: 'overview' },
      },
      'analytics.health': {
        id: 'analytics.health', eyebrow: `ОЦЕНКА · v${analytics.healthVersion}`, label: 'ЗДОРОВЬЕ ПОРТФЕЛЯ',
        value: analytics.healthScore == null ? '—' : `${Math.round(analytics.healthScore)}/100`,
        note: analytics.historyDays >= 365 ? 'зрелая история' : `${analytics.historyDays || 0} дней · предварительно`,
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
        note: incomeLoading ? 'обновляем данные о выплатах' : actualAvailable ? 'на руки · подтверждённый период' : 'период наблюдения ещё не подтверждён',
        tone: 'mint', destination: { workspace: 'income' },
      },
      'income.next': {
        id: 'income.next', eyebrow: 'ДОХОД · 12М', label: 'БЛИЖАЙШАЯ ВЫПЛАТА',
        value: nextAmount == null ? '—' : `${money2.format(nextAmount)} ₽`,
        note: nextDate ? `${next?.ticker || next?.name || '—'} · ${dateFmt.format(nextDate)} · до налога` : 'подтверждённая выплата не найдена',
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

  const lensState = useMemo<Record<BoardLens, BoardLensState>>(() => {
    const next = calendar?.next ?? null
    const nextDate = safeDate(next?.date)
    const actualAvailable = calendar?.available === true && calendar.actual?.observation?.available === true
    const actualNet = actualAvailable && Number.isFinite(calendar?.actual?.totalNet) ? calendar!.actual.totalNet : null
    const forecastNet = calendar?.available && Number.isFinite(calendar.forecast.net) ? calendar.forecast.net : null
    const payoutCoverage = calendar?.coverage?.coverageRatio != null && Number.isFinite(calendar.coverage.coverageRatio)
      ? `${pct.format(calendar.coverage.coverageRatio * 100)}%`
      : '—'

    return {
      capital: {
        label: 'КАПИТАЛ',
        eyebrow: 'Q-LENS · СОСТОЯНИЕ СЕЙЧАС',
        value: snapshot.value > 0 ? `${money.format(snapshot.value)} ₽` : '—',
        note: 'Текущая стоимость и денежный результат брокера. Доходность считается отдельно.',
        destination: { workspace: 'portfolio' },
        facts: [
          { label: 'P/L', value: signedMoney(snapshot.profit) },
          { label: 'P/L %', value: signedPercent(snapshot.profitPct, false) },
          { label: 'ПОЗИЦИЙ', value: `${snapshot.positions}` },
        ],
      },
      return: {
        label: 'ДОХОДНОСТЬ',
        eyebrow: `Q-LENS · TWR v${analytics.calcVersion}`,
        value: signedPercent(analytics.twr),
        note: 'TWR показывает результат стратегии без влияния размера пополнений; XIRR учитывает ваши денежные потоки.',
        destination: { workspace: 'analytics', analyticsView: 'overview' },
        facts: [
          { label: 'XIRR', value: xirrPercent == null ? '—' : signedPercent(xirrPercent, false) },
          { label: 'ИСТОРИЯ', value: analytics.historyDays ? `${analytics.historyDays} д.` : '—' },
          { label: 'ТОЧЕК', value: `${analytics.historyPoints || 0}` },
        ],
      },
      income: {
        label: 'ДОХОД',
        eyebrow: 'Q-LENS · ФАКТ + РАСПИСАНИЕ',
        value: actualNet == null ? '—' : `${money.format(actualNet)} ₽`,
        note: actualAvailable ? 'Уже полученное на руки показано отдельно от будущих подтверждённых выплат.' : 'Для факта пока нет подтверждённого периода наблюдения.',
        destination: { workspace: 'income' },
        facts: [
          { label: '12М НА РУКИ', value: forecastNet == null ? '—' : `${money.format(forecastNet)} ₽` },
          { label: 'СЛЕДУЮЩАЯ', value: nextDate ? dateFmt.format(nextDate) : '—' },
          { label: 'ПОКРЫТИЕ', value: payoutCoverage },
        ],
      },
      risk: {
        label: 'РИСК',
        eyebrow: `Q-LENS · ОЦЕНКА v${analytics.healthVersion}`,
        value: analytics.healthScore == null ? '—' : `${Math.round(analytics.healthScore)}/100`,
        note: analytics.historyDays >= 365 ? 'Истории достаточно для зрелой оценки риск-метрик.' : `Пока предварительно: накоплено ${analytics.historyDays || 0} дней истории.`,
        destination: { workspace: 'analytics', analyticsView: 'risk' },
        facts: [
          { label: 'ПРОСАДКА', value: analytics.maxDrawdown == null ? '—' : `−${pct.format(analytics.maxDrawdown * 100)}%` },
          { label: 'ВОЛАТ.', value: analytics.volatility == null ? '—' : `${pct.format(analytics.volatility * 100)}%` },
          { label: 'ОЦЕНКА', value: analytics.healthScore == null ? '—' : `${Math.round(analytics.healthScore)}` },
        ],
      },
    }
  }, [analytics, calendar, snapshot, xirrPercent])

  const health = analytics.healthScore == null ? 0 : Math.max(0, Math.min(100, analytics.healthScore))
  const sourceLabel = snapshot.source === 'dashboard' ? 'основной API' : snapshot.source === 'portfolio' ? 'API портфеля' : 'резервный источник'
  const historyState = analytics.historyPoints > 0 ? `${analytics.historyPoints} точек / ${analytics.historyDays} д.` : 'нет истории'
  const payoutCoverage = calendar?.coverage?.coverageRatio != null && Number.isFinite(calendar.coverage.coverageRatio)
    ? `${pct.format(calendar.coverage.coverageRatio * 100)}%`
    : '—'
  const activeLens = lensState[lens]

  return (
    <div className="qv-board">
      <section className="qv-board__hero">
        <div className="qv-board__hero-copy">
          <span className="qv-board__kicker">QVANIX · ПУЛЬТ</span>
          <h2>{snapshot.accountName || 'ПОРТФЕЛЬ'}</h2>
          <div className="qv-board__capital">
            <strong>{snapshot.value > 0 ? money.format(snapshot.value) : '—'}</strong>
            <span>₽</span>
          </div>
          <div className="qv-board__pnl">
            <b className={snapshot.profit > 0 ? 'is-positive' : snapshot.profit < 0 ? 'is-negative' : ''}>{signedMoney(snapshot.profit)}</b>
            <small>{signedPercent(snapshot.profitPct, false)} · P/L брокера</small>
          </div>
        </div>

        <div className="qv-board__health" style={{ '--qv-health': `${health * 3.6}deg` } as React.CSSProperties}>
          <div>
            <span>ОЦЕНКА</span>
            <strong>{analytics.healthScore == null ? '—' : Math.round(analytics.healthScore)}</strong>
            <small>{analytics.historyDays >= 365 ? 'ЗРЕЛАЯ' : 'ПРЕДВАР.'}</small>
          </div>
        </div>

        <div className="qv-board__trace" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="qv-board__rail" aria-label="Контекст данных">
        <article><span>ИСТОЧНИК</span><strong>{sourceLabel}</strong><small>{snapshotStamp(snapshot.updatedAt)}</small></article>
        <article><span>ИСТОРИЯ</span><strong>{historyState}</strong><small>{analytics.historyIntegrity === 'OK' ? 'данные согласованы' : 'есть конфликт'}</small></article>
        <article><span>ПОКРЫТИЕ ВЫПЛАТ</span><strong>{payoutCoverage}</strong><small>{calendar?.integrity?.complete ? 'расписание полное' : 'покрытие рассчитано'}</small></article>
        <article><span>КЛЮЧЕВАЯ СТАВКА</span><strong>{snapshot.riskFreeRate == null ? '—' : `${number.format(snapshot.riskFreeRate)}%`}</strong><small>{snapshot.nextRateMeeting ? `заседание ${snapshot.nextRateMeeting}` : 'следующее заседание —'}</small></article>
      </section>

      <section className="qv-board__lens" aria-label="Q-LENS">
        <div className="qv-board__lens-tabs" role="tablist" aria-label="Фокус панели">
          {(Object.keys(lensState) as BoardLens[]).map(key => (
            <button
              type="button"
              role="tab"
              aria-selected={lens === key}
              className={lens === key ? 'is-active' : ''}
              onClick={() => setLens(key)}
              key={key}
            >
              {lensState[key].label}
            </button>
          ))}
        </div>
        <div className="qv-board__lens-body">
          <div className="qv-board__lens-copy">
            <span>{activeLens.eyebrow}</span>
            <strong>{activeLens.value}</strong>
            <small>{activeLens.note}</small>
          </div>
          <div className="qv-board__lens-facts">
            {activeLens.facts.map(item => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}
          </div>
          <button type="button" className="qv-board__lens-open" onClick={() => onNavigate(activeLens.destination)}>ПОДРОБНЕЕ ↗</button>
        </div>
      </section>

      <section className="qv-board__modules">
        <header>
          <div><span>ИЗБРАННОЕ</span><strong>МОЯ ПАНЕЛЬ</strong></div>
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
