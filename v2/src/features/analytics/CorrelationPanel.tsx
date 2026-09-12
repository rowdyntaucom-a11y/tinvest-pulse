import { useEffect, useMemo, useState } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { loadAssetHistory, type AssetHistoryPayload } from '../../lib/assetHistoryApi'
import { calculateAllocationDiagnostics, type AllocationScenario } from './allocationDiagnostics'
import {
  calculateCurrentRiskContribution,
  type CurrentRiskSeriesInput,
} from './currentRiskContribution'
import { calculateCorrelationMatrix, type CorrelationCell, type RiskSeries } from './riskMatrix'
import './correlation.css'

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

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

function buildCurrentRiskInputs(payload: AssetHistoryPayload | null, positions: PositionSnapshot[]): CurrentRiskSeriesInput[] {
  const byInstrumentId = new Map<string, PositionSnapshot | null>()
  for (const position of positions) {
    for (const rawId of [position.instrumentUid, position.figi]) {
      const id = String(rawId || '').trim()
      if (!id) continue
      if (!byInstrumentId.has(id)) byInstrumentId.set(id, position)
      else if (byInstrumentId.get(id) !== position) byInstrumentId.set(id, null)
    }
  }

  return (payload?.series ?? [])
    .filter(item => item.points.length >= 2)
    .slice(0, 6)
    .flatMap(item => {
      const instrumentId = String(item.instrumentId || '').trim()
      if (!instrumentId) return []
      const position = byInstrumentId.get(instrumentId)
      if (!position || !Number.isFinite(position.currentValue) || position.currentValue <= 0) return []
      return [{
        key: item.key,
        label: item.label,
        points: item.points,
        currentValue: position.currentValue,
      }]
    })
}

type Props = {
  positions: PositionSnapshot[]
}

export function CorrelationPanel({ positions }: Props) {
  const [payload, setPayload] = useState<AssetHistoryPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      const next = await loadAssetHistory(controller.signal)
      if (!controller.signal.aborted) {
        setPayload(next)
        setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  const series = useMemo<RiskSeries[]>(() => {
    const rows = payload?.series ?? []
    return rows
      .filter(item => item.points.length >= 2)
      .slice(0, 6)
      .map(item => ({ key: item.key, label: item.label, points: item.points }))
  }, [payload])

  const matrix = useMemo(() => calculateCorrelationMatrix(series), [series])
  const allocation = useMemo(() => calculateAllocationDiagnostics(series), [series])
  const totalPortfolioValue = useMemo(
    () => positions.reduce((sum, position) => sum + (Number.isFinite(position.currentValue) && position.currentValue > 0 ? position.currentValue : 0), 0),
    [positions],
  )
  const currentRiskInputs = useMemo(() => buildCurrentRiskInputs(payload, positions), [payload, positions])
  const currentRisk = useMemo(
    () => calculateCurrentRiskContribution(currentRiskInputs, totalPortfolioValue),
    [currentRiskInputs, totalPortfolioValue],
  )
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
  const requestedSeries = Math.max(series.length, payload?.requested ?? 0)
  const availableSeries = Math.max(series.length, payload?.availableSeries ?? 0)
  const allocationScenarios = [allocation.equalWeight, allocation.minimumVariance, allocation.equalRiskContribution]
    .filter((scenario): scenario is AllocationScenario => scenario != null)
  const topRisk = currentRisk.topAbsoluteContributor
  const topRiskLine = topRisk?.riskContributionShare == null
    ? null
    : `coverage ${currentRisk.coverageRatio == null ? '—' : `${pct.format(currentRisk.coverageRatio * 100)}%`} · ${compactLabel(topRisk.label)} · капитал ${pct.format(topRisk.weight * 100)}% · вклад ${pctSigned.format(topRisk.riskContributionShare * 100)}%${currentRisk.topAbsoluteRiskShare == null ? '' : ` · |risk| ${pct.format(currentRisk.topAbsoluteRiskShare * 100)}%`}`
  const riskDepthBadge = currentRisk.available
    ? `DR ${currentRisk.diversificationRatio == null ? '—' : number.format(currentRisk.diversificationRatio)} · Nₑ ${currentRisk.effectiveRiskContributorCount == null ? '—' : number.format(currentRisk.effectiveRiskContributorCount)}/${currentRisk.effectiveCapitalCount == null ? '—' : number.format(currentRisk.effectiveCapitalCount)}`
    : null

  if (loading) {
    return <section className="panel corr-panel"><div className="corr-loading">ЗАГРУЖАЕМ 365 ДНЕЙ ИСТОРИИ АКТИВОВ…</div></section>
  }

  if (series.length < 2) {
    return (
      <section className="panel corr-panel">
        <div className="panel-head"><div><span className="eyebrow">CORRELATION MATRIX · v{matrix.version}</span><h2>ИСТОРИЯ ЕЩЁ НЕ ГОТОВА</h2></div><small>fail-closed</small></div>
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

      <p className="corr-note">Pearson ρ считается только по доходностям с одинаковыми границами интервала наблюдения, а не по ценам. Пропущенная промежуточная свеча разрывает обе соседние пары; до {matrix.minimumPairedReturns} общих интервалов пара скрыта, {matrix.minimumPairedReturns}–{matrix.maturePairedReturns - 1} = preview, {matrix.maturePairedReturns}+ = mature. Это диагностика структуры портфеля, не торговый сигнал.</p>

      <details className="allocation-diagnostics">
        <summary>
          <span>ALLOCATION LAB · RISK ONLY</span>
          <strong>{allocation.status}</strong>
          <small>{allocation.commonReturns} общих интервалов</small>
        </summary>
        {currentRisk.available ? (
          <article className="current-risk-diagnostic">
            <div>
              <span>ТЕКУЩИЕ ВЕСА · RISK CONTRIBUTION</span>
              <strong>{currentRisk.annualizedVolatility == null ? '—' : `${pct.format(currentRisk.annualizedVolatility * 100)}% vol`}</strong>
              <b>{riskDepthBadge}</b>
            </div>
            <small title={currentRisk.note}>{topRiskLine ?? currentRisk.note}</small>
          </article>
        ) : (
          <p className="current-risk-unavailable">CURRENT RISK: {currentRisk.reason ?? currentRisk.note}</p>
        )}
        {allocation.available ? (
          <>
            <div className="allocation-scenarios">
              {allocationScenarios.map(scenario => <AllocationScenarioRow key={scenario.method} scenario={scenario} />)}
            </div>
            <p>{allocation.note} Текущие risk-contribution веса нормализуются только внутри покрытой market-history части портфеля; coverage показан отдельно. DR = средневзвешенная standalone-vol / vol текущих весов. Nₑ показывает эффективное число вкладчиков риска по нормализованным |risk contribution| и рядом — эффективное число капитальных весов в той же покрытой выборке. Signed risk contribution может быть отрицательным из-за диверсификации. Сценарные веса не учитывают ожидаемую доходность, налоги, ликвидность или индивидуальные ограничения.</p>
          </>
        ) : (
          <p>{allocation.note}</p>
        )}
      </details>
    </section>
  )
}
