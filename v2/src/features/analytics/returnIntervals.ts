export const RETURN_INTERVAL_ALIGNMENT_VERSION = '1.0' as const

export type ReturnPricePoint = {
  date: string
  value: number
}

export type ReturnIntervalObservation = {
  key: string
  from: string
  to: string
  value: number
}

const MIN_RETURN = -0.95
const MAX_RETURN = 10

/**
 * Builds close-to-close return observations keyed by the exact pair of
 * observation dates. Matching only on the ending date is unsafe: if one
 * instrument is missing an intermediate candle, its return can span a wider
 * interval than another instrument's return that ends on the same day.
 *
 * Duplicate same-day prices are collapsed when identical. Conflicting
 * duplicates are discarded for that day, so no arbitrary same-day value is
 * selected.
 */
export function buildReturnIntervalMap(points: ReturnPricePoint[]) {
  const byDate = new Map<string, number | null>()

  for (const point of Array.isArray(points) ? points : []) {
    if (!point?.date || !Number.isFinite(point.value) || point.value <= 0) continue
    const date = String(point.date).trim()
    if (!date) continue

    if (!byDate.has(date)) {
      byDate.set(date, point.value)
      continue
    }

    const existing = byDate.get(date)
    if (existing != null && existing !== point.value) byDate.set(date, null)
  }

  const sorted = [...byDate.entries()]
    .filter((entry): entry is [string, number] => entry[1] != null)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const out = new Map<string, ReturnIntervalObservation>()
  for (let index = 1; index < sorted.length; index += 1) {
    const prior = sorted[index - 1]
    const current = sorted[index]
    if (prior.date >= current.date) continue

    const value = current.value / prior.value - 1
    if (!Number.isFinite(value) || value <= MIN_RETURN || value >= MAX_RETURN) continue

    const key = `${prior.date}\u0000${current.date}`
    out.set(key, {
      key,
      from: prior.date,
      to: current.date,
      value,
    })
  }

  return out
}

export function commonReturnIntervalKeys(
  maps: Array<Map<string, ReturnIntervalObservation>>,
) {
  if (!maps.length) return [] as string[]
  return [...maps[0].keys()]
    .filter(key => maps.every(map => map.has(key)))
    .sort((a, b) => {
      const left = maps[0].get(a)!
      const right = maps[0].get(b)!
      return left.to.localeCompare(right.to) || left.from.localeCompare(right.from)
    })
}
