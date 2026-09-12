import assert from 'node:assert/strict'
import {
  markerMatchesInstrument,
  normalizeTransactionMarkers,
} from '../src/features/portfolio/transactionMarkers.ts'

const normalized = normalizeTransactionMarkers([
  {
    operationId: 'buy-1',
    date: '2026-09-10T10:15:00+03:00',
    type: 'OPERATION_TYPE_BUY',
    figi: 'BBG000000001',
    instrumentUid: 'uid-1',
    quantity: 2,
  },
  {
    operationId: 'sell-1',
    date: '2026-09-11T12:00:00Z',
    type: 'OPERATION_TYPE_SELL',
    figi: 'BBG000000002',
    quantity: '3',
  },
  // Duplicate broker operation IDs must never create a second chart event.
  {
    operationId: 'buy-1',
    date: '2026-09-12T10:15:00Z',
    type: 'OPERATION_TYPE_BUY',
    figi: 'BBG000000001',
    quantity: 99,
  },
  // Unsupported operation types fail closed even when BUY/SELL-like wording appears.
  {
    operationId: 'unsupported-1',
    date: '2026-09-12T10:15:00Z',
    type: 'OPERATION_TYPE_BUY_CARD',
    figi: 'BBG000000003',
  },
  // Marker identity requires a broker instrument identifier.
  {
    operationId: 'missing-instrument',
    date: '2026-09-12T10:15:00Z',
    type: 'OPERATION_TYPE_SELL',
  },
  // Invalid timestamps cannot be reconstructed into approximate dates.
  {
    operationId: 'bad-date',
    date: 'not-a-date',
    type: 'OPERATION_TYPE_BUY',
    figi: 'BBG000000004',
  },
])

assert.equal(normalized.accepted, 2)
assert.equal(normalized.duplicates, 1)
assert.equal(normalized.rejected, 3)
assert.deepEqual(normalized.markers.map(marker => marker.id), ['buy-1', 'sell-1'])
assert.equal(normalized.markers[0]?.date, '2026-09-10T07:15:00.000Z')
assert.equal(normalized.markers[0]?.side, 'BUY')
assert.equal(normalized.markers[0]?.quantity, 2)
assert.equal(normalized.markers[1]?.side, 'SELL')
assert.equal(normalized.markers[1]?.quantity, 3)

const deliveryAndPrimary = normalizeTransactionMarkers([
  {
    operationId: 'delivery-buy',
    date: '2026-09-01T08:00:00Z',
    type: 'OPERATION_TYPE_DELIVERY_BUY',
    instrumentUid: 'uid-delivery',
  },
  {
    operationId: 'delivery-sell',
    date: '2026-09-02T08:00:00Z',
    type: 'OPERATION_TYPE_DELIVERY_SELL',
    instrumentUid: 'uid-delivery',
  },
  {
    operationId: 'primary',
    date: '2026-09-03T08:00:00Z',
    type: 'OPERATION_TYPE_PRIMARY_ORDER',
    figi: 'BBGPRIMARY',
  },
])
assert.equal(deliveryAndPrimary.accepted, 3)
assert.deepEqual(deliveryAndPrimary.markers.map(marker => marker.side), ['BUY', 'SELL', 'BUY'])

const invalidQuantity = normalizeTransactionMarkers([
  {
    operationId: 'qty-negative',
    date: '2026-09-04T08:00:00Z',
    type: 'OPERATION_TYPE_BUY',
    figi: 'BBGQTY',
    quantity: -5,
  },
])
assert.equal(invalidQuantity.accepted, 1)
assert.equal(invalidQuantity.markers[0]?.quantity, null)

const marker = normalized.markers[0]!
assert.equal(markerMatchesInstrument(marker, { instrumentUid: 'uid-1' }), true)
assert.equal(markerMatchesInstrument(marker, { figi: 'BBG000000001' }), true)
assert.equal(markerMatchesInstrument(marker, { instrumentUid: 'uid-other', figi: 'BBG000000001' }), false)
assert.equal(markerMatchesInstrument(marker, { figi: 'BBG000000999' }), false)

console.log('transaction marker regression: ok')
