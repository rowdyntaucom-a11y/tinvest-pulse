import { useEffect, useMemo, useState } from 'react'
import { WorldStage } from './features/world/WorldStage'
import { HistoryChart } from './features/portfolio/HistoryChart'
import { loadPortfolio, type PortfolioSnapshot } from './lib/portfolioApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const LEVELS = ['ФУНДАМЕНТ','ДОМ','МАСТЕРСКАЯ','УСАДЬБА','КАПИТАЛЬНЫЙ ДОМ','БАШНЯ','КРЕПОСТЬ','ЦИТАДЕЛЬ','ГОРОД','ИМПЕРИЯ','ЛЕГЕНДА']
const LEVEL_THRESHOLDS = [0, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000]

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

  useEffect(() => {
    let active = true
    const refresh = async () => {
      const next = await loadPortfolio()
      if (active) setSnapshot(next)
    }
    void refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  const realLevel = useMemo(() => deriveLevel(snapshot.value), [snapshot.value])
  const level = previewLevel ?? realLevel
  const xirr = annualPct(snapshot.xirr)

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">TINVEST PULSE 2.0 · LIVE CORE</div>
          <h1>КРЯХТЯЩИЙ <span>ФОНД</span></h1>
          <p>{snapshot.accountName} · инвестиционный терминал + живой мир для телефона и ПК.</p>
        </div>
        <nav className="topbar__nav" aria-label="Разделы">
          <button className="chip chip--active">ПОРТФЕЛЬ</button>
          <button className="chip">АНАЛИТИКА</button>
          <button className="chip">DNA</button>
          <button className="chip">ИИ</button>
        </nav>
      </header>

      <section className="hero-grid">
        <article className="metric-card metric-card--hero">
          <span className="metric-label">КАПИТАЛ</span>
          <strong>{snapshot.value ? `${money.format(snapshot.value)} ₽` : '—'}</strong>
          <small className={snapshot.source !== 'fallback' ? 'status-live' : 'status-wait'}>{snapshot.source !== 'fallback' ? '● LIVE DATA' : '○ API WAIT'}</small>
        </article>
        <article className="metric-card">
          <span className="metric-label">РЕЗУЛЬТАТ</span>
          <strong>{snapshot.value ? `${snapshot.profit >= 0 ? '+' : ''}${money.format(snapshot.profit)} ₽` : '—'}</strong>
          <small>{snapshot.value ? `${pct.format(snapshot.profitPct)}% от внешних потоков` : 'ожидаем историю'}</small>
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
            <strong>{snapshot.history.length ? `${snapshot.history.length} точек` : 'история ожидается'}</strong>
          </div>
        </div>
        <HistoryChart points={snapshot.history} />
      </section>

      <section className="world-panel">
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

      <section className="lower-grid">
        <article className="module-card">
          <span className="eyebrow">СЛОЙ 3 · АНАЛИТИКА</span>
          <h3>Здоровье портфеля</h3>
          <p>Следующий модуль: концентрация, волатильность, просадка, Sharpe и объяснимый Health Score.</p>
        </article>
        <article className="module-card">
          <span className="eyebrow">СЛОЙ 2 · ИНТЕЛЛЕКТ</span>
          <h3>ИИ по вашим цифрам</h3>
          <p>Чат будет работать только с нормализованными данными и рыночным контекстом, без скрытых торговых действий.</p>
        </article>
        <article className="module-card">
          <span className="eyebrow">СЛОЙ 1 · ДАННЫЕ</span>
          <h3>Broker Adapter</h3>
          <p>T-Invest — первый адаптер. Затем отчёты и другие брокеры через единую модель транзакций и активов.</p>
        </article>
      </section>
    </main>
  )
}
