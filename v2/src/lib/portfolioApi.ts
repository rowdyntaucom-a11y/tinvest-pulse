export type HistoryPoint = {
  date: string
  portfolio: number | null
  imoex: number | null
  value: number | null
  invested: number | null
}

export type BondMetadata = {
  maturityDate: string | null
  nominal: number | null
  currency: string | null
  couponQuantityPerYear: number | null
  floatingCoupon: boolean | null
  perpetual: boolean | null
  amortizing: boolean | null
  issueKind: string | null
  countryOfRisk: string | null
  countryOfRiskName: string | null
  sector: string | null
}

export type AccountContext = {
  available: boolean
  type: string | null
  status: string | null
  openedDate: string | null
  accessLevel: string | null
  source: 'accounts' | 'unavailable'
}

export type PositionSnapshot = {
  figi: string | null
  instrumentUid: string | null
  ticker: string
  name: string
  instrumentType: string
  quantity: number
  averagePrice: number
  costBasis: number
  currentPrice: number
  currentValue: number
  expectedYield: number
  weight: number
  bond: BondMetadata | null
}

export type PortfolioSnapshot = {
  accountName: string
  accountContext?: AccountContext
  value: number
  profit: number
  profitPct: number
  passiveIncome: number
  averageMonthlyPassiveIncome: number
  averageAnnualPassiveIncome: number
  positions: number
  positionItems: PositionSnapshot[]
  xirr: number | null
  cagr: number | null
  riskFreeRate: number | null
  riskFreeRateDate: string | null
  startDate: string | null
  updatedAt: string | null
  history: HistoryPoint[]
  source: 'dashboard' | 'portfolio' | 'fallback'
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

const nullableNumber = (value: unknown): number | null => {
  if (value == null || value === '') return null
  const parsed = n(value)
  return Number.isFinite(parsed) ? parsed : null
}

const nullableBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  return null
}

const nullableString = (value: unknown): string | null => {
  if (value == null) return null
  const parsed = String(value).trim()
  return parsed ? parsed : null
}

const ratioToPercent = (value: unknown): number => {
  const parsed = nullableNumber(value)
  if (parsed == null) return 0
  return parsed * 100
}

const normaliseDate = (value: unknown): string | null => {
  const parsed = nullableString(value)
  if (!parsed) return null
  const date = new Date(parsed)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}

const unavailableAccountContext = (): AccountContext => ({
  available: false,
  type: null,
  status: null,
  openedDate: null,
  accessLevel: null,
  source: 'unavailable',
})

const normaliseAccountContext = (value: unknown): AccountContext => {
  if (!value || typeof value !== 'object') return unavailableAccountContext()
  const row = value as Record<string, unknown>
  return {
    available: true,
    type: nullableString(row.type ?? row.accountType),
    status: nullableString(row.status),
    openedDate: normaliseDate(row.openedDate ?? row.openDate ?? row.createdAt ?? row.createdDate),
    accessLevel: nullableString(row.accessLevel),
    source: 'accounts',
  }
}

const ACCOUNT_CONTEXT_TTL_MS = 15 * 60_000
let accountContextCache: { accountId: string; expiresAt: number; value: AccountContext } | null = null

async function loadAccountContext(accountId: string | null): Promise<AccountContext> {
  if (!accountId) return unavailableAccountContext()
  const now = Date.now()
  if (accountContextCache?.accountId === accountId && accountContextCache.expiresAt > now) {
    return accountContextCache.value
  }

  try {
    const response = await fetch('/api/accounts', { cache: 'no-store' })
    if (!response.ok) throw new Error(`accounts ${response.status}`)
    const raw = await response.json() as unknown
    const root = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
    const rows = Array.isArray(root.accounts) ? root.accounts : Array.isArray(raw) ? raw : []
    const selected = rows.find(item => {
      if (!item || typeof item !== 'object') return false
      return String((item as Record<string, unknown>).id ?? '') === accountId
    })
    const value = selected ? normaliseAccountContext(selected) : unavailableAccountContext()
    accountContextCache = { accountId, expiresAt: now + ACCOUNT_CONTEXT_TTL_MS, value }
    return value
  } catch {
    return unavailableAccountContext()
  }
}

const normaliseHistory = (historyRaw: unknown): HistoryPoint[] => {
  if (!historyRaw || typeof historyRaw !== 'object') return []
  const history = historyRaw as Record<string, unknown>
  const indexPoints = Array.isArray(history.points) ? history.points as Record<string, unknown>[] : []
  const valuePoints = Array.isArray(history.valuePoints) ? history.valuePoints as Record<string, unknown>[] : []
  const investedPoints = Array.isArray(history.investedPoints) ? history.investedPoints as Record<string, unknown>[] : []

  const byDate = new Map<string, HistoryPoint>()
  const ensure = (date: unknown) => {
    const key = String(date || '').slice(0, 10)
    if (!key) return null
    if (!byDate.has(key)) byDate.set(key, { date: key, portfolio: null, imoex: null, value: null, invested: null })
    return byDate.get(key)!
  }

  for (const row of indexPoints) {
    const point = ensure(row.date)
    if (!point) continue
    point.portfolio = nullableNumber(row.portfolio ?? row.index ?? row.twr)
    point.imoex = nullableNumber(row.imoex ?? row.benchmark)
  }
  for (const row of valuePoints) {
    const point = ensure(row.date)
    if (point) point.value = nullableNumber(row.value)
  }
  for (const row of investedPoints) {
    const point = ensure(row.date)
    if (point) point.invested = nullableNumber(row.value)
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

const normaliseBond = (value: unknown): BondMetadata | null => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const maturityRaw = row.maturityDate == null ? '' : String(row.maturityDate)
  return {
    maturityDate: maturityRaw ? maturityRaw.slice(0, 10) : null,
    nominal: nullableNumber(row.nominal),
    currency: row.currency ? String(row.currency).toUpperCase() : null,
    couponQuantityPerYear: nullableNumber(row.couponQuantityPerYear),
    floatingCoupon: nullableBoolean(row.floatingCoupon),
    perpetual: nullableBoolean(row.perpetual),
    amortizing: nullableBoolean(row.amortizing),
    issueKind: row.issueKind ? String(row.issueKind) : null,
    countryOfRisk: row.countryOfRisk ? String(row.countryOfRisk) : null,
    countryOfRiskName: row.countryOfRiskName ? String(row.countryOfRiskName) : null,
    sector: row.sector ? String(row.sector) : null,
  }
}

const normalisePositions = (rawPositions: unknown, portfolioValue: number): PositionSnapshot[] => {
  if (!Array.isArray(rawPositions)) return []
  const rows = rawPositions.map(item => {
    const row = (item ?? {}) as Record<string, unknown>
    const quantity = n(row.quantity)
    const averagePrice = n(row.averagePrice ?? row.averagePositionPrice)
    const currentPrice = n(row.currentPrice)
    const currentValue = n(row.currentValue) || quantity * currentPrice
    const costBasis = averagePrice > 0 && quantity > 0 ? averagePrice * quantity : 0
    return {
      figi: nullableString(row.figi),
      instrumentUid: nullableString(row.instrumentUid),
      ticker: String(row.ticker || row.figi || row.instrumentUid || '—'),
      name: String(row.name || row.ticker || row.figi || 'Актив'),
      instrumentType: String(row.instrumentType || row.type || ''),
      quantity,
      averagePrice,
      costBasis,
      currentPrice,
      currentValue,
      expectedYield: n(row.expectedYield),
      weight: 0,
      bond: normaliseBond(row.bond),
    }
  }).filter(row => Number.isFinite(row.currentValue) && row.currentValue > 0)

  const total = portfolioValue > 0 ? portfolioValue : rows.reduce((sum, row) => sum + row.currentValue, 0)
  return rows
    .map(row => ({ ...row, weight: total > 0 ? row.currentValue / total : 0 }))
    .sort((a, b) => b.currentValue - a.currentValue)
}

const fallbackSnapshot = (): PortfolioSnapshot => ({
  accountName: 'Кряхтящий фонд',
  accountContext: unavailableAccountContext(),
  value: 0,
  profit: 0,
  profitPct: 0,
  passiveIncome: 0,
  averageMonthlyPassiveIncome: 0,
  averageAnnualPassiveIncome: 0,
  positions: 0,
  positionItems: [],
  xirr: null,
  cagr: null,
  riskFreeRate: null,
  riskFreeRateDate: null,
  startDate: null,
  updatedAt: null,
  history: [],
  source: 'fallback',
})

async function loadDashboard(): Promise<PortfolioSnapshot> {
  const response = await fetch('/api/dashboard', { cache: 'no-store' })
  if (!response.ok) throw new Error(`dashboard ${response.status}`)
  const raw = await response.json() as Record<string, unknown>
  const portfolio = (raw.portfolio ?? {}) as Record<string, unknown>
  const passive = (raw.passiveIncome ?? raw.income ?? {}) as Record<string, unknown>
  const account = (raw.account ?? {}) as Record<string, unknown>
  const cbr = (raw.cbr ?? {}) as Record<string, unknown>
  const value = n(portfolio.value ?? raw.totalValue ?? raw.portfolioValue)
  const positionsRaw = portfolio.positions ?? portfolio.assets ?? raw.assets
  const positionItems = normalisePositions(positionsRaw, value)
  const accountId = nullableString(account.id)
  const accountContext = await loadAccountContext(accountId)

  return {
    accountName: String(account.name || 'Кряхтящий фонд'),
    accountContext,
    value,
    profit: n(portfolio.profit ?? portfolio.growth ?? raw.profit),
    profitPct: ratioToPercent(portfolio.profitPercent ?? portfolio.growthPercent ?? raw.profitPct),
    passiveIncome: n(passive.total ?? raw.passiveIncomeTotal),
    averageMonthlyPassiveIncome: n(passive.averageMonthly ?? (raw.income as Record<string, unknown> | undefined)?.monthly),
    averageAnnualPassiveIncome: n(passive.averageAnnual ?? (raw.income as Record<string, unknown> | undefined)?.annual),
    positions: positionItems.length,
    positionItems,
    xirr: nullableNumber(portfolio.xirr),
    cagr: nullableNumber(portfolio.cagr),
    riskFreeRate: nullableNumber(cbr.rate),
    riskFreeRateDate: cbr.rateDate ? String(cbr.rateDate) : null,
    startDate: portfolio.startDate ? String(portfolio.startDate) : portfolio.createdAt ? String(portfolio.createdAt) : null,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : null,
    history: normaliseHistory(raw.history),
    source: 'dashboard',
  }
}

async function loadLegacyPortfolio(): Promise<PortfolioSnapshot> {
  const response = await fetch('/api/portfolio', { cache: 'no-store' })
  if (!response.ok) throw new Error(`portfolio ${response.status}`)
  const raw = await response.json() as Record<string, unknown>
  const portfolio = (raw.portfolio ?? raw) as Record<string, unknown>
  const value = n(raw.totalValue ?? raw.portfolioValue ?? portfolio.totalAmountPortfolio)
  const profit = n(raw.profit ?? raw.expectedYield ?? portfolio.expectedYield)
  const positionItems = normalisePositions(raw.positions ?? portfolio.positions, value)
  const invested = value - profit
  const profitPct = invested > 0 ? profit / invested * 100 : 0

  return {
    ...fallbackSnapshot(),
    value,
    profit,
    profitPct,
    passiveIncome: n(raw.passiveIncomeTotal ?? raw.passiveIncome),
    positions: positionItems.length,
    positionItems,
    source: 'portfolio',
  }
}

export async function loadPortfolioHistory(): Promise<HistoryPoint[]> {
  try {
    const response = await fetch('/api/history-debug', { cache: 'no-store' })
    if (!response.ok) return []
    const raw = await response.json() as Record<string, unknown>
    return normaliseHistory(raw.history)
  } catch {
    return []
  }
}

export async function loadPortfolio(): Promise<PortfolioSnapshot> {
  try {
    return await loadDashboard()
  } catch {
    try {
      return await loadLegacyPortfolio()
    } catch {
      return fallbackSnapshot()
    }
  }
}
