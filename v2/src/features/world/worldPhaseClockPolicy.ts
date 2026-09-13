export const WORLD_PHASE_CLOCK_POLICY_VERSION = '0.1' as const

const WORLD_PHASE_BOUNDARY_HOURS = [5, 8, 17, 20] as const
const INVALID_DATE_RETRY_MS = 60_000
const MIN_TIMER_DELAY_MS = 250

/**
 * Returns the delay until the next local-time phase boundary used by WorldState.
 * The policy is presentation/runtime only: it reads no portfolio, XP or market data.
 * Local Date constructors intentionally preserve the device timezone and DST rules.
 */
export function millisecondsUntilNextWorldPhaseBoundary(date: Date): number {
  const now = date.getTime()
  if (!Number.isFinite(now)) return INVALID_DATE_RETRY_MS

  for (const hour of WORLD_PHASE_BOUNDARY_HOURS) {
    const candidate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      0,
      0,
      0,
    )
    const delay = candidate.getTime() - now
    if (delay > 0) return Math.max(MIN_TIMER_DELAY_MS, delay)
  }

  const tomorrowDawn = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    WORLD_PHASE_BOUNDARY_HOURS[0],
    0,
    0,
    0,
  )
  return Math.max(MIN_TIMER_DELAY_MS, tomorrowDawn.getTime() - now)
}
