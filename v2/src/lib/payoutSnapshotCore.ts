export const PAYOUT_SNAPSHOT_VERSION = '1.1' as const
export const PAYOUT_SNAPSHOT_REFRESH_MS = 10 * 60_000

export type PayoutSnapshotState<T> = {
  calendar: T | null
  loading: boolean
}

type Listener = () => void

type PayoutSnapshotStoreOptions<T> = {
  loader: () => Promise<T>
  refreshMs?: number
  now?: () => number
}

/**
 * Small deterministic coordinator for one shared payout snapshot.
 *
 * It owns no storage and knows nothing about broker data. Multiple consumers
 * share one in-flight load and one last-good snapshot. A failed refresh keeps
 * the last successful value. The wrapper decides when consumers subscribe.
 */
export function createPayoutSnapshotStore<T>({
  loader,
  refreshMs = PAYOUT_SNAPSHOT_REFRESH_MS,
  now = Date.now,
}: PayoutSnapshotStoreOptions<T>) {
  let state: PayoutSnapshotState<T> = { calendar: null, loading: true }
  let lastLoadedAt = 0
  let inFlight: Promise<T | null> | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  const listeners = new Set<Listener>()

  const publish = (next: PayoutSnapshotState<T>) => {
    state = next
    for (const listener of listeners) listener()
  }

  const refresh = async (force = false): Promise<T | null> => {
    const currentTime = now()
    if (!force && state.calendar && currentTime - lastLoadedAt < refreshMs) {
      return state.calendar
    }
    if (inFlight) return inFlight

    if (!state.calendar && !state.loading) publish({ ...state, loading: true })

    inFlight = loader()
      .then(calendar => {
        lastLoadedAt = now()
        publish({ calendar, loading: false })
        return calendar
      })
      .catch(() => {
        publish({ ...state, loading: false })
        return state.calendar
      })
      .finally(() => {
        inFlight = null
      })

    return inFlight
  }

  const startRefreshLoop = () => {
    void refresh(false)
    if (timer != null) return
    timer = setInterval(() => { void refresh(true) }, refreshMs)
  }

  const stopRefreshLoop = () => {
    if (timer == null) return
    clearInterval(timer)
    timer = null
  }

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    if (listeners.size === 1) startRefreshLoop()
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) stopRefreshLoop()
    }
  }

  const getSnapshot = () => state

  return {
    version: PAYOUT_SNAPSHOT_VERSION,
    refreshMs,
    getSnapshot,
    subscribe,
    refresh,
  }
}
