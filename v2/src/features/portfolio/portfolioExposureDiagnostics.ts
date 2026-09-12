export const PORTFOLIO_EXPOSURE_DIAGNOSTICS_VERSION = '1.0'

type ExposurePosition = {
  weight: number
}

export type PortfolioExposureDiagnostics = {
  calcVersion: string
  available: boolean
  requestedCount: number
  eligibleCount: number
  includedCount: number
  topWeight: number | null
  eligibleWeight: number | null
}

export function calculatePortfolioTopExposure(
  positions: ExposurePosition[],
  requestedCount = 3,
): PortfolioExposureDiagnostics {
  const count = Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 0
  const weights = positions
    .map(position => Number(position.weight))
    .filter(weight => Number.isFinite(weight) && weight > 0)
    .sort((a, b) => b - a)

  const eligibleWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const included = count > 0 ? weights.slice(0, count) : []

  return {
    calcVersion: PORTFOLIO_EXPOSURE_DIAGNOSTICS_VERSION,
    available: count > 0 && weights.length > 0,
    requestedCount: count,
    eligibleCount: weights.length,
    includedCount: included.length,
    topWeight: count > 0 && included.length > 0
      ? included.reduce((sum, weight) => sum + weight, 0)
      : null,
    eligibleWeight: weights.length > 0 ? eligibleWeight : null,
  }
}
