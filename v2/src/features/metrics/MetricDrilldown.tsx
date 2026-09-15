import { lazy, Suspense } from 'react'
import type { MetricDetailModel } from './metricRegistry'
import './metricDrilldown.css'

const MetricDetailSheet = lazy(() => import('./MetricDetailSheet').then(module => ({ default: module.MetricDetailSheet })))

export function MetricDrilldown({ model, onClose }: { model: MetricDetailModel | null; onClose: () => void }) {
  if (!model) return null
  return <Suspense fallback={null}><MetricDetailSheet model={model} onClose={onClose} /></Suspense>
}

export function MetricDetailButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="metric-detail-trigger" onClick={onClick} aria-label={`Подробнее: ${label}`}>Подробнее</button>
}
