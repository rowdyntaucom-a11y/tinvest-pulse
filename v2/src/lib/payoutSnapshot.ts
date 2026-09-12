import { useSyncExternalStore } from 'react'
import { loadPayoutCalendar, type PayoutCalendar } from './payoutsApi'

export const PAYOUT_SNAPSHOT_VERSION = '1.1' as const
export const PAYOUT_SNAPSHOT_REFRESH_MS = 10 * 60_000

export type PayoutSnapshotState = {
  calendar: PayoutCalendar | null
  loading: boolean
}

type Listener = () => void

type PayoutSnapshotStoreOptions = {
  loader: () => Promise<PayoutCalendar>
  refreshMs?: number
  now?: () => number
}

export function createPayoutSnapshotStore({
  loader,
  refreshMs = PAYOUT_SNAPSHOT_REFRESH_MS,
  now = Date.now,
}: PayoutSnapshotStoreOptions) {
  let state: PayoutSnapshotState = { calendar: null, loading: true }
  let lastLoadedAt = 0
  let inFlight: Promise<PayoutCalendar | null> | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  const listeners = new Set<Listener>()

  const publish = (next: PayoutSnapshotState) => {
    state = next
    for (const listener of listeners) listener()
  }

  const refresh = async (force = false): Promise<PayoutCalendar | null> => {
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

const payoutSnapshotStore = createPayoutSnapshotStore({ loader: loadPayoutCalendar })

function idleSubscribe() {
  return () => undefined
}

export function usePayoutSnapshot(enabled = true) {
  return useSyncExternalStore(
    enabled ? payoutSnapshotStore.subscribe : idleSubscribe,
    payoutSnapshotStore.getSnapshot,
    payoutSnapshotStore.getSnapshot,
  )
}
