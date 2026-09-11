import { useEffect, useMemo, useState } from 'react'
import { WorldStage } from './features/world/WorldStage'
import { HistoryChart } from './features/portfolio/HistoryChart'
import { PortfolioWorkspace } from './features/portfolio/PortfolioWorkspace'
import { calculatePortfolioAnalytics } from './features/analytics/metrics'
import { IncomeWorkspace } from './features/income/IncomeWorkspace'
import { loadPortfolio, loadPortfolioHistory, type PortfolioSnapshot } from './lib/portfolioApi'

const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const pctPlain = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

type Tab = 'portfolio' | 'analytics' | 'income' | 'dna'
type AnalyticsView = 'overview' | 'risk' | 'health'

function annualPct(value: number | null) {
  if (value == null || !Number.isFinite(value)) return null
  return Math.abs(value) <= 5 ? value * 100 : value
}

function signedRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctSigned.format(value * 100)}%`
}

function plainRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctPlain.format(value * 100)}%`
}

const EMPTY: PortfolioSnapshot = {
  accountName: 'Кряхтящий фонд', value: 0, profit: 0, profitPct: 0, passiveIncome: 0,
  averageMonthlyPassiveIncome: 0, averageAnnualPassiveIncome: 0, positions: 0, positionItems: [],
  xirr: null, cagr: null, riskFreeRate: null, riskFreeRateDate: null,
  startDate: null, updatedAt: null, history: [], source: 'fallback',
}

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(EMPTY)
  const [tab, setTab] = useState<Tab>('portfolio')
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>('overview')

  useEffect(() => {
    let active = true
    const refresh = async () => {
      const next = await loadPortfolio()
      if (active) setSnapshot(current => ({ ...next, history: current.history.length ? current.history : next.history }))
    }
    void refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      const history = await loadPortfolioHistory()
      if (active && history.length) setSnapshot(current => ({ ...current, history }))
    }
    const timer = window.setTimeout(() => void load(), 700)
    return () => { active = false; window.clearTimeout(timer) }
  }, [])

  const analytics = useMemo(
    () => calculatePortfolioAnalytics(snapshot.history, snapshot.positionItems, snapshot.riskFreeRate),
    [snapshot.history, snapshot.positionItems, snapshot.riskFreeRate],
  )

  const xirr = annualPct(snapshot.xirr)
  const startDate = snapshot.startDate ? new Date(snapshot.startDate).toLocaleDateString('ru-RU') : '—'
  const analyticsMature = analytics.historyDays >= 365
  const historyLabel = analytics.historyDays ? `${analytics.historyDays} дней` : 'нет истории'

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="eyebrow">QVANIX · PORTFOLIO INTELLIGENCE</div>
          <h1>QVANIX</h1>
          <p>{snapshot.accountName} · финансовое ядро, аналитика и живой мир без лишнего дублирования.</p>
        </div>
        <nav className="topbar__nav" aria-label="Разделы">
          <button onClick={() => setTab('portfolio')} className={`chip ${tab === 'portfolio' ? 'chip--active' : ''}`}>ПОРТФЕЛЬ</button>
          <button onClick={() => setTab('analytics')} className={`chip ${tab === 'analytics' ? 'chip--active' : ''}`}>АНАЛИТИКА</button>
          <button onClick={() => setTab('income')} className={`chip ${tab === 'income' ? 'chip--active' : ''}`}>ДОХОД</button>
          <button onClick={() => setTab('dna')} className={`chip ${tab === 'dna' ? 'chip--active' : ''}`}>DNA</button>
        </nav>
      </header>

      <section className={`app-view ${tab}-view`}>
        {tab === 'portfolio' && <PortfolioWorkspace snapshot={snapshot} />}

        {tab === 'analytics' && (
          <div className="analytics-layout">
            <nav className="subnav" aria-label="Разделы аналитики">
              <button onClick={() => setAnalyticsView('overview')} className={analyticsView === 'overview' ? 'subnav--active' : ''}>ОБЗОР</button>
              <button onClick={() => setAnalyticsView('risk')} className={analyticsView === 'risk' ? 'subnav--active' : ''}>РИСК</button>
              <button onClick={() => setAnalyticsView('health')} className={analyticsView === 'health' ? 'subnav--active' : ''}>HEALTH</button>
              <span className={analyticsMature ? 'sample-badge sample-badge--mature' : 'sample-badge'}>{analyticsMature ? '12M' : `PREVIEW · ${historyLabel}`}</span>
            </nav>

            {analyticsView === 'overview' && (
              <div className="analytics-overview">
                <section className="analytics-topline">
                  <article className="score-card">
                    <span className="metric-label">HEALTH SCORE · v{analytics.healthVersion}</span>
                    <strong>{analytics.healthScore == null ? '—' : Math.round(analytics.healthScore)}</strong>
                    <small>{analyticsMature ? 'Расчёт на зрелой истории' : `Предварительно · история ${historyLabel}`}</small>
                  </article>
                  <article className="metric-card"><span className="metric-label">XIRR · ЛИЧНАЯ</span><strong>{xirr == null ? '—' : `${pctSigned.format(xirr)}%`}</strong><small>Учитывает даты денежных потоков</small></article>
                  <article className="metric-card"><span className="metric-label">TWR · ПОРТФЕЛЬ</span><strong>{signedRatio(analytics.twr)}</strong><small>Доходность без влияния размера довнесений</small></article>
                </section>

                <section className="panel history-panel">
                  <div className="panel-head">
                    <div><span className="eyebrow">TWR INDEX</span><h2>ПОРТФЕЛЬ VS IMOEX</h2></div>
                    <small>{analytics.historyPoints ? `${analytics.historyPoints} точек` : 'история загружается'}</small>
                  </div>
                  <HistoryChart points={snapshot.history} />
                </section>
              </div>
            )}

            {analyticsView === 'risk' && (
              <div className="analytics-risk-view">
                <section className="risk-grid">
                  <article className="risk-card"><span>MAX DRAWDOWN</span><strong>{signedRatio(analytics.maxDrawdown == null ? null : -analytics.maxDrawdown)}</strong><small>От локального пика</small></article>
                  <article className="risk-card"><span>ВОЛАТИЛЬНОСТЬ</span><strong>{plainRatio(analytics.volatility)}</strong><small>σ дневных доходностей × √252</small></article>
                  <article className="risk-card"><span>SHARPE</span><strong>{analytics.sharpe == null ? '—' : number.format(analytics.sharpe)}</strong><small>{snapshot.riskFreeRate == null ? 'Нет ставки ЦБ — не считаем' : `Rf ${number.format(snapshot.riskFreeRate)}%`}</small></article>
                  <article className="risk-card"><span>SORTINO</span><strong>{analytics.sortino == null ? '—' : number.format(analytics.sortino)}</strong><small>Downside deviation относительно MAR (Rf)</small></article>
                  <article className="risk-card"><span>HHI</span><strong>{analytics.hhi == null ? '—' : number.format(analytics.hhi)}</strong><small>Σ доля²; меньше = равномернее</small></article>
                  <article className="risk-card"><span>ЭКВ. ПОЗИЦИЙ</span><strong>{analytics.effectivePositions == null ? '—' : number.format(analytics.effectivePositions)}</strong><small>1 / HHI</small></article>
                </section>
                <section className="panel analytics-note">
                  <span className="eyebrow">КАЧЕСТВО ВЫБОРКИ</span>
                  <h2>{analyticsMature ? 'ИСТОРИЯ ДОСТАТОЧНА' : 'МЕТРИКИ ПРЕДВАРИТЕЛЬНЫЕ'}</h2>
                  <p>Сейчас доступно {historyLabel}. Годовая волатильность, Sharpe и Sortino математически считаются, но до накопления 12 месяцев показываются как предварительные, а не как зрелая характеристика риска.</p>
                </section>
              </div>
            )}

            {analyticsView === 'health' && (
              <section className="panel health-panel">
                <div className="panel-head"><div><span className="eyebrow">МЕТОДИКА v1.0</span><h2>HEALTH SCORE</h2></div><small>{analyticsMature ? 'полная выборка' : 'предварительно'}</small></div>
                <div className="health-components">
                  {analytics.components.map(component => (
                    <div className="health-row" key={component.key}>
                      <div><strong>{component.label}</strong><span>{component.note}</span></div>
                      <div className="health-weight">{Math.round(component.weight * 100)}%</div>
                      <div className="health-points">{component.points == null ? '—' : `${number.format(component.points)} п.`}</div>
                      <i><span style={{ width: `${(component.normalized ?? 0) * 100}%` }} /></i>
                    </div>
                  ))}
                </div>
                <p className="method-note">Скор прозрачен и версионируется. На истории короче 12 месяцев компоненты риска остаются видимыми, но весь Health помечается как предварительный.</p>
              </section>
            )}
          </div>
        )}

        {tab === 'income' && (
          <IncomeWorkspace
            passiveIncome={snapshot.passiveIncome}
            averageMonthlyPassiveIncome={snapshot.averageMonthlyPassiveIncome}
            startDate={startDate}
            positions={snapshot.positionItems}
          />
        )}

        {tab === 'dna' && (
          <div className="dna-layout">
            <section className="world-panel world-panel--view">
              <div className="world-panel__head">
                <div><span className="eyebrow">QVANIX DNA · PIXIJS / WEBGL</span><h2>ЖИВОЙ МИР</h2></div>
                <div className="dna-state"><span>УРОВЕНЬ</span><strong>XP</strong><small>рублёвые пороги отключены</small></div>
              </div>
              <div className="world-frame"><WorldStage level={1} /></div>
              <div className="dna-next">
                <span>СЛЕДУЮЩИЙ ЭТАП</span>
                <strong>Analytics → XP Engine → события мира</strong>
                <p>Уровень будет зависеть от относительных метрик и дисциплины, а не от размера капитала. Текущий WebGL-кадр оставлен только как технический двигатель до полноценной перестройки мира.</p>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}
