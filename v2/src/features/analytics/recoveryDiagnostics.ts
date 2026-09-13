import type { AnalyticsHistoryPoint } from './metrics'

export const RECOVERY_DIAGNOSTICS_CALC_VERSION = '1.2' as const

export type DrawdownRecoveryQuality = 'SHORT' | 'DEVELOPING' | 'MATURE'
export type RecoveryHistoryIntegrity = 'OK' | 'CONFLICT'

export type DrawdownEpisode = {
  peakDate: string
  troughDate: string
  recoveryDate: string
  depth: number
  peakToTroughDays: number
  troughToRecoveryDays: number
  totalDays: number
}

export type ActiveDrawdown = {
  peakDate: string
  troughDate: string
  asOfDate: string
  depth: number
  currentDrawdown: number
  daysSincePeak: number
  daysSinceTrough: number
}

export type RecoveryDiagnostics = {
  calcVersion: typeof RECOVERY_DIAGNOSTICS_CALC_VERSION
  available: boolean
  quality: DrawdownRecoveryQuality
  integrity: RecoveryHistoryIntegrity
  returnObservations: number
  historyPoints: number
  duplicateRowsCollapsed: number
  conflictingDates: number
  sampleFrom: string | null
  sampleTo: string | null
  completedEpisodes: DrawdownEpisode[]
  activeDrawdown: ActiveDrawdown | null
  worstCompletedEpisode: DrawdownEpisode | null
  medianRecoveryDays: number | null
  reason: string | null
}

const MIN_RETURNS = 60
const MATURE_RETURNS = 252
const DAY_MS = 86_400_000

function canonicalDay(value: unknown) {
  const raw = String(value || '').trim()
  if (!raw) return null
  const day = raw.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const timestamp = Date.parse(`${day}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10) === day ? day : null
}

function normalizeIndex(history: AnalyticsHistoryPoint[]) {
  const byDate = new Map<string, number>()
  const conflicts = new Set<string>()
  let duplicateRowsCollapsed = 0

  for (const point of history) {
    const date = canonicalDay(point.date)
    const value = point.portfolio
    if (!date || typeof value !== 'number' || !Number.isFinite(value) || value <= 0) continue

    const existing = byDate.get(date)
    if (existing == null) {
      byDate.set(date, value)
      continue
    }

    duplicateRowsCollapsed += 1
    if (existing !== value) conflicts.add(date)
  }

  const index = [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    index,
    duplicateRowsCollapsed,
    conflictingDates: conflicts.size,
  }
}

function daysBetween(start: string, end: string) {
  const startMs = Date.parse(`${start}T00:00:00.000Z`)
  const endMs = Date.parse(`${end}T00:00:00.000Z`)
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0
  return Math.max(0, Math.round((endMs - startMs) / DAY_MS))
}

function median(values: number[]) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2) return sorted[middle]
  return (sorted[middle - 1] + sorted[middle]) / 2
}

export function calculateRecoveryDiagnostics(history: AnalyticsHistoryPoint[]): RecoveryDiagnostics {
  const normalized = normalizeIndex(history)
  const index = normalized.index
  const returnObservations = Math.max(0, index.length - 1)
  const quality: DrawdownRecoveryQuality = returnObservations >= MATURE_RETURNS
    ? 'MATURE'
    : returnObservations >= MIN_RETURNS
      ? 'DEVELOPING'
      : 'SHORT'
  const sampleFrom = index[0]?.date ?? null
  const sampleTo = index.at(-1)?.date ?? null

  const base = {
    calcVersion: RECOVERY_DIAGNOSTICS_CALC_VERSION,
    quality,
    returnObservations,
    historyPoints: index.length,
    duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
    conflictingDates: normalized.conflictingDates,
    sampleFrom,
    sampleTo,
  }

  if (normalized.conflictingDates > 0) {
    return {
      ...base,
      available: false,
      integrity: 'CONFLICT',
      completedEpisodes: [],
      activeDrawdown: null,
      worstCompletedEpisode: null,
      medianRecoveryDays: null,
      reason: `История неоднозначна: конфликтующих дат ${normalized.conflictingDates}.`,
    }
  }

  if (returnObservations < MIN_RETURNS) {
    return {
      ...base,
      available: false,
      integrity: 'OK',
      completedEpisodes: [],
      activeDrawdown: null,
      worstCompletedEpisode: null,
      medianRecoveryDays: null,
      reason: `Нужно минимум ${MIN_RETURNS} дневных доходностей; доступно ${returnObservations}.`,
    }
  }

  let peak = index[0]
  let trough = index[0]
  let inDrawdown = false
  const episodes: DrawdownEpisode[] = []

  for (let i = 1; i < index.length; i += 1) {
    const point = index[i]

    if (!inDrawdown) {
      if (point.value >= peak.value) {
        peak = point
        trough = point
        continue
      }
      inDrawdown = true
      trough = point
      continue
    }

    if (point.value < trough.value) trough = point

    if (point.value >= peak.value) {
      const depth = peak.value > 0 ? 1 - trough.value / peak.value : 0
      episodes.push({
        peakDate: peak.date,
        troughDate: trough.date,
        recoveryDate: point.date,
        depth: Math.max(0, depth),
        peakToTroughDays: daysBetween(peak.date, trough.date),
        troughToRecoveryDays: daysBetween(trough.date, point.date),
        totalDays: daysBetween(peak.date, point.date),
      })
      peak = point
      trough = point
      inDrawdown = false
    }
  }

  const last = index.at(-1)!
  const activeDrawdown = inDrawdown
    ? {
        peakDate: peak.date,
        troughDate: trough.date,
        asOfDate: last.date,
        depth: Math.max(0, 1 - trough.value / peak.value),
        currentDrawdown: Math.max(0, 1 - last.value / peak.value),
        daysSincePeak: daysBetween(peak.date, last.date),
        daysSinceTrough: daysBetween(trough.date, last.date),
      }
    : null

  const worstCompletedEpisode = episodes.length
    ? [...episodes].sort((a, b) => b.depth - a.depth)[0]
    : null

  return {
    ...base,
    available: true,
    integrity: 'OK',
    completedEpisodes: episodes,
    activeDrawdown,
    worstCompletedEpisode,
    medianRecoveryDays: median(episodes.map(episode => episode.troughToRecoveryDays)),
    reason: null,
  }
}
