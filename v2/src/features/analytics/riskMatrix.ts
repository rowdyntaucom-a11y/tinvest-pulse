export type PricePoint = { date: string; value: number }
export type RiskSeries = { key: string; label: string; points: PricePoint[] }

export type CorrelationCell = {
  a: string
  b: string
  correlation: number | null
  pairedReturns: number
  available: boolean
  mature: boolean
}

export type CorrelationMatrixResult = {
  version: '1.3'
  minimumPairedReturns: number
  maturePairedReturns: number
  series: Array<{
    key: string
    label: string
    returns: number
    sampleFrom: string | null
    sampleTo: string | null
    duplicateRowsCollapsed: number
    conflictingDates: number
    integrity: 'VALID' | 'CONFLICT'
  }>
  cells: CorrelationCell[]
}

const MIN_PAIRED_RETURNS = 60
const MATURE_PAIRED_RETURNS = 252

type SeriesIntervals = {
  returns: Map<string, number>
  sampleFrom: string | null
  sampleTo: string | null
  duplicateRowsCollapsed: number
  conflictingDates: number
  integrity: 'VALID' | 'CONFLICT'
}

function returnIntervalMap(points: PricePoint[]): SeriesIntervals {
  const byDate = new Map<string, number>()
  const conflictingDates = new Set<string>()
  let duplicateRowsCollapsed = 0

  for (const point of points) {
    if (!point.date || !Number.isFinite(point.value) || point.value <= 0) continue
    const existing = byDate.get(point.date)
    if (existing == null) {
      byDate.set(point.date, point.value)
      continue
    }
    if (Math.abs(existing - point.value) <= 1e-12) duplicateRowsCollapsed += 1
    else conflictingDates.add(point.date)
  }

  if (conflictingDates.size > 0) {
    return {
      returns: new Map(),
      sampleFrom: null,
      sampleTo: null,
      duplicateRowsCollapsed,
      conflictingDates: conflictingDates.size,
      integrity: 'CONFLICT',
    }
  }

  const sorted = [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
  const out = new Map<string, number>()
  for (let i = 1; i < sorted.length; i += 1) {
    const prior = sorted[i - 1]
    const current = sorted[i]
    if (prior.date >= current.date) continue
    const value = current.value / prior.value - 1
    if (Number.isFinite(value) && value > -0.95 && value < 10) {
      out.set(`${prior.date}\u0000${current.date}`, value)
    }
  }
  return {
    returns: out,
    sampleFrom: sorted.length > 0 ? sorted[0].date : null,
    sampleTo: sorted.length > 0 ? sorted[sorted.length - 1].date : null,
    duplicateRowsCollapsed,
    conflictingDates: 0,
    integrity: 'VALID',
  }
}

function commonIntervalKeys(maps: Array<Map<string, number>>) {
  if (!maps.length) return [] as string[]
  return [...maps[0].keys()]
    .filter(key => maps.every(map => map.has(key)))
    .sort((a, b) => a.localeCompare(b))
}

function correlation(a: number[], b: number[]) {
  if (a.length !== b.length || a.length < 2) return null
  const meanA = a.reduce((sum, value) => sum + value, 0) / a.length
  const meanB = b.reduce((sum, value) => sum + value, 0) / b.length
  let covariance = 0
  let varianceA = 0
  let varianceB = 0
  for (let i = 0; i < a.length; i += 1) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    covariance += da * db
    varianceA += da * da
    varianceB += db * db
  }
  const denominator = Math.sqrt(varianceA * varianceB)
  return denominator > 0 ? covariance / denominator : null
}

export function calculateCorrelationMatrix(series: RiskSeries[]): CorrelationMatrixResult {
  const intervalData = new Map(series.map(item => [item.key, returnIntervalMap(item.points)]))
  const cells: CorrelationCell[] = []

  for (let i = 0; i < series.length; i += 1) {
    for (let j = i; j < series.length; j += 1) {
      const a = series[i]
      const b = series[j]
      const dataA = intervalData.get(a.key)!
      const dataB = intervalData.get(b.key)!
      const validIntegrity = dataA.integrity === 'VALID' && dataB.integrity === 'VALID'
      const intervalKeys = validIntegrity ? commonIntervalKeys([dataA.returns, dataB.returns]) : []
      const valuesA = intervalKeys.map(key => dataA.returns.get(key)!)
      const valuesB = intervalKeys.map(key => dataB.returns.get(key)!)
      const available = validIntegrity && (a.key === b.key || intervalKeys.length >= MIN_PAIRED_RETURNS)
      const mature = validIntegrity && intervalKeys.length >= MATURE_PAIRED_RETURNS
      cells.push({
        a: a.key,
        b: b.key,
        pairedReturns: intervalKeys.length,
        available,
        mature,
        correlation: a.key === b.key && validIntegrity ? 1 : available ? correlation(valuesA, valuesB) : null,
      })
    }
  }

  return {
    version: '1.3',
    minimumPairedReturns: MIN_PAIRED_RETURNS,
    maturePairedReturns: MATURE_PAIRED_RETURNS,
    series: series.map(item => {
      const data = intervalData.get(item.key)!
      return {
        key: item.key,
        label: item.label,
        returns: data.returns.size,
        sampleFrom: data.sampleFrom,
        sampleTo: data.sampleTo,
        duplicateRowsCollapsed: data.duplicateRowsCollapsed,
        conflictingDates: data.conflictingDates,
        integrity: data.integrity,
      }
    }),
    cells,
  }
}
