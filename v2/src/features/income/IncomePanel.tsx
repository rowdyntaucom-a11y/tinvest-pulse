import { useEffect, useMemo, useState } from 'react'
import { loadPayouts, type PayoutEvent, type PayoutsSnapshot } from '../../lib/payoutsApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const CALENDAR_PAGE_SIZE = 5

type IncomeView = 'overview' | 'calendar' | 'sources'

type Props = {
  passiveIncome: number
  averageMonthlyPassiveIncome: number
  startDate: string
}

const monthLabel = (month: number) => {
  const labels = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
  return labels[Math.max(0, Math.min(11, month - 1))] || '—'
}

const dateLabel = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }).replace('.', '')
    : '—'
}

const kindLabel = (kind: string) => kind === 'DIVIDEND' ? 'Дивиденд' : kind === 'COUPON' ? 'Купон' : 'Доход'

const eventAmount = (event: PayoutEvent) => Number(event.gross ?? event.net ?? 0) || 0

export function IncomePanel({ passiveIncome, averageMonthlyPassiveIncome, startDate }: Props) {
  const [view, setView] = useState<IncomeView>('overview')
  const [data, setData] = useState<PayoutsSnapshot | null>(null)
  const [calendarPage, setCalendarPage] = useState(0)

  useEffect(() => {
    let active = true
    void loadPayouts().then(next => { if (active) setData(next) })
    return () => { active = false }
  }, [])

  const calendarPages = Math.max(1, Math.ceil((data?.events.length || 0) / CALENDAR_PAGE_SIZE))
  const safeCalendarPage = Math.min(calendarPage, calendarPages - 1)
  const visibleEvents = (data?.events || []).slice(
    safeCalendarPage * CALENDAR_PAGE_SIZE,
    safeCalendarPage * CALENDAR_PAGE_SIZE + CALENDAR_PAGE_SIZE,
  )

  const sourceRows = useMemo(() => {
    const map = new Map<string, { ticker: string; name: string; forecast: number; actual: number; count: number }>()
    const ensure = (event: PayoutEvent) => {
      const key = event.ticker || event.name || '—'
      if (!map.has(key)) map.set(key, { ticker: key, name: event.name || key, forecast: 0, actual: 0, count: 0 })
      return map.get(key)!
    }
    for (const event of data?.events || []) {
      const row = ensure(event)
      row.forecast += eventAmount(event)
      row.count += 1
    }
    for (const event of data?.actual.items || []) {
      const row = ensure(event)
      row.actual += Number(event.net ?? 0) || 0
    }
    return [...map.values()].sort((a, b) => (b.forecast + b.actual) - (a.forecast + a.actual)).slice(0, 5)
  }, [data])

  const coverage = data?.coverage.eligibleAssets
    ? Math.min(100, Math.max(0, data.coverage.coverageRatio * 100))
    : null
  const badge = !data ? 'ЗАГРУЗКА' : data.stale ? 'STALE' : data.integrityComplete ? 'LIVE' : 'CHECK'
  const next = data?.next || null
  const nextAmount = next ? eventAmount(next) : 0

  return (
    <div className="analytics-layout">
      <nav className="subnav" aria-label="Разделы пассивного дохода">
        <button onClick={() => setView('overview')} className={view === 'overview' ? 'subnav--active' : ''}>ОБЗОР</button>
        <button onClick={() => setView('calendar')} className={view === 'calendar' ? 'subnav--active' : ''}>КАЛЕНДАРЬ</button>
        <button onClick={() => setView('sources')} className={view === 'sources' ? 'subnav--active' : ''}>ИСТОЧНИКИ</button>
        <span className={`sample-badge ${data?.integrityComplete && !data?.stale ? 'sample-badge--mature' : ''}`}>{badge}</span>
      </nav>

      {view === 'overview' && (
        <div className="income-layout">
          <section className="income-hero panel">
            <div>
              <span className="eyebrow">ПАССИВНЫЙ ДОХОД · ФАКТ</span>
              <h2>ПОЛУЧЕНО</h2>
              <p>Только реально полученные дивиденды и купоны. Пополнения, продажи и движение тела облигации сюда не входят.</p>
            </div>
            <strong>{passiveIncome ? `${money.format(passiveIncome)} ₽` : '—'}</strong>
            <small>с начала учёта · {startDate}</small>
          </section>

          <section className="income-stats">
            <article className="metric-card">
              <span className="metric-label">ОЖИДАЕТСЯ · 12М</span>
              <strong>{data?.available && data.forecast.gross ? `${money.format(data.forecast.gross)} ₽` : '—'}</strong>
              <small>gross по подтверждённому расписанию T‑Bank</small>
            </article>
            <article className="metric-card">
              <span className="metric-label">СРЕДНЕЕ / МЕС.</span>
              <strong>{averageMonthlyPassiveIncome ? `${money.format(averageMonthlyPassiveIncome)} ₽` : '—'}</strong>
              <small>по фактически доступному периоду</small>
            </article>
            <article className="context-card">
              <span>ПОКРЫТИЕ</span><strong>{coverage == null ? '—' : `${pct.format(coverage)}%`}</strong>
              <span>СОБЫТИЙ</span><strong>{data?.forecast.count || '—'}</strong>
              <span>НДФЛ*</span><strong>{data?.forecast.tax ? `${money.format(data.forecast.tax)} ₽` : '—'}</strong>
            </article>
          </section>

          <section className="panel roadmap-panel">
            <span className="eyebrow">СЛЕДУЮЩАЯ ВЫПЛАТА</span>
            <h2>{next ? `${dateLabel(next.date)} · ${next.ticker}` : 'РАСПИСАНИЕ ЗАГРУЖАЕТСЯ'}</h2>
            <p>{next ? `${kindLabel(next.kind)} · ${nextAmount ? `${money.format(nextAmount)} ₽ начислено` : 'сумма уточняется'}${typeof next.days === 'number' ? ` · через ${next.days} дн.` : ''}` : (data?.warning || 'Подключаем подтверждённые купоны и дивиденды без выдуманных прогнозов.')}</p>
          </section>
        </div>
      )}

      {view === 'calendar' && (
        <section className="panel health-panel">
          <div className="panel-head panel-head--paged">
            <div><span className="eyebrow">ПОДТВЕРЖДЁННОЕ РАСПИСАНИЕ</span><h2>КАЛЕНДАРЬ ВЫПЛАТ</h2></div>
            <div className="pager" aria-label="Страницы календаря выплат">
              <button disabled={safeCalendarPage === 0} onClick={() => setCalendarPage(page => Math.max(0, page - 1))}>‹</button>
              <span>{data?.events.length ? `${safeCalendarPage + 1}/${calendarPages}` : '—'}</span>
              <button disabled={safeCalendarPage >= calendarPages - 1} onClick={() => setCalendarPage(page => Math.min(calendarPages - 1, page + 1))}>›</button>
            </div>
          </div>
          <div className="positions-list">
            {visibleEvents.length ? visibleEvents.map((event, index) => (
              <div className="position-row" key={`${event.ticker}-${event.date}-${index}`}>
                <div className="position-main">
                  <strong>{event.ticker}</strong>
                  <span>{dateLabel(event.date)} · {kindLabel(event.kind)} · {event.confidence || '—'}</span>
                </div>
                <div className="position-weight">
                  <span>{event.quantity ? `${event.quantity} шт.` : ''}</span>
                  <i><b style={{ width: event.kind === 'DIVIDEND' ? '72%' : '46%' }} /></i>
                </div>
                <div className="position-value">{eventAmount(event) ? `${money.format(eventAmount(event))} ₽` : '—'}</div>
              </div>
            )) : <div className="empty-state">{data?.warning || 'Подтверждённых будущих выплат пока нет.'}</div>}
          </div>
          <p className="method-note">Суммы будущих событий показываются начисленными (gross). Налог — отдельная оценка; для дивидендов без подтверждённой даты выплаты используется доступная дата события из T‑Bank.</p>
        </section>
      )}

      {view === 'sources' && (
        <section className="panel health-panel">
          <div className="panel-head"><div><span className="eyebrow">КТО СОЗДАЁТ ДЕНЕЖНЫЙ ПОТОК</span><h2>ИСТОЧНИКИ ДОХОДА</h2></div><small>факт + 12м расписание</small></div>
          <div className="positions-list">
            {sourceRows.length ? sourceRows.map(row => {
              const total = row.actual + row.forecast
              const max = Math.max(...sourceRows.map(item => item.actual + item.forecast), 1)
              return (
                <div className="position-row" key={row.ticker}>
                  <div className="position-main"><strong>{row.ticker}</strong><span>{row.name}</span></div>
                  <div className="position-weight"><span>{row.count ? `${row.count} вып.` : 'факт'}</span><i><b style={{ width: `${Math.max(3, total / max * 100)}%` }} /></i></div>
                  <div className="position-value">{money.format(total)} ₽</div>
                </div>
              )
            }) : <div className="empty-state">Источники появятся после загрузки календаря.</div>}
          </div>
          <p className="method-note">Факт берётся из операций. Будущее — только из расписаний текущих позиций. Мы не экстраполируем дивиденды и купоны, если источник их не подтверждает.</p>
        </section>
      )}
    </div>
  )
}
