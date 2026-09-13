import { readWorldChronicle } from '../dna/worldChronicle'
import {
  buildWorldEventPresentation,
  WORLD_EVENT_PRESENTATION_CHANNELS,
  type WorldEventPresentationChannel,
} from './worldEventPresentation'

export const WORLD_MEMORY_PRESENTATION_VERSION = '0.1' as const

export type WorldMemoryMoment = {
  id: string
  channel: WorldEventPresentationChannel
  label: string
  occurredAt: string
  title: string | null
  sequenceInChannel: number
  isFirstInChannel: boolean
}

export type WorldMemoryChannelSummary = {
  channel: WorldEventPresentationChannel
  label: string
  count: number
  firstEventId: string
  firstOccurredAt: string
  lastEventId: string
  lastOccurredAt: string
}

export type WorldMemoryPresentation = {
  version: typeof WORLD_MEMORY_PRESENTATION_VERSION
  totalMoments: number
  firstRecordedAt: string | null
  lastRecordedAt: string | null
  channels: WorldMemoryChannelSummary[]
  recentMoments: WorldMemoryMoment[]
}

/**
 * Renderer-neutral long-term memory derived only from persisted Chronicle events.
 *
 * This boundary deliberately does not choose scars, monuments, buildings, colors,
 * animations, sounds, camera motion, intensity or reward magnitude. It only exposes
 * deterministic recurrence/first-occurrence metadata that a later reviewed art layer
 * may use as input.
 */
export function buildWorldMemoryPresentation(
  chronicleInput: unknown,
  recentLimit = 20,
): WorldMemoryPresentation {
  const chronicle = readWorldChronicle(chronicleInput)
  const safeLimit = Number.isFinite(recentLimit) ? Math.max(0, Math.floor(recentLimit)) : 20
  const presented = buildWorldEventPresentation(chronicle.entries)

  const channelCounts = new Map<WorldEventPresentationChannel, number>()
  const channelSummaries = new Map<WorldEventPresentationChannel, WorldMemoryChannelSummary>()
  const moments: WorldMemoryMoment[] = []

  for (const event of presented) {
    const sequenceInChannel = (channelCounts.get(event.channel) ?? 0) + 1
    channelCounts.set(event.channel, sequenceInChannel)

    const existing = channelSummaries.get(event.channel)
    if (!existing) {
      channelSummaries.set(event.channel, {
        channel: event.channel,
        label: WORLD_EVENT_PRESENTATION_CHANNELS[event.channel],
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
      id: event.id,
      channel: event.channel,
      label: event.label,
      occurredAt: event.occurredAt,
      title: event.title,
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
