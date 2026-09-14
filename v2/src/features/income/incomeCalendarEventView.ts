import type { PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'

function cleanText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function payoutEventIsConfirmed(event: PayoutEvent): boolean {
  if (String(event.status || '').toUpperCase() === 'FACT') return false
  return String(event.confidence || '').toUpperCase() === 'HIGH'
}

export function findPayoutEventPosition(event: PayoutEvent, positions: PositionSnapshot[]): PositionSnapshot | null {
  const figi = cleanText(event.figi)
  if (!figi) return null
  const matches = positions.filter(position => cleanText(position.figi) === figi)
  return matches.length === 1 ? matches[0] : null
}
