import { resolveWorldEventQueue, type WorldEventCursorDocument } from './worldEventQueue'
import type { WorldEvent, WorldState, WorldTimePhase, WorldWeather } from './worldState'

export const WORLD_RENDER_SNAPSHOT_VERSION = '0.1' as const

export type WorldRenderSnapshot = {
  version: typeof WORLD_RENDER_SNAPSHOT_VERSION
  worldStateVersion: WorldState['version']
  level: number
  timePhase: WorldTimePhase
  weather: WorldWeather
  pendingEvents: WorldEvent[]
  pendingEventCount: number
}

/**
 * Final deterministic boundary before PixiJS.
 *
 * The renderer receives only presentation-relevant, already-resolved state. XP totals,
 * quality inputs, acknowledgement history and financial metrics stay outside the renderer.
 * Already-acknowledged semantic events are removed before this snapshot is produced.
 */
export function buildWorldRenderSnapshot(
  state: WorldState,
  cursor: WorldEventCursorDocument,
): WorldRenderSnapshot {
  const queue = resolveWorldEventQueue(state, cursor)
  const pendingEvents = queue.pending.map(event => ({ ...event }))

  return {
    version: WORLD_RENDER_SNAPSHOT_VERSION,
    worldStateVersion: state.version,
    level: state.level,
    timePhase: state.timePhase,
    weather: state.weather,
    pendingEvents,
    pendingEventCount: pendingEvents.length,
  }
}
