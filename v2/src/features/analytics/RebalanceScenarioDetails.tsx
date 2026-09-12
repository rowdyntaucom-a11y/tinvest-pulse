import { useMemo, useState } from 'react'
import type { DriftResult } from './drift'
import { calculateRebalanceScenario, type RebalanceScenarioMode } from './rebalanceScenarios'

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

function signedRub(value: number) {
  if (!Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${rub.format(Math.abs(value))} ₽`
}

function modeLabel(mode: RebalanceScenarioMode) {
  if (mode === 'ADD_CAPITAL') return 'ДОВНЕСТИ'
  if (mode === 'WITHDRAW_CAPITAL') return 'ВЫВЕСТИ'
  return 'ПЕРЕРАСПРЕДЕЛИТЬ'
}

export function RebalanceScenarioDetails({ drift }: { drift: DriftResult }) {
  const [mode, setMode] = useState<RebalanceScenarioMode>('REBALANCE_EXISTING')
  const [flowInput, setFlowInput] = useState('')

  const flowAmount = Number(flowInput.replace(',', '.'))
  const scenario = useMemo(
    () => calculateRebalanceScenario(drift, mode, mode === 'REBALANCE_EXISTING' ? 0 : flowAmount),
    [drift, mode, flowAmount],
  )

  const needsFlow = mode !== 'REBALANCE_EXISTING'

  return (
    <details className="rebalance-details">
      <summary>
        <span><b>СЦЕНАРИЙ РЕБАЛАНСИРОВКИ</b><small>детерминированный drill-down</small></span>
        <i>ОТКРЫТЬ</i>
      </summary>

      <div className="rebalance-details__body">
        <div className="rebalance-mode" aria-label="Тип сценария">
          {(['REBALANCE_EXISTING', 'ADD_CAPITAL', 'WITHDRAW_CAPITAL'] as const).map(item => (
            <button
              type="button"
              key={item}
              className={mode === item ? 'is-active' : ''}
              onClick={() => setMode(item)}
            >
              {modeLabel(item)}
            </button>
          ))}
        </div>

        {needsFlow && (
          <label className="rebalance-flow">
            <span>{mode === 'ADD_CAPITAL' ? 'Сумма довнесения' : 'Сумма вывода'}</span>
            <input
              inputMode="decimal"
              value={flowInput}
              onChange={event => setFlowInput(event.target.value)}
              placeholder="Введите ₽"
              aria-label={mode === 'ADD_CAPITAL' ? 'Сумма довнесения в рублях' : 'Сумма вывода в рублях'}
            />
          </label>
        )}

        {!scenario.available ? (
          <p className="rebalance-gate">
            {needsFlow && !flowInput.trim()
              ? 'Введите положительную сумму самостоятельно. QVANIX не подставляет размер пополнения или вывода.'
              : scenario.reason ?? 'Сценарий недоступен.'}
          </p>
        ) : (
          <>
            <div className="rebalance-result-head">
              <span>{scenario.exactTargetPossible ? 'ТОЧНАЯ ЦЕЛЬ ДОСТИЖИМА' : 'ТОЧНАЯ ЦЕЛЬ НЕ ДОСТИГАЕТСЯ ЭТИМ ПОТОКОМ'}</span>
              {!scenario.exactTargetPossible && scenario.minimumFlowForExactTarget != null && (
                <small>минимальный поток для точной цели: {rub.format(scenario.minimumFlowForExactTarget)} ₽</small>
              )}
            </div>

            <div className="rebalance-deltas">
              {scenario.rows.map(row => (
                <article key={row.key}>
                  <span>{row.label}</span>
                  <strong className={row.direction === 'INCREASE' ? 'is-up' : row.direction === 'DECREASE' ? 'is-down' : ''}>
                    {signedRub(row.deltaValue)}
                  </strong>
                  <small>целевая дельта класса</small>
                </article>
              ))}
            </div>
          </>
        )}

        <p className="rebalance-note">Только сценарная диагностика по классам активов. Активы вне стратегии не меняются; это не персональная команда купить или продать.</p>
      </div>
    </details>
  )
}
