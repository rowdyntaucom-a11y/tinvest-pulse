import { Container, Graphics } from 'pixi.js'
import type { WorldEventCaravanPlan } from './worldEventCaravanPresentation'

export const WORLD_EVENT_CARAVAN_RUNTIME_VERSION = '0.1' as const

type CaravanView = {
  root: Container
  body: Container
}

function routePoint(plan: WorldEventCaravanPlan, phase: number) {
  const bounded = Math.max(0, Math.min(1, phase))
  const arc = Math.sin(bounded * Math.PI)

  if (plan.route === 'upper-road') {
    return {
      x: -90 + bounded * 1500,
      y: 621 - arc * 12,
    }
  }

  return {
    x: -110 + bounded * 1780,
    y: 738 - arc * 9,
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

function createView(plan: WorldEventCaravanPlan, parent: Container): CaravanView {
  const root = new Container()
  root.label = `world-event-caravan:${plan.id}`

  const shadow = new Graphics().ellipse(0, 11, 34, 7).fill({ color: 0x000000, alpha: 0.22 })
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

  body.addChild(wagon, cargo, wheels)
  root.addChild(shadow, body)
  root.scale.set(plan.scale)
  parent.addChild(root)

  return { root, body }
}

/**
 * Renderer-only runtime for already-semantic pending events.
 *
 * It never acknowledges events, changes WorldState, awards XP or inspects any
 * financial value. It only animates plans produced by
 * `buildWorldEventCaravanPresentation` and keeps a hard cap inherited from that
 * pure boundary. Reduced-motion keeps caravans visible but stationary.
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

      const phase = reducedMotion
        ? (0.2 + index * 0.26) % 1
        : (motionSeconds * 0.055 * plan.pace + plan.phaseOffset) % 1
      const point = routePoint(plan, phase)
      const edgeFade = Math.min(1, phase * 8, (1 - phase) * 8)

      view.root.visible = true
      view.root.position.set(point.x, point.y)
      view.root.alpha = Math.max(0, edgeFade)
      view.root.scale.set(plan.scale)
      view.body.position.y = reducedMotion ? 0 : Math.sin(motionSeconds * 7.2 + index) * 1.4
      view.body.rotation = reducedMotion ? 0 : Math.sin(motionSeconds * 4.1 + index * 0.7) * 0.008
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
