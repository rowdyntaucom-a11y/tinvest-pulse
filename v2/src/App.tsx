import { useEffect, useMemo, useState } from 'react'
import { WorldStage } from './features/world/WorldStage'
import { loadPortfolio, type PortfolioSnapshot } from './lib/portfolioApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const LEVELS = ['ФУНДАМЕНТ','ДОМ','ПОСЕЛЕНИЕ','ГОРОД','КРЕПОСТЬ','КОРОЛЕВСТВО','СТОЛИЦА','ЦИТАДЕЛЬ','ИМПЕРИЯ','ЛЕГЕНДА','БЕСКОНЕЧНОСТЬ']

function deriveLevel(value: number) {
  if (value <= 0) return 1
  return Math.max(1, Math.min(11, Math.floor(Math.log10(value + 1) * 2.05) - 6))
}

export default function App() {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot>({ value: 0, profit: 0, profitPct: 0, passiveIncome: 0, positions: 0, source: 'fallback' })
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">TINVEST PULSE 2.0 · FOUNDATION</div>
          <h1>КРЯХТЯЩИЙ <span>ФОНД</span></h1>
          <p>Инвестиционный терминал + живой мир. Один продукт для телефона и ПК.</p>
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
          <small className={snapshot.source === 'live' ? 'status-live' : 'status-wait'}>{snapshot.source === 'live' ? '● LIVE API' : '○ API WAIT'}</small>
        </article>
        <article className="metric-card">
          <span className="metric-label">ПРИБЫЛЬ</span>
          <strong>{snapshot.value ? `${snapshot.profit >= 0 ? '+' : ''}${money.format(snapshot.profit)} ₽` : '—'}</strong>
          <small>{snapshot.value ? `${pct.format(snapshot.profitPct)}%` : 'TWR/XIRR ядро — далее'}</small>
        </article>
        <article className="metric-card">
          <span className="metric-label">ПОЗИЦИИ</span>
          <strong>{snapshot.positions || '—'}</strong>
          <small>единая модель активов</small>
        </article>
        <article className="metric-card">
          <span className="metric-label">ПАССИВНЫЙ ДОХОД</span>
          <strong>{snapshot.passiveIncome ? `${money.format(snapshot.passiveIncome)} ₽` : '—'}</strong>
          <small>дивиденды + купоны</small>
        </article>
      </section>

      <section className="world-panel">
        <div className="world-panel__head">
          <div>
            <span className="eyebrow">INVESTOR DNA · WORLD ENGINE</span>
            <h2>ЖИВОЙ МИР</h2>
          </div>
          <div className="level-summary">
            <strong>{level}</strong><span>/11</span>
            <small>{LEVELS[level - 1]}</small>
          </div>
        </div>

        <div className="world-frame">
          <WorldStage level={level} />
        </div>

        <div className="level-controls" aria-label="Предпросмотр уровней">
          <button onClick={() => setPreviewLevel(Math.max(1, level - 1))}>‹</button>
          <div>
            <span>ПРЕДПРОСМОТР</span>
            <strong>{level}/11 · {LEVELS[level - 1]}</strong>
          </div>
          <button onClick={() => setPreviewLevel(Math.min(11, level + 1))}>›</button>
          <button className="level-real" onClick={() => setPreviewLevel(null)}>REAL</button>
        </div>
      </section>

      <section className="lower-grid">
        <article className="module-card">
          <span className="eyebrow">СЛОЙ 3 · АНАЛИТИКА</span>
          <h3>Здоровье портфеля</h3>
          <p>Health Score, Sharpe, TWR, просадка и концентрация будут жить в отдельном аналитическом модуле, а не внутри визуального движка.</p>
        </article>
        <article className="module-card">
          <span className="eyebrow">СЛОЙ 2 · ИНТЕЛЛЕКТ</span>
          <h3>ИИ по вашим цифрам</h3>
          <p>Чат получает только нормализованные данные портфеля и рыночный контекст. Никаких скрытых торговых действий.</p>
        </article>
        <article className="module-card">
          <span className="eyebrow">СЛОЙ 1 · ДАННЫЕ</span>
          <h3>Broker Adapter</h3>
          <p>T-Invest первым. Затем отчёты и другие брокеры через единую модель транзакций и активов.</p>
        </article>
      </section>
    </main>
  )
}
