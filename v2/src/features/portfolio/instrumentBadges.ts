import type { PositionSnapshot } from '../../lib/portfolioApi'

export type InstrumentBadgeBrand = {
  logoName: string
  logoBaseColor: string | null
  textColor: string | null
}

export type InstrumentBadgeItem = {
  figi: string
  instrumentUid: string | null
  ticker: string | null
  instrumentType: string
  brand: InstrumentBadgeBrand | null
}

export type InstrumentBadgePayload = {
  version: '1.0'
  available: boolean
  items: InstrumentBadgeItem[]
  logoCdn?: string
}

const DEFAULT_CDN = 'https://invest-brands.cdn-tinkoff.ru/'
let badgePromise: Promise<InstrumentBadgePayload> | null = null

function cleanText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function normalizeInstrumentBadgePayload(value: unknown): InstrumentBadgePayload {
  const root = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const rows = Array.isArray(root.items) ? root.items : []
  const items: InstrumentBadgeItem[] = []
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as Record<string, unknown>
    const figi = cleanText(row.figi)
    if (!figi) continue
    const rawBrand = row.brand && typeof row.brand === 'object' ? row.brand as Record<string, unknown> : null
    const logoName = cleanText(rawBrand?.logoName)
    items.push({
      figi,
      instrumentUid: cleanText(row.instrumentUid),
      ticker: cleanText(row.ticker),
      instrumentType: cleanText(row.instrumentType) ?? '',
      brand: logoName ? {
        logoName,
        logoBaseColor: cleanText(rawBrand?.logoBaseColor),
        textColor: cleanText(rawBrand?.textColor),
      } : null,
    })
  }
  return {
    version: '1.0',
    available: items.some(item => item.brand != null),
    items,
    // Never allow an API payload to redirect image requests away from the
    // reviewed T-Invest brand CDN.
    logoCdn: DEFAULT_CDN,
  }
}

export async function loadInstrumentBadges(): Promise<InstrumentBadgePayload> {
  if (!badgePromise) {
    badgePromise = fetch('/api/instrument-badges', { cache: 'no-store' })
      .then(async response => response.ok ? normalizeInstrumentBadgePayload(await response.json()) : normalizeInstrumentBadgePayload(null))
      .catch(() => normalizeInstrumentBadgePayload(null))
  }
  return badgePromise
}

export function findInstrumentBadge(payload: InstrumentBadgePayload | null, position: PositionSnapshot): InstrumentBadgeItem | null {
  if (!payload) return null
  const figi = cleanText(position.figi)
  const uid = cleanText(position.instrumentUid)
  if (figi) {
    const exact = payload.items.find(item => item.figi === figi)
    if (exact) return exact
  }
  if (uid) return payload.items.find(item => item.instrumentUid === uid) ?? null
  return null
}

export function instrumentLogoUrl(payload: InstrumentBadgePayload | null, item: InstrumentBadgeItem | null, size: 160 | 320 = 160): string | null {
  const logoName = cleanText(item?.brand?.logoName)
  if (!logoName) return null
  const base = payload?.logoCdn === DEFAULT_CDN ? payload.logoCdn : DEFAULT_CDN
  const stem = logoName.replace(/\.png$/i, '')
  return `${base}${encodeURIComponent(stem)}x${size}.png`
}

export function instrumentFallbackLabel(type: string): string {
  const key = String(type || '').toLowerCase()
  if (key.includes('bond')) return 'О'
  if (key.includes('share') || key.includes('stock')) return 'А'
  if (key.includes('etf') || key.includes('fund')) return 'Ф'
  if (key.includes('currency')) return '₽'
  if (key.includes('future')) return 'F'
  return '•'
}
