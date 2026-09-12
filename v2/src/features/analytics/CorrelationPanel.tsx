import { useEffect, useMemo, useState } from 'react'
import { calculateAllocationDiagnostics, type AllocationScenario } from './allocationDiagnostics'
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
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

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

function scenarioLabel(method: AllocationScenario['method']) {
  if (method === 'EQUAL_WEIGHT') return 'EQUAL WEIGHT'
  if (method === 'MIN_VARIANCE_LONG_ONLY') return 'MIN VAR · LONG ONLY'
  return 'EQUAL RISK'
}

function AllocationScenarioRow({ scenario }: { scenario: AllocationScenario }) {
  const weights = [...scenario.weights].sort((a, b) => b.weight - a.weight)
  const weightLine = weights
    .map(row => `${compactLabel(row.label)} ${pct.format(row.weight * 100)}%`)
    .join(' · ')

  return (
    <article className={`allocation-scenario ${scenario.available ? '' : 'is-unavailable'}`}>
      <div>
        <span>{scenarioLabel(scenario.method)}</span>
        <strong>{scenario.available && scenario.annualizedVolatility != null ? `${pct.format(scenario.annualizedVolatility * 100)}% vol` : '—'}</strong>
      </div>
      <small title={weightLine}>{scenario.available ? weightLine : scenario.note}</small>
    </article>
  )
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
  const allocation = useMemo(() => calculateAllocationDiagnostics(series), [series])
  const cells = useMemo(() => {
    const map = new Map<string, CorrelationCell>()
    for (const cell of matrix.cells) {
      map.set(`${cell.a}|${cell.b}`, cell)
      map.set(`${cell.b}|${cell.a}`, cell)
    }
    return map
  }, [matrix])

  const pairs = matrix.cells.filter(cell => cell.a !== cell.b)
  const readyPairs = pairs.filter(cell => cell.available && cell.correlation != null)
  const maturePairs = readyPairs.filter(cell => cell.mature)
  const lowest = readyPairs.length ? readyPairs.reduce((best, cell) => (cell.correlation! < best.correlation! ? cell : best)) : null
  const highest = readyPairs.length ? readyPairs.reduce((best, cell) => (cell.correlation! > best.correlation! ? cell : best)) : null
  const labelByKey = new Map(series.map(item => [item.key, item.label]))
  const requestedSeries = Math.max(series.length, Number(payload?.requested) || 0)
  const availableSeries = Math.max(series.length, Number(payload?.availableSeries) || 0)
  const allocationScenarios = [allocation.equalWeight, allocation.minimumVariance, allocation.equalRiskContribution]
    .filter((scenario): scenario is AllocationScenario => scenario != null)

  if (loading) {
    return <section className="panel corr-panel"><div className="corr-loading">ЗАГРУЖАЕМ 365 ДНЕЙ ИСТОРИИ АКТИВОВ…</div></section>
  }

  if (series.length < 2) {
    return (
      <section className="panel corr-panel">
        <div className="panel-head"><div><span className="eyebrow">CORRELATION MATRIX · v1.1</span><h2>ИСТОРИЯ ЕЩЁ НЕ ГОТОВА</h2></div><small>fail-closed</small></div>
        <p className="corr-note">Нужно минимум два актива с рыночной историей. QVANIX не подставляет искусственные коэффициенты, если T‑Bank не вернул достаточный ряд.</p>
      </section>
    )
  }

  return (
    <section className="panel corr-panel">
      <div className="panel-head corr-headline">
        <div><span className="eyebrow">CORRELATION MATRIX · v{matrix.version}</span><h2>СВЯЗЬ АКТИВОВ</h2></div>
        <small>
          {payload?.from && payload?.to ? `${payload.from} → ${payload.to}` : '365 дней'}
          {requestedSeries ? ` · серии ${availableSeries}/${requestedSeries}` : ` · top ${series.length}`}
        </small>
      </div>

      <div className="corr-summary">
        <article><span>ГОТОВЫЕ ПАРЫ</span><strong>{readyPairs.length}/{pairs.length}</strong><small>mature {maturePairs.length} · gate {matrix.minimumPairedReturns}/{matrix.maturePairedReturns}</small></article>
        <article><span>САМАЯ НИЗКАЯ ρ</span><strong>{lowest?.correlation == null ? '—' : number.format(lowest.correlation)}</strong><small>{lowest ? `${labelByKey.get(lowest.a)} ↔ ${labelByKey.get(lowest.b)}` : 'пока нет готовой пары'}</small></article>
        <article><span>САМАЯ ВЫСОКАЯ ρ</span><strong>{highest?.correlation == null ? '—' : number.format(highest.correlation)}</strong><small>{highest ? `${labelByKey.get(highest.a)} ↔ ${labelByKey.get(highest.b)}` : 'пока нет готовой пары'}</small></article>
      </div>

      <div className="corr-scroll">
        <div className="corr-matrix" style={{ gridTemplateColumns: `60px repeat(${series.length}, minmax(0, 1fr))` }}>
          <span className="corr-corner">ρ</span>
          {series.map(item => <span className="corr-axis corr-axis--top" key={`top-${item.key}`} title={item.label}>{compactLabel(item.label)}</span>)}
          {series.flatMap(row => {
            const cellsForRow = series.map(column => {
              const cell = cells.get(`${row.key}|${column.key}`)
              const value = cell?.available && cell.correlation != null ? cell.correlation : null
              const maturity = cell?.mature ? 'MATURE' : cell?.available ? 'PREVIEW' : 'INSUFFICIENT'
              return (
                <span
                  className={`corr-cell ${cellTone(value)}`}
                  key={`${row.key}-${column.key}`}
                  title={`${row.label} ↔ ${column.label}: ${value == null ? 'недостаточно данных' : number.format(value)}${cell ? ` · ${cell.pairedReturns} пар · ${maturity}` : ''}`}
                >
                  {value == null ? '—' : number.format(value)}
                </span>
              )
            })
            return [<span className="corr-axis corr-axis--side" key={`side-${row.key}`} title={row.label}>{compactLabel(row.label)}</span>, ...cellsForRow]
          })}
        </div>
      </div>

      <p className="corr-note">Pearson ρ считается по совпадающим дневным доходностям, а не по ценам. До {matrix.minimumPairedReturns} общих доходностей пара скрыта; {matrix.minimumPairedReturns}–{matrix.maturePairedReturns - 1} = preview, {matrix.maturePairedReturns}+ = mature. Это диагностика структуры портфеля, не торговый сигнал.</p>

      <details className="allocation-diagnostics">
        <summary>
          <span>ALLOCATION LAB · RISK ONLY</span>
          <strong>{allocation.status}</strong>
          <small>{allocation.commonReturns} общих доходностей</small>
        </summary>
        {allocation.available ? (
          <>
            <div className="allocation-scenarios">
              {allocationScenarios.map(scenario => <AllocationScenarioRow key={scenario.method} scenario={scenario} />)}
            </div>
            <p>{allocation.note} Веса показывают математические risk-only сценарии на одной исторической ковариационной выборке и не учитывают ожидаемую доходность, налоги, ликвидность или индивидуальные ограничения.</p>
          </>
        ) : (
          <p>{allocation.note}</p>
        )}
      </details>
    </section>
  )
}