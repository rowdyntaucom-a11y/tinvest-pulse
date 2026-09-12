export const PORTFOLIO_EXPOSURE_DIAGNOSTICS_VERSION = '1.1'

type ExposurePosition = {
  weight: number
  ticker?: string | null
  name?: string | null
}

export type PortfolioExposureItem = {
  label: string | null
  weight: number
}

export type PortfolioExposureDiagnostics = {
  calcVersion: string
  available: boolean
  requestedCount: number
  eligibleCount: number
  includedCount: number
  identifiedIncludedCount: number
  topWeight: number | null
  eligibleWeight: number | null
  topPositions: PortfolioExposureItem[]
}

function positionLabel(position: ExposurePosition) {
  const ticker = String(position.ticker || '').trim()
  if (ticker) return ticker
  const name = String(position.name || '').trim()
  return name || null
}

export function calculatePortfolioTopExposure(
  positions: ExposurePosition[],
  requestedCount = 3,
): PortfolioExposureDiagnostics {
  const count = Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 0
  const eligible = positions
    .map(position => ({
      weight: Number(position.weight),
      label: positionLabel(position),
    }))
    .filter(item => Number.isFinite(item.weight) && item.weight > 0)
    .sort((a, b) => {
      const byWeight = b.weight - a.weight
      if (Math.abs(byWeight) > 1e-15) return byWeight
      return String(a.label || '').localeCompare(String(b.label || ''), 'ru')
    })

  const eligibleWeight = eligible.reduce((sum, item) => sum + item.weight, 0)
  const included = count > 0 ? eligible.slice(0, count) : []

  return {
    calcVersion: PORTFOLIO_EXPOSURE_DIAGNOSTICS_VERSION,
    available: count > 0 && eligible.length > 0,
    requestedCount: count,
    eligibleCount: eligible.length,
    includedCount: included.length,
    identifiedIncludedCount: included.filter(item => item.label != null).length,
    topWeight: count > 0 && included.length > 0
      ? included.reduce((sum, item) => sum + item.weight, 0)
      : null,
    eligibleWeight: eligible.length > 0 ? eligibleWeight : null,
    topPositions: included.map(item => ({ label: item.label, weight: item.weight })),
  }
}
