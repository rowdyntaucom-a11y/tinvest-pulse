import type { HistoryPoint } from '../../lib/portfolioApi'

type Props = { points: HistoryPoint[] }

const W = 900
const H = 280
const PAD_X = 34
const PAD_Y = 24

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

export function HistoryChart({ points }: Props) {
  const chartPoints = points.filter(p => p.portfolio != null || p.imoex != null)
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
  const hasImoex = imoexValues.filter(v => typeof v === 'number' && Number.isFinite(v)).length >= 2
  const first = chartPoints[0]?.date
  const last = chartPoints.at(-1)?.date

  return (
    <div className="history-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Доходность портфеля и IMOEX на общей шкале">
        {[0.2, 0.4, 0.6, 0.8].map(k => (
          <line key={k} x1={PAD_X} x2={W - PAD_X} y1={H * k} y2={H * k} className="history-gridline" />
        ))}
        {portfolioPath && <path d={portfolioPath} className="history-line history-line--portfolio" />}
        {hasImoex && imoexPath && <path d={imoexPath} className="history-line history-line--imoex" />}
      </svg>
      <div className="history-legend">
        <span><i className="legend-dot legend-dot--portfolio" />Портфель</span>
        {hasImoex ? <span><i className="legend-dot legend-dot--imoex" />IMOEX</span> : <span>IMOEX: данные ещё не готовы</span>}
        <small>{first} → {last}</small>
      </div>
    </div>
  )
}
