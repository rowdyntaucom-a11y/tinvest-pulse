import assert from 'node:assert/strict'
import { ASSET_HISTORY_NORMALIZATION_VERSION, loadAssetHistory } from '../src/lib/assetHistoryApi.ts'

let payload: Record<string, unknown> = {}
let status = 200

;(globalThis as { fetch: typeof fetch }).fetch = async input => {
  assert.equal(String(input), '/api/asset-history')
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

assert.equal(ASSET_HISTORY_NORMALIZATION_VERSION, '1.0')

payload = {
  version: ' 1.0 ',
  available: true,
  from: '2025-09-12T12:00:00.000Z',
  to: '2026-09-12',
  requested: 6,
  availableSeries: 99,
  source: ' T-Bank GetCandles ',
  series: [
    {
      key: ' AAA ', label: ' Alpha ', instrumentId: ' uid-a ',
      points: [
        { date: '2026-09-01T10:00:00Z', value: '100' },
        { date: '2026-09-01T18:00:00Z', value: 100 },
        { date: '2026-09-02', value: 101 },
        { date: '2026-09-02T20:00:00Z', value: 102 },
        { date: '2026-09-03', value: '103,5' },
        { date: '2026-02-30', value: 999 },
        { date: 'bad', value: 999 },
        { date: '2026-09-04', value: -1 },
      ],
    },
    {
      instrumentId: 'uid-d', label: ' Delta ',
      points: [
        { date: '2026-09-01', value: 200 },
        { date: '2026-09-02', value: 201 },
      ],
    },
    { key: 'DUP', points: [{ date: '2026-09-01', value: 1 }, { date: '2026-09-02', value: 2 }] },
    { key: 'DUP', points: [{ date: '2026-09-01', value: 2 }, { date: '2026-09-02', value: 3 }] },
    { label: 'missing identity', points: [{ date: '2026-09-01', value: 1 }, { date: '2026-09-02', value: 2 }] },
    { key: 'ONE', points: [{ date: '2026-09-01', value: 1 }] },
  ],
}

const normalized = await loadAssetHistory()
assert.equal(normalized.normalizationVersion, '1.0')
assert.equal(normalized.version, '1.0')
assert.equal(normalized.available, true)
assert.equal(normalized.from, '2025-09-12')
assert.equal(normalized.to, '2026-09-12')
assert.equal(normalized.requested, 6)
assert.equal(normalized.availableSeries, 2)
assert.equal(normalized.source, 'T-Bank GetCandles')
assert.deepEqual(normalized.series.map(row => row.key), ['AAA', 'uid-d', 'ONE'])

const alpha = normalized.series.find(row => row.key === 'AAA')!
assert.equal(alpha.label, 'Alpha')
assert.equal(alpha.instrumentId, 'uid-a')
assert.deepEqual(alpha.points, [
  { date: '2026-09-01', value: 100 },
  { date: '2026-09-03', value: 103.5 },
])

const delta = normalized.series.find(row => row.key === 'uid-d')!
assert.equal(delta.label, 'Delta')
assert.equal(delta.points.length, 2)

payload = {
  version: '1.0',
  available: false,
  requested: 2,
  series: [
    { key: 'A', points: [{ date: '2026-09-01', value: 1 }, { date: '2026-09-02', value: 2 }] },
    { key: 'B', points: [{ date: '2026-09-01', value: 1 }, { date: '2026-09-02', value: 2 }] },
  ],
}
const unavailableFlag = await loadAssetHistory()
assert.equal(unavailableFlag.available, false)
assert.deepEqual(unavailableFlag.series, [])
assert.equal(unavailableFlag.requested, 0)

payload = {
  version: '1.0',
  available: true,
  from: '2026-13-01',
  to: 'bad',
  requested: -1,
  series: [
    { key: 'A', points: [{ date: '2026-09-01', value: 1 }] },
  ],
}
const noUsableSeries = await loadAssetHistory()
assert.equal(noUsableSeries.available, false)
assert.equal(noUsableSeries.from, null)
assert.deepEqual(noUsableSeries.series, [])

status = 502
const failed = await loadAssetHistory()
assert.equal(failed.available, false)
assert.equal(failed.availableSeries, 0)
assert.deepEqual(failed.series, [])

console.log('asset history API normalization regression: ok')
