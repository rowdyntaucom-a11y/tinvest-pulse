import type { PositionSnapshot } from '../../lib/portfolioApi'

export const BOND_MATURITY_DIAGNOSTICS_CALC_VERSION = '1.0' as const

export type BondBucket = {
  key: string
  label: string
  value: number
}

export type BondNearestMaturity = {
  ticker: string
  name: string
  maturityDate: string
  years: number
  time: number
}

export type BondMaturityDiagnostics = {
  calcVersion: typeof BOND_MATURITY_DIAGNOSTICS_CALC_VERSION
  bondCount: number
  total: number
  metadataValue: number
  metadataCoverage: number
  datedMaturityValue: number
  maturityDateCoverage: number
  weightedYearsToMaturity: number | null
  ofzValue: number
  ofzShare: number
  maturityRows: BondBucket[]
  couponRows: BondBucket[]
  currencyRows: BondBucket[]
  nearest: BondNearestMaturity | null
  amortizingCount: number
  floatingCount: number
}

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000

function isBond(position: PositionSnapshot) {
  const type = String(position.instrumentType || '').toLowerCase()
  const ticker = String(position.ticker || '').toUpperCase()
  return type.includes('bond') || /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function isOfz(position: PositionSnapshot) {
  const ticker = String(position.ticker || '').toUpperCase()
  return /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function positiveValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function hasVerifiedBondMeta(position: PositionSnapshot) {
  const meta = position.bond
  if (!meta) return false
  return Boolean(
    meta.maturityDate ||
    (meta.nominal != null && meta.nominal > 0) ||
    meta.currency ||
    meta.couponQuantityPerYear != null ||
    meta.issueKind ||
    meta.countryOfRisk ||
    meta.countryOfRiskName ||
    meta.sector ||
    meta.issuerUid ||
    meta.issuerName ||
    meta.floatingCoupon != null ||
    meta.perpetual != null ||
    meta.amortizing != null
  )
}

function validMaturityTimestamp(value: string | null | undefined) {
  const raw = String(value || '').trim()
  if (!raw) return null
  const datePart = raw.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null
  const canonicalDay = Date.parse(`${datePart}T00:00:00.000Z`)
  if (!Number.isFinite(canonicalDay) || new Date(canonicalDay).toISOString().slice(0, 10) !== datePart) return null
  const timestamp = Date.parse(raw)
  return Number.isFinite(timestamp) ? timestamp : null
}

function futureMaturity(position: PositionSnapshot, nowMs: number) {
  const meta = position.bond
  if (!meta || meta.perpetual === true || !meta.maturityDate) return null
  const time = validMaturityTimestamp(meta.maturityDate)
  if (time == null || time < nowMs) return null
  return {
    time,
    years: (time - nowMs) / YEAR_MS,
    maturityDate: meta.maturityDate,
  }
}

function maturityBucket(position: PositionSnapshot, nowMs: number) {
  const meta = position.bond
  if (!meta) return 'unknown'
  if (meta.perpetual === true) return 'perpetual'
  const maturity = futureMaturity(position, nowMs)
  if (!maturity) return 'unknown'
  if (maturity.years <= 3) return '0-3'
  if (maturity.years <= 7) return '3-7'
  if (maturity.years <= 15) return '7-15'
  return '15+'
}

function addBucket(map: Map<string, number>, key: string, value: number) {
  if (!(value > 0)) return
  map.set(key, (map.get(key) || 0) + value)
}

export function buildBondMaturityDiagnostics(
  positions: PositionSnapshot[],
  nowMs: number = Date.now(),
): BondMaturityDiagnostics {
  const now = Number.isFinite(nowMs) ? nowMs : Date.now()
  const bonds = positions.filter(isBond)
  const total = bonds.reduce((sum, position) => sum + positiveValue(position.currentValue), 0)
  const metadataValue = bonds
    .filter(hasVerifiedBondMeta)
    .reduce((sum, position) => sum + positiveValue(position.currentValue), 0)
  const ofzValue = bonds
    .filter(isOfz)
    .reduce((sum, position) => sum + positiveValue(position.currentValue), 0)

  const maturity = new Map<string, number>()
  const coupon = new Map<string, number>()
  const currency = new Map<string, number>()
  const datedMaturities: Array<BondNearestMaturity & { value: number }> = []

  for (const position of bonds) {
    const value = positiveValue(position.currentValue)
    addBucket(maturity, maturityBucket(position, now), value)

    const future = futureMaturity(position, now)
    if (future && value > 0) {
      datedMaturities.push({
        ticker: position.ticker || position.name || '—',
        name: position.name || position.ticker || '—',
        maturityDate: future.maturityDate,
        years: future.years,
        time: future.time,
        value,
      })
    }

    const meta = position.bond
    if (meta?.floatingCoupon === true) addBucket(coupon, 'floating', value)
    else if (meta?.floatingCoupon === false && meta.couponQuantityPerYear != null) addBucket(coupon, 'nonfloating', value)
    else addBucket(coupon, 'unknown', value)

    addBucket(currency, meta?.currency || 'UNKNOWN', value)
  }

  const maturityLabels: Record<string, string> = {
    '0-3': '≤ 3 лет',
    '3-7': '3–7 лет',
    '7-15': '7–15 лет',
    '15+': '15+ лет',
    perpetual: 'Бессрочные',
    unknown: 'Нет данных',
  }
  const maturityOrder = ['0-3', '3-7', '7-15', '15+', 'perpetual', 'unknown']
  const maturityRows: BondBucket[] = maturityOrder
    .map(key => ({ key, label: maturityLabels[key], value: maturity.get(key) || 0 }))
    .filter(row => row.value > 0)

  const datedMaturityValue = datedMaturities.reduce((sum, row) => sum + row.value, 0)
  const weightedYearsToMaturity = datedMaturityValue > 0
    ? datedMaturities.reduce((sum, row) => sum + row.years * row.value, 0) / datedMaturityValue
    : null
  const nearestRaw = [...datedMaturities].sort((a, b) => a.time - b.time)[0] || null
  const nearest: BondNearestMaturity | null = nearestRaw
    ? {
        ticker: nearestRaw.ticker,
        name: nearestRaw.name,
        maturityDate: nearestRaw.maturityDate,
        years: nearestRaw.years,
        time: nearestRaw.time,
      }
    : null

  const couponRows: BondBucket[] = [
    { key: 'floating', label: 'Плавающий', value: coupon.get('floating') || 0 },
    { key: 'nonfloating', label: 'Не плавающий', value: coupon.get('nonfloating') || 0 },
    { key: 'unknown', label: 'Нет данных', value: coupon.get('unknown') || 0 },
  ].filter(row => row.value > 0)

  const currencyRows: BondBucket[] = [...currency.entries()]
    .map(([key, value]) => ({ key, label: key === 'UNKNOWN' ? 'Нет данных' : key, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'ru'))

  return {
    calcVersion: BOND_MATURITY_DIAGNOSTICS_CALC_VERSION,
    bondCount: bonds.length,
    total,
    metadataValue,
    metadataCoverage: total > 0 ? metadataValue / total : 0,
    datedMaturityValue,
    maturityDateCoverage: total > 0 ? datedMaturityValue / total : 0,
    weightedYearsToMaturity,
    ofzValue,
    ofzShare: total > 0 ? ofzValue / total : 0,
    maturityRows,
    couponRows,
    currencyRows,
    nearest,
    amortizingCount: bonds.filter(position => position.bond?.amortizing === true).length,
    floatingCount: bonds.filter(position => position.bond?.floatingCoupon === true).length,
  }
}
