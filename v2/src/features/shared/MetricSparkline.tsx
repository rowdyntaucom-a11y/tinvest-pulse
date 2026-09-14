import './metricSparkline.css'

type Props = {
  values: Array<number | null>
  label: string
  maxPoints?: number
}

const W = 120
const H = 28
const PAD = 1.5

export function MetricSparkline({ values, label, maxPoints = 30 }: Props) {
  const safeMaxPoints = Number.isFinite(maxPoints) ? Math.max(2, Math.floor(maxPoints)) : 30
  const visible = values.slice(-safeMaxPoints)
  const finite = visible.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (finite.length < 2) return null

  const min = Math.min(...finite)
  const max = Math.max(...finite)
  const span = Math.max(1e-9, max - min)
  const denominator = Math.max(1, visible.length - 1)
  let open = false
  const path = visible.map((value, index) => {
    if (value == null || !Number.isFinite(value)) {
      open = false
      return ''
    }
    const x = PAD + (index / denominator) * (W - PAD * 2)
    const y = max === min
      ? H / 2
      : PAD + (1 - (value - min) / span) * (H - PAD * 2)
    const command = open ? 'L' : 'M'
    open = true
    return `${command}${x.toFixed(1)},${y.toFixed(1)}`
  }).filter(Boolean).join(' ')

  if (!path) return null

  return (
    <svg
      className="metric-sparkline"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <path d={path} />
    </svg>
  )
}
