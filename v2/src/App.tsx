import { useEffect, useMemo, useState } from 'react'
import { WorldStage } from './features/world/WorldStage'
import { HistoryChart } from './features/portfolio/HistoryChart'
import { loadPortfolio, loadPortfolioHistory, type PortfolioSnapshot } from './lib/portfolioApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const LEVELS = ['ФУНДАМЕНТ','ДОМ','МАСТЕРСКАЯ','УСАДЬБА','КАПИТАЛЬНЫЙ ДОМ','БАШНЯ','КРЕПОСТЬ','ЦИТАДЕЛЬ','ГОРОД','ИМПЕРИЯ','ЛЕГЕНДА']
const LEVEL_THRESHOLDS = [0, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000]

type Tab = 'portfolio' | 'analytics' | 'dna' | 'ai'

function deriveLevel(value: number) {
  let level = 1
  LEVEL_THRESHOLDS.forEach((threshold, index) => { if (value >= threshold) level = index + 1 })
  return Math.max(1, Math.min(11, level))
}

function annualPct(value: number | null) {
  if (value == null || !Number.isFinite(value)) return null
  return Math.abs(value) <= 5 ? value * 100 : value
}

const EMPTY: PortfolioSnapshot = {
  accountName: 'Кряхтящий фонд', value: 0, profit: 0, profitPct: 0, passiveIncome: 0,
  averageMonthlyPassiveIncome: 0, positions: 0, xirr: null, cagr: null,
  startDate: null, updatedAt: null, history: [], source: 'fallback',
}

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>(EMPTY)
  const [previewLevel, setPreviewLevel] = useState<number | null>(null)
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
    const timer = window.setTimeout(() => void load(), 800)
    return () => { active = false; window.clearTimeout(timer) }
  }, [])

  const realLevel = useMemo(() => deriveLevel(snapshot.value), [snapshot.value])
  const level = previewLevel ?? realLevel
  const xirr = annualPct(snapshot.xirr)

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="eyebrow">TINVEST PULSE 2.0 · LIVE CORE</div>
          <h1>КРЯХТЯЩИЙ <span>ФОНД</span></h1>
          <p>{snapshot.accountName} · инвестиционный терминал + живой мир.</p>
        </div>
        <nav className="topbar__nav" aria-label="Разделы">
          <button onClick={() => setTab('portfolio')} className={`chip ${tab === 'portfolio' ? 'chip--active' : ''}`}>ПОРТФЕЛЬ</button>
          <button onClick={() => setTab('analytics')} className={`chip ${tab === 'analytics' ? 'chip--active' : ''}`}>АНАЛИТИКА</button>
          <button onClick={() => setTab('dna')} className={`chip ${tab === 'dna' ? 'chip--active' : ''}`}>DNA</button>
          <button onClick={() => setTab('ai')} className={`chip ${tab === 'ai' ? 'chip--active' : ''}`}>ИИ</button>
        </nav>
      </header>

      <section className={`app-view ${tab}-view`}>
        {tab === 'portfolio' && (
          <>
            <section className="hero-grid">
              <article className="metric-card metric-card--hero">
                <span className="metric-label">КАПИТАЛ</span>
                <strong>{snapshot.value ? `${money.format(snapshot.value)} ₽` : '—'}</strong>
                <small className={snapshot.source !== 'fallback' ? 'status-live' : 'status-wait'}>{snapshot.source !== 'fallback' ? '● LIVE DATA' : '○ API WAIT'}</small>
              </article>
              <article className="metric-card">
                <span className="metric-label">РЕЗУЛЬТАТ</span>
                <strong>{snapshot.value ? `${snapshot.profit >= 0 ? '+' : ''}${money.format(snapshot.profit)} ₽` : '—'}</strong>
                <small>{snapshot.value ? `${pct.format(snapshot.profitPct)}% от внешних потоков` : 'ожидаем данные'}</small>
              </article>
              <article className="metric-card">
                <span className="metric-label">XIRR</span>
                <strong>{xirr == null ? '—' : `${pct.format(xirr)}%`}</strong>
                <small>{snapshot.positions ? `${snapshot.positions} позиций` : 'money-weighted return'}</small>
              </article>
              <article className="metric-card">
                <span className="metric-label">ПАССИВНЫЙ ДОХОД</span>
                <strong>{snapshot.passiveIncome ? `${money.format(snapshot.passiveIncome)} ₽` : '—'}</strong>
                <small>{snapshot.averageMonthlyPassiveIncome ? `≈ ${money.format(snapshot.averageMonthlyPassiveIncome)} ₽ / мес.` : 'дивиденды + купоны'}</small>
              </article>
            </section>

            <section className="history-panel">
              <div className="history-panel__head">
                <div>
                  <span className="eyebrow">ДОХОДНОСТЬ · TWR INDEX</span>
                  <h2>ПОРТФЕЛЬ VS IMOEX</h2>
                </div>
                <div className="history-meta">
                  <span>{snapshot.startDate ? new Date(snapshot.startDate).toLocaleDateString('ru-RU') : 'СТАРТ —'}</span>
                  <strong>{snapshot.history.length ? `${snapshot.history.length} точек` : 'история загружается'}</strong>
                </div>
              </div>
              <HistoryChart points={snapshot.history} />
            </section>
          </>
        )}

        {tab === 'analytics' && (
          <section className="module-grid module-grid--analytics">
            <article className="module-card module-card--hero">
              <span className="eyebrow">СЛОЙ 3 · АНАЛИТИКА</span>
              <h2>ЗДОРОВЬЕ ПОРТФЕЛЯ</h2>
              <p>Следующий рабочий модуль: концентрация, максимальная просадка, волатильность, Sharpe и объяснимый Health Score.</p>
              <div className="module-statline"><span>ПОЗИЦИИ</span><strong>{snapshot.positions || '—'}</strong><span>XIRR</span><strong>{xirr == null ? '—' : `${pct.format(xirr)}%`}</strong></div>
            </article>
            <article className="module-card">
              <span className="eyebrow">РИСК</span>
              <h3>Концентрация и просадка</h3>
              <p>Будут считаться по нормализованной истории портфеля, без смешивания с игровым слоем.</p>
            </article>
            <article className="module-card">
              <span className="eyebrow">ДАННЫЕ</span>
              <h3>Broker Adapter</h3>
              <p>T-Invest — первый адаптер. Следом отчёты и другие брокеры через единую модель операций и активов.</p>
            </article>
          </section>
        )}

        {tab === 'dna' && (
          <section className="world-panel world-panel--view">
            <div className="world-panel__head">
              <div>
                <span className="eyebrow">INVESTOR DNA · PIXIJS / WEBGL</span>
                <h2>ЖИВОЙ МИР</h2>
              </div>
              <div className="level-summary">
                <strong>{level}</strong><span>/11</span>
                <small>{LEVELS[level - 1]}</small>
              </div>
            </div>

            <div className="world-frame"><WorldStage level={level} /></div>

            <div className="level-controls" aria-label="Предпросмотр уровней">
              <button onClick={() => setPreviewLevel(Math.max(1, level - 1))}>‹</button>
              <div><span>ПРЕДПРОСМОТР</span><strong>{level}/11 · {LEVELS[level - 1]}</strong></div>
              <button onClick={() => setPreviewLevel(Math.min(11, level + 1))}>›</button>
              <button className="level-real" onClick={() => setPreviewLevel(null)}>REAL · {realLevel}/11</button>
            </div>
          </section>
        )}

        {tab === 'ai' && (
          <section className="module-grid module-grid--ai">
            <article className="module-card module-card--hero">
              <span className="eyebrow">СЛОЙ 2 · ИНТЕЛЛЕКТ</span>
              <h2>ИИ ПО ВАШИМ ЦИФРАМ</h2>
              <p>Чат будет видеть позиции, операции, выплаты и рыночный контекст. Он объясняет цифры и сценарии, но не совершает скрытых торговых действий.</p>
              <div className="ai-prompt">«Что сейчас сильнее всего влияет на мой портфель?»</div>
            </article>
          </section>
        )}
      </section>
    </main>
  )
}
