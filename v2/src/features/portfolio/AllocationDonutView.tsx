import { useMemo, useState } from 'react'
import './allocationDonut.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

type Item = {
  label: string
  value: number
  weight: number
}

type Segment = Item & {
  startPct: number
  drawPct: number
}

type Props = {
  items: Item[]
}

function buildSegments(items: Item[]): Segment[] {
  let cursor = 0
  const segments: Segment[] = []
  for (const item of items) {
    const weightPct = Number.isFinite(item.weight) && item.weight > 0 ? item.weight * 100 : 0
    if (weightPct <= 0) continue
    const gap = Math.min(.8, weightPct * .22)
    segments.push({ ...item, startPct: cursor, drawPct: Math.max(.15, weightPct - gap) })
    cursor += weightPct
  }
  return segments
}

export default function AllocationDonutView({ items }: Props) {
  const segments = useMemo(() => buildSegments(items), [items])
  const [selectedLabel, setSelectedLabel] = useState('')
  const selected = segments.find(item => item.label === selectedLabel) ?? segments[0] ?? null

  if (!segments.length) return <div className="allocation-donut allocation-donut--empty">Структура загружается…</div>

  return (
    <div className="allocation-donut" aria-label="Структура портфеля по классам активов">
      <div className="allocation-donut__chart">
        <svg viewBox="0 0 120 120" role="img" aria-label="Кольцевая диаграмма классов активов">
          <circle className="allocation-donut__track" cx="60" cy="60" r="43" pathLength="100" />
          {segments.map(segment => (
            <circle
              key={segment.label}
              className={`allocation-donut__segment ${selected?.label === segment.label ? 'is-selected' : ''}`}
              data-asset-class={segment.label}
              cx="60"
              cy="60"
              r="43"
              pathLength="100"
              strokeDasharray={`${segment.drawPct} ${100 - segment.drawPct}`}
              strokeDashoffset={-segment.startPct}
              transform="rotate(-90 60 60)"
              role="button"
              tabIndex={0}
              aria-label={`${segment.label}: ${pct.format(segment.weight * 100)}%, ${money.format(segment.value)} ₽`}
              onClick={() => setSelectedLabel(segment.label)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedLabel(segment.label)
                }
              }}
            />
          ))}
        </svg>
        <div className="allocation-donut__center" aria-live="polite">
          <span>{selected?.label}</span>
          <strong>{selected ? `${pct.format(selected.weight * 100)}%` : '—'}</strong>
          <small>{selected ? `${money.format(selected.value)} ₽` : '—'}</small>
        </div>
      </div>
      <div className="allocation-donut__legend" aria-label="Классы активов">
        {segments.map(segment => (
          <button
            type="button"
            key={segment.label}
            className={selected?.label === segment.label ? 'is-selected' : ''}
            onClick={() => setSelectedLabel(segment.label)}
          >
            <i data-asset-class={segment.label} aria-hidden="true" />
            <span>{segment.label}</span>
            <strong>{pct.format(segment.weight * 100)}%</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
