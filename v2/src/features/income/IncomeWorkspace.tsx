import { useEffect, useMemo, useState } from 'react'
import { loadPayoutCalendar, type PayoutCalendar, type PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { getIncomeIntegrity } from './incomeIntegrity'
import { buildRealizedIncomeHistory, calculateIncomeSourceConcentration, calculateIncomeStability } from './incomeHistory'
import { calculateIncomeComparablePeriod } from './incomeComparables'
import { buildBondIncomeLinkage } from './bondIncomeLinkage'
import { buildIncomeSourceRows } from './incomeSourceRows'
import { IncomeGoalCompact } from './IncomeGoalCompact'
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
  actual: {
    year: null,
    items: [],
    totalNet: 0,
    count: 0,
    observation: { available: false, from: null, to: null, completeMonths: [], partialMonths: [], basis: null },
  },
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

function incomeSourceIdentityNote(state: ReturnType<typeof buildIncomeSourceRows>[number]['identityState']) {
  if (state === 'NO_FIGI') return 'нет FIGI'
  if (state === 'INCOMPLETE_FIGI') return 'FIGI частично'
  if (state === 'AMBIGUOUS_FIGI') return 'FIGI конфликт'
  return 'база недоступна'
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
  const bondIncomeLinkage = useMemo(
    () => buildBondIncomeLinkage(positions, data.events),
    [positions, data.events],
  )

  const allSourceRows = useMemo(
    () => buildIncomeSourceRows(data.actual.items, data.events, positions, Number.MAX_SAFE_INTEGER),
    [data.actual.items, data.events, positions],
  )
  const sourceRows = allSourceRows.slice(0, 6)

  const incomeProfile = useMemo(() => {
    let actualCoupons = 0
    let actualDividends = 0

    for (const event of data.actual.items) {
      const amount = Math.max(0, eventAmount(event, true))
      const kind = String(event.kind || '').toUpperCase()
      if (kind === 'COUPON') actualCoupons += amount
      if (kind === 'DIVIDEND') actualDividends += amount
    }

    return { actualCoupons, actualDividends }
  }, [data.actual.items])

  const realizedHistory = useMemo(
    () => buildRealizedIncomeHistory(data.actual.items, data.actual.observation),
    [data.actual.items, data.actual.observation],
  )
  const realizedConcentration = useMemo(() => calculateIncomeSourceConcentration(data.actual.items), [data.actual.items])
  const realizedStability = useMemo(() => calculateIncomeStability(realizedHistory), [realizedHistory])
  const comparableIncome = useMemo(() => calculateIncomeComparablePeriod(realizedHistory.months), [realizedHistory.months])
  const realizedTopSource = useMemo(
    () => [...allSourceRows].filter(row => row.fact > 0).sort((a, b) => b.fact - a.fact)[0] ?? null,
    [allSourceRows],
  )
  const latestPayoutMonth = useMemo(
    () => [...realizedHistory.months].reverse().find(month => month.totalNet > 0) ?? null,
    [realizedHistory.months],
  )
  const observation = realizedHistory.observation
  const observationCompact = observation.available
    ? `${observation.completeMonths} полн. · ${observation.partialMonths} част.`
    : 'период не подтверждён'
  const stabilityValue = realizedStability.available
    ? realizedStability.status === 'mature' ? 'MATURE' : 'PREVIEW'
    : `${realizedStability.observedMonths}/3 мес.`
  const stabilityDetail = realizedStability.available
    ? `${money.format(realizedStability.averageMonthlyNet ?? 0)} ₽/мес. · 0 ₽: ${realizedStability.zeroIncomeMonths} мес.`
    : `полных месяцев · нужно ≥3`
  const comparableValue = comparableIncome.available
    ? comparableIncome.changeRatio == null
      ? `${(comparableIncome.changeNet ?? 0) >= 0 ? '+' : ''}${money.format(comparableIncome.changeNet ?? 0)} ₽`
      : `${comparableIncome.changeRatio >= 0 ? '+' : ''}${pct1.format(comparableIncome.changeRatio * 100)}%`
    : null
  const comparableDetail = comparableIncome.available
    ? `те же ${comparableIncome.monthCount} мес. · ${comparableIncome.currentYear}/${comparableIncome.previousYear} · net`
    : null

  const monthRows = data.months.slice(0, 6)
  const monthMax = Math.max(1, ...monthRows.map(row => Number(row.gross) || 0))
  const coverage = integrity.coveragePct
  const next = data.next
  const bondLinkCoveragePct = bondIncomeLinkage.eligibleBondCount
    ? bondIncomeLinkage.valueCoverage * 100
    : null

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
          <div className="income-panel-head">
            <div><span className="eyebrow">РАЗБИВКА ПО АКТИВАМ</span><h2>ИСТОЧНИКИ ДОХОДА</h2></div>
            <small>{observation.available ? `OBS · ${observationCompact}` : 'факт ≠ прогноз'}</small>
          </div>

          <div className="income-profile-grid">
            <article><span>ФАКТ · КУПОНЫ</span><strong>{incomeProfile.actualCoupons ? `${money.format(incomeProfile.actualCoupons)} ₽` : '—'}</strong><small>{data.actual.year ?? 'период'} · {observationCompact}</small></article>
            <article><span>ФАКТ · ДИВИДЕНДЫ</span><strong>{incomeProfile.actualDividends ? `${money.format(incomeProfile.actualDividends)} ₽` : '—'}</strong><small>{latestPayoutMonth ? `${latestPayoutMonth.key} · ${money.format(latestPayoutMonth.totalNet)} ₽ net` : 'нет FACT-выплат'}</small></article>
            <article><span>ФАКТ · TOP SOURCE</span><strong>{realizedTopSource?.ticker ?? '—'}</strong><small>{realizedConcentration.topSourceShare == null ? 'нет FACT-источников' : `${pct1.format(realizedConcentration.topSourceShare * 100)}% · ${realizedConcentration.sourceCount} ист. · Neff ${number2.format(realizedConcentration.effectiveSources ?? 0)}`}</small></article>
            {comparableIncome.available ? (
              <article><span>ФАКТ · СРАВНЕНИЕ</span><strong>{comparableValue}</strong><small>{comparableDetail}</small></article>
            ) : (
              <article><span>ФАКТ · СТАБИЛЬНОСТЬ</span><strong>{stabilityValue}</strong><small>{stabilityDetail}</small></article>
            )}
          </div>

          <IncomeGoalCompact history={realizedHistory} />

          <div className="income-source-table">
            <div className="income-source-row income-source-row--head"><span>Актив</span><span>Получено</span><span>12М / YoC</span></div>
            {sourceRows.length ? sourceRows.map(row => (
              <div className="income-source-row" key={row.key}>
                <div><strong>{row.ticker}</strong><small>{row.name !== row.ticker ? row.name : `${row.factCount + row.forecastCount} событий`}</small></div>
                <b>{row.fact ? `${money2.format(row.fact)} ₽` : '—'}</b>
                <div className="income-source-forecast">
                  <b>{row.forecast ? `${money2.format(row.forecast)} ₽` : '—'}</b>
                  <small>{row.yoc12m == null ? `YoC — · ${incomeSourceIdentityNote(row.identityState)}` : `YoC ${pct1.format(row.yoc12m * 100)}% · FIGI`}</small>
                </div>
              </div>
            )) : <div className="income-empty">Нет данных для разбивки.</div>}
          </div>
          {bondIncomeLinkage.eligibleBondCount > 0 && (
            <div className="income-integrity" title={bondIncomeLinkage.note}>
              <span>BOND → INCOME · {bondIncomeLinkage.linkedBondCount}/{bondIncomeLinkage.eligibleBondCount} по FIGI · {bondIncomeLinkage.couponEvents} куп.</span>
              <i><b style={{ width: `${Math.min(100, Math.max(0, bondLinkCoveragePct ?? 0))}%` }} /></i>
              <strong>{bondLinkCoveragePct == null ? '—' : `${pct.format(bondLinkCoveragePct)}% · ${money.format(bondIncomeLinkage.scheduledGross)} ₽`}</strong>
            </div>
          )}
          <div className="income-integrity">
            <span>Покрытие расписания · {integrity.resolvedAssets}/{integrity.eligibleAssets || '—'}</span>
            <i><b style={{ width: `${coverage == null ? 0 : Math.min(100, coverage)}%` }} /></i>
            <strong>{coverage == null ? '—' : `${pct.format(coverage)}%`}</strong>
          </div>
          <div className={`income-integrity-status is-${integrity.state}`}>
            <b>{integrity.label}</b><span>{integrity.detail}{integrity.errors ? ` · ошибок ${integrity.errors}` : ''}</span>
          </div>
          <p className="income-method-note">FACT-концентрация использует только реально полученные положительные net-выплаты со статусом FACT. TOP SOURCE показывает долю лидера, число источников и эффективное число источников Neff = 1/HHI.</p>
          <p className="income-method-note">BOND → INCOME не создаёт второй купонный прогноз: он повторно использует уже показанные 12М coupon-events и связывает их с текущими облигациями только по FIGI. Сумма справа — часть существующего forecast, а не дополнительный доход. FACT с прогнозом не складывается; reconciliation конкретного полученного купона со строкой schedule остаётся закрытым до общего идентификатора события.</p>
          <p className="income-method-note">12М / YoC остаётся отдельным прогнозным слоем: подтверждённые gross-выплаты на 12 месяцев / стоимость приобретения текущей позиции. Cost basis используется только когда все события строки несут один и тот же FIGI и он однозначно соответствует одной текущей позиции. Ticker/name служат только подписью и никогда не выбирают cost basis. Это не текущая дивидендная доходность.</p>
          <p className="income-method-note">OBS считает нулём только полностью наблюдавшийся календарный месяц. Частичные и отсутствующие месяцы не подменяются нулём; стабильность открывается после 3 полных месяцев, зрелая — после 12. Сравнение периодов появляется только при ≥3 точных парах одинаковых полных месяцев текущего и предыдущего года; 12 пар — зрелое сравнение. Годовой прогноз и годификация короткой истории не применяются.</p>
          {data.warning && <p className="income-warning">{data.warning}</p>}
        </section>
      )}
    </div>
  )
}
