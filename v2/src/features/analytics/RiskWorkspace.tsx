import { useMemo, useState } from 'react'
import type { AnalyticsHistoryPoint, PortfolioAnalytics } from './metrics'
import { calculateRelativePerformance } from './relativePerformance'
import './relativePerformance.css'

const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const pctPlain = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

type Mode = 'portfolio' | 'benchmark'

type Props = {
  analytics: PortfolioAnalytics
  history: AnalyticsHistoryPoint[]
  riskFreeRate: number | null
  analyticsMature: boolean
  historyLabel: string
}

function signedRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctSigned.format(value * 100)}%`
}

function plainRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctPlain.format(value * 100)}%`
}

export function RiskWorkspace({ analytics, history, riskFreeRate, analyticsMature, historyLabel }: Props) {
  const [mode, setMode] = useState<Mode>('portfolio')
  const relative = useMemo(() => calculateRelativePerformance(history), [history])

  return (
    <div className="analytics-risk-view">
      <div className="risk-modebar" aria-label="Режим риск-аналитики">
        <span>РЕЖИМ</span>
        <button className={mode === 'portfolio' ? 'is-active' : ''} onClick={() => setMode('portfolio')}>ПОРТФЕЛЬ</button>
        <button className={mode === 'benchmark' ? 'is-active' : ''} onClick={() => setMode('benchmark')}>VS IMOEX</button>
        <small>{mode === 'portfolio' ? historyLabel : `${relative.overlapPoints} общих точек`}</small>
      </div>

      {mode === 'portfolio' ? (
        <>
          <section className="risk-grid">
            <article className="risk-card"><span>MAX DRAWDOWN</span><strong>{signedRatio(analytics.maxDrawdown == null ? null : -analytics.maxDrawdown)}</strong><small>От локального пика</small></article>
            <article className="risk-card"><span>ВОЛАТИЛЬНОСТЬ</span><strong>{plainRatio(analytics.volatility)}</strong><small>σ дневных доходностей × √252</small></article>
            <article className="risk-card"><span>SHARPE</span><strong>{analytics.sharpe == null ? '—' : number.format(analytics.sharpe)}</strong><small>{riskFreeRate == null ? 'Нет ставки ЦБ — не считаем' : `Rf ${number.format(riskFreeRate)}%`}</small></article>
            <article className="risk-card"><span>SORTINO</span><strong>{analytics.sortino == null ? '—' : number.format(analytics.sortino)}</strong><small>Downside deviation относительно MAR (Rf)</small></article>
            <article className="risk-card"><span>HHI</span><strong>{analytics.hhi == null ? '—' : number.format(analytics.hhi)}</strong><small>Σ доля²; меньше = равномернее</small></article>
            <article className="risk-card"><span>ЭКВ. ПОЗИЦИЙ</span><strong>{analytics.effectivePositions == null ? '—' : number.format(analytics.effectivePositions)}</strong><small>1 / HHI</small></article>
          </section>
          <section className="panel analytics-note">
            <span className="eyebrow">КАЧЕСТВО ВЫБОРКИ</span>
            <h2>{analyticsMature ? 'ИСТОРИЯ ДОСТАТОЧНА' : 'МЕТРИКИ ПРЕДВАРИТЕЛЬНЫЕ'}</h2>
            <p>Сейчас доступно {historyLabel}. Годовая волатильность, Sharpe и Sortino математически считаются, но до накопления 12 месяцев показываются как предварительные, а не как зрелая характеристика риска.</p>
          </section>
        </>
      ) : (
        <>
          <section className="risk-grid relative-risk-grid">
            <article className="risk-card"><span>ПОРТФЕЛЬ · OVERLAP</span><strong>{signedRatio(relative.portfolioReturn)}</strong><small>{relative.periodDays ? `${relative.periodDays} дней общей выборки` : 'общая выборка не готова'}</small></article>
            <article className="risk-card"><span>IMOEX · OVERLAP</span><strong>{signedRatio(relative.benchmarkReturn)}</strong><small>тот же диапазон дат</small></article>
            <article className="risk-card"><span>EXCESS RETURN</span><strong>{signedRatio(relative.excessReturn)}</strong><small>портфель минус IMOEX</small></article>
            <article className="risk-card"><span>TRACKING ERROR</span><strong>{plainRatio(relative.trackingError)}</strong><small>σ активных дневных доходностей × √252</small></article>
            <article className="risk-card"><span>INFORMATION RATIO</span><strong>{relative.informationRatio == null ? '—' : number.format(relative.informationRatio)}</strong><small>средняя активная доходность / tracking error</small></article>
            <article className="risk-card"><span>BETA</span><strong>{relative.beta == null ? '—' : number.format(relative.beta)}</strong><small>{relative.correlation == null ? 'корреляция скрыта до достаточной выборки' : `корреляция ${number.format(relative.correlation)}`}</small></article>
          </section>
          <section className="panel analytics-note relative-note">
            <span className="eyebrow">BENCHMARK QUALITY</span>
            <h2>{relative.status === 'mature' ? 'ЗРЕЛАЯ СРАВНИМАЯ ВЫБОРКА' : relative.status === 'preview' ? 'ПРЕДВАРИТЕЛЬНО' : 'КОРОТКАЯ ИСТОРИЯ'}</h2>
            <p>{relative.note} Периодная доходность показывается уже при двух общих точках; Tracking Error, Information Ratio, Beta и корреляция не рассчитываются на слишком короткой истории.</p>
          </section>
        </>
      )}
    </div>
  )
}
