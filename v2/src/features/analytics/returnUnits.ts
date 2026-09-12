export const ANNUAL_RETURN_UNIT_CONTRACT_VERSION = '1.0' as const

/**
 * QVANIX backend annual-return fields (XIRR and any future CAGR using the same
 * contract) are decimal ratios: 0.12 = 12%, -0.25 = -25%, 6 = 600%.
 *
 * Never infer units from magnitude. A magnitude heuristic would misrender
 * legitimate returns above 500% and creates an ambiguous financial contract.
 */
export function annualReturnRatioToPercent(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null
  return value * 100
}
