import { useMemo, useState } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import type { AnalyticsHistoryPoint, PortfolioAnalytics } from './metrics'
import { CorrelationPanel } from './CorrelationPanel'
import { StressPanel } from './StressPanel'
import { calculateRecoveryDiagnostics } from './recoveryDiagnostics'
import { calculateRelativePerformance } from './relativePerformance'
import { calculateRollingRisk } from './rollingRisk'
import { calculateTailRisk } from './tailRisk'
import './relativePerformance.css'

const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })
const pctPlain = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

type Mode = 'portfolio' | 'benchmark' | 'rolling' | 'tail' | 'corr' | 'stress'

type Props = {
  analytics: PortfolioAnalytics
  history: AnalyticsHistoryPoint[]
  positions: PositionSnapshot[]
  riskFreeRate: number | null
  analyticsMature: boolean
  historyLabel: string
}

function signedRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctSigned.format(value * 100)}%`
}

function plainRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${pctPlain.format(value * 100)}%`
}

function recoverySummary(recovery: ReturnType<typeof calculateRecoveryDiagnostics>) {
  if (!recovery.available) return recovery.reason || 'Диагностика восстановления пока недоступна.'

  const parts = [`ВОССТАНОВЛЕНИЕ ${recovery.quality}`, `${recovery.completedEpisodes.length} заверш. эпиз.`]
  if (recovery.medianRecoveryDays != null) parts.push(`медиана от дна ${number.format(recovery.medianRecoveryDays)} дн.`)
  if (recovery.worstCompletedEpisode) {
    parts.push(`худшая завершённая −${pctPlain.format(recovery.worstCompletedEpisode.depth * 100)}% / ${recovery.worstCompletedEpisode.troughToRecoveryDays} дн. до возврата`)
  }
  if (recovery.activeDrawdown) {
    parts.push(`активная сейчас −${pctPlain.format(recovery.activeDrawdown.currentDrawdown * 100)}% от пика · ${recovery.activeDrawdown.daysSincePeak} дн.`)
  } else {
    parts.push('активной просадки нет')
  }
  return parts.join(' · ')
}

export function RiskWorkspace({ analytics, history, positions, riskFreeRate, analyticsMature, historyLabel }: Props) {
  const [mode, setMode] = useState<Mode>('portfolio')
  const relative = useMemo(() => calculateRelativePerformance(history), [history])
  const rolling = useMemo(() => calculateRollingRisk(history), [history])
  const tail = useMemo(() => calculateTailRisk(history), [history])
  const recovery = useMemo(() => calculateRecoveryDiagnostics(history), [history])
  const roll = rolling.activeWindow

  const modeStatus = mode === 'portfolio'
    ? historyLabel
    : mode === 'benchmark'
      ? `${relative.overlapPoints} общих точек`
      : mode === 'rolling'
        ? roll ? `${roll.tradingDays} дн. · активное окно` : `${rolling.availableReturns} доходностей`
        : mode === 'tail'
          ? `${tail.returns} дневных доходностей`
          : mode === 'corr'
            ? '365 дн. · топ-6 активов'
            : 'исторические шоки · v1'

  return (
    <div className="analytics-risk-view">
      <div className="risk-modebar" aria-label="Режим риск-аналитики">
        <span>РЕЖИМ</span>
        <button className={mode === 'portfolio' ? 'is-active' : ''} onClick={() => setMode('portfolio')}>ПОРТФЕЛЬ</button>
        <button className={mode === 'benchmark' ? 'is-active' : ''} onClick={() => setMode('benchmark')}>СРАВНЕНИЕ</button>
        <button className={mode === 'rolling' ? 'is-active' : ''} onClick={() => setMode('rolling')}>ОКНА</button>
        <button className={mode === 'tail' ? 'is-active' : ''} onClick={() => setMode('tail')}>ХВОСТ</button>
        <button className={mode === 'corr' ? 'is-active' : ''} onClick={() => setMode('corr')}>СВЯЗИ</button>
        <button className={mode === 'stress' ? 'is-active' : ''} onClick={() => setMode('stress')}>СТРЕСС</button>
        <small>{modeStatus}</small>
      </div>

      {mode === 'portfolio' && (
        <>
          <section className="risk-grid">
            <article className="risk-card"><span>МАКС. ПРОСАДКА</span><strong>{signedRatio(analytics.maxDrawdown == null ? null : -analytics.maxDrawdown)}</strong><small>От локального пика</small></article>
            <article className="risk-card"><span>ВОЛАТИЛЬНОСТЬ</span><strong>{plainRatio(analytics.volatility)}</strong><small>σ дневных доходностей × √252</small></article>
            <article className="risk-card"><span>SHARPE · ДОХОД / РИСК</span><strong>{analytics.sharpe == null ? '—' : number.format(analytics.sharpe)}</strong><small>{riskFreeRate == null ? 'Нет ставки ЦБ — не считаем' : `Безрисковая ставка ${number.format(riskFreeRate)}%`}</small></article>
            <article className="risk-card"><span>SORTINO · РИСК СНИЖЕНИЯ</span><strong>{analytics.sortino == null ? '—' : number.format(analytics.sortino)}</strong><small>Негативные отклонения относительно минимальной доходности</small></article>
            <article className="risk-card"><span>HHI · КОНЦЕНТРАЦИЯ</span><strong>{analytics.hhi == null ? '—' : number.format(analytics.hhi)}</strong><small>Σ доля²; меньше = равномернее</small></article>
            <article className="risk-card"><span>ЭКВ. ПОЗИЦИЙ</span><strong>{analytics.effectivePositions == null ? '—' : number.format(analytics.effectivePositions)}</strong><small>1 / HHI</small></article>
          </section>
          <section className="panel analytics-note">
            <span className="eyebrow">КАЧЕСТВО ВЫБОРКИ · ВОССТАНОВЛЕНИЕ</span>
            <h2>{analyticsMature ? 'ИСТОРИЯ ДОСТАТОЧНА' : 'МЕТРИКИ ПРЕДВАРИТЕЛЬНЫЕ'}</h2>
            <p>Сейчас доступно {historyLabel}. Годовая волатильность, Sharpe и Sortino до накопления 12 месяцев остаются предварительными. {recoverySummary(recovery)}</p>
          </section>
        </>
      )}

      {mode === 'benchmark' && (
        <>
          <section className="risk-grid relative-risk-grid">
            <article className="risk-card"><span>ПОРТФЕЛЬ · ОБЩИЙ ПЕРИОД</span><strong>{signedRatio(relative.portfolioReturn)}</strong><small>{relative.periodDays ? `${relative.periodDays} дней общей выборки` : 'общая выборка не готова'}</small></article>
            <article className="risk-card"><span>IMOEX · ОБЩИЙ ПЕРИОД</span><strong>{signedRatio(relative.benchmarkReturn)}</strong><small>тот же диапазон дат</small></article>
            <article className="risk-card"><span>ДОХОДНОСТЬ СВЕРХ IMOEX</span><strong>{signedRatio(relative.excessReturn)}</strong><small>портфель минус IMOEX</small></article>
            <article className="risk-card"><span>ОТКЛОНЕНИЕ ОТ IMOEX · TE</span><strong>{plainRatio(relative.trackingError)}</strong><small>σ активных дневных доходностей × √252</small></article>
            <article className="risk-card"><span>ЭФФЕКТИВНОСТЬ ОТКЛОНЕНИЯ · IR</span><strong>{relative.informationRatio == null ? '—' : number.format(relative.informationRatio)}</strong><small>средняя активная доходность / tracking error</small></article>
            <article className="risk-card"><span>BETA · ЧУВСТВИТЕЛЬНОСТЬ</span><strong>{relative.beta == null ? '—' : number.format(relative.beta)}</strong><small>{relative.correlation == null ? 'корреляция скрыта до достаточной выборки' : `корреляция ${number.format(relative.correlation)}`}</small></article>
          </section>
          <section className="panel analytics-note relative-note">
            <span className="eyebrow">КАЧЕСТВО СРАВНЕНИЯ С IMOEX</span>
            <h2>{relative.status === 'mature' ? 'ЗРЕЛАЯ СРАВНИМАЯ ВЫБОРКА' : relative.status === 'preview' ? 'ПРЕДВАРИТЕЛЬНО' : 'КОРОТКАЯ ИСТОРИЯ'}</h2>
            <p>{relative.note} Периодная доходность показывается уже при двух общих точках; Tracking Error (TE), Information Ratio (IR), Beta и корреляция не рассчитываются на слишком короткой истории.</p>
          </section>
        </>
      )}

      {mode === 'rolling' && (
        <>
          <section className="risk-grid relative-risk-grid">
            <article className="risk-card"><span>ДОХОДНОСТЬ ОКНА</span><strong>{signedRatio(roll?.portfolioReturn ?? null)}</strong><small>{roll ? `${roll.tradingDays} торговых дней` : 'нужно минимум 20 дневных доходностей'}</small></article>
            <article className="risk-card"><span>ВОЛАТИЛЬНОСТЬ ОКНА</span><strong>{plainRatio(roll?.volatility ?? null)}</strong><small>σ окна × √252</small></article>
            <article className="risk-card"><span>МАКС. ПРОСАДКА ОКНА</span><strong>{roll?.maxDrawdown == null ? '—' : signedRatio(-roll.maxDrawdown)}</strong><small>просадка внутри выбранного окна</small></article>
            <article className="risk-card"><span>ХУДШИЙ ДЕНЬ</span><strong>{signedRatio(roll?.worstDay ?? null)}</strong><small>худшая дневная TWR-доходность окна</small></article>
            <article className="risk-card"><span>IMOEX · ТО ЖЕ ОКНО</span><strong>{signedRatio(roll?.benchmarkReturn ?? null)}</strong><small>{roll?.pairedBenchmarkReturns ? `${roll.pairedBenchmarkReturns} парных доходностей` : 'бенчмарк не покрывает всё окно'}</small></article>
            <article className="risk-card"><span>СВЕРХ IMOEX · ОКНО</span><strong>{signedRatio(roll?.excessReturn ?? null)}</strong><small>портфель минус IMOEX на том же окне</small></article>
          </section>
          <section className="panel analytics-note relative-note">
            <span className="eyebrow">СКОЛЬЗЯЩИЕ ОКНА · v1</span>
            <h2>{roll ? `${roll.tradingDays} ДН. · ТЕКУЩЕЕ ОКНО` : 'НЕДОСТАТОЧНО ИСТОРИИ'}</h2>
            <p>{rolling.note} Стандартные горизонты: 20 / 60 / 120 / 252 торговых дня. QVANIX автоматически использует самый длинный полностью доступный горизонт и не растягивает короткую историю до года.</p>
          </section>
        </>
      )}

      {mode === 'tail' && (
        <>
          <section className="risk-grid relative-risk-grid">
            <article className="risk-card"><span>ИСТОРИЧЕСКИЙ VaR 95% · 1 ДЕНЬ</span><strong>{plainRatio(tail.var95Loss)}</strong><small>порог потери худших 5% дней</small></article>
            <article className="risk-card"><span>CVaR · СРЕДНЯЯ ПОТЕРЯ ХВОСТА</span><strong>{plainRatio(tail.cvar95Loss)}</strong><small>средняя потеря внутри худшего 5%-хвоста</small></article>
            <article className="risk-card"><span>ХУДШИЙ ДЕНЬ</span><strong>{signedRatio(tail.worstDay)}</strong><small>фактическая дневная TWR-доходность</small></article>
            <article className="risk-card"><span>ДОЛЯ ОТРИЦАТЕЛЬНЫХ ДНЕЙ</span><strong>{plainRatio(tail.downsideFrequency)}</strong><small>частота дней TWR &lt; 0</small></article>
            <article className="risk-card"><span>НАБЛЮДЕНИЙ В ХВОСТЕ</span><strong>{tail.available ? tail.tailObservations : '—'}</strong><small>наблюдений в худших 5% дней</small></article>
            <article className="risk-card"><span>МЕТОД</span><strong>ИСТОРИЧЕСКИЙ</strong><small>без нормального распределения и параметрической подгонки</small></article>
          </section>
          <section className="panel analytics-note relative-note">
            <span className="eyebrow">ХВОСТОВОЙ РИСК · v1</span>
            <h2>{tail.status === 'mature' ? 'ЗРЕЛАЯ ОЦЕНКА' : tail.status === 'preview' ? 'ПРЕДВАРИТЕЛЬНО' : 'НЕДОСТАТОЧНО ИСТОРИИ'}</h2>
            <p>{tail.note} VaR/CVaR здесь — историческая однодневная оценка риска по TWR портфеля, а не прогноз максимального будущего убытка.</p>
          </section>
        </>
      )}

      {mode === 'corr' && <CorrelationPanel positions={positions} />}
      {mode === 'stress' && <StressPanel positions={positions} />}
    </div>
  )
}
