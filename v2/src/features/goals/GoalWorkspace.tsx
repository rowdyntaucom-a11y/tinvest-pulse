import { useMemo, useState } from 'react'
import { calculateGoalProjection, type GoalProjectionPoint, type GoalProjectionResult } from './goalProjection'
import './goalWorkspace.css'

type Props = {
  currentCapital: number
}

type ScenarioDraft = {
  targetCapitalToday: string
  horizonYears: string
  monthlyContribution: string
  contributionGrowthAnnualPct: string
  inflationAnnualPct: string
  priceReturnAnnualPct: string
  incomeYieldAnnualPct: string
  benchmarkReturnAnnualPct: string
}

const INITIAL_DRAFT: ScenarioDraft = {
  targetCapitalToday: '',
  horizonYears: '',
  monthlyContribution: '',
  contributionGrowthAnnualPct: '',
  inflationAnnualPct: '',
  priceReturnAnnualPct: '',
  incomeYieldAnnualPct: '',
  benchmarkReturnAnnualPct: '',
}

const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const years = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

function numeric(value: string) {
  if (!value.trim()) return Number.NaN
  return Number(value.replace(',', '.'))
}

function formatRub(value: number | null) {
  return value == null || !Number.isFinite(value) ? '—' : rub.format(value)
}

function formatProgress(value: number | null) {
  return value == null || !Number.isFinite(value) ? '—' : `${pct.format(value * 100)}%`
}

function reachedLabel(result: GoalProjectionResult) {
  if (result.scenarioGoalReachedMonth == null) return 'не достигнута в горизонте'
  if (result.scenarioGoalReachedMonth === 0) return 'уже достигнута по заданной цели'
  return `≈ ${years.format(result.scenarioGoalReachedMonth / 12)} года`
}

function pathPoints(series: GoalProjectionPoint[], getter: (point: GoalProjectionPoint) => number | null, maxValue: number) {
  if (!series.length || maxValue <= 0) return ''
  const left = 28
  const right = 696
  const top = 22
  const bottom = 194
  const width = right - left
  const height = bottom - top
  return series
    .map((point, index) => {
      const value = getter(point)
      if (value == null || !Number.isFinite(value)) return null
      const x = series.length === 1 ? left : left + (index / (series.length - 1)) * width
      const y = bottom - Math.min(1, Math.max(0, value / maxValue)) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .filter((point): point is string => Boolean(point))
    .join(' ')
}

function pointPosition(series: GoalProjectionPoint[], point: GoalProjectionPoint, maxValue: number) {
  const index = Math.max(0, series.indexOf(point))
  const left = 28
  const right = 696
  const top = 22
  const bottom = 194
  const width = right - left
  const height = bottom - top
  const x = series.length === 1 ? left : left + (index / (series.length - 1)) * width
  const y = bottom - Math.min(1, Math.max(0, point.capital / Math.max(1, maxValue))) * height
  return { x, y, top, bottom }
}

function GoalTrajectoryChart({ result }: { result: GoalProjectionResult }) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const series = result.series
  const selected = series.find(point => point.year === selectedYear) ?? series.at(-1) ?? null
  const maxValue = Math.max(
    1,
    ...series.flatMap(point => [point.capital, point.targetNominal, point.benchmarkCapital ?? 0]),
  )
  const capitalPoints = pathPoints(series, point => point.capital, maxValue)
  const targetPoints = pathPoints(series, point => point.targetNominal, maxValue)
  const benchmarkPoints = pathPoints(series, point => point.benchmarkCapital, maxValue)
  const selectedPosition = selected ? pointPosition(series, selected, maxValue) : null

  return (
    <section className="goal-chart panel" aria-label="Траектория сценария цели">
      <div className="panel-head goal-chart__head">
        <div><span className="eyebrow">ТРАЕКТОРИЯ СЦЕНАРИЯ</span><h2>КАПИТАЛ И ЦЕЛЬ</h2></div>
        <small>{series.length ? `${series.length} годовых точек` : 'нет данных'}</small>
      </div>

      {selected ? (
        <div className="goal-chart__focus" aria-live="polite">
          <span>{Math.round(selected.year)} ГОД</span>
          <strong>{rub.format(selected.capital)}</strong>
          <small>цель {rub.format(selected.targetNominal)} · в сегодняшних рублях {rub.format(selected.realCapital)}</small>
        </div>
      ) : null}

      <svg className="goal-chart__svg" viewBox="0 0 720 220" role="img" aria-label="Линии капитала, инфляционно скорректированной цели и заданного сценария индекса">
        <line className="goal-chart__grid" x1="28" y1="194" x2="696" y2="194" />
        <line className="goal-chart__grid" x1="28" y1="108" x2="696" y2="108" />
        <line className="goal-chart__grid" x1="28" y1="22" x2="696" y2="22" />
        <polyline className="goal-chart__line goal-chart__line--target" points={targetPoints} />
        {benchmarkPoints ? <polyline className="goal-chart__line goal-chart__line--benchmark" points={benchmarkPoints} /> : null}
        <polyline className="goal-chart__line goal-chart__line--capital" points={capitalPoints} />
        {selectedPosition ? (
          <>
            <line className="goal-chart__cursor" x1={selectedPosition.x} y1={selectedPosition.top} x2={selectedPosition.x} y2={selectedPosition.bottom} />
            <circle className="goal-chart__point" cx={selectedPosition.x} cy={selectedPosition.y} r="5" />
          </>
        ) : null}
      </svg>

      <div className="goal-chart__legend" aria-label="Легенда графика">
        <span><i className="goal-chart__swatch goal-chart__swatch--capital" />капитал</span>
        <span><i className="goal-chart__swatch goal-chart__swatch--target" />цель с инфляцией</span>
        {result.finalBenchmarkCapital != null ? <span><i className="goal-chart__swatch goal-chart__swatch--benchmark" />индекс-сценарий</span> : null}
      </div>

      <div className="goal-chart__years" aria-label="Выбрать год сценария">
        {series.map(point => (
          <button
            type="button"
            key={point.month}
            className={selected?.month === point.month ? 'is-active' : ''}
            onClick={() => setSelectedYear(point.year)}
            aria-pressed={selected?.month === point.month}
          >
            {Math.round(point.year)}
          </button>
        ))}
      </div>
    </section>
  )
}

function ScenarioField({ label, note, value, onChange, step = '0.1', min, max, unit }: {
  label: string
  note: string
  value: string
  onChange: (value: string) => void
  step?: string
  min?: string
  max?: string
  unit: string
}) {
  return (
    <label className="goal-field">
      <span>{label}</span>
      <div className="goal-field__input">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={event => onChange(event.target.value)}
          placeholder="—"
        />
        <b>{unit}</b>
      </div>
      <small>{note}</small>
    </label>
  )
}

export function GoalWorkspace({ currentCapital }: Props) {
  const [draft, setDraft] = useState<ScenarioDraft>(INITIAL_DRAFT)
  const [reinvestIncome, setReinvestIncome] = useState(false)

  const update = (key: keyof ScenarioDraft, value: string) => {
    setDraft(current => ({ ...current, [key]: value }))
  }

  const requiredReady = [
    draft.targetCapitalToday,
    draft.horizonYears,
    draft.monthlyContribution,
    draft.contributionGrowthAnnualPct,
    draft.inflationAnnualPct,
    draft.priceReturnAnnualPct,
    draft.incomeYieldAnnualPct,
  ].every(value => value.trim() !== '')

  const result = useMemo(() => {
    if (!requiredReady) return null
    return calculateGoalProjection({
      currentCapital: Number.isFinite(currentCapital) && currentCapital >= 0 ? currentCapital : 0,
      targetCapitalToday: numeric(draft.targetCapitalToday),
      horizonYears: numeric(draft.horizonYears),
      monthlyContribution: numeric(draft.monthlyContribution),
      contributionGrowthAnnualPct: numeric(draft.contributionGrowthAnnualPct),
      inflationAnnualPct: numeric(draft.inflationAnnualPct),
      priceReturnAnnualPct: numeric(draft.priceReturnAnnualPct),
      incomeYieldAnnualPct: numeric(draft.incomeYieldAnnualPct),
      reinvestIncome,
      benchmarkReturnAnnualPct: draft.benchmarkReturnAnnualPct.trim() ? numeric(draft.benchmarkReturnAnnualPct) : null,
    })
  }, [currentCapital, draft, reinvestIncome, requiredReady])

  const available = result?.available === true

  return (
    <div className="goal-workspace">
      <section className="goal-hero panel">
        <div className="goal-hero__copy">
          <span className="eyebrow">QVANIX GOAL · v1</span>
          <h2>ЦЕЛЬ КАПИТАЛА</h2>
          <p>Соберите собственный сценарий: QVANIX использует текущий капитал портфеля и только явно заданные вами будущие предпосылки.</p>
        </div>
        <div className="goal-hero__state">
          <span>ТЕКУЩИЙ КАПИТАЛ</span>
          <strong>{rub.format(Math.max(0, currentCapital || 0))}</strong>
          <b>СЦЕНАРИЙ, НЕ ПРОГНОЗ</b>
        </div>
      </section>

      <div className="goal-grid">
        <section className="goal-form panel" aria-label="Параметры сценария цели">
          <div className="panel-head">
            <div><span className="eyebrow">ВАШИ ПРЕДПОСЫЛКИ</span><h2>ПАРАМЕТРЫ</h2></div>
            <small>пустые поля не рассчитываются</small>
          </div>

          <div className="goal-form__group">
            <h3>Цель и пополнения</h3>
            <div className="goal-form__fields">
              <ScenarioField label="Цель сегодня" note="в покупательной способности сегодняшних рублей" value={draft.targetCapitalToday} onChange={value => update('targetCapitalToday', value)} step="1000" min="1" unit="₽" />
              <ScenarioField label="Горизонт" note="целое число от 1 до 50" value={draft.horizonYears} onChange={value => update('horizonYears', value)} step="1" min="1" max="50" unit="лет" />
              <ScenarioField label="Пополнение" note="в конце каждого месяца" value={draft.monthlyContribution} onChange={value => update('monthlyContribution', value)} step="100" min="0" unit="₽/мес" />
              <ScenarioField label="Индексация взноса" note="как меняется ежемесячное пополнение" value={draft.contributionGrowthAnnualPct} onChange={value => update('contributionGrowthAnnualPct', value)} unit="%/год" />
            </div>
          </div>

          <div className="goal-form__group">
            <h3>Рынок и покупательная способность</h3>
            <div className="goal-form__fields">
              <ScenarioField label="Инфляция" note="увеличивает номинальную стоимость цели" value={draft.inflationAnnualPct} onChange={value => update('inflationAnnualPct', value)} unit="%/год" />
              <ScenarioField label="Изменение цены" note="отдельно от денежных выплат" value={draft.priceReturnAnnualPct} onChange={value => update('priceReturnAnnualPct', value)} unit="%/год" />
              <ScenarioField label="Доходность выплат" note="дивиденды/купоны как отдельная предпосылка" value={draft.incomeYieldAnnualPct} onChange={value => update('incomeYieldAnnualPct', value)} min="0" max="100" unit="%/год" />
              <ScenarioField label="Индекс-сценарий" note="необязательно; QVANIX не подставляет ожидание сам" value={draft.benchmarkReturnAnnualPct} onChange={value => update('benchmarkReturnAnnualPct', value)} unit="%/год" />
            </div>
          </div>

          <label className="goal-toggle">
            <input type="checkbox" checked={reinvestIncome} onChange={event => setReinvestIncome(event.target.checked)} />
            <span><strong>Реинвестировать выплаты</strong><small>если выключено, выплаты учитываются отдельно и не увеличивают капитал</small></span>
          </label>
        </section>

        <section className="goal-results panel" aria-label="Результат сценария цели">
          <div className="panel-head">
            <div><span className="eyebrow">РЕЗУЛЬТАТ</span><h2>СЦЕНАРИЙ</h2></div>
            <small>{available ? `методика v${result.version}` : 'ожидает параметры'}</small>
          </div>

          {!requiredReady ? (
            <div className="goal-empty">
              <strong>Заполните параметры</strong>
              <p>Будущая доходность, инфляция и взносы не подставляются автоматически. После заполнения здесь появятся траектория и разложение результата.</p>
            </div>
          ) : result && !result.available ? (
            <div className="goal-empty goal-empty--error">
              <strong>Сценарий не рассчитан</strong>
              <p>{result.reason}</p>
            </div>
          ) : result ? (
            <>
              <div className="goal-results__hero">
                <span>КАПИТАЛ В КОНЦЕ</span>
                <strong>{formatRub(result.finalCapital)}</strong>
                <small>в сегодняшних рублях {formatRub(result.finalRealCapital)}</small>
              </div>
              <div className="goal-results__grid">
                <article><span>ЦЕЛЬ С ИНФЛЯЦИЕЙ</span><strong>{formatRub(result.finalTargetNominal)}</strong><small>номинальная стоимость к концу горизонта</small></article>
                <article><span>ПРОГРЕСС</span><strong>{formatProgress(result.finalProgress)}</strong><small>капитал / инфляционно скорректированная цель</small></article>
                <article><span>СВОИ ПОПОЛНЕНИЯ</span><strong>{formatRub(result.cumulativeContributions)}</strong><small>без стартового капитала</small></article>
                <article><span>ДОСТИЖЕНИЕ В СЦЕНАРИИ</span><strong>{reachedLabel(result)}</strong><small>не является обещанной датой</small></article>
                {!reinvestIncome ? <article><span>ВЫПЛАТЫ СНАРУЖИ</span><strong>{formatRub(result.cumulativeIncomePaidOut)}</strong><small>не реинвестированы в капитал</small></article> : null}
                {result.finalBenchmarkCapital != null ? <article><span>ИНДЕКС-СЦЕНАРИЙ</span><strong>{formatRub(result.finalBenchmarkCapital)}</strong><small>с той же последовательностью пополнений</small></article> : null}
              </div>
              <p className="goal-results__note">{result.note}</p>
            </>
          ) : null}
        </section>
      </div>

      {available && result ? <GoalTrajectoryChart result={result} /> : null}
    </div>
  )
}
