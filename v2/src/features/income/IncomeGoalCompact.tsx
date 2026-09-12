import { useMemo, useState } from 'react'
import { buildRealizedIncomeHistory, calculateIncomeGoalProgress } from './incomeHistory'
import './incomeGoal.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

type IncomeHistory = ReturnType<typeof buildRealizedIncomeHistory>

function parseTarget(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function IncomeGoalCompact({ history }: { history: IncomeHistory }) {
  const [targetInput, setTargetInput] = useState('')
  const target = parseTarget(targetInput)
  const goal = useMemo(() => calculateIncomeGoalProgress(history, target), [history, target])
  const progressPct = goal.progress == null ? null : goal.progress * 100
  const barWidth = progressPct == null ? 0 : Math.min(100, Math.max(0, progressPct))

  const status = target <= 0
    ? 'ЦЕЛЬ НЕ ЗАДАНА'
    : goal.available
      ? `${pct.format(progressPct ?? 0)}%`
      : 'ЖДЁМ 12 ПОЛНЫХ МЕС.'

  return (
    <details className="income-goal-details">
      <summary>
        <span>ЦЕЛЬ ПАССИВНОГО ДОХОДА · NET/ГОД</span>
        <b>{status}</b>
      </summary>
      <div className="income-goal-body">
        <label>
          <span>ЦЕЛЬ, ₽</span>
          <input
            inputMode="decimal"
            value={targetInput}
            onChange={event => setTargetInput(event.target.value)}
            placeholder="например 120000"
            aria-label="Годовая цель пассивного дохода net в рублях"
          />
        </label>
        <div className="income-goal-progress">
          <div>
            <span>{goal.realizedAnnualNet == null ? 'ФАКТ —' : `ФАКТ ${money.format(goal.realizedAnnualNet)} ₽`}</span>
            <b>{target > 0 ? `ЦЕЛЬ ${money.format(target)} ₽` : 'введите цель'}</b>
          </div>
          <i><b style={{ width: `${barWidth}%` }} /></i>
        </div>
      </div>
      <p>{goal.note} QVANIX не рассчитывает дату достижения и не годифицирует короткую историю.</p>
    </details>
  )
}
