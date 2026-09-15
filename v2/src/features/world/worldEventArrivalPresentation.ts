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
  emphasis: number
}

/**
 * Resolves a tiny presentation-only micro-scene for a caravan that is already
 * dwelling at its semantic destination. No financial amount, portfolio value,
 * broker payload, XP total, reward magnitude or forecast enters this boundary.
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
        emphasis: 0.72,
      }
    case 'workshop':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'repair-bench',
        responder: 'keeper',
        accentColor: plan.accentColor,
        emphasis: 0.66,
      }
    case 'construction-yard':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'construction-drop',
        responder: 'builder',
        accentColor: plan.accentColor,
        emphasis: 0.8,
      }
    case 'storehouse':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'treasury-unload',
        responder: 'keeper',
        accentColor: plan.accentColor,
        emphasis: 0.7,
      }
    case 'settlement-gate':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'message-handoff',
        responder: 'resident',
        accentColor: plan.accentColor,
        emphasis: 0.58,
      }
    case 'town-square':
      return {
        version: WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
        destination: plan.destination,
        activity: 'celebration-gathering',
        responder: 'resident',
        accentColor: plan.accentColor,
        emphasis: 0.86,
      }
  }
}
