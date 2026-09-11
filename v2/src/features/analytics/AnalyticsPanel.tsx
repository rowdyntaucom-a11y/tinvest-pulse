import { useMemo } from 'react'
import type { PortfolioSnapshot } from '../../lib/portfolioApi'
import { ANALYTICS_METHOD, calculatePortfolioAnalytics } from './metrics'

type Props = { snapshot: PortfolioSnapshot }

const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const num = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

function valueOrDash(value: number | null, suffix = '') {
  return value == null || !Number.isFinite(value) ? '—' : `${num.format(value)}${suffix}`
}

export function AnalyticsPanel({ snapshot }: Props) {
  const analytics = useMemo(
    () => calculatePortfolioAnalytics(snapshot.history, snapshot.positionDetails, snapshot.riskFreeRate),
    [snapshot.history, snapshot.positionDetails, snapshot.riskFreeRate],
  )

  const early = analytics.sampleQuality !== 'normal'

  return (
    <section className="analytics-shell">
      <article className="health-card">
        <div className="health-card__head">
          <div>
            <span className="eyebrow">HEALTH SCORE · ПРОЗРАЧНАЯ МЕТОДИКА</span>
            <h2>ЗДОРОВЬЕ ПОРТФЕЛЯ</h2>
            <p>Скор складывается только из видимых компонентов. Методика версионируется — без чёрного ящика.</p>
          </div>
          <div className="health-score">
            <strong>{analytics.healthScore ?? '—'}</strong><span>/100</span>
            <small>{ANALYTICS_METHOD}</small>
          </div>
        </div>

        {early && (
          <div className="analytics-notice">
            Предварительная оценка: в истории {analytics.sampleDays} дневных доходностей. Для устойчивой риск-статистики желательно 60+.
          </div>
        )}

        <div className="health-components">
          {analytics.components.map(component => {
            const ratio = component.points == null ? 0 : component.points / component.maxPoints
            return (
              <div className="health-component" key={component.key}>
                <div className="health-component__top">
                  <span>{component.label}</span>
                  <strong>{component.points == null ? '—' : `${component.points.toFixed(1)} / ${component.maxPoints}`}</strong>
                </div>
                <div className="health-bar"><i style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }} /></div>
                <small>{component.note}</small>
              </div>
            )
          })}
        </div>
      </article>

      <div className="analytics-metrics-grid">
        <article className="analytics-metric">
          <span>MAX DRAWDOWN</span>
          <strong>{analytics.maxDrawdown == null ? '—' : `−${pct.format(analytics.maxDrawdown * 100)}%`}</strong>
          <small>Худшая просадка от локального пика</small>
        </article>
        <article className="analytics-metric">
          <span>ВОЛАТИЛЬНОСТЬ</span>
          <strong>{analytics.volatilityAnnual == null ? '—' : `${pct.format(analytics.volatilityAnnual * 100)}%`}</strong>
          <small>Годовая σ по дневным TWR-доходностям</small>
        </article>
        <article className="analytics-metric">
          <span>SHARPE</span>
          <strong>{valueOrDash(analytics.sharpe)}</strong>
          <small>Безрисковая ставка: {snapshot.riskFreeRate == null ? '—' : `${pct.format(snapshot.riskFreeRate)}% ЦБ`}</small>
        </article>
        <article className="analytics-metric analytics-metric--accent">
          <span>SORTINO</span>
          <strong>{valueOrDash(analytics.sortino)}</strong>
          <small>Штрафует только доходности ниже минимально приемлемой</small>
        </article>
        <article className="analytics-metric">
          <span>HHI</span>
          <strong>{valueOrDash(analytics.hhi)}</strong>
          <small>Чем ниже, тем меньше концентрация</small>
        </article>
        <article className="analytics-metric analytics-metric--accent">
          <span>ЭКВИВАЛЕНТ ПОЗИЦИЙ</span>
          <strong>{analytics.effectivePositions == null ? '—' : num.format(analytics.effectivePositions)}</strong>
          <small>1 / HHI — понятная мера диверсификации</small>
        </article>
      </div>

      <article className="method-card">
        <div>
          <span className="eyebrow">МЕТОДИКА · {analytics.method}</span>
          <h3>Что именно считает система</h3>
        </div>
        <div className="method-grid">
          <p><strong>HHI</strong><span>Σ w² по текущим рыночным долям позиций.</span></p>
          <p><strong>Sharpe</strong><span>Средняя дневная сверхдоходность / σ, годовая шкала √252.</span></p>
          <p><strong>Sortino</strong><span>Та же сверхдоходность, но риск — только отклонения ниже ставки ЦБ.</span></p>
          <p><strong>Health</strong><span>25% HHI, 20% просадка, 20% σ, 15% классы активов, 20% Sharpe.</span></p>
        </div>
        <footer>
          Покрытие расчёта: {analytics.healthCoverage}/100 · классов активов: {analytics.assetClassCount || '—'} · дневных доходностей: {analytics.sampleDays}
        </footer>
      </article>
    </section>
  )
}
