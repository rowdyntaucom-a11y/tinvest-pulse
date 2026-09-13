export const WORLD_RUNTIME_STATE_VERSION = '0.1' as const

export type WorldRuntimeCompositionInput = {
  qualityCoverage: number
  persistedXp?: unknown
  level: number
  xpToNext: number | null
  weather: string
  localDate?: Date
}

export type WorldRuntimeCompositionAdapters<TEvent, TLedger extends { accumulatedXp: number }, TWorldEvent, TWorld> = {
  readXpEvents: (persisted: unknown) => TEvent[]
  buildLedger: (events: TEvent[]) => TLedger
  buildEvents: (events: TEvent[]) => TWorldEvent[]
  buildWorld: (input: {
    level: number
    xp: number
    xpToNext: number | null
    qualityCoverage: number
    weather: string
    events: TWorldEvent[]
    localDate?: Date
  }) => TWorld
}

export type WorldRuntimeComposition<TLedger, TWorld> = {
  version: typeof WORLD_RUNTIME_STATE_VERSION
  world: TWorld
  ledger: TLedger
  persistedXpEvents: number
}

/** Dependency-free composition policy so mandatory Node regressions can test the wiring itself. */
export function composeWorldRuntimeState<
  TEvent,
  TLedger extends { accumulatedXp: number },
  TWorldEvent,
  TWorld,
>(
  input: WorldRuntimeCompositionInput,
  adapters: WorldRuntimeCompositionAdapters<TEvent, TLedger, TWorldEvent, TWorld>,
): WorldRuntimeComposition<TLedger, TWorld> {
  const events = adapters.readXpEvents(input.persistedXp)
  const ledger = adapters.buildLedger(events)
  const worldEvents = adapters.buildEvents(events)

  return {
    version: WORLD_RUNTIME_STATE_VERSION,
    world: adapters.buildWorld({
      level: input.level,
      xp: ledger.accumulatedXp,
      xpToNext: input.xpToNext,
      qualityCoverage: input.qualityCoverage,
      weather: input.weather,
      events: worldEvents,
      localDate: input.localDate,
    }),
    ledger,
    persistedXpEvents: events.length,
  }
}
