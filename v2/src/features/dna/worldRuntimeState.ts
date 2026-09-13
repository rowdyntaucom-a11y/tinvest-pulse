import { buildQualitySnapshot, buildXpLedger, type QualityInputs, type QualitySnapshot, type XpLedger } from './xpEngine'
import { readXpLedgerDocument, type XpLedgerDocument } from './xpPersistence'
import { buildWorldState, type WorldState, type WorldWeather } from './worldState'
import { buildXpWorldEvents } from './xpWorldEvents'

export const WORLD_RUNTIME_STATE_VERSION = '0.1' as const

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
 *
 * Persisted XP is parsed fail-closed. Level remains an explicit/versioned product input until
 * the long-term progression economy is reviewed; it is never inferred from RUB capital here.
 */
export function buildWorldRuntimeState(input: WorldRuntimeStateInput): WorldRuntimeState {
  const document: XpLedgerDocument = readXpLedgerDocument(input.persistedXp)
  const ledger = buildXpLedger(document.events)
  const events = buildXpWorldEvents(document.events)

  return {
    version: WORLD_RUNTIME_STATE_VERSION,
    world: buildWorldState({
      level: input.progression.level,
      xp: ledger.accumulatedXp,
      xpToNext: input.progression.xpToNext ?? null,
      qualityCoverage: input.quality.coverage,
      weather: input.weather ?? 'neutral',
      events,
      localDate: input.localDate,
    }),
    ledger,
    persistedXpEvents: document.events.length,
  }
}

/**
 * Convenience boundary for the current application shell: financial analytics may provide
 * quality inputs, but persistent progression remains separate and explicit.
 */
export function buildWorldRuntimeStateFromQualityInputs(
  qualityInputs: QualityInputs,
  input: Omit<WorldRuntimeStateInput, 'quality'>,
): WorldRuntimeState {
  return buildWorldRuntimeState({
    ...input,
    quality: buildQualitySnapshot(qualityInputs),
  })
}
