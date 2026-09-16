import type { DataTrustSnapshot } from '../../lib/dataTrust'
import './dataTrustIndicator.css'

const LABELS = { LOADING: 'ЗАГРУЗКА', LIVE: 'LIVE', PARTIAL: 'ЧАСТИЧНО', STALE: 'УСТАРЕЛО', FALLBACK: 'РЕЗЕРВ', ERROR: 'ОШИБКА', UNAVAILABLE: 'НЕДОСТУПНО' } as const

export function DataTrustIndicator({ trust, compact = false }: { trust: DataTrustSnapshot; compact?: boolean }) {
  const source = trust.sourceId || 'источник не указан'
  const age = trust.ageMs == null ? 'время источника не предоставлено' : `возраст ${Math.floor(trust.ageMs / 60_000)} мин`
  return <span className={`data-trust is-${trust.status.toLowerCase()}${compact ? ' is-compact' : ''}`} aria-label={`${LABELS[trust.status]}. ${trust.shortReason}. Источник: ${source}. ${age}`} title={`${trust.shortReason} · ${source} · ${age}`}>
    <b>{LABELS[trust.status]}</b><small>{source} · {age}</small>
  </span>
}
