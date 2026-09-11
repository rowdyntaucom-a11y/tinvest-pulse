import type { PositionSnapshot } from '../../lib/portfolioApi'

export type BondDimensionRow = {
  key: string
  label: string
  value: number
  shareOfCovered: number
}

export type BondDimension = {
  available: boolean
  coveredValue: number
  totalBondValue: number
  coverageRatio: number
  hhi: number | null
  effectiveCount: number | null
  topShare: number | null
  rows: BondDimensionRow[]
}

export type BondRiskDimensions = {
  bondCount: number
  totalBondValue: number
  countryOfRisk: BondDimension
  sector: BondDimension
  issuer: {
    available: false
    reason: 'ISSUER_ID_NOT_IN_SNAPSHOT'
  }
}

function isBond(position: PositionSnapshot) {
  const type = String(position.instrumentType || '').toLowerCase()
  const ticker = String(position.ticker || '').toUpperCase()
  return type.includes('bond') || /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function normalizedLabel(value: string | null | undefined) {
  const label = String(value || '').trim()
  return label || null
}

function buildDimension(
  bonds: PositionSnapshot[],
  labelOf: (position: PositionSnapshot) => string | null,
): BondDimension {
  const totalBondValue = bonds.reduce((sum, position) => sum + Math.max(0, position.currentValue), 0)
  const values = new Map<string, number>()

  for (const position of bonds) {
    const label = labelOf(position)
    if (!label) continue
    const value = Math.max(0, position.currentValue)
    if (!Number.isFinite(value) || value <= 0) continue
    values.set(label, (values.get(label) || 0) + value)
  }

  const coveredValue = [...values.values()].reduce((sum, value) => sum + value, 0)
  const rows = [...values.entries()]
    .map(([label, value]) => ({
      key: label.toUpperCase(),
      label,
      value,
      shareOfCovered: coveredValue > 0 ? value / coveredValue : 0,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'ru'))

  const hhi = coveredValue > 0
    ? rows.reduce((sum, row) => sum + row.shareOfCovered ** 2, 0)
    : null

  return {
    available: coveredValue > 0,
    coveredValue,
    totalBondValue,
    coverageRatio: totalBondValue > 0 ? coveredValue / totalBondValue : 0,
    hhi,
    effectiveCount: hhi && hhi > 0 ? 1 / hhi : null,
    topShare: rows[0]?.shareOfCovered ?? null,
    rows,
  }
}

export function buildBondRiskDimensions(positions: PositionSnapshot[]): BondRiskDimensions {
  const bonds = positions.filter(isBond)
  const totalBondValue = bonds.reduce((sum, position) => sum + Math.max(0, position.currentValue), 0)

  return {
    bondCount: bonds.length,
    totalBondValue,
    countryOfRisk: buildDimension(bonds, position => (
      normalizedLabel(position.bond?.countryOfRiskName)
      ?? normalizedLabel(position.bond?.countryOfRisk)
    )),
    sector: buildDimension(bonds, position => normalizedLabel(position.bond?.sector)),
    issuer: {
      available: false,
      reason: 'ISSUER_ID_NOT_IN_SNAPSHOT',
    },
  }
}
