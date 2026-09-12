import { buildReturnIntervalMap, commonReturnIntervalKeys } from './returnIntervals'

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
  version: '1.2'
  minimumPairedReturns: number
  maturePairedReturns: number
  series: Array<{ key: string; label: string; returns: number }>
  cells: CorrelationCell[]
}

const MIN_PAIRED_RETURNS = 60
const MATURE_PAIRED_RETURNS = 252

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
  const maps = new Map(series.map(item => [item.key, buildReturnIntervalMap(item.points)]))
  const cells: CorrelationCell[] = []

  for (let i = 0; i < series.length; i += 1) {
    for (let j = i; j < series.length; j += 1) {
      const a = series[i]
      const b = series[j]
      const mapA = maps.get(a.key)!
      const mapB = maps.get(b.key)!
      const intervalKeys = commonReturnIntervalKeys([mapA, mapB])
      const valuesA = intervalKeys.map(key => mapA.get(key)!.value)
      const valuesB = intervalKeys.map(key => mapB.get(key)!.value)
      const available = a.key === b.key || intervalKeys.length >= MIN_PAIRED_RETURNS
      const mature = intervalKeys.length >= MATURE_PAIRED_RETURNS
      cells.push({
        a: a.key,
        b: b.key,
        pairedReturns: intervalKeys.length,
        available,
        mature,
        correlation: a.key === b.key ? 1 : available ? correlation(valuesA, valuesB) : null,
      })
    }
  }

  return {
    version: '1.2',
    minimumPairedReturns: MIN_PAIRED_RETURNS,
    maturePairedReturns: MATURE_PAIRED_RETURNS,
    series: series.map(item => ({ key: item.key, label: item.label, returns: maps.get(item.key)?.size || 0 })),
    cells,
  }
}
