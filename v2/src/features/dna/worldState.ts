export type WorldTimePhase = 'dawn' | 'day' | 'sunset' | 'night'
export type WorldWeather = 'neutral' | 'clear' | 'cloudy' | 'rain' | 'storm'

export type WorldEvent = {
  id: string
  kind: string
  occurredAt: string
  intensity?: number | null
  title?: string | null
}

export type WorldState = {
  version: '0.1'
  level: number
  xp: number
  xpToNext: number | null
  qualityCoverage: number
  timePhase: WorldTimePhase
  weather: WorldWeather
  events: WorldEvent[]
}

export type WorldStateInput = {
  level: number
  xp: number
  xpToNext?: number | null
  qualityCoverage?: number | null
  weather?: WorldWeather | null
  events?: WorldEvent[]
  localDate?: Date
}

const WORLD_WEATHERS: readonly WorldWeather[] = ['neutral', 'clear', 'cloudy', 'rain', 'storm']
const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function normalizeWeather(value: unknown): WorldWeather {
  return WORLD_WEATHERS.includes(value as WorldWeather) ? value as WorldWeather : 'neutral'
}

export function localTimePhase(date = new Date()): WorldTimePhase {
  const hour = date.getHours()
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'sunset'
  return 'night'
}

function cleanEvents(events: WorldEvent[]) {
  const seen = new Set<string>()
  return events
    .filter(event => {
      const id = String(event?.id || '').trim()
      const kind = String(event?.kind || '').trim()
      const timestamp = Date.parse(String(event?.occurredAt || ''))
      if (!id || !kind || !Number.isFinite(timestamp) || seen.has(id)) return false
      seen.add(id)
      return true
    })
    .map(event => ({
      ...event,
      id: String(event.id).trim(),
      kind: String(event.kind).trim(),
      occurredAt: new Date(event.occurredAt).toISOString(),
      intensity: typeof event.intensity === 'number' && Number.isFinite(event.intensity)
        ? clamp01(event.intensity)
        : null,
      title: event.title == null ? null : String(event.title).trim() || null,
    }))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id))
    .slice(0, 20)
}

/**
 * This boundary does not calculate level thresholds or weather from money/returns.
 * Those decisions stay in versioned deterministic rule modules. PixiJS receives only a compact,
 * already-resolved state object plus local time phase.
 *
 * Missing or malformed weather fails closed to `neutral`; the renderer must never invent market
 * atmosphere when no reviewed weather rule has resolved one.
 */
export function buildWorldState(input: WorldStateInput): WorldState {
  const level = Number.isFinite(input.level) ? Math.max(1, Math.floor(input.level)) : 1
  const xp = Number.isFinite(input.xp) ? Math.max(0, input.xp) : 0
  const xpToNext = typeof input.xpToNext === 'number' && Number.isFinite(input.xpToNext)
    ? Math.max(0, input.xpToNext)
    : null
  const qualityCoverage = typeof input.qualityCoverage === 'number' && Number.isFinite(input.qualityCoverage)
    ? clamp01(input.qualityCoverage)
    : 0

  return {
    version: '0.1',
    level,
    xp,
    xpToNext,
    qualityCoverage,
    timePhase: localTimePhase(input.localDate),
    weather: normalizeWeather(input.weather),
    events: cleanEvents(Array.isArray(input.events) ? input.events : []),
  }
}
