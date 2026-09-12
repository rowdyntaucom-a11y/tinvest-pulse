import { useSyncExternalStore } from 'react'
import { loadPayoutCalendar, type PayoutCalendar } from './payoutsApi'

export const PAYOUT_SNAPSHOT_VERSION = '1.0' as const
export const PAYOUT_SNAPSHOT_REFRESH_MS = 10 * 60_000

type PayoutSnapshotState = {
  calendar: PayoutCalendar | null
  loading: boolean
}

type Listener = () => void

let state: PayoutSnapshotState = { calendar: null, loading: true }
let lastLoadedAt = 0
let inFlight: Promise<PayoutCalendar> | null = null
let timer: ReturnType<typeof setInterval> | null = null
const listeners = new Set<Listener>()

function publish(next: PayoutSnapshotState) {
  state = next
  for (const listener of listeners) listener()
}

async function refresh(force = false) {
  const now = Date.now()
  if (!force && state.calendar && now - lastLoadedAt < PAYOUT_SNAPSHOT_REFRESH_MS) {
    return state.calendar
  }
  if (inFlight) return inFlight

  if (!state.calendar && !state.loading) publish({ ...state, loading: true })

  inFlight = loadPayoutCalendar()
    .then(calendar => {
      lastLoadedAt = Date.now()
      publish({ calendar, loading: false })
      return calendar
    })
    .catch(() => {
      publish({ ...state, loading: false })
      return state.calendar as PayoutCalendar
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

function startRefreshLoop() {
  void refresh(false)
  if (timer != null) return
  timer = setInterval(() => { void refresh(true) }, PAYOUT_SNAPSHOT_REFRESH_MS)
}

function stopRefreshLoop() {
  if (timer == null) return
  clearInterval(timer)
  timer = null
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  if (listeners.size === 1) startRefreshLoop()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stopRefreshLoop()
  }
}

function idleSubscribe() {
  return () => undefined
}

function getSnapshot() {
  return state
}

export function usePayoutSnapshot(enabled = true) {
  return useSyncExternalStore(enabled ? subscribe : idleSubscribe, getSnapshot, getSnapshot)
}
