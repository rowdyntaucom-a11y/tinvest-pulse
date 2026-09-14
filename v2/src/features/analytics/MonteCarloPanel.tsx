import { lazy, Suspense } from 'react'
import type { HistoryPoint } from '../../lib/portfolioApi'

const MonteCarloPanelView = lazy(() => import('./MonteCarloPanelView'))

export function MonteCarloPanel({ history, currentValue }: { history: HistoryPoint[]; currentValue: number }) {
  return (
    <Suspense fallback={<section className="panel mc-panel"><div className="mc-gate"><strong>ЗАГРУЖАЕМ СЦЕНАРИИ…</strong></div></section>}>
      <MonteCarloPanelView history={history} currentValue={currentValue} />
    </Suspense>
  )
}
