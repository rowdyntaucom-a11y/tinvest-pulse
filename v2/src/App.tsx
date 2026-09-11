import { useEffect, useMemo, useState } from 'react'
import { WorldStage } from './features/world/WorldStage'
import { HistoryChart } from './features/portfolio/HistoryChart'
import { IncomePanel } from './features/income/IncomePanel'
import { calculatePortfolioAnalytics } from './features/analytics/metrics'
import { loadPortfolio, loadPortfolioHistory, type PortfolioSnapshot, type PositionSnapshot } from './lib/portfolioApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const pctPlain = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

const POSITION_PAGE_SIZE = 5

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

function assetTypeLabel(type: string) {
  const key = String(type || '').toLowerCase()
  if (key.includes('bond')) return 'Облигации'
  if (key.includes('share') || key.includes('stock')) return 'Акции'
  if (key.includes('etf') || key.includes('fund')) return 'Фонды'
  if (key.includes('currency')) return 'Валюта'
  if (key.includes('future')) return 'Фьючерсы'
  return 'Прочее'
}

const EMPTY: PortfolioSnapshot = {
  accountName: 'Кряхтящий фонд', value: 0, profit: 0, profitPct: 0, passiveIncome: 0,
  averageMonthlyPassiveIncome: 0, averageAnnualPassiveIncome: 0, positions: 0, positionItems: [],
  xirr: null, cagr: null, riskFreeRate: null, riskFreeRateDate: null,
  startDate: null, updatedAt: null, history: [], source: 'fallback',
}

function PositionList({ positions }: { positions: PositionSnapshot[] }) {
  if (!positions.length) return <div className="empty-state">Позиции загружаются…</div>
  return (
    <div className="positions-list">
      {positions.map(position => {
        const ticker = position.ticker || position.name || '—'
        const sameName = !position.name || position.name.trim().toUpperCase() === ticker.trim().toUpperCase()
        const subtitle = sameName ? assetTypeLabel(position.instrumentType) : position.name
        return (
          <div className="position-row" key={`${ticker}-${position.currentValue}`}>
            <div className="position-main">
              <strong>{ticker}</strong>
              <span>{subtitle}</span>
            </div>
            <div className="position-weight">
              <span>{pctPlain.format(position.weight * 100)}%</span>
              <i><b style={{ width: `${Math.min(100, position.weight * 100)}%` }} /></i>
            </div>
            <div className="position-value">{money.format(position.currentValue)} ₽</div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(EMPTY)
  const [tab, setTab] = useState<Tab>('portfolio')
  const [analyticsView, setAnalyticsView] = useState<AnalyticsView>('overview')
  const [positionPage, setPositionPage] = useState(0)

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

  const allocation = useMemo(() => {
    const groups = new Map<string, number>()
    for (const position of snapshot.positionItems) {
      const label = assetTypeLabel(position.instrumentType)
      groups.set(label, (groups.get(label) || 0) + position.currentValue)
    }
    const total = [...groups.values()].reduce((sum, value) => sum + value, 0)
    return [...groups.entries()]
      .map(([label, value]) => ({ label, value, weight: total > 0 ? value / total : 0 }))
      .sort((a, b) => b.value - a.value)
  }, [snapshot.positionItems])

  const positionPages = Math.max(1, Math.ceil(snapshot.positionItems.length / POSITION_PAGE_SIZE))
  const safePositionPage = Math.min(positionPage, positionPages - 1)
  const visiblePositions = snapshot.positionItems.slice(
    safePositionPage * POSITION_PAGE_SIZE,
    safePositionPage * POSITION_PAGE_SIZE + POSITION_PAGE_SIZE,
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
        {tab === 'portfolio' && (
          <div className="portfolio-layout">
            <section className="portfolio-summary">
              <article className="metric-card metric-card--hero">
                <span className="metric-label">КАПИТАЛ</span>
                <strong>{snapshot.value ? `${money.format(snapshot.value)} ₽` : '—'}</strong>
                <small className={snapshot.source !== 'fallback' ? 'status-live' : 'status-wait'}>{snapshot.source !== 'fallback' ? '● LIVE DATA' : '○ API WAIT'}</small>
              </article>
              <article className="metric-card">
                <span className="metric-label">ДЕНЕЖНЫЙ РЕЗУЛЬТАТ</span>
                <strong>{snapshot.value ? `${snapshot.profit >= 0 ? '+' : ''}${money.format(snapshot.profit)} ₽` : '—'}</strong>
                <small>{snapshot.value ? `${pctSigned.format(snapshot.profitPct)}% к внешним потокам` : 'ожидаем данные'}</small>
              </article>
              <article className="context-card">
                <span>СЧЁТ</span><strong>{snapshot.accountName}</strong>
                <span>СТАРТ</span><strong>{startDate}</strong>
                <span>ПОЗИЦИЙ</span><strong>{snapshot.positions || '—'}</strong>
              </article>
            </section>

            <section className="panel positions-panel">
              <div className="panel-head panel-head--paged">
                <div><span className="eyebrow">СОСТАВ</span><h2>ПОЗИЦИИ</h2></div>
                <div className="pager" aria-label="Страницы позиций">
                  <button disabled={safePositionPage === 0} onClick={() => setPositionPage(page => Math.max(0, page - 1))}>‹</button>
                  <span>{snapshot.positionItems.length ? `${safePositionPage + 1}/${positionPages}` : '—'}</span>
                  <button disabled={safePositionPage >= positionPages - 1} onClick={() => setPositionPage(page => Math.min(positionPages - 1, page + 1))}>›</button>
                </div>
              </div>
              <PositionList positions={visiblePositions} />
            </section>

            <section className="panel allocation-panel">
              <div className="panel-head"><div><span className="eyebrow">СТРУКТУРА</span><h2>КЛАССЫ АКТИВОВ</h2></div></div>
              <div className="allocation-list">
                {allocation.length ? allocation.slice(0, 4).map(item => (
                  <div className="allocation-row" key={item.label}>
                    <div><strong>{item.label}</strong><span>{money.format(item.value)} ₽</span></div>
                    <b>{pctPlain.format(item.weight * 100)}%</b>
                    <i><span style={{ width: `${item.weight * 100}%` }} /></i>
                  </div>
                )) : <div className="empty-state">Структура появится после загрузки позиций.</div>}
              </div>
            </section>
          </div>
        )}

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
          <IncomePanel
            passiveIncome={snapshot.passiveIncome}
            averageMonthlyPassiveIncome={snapshot.averageMonthlyPassiveIncome}
            startDate={startDate}
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
