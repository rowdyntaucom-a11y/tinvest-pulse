export const PORTFOLIO_NORMALIZATION_VERSION = '1.6' as const

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
  issuerUid: string | null
  issuerName: string | null
}

export type AccountContext = {
  available: boolean
  type: string | null
  status: string | null
  openedDate: string | null
  accessLevel: string | null
  source: 'accounts' | 'unavailable'
}

export type InstrumentBrand = {
  logoName: string | null
  logoBaseColor: string | null
  textColor: string | null
  logoUrl: string | null
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
  brand: InstrumentBrand | null
  bond: BondMetadata | null
}

export type RecoveryContext = {
  brokerPortfolio: boolean
  account: boolean
  operations: boolean
  passiveIncomeComplete: boolean
}

export type PortfolioSnapshot = {
  accountName: string
  accountContext?: AccountContext
  recoveryContext?: RecoveryContext
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
  nextRateMeeting: string | null
  startDate: string | null
  updatedAt: string | null
  history: HistoryPoint[]
  source: 'dashboard' | 'portfolio' | 'fallback'
}

const finiteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.')
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>
    if ('units' in row) {
      const units = finiteNumber(row.units)
      const nano = row.nano == null ? 0 : finiteNumber(row.nano)
      if (units == null || nano == null) return null
      const parsed = units + nano / 1e9
      return Number.isFinite(parsed) ? parsed : null
    }
    if ('value' in row) return finiteNumber(row.value)
  }

  return null
}

const n = (value: unknown): number => finiteNumber(value) ?? 0
const nullableNumber = (value: unknown): number | null => finiteNumber(value)

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

const normaliseDateOnly = (value: unknown): string | null => {
  const parsed = nullableString(value)
  if (!parsed) return null
  const datePart = parsed.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null
  const timestamp = Date.parse(`${datePart}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10) === datePart ? datePart : null
}

const normaliseDate = (value: unknown): string | null => {
  const parsed = nullableString(value)
  if (!parsed) return null
  const datePart = parsed.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && normaliseDateOnly(datePart) == null) return null
  const timestamp = Date.parse(parsed)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
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

type HistoryNumericField = 'portfolio' | 'imoex' | 'value' | 'invested'

const normaliseHistory = (historyRaw: unknown): HistoryPoint[] => {
  if (!historyRaw || typeof historyRaw !== 'object') return []
  const history = historyRaw as Record<string, unknown>
  const indexPoints = Array.isArray(history.points) ? history.points as Record<string, unknown>[] : []
  const valuePoints = Array.isArray(history.valuePoints) ? history.valuePoints as Record<string, unknown>[] : []
  const investedPoints = Array.isArray(history.investedPoints) ? history.investedPoints as Record<string, unknown>[] : []

  const byDate = new Map<string, HistoryPoint>()
  const conflicts = new Map<string, Set<HistoryNumericField>>()
  const ensure = (date: unknown) => {
    const key = normaliseDateOnly(date)
    if (!key) return null
    if (!byDate.has(key)) byDate.set(key, { date: key, portfolio: null, imoex: null, value: null, invested: null })
    return byDate.get(key)!
  }
  const mergeNumeric = (date: unknown, field: HistoryNumericField, rawValue: unknown) => {
    const point = ensure(date)
    if (!point) return
    const value = nullableNumber(rawValue)
    if (value == null) return

    let dateConflicts = conflicts.get(point.date)
    if (!dateConflicts) {
      dateConflicts = new Set<HistoryNumericField>()
      conflicts.set(point.date, dateConflicts)
    }
    if (dateConflicts.has(field)) return

    const existing = point[field]
    if (existing == null) {
      point[field] = value
      return
    }
    if (existing !== value) {
      point[field] = null
      dateConflicts.add(field)
    }
  }

  for (const row of indexPoints) {
    mergeNumeric(row.date, 'portfolio', row.portfolio ?? row.index ?? row.twr)
    mergeNumeric(row.date, 'imoex', row.imoex ?? row.benchmark)
  }
  for (const row of valuePoints) mergeNumeric(row.date, 'value', row.value)
  for (const row of investedPoints) mergeNumeric(row.date, 'invested', row.value)

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

const normaliseBrand = (value: unknown): InstrumentBrand | null => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const logoName = nullableString(row.logoName)
  const logoUrl = nullableString(row.logoUrl)
  if (!logoName && !logoUrl) return null
  return {
    logoName,
    logoBaseColor: nullableString(row.logoBaseColor),
    textColor: nullableString(row.textColor),
    logoUrl,
  }
}

const normaliseBond = (value: unknown): BondMetadata | null => {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const currency = nullableString(row.currency)
  return {
    maturityDate: normaliseDateOnly(row.maturityDate),
    nominal: nullableNumber(row.nominal),
    currency: currency ? currency.toUpperCase() : null,
    couponQuantityPerYear: nullableNumber(row.couponQuantityPerYear),
    floatingCoupon: nullableBoolean(row.floatingCoupon),
    perpetual: nullableBoolean(row.perpetual),
    amortizing: nullableBoolean(row.amortizing),
    issueKind: nullableString(row.issueKind),
    countryOfRisk: nullableString(row.countryOfRisk),
    countryOfRiskName: nullableString(row.countryOfRiskName),
    sector: nullableString(row.sector),
    issuerUid: nullableString(row.issuerUid),
    issuerName: nullableString(row.issuerName),
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
      brand: normaliseBrand(row.brand),
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
  recoveryContext: { brokerPortfolio: false, account: false, operations: false, passiveIncomeComplete: false },
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
  nextRateMeeting: null,
  startDate: null,
  updatedAt: null,
  history: [],
  source: 'fallback',
})

async function loadDashboard(): Promise<PortfolioSnapshot> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 32_000)
  let response: Response
  try {
    response = await fetch('/api/dashboard', { cache: 'no-store', signal: controller.signal })
  } catch (error) {
    if ((error as { name?: string } | null)?.name === 'AbortError') throw new Error('dashboard timeout')
    throw error
  } finally {
    clearTimeout(timer)
  }
  if (!response.ok) throw new Error(`dashboard ${response.status}`)
  const raw = await response.json() as Record<string, unknown>
  const portfolio = (raw.portfolio ?? {}) as Record<string, unknown>
  const passive = (raw.passiveIncome ?? raw.income ?? {}) as Record<string, unknown>
  const account = (raw.account ?? {}) as Record<string, unknown>
  const cbr = (raw.cbr ?? {}) as Record<string, unknown>
  const value = finiteNumber(portfolio.value ?? raw.totalValue ?? raw.portfolioValue)
  if (value == null || value < 0) throw new Error('dashboard portfolio value missing')
  const positionsRaw = portfolio.positions ?? portfolio.assets ?? raw.assets
  const positionItems = normalisePositions(positionsRaw, value)
  const accountContext = normaliseAccountContext(account)

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
    riskFreeRateDate: normaliseDateOnly(cbr.rateDate),
    nextRateMeeting: normaliseDateOnly(cbr.nextMeeting),
    startDate: normaliseDate(portfolio.startDate ?? portfolio.createdAt),
    updatedAt: normaliseDate(raw.updatedAt),
    history: normaliseHistory(raw.history),
    source: 'dashboard',
  }
}

type RecoveryOperationsContext = {
  passiveIncome: number | null
  startDate: string | null
  averageMonthlyPassiveIncome: number | null
  averageAnnualPassiveIncome: number | null
  complete: boolean
}

const fetchJsonWithDeadline = async (url: string, timeoutMs: number, label: string): Promise<Record<string, unknown>> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) throw new Error(`${label} ${response.status}`)
    return await response.json() as Record<string, unknown>
  } catch (error) {
    if ((error as { name?: string } | null)?.name === 'AbortError') throw new Error(`${label} timeout`)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

const selectRecoveryAccount = (raw: Record<string, unknown>): Record<string, unknown> | null => {
  const rows = Array.isArray(raw.accounts) ? raw.accounts as Record<string, unknown>[] : []
  if (!rows.length) return null
  return rows.find(row => String(row.status ?? '').toUpperCase().includes('OPEN')) ?? rows[0] ?? null
}

const normaliseRecoveryOperations = (raw: Record<string, unknown>): RecoveryOperationsContext => {
  const coverage = raw.coverage && typeof raw.coverage === 'object' ? raw.coverage as Record<string, unknown> : {}
  const truncated = coverage.possiblyTruncated === true
  const rows = Array.isArray(raw.operations) ? raw.operations as Record<string, unknown>[] : []
  const firstPositiveExternal = rows
    .filter(row => row.isExternalCash === true && (nullableNumber(row.payment) ?? 0) > 0)
    .map(row => normaliseDate(row.date))
    .filter((value): value is string => Boolean(value))
    .sort()[0] ?? null
  const passiveIncome = truncated ? null : nullableNumber(raw.passiveIncomeTotal)
  const startDate = firstPositiveExternal ?? normaliseDate(coverage.observedFrom)
  if (passiveIncome == null || !startDate) {
    return { passiveIncome, startDate, averageMonthlyPassiveIncome: null, averageAnnualPassiveIncome: null, complete: !truncated && passiveIncome != null }
  }
  const elapsedDays = Math.max(1, (Date.now() - Date.parse(startDate)) / 86_400_000)
  return {
    passiveIncome,
    startDate,
    averageMonthlyPassiveIncome: passiveIncome / Math.max(1, elapsedDays / 30.4375),
    averageAnnualPassiveIncome: passiveIncome / Math.max(1, elapsedDays / 365.25),
    complete: true,
  }
}

async function loadLegacyPortfolio(): Promise<PortfolioSnapshot> {
  const raw = await fetchJsonWithDeadline('/api/portfolio', 8_000, 'portfolio')
  const portfolio = (raw.portfolio ?? raw) as Record<string, unknown>
  const value = finiteNumber(raw.totalValue ?? raw.portfolioValue ?? portfolio.totalAmountPortfolio)
  if (value == null || value < 0) throw new Error('portfolio value missing')
  const profit = n(raw.profit ?? raw.expectedYield ?? portfolio.expectedYield)
  const positionItems = normalisePositions(raw.positions ?? portfolio.positions, value)
  const invested = value - profit
  const profitPct = invested > 0 ? profit / invested * 100 : 0

  const routeAccount = raw.account && typeof raw.account === 'object' ? raw.account as Record<string, unknown> : null
  const operationsPromise = fetchJsonWithDeadline('/api/operations-summary', 6_000, 'operations summary')
    .then(normaliseRecoveryOperations)
  const accountPromise = routeAccount
    ? Promise.resolve(routeAccount)
    : fetchJsonWithDeadline('/api/accounts', 4_000, 'accounts').then(selectRecoveryAccount)

  const [operationsRead, accountRead] = await Promise.allSettled([operationsPromise, accountPromise])
  const operations = operationsRead.status === 'fulfilled' ? operationsRead.value : null
  const account = accountRead.status === 'fulfilled' ? accountRead.value : routeAccount
  const accountRecovered = Boolean(account)
  const operationsRecovered = operationsRead.status === 'fulfilled'
  const accountContext = normaliseAccountContext(account)
  const passiveIncome = operations?.passiveIncome ?? 0

  return {
    ...fallbackSnapshot(),
    accountName: nullableString(account?.name) ?? 'Кряхтящий фонд',
    accountContext,
    recoveryContext: {
      brokerPortfolio: true,
      account: accountRecovered,
      operations: operationsRecovered,
      passiveIncomeComplete: operations?.complete === true,
    },
    value,
    profit,
    profitPct,
    passiveIncome,
    averageMonthlyPassiveIncome: operations?.averageMonthlyPassiveIncome ?? 0,
    averageAnnualPassiveIncome: operations?.averageAnnualPassiveIncome ?? 0,
    positions: positionItems.length,
    positionItems,
    startDate: operations?.startDate ?? accountContext.openedDate,
    updatedAt: normaliseDate(raw.fetchedAt ?? raw.updatedAt),
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

const isTransientDashboardFailure = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /dashboard (?:5\\d\\d)|upstream unavailable|fetch failed|timeout/i.test(message)
}

export async function loadPortfolio(): Promise<PortfolioSnapshot> {
  try {
    return await loadDashboard()
  } catch (dashboardError) {
    const a = dashboardError instanceof Error ? dashboardError.message : 'dashboard unavailable'
    // /api/dashboard is the preferred full-fidelity contract, but a transient
    // dashboard composition failure must not hide an independently healthy
    // read-only broker portfolio. The bounded legacy read carries real broker
    // positions/value only; missing history/income/benchmark fields remain
    // unavailable and are never fabricated.
    try {
      return await loadLegacyPortfolio()
    } catch (portfolioError) {
      const b = portfolioError instanceof Error ? portfolioError.message : 'portfolio unavailable'
      const transient = isTransientDashboardFailure(dashboardError)
      throw new Error(transient
        ? `Broker sources temporarily unavailable: ${a}; ${b}`
        : `Broker source unavailable: ${a}; ${b}`)
    }
  }
}
