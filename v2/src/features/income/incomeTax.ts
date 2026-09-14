import type { PayoutCalendar, PayoutEvent } from '../../lib/payoutsApi'

export const INCOME_TAX_BRIDGE_VERSION = '1.0' as const
export const IIS_LONG_TERM_DEDUCTION_RULE_VERSION = '2026-09-01' as const
export const IIS_LONG_TERM_DEDUCTION_BASE_LIMIT = 400_000

export type TaxBridge = {
  actual: { gross: number | null; tax: number | null; net: number | null; rows: number; completeRows: number }
  forecast12m: { gross: number | null; tax: number | null; net: number | null; rows: number }
}

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function buildIncomeTaxBridge(calendar: PayoutCalendar): TaxBridge {
  const fact = calendar.actual.items.filter(event => String(event.status || '').toUpperCase() === 'FACT')
  let gross = 0
  let tax = 0
  let net = 0
  let grossRows = 0
  let taxRows = 0
  let netRows = 0
  let completeRows = 0

  for (const event of fact) {
    const hasGross = finite(event.gross)
    const hasTax = finite(event.tax)
    const hasNet = finite(event.net)
    if (hasGross) { gross += event.gross as number; grossRows += 1 }
    if (hasTax) { tax += event.tax as number; taxRows += 1 }
    if (hasNet) { net += event.net as number; netRows += 1 }
    if (hasGross && hasTax && hasNet) completeRows += 1
  }

  return {
    actual: {
      gross: grossRows ? gross : null,
      tax: taxRows ? tax : null,
      net: netRows ? net : null,
      rows: fact.length,
      completeRows,
    },
    forecast12m: {
      gross: calendar.available && finite(calendar.forecast.gross) ? calendar.forecast.gross : null,
      tax: calendar.available && finite(calendar.forecast.tax) ? calendar.forecast.tax : null,
      net: calendar.available && finite(calendar.forecast.net) ? calendar.forecast.net : null,
      rows: calendar.forecast.count,
    },
  }
}

export type IisDeductionInput = {
  contribution: number
  otherLongTermSavingsBaseUsed: number
  ndflRate: 0.13 | 0.15
  refundableNdflAvailable?: number | null
}

export type IisDeductionEstimate = {
  eligibleBase: number
  unusedBaseLimit: number
  theoreticalRefund: number
  refundableEstimate: number | null
  limitedByTaxPaid: boolean
}

const nonNegative = (value: number) => Number.isFinite(value) && value > 0 ? value : 0

export function estimateIisLongTermDeduction(input: IisDeductionInput): IisDeductionEstimate {
  const contribution = nonNegative(input.contribution)
  const alreadyUsed = Math.min(IIS_LONG_TERM_DEDUCTION_BASE_LIMIT, nonNegative(input.otherLongTermSavingsBaseUsed))
  const unusedBaseLimit = Math.max(0, IIS_LONG_TERM_DEDUCTION_BASE_LIMIT - alreadyUsed)
  const eligibleBase = Math.min(contribution, unusedBaseLimit)
  const theoreticalRefund = eligibleBase * input.ndflRate
  const taxPaid = input.refundableNdflAvailable == null ? null : nonNegative(input.refundableNdflAvailable)
  const refundableEstimate = taxPaid == null ? null : Math.min(theoreticalRefund, taxPaid)

  return {
    eligibleBase,
    unusedBaseLimit,
    theoreticalRefund,
    refundableEstimate,
    limitedByTaxPaid: taxPaid != null && taxPaid < theoreticalRefund,
  }
}

export function isFactEvent(event: PayoutEvent) {
  return String(event.status || '').toUpperCase() === 'FACT'
}
