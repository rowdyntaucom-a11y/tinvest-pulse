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

const COMPARE_ID = '__compare__'

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
  const compareMode = scenarioId === COMPARE_ID
  const scenario = HISTORICAL_STRESS_SCENARIOS.find(item => item.id === scenarioId) || HISTORICAL_STRESS_SCENARIOS[0]
  const exposures = useMemo(() => buildHistoricalStressExposures(positions), [positions])
  const result = useMemo(() => calculateStressScenario(exposures, scenario), [exposures, scenario])
  const rows = useMemo(() => aggregateRows(result), [result])
  const comparison = useMemo(
    () => HISTORICAL_STRESS_SCENARIOS.map(item => ({
      scenario: item,
      result: calculateStressScenario(exposures, item),
      equityShock: Number.isFinite(item.shocks.equity_mcftr_proxy) ? item.shocks.equity_mcftr_proxy : null,
      ofzShock: Number.isFinite(item.shocks.ofz) ? item.shocks.ofz : null,
    })),
    [exposures],
  )

  return (
    <section className="panel stress-panel">
      <div className="panel-head stress-headline">
        <div>
          <span className="eyebrow">HISTORICAL STRESS · CATALOG v{HISTORICAL_STRESS_CATALOG_VERSION}</span>
          <h2>ИСТОРИЧЕСКИЕ ШОКИ</h2>
        </div>
        <small>{compareMode ? `${comparison.length} сценария · одна текущая структура` : `${scenario.period.label} · verified ${scenario.verifiedAt}`}</small>
      </div>

      <div className="stress-selector" aria-label="Исторический стресс-сценарий">
        {HISTORICAL_STRESS_SCENARIOS.map(item => (
          <button
            key={item.id}
            className={item.id === scenarioId ? 'is-active' : ''}
            onClick={() => setScenarioId(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          className={compareMode ? 'is-active' : ''}
          onClick={() => setScenarioId(COMPARE_ID)}
        >
          СРАВНЕНИЕ
        </button>
      </div>

      {compareMode ? (
        <>
          <div className="stress-compare" role="table" aria-label="Сравнение исторических стресс-сценариев">
            <div className="stress-compare__row stress-compare__row--head" role="row">
              <span role="columnheader">СЦЕНАРИЙ</span>
              <span role="columnheader">АКЦИИ</span>
              <span role="columnheader">ОФЗ</span>
              <span role="columnheader">Δ ПОКР.</span>
              <span role="columnheader">COV</span>
            </div>
            {comparison.map(item => (
              <button
                type="button"
                className="stress-compare__row"
                role="row"
                key={item.scenario.id}
                onClick={() => setScenarioId(item.scenario.id)}
                title="Открыть детали сценария"
              >
                <strong role="cell">{item.scenario.period.label}</strong>
                <span role="cell">{signedPct(item.equityShock)}</span>
                <span role="cell">{signedPct(item.ofzShock)}</span>
                <b role="cell">{signedRub(item.result.pnlCovered)}</b>
                <em role="cell">{pctPlain.format(item.result.coverageRatio * 100)}%</em>
              </button>
            ))}
          </div>

          <div className="stress-source stress-source--compare">
            <div>
              <span>МЕТОД СРАВНЕНИЯ</span>
              <strong>MCFTR proxy + RGBITR · текущая структура портфеля</strong>
              <small>Во всех строках используется один и тот же текущий набор позиций. Меняется только исторический class-level shock за указанный период; непокрытые активы не получают выдуманный return.</small>
            </div>
          </div>

          <p className="stress-note">Сравнение показывает относительную тяжесть трёх подтверждённых исторических режимов для текущей структуры. Это не прогноз будущих потерь, не TWR-replay отдельных бумаг и не торговая рекомендация. Нажатие на строку открывает детали и источник сценария.</p>
        </>
      ) : (
        <>
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
        </>
      )}
    </section>
  )
}
