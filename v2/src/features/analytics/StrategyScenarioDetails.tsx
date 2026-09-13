import { useMemo, useState } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { PERSONAL_STRATEGY_V1, type StrategyConfig } from './drift'
import { compareStrategyScenarios } from './strategyScenarioComparison'
import './strategyScenario.css'

const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

function parsePercent(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed / 100 : Number.NaN
}

function strategyFromInputs(name: string, equity: string, bond: string): StrategyConfig {
  return {
    version: '1.0',
    name,
    targets: [
      { key: 'equity', label: 'Акции', target: parsePercent(equity) },
      { key: 'bond', label: 'Облигации', target: parsePercent(bond) },
    ],
    absoluteTolerance: PERSONAL_STRATEGY_V1.absoluteTolerance,
    relativeTolerance: PERSONAL_STRATEGY_V1.relativeTolerance,
  }
}

function inputTotal(equity: string, bond: string) {
  const equityValue = Number(equity.replace(',', '.'))
  const bondValue = Number(bond.replace(',', '.'))
  if (!Number.isFinite(equityValue) || !Number.isFinite(bondValue)) return null
  return equityValue + bondValue
}

export function StrategyScenarioDetails({ positions }: { positions: PositionSnapshot[] }) {
  const [equityA, setEquityA] = useState('')
  const [bondA, setBondA] = useState('')
  const [equityB, setEquityB] = useState('')
  const [bondB, setBondB] = useState('')

  const comparison = useMemo(() => compareStrategyScenarios(positions, [
    { id: 'user-a', strategy: strategyFromInputs('Сценарий A', equityA, bondA) },
    { id: 'user-b', strategy: strategyFromInputs('Сценарий B', equityB, bondB) },
  ]), [positions, equityA, bondA, equityB, bondB])

  const totalA = inputTotal(equityA, bondA)
  const totalB = inputTotal(equityB, bondB)

  const scenarioInput = (
    id: 'A' | 'B',
    equity: string,
    setEquity: (value: string) => void,
    bond: string,
    setBond: (value: string) => void,
    total: number | null,
  ) => (
    <div className="strategy-compare-input" key={id}>
      <strong>СЦЕНАРИЙ {id}</strong>
      <label>
        <span>Акции, %</span>
        <input inputMode="decimal" value={equity} onChange={event => setEquity(event.target.value)} placeholder="—" aria-label={`Сценарий ${id}: доля акций, процентов`} />
      </label>
      <label>
        <span>Облигации, %</span>
        <input inputMode="decimal" value={bond} onChange={event => setBond(event.target.value)} placeholder="—" aria-label={`Сценарий ${id}: доля облигаций, процентов`} />
      </label>
      <small className={total != null && Math.abs(total - 100) <= 1e-8 ? 'is-valid' : ''}>сумма {total == null ? '—' : `${pct.format(total)}%`} · нужно 100%</small>
    </div>
  )

  return (
    <details className="rebalance-details strategy-compare-details">
      <summary>
        <span><b>СРАВНИТЬ СТРАТЕГИИ</b><small>2 пользовательских набора · без прогноза доходности</small></span>
        <i>ОТКРЫТЬ</i>
      </summary>

      <div className="rebalance-details__body strategy-compare-body">
        <div className="strategy-compare-inputs">
          {scenarioInput('A', equityA, setEquityA, bondA, setBondA, totalA)}
          {scenarioInput('B', equityB, setEquityB, bondB, setBondB, totalB)}
        </div>

        {!comparison.available ? (
          <p className="rebalance-gate">Введите два набора положительных весов акций и облигаций, каждый ровно на 100%. QVANIX не дополняет, не нормализует и не придумывает веса.</p>
        ) : (
          <div className="strategy-compare-results">
            {comparison.rows.map(row => (
              <article key={row.id}>
                <div><strong>{row.name}</strong><span>{row.targetEquity == null || row.targetBond == null ? '—' : `${pct.format(row.targetEquity * 100)} / ${pct.format(row.targetBond * 100)}`}</span></div>
                <div><span>макс. отклонение</span><b>{row.maxAbsoluteDrift == null ? '—' : `${pct.format(row.maxAbsoluteDrift * 100)} п.п.`}</b></div>
                <div><span>перераспределить</span><b>{row.rebalanceTurnoverValue == null ? '—' : `${rub.format(row.rebalanceTurnoverValue)} ₽`}</b></div>
                <div><span>доля перераспределения</span><b>{row.rebalanceTurnoverRatio == null ? '—' : `${pct.format(row.rebalanceTurnoverRatio * 100)}%`}</b></div>
                <small>{row.available ? row.withinTolerance ? 'в пределах допусков' : 'вне допусков' : row.reason ?? 'недоступно'} · вне модели {pct.format(row.unassignedWeight * 100)}%</small>
              </article>
            ))}
          </div>
        )}

        <p className="rebalance-note">Одинаковые пороги контроля v1 применяются к обоим введённым наборам: {pct.format(PERSONAL_STRATEGY_V1.absoluteTolerance * 100)} п.п. абсолютного или {pct.format(PERSONAL_STRATEGY_V1.relativeTolerance * 100)}% относительного отклонения. Сравнение показывает только текущий drift и объём классового перераспределения; QVANIX не ранжирует варианты и не рекомендует победителя.</p>
      </div>
    </details>
  )
}
