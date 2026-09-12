import type { PayoutCalendar, PayoutEvent } from '../../lib/payoutsApi'
import type { PositionSnapshot } from '../../lib/portfolioApi'

export const POSITION_INCOME_CONTRIBUTION_VERSION = '1.1' as const

export type PositionIncomeContribution = {
  version: typeof POSITION_INCOME_CONTRIBUTION_VERSION
  available: boolean
  figi: string | null
  factNet: number | null
  factCount: number
  factShare: number | null
  factObservationFrom: string | null
  factObservationTo: string | null
  factObservationCompleteMonths: number | null
  scheduledGross: number | null
  scheduledCount: number
  scheduledShare: number | null
  scheduleCoverageRatio: number | null
  reason: string | null
  note: string
}

function identity(value: unknown) {
  const text = String(value || '').trim().toUpperCase()
  return text || null
}

function positive(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function isFact(event: PayoutEvent) {
  return String(event.status || '').trim().toUpperCase() === 'FACT'
}

function exactFigi(event: PayoutEvent, figi: string) {
  return identity(event.figi) === figi
}

/**
 * Position-level passive-income contribution using exact FIGI identity only.
 *
 * FACT and future schedule are deliberately separate aggregates. This function
 * never claims that a realized payment reconciles to a particular scheduled
 * coupon/dividend event. FACT share always carries the broker observation
 * window so partial history cannot look like lifetime contribution.
 */
export function calculatePositionIncomeContribution(
  position: Pick<PositionSnapshot, 'figi'>,
  calendar: PayoutCalendar | null,
): PositionIncomeContribution {
  const figi = identity(position.figi)
  const observation = calendar?.actual.observation
  const observationAvailable = observation?.available === true
  const base = {
    version: POSITION_INCOME_CONTRIBUTION_VERSION,
    figi,
    factNet: null,
    factCount: 0,
    factShare: null,
    factObservationFrom: observationAvailable ? observation?.from ?? null : null,
    factObservationTo: observationAvailable ? observation?.to ?? null : null,
    factObservationCompleteMonths: observationAvailable ? observation?.completeMonths.length ?? 0 : null,
    scheduledGross: null,
    scheduledCount: 0,
    scheduledShare: null,
    scheduleCoverageRatio: calendar?.available === true ? calendar.coverage.coverageRatio : null,
  }

  if (!figi) {
    return {
      ...base,
      available: false,
      reason: 'Position has no verified FIGI identity.',
      note: 'Ticker/name aliases are intentionally not used for position income linkage.',
    }
  }

  if (!calendar?.available) {
    return {
      ...base,
      available: false,
      reason: 'Payout calendar is unavailable.',
      note: 'Income contribution fails closed until the payout source is available.',
    }
  }

  const allFacts = calendar.actual.items.filter(event => isFact(event) && positive(event.net) != null)
  const matchedFacts = allFacts.filter(event => exactFigi(event, figi))
  const factTotal = allFacts.reduce((sum, event) => sum + (positive(event.net) ?? 0), 0)
  const factNet = matchedFacts.length
    ? matchedFacts.reduce((sum, event) => sum + (positive(event.net) ?? 0), 0)
    : null

  const allScheduled = calendar.events.filter(event => !isFact(event) && positive(event.gross) != null)
  const matchedScheduled = allScheduled.filter(event => exactFigi(event, figi))
  const scheduleTotal = allScheduled.reduce((sum, event) => sum + (positive(event.gross) ?? 0), 0)
  const scheduledGross = matchedScheduled.length
    ? matchedScheduled.reduce((sum, event) => sum + (positive(event.gross) ?? 0), 0)
    : null

  return {
    ...base,
    available: true,
    factNet,
    factCount: matchedFacts.length,
    factShare: factNet != null && factTotal > 0 ? factNet / factTotal : null,
    scheduledGross,
    scheduledCount: matchedScheduled.length,
    scheduledShare: scheduledGross != null && scheduleTotal > 0 ? scheduledGross / scheduleTotal : null,
    reason: null,
    note: 'Exact FIGI only. FACT share is limited to the reported observation window; 12M schedule uses future gross events. FACT↔schedule event reconciliation is not inferred.',
  }
}
