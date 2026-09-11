export type XpEventKind =
  | 'CONTRIBUTION_HABIT'
  | 'HEALTH_MILESTONE'
  | 'PERFORMANCE_PERIOD'
  | 'PASSIVE_INCOME_GROWTH'
  | 'PLAN_ADHERENCE'
  | 'ACHIEVEMENT'

export type XpEvent = {
  id: string
  kind: XpEventKind
  occurredAt: string
  awardedXp: number
  ruleVersion: string
  sourceRef?: string | null
  note?: string | null
}

export type XpLedger = {
  version: '0.1'
  accumulatedXp: number
  acceptedEvents: number
  rejectedEvents: number
  duplicateEvents: number
  lastEventAt: string | null
}

export type QualitySignal = {
  key: 'performance' | 'consistency' | 'health' | 'incomeGrowth'
  label: string
  raw: number | null
  normalized: number | null
  available: boolean
  note: string
}

export type QualitySnapshot = {
  version: '0.1'
  complete: boolean
  availableSignals: number
  totalSignals: number
  coverage: number
  signals: QualitySignal[]
}

export type QualityInputs = {
  twr: number | null
  healthScore: number | null
  contributionStreakMonths?: number | null
  passiveIncomeGrowth?: number | null
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const clamp01 = (value: number) => clamp(value, 0, 1)

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function safeXp(value: unknown) {
  if (!finite(value)) return null
  if (value < 0) return null
  return Math.round(value * 100) / 100
}

/**
 * Persistent XP is deliberately separate from the current portfolio-quality snapshot.
 * Events must already contain an XP award produced by a versioned rule. This ledger only
 * validates, de-duplicates and accumulates them; it never derives XP from RUB capital.
 */
export function buildXpLedger(events: XpEvent[]): XpLedger {
  const seen = new Set<string>()
  let accumulatedXp = 0
  let acceptedEvents = 0
  let rejectedEvents = 0
  let duplicateEvents = 0
  let lastEventAt: string | null = null
  let lastTimestamp = -Infinity

  for (const event of Array.isArray(events) ? events : []) {
    const id = String(event?.id || '').trim()
    if (!id) {
      rejectedEvents += 1
      continue
    }
    if (seen.has(id)) {
      duplicateEvents += 1
      continue
    }
    seen.add(id)

    const xp = safeXp(event.awardedXp)
    const timestamp = Date.parse(String(event.occurredAt || ''))
    const ruleVersion = String(event.ruleVersion || '').trim()
    if (xp == null || !Number.isFinite(timestamp) || !ruleVersion) {
      rejectedEvents += 1
      continue
    }

    accumulatedXp += xp
    acceptedEvents += 1
    if (timestamp > lastTimestamp) {
      lastTimestamp = timestamp
      lastEventAt = new Date(timestamp).toISOString()
    }
  }

  return {
    version: '0.1',
    accumulatedXp: Math.round(accumulatedXp * 100) / 100,
    acceptedEvents,
    rejectedEvents,
    duplicateEvents,
    lastEventAt,
  }
}

/**
 * Groundwork only: exposes normalized signals without turning the short current history into
 * permanent progression. Final score weights and XP award rules stay separate and versioned.
 */
export function buildQualitySnapshot(inputs: QualityInputs): QualitySnapshot {
  const twr = finite(inputs.twr) ? inputs.twr : null
  const health = finite(inputs.healthScore) ? clamp(inputs.healthScore, 0, 100) : null
  const streak = finite(inputs.contributionStreakMonths) ? Math.max(0, inputs.contributionStreakMonths) : null
  const incomeGrowth = finite(inputs.passiveIncomeGrowth) ? inputs.passiveIncomeGrowth : null

  const signals: QualitySignal[] = [
    {
      key: 'performance',
      label: 'Risk-aware performance',
      raw: twr,
      normalized: twr == null ? null : clamp01((clamp(twr, -0.10, 0.10) + 0.10) / 0.20),
      available: twr != null,
      note: twr == null ? 'Нужна TWR-история' : 'TWR ограничен диапазоном −10…+10%, чтобы высокий риск не фармил XP без ограничений.',
    },
    {
      key: 'consistency',
      label: 'Contribution consistency',
      raw: streak,
      normalized: streak == null ? null : clamp01(streak / 12),
      available: streak != null,
      note: streak == null ? 'Нужен месячный ledger пополнений' : 'До 12 месяцев дисциплины; сумма пополнения не влияет на сигнал.',
    },
    {
      key: 'health',
      label: 'Portfolio Health',
      raw: health,
      normalized: health == null ? null : health / 100,
      available: health != null,
      note: health == null ? 'Health ещё не рассчитан' : 'Используется прозрачный Health Score 0–100.',
    },
    {
      key: 'incomeGrowth',
      label: 'Passive-income growth',
      raw: incomeGrowth,
      normalized: incomeGrowth == null ? null : clamp01((clamp(incomeGrowth, -0.50, 0.50) + 0.50) / 1.00),
      available: incomeGrowth != null,
      note: incomeGrowth == null ? 'Нужны сопоставимые периоды пассивного дохода' : 'Рост ограничен диапазоном −50…+50%; абсолютные рубли не используются.',
    },
  ]

  const availableSignals = signals.filter(signal => signal.available).length
  const totalSignals = signals.length

  return {
    version: '0.1',
    complete: availableSignals === totalSignals,
    availableSignals,
    totalSignals,
    coverage: totalSignals ? availableSignals / totalSignals : 0,
    signals,
  }
}
