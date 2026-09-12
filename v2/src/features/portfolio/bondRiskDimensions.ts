import type { PositionSnapshot } from '../../lib/portfolioApi'

export const BOND_RISK_DIMENSIONS_CALC_VERSION = '1.1' as const

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
  calcVersion: typeof BOND_RISK_DIMENSIONS_CALC_VERSION
  bondCount: number
  totalBondValue: number
  countryOfRisk: BondDimension
  sector: BondDimension
  issuer: BondDimension
}

type DimensionIdentity = {
  key: string
  label: string
}

function isBond(position: PositionSnapshot) {
  const type = String(position.instrumentType || '').toLowerCase()
  const ticker = String(position.ticker || '').toUpperCase()
  return type.includes('bond') || /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function normalizedPositiveValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function normalizedLabel(value: string | null | undefined) {
  const label = String(value || '').trim()
  return label || null
}

function identityFromLabel(value: string | null | undefined): DimensionIdentity | null {
  const label = normalizedLabel(value)
  return label ? { key: label.toUpperCase(), label } : null
}

function buildDimension(
  bonds: PositionSnapshot[],
  identityOf: (position: PositionSnapshot) => DimensionIdentity | null,
): BondDimension {
  const totalBondValue = bonds.reduce((sum, position) => sum + normalizedPositiveValue(position.currentValue), 0)
  const groups = new Map<string, { label: string; value: number }>()

  for (const position of bonds) {
    const identity = identityOf(position)
    if (!identity) continue
    const value = normalizedPositiveValue(position.currentValue)
    if (value <= 0) continue
    const current = groups.get(identity.key)
    groups.set(identity.key, {
      label: current?.label || identity.label,
      value: (current?.value || 0) + value,
    })
  }

  const coveredValue = [...groups.values()].reduce((sum, row) => sum + row.value, 0)
  const rows = [...groups.entries()]
    .map(([key, row]) => ({
      key,
      label: row.label,
      value: row.value,
      shareOfCovered: coveredValue > 0 ? row.value / coveredValue : 0,
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
  const totalBondValue = bonds.reduce((sum, position) => sum + normalizedPositiveValue(position.currentValue), 0)

  return {
    calcVersion: BOND_RISK_DIMENSIONS_CALC_VERSION,
    bondCount: bonds.length,
    totalBondValue,
    countryOfRisk: buildDimension(bonds, position => {
      const code = normalizedLabel(position.bond?.countryOfRisk)
      const name = normalizedLabel(position.bond?.countryOfRiskName)
      if (!code && !name) return null
      return { key: (code || name!).toUpperCase(), label: name || code! }
    }),
    sector: buildDimension(bonds, position => identityFromLabel(position.bond?.sector)),
    issuer: buildDimension(bonds, position => {
      const uid = normalizedLabel(position.bond?.issuerUid)
      if (!uid) return null
      const name = normalizedLabel(position.bond?.issuerName)
      return {
        key: uid,
        label: name || `Эмитент ${uid.slice(0, 8)}…`,
      }
    }),
  }
}
