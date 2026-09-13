export const TECHNICAL_INDICATORS_VERSION = '1.1' as const

export type OhlcvCandle = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number | null
}

export type TechnicalIntegrity = 'OK' | 'CONFLICT'

export type TechnicalSnapshot = {
  calcVersion: typeof TECHNICAL_INDICATORS_VERSION
  integrity: TechnicalIntegrity
  observations: number
  sampleFrom: string | null
  sampleTo: string | null
  duplicateRowsCollapsed: number
  conflictingDates: number
  sma20: number | null
  ema20: number | null
  rsi14: number | null
  atr14: number | null
}

type NormalizedResult = {
  integrity: TechnicalIntegrity
  candles: OhlcvCandle[]
  duplicateRowsCollapsed: number
  conflictingDates: number
}

type CandleVariant = {
  candle: OhlcvCandle
  count: number
}

function finitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function candleSignature(candle: OhlcvCandle): string {
  return JSON.stringify([
    candle.open,
    candle.high,
    candle.low,
    candle.close,
    candle.volume ?? null,
  ])
}

function normalizeCandles(input: OhlcvCandle[]): NormalizedResult {
  const valid = input
    .filter(candle => validDate(candle.date)
      && finitePositive(candle.open)
      && finitePositive(candle.high)
      && finitePositive(candle.low)
      && finitePositive(candle.close)
      && candle.high >= Math.max(candle.open, candle.close, candle.low)
      && candle.low <= Math.min(candle.open, candle.close, candle.high)
      && (candle.volume == null || (typeof candle.volume === 'number' && Number.isFinite(candle.volume) && candle.volume >= 0)))

  const variantsByDate = new Map<string, Map<string, CandleVariant>>()

  for (const candle of valid) {
    let variants = variantsByDate.get(candle.date)
    if (!variants) {
      variants = new Map<string, CandleVariant>()
      variantsByDate.set(candle.date, variants)
    }

    const signature = candleSignature(candle)
    const existing = variants.get(signature)
    if (existing) existing.count += 1
    else variants.set(signature, { candle, count: 1 })
  }

  const candles: OhlcvCandle[] = []
  let duplicateRowsCollapsed = 0
  let conflictingDates = 0

  for (const [, variants] of [...variantsByDate.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const variant of variants.values()) {
      duplicateRowsCollapsed += Math.max(0, variant.count - 1)
    }

    if (variants.size > 1) {
      conflictingDates += 1
      continue
    }

    const only = variants.values().next().value as CandleVariant | undefined
    if (only) candles.push(only.candle)
  }

  if (conflictingDates > 0) {
    return { integrity: 'CONFLICT', candles: [], duplicateRowsCollapsed, conflictingDates }
  }

  return {
    integrity: 'OK',
    candles,
    duplicateRowsCollapsed,
    conflictingDates: 0,
  }
}

function sma(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null
  const window = values.slice(-period)
  return window.reduce((sum, value) => sum + value, 0) / period
}

function ema(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null
  const multiplier = 2 / (period + 1)
  let current = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period
  for (let i = period; i < values.length; i += 1) {
    current = (values[i] - current) * multiplier + current
  }
  return current
}

function rsi(values: number[], period: number): number | null {
  if (values.length < period + 1 || period <= 0) return null

  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i += 1) {
    const delta = values[i] - values[i - 1]
    if (delta >= 0) gain += delta
    else loss -= delta
  }

  let avgGain = gain / period
  let avgLoss = loss / period
  for (let i = period + 1; i < values.length; i += 1) {
    const delta = values[i] - values[i - 1]
    const currentGain = delta > 0 ? delta : 0
    const currentLoss = delta < 0 ? -delta : 0
    avgGain = ((avgGain * (period - 1)) + currentGain) / period
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period
  }

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function atr(candles: OhlcvCandle[], period: number): number | null {
  if (candles.length < period + 1 || period <= 0) return null

  const trueRanges: number[] = []
  for (let i = 1; i < candles.length; i += 1) {
    const candle = candles[i]
    const previousClose = candles[i - 1].close
    trueRanges.push(Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    ))
  }

  let current = trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0) / period
  for (let i = period; i < trueRanges.length; i += 1) {
    current = ((current * (period - 1)) + trueRanges[i]) / period
  }
  return current
}

export function calculateTechnicalSnapshot(input: OhlcvCandle[]): TechnicalSnapshot {
  const normalized = normalizeCandles(input)
  if (normalized.integrity === 'CONFLICT') {
    return {
      calcVersion: TECHNICAL_INDICATORS_VERSION,
      integrity: 'CONFLICT',
      observations: 0,
      sampleFrom: null,
      sampleTo: null,
      duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
      conflictingDates: normalized.conflictingDates,
      sma20: null,
      ema20: null,
      rsi14: null,
      atr14: null,
    }
  }

  const closes = normalized.candles.map(candle => candle.close)
  return {
    calcVersion: TECHNICAL_INDICATORS_VERSION,
    integrity: 'OK',
    observations: normalized.candles.length,
    sampleFrom: normalized.candles[0]?.date ?? null,
    sampleTo: normalized.candles.at(-1)?.date ?? null,
    duplicateRowsCollapsed: normalized.duplicateRowsCollapsed,
    conflictingDates: 0,
    sma20: sma(closes, 20),
    ema20: ema(closes, 20),
    rsi14: rsi(closes, 14),
    atr14: atr(normalized.candles, 14),
  }
}
