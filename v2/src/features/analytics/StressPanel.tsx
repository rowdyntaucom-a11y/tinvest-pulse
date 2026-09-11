import { useMemo, useState } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { calculateStressScenario } from './stress'
import {
  buildHistoricalStressExposures,
  HISTORICAL_STRESS_CATALOG_VERSION,
  HISTORICAL_STRESS_SCENARIOS,
} from './historicalStress'
import './stress.css'

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const pctPlain = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

type Props = {
  positions: PositionSnapshot[]
}

type ClassSummary = {
  classKey: string
  label: string
  currentValue: number
  shock: number | null
  pnl: number | null
}

const CLASS_LABELS: Record<string, string> = {
  equity_mcftr_proxy: 'АКЦИИ · MCFTR PROXY',
  ofz: 'ОФЗ',
  unassigned: 'ВНЕ МОДЕЛИ',
}

function signedPct(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pct.format(value * 100)}%`
}

function signedRub(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return rub.format(value)
}

function aggregateRows(result: ReturnType<typeof calculateStressScenario>): ClassSummary[] {
  const map = new Map<string, ClassSummary>()
  for (const row of result.rows) {
    const current = map.get(row.classKey) || {
      classKey: row.classKey,
      label: CLASS_LABELS[row.classKey] || row.classKey.toUpperCase(),
      currentValue: 0,
      shock: row.shock,
      pnl: row.pnl == null ? null : 0,
    }
    current.currentValue += row.currentValue
    if (row.shock != null) current.shock = row.shock
    if (row.pnl != null) current.pnl = (current.pnl || 0) + row.pnl
    map.set(row.classKey, current)
  }
  return [...map.values()].sort((a, b) => b.currentValue - a.currentValue)
}

export function StressPanel({ positions }: Props) {
  const [scenarioId, setScenarioId] = useState(HISTORICAL_STRESS_SCENARIOS[1]?.id || HISTORICAL_STRESS_SCENARIOS[0].id)
  const scenario = HISTORICAL_STRESS_SCENARIOS.find(item => item.id === scenarioId) || HISTORICAL_STRESS_SCENARIOS[0]
  const exposures = useMemo(() => buildHistoricalStressExposures(positions), [positions])
  const result = useMemo(() => calculateStressScenario(exposures, scenario), [exposures, scenario])
  const rows = useMemo(() => aggregateRows(result), [result])

  return (
    <section className="panel stress-panel">
      <div className="panel-head stress-headline">
        <div>
          <span className="eyebrow">HISTORICAL STRESS · CATALOG v{HISTORICAL_STRESS_CATALOG_VERSION}</span>
          <h2>ИСТОРИЧЕСКИЕ ШОКИ</h2>
        </div>
        <small>{scenario.period.label} · verified {scenario.verifiedAt}</small>
      </div>

      <div className="stress-selector" aria-label="Исторический стресс-сценарий">
        {HISTORICAL_STRESS_SCENARIOS.map(item => (
          <button
            key={item.id}
            className={item.id === scenario.id ? 'is-active' : ''}
            onClick={() => setScenarioId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="stress-summary">
        <article>
          <span>Δ ПОКРЫТОЙ ЧАСТИ</span>
          <strong>{signedRub(result.pnlCovered)}</strong>
          <small>{signedPct(result.pnlCoveredPct)} от покрытых активов</small>
        </article>
        <article>
          <span>ПОКРЫТИЕ</span>
          <strong>{pctPlain.format(result.coverageRatio * 100)}%</strong>
          <small>{rub.format(result.coveredValue)} из {rub.format(result.currentValue)}</small>
        </article>
        <article>
          <span>МЕТОД</span>
          <strong>HIST</strong>
          <small>MCFTR + RGBITR · total return</small>
        </article>
      </div>

      <div className="stress-rows">
        {rows.map(row => (
          <div className={`stress-row ${row.shock == null ? 'is-uncovered' : ''}`} key={row.classKey}>
            <div>
              <strong>{row.label}</strong>
              <small>{rub.format(row.currentValue)}</small>
            </div>
            <span>{row.shock == null ? 'нет shock-return' : signedPct(row.shock)}</span>
            <b>{signedRub(row.pnl)}</b>
          </div>
        ))}
      </div>

      <div className="stress-source">
        <div>
          <span>ИСТОЧНИК</span>
          <strong>{scenario.source}</strong>
          <small>{scenario.methodology}</small>
        </div>
        <a href={scenario.sourceUrl} target="_blank" rel="noreferrer">ПРОВЕРИТЬ ↗</a>
      </div>

      <p className="stress-note">{result.note} Сценарий не прогнозирует будущее и не моделирует ликвидность, изменение дюрации, кредитные спрэды или ребалансировку. Непокрытые классы остаются без шока.</p>
    </section>
  )
}
