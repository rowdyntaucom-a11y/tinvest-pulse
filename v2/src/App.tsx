import { useEffect, useMemo, useState } from 'react'
import { WorldStage } from './features/world/WorldStage'
import { HistoryChart } from './features/portfolio/HistoryChart'
import { calculatePortfolioAnalytics } from './features/analytics/metrics'
import { loadPortfolio, loadPortfolioHistory, type PortfolioSnapshot, type PositionSnapshot } from './lib/portfolioApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

type Tab = 'portfolio' | 'analytics' | 'income' | 'dna'

function annualPct(value: number | null) {
  if (value == null || !Number.isFinite(value)) return null
  return Math.abs(value) <= 5 ? value * 100 : value
}

function pctRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pct.format(value * 100)}%`
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
      {positions.slice(0, 12).map(position => (
        <div className="position-row" key={`${position.ticker}-${position.name}`}>
          <div className="position-main">
            <strong>{position.ticker}</strong>
            <span>{position.name}</span>
          </div>
          <div className="position-weight">
            <span>{pct.format(position.weight * 100)}%</span>
            <i><b style={{ width: `${Math.min(100, position.weight * 100)}%` }} /></i>
          </div>
          <div className="position-value">{money.format(position.currentValue)} ₽</div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(EMPTY)
  const [tab, setTab] = useState<Tab>('portfolio')

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

  const xirr = annualPct(snapshot.xirr)
  const startDate = snapshot.startDate ? new Date(snapshot.startDate).toLocaleDateString('ru-RU') : '—'

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="eyebrow">TINVEST PULSE 2.0 · LIVE CORE</div>
          <h1>КРЯХТЯЩИЙ <span>ФОНД</span></h1>
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
                <small>{snapshot.value ? `${pct.format(snapshot.profitPct)}% к внешним потокам` : 'ожидаем данные'}</small>
              </article>
              <article className="context-card">
                <span>СЧЁТ</span><strong>{snapshot.accountName}</strong>
                <span>СТАРТ</span><strong>{startDate}</strong>
                <span>ПОЗИЦИЙ</span><strong>{snapshot.positions || '—'}</strong>
              </article>
            </section>

            <section className="panel positions-panel">
              <div className="panel-head">
                <div><span className="eyebrow">СОСТАВ</span><h2>ТЕКУЩИЕ ПОЗИЦИИ</h2></div>
                <small>{snapshot.positionItems.length ? `${snapshot.positionItems.length} активов` : 'загрузка'}</small>
              </div>
              <PositionList positions={snapshot.positionItems} />
            </section>

            <section className="panel allocation-panel">
              <div className="panel-head"><div><span className="eyebrow">СТРУКТУРА</span><h2>КЛАССЫ АКТИВОВ</h2></div></div>
              <div className="allocation-list">
                {allocation.length ? allocation.map(item => (
                  <div className="allocation-row" key={item.label}>
                    <div><strong>{item.label}</strong><span>{money.format(item.value)} ₽</span></div>
                    <b>{pct.format(item.weight * 100)}%</b>
                    <i><span style={{ width: `${item.weight * 100}%` }} /></i>
                  </div>
                )) : <div className="empty-state">Структура появится после загрузки позиций.</div>}
              </div>
            </section>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="analytics-layout">
            <section className="analytics-topline">
              <article className="score-card">
                <span className="metric-label">HEALTH SCORE · v{analytics.healthVersion}</span>
                <strong>{analytics.healthScore == null ? '—' : Math.round(analytics.healthScore)}</strong>
                <small>{analytics.healthScore == null ? 'Для полного скора нужны все компоненты' : 'Прозрачный композитный скор 0–100'}</small>
              </article>
              <article className="metric-card"><span className="metric-label">XIRR · ЛИЧНАЯ ДОХОДНОСТЬ</span><strong>{xirr == null ? '—' : `${pct.format(xirr)}%`}</strong><small>Money-weighted, учитывает даты пополнений</small></article>
              <article className="metric-card"><span className="metric-label">TWR · СРАВНЕНИЕ С РЫНКОМ</span><strong>{pctRatio(analytics.twr)}</strong><small>Не зависит от размера и времени довнесений</small></article>
            </section>

            <section className="panel history-panel">
              <div className="panel-head">
                <div><span className="eyebrow">ДОХОДНОСТЬ · TWR INDEX</span><h2>ПОРТФЕЛЬ VS IMOEX</h2></div>
                <small>{analytics.historyPoints ? `${analytics.historyPoints} точек · ${analytics.historyDays} дней` : 'история загружается'}</small>
              </div>
              <HistoryChart points={snapshot.history} />
            </section>

            <section className="risk-grid">
              <article className="risk-card"><span>MAX DRAWDOWN</span><strong>{pctRatio(analytics.maxDrawdown == null ? null : -analytics.maxDrawdown)}</strong><small>От локального пика</small></article>
              <article className="risk-card"><span>ВОЛАТИЛЬНОСТЬ</span><strong>{pctRatio(analytics.volatility)}</strong><small>Годовая, σ дневных доходностей × √252</small></article>
              <article className="risk-card"><span>SHARPE</span><strong>{analytics.sharpe == null ? '—' : number.format(analytics.sharpe)}</strong><small>{snapshot.riskFreeRate == null ? 'Нет ставки ЦБ — не считаем' : `Rf ${number.format(snapshot.riskFreeRate)}%`}</small></article>
              <article className="risk-card"><span>SORTINO</span><strong>{analytics.sortino == null ? '—' : number.format(analytics.sortino)}</strong><small>Штрафует только доходность ниже Rf</small></article>
              <article className="risk-card"><span>HHI</span><strong>{analytics.hhi == null ? '—' : number.format(analytics.hhi)}</strong><small>Σ доля²; меньше = равномернее</small></article>
              <article className="risk-card"><span>ЭКВ. ПОЗИЦИЙ</span><strong>{analytics.effectivePositions == null ? '—' : number.format(analytics.effectivePositions)}</strong><small>1 / HHI</small></article>
            </section>

            <section className="panel health-panel">
              <div className="panel-head"><div><span className="eyebrow">МЕТОДИКА v1.0</span><h2>ИЗ ЧЕГО СОБРАН HEALTH</h2></div><small>никакого чёрного ящика</small></div>
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
              <p className="method-note">История короче 12 месяцев не маскируется под годовую выборку: сейчас расчёты используют фактически доступный период ({analytics.historyDays || 0} дней). По мере накопления истории окно будет доведено до принятой 12-месячной методики.</p>
            </section>
          </div>
        )}

        {tab === 'income' && (
          <div className="income-layout">
            <section className="income-hero panel">
              <div><span className="eyebrow">ПАССИВНЫЙ ДОХОД</span><h2>ДИВИДЕНДЫ + КУПОНЫ</h2><p>Здесь только денежный поток от активов. Пополнения и продажи в этот модуль не входят.</p></div>
              <strong>{snapshot.passiveIncome ? `${money.format(snapshot.passiveIncome)} ₽` : '—'}</strong>
            </section>
            <section className="income-stats">
              <article className="metric-card"><span className="metric-label">СРЕДНЕЕ / МЕС.</span><strong>{snapshot.averageMonthlyPassiveIncome ? `${money.format(snapshot.averageMonthlyPassiveIncome)} ₽` : '—'}</strong><small>Фактический средний поток</small></article>
              <article className="metric-card"><span className="metric-label">СРЕДНЕЕ / ГОД</span><strong>{snapshot.averageAnnualPassiveIncome ? `${money.format(snapshot.averageAnnualPassiveIncome)} ₽` : '—'}</strong><small>Без депозитов и внешних пополнений</small></article>
              <article className="context-card"><span>СЛЕДУЮЩЕЕ</span><strong>Календарь выплат</strong><span>ПОТОМ</span><strong>YoC + рост выплат</strong></article>
            </section>
            <section className="panel roadmap-panel"><span className="eyebrow">СЛЕДУЮЩИЙ РАБОЧИЙ МОДУЛЬ</span><h2>КАЛЕНДАРЬ ВЫПЛАТ</h2><p>Подключим реальные ожидаемые купоны и дивиденды, затем YoC и рост пассивного дохода к собственной базе. Никаких прогнозных сумм пока источник данных не подтверждён.</p></section>
          </div>
        )}

        {tab === 'dna' && (
          <div className="dna-layout">
            <section className="world-panel world-panel--view">
              <div className="world-panel__head">
                <div><span className="eyebrow">INVESTOR DNA · PIXIJS / WEBGL</span><h2>ЖИВОЙ МИР</h2></div>
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
