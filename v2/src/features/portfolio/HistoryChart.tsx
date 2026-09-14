import { useEffect, useMemo, useState } from 'react'
import type { HistoryPoint } from '../../lib/portfolioApi'
import { loadTransactionMarkers, type TransactionMarkerPayload } from './transactionMarkerApi'
import { buildTransactionMarkerPresentation } from './transactionMarkerPresentation'
import './transactionMarkers.css'

type Props = { points: HistoryPoint[] }
type HistoryPeriod = '1m' | '3m' | '6m' | '1y' | 'all'

const W = 900
const H = 280
const PAD_X = 34
const PAD_Y = 24
const DAY_MS = 86_400_000

const PERIODS: Array<{ key: HistoryPeriod; label: string; days: number | null; minimumSpanDays: number }> = [
  { key: '1m', label: '1М', days: 30, minimumSpanDays: 28 },
  { key: '3m', label: '3М', days: 90, minimumSpanDays: 80 },
  { key: '6m', label: '6М', days: 180, minimumSpanDays: 170 },
  { key: '1y', label: '1Г', days: 365, minimumSpanDays: 350 },
  { key: 'all', label: 'ВСЁ', days: null, minimumSpanDays: 0 },
]

const pointXY = (value: number, index: number, count: number, min: number, max: number) => {
  const span = Math.max(1e-9, max - min)
  const denom = Math.max(1, count - 1)
  return {
    x: PAD_X + (index / denom) * (W - PAD_X * 2),
    y: PAD_Y + (1 - (value - min) / span) * (H - PAD_Y * 2),
  }
}

const linePath = (values: Array<number | null>, min: number, max: number) => {
  const finite = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (finite.length < 2) return ''
  let open = false
  return values.map((v, i) => {
    if (v == null || !Number.isFinite(v)) { open = false; return '' }
    const { x, y } = pointXY(v, i, values.length, min, max)
    const cmd = open ? 'L' : 'M'
    open = true
    return `${cmd}${x.toFixed(1)},${y.toFixed(1)}`
  }).filter(Boolean).join(' ')
}

type SpreadSegment = { id: string; tone: 'ahead' | 'behind'; points: string }

const buildSpreadSegments = (
  portfolio: Array<number | null>,
  benchmark: Array<number | null>,
  min: number,
  max: number,
): SpreadSegment[] => {
  const count = Math.min(portfolio.length, benchmark.length)
  const segments: SpreadSegment[] = []
  for (let i = 0; i < count - 1; i += 1) {
    const p0 = portfolio[i]
    const p1 = portfolio[i + 1]
    const b0 = benchmark[i]
    const b1 = benchmark[i + 1]
    if (![p0, p1, b0, b1].every(v => typeof v === 'number' && Number.isFinite(v))) continue

    const pp0 = pointXY(p0 as number, i, count, min, max)
    const pp1 = pointXY(p1 as number, i + 1, count, min, max)
    const bb0 = pointXY(b0 as number, i, count, min, max)
    const bb1 = pointXY(b1 as number, i + 1, count, min, max)
    const d0 = (p0 as number) - (b0 as number)
    const d1 = (p1 as number) - (b1 as number)

    if (d0 === 0 || d1 === 0 || Math.sign(d0) === Math.sign(d1)) {
      const tone = (d0 + d1) >= 0 ? 'ahead' : 'behind'
      segments.push({
        id: `${i}-${tone}`,
        tone,
        points: `${pp0.x},${pp0.y} ${pp1.x},${pp1.y} ${bb1.x},${bb1.y} ${bb0.x},${bb0.y}`,
      })
      continue
    }

    const t = Math.abs(d0) / (Math.abs(d0) + Math.abs(d1))
    const cross = {
      x: pp0.x + (pp1.x - pp0.x) * t,
      y: pp0.y + (pp1.y - pp0.y) * t,
    }
    const firstTone = d0 > 0 ? 'ahead' : 'behind'
    const secondTone = d1 > 0 ? 'ahead' : 'behind'
    segments.push({ id: `${i}-${firstTone}-a`, tone: firstTone, points: `${pp0.x},${pp0.y} ${cross.x},${cross.y} ${bb0.x},${bb0.y}` })
    segments.push({ id: `${i}-${secondTone}-b`, tone: secondTone, points: `${cross.x},${cross.y} ${pp1.x},${pp1.y} ${bb1.x},${bb1.y}` })
  }
  return segments
}

const latestPairedPoint = (points: HistoryPoint[]) => {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const point = points[i]
    if (
      typeof point.portfolio === 'number' && Number.isFinite(point.portfolio)
      && typeof point.imoex === 'number' && Number.isFinite(point.imoex)
    ) {
      return { date: point.date, portfolio: point.portfolio, imoex: point.imoex, spread: point.portfolio - point.imoex }
    }
  }
  return null
}

const historySpanDays = (points: HistoryPoint[]) => {
  if (points.length < 2) return 0
  const first = Date.parse(`${points[0].date}T00:00:00Z`)
  const last = Date.parse(`${points.at(-1)!.date}T00:00:00Z`)
  return Number.isFinite(first) && Number.isFinite(last) && last >= first ? Math.floor((last - first) / DAY_MS) : 0
}

const sliceHistoryPeriod = (points: HistoryPoint[], period: HistoryPeriod) => {
  const config = PERIODS.find(item => item.key === period)
  if (!config?.days || points.length < 2) return points
  const lastTimestamp = Date.parse(`${points.at(-1)!.date}T00:00:00Z`)
  if (!Number.isFinite(lastTimestamp)) return points
  const cutoff = lastTimestamp - config.days * DAY_MS
  return points.filter(point => {
    const timestamp = Date.parse(`${point.date}T00:00:00Z`)
    return Number.isFinite(timestamp) && timestamp >= cutoff
  })
}

export function HistoryChart({ points }: Props) {
  const [markerPayload, setMarkerPayload] = useState<TransactionMarkerPayload | null>(null)
  const [period, setPeriod] = useState<HistoryPeriod>('all')
  const allChartPoints = useMemo(
    () => points.filter(p => p.portfolio != null || p.imoex != null),
    [points],
  )
  const spanDays = useMemo(() => historySpanDays(allChartPoints), [allChartPoints])
  const availablePeriods = useMemo(
    () => PERIODS.filter(item => item.key === 'all' || spanDays >= item.minimumSpanDays),
    [spanDays],
  )
  const chartPoints = useMemo(
    () => sliceHistoryPeriod(allChartPoints, period),
    [allChartPoints, period],
  )

  useEffect(() => {
    let active = true
    void loadTransactionMarkers().then(value => {
      if (active) setMarkerPayload(value)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!availablePeriods.some(item => item.key === period)) setPeriod('all')
  }, [availablePeriods, period])

  const markerPresentation = useMemo(
    () => buildTransactionMarkerPresentation(markerPayload?.markers ?? [], chartPoints),
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
  const spreadSegments = hasImoex ? buildSpreadSegments(portfolioValues, imoexValues, min, max) : []
  const benchmarkCoverage = portfolioCount ? Math.round((imoexCount / portfolioCount) * 100) : 0
  const pairedLatest = latestPairedPoint(chartPoints)
  const first = chartPoints[0]?.date
  const last = chartPoints.at(-1)?.date
  const eventDenom = Math.max(1, chartPoints.length - 1)
  const pairedDateLabel = pairedLatest?.date
    ? new Date(`${pairedLatest.date}T00:00:00Z`).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    : null

  return (
    <div className="history-chart">
      <div className="history-periods" aria-label="Период графика">
        <span>ПЕРИОД</span>
        {availablePeriods.map(item => (
          <button
            type="button"
            key={item.key}
            className={period === item.key ? 'is-active' : ''}
            aria-pressed={period === item.key}
            onClick={() => setPeriod(item.key)}
          >
            {item.label}
          </button>
        ))}
        <small>{spanDays ? `доступно ${spanDays + 1} д.` : 'история загружается'}</small>
      </div>
      {pairedLatest && (
        <div className={`history-narrative ${pairedLatest.spread >= 0 ? 'history-narrative--ahead' : 'history-narrative--behind'}`}>
          <span>ПОСЛЕДНЯЯ ОБЩАЯ ТОЧКА{pairedDateLabel ? ` · ${pairedDateLabel}` : ''}</span>
          <strong>Портфель {pairedLatest.spread >= 0 ? 'выше' : 'ниже'} IMOEX на {Math.abs(pairedLatest.spread).toFixed(1)} п.</strong>
          <small>Сравнение нормализованных индексов на одной дате; это не альфа и не прогноз.</small>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Доходность портфеля и IMOEX на общей шкале">
        {[0.2, 0.4, 0.6, 0.8].map(k => <line key={k} x1={PAD_X} x2={W - PAD_X} y1={H * k} y2={H * k} className="history-gridline" />)}
        {spreadSegments.map(segment => <polygon key={segment.id} points={segment.points} className={`history-spread history-spread--${segment.tone}`} />)}
        {portfolioPath && <path d={portfolioPath} className="history-line history-line--portfolio" />}
        {hasImoex && imoexPath && <path d={imoexPath} className="history-line history-line--imoex" />}
        {markerPresentation.visibleEventDays.map(day => {
          const x = PAD_X + (day.index / eventDenom) * (W - PAD_X * 2)
          const tone = day.buys > 0 && day.sells > 0 ? 'mixed' : day.buys > 0 ? 'buy' : 'sell'
          return (
            <line key={`tx-${day.date}`} x1={x} x2={x} y1={H - PAD_Y + 2} y2={H - PAD_Y + 14} className={`history-event-tick history-event-tick--${tone}`}>
              <title>{`${day.date} · BUY ${day.buys} · SELL ${day.sells} · отметка только по дате, не по цене`}</title>
            </line>
          )
        })}
      </svg>
      <div className="history-legend">
        <span><i className="legend-dot legend-dot--portfolio" />Портфель{pairedLatest == null ? '' : ` · ${pairedLatest.portfolio.toFixed(1)}`}</span>
        {hasImoex
          ? <span><i className="legend-dot legend-dot--imoex" />IMOEX{pairedLatest == null ? '' : ` · ${pairedLatest.imoex.toFixed(1)}`} · покрытие {benchmarkCoverage}%</span>
          : <span>IMOEX: данные ещё не готовы</span>}
        {pairedLatest != null && <span className={pairedLatest.spread >= 0 ? 'history-relative history-relative--ahead' : 'history-relative history-relative--behind'}>Δ {pairedLatest.spread >= 0 ? '+' : ''}{pairedLatest.spread.toFixed(1)} п.</span>}
        <small title={markerPresentation.eventDays.length ? 'Сделки отмечены только по дате исполнения. Цена сделки и координата доходности не реконструируются.' : undefined}>
          {first} → {last}{markerPresentation.eventDays.length ? ` · сделки ${markerPresentation.visibleEventDays.length}/${markerPresentation.eventDays.length} дн. · B${markerPresentation.totalBuys}/S${markerPresentation.totalSells}` : ''}
        </small>
      </div>
    </div>
  )
}
