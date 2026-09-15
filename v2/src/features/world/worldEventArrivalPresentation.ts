import type { WorldEventCaravanPlan } from './worldEventCaravanPresentation'

export const WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION = '0.1' as const

export type WorldEventArrivalKind =
  | 'stockpile-drop'
  | 'repair-bench'
  | 'message-handoff'
  | 'treasury-unload'
  | 'construction-drop'
  | 'celebration-gathering'

export type WorldEventArrivalPresentation = {
  version: typeof WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION
  destination: WorldEventCaravanPlan['destination']
  activity: WorldEventArrivalKind
  responder: 'worker' | 'keeper' | 'builder' | 'resident'
  accentColor: number
  intensity: number
}

/**
 * Maps an already-semantic caravan destination into a tiny arrival micro-scene.
 *
 * This remains presentation-only. It does not inspect transaction amounts,
 * portfolio values, broker payloads, XP totals or rewards. The returned activity
 * is only a visual grammar for what happens while a caravan is dwelling at its
 * already-resolved destination.
 */
export function buildWorldEventArrivalPresentation(
  plan: WorldEventCaravanPlan,
): WorldEventArrivalPresentation {
  switch (plan.destination) {
    case 'mine-yard':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'stockpile-drop',
        responder: 'worker',
        accentColor: plan.accentColor,
        intensity: 0.72,
      }
    case 'workshop':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'repair-bench',
        responder: 'keeper',
        accentColor: plan.accentColor,
        intensity: 0.66,
      }
    case 'construction-yard':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'construction-drop',
        responder: 'builder',
        accentColor: plan.accentColor,
        intensity: 0.8,
      }
    case 'storehouse':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'treasury-unload',
        responder: 'keeper',
        accentColor: plan.accentColor,
        intensity: 0.7,
      }
    case 'settlement-gate':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'message-handoff',
        responder: 'resident',
        accentColor: plan.accentColor,
        intensity: 0.58,
      }
    case 'town-square':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'celebration-gathering',
        responder: 'resident',
        accentColor: plan.accentColor,
        intensity: 0.86,
      }
  }
}
