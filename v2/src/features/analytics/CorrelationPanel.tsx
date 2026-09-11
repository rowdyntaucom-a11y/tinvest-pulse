import { useEffect, useMemo, useState } from 'react'
import { calculateCorrelationMatrix, type CorrelationCell, type RiskSeries } from './riskMatrix'
import './correlation.css'

type AssetHistoryResponse = {
  version: '1.0'
  available: boolean
  from?: string
  to?: string
  requested?: number
  availableSeries?: number
  source?: string
  series?: Array<{
    key?: string
    label?: string
    instrumentId?: string
    points?: Array<{ date?: string; value?: number }>
  }>
}

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

function compactLabel(value: string) {
  const text = String(value || '—').trim()
  return text.length <= 8 ? text : `${text.slice(0, 7)}…`
}

function cellTone(value: number | null) {
  if (value == null) return 'is-na'
  if (value < 0) return 'is-negative'
  if (value >= 0.75) return 'is-high'
  if (value <= 0.25) return 'is-low'
  return 'is-mid'
}

export function CorrelationPanel() {
  const [payload, setPayload] = useState<AssetHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch('/api/asset-history', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error(`asset-history ${response.status}`)
        const raw = await response.json() as AssetHistoryResponse
        setPayload(raw)
      } catch (error) {
        if (!controller.signal.aborted) setPayload({ version: '1.0', available: false, series: [] })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  const series = useMemo<RiskSeries[]>(() => {
    const rows = Array.isArray(payload?.series) ? payload.series : []
    return rows
      .map((item, index) => ({
        key: String(item.key || item.instrumentId || `asset-${index + 1}`),
        label: String(item.label || item.key || item.instrumentId || `Актив ${index + 1}`),
        points: (Array.isArray(item.points) ? item.points : [])
          .map(point => ({ date: String(point.date || '').slice(0, 10), value: Number(point.value) }))
          .filter(point => point.date && Number.isFinite(point.value) && point.value > 0),
      }))
      .filter(item => item.points.length >= 2)
      .slice(0, 6)
  }, [payload])

  const matrix = useMemo(() => calculateCorrelationMatrix(series), [series])
  const cells = useMemo(() => {
    const map = new Map<string, CorrelationCell>()
    for (const cell of matrix.cells) {
      map.set(`${cell.a}|${cell.b}`, cell)
      map.set(`${cell.b}|${cell.a}`, cell)
    }
    return map
  }, [matrix])

  const pairs = matrix.cells.filter(cell => cell.a !== cell.b && cell.available && cell.correlation != null)
  const lowest = pairs.length ? pairs.reduce((best, cell) => (cell.correlation! < best.correlation! ? cell : best)) : null
  const highest = pairs.length ? pairs.reduce((best, cell) => (cell.correlation! > best.correlation! ? cell : best)) : null
  const labelByKey = new Map(series.map(item => [item.key, item.label]))

  if (loading) {
    return <section className="panel corr-panel"><div className="corr-loading">ЗАГРУЖАЕМ 365 ДНЕЙ ИСТОРИИ АКТИВОВ…</div></section>
  }

  if (series.length < 2) {
    return (
      <section className="panel corr-panel">
        <div className="panel-head"><div><span className="eyebrow">CORRELATION MATRIX · v1</span><h2>ИСТОРИЯ ЕЩЁ НЕ ГОТОВА</h2></div><small>fail-closed</small></div>
        <p className="corr-note">Нужно минимум два актива с рыночной историей. QVANIX не подставляет искусственные коэффициенты, если T‑Bank не вернул достаточный ряд.</p>
      </section>
    )
  }

  return (
    <section className="panel corr-panel">
      <div className="panel-head corr-headline">
        <div><span className="eyebrow">CORRELATION MATRIX · v{matrix.version}</span><h2>СВЯЗЬ АКТИВОВ</h2></div>
        <small>{payload?.from && payload?.to ? `${payload.from} → ${payload.to}` : '365 дней'} · top {series.length}</small>
      </div>

      <div className="corr-summary">
        <article><span>МИНИМУМ ДАННЫХ</span><strong>{matrix.minimumPairedReturns}</strong><small>парных дневных доходностей</small></article>
        <article><span>САМАЯ НИЗКАЯ ρ</span><strong>{lowest?.correlation == null ? '—' : number.format(lowest.correlation)}</strong><small>{lowest ? `${labelByKey.get(lowest.a)} ↔ ${labelByKey.get(lowest.b)}` : 'пока нет зрелой пары'}</small></article>
        <article><span>САМАЯ ВЫСОКАЯ ρ</span><strong>{highest?.correlation == null ? '—' : number.format(highest.correlation)}</strong><small>{highest ? `${labelByKey.get(highest.a)} ↔ ${labelByKey.get(highest.b)}` : 'пока нет зрелой пары'}</small></article>
      </div>

      <div className="corr-scroll">
        <div className="corr-matrix" style={{ gridTemplateColumns: `60px repeat(${series.length}, minmax(0, 1fr))` }}>
          <span className="corr-corner">ρ</span>
          {series.map(item => <span className="corr-axis corr-axis--top" key={`top-${item.key}`} title={item.label}>{compactLabel(item.label)}</span>)}
          {series.flatMap(row => {
            const cellsForRow = series.map(column => {
              const cell = cells.get(`${row.key}|${column.key}`)
              const value = cell?.available && cell.correlation != null ? cell.correlation : null
              return (
                <span
                  className={`corr-cell ${cellTone(value)}`}
                  key={`${row.key}-${column.key}`}
                  title={`${row.label} ↔ ${column.label}: ${value == null ? 'недостаточно данных' : number.format(value)}${cell ? ` · ${cell.pairedReturns} пар` : ''}`}
                >
                  {value == null ? '—' : number.format(value)}
                </span>
              )
            })
            return [<span className="corr-axis corr-axis--side" key={`side-${row.key}`} title={row.label}>{compactLabel(row.label)}</span>, ...cellsForRow]
          })}
        </div>
      </div>

      <p className="corr-note">Pearson ρ считается по совпадающим дневным доходностям, а не по ценам. Пара скрывается до {matrix.minimumPairedReturns} общих доходностей. Это диагностика структуры портфеля, не торговый сигнал.</p>
    </section>
  )
}
