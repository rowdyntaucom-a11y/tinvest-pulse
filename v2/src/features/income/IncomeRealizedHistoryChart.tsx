import { useMemo, useState } from 'react'
import type { buildRealizedIncomeHistory } from './incomeHistory'
import './incomeRealizedHistory.css'

type IncomeHistory = ReturnType<typeof buildRealizedIncomeHistory>
type Mode = 'total' | 'coupons' | 'dividends'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const monthFmt = new Intl.DateTimeFormat('ru-RU', { month: 'short' })

const MODES: Array<{ key: Mode; label: string }> = [
  { key: 'total', label: 'ВСЕ' },
  { key: 'coupons', label: 'КУПОНЫ' },
  { key: 'dividends', label: 'ДИВИДЕНДЫ' },
]

const valueForMode = (month: IncomeHistory['months'][number], mode: Mode) => {
  if (mode === 'coupons') return month.couponsNet
  if (mode === 'dividends') return month.dividendsNet
  return month.totalNet
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  if (!Number.isFinite(year) || !Number.isFinite(month)) return key
  return monthFmt.format(new Date(Date.UTC(year, month - 1, 1))).replace('.', '')
}

export function IncomeRealizedHistoryChart({ history }: { history: IncomeHistory }) {
  const [mode, setMode] = useState<Mode>('total')
  const rows = useMemo(() => history.months.slice(-12), [history.months])
  const values = useMemo(() => rows.map(row => valueForMode(row, mode)), [rows, mode])
  const max = Math.max(0, ...values)
  const hasValues = values.some(value => value > 0)

  if (!rows.length) return null

  return (
    <section className="income-realized-chart" aria-label="Фактически полученный пассивный доход по месяцам">
      <div className="income-realized-head">
        <div>
          <span>ФАКТ · ПОСЛЕ НАЛОГА</span>
          <strong>ПОЛУЧЕНО ПО МЕСЯЦАМ</strong>
        </div>
        <div className="income-realized-modes" role="group" aria-label="Состав фактического дохода">
          {MODES.map(item => (
            <button
              type="button"
              key={item.key}
              className={mode === item.key ? 'is-active' : ''}
              aria-pressed={mode === item.key}
              onClick={() => setMode(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="income-realized-bars">
        {rows.map((row, index) => {
          const value = values[index] ?? 0
          const height = max > 0 && value > 0 ? Math.max(6, value / max * 100) : 0
          const observationClass = row.complete ? 'is-complete' : row.partial ? 'is-partial' : 'is-unverified'
          const stateLabel = row.complete ? 'полный месяц' : row.partial ? 'частичный месяц' : 'границы наблюдения не подтверждены'
          return (
            <div className={`income-realized-bar ${observationClass}`} key={row.key} title={`${row.key} · ${money.format(value)} ₽ · ${stateLabel}`}>
              <b>{value > 0 ? money.format(value) : row.complete ? '0' : '—'}</b>
              <i aria-hidden="true"><span style={{ height: `${height}%` }} /></i>
              <small>{monthLabel(row.key)}</small>
            </div>
          )
        })}
      </div>

      <p>
        {hasValues ? 'Только фактически полученные выплаты. ' : 'В выбранном разрезе выплат пока нет. '}
        Ноль показывается только для полностью наблюдавшегося месяца; частичные и неподтверждённые месяцы не считаются нулевыми.
      </p>
    </section>
  )
}
