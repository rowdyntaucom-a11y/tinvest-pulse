import { useMemo } from 'react'
import type { HistoryPoint } from '../../lib/portfolioApi'
import { calculateMonteCarlo } from './monteCarlo'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

function formatReturn(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctSigned.format(value * 100)}%`
}

function formatValue(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${money.format(value)} ₽`
}

export function MonteCarloPanel({ history, currentValue }: { history: HistoryPoint[]; currentValue: number }) {
  const result = useMemo(() => calculateMonteCarlo(history, currentValue), [history, currentValue])
  const progress = Math.min(100, result.minimumReturns ? result.historyReturns / result.minimumReturns * 100 : 0)

  return (
    <section className="panel mc-panel">
      <div className="panel-head">
        <div><span className="eyebrow">BOOTSTRAP v1 · 12M</span><h2>MONTE CARLO</h2></div>
        <small>{result.available ? `${result.simulations} траекторий` : `${result.historyReturns}/${result.minimumReturns} дневных доходностей`}</small>
      </div>

      {!result.available ? (
        <div className="mc-gate">
          <div className="mc-gate__status">
            <span>СТАТУС МОДЕЛИ</span>
            <strong>ЖДЁМ ИСТОРИЮ</strong>
            <small>QVANIX не экстраполирует слишком короткую выборку.</small>
          </div>
          <div className="mc-progress" aria-label={`Накоплено ${result.historyReturns} из ${result.minimumReturns} дневных доходностей`}>
            <i><b style={{ width: `${progress}%` }} /></i>
            <span>{result.historyReturns}</span>
            <small>минимум {result.minimumReturns}</small>
          </div>
          <p>{result.note}</p>
        </div>
      ) : (
        <>
          <div className="mc-grid">
            <article className="mc-card mc-card--p10">
              <span>P10</span>
              <strong>{formatReturn(result.terminalReturn?.p10)}</strong>
              <b>{formatValue(result.terminalValue?.p10)}</b>
              <small>10-й перцентиль результата через 252 торговых дня</small>
            </article>
            <article className="mc-card mc-card--median">
              <span>МЕДИАНА · P50</span>
              <strong>{formatReturn(result.terminalReturn?.median)}</strong>
              <b>{formatValue(result.terminalValue?.median)}</b>
              <small>середина распределения, не обещанная доходность</small>
            </article>
            <article className="mc-card mc-card--p90">
              <span>P90</span>
              <strong>{formatReturn(result.terminalReturn?.p90)}</strong>
              <b>{formatValue(result.terminalValue?.p90)}</b>
              <small>90-й перцентиль результата через 252 торговых дня</small>
            </article>
          </div>
          <div className="mc-integrity">
            <span className={result.status === 'mature' ? 'is-mature' : 'is-preview'}>{result.status === 'mature' ? 'ЗРЕЛАЯ ВЫБОРКА' : 'PREVIEW'}</span>
            <b>{result.historyReturns} дневных доходностей</b>
            <small>{result.note}</small>
          </div>
        </>
      )}

      <p className="method-note">Метод: historical bootstrap дневных TWR-доходностей. P10 / P50 / P90 — перцентили распределения сценариев, а не гарантии. Модель не добавляет будущие пополнения, снятия, комиссии, налоги или выдуманные ожидания рынка.</p>
    </section>
  )
}
