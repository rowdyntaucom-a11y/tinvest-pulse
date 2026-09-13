import { useEffect, useState } from 'react'
import { millisecondsUntilNextWorldPhaseBoundary } from './worldPhaseClockPolicy'

/**
 * Keeps local world time fresh only while DNA is visible. It wakes at phase
 * boundaries instead of polling every minute, preserving mobile efficiency.
 */
export function useWorldPhaseClock(active: boolean) {
  const [localDate, setLocalDate] = useState(() => new Date())

  useEffect(() => {
    if (!active) return

    let cancelled = false
    let timer: number | null = null

    const schedule = (now: Date) => {
      if (cancelled) return
      setLocalDate(now)
      timer = window.setTimeout(
        () => schedule(new Date()),
        millisecondsUntilNextWorldPhaseBoundary(now) + 50,
      )
    }

    schedule(new Date())

    return () => {
      cancelled = true
      if (timer != null) window.clearTimeout(timer)
    }
  }, [active])

  return localDate
}
