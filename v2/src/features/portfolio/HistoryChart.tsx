import { useEffect, useMemo, useState } from 'react'
import type { HistoryPoint } from '../../lib/portfolioApi'
import { loadTransactionMarkers, type TransactionMarkerPayload } from './transactionMarkerApi'
import type { TransactionMarker } from './transactionMarkers'
import './transactionMarkers.css'

type Props = { points: HistoryPoint[] }

const W = 900
const H = 280
const PAD_X = 34
const PAD_Y = 24
const MAX_VISIBLE_EVENT_DAYS = 18

const linePath = (values: Array<number | null>, min: number, max: number) => {
  const finite = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (finite.length < 2) return ''
  const span = Math.max(1e-9, max - min)
  const denom = Math.max(1, values.length - 1)
  let open = false
  return values.map((v, i) => {
    if (v == null || !Number.isFinite(v)) { open = false; return '' }
    const x = PAD_X + (i / denom) * (W - PAD_X * 2)
    const y = PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2)
    const cmd = open ? 'L' : 'M'
    open = true
    return `${cmd}${x.toFixed(1)},${y.toFixed(1)}`
  }).filter(Boolean).join(' ')
}

const lastFinite = (values: Array<number | null>) => {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const value = values[i]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}

type MarkerDay = {
  date: string
  index: number
  buys: number
  sells: number
}

function markerDaysForChart(markers: TransactionMarker[], chartPoints: HistoryPoint[]): MarkerDay[] {
  const indexByDate = new Map(chartPoints.map((point, index) => [point.date, index]))
  const grouped = new Map<string, { buys: number; sells: number }>()

  for (const marker of markers) {
    const date = marker.date.slice(0, 10)
    if (!indexByDate.has(date)) continue
    const row = grouped.get(date) ?? { buys: 0, sells: 0 }
    if (marker.side === 'BUY') row.buys += 1
    else row.sells += 1
    grouped.set(date, row)
  }

  return [...grouped.entries()]
    .map(([date, row]) => ({ date, index: indexByDate.get(date)!, ...row }))
    .sort((a, b) => a.index - b.index)
}

export function HistoryChart({ points }: Props) {
  const [markerPayload, setMarkerPayload] = useState<TransactionMarkerPayload | null>(null)
  const chartPoints = useMemo(
    () => points.filter(p => p.portfolio != null || p.imoex != null),
    [points],
  )

  useEffect(() => {
    let active = true
    void loadTransactionMarkers().then(value => {
      if (active) setMarkerPayload(value)
    })
    return () => { active = false }
  }, [])

  const markerDays = useMemo(
    () => markerDaysForChart(markerPayload?.markers ?? [], chartPoints),
    [markerPayload, chartPoints],
  )

  if (chartPoints.length < 2) {
    return <div className="history-empty">История ещё строится. График появится после получения дневных точек.</div>
  }

  const portfolioValues = chartPoints.map(p => p.portfolio)
  const imoexValues = chartPoints.map(p => p.imoex)
  const allFinite = [...portfolioValues, ...imoexValues].filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  const rawMin = Math.min(...allFinite)
  const rawMax = Math.max(...allFinite)
  const padding = Math.max(1, (rawMax - rawMin) * 0.08)
  const min = rawMin - padding
  const max = rawMax + padding
  const portfolioPath = linePath(portfolioValues, min, max)
  const imoexPath = linePath(imoexValues, min, max)
  const portfolioCount = portfolioValues.filter(v => typeof v === 'number' && Number.isFinite(v)).length
  const imoexCount = imoexValues.filter(v => typeof v === 'number' && Number.isFinite(v)).length
  const hasImoex = imoexCount >= 2
  const benchmarkCoverage = portfolioCount ? Math.round((imoexCount / portfolioCount) * 100) : 0
  const latestPortfolio = lastFinite(portfolioValues)
  const latestImoex = lastFinite(imoexValues)
  const first = chartPoints[0]?.date
  const last = chartPoints.at(-1)?.date
  const visibleMarkerDays = markerDays.slice(-MAX_VISIBLE_EVENT_DAYS)
  const eventDenom = Math.max(1, chartPoints.length - 1)
  const totalBuys = markerDays.reduce((sum, row) => sum + row.buys, 0)
  const totalSells = markerDays.reduce((sum, row) => sum + row.sells, 0)

  return (
    <div className="history-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Доходность портфеля и IMOEX на общей шкале">
        {[0.2, 0.4, 0.6, 0.8].map(k => (
          <line key={k} x1={PAD_X} x2={W - PAD_X} y1={H * k} y2={H * k} className="history-gridline" />
        ))}
        {portfolioPath && <path d={portfolioPath} className="history-line history-line--portfolio" />}
        {hasImoex && imoexPath && <path d={imoexPath} className="history-line history-line--imoex" />}
        {visibleMarkerDays.map(day => {
          const x = PAD_X + (day.index / eventDenom) * (W - PAD_X * 2)
          const tone = day.buys > 0 && day.sells > 0 ? 'mixed' : day.buys > 0 ? 'buy' : 'sell'
          return (
            <line
              key={`tx-${day.date}`}
              x1={x}
              x2={x}
              y1={H - PAD_Y + 2}
              y2={H - PAD_Y + 14}
              className={`history-event-tick history-event-tick--${tone}`}
            >
              <title>{`${day.date} · BUY ${day.buys} · SELL ${day.sells} · отметка только по дате, не по цене`}</title>
            </line>
          )
        })}
      </svg>
      <div className="history-legend">
        <span><i className="legend-dot legend-dot--portfolio" />Портфель{latestPortfolio == null ? '' : ` · ${latestPortfolio.toFixed(1)}`}</span>
        {hasImoex
          ? <span><i className="legend-dot legend-dot--imoex" />IMOEX{latestImoex == null ? '' : ` · ${latestImoex.toFixed(1)}`} · покрытие {benchmarkCoverage}%</span>
          : <span>IMOEX: данные ещё не готовы</span>}
        <small title={markerDays.length ? 'Сделки отмечены только по дате исполнения. Цена сделки и координата доходности не реконструируются.' : undefined}>
          {first} → {last}{markerDays.length ? ` · сделки ${visibleMarkerDays.length}/${markerDays.length} дн. · B${totalBuys}/S${totalSells}` : ''}
        </small>
      </div>
    </div>
  )
}
