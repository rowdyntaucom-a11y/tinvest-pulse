import { useMemo, useState } from 'react'
import type { HistoryPoint } from '../../lib/portfolioApi'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

type Mode = 'value' | 'profit' | 'return'
type Period = '7d' | '1m' | '3m' | 'ytd' | '1y' | 'all'

type Props = { points: HistoryPoint[] }

type SeriesPoint = {
  date: string
  primary: number | null
  secondary: number | null
}

const W = 900
const H = 280
const PX = 36
const PY = 24

const periodDays: Partial<Record<Period, number>> = { '7d': 7, '1m': 31, '3m': 93, '1y': 366 }

function filterByPeriod(points: HistoryPoint[], period: Period) {
  if (period === 'all' || points.length < 2) return points
  const last = new Date(points.at(-1)?.date || '')
  if (!Number.isFinite(last.getTime())) return points
  const from = new Date(last)
  if (period === 'ytd') from.setUTCMonth(0, 1)
  else from.setUTCDate(from.getUTCDate() - (periodDays[period] || 0))
  return points.filter(point => {
    const d = new Date(point.date)
    return Number.isFinite(d.getTime()) && d >= from && d <= last
  })
}

function makeSeries(points: HistoryPoint[], mode: Mode): SeriesPoint[] {
  return points.map(point => {
    if (mode === 'value') {
      return { date: point.date, primary: point.value, secondary: point.invested }
    }
    if (mode === 'profit') {
      const result = point.value != null && point.invested != null ? point.value - point.invested : null
      return { date: point.date, primary: result, secondary: null }
    }
    return {
      date: point.date,
      primary: point.portfolio == null ? null : point.portfolio - 100,
      secondary: point.imoex == null ? null : point.imoex - 100,
    }
  })
}

function path(values: Array<number | null>, min: number, max: number) {
  const span = Math.max(1e-9, max - min)
  const denom = Math.max(1, values.length - 1)
  let open = false
  return values.map((value, index) => {
    if (value == null || !Number.isFinite(value)) { open = false; return '' }
    const x = PX + index / denom * (W - PX * 2)
    const y = PY + (1 - (value - min) / span) * (H - PY * 2)
    const command = open ? 'L' : 'M'
    open = true
    return `${command}${x.toFixed(1)},${y.toFixed(1)}`
  }).filter(Boolean).join(' ')
}

function formatValue(value: number, mode: Mode) {
  if (mode === 'return') return `${pct.format(value)}%`
  return `${money.format(value)} ₽`
}

function compactDate(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim())
  return match ? `${match[3]}.${match[2]}` : String(value || '')
}

export function PortfolioValueChart({ points }: Props) {
  const [mode, setMode] = useState<Mode>('value')
  const [period, setPeriod] = useState<Period>('all')

  const sourcePoints = useMemo(
    () => points.filter(point => point.value != null || point.portfolio != null),
    [points],
  )
  const filtered = useMemo(() => filterByPeriod(sourcePoints, period), [sourcePoints, period])
  const series = useMemo(() => makeSeries(filtered, mode), [filtered, mode])

  const primary = series.map(point => point.primary)
  const secondary = series.map(point => point.secondary)
  const finite = [...primary, ...secondary].filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (sourcePoints.length < 2 || finite.length < 2) {
    return <div className="portfolio-chart-empty">История ещё строится. График появится после получения дневных точек.</div>
  }

  let rawMin = Math.min(...finite)
  let rawMax = Math.max(...finite)
  if (mode === 'profit') {
    rawMin = Math.min(rawMin, 0)
    rawMax = Math.max(rawMax, 0)
  }
  const padding = Math.max(mode === 'return' ? .5 : 1, (rawMax - rawMin) * .08)
  const min = rawMin - padding
  const max = rawMax + padding
  const primaryPath = path(primary, min, max)
  const secondaryPath = path(secondary, min, max)
  const hasSecondary = secondary.filter(value => typeof value === 'number' && Number.isFinite(value)).length >= 2
  const latestPrimary = [...primary].reverse().find(value => typeof value === 'number' && Number.isFinite(value)) ?? null
  const firstDate = filtered[0]?.date
  const lastDate = filtered.at(-1)?.date
  const latestLabel = latestPrimary == null
    ? '—'
    : `${compactDate(lastDate)} · ${formatValue(latestPrimary, mode)}`

  const legendPrimary = mode === 'value' ? 'Стоимость' : mode === 'profit' ? 'Результат' : 'Портфель'
  const legendSecondary = mode === 'value' ? 'Внесено' : mode === 'return' ? 'IMOEX' : null

  return (
    <div className="portfolio-chart">
      <div className="portfolio-chart__controls">
        <div className="portfolio-chart__modes">
          <button className={mode === 'value' ? 'is-active' : ''} onClick={() => setMode('value')}>СТОИМОСТЬ</button>
          <button className={mode === 'profit' ? 'is-active' : ''} onClick={() => setMode('profit')}>РЕЗУЛЬТАТ</button>
          <button className={mode === 'return' ? 'is-active' : ''} onClick={() => setMode('return')}>ДОХОДНОСТЬ</button>
        </div>
        <strong title="Последняя историческая точка, не live-снимок портфеля">{latestLabel}</strong>
      </div>

      <div className="portfolio-chart__canvas">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="История портфеля">
          {[0.2, 0.4, 0.6, 0.8].map(k => <line key={k} x1={PX} x2={W - PX} y1={H * k} y2={H * k} className="portfolio-chart__grid" />)}
          {mode === 'profit' && min < 0 && max > 0 && (
            <line x1={PX} x2={W - PX} y1={PY + (1 - (0 - min) / (max - min)) * (H - PY * 2)} y2={PY + (1 - (0 - min) / (max - min)) * (H - PY * 2)} className="portfolio-chart__zero" />
          )}
          {primaryPath && <path d={primaryPath} className="portfolio-chart__line portfolio-chart__line--primary" />}
          {hasSecondary && secondaryPath && <path d={secondaryPath} className="portfolio-chart__line portfolio-chart__line--secondary" />}
        </svg>
      </div>

      <div className="portfolio-chart__legend">
        <span><i className="legend-dot legend-dot--portfolio" />{legendPrimary}</span>
        {legendSecondary && hasSecondary && <span><i className="legend-dot legend-dot--imoex" />{legendSecondary}</span>}
        <small>{firstDate} → {lastDate}</small>
      </div>

      <div className="portfolio-chart__periods" aria-label="Период графика">
        {([['7d','7Д'], ['1m','1М'], ['3m','3М'], ['ytd','YTD'], ['1y','1Г'], ['all','ВСЁ']] as Array<[Period,string]>).map(([key, label]) => (
          <button key={key} className={period === key ? 'is-active' : ''} onClick={() => setPeriod(key)}>{label}</button>
        ))}
      </div>
    </div>
  )
}
