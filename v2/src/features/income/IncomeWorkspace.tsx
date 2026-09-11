import { useEffect, useMemo, useState } from 'react'
import { loadPayoutCalendar, type PayoutCalendar, type PayoutEvent } from '../../lib/payoutsApi'
import './income.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const monthFmt = new Intl.DateTimeFormat('ru-RU', { month: 'short' })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' })

type View = 'overview' | 'calendar' | 'sources'

type Props = {
  passiveIncome: number
  averageMonthlyPassiveIncome: number
  startDate: string
}

const empty: PayoutCalendar = {
  available: false,
  generatedAt: null,
  period: { from: null, to: null },
  basis: null,
  displayBasis: null,
  actual: { year: null, items: [], totalNet: 0, count: 0 },
  forecast: { gross: 0, tax: 0, net: 0, count: 0 },
  next: null,
  months: [],
  events: [],
  coverage: { eligibleAssets: 0, scheduledEvents: 0, resolvedAssets: 0, coverageRatio: 0, errors: [] },
  integrity: { complete: false, minimumCoverage: .95 },
  stale: false,
  warning: null,
  note: null,
}

function eventAmount(event: PayoutEvent, fact = false) {
  const value = fact ? event.net : event.gross
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function eventKind(event: PayoutEvent) {
  const key = String(event.kind || '').toUpperCase()
  if (key === 'DIVIDEND') return 'Дивиденд'
  if (key === 'COUPON') return 'Купон'
  return 'Доход'
}

export function IncomeWorkspace({ passiveIncome, averageMonthlyPassiveIncome, startDate }: Props) {
  const [data, setData] = useState<PayoutCalendar>(empty)
  const [view, setView] = useState<View>('overview')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      const next = await loadPayoutCalendar()
      if (active) {
        setData(next)
        setLoading(false)
      }
    }
    void load()
    const timer = window.setInterval(load, 10 * 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  const upcoming = data.events.slice(0, 20)
  const pageSize = 5
  const pages = Math.max(1, Math.ceil(upcoming.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const visibleUpcoming = upcoming.slice(safePage * pageSize, safePage * pageSize + pageSize)

  const sourceRows = useMemo(() => {
    const map = new Map<string, { ticker: string; name: string; fact: number; forecast: number; factCount: number; forecastCount: number }>()
    for (const event of data.actual.items) {
      const key = event.ticker || event.name || '—'
      const row = map.get(key) ?? { ticker: key, name: event.name || key, fact: 0, forecast: 0, factCount: 0, forecastCount: 0 }
      row.fact += eventAmount(event, true)
      row.factCount += 1
      map.set(key, row)
    }
    for (const event of data.events) {
      const key = event.ticker || event.name || '—'
      const row = map.get(key) ?? { ticker: key, name: event.name || key, fact: 0, forecast: 0, factCount: 0, forecastCount: 0 }
      row.forecast += eventAmount(event)
      row.forecastCount += 1
      map.set(key, row)
    }
    return [...map.values()]
      .sort((a, b) => (b.fact + b.forecast) - (a.fact + a.forecast))
      .slice(0, 6)
  }, [data.actual.items, data.events])

  const monthRows = data.months.slice(0, 6)
  const monthMax = Math.max(1, ...monthRows.map(row => Number(row.gross) || 0))
  const coverage = data.coverage.eligibleAssets > 0 ? data.coverage.coverageRatio : 0
  const next = data.next

  return (
    <div className="income-workspace">
      <nav className="income-subnav" aria-label="Доход">
        <button className={view === 'overview' ? 'is-active' : ''} onClick={() => setView('overview')}>ОБЗОР</button>
        <button className={view === 'calendar' ? 'is-active' : ''} onClick={() => setView('calendar')}>КАЛЕНДАРЬ</button>
        <button className={view === 'sources' ? 'is-active' : ''} onClick={() => setView('sources')}>ИСТОЧНИКИ</button>
        <span className={`income-source-badge ${data.integrity.complete ? 'is-ok' : ''}`}>
          {loading ? 'T-BANK · ЗАГРУЗКА' : data.integrity.complete ? 'T-BANK · VERIFIED' : 'T-BANK · PARTIAL'}
        </span>
      </nav>

      {view === 'overview' && (
        <div className="income-overview-grid">
          <section className="income-fact panel">
            <div><span className="eyebrow">ФАКТ · ПОЛУЧЕНО</span><h2>ДИВИДЕНДЫ + КУПОНЫ</h2></div>
            <strong>{passiveIncome ? `${money2.format(passiveIncome)} ₽` : '—'}</strong>
            <div className="income-fact-meta">
              <span>с начала учёта · {startDate}</span>
              <b>{averageMonthlyPassiveIncome ? `${money.format(averageMonthlyPassiveIncome)} ₽/мес.` : '—'}</b>
            </div>
          </section>

          <section className="income-forecast panel">
            <span className="eyebrow">12М · ПОДТВЕРЖДЁННЫЙ ГРАФИК</span>
            <strong>{data.available && data.forecast.gross ? `${money.format(data.forecast.gross)} ₽` : '—'}</strong>
            <small>gross · только выплаты из расписания текущих позиций</small>
            <div className="forecast-meta">
              <span>{data.forecast.count || 0} выплат</span>
              <span>покрытие {coverage ? `${pct.format(coverage * 100)}%` : '—'}</span>
            </div>
          </section>

          <section className="income-next panel">
            <span className="eyebrow">СЛЕДУЮЩАЯ ВЫПЛАТА</span>
            {next ? (
              <>
                <strong>{next.ticker || next.name}</strong>
                <div><b>{eventKind(next)}</b><span>{dateFmt.format(new Date(next.date))}</span></div>
                <small>{eventAmount(next) ? `${money2.format(eventAmount(next))} ₽ gross` : 'сумма уточняется'}{typeof next.days === 'number' ? ` · через ${next.days} дн.` : ''}</small>
              </>
            ) : <div className="income-empty">Подтверждённых будущих выплат пока нет.</div>}
          </section>

          <section className="income-months panel">
            <div className="income-panel-head"><span className="eyebrow">БЛИЖАЙШИЕ 6 МЕСЯЦЕВ</span><small>gross</small></div>
            <div className="income-month-bars">
              {monthRows.length ? monthRows.map(row => {
                const d = new Date(Date.UTC(row.year, row.month - 1, 1))
                const h = Math.max(4, (Number(row.gross) || 0) / monthMax * 100)
                return (
                  <div className="month-bar" key={row.key}>
                    <b>{row.gross ? money.format(row.gross) : '0'}</b>
                    <i><span style={{ height: `${h}%` }} /></i>
                    <small>{monthFmt.format(d).replace('.', '')}</small>
                  </div>
                )
              }) : <div className="income-empty">Календарь загружается…</div>}
            </div>
          </section>
        </div>
      )}

      {view === 'calendar' && (
        <section className="panel income-calendar-panel">
          <div className="income-panel-head">
            <div><span className="eyebrow">КАЛЕНДАРЬ · 12 МЕСЯЦЕВ</span><h2>ПОДТВЕРЖДЁННЫЕ ВЫПЛАТЫ</h2></div>
            <div className="income-pager">
              <button disabled={safePage === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>‹</button>
              <span>{upcoming.length ? `${safePage + 1}/${pages}` : '—'}</span>
              <button disabled={safePage >= pages - 1} onClick={() => setPage(p => Math.min(pages - 1, p + 1))}>›</button>
            </div>
          </div>
          <div className="income-events">
            {visibleUpcoming.length ? visibleUpcoming.map((event, index) => (
              <div className="income-event" key={`${event.kind}-${event.ticker}-${event.date}-${index}`}>
                <time>{dateFmt.format(new Date(event.date))}</time>
                <div><strong>{event.ticker || event.name}</strong><span>{eventKind(event)}{event.confidence ? ` · ${event.confidence}` : ''}</span></div>
                <b>{eventAmount(event) ? `${money2.format(eventAmount(event))} ₽` : '—'}</b>
              </div>
            )) : <div className="income-empty">{loading ? 'Получаем расписание Т-Банка…' : 'Будущие выплаты не найдены.'}</div>}
          </div>
          <p className="income-method-note">Будущие суммы не смешиваются с фактом. Здесь показывается gross из официального расписания Т‑Банка для текущих позиций; дивиденды без подтверждённого события не прогнозируются.</p>
        </section>
      )}

      {view === 'sources' && (
        <section className="panel income-sources-panel">
          <div className="income-panel-head"><div><span className="eyebrow">РАЗБИВКА ПО АКТИВАМ</span><h2>ИСТОЧНИКИ ДОХОДА</h2></div><small>факт ≠ прогноз</small></div>
          <div className="income-source-table">
            <div className="income-source-row income-source-row--head"><span>Актив</span><span>Получено</span><span>12М график</span></div>
            {sourceRows.length ? sourceRows.map(row => (
              <div className="income-source-row" key={row.ticker}>
                <div><strong>{row.ticker}</strong><small>{row.name !== row.ticker ? row.name : `${row.factCount + row.forecastCount} событий`}</small></div>
                <b>{row.fact ? `${money2.format(row.fact)} ₽` : '—'}</b>
                <b>{row.forecast ? `${money2.format(row.forecast)} ₽` : '—'}</b>
              </div>
            )) : <div className="income-empty">Нет данных для разбивки.</div>}
          </div>
          <div className="income-integrity">
            <span>Покрытие расписания</span>
            <i><b style={{ width: `${Math.min(100, coverage * 100)}%` }} /></i>
            <strong>{coverage ? `${pct.format(coverage * 100)}%` : '—'}</strong>
          </div>
          {data.warning && <p className="income-warning">{data.warning}</p>}
        </section>
      )}
    </div>
  )
}
