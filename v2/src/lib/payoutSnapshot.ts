import { useSyncExternalStore } from 'react'
import { loadPayoutCalendar, type PayoutCalendar } from './payoutsApi'
import {
  createPayoutSnapshotStore,
  PAYOUT_SNAPSHOT_REFRESH_MS,
  PAYOUT_SNAPSHOT_VERSION,
} from './payoutSnapshotCore'

export { PAYOUT_SNAPSHOT_REFRESH_MS, PAYOUT_SNAPSHOT_VERSION }

const payoutSnapshotStore = createPayoutSnapshotStore<PayoutCalendar>({ loader: loadPayoutCalendar })

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
