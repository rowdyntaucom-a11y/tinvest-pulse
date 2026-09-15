import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { type PayoutCalendar, type PayoutEvent } from '../../lib/payoutsApi'
import { usePayoutSnapshot } from '../../lib/payoutSnapshot'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { InstrumentBadge } from '../portfolio/InstrumentBadge'
import { loadInstrumentBadges, type InstrumentBadgePayload } from '../portfolio/instrumentBadges'
import { getIncomeIntegrity } from './incomeIntegrity'
import { buildRealizedIncomeHistory, calculateIncomeSourceConcentration, calculateIncomeStability } from './incomeHistory'
import { calculateIncomeComparablePeriod } from './incomeComparables'
import { buildBondIncomeLinkage } from './bondIncomeLinkage'
import { buildIncomeSourceRows } from './incomeSourceRows'
import { buildIncomeCalendarVisual, filterIncomeCalendarEvents } from './incomeCalendarVisual'
import { findPayoutEventPosition, payoutEventIsConfirmed } from './incomeCalendarEventView'
import { IncomeGoalCompact } from './IncomeGoalCompact'
import './income.css'
import './incomeCompact.css'
import './incomeCalendarVisual.css'

const IncomeTaxPanel = lazy(() => import('./IncomeTaxPanel'))

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct1 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' })

type View = 'overview' | 'calendar' | 'sources' | 'taxes'

type Props = {
  passiveIncome: number
  averageMonthlyPassiveIncome: number
  startDate: string
  positions: PositionSnapshot[]
  onOpenAsset: (position: PositionSnapshot) => void
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

export function IncomeWorkspace({ passiveIncome, averageMonthlyPassiveIncome, startDate, positions, onOpenAsset }: Props) {
  const [view, setView] = useState<View>('overview')
  const [page, setPage] = useState(0)
  const [calendarMonth, setCalendarMonth] = useState<string | null>(null)
  const [badgePayload, setBadgePayload] = useState<InstrumentBadgePayload | null>(null)
  const { calendar, loading } = usePayoutSnapshot(true)
  const data = calendar ?? empty

  const calendarMonths = useMemo(
    () => buildIncomeCalendarVisual(data.events, data.period.from, 12),
    [data.events, data.period.from],
  )
  const filteredCalendarEvents = useMemo(
    () => filterIncomeCalendarEvents(data.events, calendarMonth),
    [data.events, calendarMonth],
  )
  const upcoming = filteredCalendarEvents.slice(0, 20)
  const pageSize = 5
  const pages = Math.max(1, Math.ceil(upcoming.length / pageSize))
  const safePage = Math.min(page, pages - 1)
  const visibleUpcoming = upcoming.slice(safePage * pageSize, safePage * pageSize + pageSize)
  const selectedCalendarMonth = calendarMonth ? calendarMonths.find(month => month.key === calendarMonth) ?? null : null

  useEffect(() => {
    if (view !== 'calendar' || badgePayload) return
    let active = true
    loadInstrumentBadges().then(payload => {
      if (active) setBadgePayload(payload)
    })
    return () => { active = false }
  }, [view, badgePayload])

  useEffect(() => {
    if (!calendarMonth) return
    if (calendarMonths.some(month => month.key === calendarMonth)) return
    setCalendarMonth(null)
    setPage(0)
  }, [calendarMonth, calendarMonths])

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
    ? realizedStability.status === 'mature' ? 'ЗРЕЛАЯ' : 'ПРЕДВ.'
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
    ? `те же ${comparableIncome.monthCount} мес. · ${comparableIncome.currentYear}/${comparableIncome.previousYear} · после налога`
    : null

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
        <button className={view === 'taxes' ? 'is-active' : ''} onClick={() => setView('taxes')}>НАЛОГИ</button>
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
            <span className="eyebrow">12М · ПОДТВЕРЖДЁННЫЕ ВЫПЛАТЫ</span>
            <strong>{data.available && data.forecast.gross ? `${money.format(data.forecast.gross)} ₽` : '—'}</strong>
            <small>до налога · только выплаты из расписания текущих позиций</small>
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
                <small>{eventAmount(next) ? `${money2.format(eventAmount(next))} ₽ · до налога` : 'сумма уточняется'}{typeof next.days === 'number' ? ` · через ${next.days} дн.` : ''}</small>
              </>
            ) : <div className="income-empty">Подтверждённых будущих выплат пока нет.</div>}
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

          {calendarMonths.length > 0 && (
            <div className="income-calendar-ribbon" aria-label="Фильтр выплат по месяцам">
              <button
                type="button"
                className={`income-calendar-reset ${calendarMonth == null ? 'is-active' : ''}`}
                aria-pressed={calendarMonth == null}
                onClick={() => { setCalendarMonth(null); setPage(0) }}
              >
                <span>ВСЕ</span>
              </button>
              {calendarMonths.map(month => (
                <button
                  type="button"
                  key={month.key}
                  className={`${calendarMonth === month.key ? 'is-active' : ''} ${month.count === 0 ? 'is-empty' : ''}`}
                  aria-pressed={calendarMonth === month.key}
                  title={`${month.label} · ${month.count} событий${month.grossAvailable ? ` · ${money2.format(month.gross)} ₽ до налога` : ''}`}
                  onClick={() => { setCalendarMonth(month.key); setPage(0) }}
                >
                  <span>{month.label}</span>
                  <b>{month.count}</b>
                  <small>{month.grossAvailable ? `${money.format(month.gross)} ₽` : month.count ? 'сумма —' : 'тихо'}</small>
                  <i aria-hidden="true" style={{ transform: `scaleX(${month.intensity})` }} />
                </button>
              ))}
            </div>
          )}

          <div className="income-calendar-filter-summary">
            {selectedCalendarMonth
              ? <><b>{selectedCalendarMonth.label}</b> · {filteredCalendarEvents.length} подтверждённых событий · фильтр действует на список ниже</>
              : <>Все подтверждённые события в текущем 12-месячном окне</>}
          </div>

          <div className="income-events">
            {visibleUpcoming.length ? visibleUpcoming.map((event, index) => {
              const matchedPosition = findPayoutEventPosition(event, positions)
              const badgePosition = matchedPosition
                ? { ...matchedPosition, instrumentUid: event.instrumentUid ?? null }
                : null
              const confirmed = payoutEventIsConfirmed(event)
              return (
                <div className="income-event" key={`${event.kind}-${event.ticker}-${event.date}-${index}`}>
                  <time>{dateFmt.format(new Date(event.date))}</time>
                  <div className="income-event-asset">
                    {badgePosition && <InstrumentBadge payload={badgePayload} position={badgePosition} />}
                    <div className="income-event-copy">
                      <strong>{event.ticker || event.name}</strong>
                      <span>{eventKind(event)}{!confirmed && event.confidence ? ` · ${event.confidence}` : ''}</span>
                    </div>
                  </div>
                  <div className="income-event-tail">
                    <b>{eventAmount(event) ? `${money2.format(eventAmount(event))} ₽` : '—'}</b>
                    {confirmed && <span className="income-event-status">ПОДТВЕРЖДЕНО</span>}
                  </div>
                </div>
              )
            }) : <div className="income-empty">{loading ? 'Получаем расписание Т-Банка…' : calendarMonth ? 'В выбранном месяце подтверждённых выплат нет.' : 'Будущие выплаты не найдены.'}</div>}
          </div>
          <p className="income-method-note">Будущие суммы не смешиваются с фактом. Здесь показываются суммы до налога из официального расписания Т‑Банка для текущих позиций; дивиденды без подтверждённого события не прогнозируются. Метка ПОДТВЕРЖДЕНО отображается только для событий с подтверждённым HIGH-статусом источника; логотип используется только после точного FIGI-сопоставления с текущей позицией.</p>
          {data.stale && <p className="income-warning">Расписание временно не обновилось: используется последний полный снимок.</p>}
        </section>
      )}

      {view === 'sources' && (
        <section className="panel income-sources-panel">
          <div className="income-panel-head">
            <div><span className="eyebrow">РАЗБИВКА ПО АКТИВАМ</span><h2>ИСТОЧНИКИ ДОХОДА</h2></div>
            <small>{observation.available ? `НАБЛЮДЕНИЕ · ${observationCompact}` : 'факт ≠ прогноз'}</small>
          </div>

          <div className="income-profile-grid">
            <article><span>ФАКТ · КУПОНЫ</span><strong>{incomeProfile.actualCoupons ? `${money.format(incomeProfile.actualCoupons)} ₽` : '—'}</strong><small>{data.actual.year ?? 'период'} · {observationCompact}</small></article>
            <article><span>ФАКТ · ДИВИДЕНДЫ</span><strong>{incomeProfile.actualDividends ? `${money.format(incomeProfile.actualDividends)} ₽` : '—'}</strong><small>{latestPayoutMonth ? `${latestPayoutMonth.key} · ${money.format(latestPayoutMonth.totalNet)} ₽ после налога` : 'нет полученных выплат'}</small></article>
            <article><span>ФАКТ · ГЛАВНЫЙ ИСТОЧНИК</span><strong>{realizedTopSource?.ticker ?? '—'}</strong><small>{realizedConcentration.topSourceShare == null ? 'нет полученных выплат' : `${pct1.format(realizedConcentration.topSourceShare * 100)}% · ${realizedConcentration.sourceCount} ист. · эфф. ${number2.format(realizedConcentration.effectiveSources ?? 0)}`}</small></article>
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
              <button type="button" className="income-source-row income-source-row--action" key={row.key} disabled={!row.matchBasis} onClick={() => { const position=positions.find(item=>item.figi?.toUpperCase()===row.figi); if(position) onOpenAsset(position) }}>
                <div><strong>{row.ticker}</strong><small>{row.name !== row.ticker ? row.name : `${row.factCount + row.forecastCount} событий`}</small></div>
                <b>{row.fact ? `${money2.format(row.fact)} ₽` : '—'}</b>
                <div className="income-source-forecast">
                  <b>{row.forecast ? `${money2.format(row.forecast)} ₽` : '—'}</b>
                  <small>{row.yoc12m == null ? `YoC — · ${incomeSourceIdentityNote(row.identityState)}` : `YoC ${pct1.format(row.yoc12m * 100)}% · FIGI`}</small>
                </div>
              </button>
            )) : <div className="income-empty">Нет данных для разбивки.</div>}
          </div>
          {bondIncomeLinkage.eligibleBondCount > 0 && (
            <div className="income-integrity" title={bondIncomeLinkage.note}>
              <span>ОБЛИГАЦИИ → ДОХОД · {bondIncomeLinkage.linkedBondCount}/{bondIncomeLinkage.eligibleBondCount} по FIGI · {bondIncomeLinkage.couponEvents} куп.</span>
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
          <p className="income-method-note">Концентрация фактического дохода использует только реально полученные положительные выплаты после налога. ГЛАВНЫЙ ИСТОЧНИК показывает долю лидера, число источников и эффективное число источников = 1/HHI.</p>
          <p className="income-method-note">ОБЛИГАЦИИ → ДОХОД не создаёт второй купонный прогноз: блок повторно использует уже показанные купонные события на 12 месяцев и связывает их с текущими облигациями только по FIGI. Сумма справа — часть существующего расписания, а не дополнительный доход. Полученные выплаты с прогнозом не складываются; точная сверка конкретного купона со строкой расписания остаётся закрытой до общего идентификатора события.</p>
          <p className="income-method-note">12М / YoC остаётся отдельным прогнозным слоем: подтверждённые выплаты до налога на 12 месяцев / стоимость приобретения текущей позиции. Стоимость приобретения используется только когда все события строки несут один и тот же FIGI и он однозначно соответствует одной текущей позиции. Тикер/название служат только подписью и никогда не выбирают стоимость приобретения. Это не текущая дивидендная доходность.</p>
          <p className="income-method-note">НАБЛЮДЕНИЕ считает нулём только полностью наблюдавшийся календарный месяц. Частичные и отсутствующие месяцы не подменяются нулём; стабильность открывается после 3 полных месяцев, зрелая — после 12. Сравнение периодов появляется только при ≥3 точных парах одинаковых полных месяцев текущего и предыдущего года; 12 пар — зрелое сравнение. Короткая история не пересчитывается в годовой темп.</p>
          {data.warning && <p className="income-warning">{data.warning}</p>}
        </section>
      )}

      {view === 'taxes' && (
        <Suspense fallback={<section className="panel"><div className="income-empty">Налоговая аналитика загружается…</div></section>}>
          <IncomeTaxPanel calendar={data} />
        </Suspense>
      )}
    </div>
  )
}
