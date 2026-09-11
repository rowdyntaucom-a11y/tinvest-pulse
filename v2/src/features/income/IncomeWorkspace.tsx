import { useEffect, useMemo, useState } from 'react'
import { loadPayoutCalendar, type PayoutCalendar, type PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { getIncomeIntegrity } from './incomeIntegrity'
import { buildRealizedIncomeHistory, calculateIncomeSourceConcentration } from './incomeHistory'
import './income.css'
import './incomeCompact.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct1 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const monthFmt = new Intl.DateTimeFormat('ru-RU', { month: 'short' })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' })

type View = 'overview' | 'calendar' | 'sources'

type Props = {
  passiveIncome: number
  averageMonthlyPassiveIncome: number
  startDate: string
  positions: PositionSnapshot[]
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

function keyOf(value: unknown) {
  return String(value || '').trim().toUpperCase()
}

export function IncomeWorkspace({ passiveIncome, averageMonthlyPassiveIncome, startDate, positions }: Props) {
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

  const integrity = useMemo(() => getIncomeIntegrity(data, loading), [data, loading])

  const sourceRows = useMemo(() => {
    const positionMap = new Map<string, PositionSnapshot>()
    for (const position of positions) {
      const tickerKey = keyOf(position.ticker)
      const nameKey = keyOf(position.name)
      if (tickerKey) positionMap.set(tickerKey, position)
      if (nameKey) positionMap.set(nameKey, position)
    }

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
      .map(row => {
        const position = positionMap.get(keyOf(row.ticker)) ?? positionMap.get(keyOf(row.name))
        const costBasis = position?.costBasis ?? 0
        const yoc12m = costBasis > 0 && row.forecast > 0 ? row.forecast / costBasis : null
        return { ...row, costBasis, yoc12m }
      })
      .sort((a, b) => (b.fact + b.forecast) - (a.fact + a.forecast))
      .slice(0, 6)
  }, [data.actual.items, data.events, positions])

  const incomeProfile = useMemo(() => {
    let actualCoupons = 0
    let actualDividends = 0
    let forecastCoupons = 0
    let forecastDividends = 0
    const bySource = new Map<string, number>()

    for (const event of data.actual.items) {
      const amount = Math.max(0, eventAmount(event, true))
      const kind = String(event.kind || '').toUpperCase()
      if (kind === 'COUPON') actualCoupons += amount
      if (kind === 'DIVIDEND') actualDividends += amount
    }

    for (const event of data.events) {
      const amount = Math.max(0, eventAmount(event))
      const kind = String(event.kind || '').toUpperCase()
      if (kind === 'COUPON') forecastCoupons += amount
      if (kind === 'DIVIDEND') forecastDividends += amount
      if (amount <= 0) continue
      const key = event.ticker || event.name || '—'
      bySource.set(key, (bySource.get(key) || 0) + amount)
    }

    const forecastTotal = [...bySource.values()].reduce((sum, value) => sum + value, 0)
    const rankedSources = [...bySource.entries()].sort((a, b) => b[1] - a[1])
    const top = rankedSources[0] ?? null
    const topShare = top && forecastTotal > 0 ? top[1] / forecastTotal : null
    const hhi = forecastTotal > 0
      ? rankedSources.reduce((sum, [, value]) => sum + (value / forecastTotal) ** 2, 0)
      : null
    const effectiveSources = hhi != null && hhi > 0 ? 1 / hhi : null

    return {
      actualCoupons,
      actualDividends,
      forecastCoupons,
      forecastDividends,
      topSource: top?.[0] ?? null,
      topShare,
      effectiveSources,
    }
  }, [data.actual.items, data.events])

  const realizedHistory = useMemo(() => buildRealizedIncomeHistory(data.actual.items), [data.actual.items])
  const realizedConcentration = useMemo(() => calculateIncomeSourceConcentration(data.actual.items), [data.actual.items])
  const realizedTopSource = useMemo(
    () => [...sourceRows].filter(row => row.fact > 0).sort((a, b) => b.fact - a.fact)[0] ?? null,
    [sourceRows],
  )
  const realizedMonthCount = realizedHistory.months.length
  const latestRealizedMonth = realizedHistory.months.at(-1) ?? null

  const monthRows = data.months.slice(0, 6)
  const monthMax = Math.max(1, ...monthRows.map(row => Number(row.gross) || 0))
  const coverage = integrity.coveragePct
  const next = data.next

  return (
    <div className="income-workspace">
      <nav className="income-subnav" aria-label="Доход">
        <button className={view === 'overview' ? 'is-active' : ''} onClick={() => setView('overview')}>ОБЗОР</button>
        <button className={view === 'calendar' ? 'is-active' : ''} onClick={() => setView('calendar')}>КАЛЕНДАРЬ</button>
        <button className={view === 'sources' ? 'is-active' : ''} onClick={() => setView('sources')}>ИСТОЧНИКИ</button>
        <span className={`income-source-badge is-${integrity.state}`} title={integrity.detail}>
          {integrity.label}
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
              <span>покрытие {coverage == null ? '—' : `${pct.format(coverage)}%`}</span>
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
          {data.stale && <p className="income-warning">Расписание временно не обновилось: используется последний полный снимок.</p>}
        </section>
      )}

      {view === 'sources' && (
        <section className="panel income-sources-panel">
          <div className="income-panel-head"><div><span className="eyebrow">РАЗБИВКА ПО АКТИВАМ</span><h2>ИСТОЧНИКИ ДОХОДА</h2></div><small>факт ≠ прогноз</small></div>

          <div className="income-profile-grid">
            <article><span>ФАКТ · КУПОНЫ</span><strong>{incomeProfile.actualCoupons ? `${money.format(incomeProfile.actualCoupons)} ₽` : '—'}</strong><small>{data.actual.year ?? 'период'} · {realizedMonthCount ? `${realizedMonthCount} мес.` : 'нет истории'}</small></article>
            <article><span>ФАКТ · ДИВИДЕНДЫ</span><strong>{incomeProfile.actualDividends ? `${money.format(incomeProfile.actualDividends)} ₽` : '—'}</strong><small>{latestRealizedMonth ? `${latestRealizedMonth.key} · ${money.format(latestRealizedMonth.totalNet)} ₽ net` : 'нет FACT-событий'}</small></article>
            <article><span>ФАКТ · TOP SOURCE</span><strong>{realizedTopSource?.ticker ?? '—'}</strong><small>{realizedConcentration.topSourceShare == null ? 'нет FACT-источников' : `${pct1.format(realizedConcentration.topSourceShare * 100)}% реализованного net`}</small></article>
            <article><span>ФАКТ · ЭКВ. ИСТОЧНИКОВ</span><strong>{realizedConcentration.effectiveSources == null ? '—' : number2.format(realizedConcentration.effectiveSources)}</strong><small>{realizedConcentration.sourceCount ? `${realizedConcentration.sourceCount} источн. · 1 / HHI` : 'нет FACT-источников'}</small></article>
          </div>

          <div className="income-source-table">
            <div className="income-source-row income-source-row--head"><span>Актив</span><span>Получено</span><span>12М / YoC</span></div>
            {sourceRows.length ? sourceRows.map(row => (
              <div className="income-source-row" key={row.ticker}>
                <div><strong>{row.ticker}</strong><small>{row.name !== row.ticker ? row.name : `${row.factCount + row.forecastCount} событий`}</small></div>
                <b>{row.fact ? `${money2.format(row.fact)} ₽` : '—'}</b>
                <div className="income-source-forecast">
                  <b>{row.forecast ? `${money2.format(row.forecast)} ₽` : '—'}</b>
                  <small>{row.yoc12m == null ? 'YoC —' : `YoC ${pct1.format(row.yoc12m * 100)}%`}</small>
                </div>
              </div>
            )) : <div className="income-empty">Нет данных для разбивки.</div>}
          </div>
          <div className="income-integrity">
            <span>Покрытие расписания · {integrity.resolvedAssets}/{integrity.eligibleAssets || '—'}</span>
            <i><b style={{ width: `${coverage == null ? 0 : Math.min(100, coverage)}%` }} /></i>
            <strong>{coverage == null ? '—' : `${pct.format(coverage)}%`}</strong>
          </div>
          <div className={`income-integrity-status is-${integrity.state}`}>
            <b>{integrity.label}</b><span>{integrity.detail}{integrity.errors ? ` · ошибок ${integrity.errors}` : ''}</span>
          </div>
          <p className="income-method-note">FACT-концентрация использует только реально полученные положительные net-выплаты со статусом FACT. Депозиты и будущие выплаты сюда не попадают; эффективное число источников = 1/HHI.</p>
          <p className="income-method-note">12М / YoC в таблице остаётся отдельным прогнозным слоем: подтверждённые gross-выплаты на 12 месяцев / стоимость приобретения текущей позиции. Это не текущая дивидендная доходность.</p>
          <p className="income-method-note">Цель пассивного дохода не задаётся автоматически. Прогресс будет доступен только после явного annual net-target пользователя и полного реализованного 12-месячного календарного периода; короткая история не годифицируется.</p>
          {data.warning && <p className="income-warning">{data.warning}</p>}
        </section>
      )}
    </div>
  )
}
