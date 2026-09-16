import type { PayoutCalendar, PayoutEvent } from '../../lib/payoutsApi'

export type TrustedIncomeData = {
  /** Independently reported broker facts. Never inferred from the schedule. */
  actualEvents: PayoutEvent[]
  /** Only non-FACT schedule rows, and only while the future schedule is eligible. */
  futureEvents: PayoutEvent[]
  /** Calendar for consumers which combine factual tax rows with gated 12M data. */
  taxCalendar: PayoutCalendar
}

function isObservedFact(event: PayoutEvent) {
  return String(event.status || '').toUpperCase() === 'FACT'
}

/**
 * Keeps the independently sourced actual ledger separate from the 12M schedule.
 *
 * `events`, `months`, `forecast`, and `next` are schedule fields in the payout
 * payload. A FACT-looking row in the mixed `events` collection is deliberately
 * not promoted into history: every normalized `actual.items` row belongs to the
 * canonical observed boundary. Individual factual calculations can still apply
 * their stricter field/status validation without deleting the source record.
 */
export function separateTrustedIncomeData(calendar: PayoutCalendar, futureScheduleEligible: boolean): TrustedIncomeData {
  const actualEvents = calendar.actual.items
  const futureEvents = futureScheduleEligible ? calendar.events.filter(event => !isObservedFact(event)) : []

  return {
    actualEvents,
    futureEvents,
    taxCalendar: {
      ...calendar,
      actual: { ...calendar.actual, items: actualEvents },
      forecast: futureScheduleEligible ? calendar.forecast : { gross: 0, tax: 0, net: 0, count: 0 },
      next: futureScheduleEligible && calendar.next && !isObservedFact(calendar.next) ? calendar.next : null,
      months: futureScheduleEligible ? calendar.months : [],
      events: futureEvents,
      // A history-only view must not look like an available forecast schedule.
      available: futureScheduleEligible && calendar.available,
    },
  }
}
