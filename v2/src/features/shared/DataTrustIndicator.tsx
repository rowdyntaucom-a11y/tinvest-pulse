import type { DataTrustSnapshot } from '../../lib/dataTrust'
import './dataTrustIndicator.css'

const LABELS = { LOADING: 'ЗАГРУЗКА', LIVE: 'LIVE', PARTIAL: 'ЧАСТИЧНО', STALE: 'УСТАРЕЛО', FALLBACK: 'РЕЗЕРВ', ERROR: 'ОШИБКА', UNAVAILABLE: 'НЕДОСТУПНО' } as const

function humanSource(sourceId: string | null | undefined) {
  if (!sourceId) return 'Источник не указан'
  const normalized = sourceId.trim().toUpperCase()
  if (normalized.includes('LOCAL_FALLBACK') || normalized === 'FALLBACK' || normalized.includes('LOCAL-FALLBACK')) return 'Локальная резервная копия'
  if (normalized.includes('TINKOFF') || normalized.includes('T-INVEST') || normalized.includes('T_INVEST')) return 'T-Инвестиции'
  if (normalized.includes('MOEX')) return 'Московская биржа'
  return 'Источник данных'
}

function humanAge(ageMs: number | null | undefined) {
  if (ageMs == null) return 'Время обновления не указано'
  const minutes = Math.max(0, Math.floor(ageMs / 60_000))
  if (minutes < 1) return 'Обновлено только что'
  if (minutes < 60) return `Обновлено ${minutes} мин назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Обновлено ${hours} ч назад`
  return `Обновлено ${Math.floor(hours / 24)} дн назад`
}

export function DataTrustIndicator({ trust, compact = false }: { trust: DataTrustSnapshot; compact?: boolean }) {
  const source = humanSource(trust.sourceId)
  const age = humanAge(trust.ageMs)
  return <span className={`data-trust is-${trust.status.toLowerCase()}${compact ? ' is-compact' : ''}`} aria-label={`${LABELS[trust.status]}. ${trust.shortReason}. Источник: ${source}. ${age}`} title={`${trust.shortReason} · ${source} · ${age}`}>
    <b>{LABELS[trust.status]}</b><small>{source} · {age}</small>
  </span>
}
