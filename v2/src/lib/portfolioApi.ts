export type PortfolioSnapshot = {
  value: number
  profit: number
  profitPct: number
  passiveIncome: number
  positions: number
  source: 'live' | 'fallback'
}

const n = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>
    if ('units' in v) return n(v.units) + n(v.nano) / 1e9
    if ('value' in v) return n(v.value)
  }
  return 0
}

export async function loadPortfolio(): Promise<PortfolioSnapshot> {
  try {
    const response = await fetch('/api/portfolio', { cache: 'no-store' })
    if (!response.ok) throw new Error(`portfolio ${response.status}`)
    const raw = await response.json() as Record<string, unknown>
    const portfolio = (raw.portfolio ?? raw) as Record<string, unknown>
    const value = n(raw.totalValue ?? raw.portfolioValue ?? portfolio.totalAmountPortfolio)
    const profit = n(raw.profit ?? raw.expectedYield ?? portfolio.expectedYield)
    const passiveIncome = n(raw.passiveIncomeTotal ?? raw.passiveIncome)
    const positionsRaw = raw.positions ?? portfolio.positions
    const positions = Array.isArray(positionsRaw) ? positionsRaw.length : 0
    const invested = value - profit
    const profitPct = invested > 0 ? profit / invested * 100 : 0
    return { value, profit, profitPct, passiveIncome, positions, source: 'live' }
  } catch {
    return {
      value: 0,
      profit: 0,
      profitPct: 0,
      passiveIncome: 0,
      positions: 0,
      source: 'fallback',
    }
  }
}
