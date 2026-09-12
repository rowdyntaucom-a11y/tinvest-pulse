import type { PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'

export type BondIncomeLinkRow = {
  figi: string
  ticker: string
  currentValue: number
  couponEvents: number
  scheduledGross: number
  nextCouponDate: string | null
}

export type BondIncomeLinkage = {
  version: '1.0'
  eligibleBondCount: number
  linkedBondCount: number
  totalBondValue: number
  linkedBondValue: number
  valueCoverage: number
  couponEvents: number
  scheduledGross: number
  rows: BondIncomeLinkRow[]
  note: string
}

function isBond(position: PositionSnapshot) {
  const type = String(position.instrumentType || '').toLowerCase()
  const ticker = String(position.ticker || '').toUpperCase()
  return type.includes('bond') || /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function positive(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function figiKey(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

export function buildBondIncomeLinkage(
  positions: PositionSnapshot[],
  scheduledEvents: PayoutEvent[],
): BondIncomeLinkage {
  const bonds = (Array.isArray(positions) ? positions : [])
    .filter(isBond)
    .filter(position => positive(position.currentValue) > 0)

  const totalBondValue = bonds.reduce((sum, position) => sum + positive(position.currentValue), 0)
  const couponEventsByFigi = new Map<string, PayoutEvent[]>()

  for (const event of Array.isArray(scheduledEvents) ? scheduledEvents : []) {
    if (String(event?.kind || '').toUpperCase() !== 'COUPON') continue
    const figi = figiKey(event?.figi)
    if (!figi) continue
    const date = Date.parse(String(event?.date || ''))
    if (!Number.isFinite(date)) continue
    const rows = couponEventsByFigi.get(figi) ?? []
    rows.push(event)
    couponEventsByFigi.set(figi, rows)
  }

  const rows: BondIncomeLinkRow[] = []
  for (const position of bonds) {
    const figi = figiKey(position.figi)
    if (!figi) continue
    const events = couponEventsByFigi.get(figi) ?? []
    if (!events.length) continue
    const dated = [...events].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    rows.push({
      figi,
      ticker: position.ticker || figi,
      currentValue: positive(position.currentValue),
      couponEvents: dated.length,
      scheduledGross: dated.reduce((sum, event) => sum + positive(event.gross), 0),
      nextCouponDate: dated[0]?.date ?? null,
    })
  }

  rows.sort((a, b) => b.scheduledGross - a.scheduledGross || b.currentValue - a.currentValue || a.ticker.localeCompare(b.ticker))
  const linkedBondValue = rows.reduce((sum, row) => sum + row.currentValue, 0)
  const couponEvents = rows.reduce((sum, row) => sum + row.couponEvents, 0)
  const scheduledGross = rows.reduce((sum, row) => sum + row.scheduledGross, 0)

  return {
    version: '1.0',
    eligibleBondCount: bonds.length,
    linkedBondCount: rows.length,
    totalBondValue,
    linkedBondValue,
    valueCoverage: totalBondValue > 0 ? linkedBondValue / totalBondValue : 0,
    couponEvents,
    scheduledGross,
    rows,
    note: 'Linkage reuses the existing 12M payout schedule and matches current bonds by FIGI only. It does not create new coupon events, does not add forecast to FACT, and therefore cannot double-count scheduled income. Actual-operation reconciliation remains separate until a shared coupon-event identity is available.',
  }
}
