export const WORLD_MEMORY_PRESENTATION_VERSION = '0.1' as const

export type MemoryPresentationEvent<TChannel extends string = string> = {
  id: string
  channel: TChannel
  label: string
  occurredAt: string
  title: string | null
}

export type WorldMemoryMoment<TChannel extends string = string> = MemoryPresentationEvent<TChannel> & {
  sequenceInChannel: number
  isFirstInChannel: boolean
}

export type WorldMemoryChannelSummary<TChannel extends string = string> = {
  channel: TChannel
  label: string
  count: number
  firstEventId: string
  firstOccurredAt: string
  lastEventId: string
  lastOccurredAt: string
}

export type WorldMemoryPresentation<TChannel extends string = string> = {
  version: typeof WORLD_MEMORY_PRESENTATION_VERSION
  totalMoments: number
  firstRecordedAt: string | null
  lastRecordedAt: string | null
  channels: WorldMemoryChannelSummary<TChannel>[]
  recentMoments: WorldMemoryMoment<TChannel>[]
}

/**
 * Dependency-free memory aggregation policy. Input events must already be
 * validated, chronologically ordered and mapped to renderer-neutral channels.
 */
export function buildWorldMemoryPresentationPolicy<TChannel extends string>(
  presented: readonly MemoryPresentationEvent<TChannel>[],
  recentLimit = 20,
): WorldMemoryPresentation<TChannel> {
  const safeLimit = Number.isFinite(recentLimit) ? Math.max(0, Math.floor(recentLimit)) : 20
  const channelCounts = new Map<TChannel, number>()
  const channelSummaries = new Map<TChannel, WorldMemoryChannelSummary<TChannel>>()
  const moments: WorldMemoryMoment<TChannel>[] = []

  for (const event of presented) {
    const sequenceInChannel = (channelCounts.get(event.channel) ?? 0) + 1
    channelCounts.set(event.channel, sequenceInChannel)

    const existing = channelSummaries.get(event.channel)
    if (!existing) {
      channelSummaries.set(event.channel, {
        channel: event.channel,
        label: event.label,
        count: 1,
        firstEventId: event.id,
        firstOccurredAt: event.occurredAt,
        lastEventId: event.id,
        lastOccurredAt: event.occurredAt,
      })
    } else {
      existing.count += 1
      existing.lastEventId = event.id
      existing.lastOccurredAt = event.occurredAt
    }

    moments.push({
      ...event,
      sequenceInChannel,
      isFirstInChannel: sequenceInChannel === 1,
    })
  }

  const channels = [...channelSummaries.values()].sort((a, b) =>
    a.firstOccurredAt.localeCompare(b.firstOccurredAt) || a.channel.localeCompare(b.channel),
  )

  return {
    version: WORLD_MEMORY_PRESENTATION_VERSION,
    totalMoments: moments.length,
    firstRecordedAt: moments[0]?.occurredAt ?? null,
    lastRecordedAt: moments.at(-1)?.occurredAt ?? null,
    channels,
    recentMoments: moments.slice(Math.max(0, moments.length - safeLimit)).reverse(),
  }
}
