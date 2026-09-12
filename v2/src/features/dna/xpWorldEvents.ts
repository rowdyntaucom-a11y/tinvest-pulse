import type { WorldEvent } from './worldState'
import type { XpEvent, XpEventKind } from './xpEngine'

export type XpWorldEvent = WorldEvent & {
  kind: `xp:${XpEventKind}`
  sourceRef: string | null
  ruleVersion: string
}

const LABELS: Record<XpEventKind, string> = {
  CONTRIBUTION_HABIT: 'Дисциплина пополнений',
  HEALTH_MILESTONE: 'Прогресс здоровья портфеля',
  PERFORMANCE_PERIOD: 'Завершённый период результата',
  PASSIVE_INCOME_GROWTH: 'Рост пассивного дохода',
  PLAN_ADHERENCE: 'Следование стратегии',
  ACHIEVEMENT: 'Достижение',
}

function isXpKind(value: unknown): value is XpEventKind {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LABELS, value)
}

function normalizeXpEvent(event: XpEvent): XpWorldEvent | null {
  const id = String(event?.id || '').trim()
  const occurredAtMs = Date.parse(String(event?.occurredAt || ''))
  const ruleVersion = String(event?.ruleVersion || '').trim()
  const awardedXp = Number(event?.awardedXp)

  if (!id || !Number.isFinite(occurredAtMs) || !ruleVersion || !isXpKind(event?.kind)) return null
  if (!Number.isFinite(awardedXp) || awardedXp < 0) return null

  return {
    id: `xp:${id}`,
    kind: `xp:${event.kind}`,
    occurredAt: new Date(occurredAtMs).toISOString(),
    intensity: null,
    title: LABELS[event.kind],
    sourceRef: event.sourceRef == null ? null : String(event.sourceRef),
    ruleVersion,
  }
}

/**
 * Converts already-awarded, versioned XP events into render-neutral world events.
 *
 * This adapter deliberately does not:
 * - calculate XP;
 * - derive progression from RUB capital;
 * - choose art, animation, biome or weather;
 * - infer event intensity from the XP amount;
 * - create events for invalid or duplicate source IDs.
 *
 * Rendering remains a separate concern. The world receives stable semantic events only.
 */
export function buildXpWorldEvents(events: XpEvent[], limit = 20): XpWorldEvent[] {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 20
  const seen = new Set<string>()
  const normalized: XpWorldEvent[] = []

  for (const event of Array.isArray(events) ? events : []) {
    const worldEvent = normalizeXpEvent(event)
    if (!worldEvent || seen.has(worldEvent.id)) continue
    seen.add(worldEvent.id)
    normalized.push(worldEvent)
  }

  return normalized
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id))
    .slice(0, safeLimit)
}
