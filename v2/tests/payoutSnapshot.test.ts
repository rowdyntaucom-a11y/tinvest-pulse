import assert from 'node:assert/strict'
import {
  createPayoutSnapshotStore,
  PAYOUT_SNAPSHOT_REFRESH_MS,
  PAYOUT_SNAPSHOT_VERSION,
} from '../src/lib/payoutSnapshotCore.ts'

type Snapshot = { generatedAt: string }

type Deferred = {
  promise: Promise<Snapshot>
  resolve: (value: Snapshot) => void
  reject: (reason?: unknown) => void
}

function deferred(): Deferred {
  let resolve!: Deferred['resolve']
  let reject!: Deferred['reject']
  const promise = new Promise<Snapshot>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

let nowMs = 1_000_000
let calls = 0
const requests: Deferred[] = []
const store = createPayoutSnapshotStore<Snapshot>({
  now: () => nowMs,
  loader: () => {
    calls += 1
    const request = deferred()
    requests.push(request)
    return request.promise
  },
})

assert.equal(store.version, PAYOUT_SNAPSHOT_VERSION)
assert.equal(store.version, '1.1')
assert.equal(store.refreshMs, PAYOUT_SNAPSHOT_REFRESH_MS)
assert.deepEqual(store.getSnapshot(), { calendar: null, loading: true })

let notifiedA = 0
let notifiedB = 0
const unsubscribeA = store.subscribe(() => { notifiedA += 1 })
const unsubscribeB = store.subscribe(() => { notifiedB += 1 })

assert.equal(calls, 1, 'multiple subscribers must share the first in-flight request')
const firstPending = store.refresh(false)
assert.equal(calls, 1, 'manual refresh while first request is in flight must deduplicate')

const first = { generatedAt: '2026-09-12T10:00:00.000Z' }
requests[0].resolve(first)
assert.equal(await firstPending, first)
assert.equal(store.getSnapshot().calendar, first)
assert.equal(store.getSnapshot().loading, false)
assert.equal(notifiedA, 1)
assert.equal(notifiedB, 1)

nowMs += PAYOUT_SNAPSHOT_REFRESH_MS - 1
assert.equal(await store.refresh(false), first)
assert.equal(calls, 1, 'snapshot inside TTL must be reused without a network call')

nowMs += 2
const secondPending = store.refresh(false)
assert.equal(calls, 2, 'expired snapshot must request a refresh')
const secondConcurrent = store.refresh(true)
assert.equal(calls, 2, 'forced refresh must still deduplicate an existing in-flight request')
const second = { generatedAt: '2026-09-12T10:10:00.000Z' }
requests[1].resolve(second)
assert.equal(await secondPending, second)
assert.equal(await secondConcurrent, second)
assert.equal(store.getSnapshot().calendar, second)
assert.equal(notifiedA, 2)
assert.equal(notifiedB, 2)

const failedPending = store.refresh(true)
assert.equal(calls, 3)
requests[2].reject(new Error('temporary payout failure'))
assert.equal(await failedPending, second, 'failed refresh must preserve the last good snapshot')
assert.equal(store.getSnapshot().calendar, second)
assert.equal(store.getSnapshot().loading, false)
assert.equal(notifiedA, 3)
assert.equal(notifiedB, 3)

unsubscribeA()
unsubscribeB()

console.log('payout snapshot regression: ok')
