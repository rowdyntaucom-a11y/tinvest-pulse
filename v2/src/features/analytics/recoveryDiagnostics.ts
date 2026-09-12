import type { AnalyticsHistoryPoint } from './metrics'

export const RECOVERY_DIAGNOSTICS_CALC_VERSION = '1.0' as const

export type DrawdownRecoveryQuality = 'SHORT' | 'DEVELOPING' | 'MATURE'

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
  returnObservations: number
  historyPoints: number
  completedEpisodes: DrawdownEpisode[]
  activeDrawdown: ActiveDrawdown | null
  worstCompletedEpisode: DrawdownEpisode | null
  medianRecoveryDays: number | null
  reason: string | null
}

const MIN_RETURNS = 60
const MATURE_RETURNS = 252
const DAY_MS = 86_400_000

function validIndex(history: AnalyticsHistoryPoint[]) {
  return history
    .map(point => ({ date: String(point.date || ''), value: point.portfolio }))
    .filter((point): point is { date: string; value: number } => {
      return Boolean(point.date)
        && typeof point.value === 'number'
        && Number.isFinite(point.value)
        && point.value > 0
        && Number.isFinite(Date.parse(point.date))
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

function daysBetween(start: string, end: string) {
  const startMs = Date.parse(start)
  const endMs = Date.parse(end)
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
  const index = validIndex(history)
  const returnObservations = Math.max(0, index.length - 1)
  const quality: DrawdownRecoveryQuality = returnObservations >= MATURE_RETURNS
    ? 'MATURE'
    : returnObservations >= MIN_RETURNS
      ? 'DEVELOPING'
      : 'SHORT'

  if (returnObservations < MIN_RETURNS) {
    return {
      calcVersion: RECOVERY_DIAGNOSTICS_CALC_VERSION,
      available: false,
      quality,
      returnObservations,
      historyPoints: index.length,
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
    calcVersion: RECOVERY_DIAGNOSTICS_CALC_VERSION,
    available: true,
    quality,
    returnObservations,
    historyPoints: index.length,
    completedEpisodes: episodes,
    activeDrawdown,
    worstCompletedEpisode,
    medianRecoveryDays: median(episodes.map(episode => episode.troughToRecoveryDays)),
    reason: null,
  }
}
