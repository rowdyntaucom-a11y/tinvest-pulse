import { Container, Graphics } from 'pixi.js'
import { buildWorldEventArrivalPresentation } from './worldEventArrivalPresentation'
import {
  resolveWorldEventCaravanJourney,
  type WorldEventCaravanPlan,
} from './worldEventCaravanPresentation'

export const WORLD_EVENT_CARAVAN_RUNTIME_VERSION = '0.3' as const

type CaravanView = {
  root: Container
  body: Container
  cargo: Graphics
  arrivalPulse: Graphics
  arrivalActivity: Container
}

function destinationX(plan: WorldEventCaravanPlan) {
  switch (plan.destination) {
    case 'mine-yard': return 390
    case 'workshop': return 720
    case 'construction-yard': return 930
    case 'storehouse': return 1080
    case 'settlement-gate': return 1260
    case 'town-square': return 1380
  }
}

function routeY(plan: WorldEventCaravanPlan) {
  return plan.route === 'upper-road' ? 621 : 738
}

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * Math.max(0, Math.min(1, progress))
}

function routePoint(
  plan: WorldEventCaravanPlan,
  journey: ReturnType<typeof resolveWorldEventCaravanJourney>,
) {
  const destination = destinationX(plan)
  const start = plan.direction === 'eastbound' ? -110 : 1710
  const exit = plan.direction === 'eastbound' ? 1710 : -110
  const y = routeY(plan)

  if (journey.segment === 'dwell') return { x: destination, y }

  const from = journey.segment === 'approach' ? start : destination
  const to = journey.segment === 'approach' ? destination : exit
  const arc = Math.sin(journey.progress * Math.PI)
  const lift = plan.route === 'upper-road' ? 12 : 9
  return {
    x: interpolate(from, to, journey.progress),
    y: y - arc * lift,
  }
}

function drawCargo(plan: WorldEventCaravanPlan) {
  const cargo = new Graphics()

  switch (plan.kind) {
    case 'treasury':
      cargo.circle(-9, -24, 6).fill({ color: plan.accentColor, alpha: 0.95 })
      cargo.circle(2, -30, 7).fill({ color: 0xf0cf72, alpha: 0.94 })
      cargo.circle(12, -22, 6).fill({ color: plan.accentColor, alpha: 0.9 })
      break
    case 'supply':
      cargo.rect(-18, -31, 16, 14).fill({ color: plan.accentColor, alpha: 0.9 })
      cargo.rect(2, -31, 16, 14).fill({ color: 0x8f7657, alpha: 0.94 })
      break
    case 'repair':
      cargo.circle(0, -25, 12).fill({ color: plan.accentColor, alpha: 0.9 })
      cargo.rect(-3, -34, 6, 18).fill({ color: 0xdff5eb, alpha: 0.92 })
      cargo.rect(-9, -28, 18, 6).fill({ color: 0xdff5eb, alpha: 0.92 })
      break
    case 'builder':
      cargo.rect(-20, -29, 40, 6).fill({ color: 0xa9825c, alpha: 0.95 })
      cargo.rect(-17, -38, 34, 6).fill({ color: plan.accentColor, alpha: 0.82 })
      break
    case 'celebration':
      cargo.rect(-2, -55, 4, 37).fill({ color: 0xc9b07c, alpha: 0.95 })
      cargo.poly([2, -54, 24, -47, 2, -39]).fill({ color: plan.accentColor, alpha: 0.95 })
      break
    case 'courier':
      cargo.poly([-10, -31, 0, -39, 10, -31, 7, -18, -7, -18]).fill({ color: plan.accentColor, alpha: 0.92 })
      break
  }

  return cargo
}

function drawArrivalActivity(plan: WorldEventCaravanPlan) {
  const arrival = buildWorldEventArrivalPresentation(plan)
  const activity = new Container()
  activity.label = `world-event-arrival:${plan.id}:${arrival.activity}`
  activity.visible = false
  activity.position.set(0, -6)

  const responder = new Graphics()
  responder.circle(44, -13, 5.5).fill({ color: 0xd0a27d, alpha: 0.95 })
  responder.rect(39, -7, 10, 18).fill({ color: arrival.accentColor, alpha: 0.8 })
  activity.addChild(responder)

  const cue = new Graphics()
  switch (arrival.activity) {
    case 'stockpile-drop':
      cue.rect(25, -2, 12, 10).fill({ color: 0x8f7657, alpha: 0.94 })
      cue.rect(11, 2, 12, 10).fill({ color: arrival.accentColor, alpha: 0.82 })
      break
    case 'repair-bench':
      cue.rect(13, 2, 26, 5).fill({ color: 0x8f7657, alpha: 0.9 })
      cue.circle(26, -5, 8).stroke({ color: arrival.accentColor, width: 3, alpha: 0.9 })
      cue.moveTo(26, -13).lineTo(26, 3).stroke({ color: 0xdff5eb, width: 2, alpha: 0.82 })
      break
    case 'construction-drop':
      cue.rect(10, 1, 34, 5).fill({ color: 0xa9825c, alpha: 0.96 })
      cue.rect(15, -7, 28, 5).fill({ color: arrival.accentColor, alpha: 0.78 })
      break
    case 'treasury-unload':
      cue.circle(18, 2, 6).fill({ color: 0xf0cf72, alpha: 0.96 })
      cue.circle(28, -1, 6).fill({ color: arrival.accentColor, alpha: 0.92 })
      cue.circle(38, 2, 6).fill({ color: 0xf0cf72, alpha: 0.92 })
      break
    case 'message-handoff':
      cue.poly([13, -8, 29, -8, 33, 1, 17, 1]).fill({ color: arrival.accentColor, alpha: 0.9 })
      cue.moveTo(13, -8).lineTo(23, -1).lineTo(29, -8).stroke({ color: 0xdff5eb, width: 1.5, alpha: 0.72 })
      break
    case 'celebration-gathering':
      cue.circle(16, -5, 3.5).fill({ color: arrival.accentColor, alpha: 0.94 })
      cue.circle(28, -12, 3).fill({ color: 0xf0cf72, alpha: 0.94 })
      cue.circle(39, -3, 3.5).fill({ color: 0xdff5eb, alpha: 0.88 })
      cue.moveTo(27, 4).lineTo(27, -23).stroke({ color: 0xc9b07c, width: 2, alpha: 0.9 })
      cue.poly([28, -23, 43, -18, 28, -12]).fill({ color: arrival.accentColor, alpha: 0.9 })
      break
  }
  activity.addChild(cue)
  activity.alpha = arrival.intensity

  return activity
}

function createView(plan: WorldEventCaravanPlan, parent: Container): CaravanView {
  const root = new Container()
  root.label = `world-event-caravan:${plan.id}`

  const shadow = new Graphics().ellipse(0, 11, 34, 7).fill({ color: 0x000000, alpha: 0.22 })
  const arrivalPulse = new Graphics()
    .circle(0, 4, 30)
    .stroke({ color: plan.accentColor, width: 3, alpha: 0.72 })
  arrivalPulse.visible = false

  const body = new Container()
  const wagon = new Graphics()
    .rect(-28, -18, 56, 25)
    .fill({ color: 0x4c3f34, alpha: 0.98 })
    .rect(-24, -15, 48, 4)
    .fill({ color: plan.accentColor, alpha: 0.72 })
  const wheels = new Graphics()
    .circle(-18, 11, 7).fill({ color: 0x151817 })
    .circle(18, 11, 7).fill({ color: 0x151817 })
    .circle(-18, 11, 2.5).fill({ color: 0x80715c })
    .circle(18, 11, 2.5).fill({ color: 0x80715c })
  const cargo = drawCargo(plan)
  const arrivalActivity = drawArrivalActivity(plan)

  body.addChild(wagon, cargo, wheels)
  root.addChild(shadow, arrivalPulse, arrivalActivity, body)
  root.scale.set(plan.scale)
  parent.addChild(root)

  return { root, body, cargo, arrivalPulse, arrivalActivity }
}

/**
 * Renderer-only runtime for already-semantic pending events.
 *
 * Caravans enter the world, pause at a semantic destination, perform a tiny
 * destination-specific micro-scene and then leave. The pause is deliberately
 * readable so an event looks like something happening in the settlement instead
 * of a decorative object crossing the screen.
 *
 * It never acknowledges events, changes WorldState, awards XP or inspects any
 * financial value. Reduced-motion keeps caravans and the semantic arrival scene
 * visible at their destination without continuous animation.
 */
export function createWorldEventCaravanRuntime(parent: Container) {
  const views = new Map<string, CaravanView>()

  const render = (
    plans: readonly WorldEventCaravanPlan[],
    motionSeconds: number,
    reducedMotion: boolean,
  ) => {
    const active = new Set(plans.map(plan => plan.id))

    plans.forEach((plan, index) => {
      const view = views.get(plan.id) ?? (() => {
        const next = createView(plan, parent)
        views.set(plan.id, next)
        return next
      })()

      const phase = (motionSeconds * 0.055 * plan.pace + plan.phaseOffset) % 1
      const journey = resolveWorldEventCaravanJourney(phase, reducedMotion)
      const point = routePoint(plan, journey)
      const edgeFade = journey.segment === 'approach'
        ? Math.min(1, journey.progress * 8)
        : journey.segment === 'depart'
          ? Math.min(1, (1 - journey.progress) * 8)
          : 1
      const direction = plan.direction === 'eastbound' ? 1 : -1

      view.root.visible = true
      view.root.position.set(point.x, point.y)
      view.root.alpha = Math.max(0, edgeFade)
      view.root.scale.set(plan.scale * direction, plan.scale)

      view.arrivalPulse.visible = journey.arrived
      view.arrivalActivity.visible = journey.arrived
      if (journey.arrived) {
        const arrivalWave = reducedMotion ? 0 : Math.sin(motionSeconds * 5.2 + index * 0.8)
        view.arrivalPulse.alpha = reducedMotion ? 0.2 : 0.16 + (arrivalWave + 1) * 0.06
        view.arrivalPulse.scale.set(reducedMotion ? 0.92 : 0.9 + (arrivalWave + 1) * 0.05)
        view.arrivalActivity.position.y = reducedMotion ? -6 : -6 - Math.max(0, arrivalWave) * 2.2
        view.arrivalActivity.rotation = reducedMotion ? 0 : arrivalWave * 0.012
      }

      const bob = reducedMotion ? 0 : Math.sin(motionSeconds * 7.2 + index)
      view.body.position.y = journey.arrived ? bob * 0.55 : bob * 1.4
      view.body.rotation = reducedMotion ? 0 : Math.sin(motionSeconds * 4.1 + index * 0.7) * (journey.arrived ? 0.004 : 0.008)
      view.cargo.alpha = journey.arrived ? 0.82 : 1
      view.cargo.position.y = journey.arrived && !reducedMotion
        ? Math.max(0, Math.sin(motionSeconds * 4.8 + index)) * 3
        : 0
    })

    for (const [id, view] of views) {
      if (!active.has(id)) view.root.visible = false
    }
  }

  const destroy = () => {
    for (const view of views.values()) view.root.destroy({ children: true })
    views.clear()
  }

  return {
    version: WORLD_EVENT_CARAVAN_RUNTIME_VERSION,
    render,
    destroy,
  }
}
