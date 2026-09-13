import { buildQualitySnapshot, buildXpLedger, type QualityInputs, type QualitySnapshot, type XpEvent, type XpLedger } from './xpEngine'
import { readXpLedgerDocument } from './xpPersistence'
import { buildWorldState, type WorldEvent, type WorldState, type WorldWeather } from './worldState'
import { buildXpWorldEvents } from './xpWorldEvents'
import { composeWorldRuntimeState, WORLD_RUNTIME_STATE_VERSION } from './worldRuntimeStatePolicy'

export { WORLD_RUNTIME_STATE_VERSION } from './worldRuntimeStatePolicy'

export type WorldProgressionInput = {
  level: number
  xpToNext?: number | null
}

export type WorldRuntimeStateInput = {
  quality: QualitySnapshot
  persistedXp?: unknown
  progression: WorldProgressionInput
  weather?: WorldWeather | null
  localDate?: Date
}

export type WorldRuntimeState = {
  version: typeof WORLD_RUNTIME_STATE_VERSION
  world: WorldState
  ledger: XpLedger
  persistedXpEvents: number
}

/**
 * Composes already-reviewed deterministic DNA boundaries into the single object consumed by
 * the renderer. This bridge does not award XP, choose level thresholds, derive weather from
 * returns/capital, or select art/animation for semantic events.
 */
export function buildWorldRuntimeState(input: WorldRuntimeStateInput): WorldRuntimeState {
  return composeWorldRuntimeState<XpEvent, XpLedger, WorldEvent, WorldState>(
    {
      qualityCoverage: input.quality.coverage,
      persistedXp: input.persistedXp,
      level: input.progression.level,
      xpToNext: input.progression.xpToNext ?? null,
      weather: input.weather ?? 'neutral',
      localDate: input.localDate,
    },
    {
      readXpEvents: persisted => readXpLedgerDocument(persisted).events,
      buildLedger: events => buildXpLedger(events),
      buildEvents: events => buildXpWorldEvents(events),
      buildWorld: value => buildWorldState({
        level: value.level,
        xp: value.xp,
        xpToNext: value.xpToNext,
        qualityCoverage: value.qualityCoverage,
        weather: value.weather as WorldWeather,
        events: value.events,
        localDate: value.localDate,
      }),
    },
  )
}

/** Financial analytics may provide quality inputs, while persistent progression stays separate. */
export function buildWorldRuntimeStateFromQualityInputs(
  qualityInputs: QualityInputs,
  input: Omit<WorldRuntimeStateInput, 'quality'>,
): WorldRuntimeState {
  return buildWorldRuntimeState({
    ...input,
    quality: buildQualitySnapshot(qualityInputs),
  })
}
