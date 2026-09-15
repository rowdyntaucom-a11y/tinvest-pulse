import { Application, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import type { WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
import { resolveWorldActorAnimationSelection } from './worldActorAnimationSelection'
import { resolveWorldActorAtlasDocument } from './worldActorAtlasDocument'
import { loadWorldActorAtlases, type LoadedWorldActorAtlas } from './worldActorAtlasLoader'
import { WORLD_ACTOR_ACTIONS, type WorldActorAction } from './worldActorAtlasManifest'
import { resolveWorldActorChoreography } from './worldActorChoreography'
import { resolveWorldActorFramePlayback } from './worldActorFramePlayback'
import { loadWorldAssetEntries } from './worldAssetLoader'
import { buildWorldEventCaravanPresentation } from './worldEventCaravanPresentation'
import { createWorldEventCaravanRuntime } from './worldEventCaravanRuntime'
import { buildWorldLivingPresentation, type WorldActorPlan, type WorldActorRole } from './worldLivingPresentation'
import { REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST } from './worldReviewedActorAtlases'
import { REVIEWED_WORLD_ASSET_MANIFEST } from './worldReviewedAssets'
import { WORLD_SCENE_LAYER_ORDER, type WorldSceneLayer } from './worldSceneLayers'

export type WorldAssetRuntimeState = {
  configured: number
  loaded: number
  failed: number
  actorConfigured: number
  actorLoaded: number
  actorFailed: number
}

type MountWorldPixiRuntimeOptions = {
  host: HTMLDivElement
  getSnapshot: () => WorldRenderSnapshot
  onRenderer: (renderer: string) => void
  onAssetRuntime: (state: WorldAssetRuntimeState) => void
  signal: AbortSignal
}

type ActorView = {
  root: Container
  figure: Container
  load: Graphics
  workSpark: Graphics
  reviewedSprite: Sprite | null
}

type ReviewedActorTexturePack = {
  baseTexture: Texture
  frames: ReadonlyMap<WorldActorAction, readonly Texture[]>
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function preloadBrowserImage(assetPath: string, signal?: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort)
      image.onload = null
      image.onerror = null
    }
    const onAbort = () => {
      cleanup()
      image.src = ''
      reject(new DOMException('Living World asset preload aborted', 'AbortError'))
    }

    if (signal?.aborted) {
      onAbort()
      return
    }

    image.onload = () => {
      cleanup()
      resolve(image)
    }
    image.onerror = () => {
      cleanup()
      reject(new Error('Living World asset preload failed'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    image.src = assetPath
  })
}

async function loadLocalJsonAsset(assetPath: string, signal: AbortSignal) {
  const response = await fetch(assetPath, {
    signal,
    credentials: 'same-origin',
    cache: 'force-cache',
  })
  if (!response.ok) throw new Error(`Living World atlas request failed: ${response.status}`)
  return response.json() as Promise<unknown>
}

function buildReviewedActorTexturePack(
  loaded: LoadedWorldActorAtlas<HTMLImageElement>,
): ReviewedActorTexturePack {
  const baseTexture = Texture.from(loaded.image)
  const frames = new Map<WorldActorAction, readonly Texture[]>()

  for (const action of WORLD_ACTOR_ACTIONS) {
    const actionTextures = loaded.document.animations[action].map((frame, index) => new Texture({
      source: baseTexture.source,
      frame: new Rectangle(frame.x, frame.y, frame.width, frame.height),
      label: `world-actor:${loaded.entry.role}:${action}:${index}`,
    }))
    frames.set(action, actionTextures)
  }

  return { baseTexture, frames }
}

function destroyReviewedActorTexturePack(pack: ReviewedActorTexturePack) {
  for (const textures of pack.frames.values()) {
    for (const texture of textures) texture.destroy(false)
  }
  pack.baseTexture.destroy(true)
}

function actorColor(role: WorldActorPlan['role']) {
  switch (role) {
    case 'miner': return 0xd7b16a
    case 'hauler': return 0x70c8b7
    case 'builder': return 0xc98563
    case 'keeper': return 0x7ca3a8
    case 'resident': return 0x8e8bb7
  }
}

function eventAccentColor(channel: ReturnType<typeof buildWorldLivingPresentation>['eventAccent']) {
  switch (channel) {
    case 'discipline': return 0x75d3c2
    case 'health': return 0x62d48c
    case 'performance': return 0xf0c36d
    case 'income': return 0x6ce5dd
    case 'strategy': return 0xa7c97f
    case 'achievement': return 0xe5cb78
    case 'generic': return 0xa9bdba
    default: return 0x66ffe2
  }
}

function routePoint(route: WorldActorPlan['route'], phase: number) {
  const ping = phase < 0.5 ? phase * 2 : (1 - phase) * 2
  const direction = phase < 0.5 ? 1 : -1
  switch (route) {
    case 'mine-loop': return { x: 210 + ping * 235, y: 603 - Math.sin(ping * Math.PI) * 10, direction }
    case 'haul-loop': return { x: 365 + ping * 545, y: 657 - Math.sin(ping * Math.PI) * 14, direction }
    case 'build-loop': return { x: 845 + ping * 355, y: 595 - Math.sin(ping * Math.PI) * 9, direction }
    case 'yard-loop': return { x: 600 + ping * 250, y: 626 - Math.sin(ping * Math.PI) * 7, direction }
    case 'resident-loop': return { x: 1060 + ping * 310, y: 642 - Math.sin(ping * Math.PI) * 5, direction }
  }
}

export async function mountWorldPixiRuntime({
  host,
  getSnapshot,
  onRenderer,
  onAssetRuntime,
  signal,
}: MountWorldPixiRuntimeOptions) {
  const resolution = clamp(window.devicePixelRatio || 1, 1, window.innerWidth < 900 ? 1.35 : 1.75)
  const app = new Application()
  await app.init({
    resizeTo: host,
    antialias: true,
    autoDensity: true,
    resolution,
    background: '#071613',
    preference: 'webgl',
    powerPreference: 'high-performance',
  })

  if (signal.aborted) {
    app.destroy(true)
    return () => undefined
  }

  host.appendChild(app.canvas)
  onRenderer(app.renderer.type === 1 ? 'webgl' : 'gpu')

  const world = new Container()
  world.label = 'world:root'
  app.stage.addChild(world)

  const layerContainers = new Map<WorldSceneLayer, Container>()
  for (const layerName of WORLD_SCENE_LAYER_ORDER) {
    const sceneLayer = new Container()
    sceneLayer.label = `world:${layerName}`
    layerContainers.set(layerName, sceneLayer)
    world.addChild(sceneLayer)
  }

  const layer = (name: WorldSceneLayer) => {
    const resolved = layerContainers.get(name)
    if (!resolved) throw new Error(`Missing Living World scene layer: ${name}`)
    return resolved
  }

  const eventCaravanRuntime = createWorldEventCaravanRuntime(layer('events'))

  const sky = new Graphics().rect(0, 0, 1600, 900).fill({ color: 0xffffff })
  sky.label = 'asset-slot:background.sky'
  layer('background').addChild(sky)

  const stars = new Graphics()
  for (let index = 0; index < 26; index += 1) {
    const x = 42 + ((index * 191) % 1510)
    const y = 34 + ((index * 97) % 315)
    stars.circle(x, y, index % 5 === 0 ? 2.2 : 1.2).fill({ color: 0xd9f5f0, alpha: 0.78 })
  }
  stars.label = 'world:stars'
  layer('background').addChild(stars)

  const horizon = new Graphics()
    .poly([0, 520, 180, 390, 330, 470, 520, 330, 740, 470, 940, 350, 1180, 500, 1380, 380, 1600, 510, 1600, 900, 0, 900])
    .fill({ color: 0x0c3034 })
  horizon.label = 'asset-slot:background.mountains'
  layer('background').addChild(horizon)

  const forest = new Graphics()
  for (let index = 0; index < 22; index += 1) {
    const x = 30 + index * 76
    const height = 54 + (index % 4) * 18
    forest.poly([x, 590, x + 20, 590 - height, x + 42, 590]).fill({ color: 0x0b2825, alpha: 0.95 })
  }
  forest.label = 'asset-slot:background.forest'
  layer('background').addChild(forest)

  const settlement = new Graphics()
  settlement.rect(1230, 500, 235, 88).fill({ color: 0x102b28, alpha: 0.95 })
  settlement.rect(1260, 458, 44, 42).fill({ color: 0x173a33, alpha: 0.95 })
  settlement.rect(1360, 440, 58, 60).fill({ color: 0x173a33, alpha: 0.95 })
  for (let index = 0; index < 6; index += 1) {
    settlement.rect(1252 + index * 34, 528 + (index % 2) * 18, 10, 8).fill({ color: 0xe5b65d, alpha: 0.75 })
  }
  settlement.label = 'asset-slot:background.distant-settlement'
  layer('background').addChild(settlement)

  const atmosphere = new Graphics().rect(0, 0, 1600, 900).fill({ color: 0xffffff, alpha: 1 })
  atmosphere.label = 'asset-slot:atmosphere.depth'
  layer('atmosphere').addChild(atmosphere)

  const ground = new Graphics().rect(0, 585, 1600, 315).fill({ color: 0x07130f })
  ground.label = 'asset-slot:terrain.ground'
  layer('terrain').addChild(ground)

  const mine = new Graphics()
  mine.rect(82, 515, 205, 78).fill({ color: 0x201b17 })
  mine.circle(184, 515, 76).fill({ color: 0x201b17 })
  mine.rect(123, 500, 125, 95).fill({ color: 0x050908 })
  mine.rect(132, 487, 12, 108).fill({ color: 0x5f4631 })
  mine.rect(228, 487, 12, 108).fill({ color: 0x5f4631 })
  mine.label = 'asset-slot:terrain.mine-entrance'
  layer('terrain').addChild(mine)

  const development = new Graphics()
  development.label = 'asset-slot:structures.construction'
  layer('structures').addChild(development)

  const rails = new Graphics()
  rails.moveTo(270, 687).lineTo(1220, 687)
  rails.moveTo(270, 706).lineTo(1220, 706)
  for (let x = 285; x < 1220; x += 42) rails.moveTo(x, 677).lineTo(x, 716)
  rails.stroke({ color: 0x665b4b, width: 4, alpha: 0.88 })
  rails.label = 'asset-slot:logistics.rails'
  layer('logistics').addChild(rails)

  const lamp = new Graphics().circle(0, 0, 13).fill({ color: 0x66ffe2, alpha: 0.9 })
  lamp.label = 'asset-slot:effects.work-lights'
  lamp.position.set(400, 560)
  layer('effects').addChild(lamp)

  const eventBeacon = new Graphics().circle(0, 0, 25).fill({ color: 0x66ffe2, alpha: 0.24 })
  eventBeacon.position.set(1070, 475)
  eventBeacon.visible = false
  layer('events').addChild(eventBeacon)

  const smokePuffs = [0, 1, 2].map(index => {
    const puff = new Graphics().circle(0, 0, 18 + index * 5).fill({ color: 0xb7c5bd, alpha: 0.16 })
    puff.position.set(805 + index * 8, 455 - index * 18)
    layer('effects').addChild(puff)
    return puff
  })

  const rain = new Graphics()
  for (let index = 0; index < 46; index += 1) {
    const x = (index * 137) % 1640
    const y = (index * 83) % 940
    rain.moveTo(x, y).lineTo(x - 12, y + 32)
  }
  rain.stroke({ color: 0x9cc7c8, width: 2, alpha: 0.78 })
  rain.alpha = 0
  layer('effects').addChild(rain)

  const lightning = new Graphics().rect(0, 0, 1600, 900).fill({ color: 0xdff9ff, alpha: 1 })
  lightning.alpha = 0
  layer('effects').addChild(lightning)

  const actorViews = new Map<string, ActorView>()
  const createActorView = (plan: WorldActorPlan) => {
    const root = new Container()
    root.label = `actor:${plan.id}`
    const figure = new Container()
    const color = actorColor(plan.role)
    const shadow = new Graphics().ellipse(0, 13, 16, 5).fill({ color: 0x000000, alpha: 0.22 })
    const body = new Graphics().rect(-7, -10, 14, 24).fill({ color })
    const head = new Graphics().circle(0, -18, 7).fill({ color: 0xd0a27d })
    const helmet = new Graphics().rect(-9, -25, 18, 6).fill({ color: 0xd4a74e })
    const load = new Graphics().poly([8, -12, 15, -18, 22, -12, 15, -4]).fill({ color: 0x63ddd5, alpha: 0.92 })
    const workSpark = new Graphics().circle(13, -24, 3.5).fill({ color: 0xf1cf72, alpha: 0.9 })
    load.visible = false
    workSpark.visible = false
    figure.addChild(body, head, helmet, load, workSpark)
    root.addChild(shadow, figure)
    root.scale.set(plan.scale)
    layer('actors').addChild(root)
    const view: ActorView = { root, figure, load, workSpark, reviewedSprite: null }
    actorViews.set(plan.id, view)
    return view
  }

  const ensureReviewedSprite = (actor: ActorView) => {
    if (actor.reviewedSprite) return actor.reviewedSprite
    const sprite = new Sprite(Texture.EMPTY)
    sprite.visible = false
    sprite.anchor.set(0.5, 1)
    sprite.position.set(0, 14)
    sprite.height = 52
    actor.root.addChild(sprite)
    actor.reviewedSprite = sprite
    return sprite
  }

  const cartViews = [0, 1].map(index => {
    const cart = new Container()
    cart.label = `cart:${index}`
    const body = new Graphics().rect(-28, -18, 56, 28).fill({ color: 0x564638 })
    const crystal = new Graphics().poly([-15, -18, 0, -38, 15, -18]).fill({ color: 0x63ddd5, alpha: 0.88 })
    const wheels = new Graphics()
      .circle(-18, 14, 7).fill({ color: 0x171a18 })
      .circle(18, 14, 7).fill({ color: 0x171a18 })
    cart.addChild(body, crystal, wheels)
    cart.visible = false
    layer('logistics').addChild(cart)
    return cart
  })

  let environmentAssetState = {
    configured: REVIEWED_WORLD_ASSET_MANIFEST.entries.size,
    loaded: 0,
    failed: 0,
  }
  let actorAssetState = {
    configured: REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST.entries.size,
    loaded: 0,
    failed: 0,
  }
  const emitAssetRuntime = () => onAssetRuntime({
    configured: environmentAssetState.configured,
    loaded: environmentAssetState.loaded,
    failed: environmentAssetState.failed,
    actorConfigured: actorAssetState.configured,
    actorLoaded: actorAssetState.loaded,
    actorFailed: actorAssetState.failed,
  })
  emitAssetRuntime()

  const reviewedActorTexturePacks = new Map<WorldActorRole, ReviewedActorTexturePack>()

  void loadWorldAssetEntries(REVIEWED_WORLD_ASSET_MANIFEST.entries.values(), preloadBrowserImage)
    .then(result => {
      if (signal.aborted) return
      environmentAssetState = {
        configured: REVIEWED_WORLD_ASSET_MANIFEST.entries.size,
        loaded: result.loaded.size,
        failed: result.failures.length,
      }
      emitAssetRuntime()
    })

  void loadWorldActorAtlases(
    REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST,
    assetPath => preloadBrowserImage(assetPath, signal),
    assetPath => loadLocalJsonAsset(assetPath, signal),
    resolveWorldActorAtlasDocument,
  ).then(result => {
    if (signal.aborted) return

    let textureFailures = 0
    for (const [role, loaded] of result.loaded) {
      try {
        reviewedActorTexturePacks.set(role, buildReviewedActorTexturePack(loaded))
      } catch (error) {
        textureFailures += 1
        console.error(`QVANIX DNA reviewed actor texture build failed for ${role}`, error)
      }
    }

    actorAssetState = {
      configured: REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST.entries.size,
      loaded: reviewedActorTexturePacks.size,
      failed: result.failures.length + textureFailures,
    }
    emitAssetRuntime()
  }).catch(error => {
    if (signal.aborted) return
    console.error('QVANIX DNA reviewed actor atlas loading failed', error)
    actorAssetState = {
      configured: REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST.entries.size,
      loaded: 0,
      failed: REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST.entries.size,
    }
    emitAssetRuntime()
  })

  let lastLevel = -1
  const renderLevel = (current: number) => {
    if (current === lastLevel) return
    lastLevel = current
    development.clear()
    development.rect(365, 520, 160, 68).fill({ color: 0x403126 })
    development.poly([355, 520, 445, 465, 535, 520]).fill({ color: 0x795139 })
    if (current >= 2) development.rect(560, 505, 185, 83).fill({ color: 0x513729 })
    if (current >= 3) development.rect(785, 472, 205, 116).fill({ color: 0x68442d })
    if (current >= 4) development.rect(1020, 442, 218, 146).fill({ color: 0x2c3e38 })
    if (current >= 5) development.rect(1260, 410, 205, 178).fill({ color: 0x36483e })
    if (current >= 7) development.rect(1145, 325, 22, 118).fill({ color: 0x75634b })
    if (current >= 7) development.rect(1145, 325, 155, 16).fill({ color: 0x75634b })
    if (current >= 9) development.rect(1300, 300, 24, 110).fill({ color: 0x7b6750 })
    if (current >= 11) development.circle(1360, 250, 95).fill({ color: 0x26b9ac, alpha: 0.18 })
  }

  let lastSnapshot: WorldRenderSnapshot | null = null
  let currentLiving = buildWorldLivingPresentation(getSnapshot())
  let currentEventCaravans = buildWorldEventCaravanPresentation(getSnapshot().pendingEvents)
  let activeActorIds = new Set(currentLiving.actors.map(actor => actor.id))
  const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
  let reducedMotion = reducedMotionQuery?.matches ?? false

  const applyFrameRate = () => {
    app.ticker.maxFPS = reducedMotion ? 15 : window.innerWidth < 900 ? 30 : 60
    app.ticker.minFPS = reducedMotion ? 8 : 15
  }
  applyFrameRate()

  const onReducedMotion = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches
    applyFrameRate()
  }
  reducedMotionQuery?.addEventListener('change', onReducedMotion)

  app.ticker.add(() => {
    if (signal.aborted) return
    const currentSnapshot = getSnapshot()
    if (currentSnapshot !== lastSnapshot) {
      lastSnapshot = currentSnapshot
      currentLiving = buildWorldLivingPresentation(currentSnapshot)
      currentEventCaravans = buildWorldEventCaravanPresentation(currentSnapshot.pendingEvents)
      activeActorIds = new Set(currentLiving.actors.map(actor => actor.id))
    }
    renderLevel(currentSnapshot.level)

    const now = performance.now()
    const seconds = now / 1000
    const motionNow = reducedMotion ? 0 : now
    const motionSeconds = reducedMotion ? 0 : seconds
    sky.tint = currentLiving.skyTint
    horizon.tint = currentLiving.atmosphereTint
    atmosphere.tint = currentLiving.atmosphereTint
    atmosphere.alpha = currentLiving.weather.hazeAlpha
    stars.alpha = currentSnapshot.timePhase === 'night' ? 0.9 : currentSnapshot.timePhase === 'dawn' ? 0.34 : 0

    lamp.alpha = clamp((0.58 + Math.sin(motionNow / 550) * 0.14) * currentLiving.lightScale, 0.12, 0.96)
    settlement.alpha = clamp(0.55 + currentLiving.lightScale * 0.45, 0.55, 1)

    const eventAccent = currentLiving.eventAccent
    eventBeacon.visible = eventAccent !== null
    if (eventAccent) {
      eventBeacon.tint = eventAccentColor(eventAccent)
      eventBeacon.alpha = 0.16 + (Math.sin(motionNow / 280) + 1) * 0.08
      const pulse = 0.82 + (Math.sin(motionNow / 360) + 1) * 0.08
      eventBeacon.scale.set(pulse)
    }
    eventCaravanRuntime.render(currentEventCaravans, motionSeconds, reducedMotion)

    rain.alpha = currentLiving.weather.rainAlpha
    rain.position.y = currentLiving.weather.rainSpeed > 0
      ? ((motionSeconds * 120 * currentLiving.weather.rainSpeed) % 64) - 64
      : 0
    lightning.alpha = !reducedMotion && currentLiving.weather.lightning && Math.sin(seconds * 1.75) > 0.985 ? 0.18 : 0

    smokePuffs.forEach((puff, index) => {
      const cycle = (motionSeconds * (0.08 + index * 0.012) + index * 0.31) % 1
      puff.position.y = 485 - cycle * 95
      puff.position.x = 805 + index * 8 + Math.sin(motionSeconds * 0.45 + index) * 14
      puff.alpha = (1 - cycle) * 0.16 * currentLiving.constructionActivity
      const scale = 0.75 + cycle * 0.75
      puff.scale.set(scale)
    })

    for (const plan of currentLiving.actors) {
      const actor = actorViews.get(plan.id) ?? createActorView(plan)
      const cycle = (motionSeconds * 0.045 * plan.pace * currentLiving.activityScale + plan.phaseOffset) % 1
      const choreography = resolveWorldActorChoreography(plan, cycle)
      const point = routePoint(plan.route, choreography.routePhase)
      const moving = choreography.action === 'walk' || choreography.action === 'carry'
      const working = choreography.action === 'work'
      const movementWave = Math.sin(motionSeconds * 8.4 * plan.pace + plan.phaseOffset * 10)
      const workWave = Math.sin(motionSeconds * 10.2 * plan.pace + plan.phaseOffset * 8)

      actor.root.visible = true
      actor.root.position.set(point.x, point.y)
      actor.root.scale.set(plan.scale * point.direction, plan.scale)

      let reviewedFrameApplied = false
      const texturePack = reviewedActorTexturePacks.get(plan.role)
      if (texturePack) {
        const selection = resolveWorldActorAnimationSelection(
          REVIEWED_WORLD_ACTOR_ATLAS_MANIFEST,
          plan.role,
          choreography.action,
          reducedMotion,
        )
        if (selection.renderer === 'reviewed-atlas') {
          const playback = resolveWorldActorFramePlayback(
            selection.clip,
            choreography.actionProgress,
            selection.freezeFrame,
          )
          const texture = texturePack.frames.get(choreography.action)?.[playback.frameIndex]
          if (texture) {
            const sprite = ensureReviewedSprite(actor)
            sprite.texture = texture
            sprite.visible = true
            actor.figure.visible = false
            reviewedFrameApplied = true
          }
        }
      }

      if (!reviewedFrameApplied) {
        if (actor.reviewedSprite) actor.reviewedSprite.visible = false
        actor.figure.visible = true
        actor.figure.position.y = moving ? movementWave * 1.7 : working ? Math.abs(workWave) * 0.7 : 0
        actor.figure.rotation = working ? workWave * 0.11 : moving ? movementWave * 0.018 : 0
        actor.load.visible = choreography.carryLoad
        actor.workSpark.visible = working && !reducedMotion && workWave > 0.45
        actor.workSpark.alpha = working ? 0.62 + Math.max(0, workWave) * 0.3 : 0
      } else {
        actor.load.visible = false
        actor.workSpark.visible = false
      }
    }
    for (const [id, actor] of actorViews) if (!activeActorIds.has(id)) actor.root.visible = false

    cartViews.forEach((cart, index) => {
      cart.visible = index < currentLiving.cartCount
      if (!cart.visible) return
      const phase = (motionSeconds * 0.035 * currentLiving.activityScale + index * 0.48) % 1
      const ping = phase < 0.5 ? phase * 2 : (1 - phase) * 2
      cart.position.set(315 + ping * 820, 679)
      cart.scale.x = phase < 0.5 ? 1 : -1
    })
  })

  const fit = () => {
    const w = Math.max(1, host.clientWidth)
    const h = Math.max(1, host.clientHeight)
    const scale = Math.min(w / 1600, h / 900)
    world.scale.set(scale)
    world.position.set((w - 1600 * scale) / 2, (h - 900 * scale) / 2)
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(host)

  let inViewport = true
  const syncTicker = () => {
    if (signal.aborted) return
    if (document.hidden || !inViewport) app.stop()
    else app.start()
  }

  const onVisibility = () => syncTicker()
  document.addEventListener('visibilitychange', onVisibility)

  const intersectionObserver = typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(entries => {
      inViewport = entries[0]?.isIntersecting ?? true
      syncTicker()
    }, { threshold: 0.01 })
  intersectionObserver?.observe(host)

  return () => {
    ro.disconnect()
    intersectionObserver?.disconnect()
    reducedMotionQuery?.removeEventListener('change', onReducedMotion)
    document.removeEventListener('visibilitychange', onVisibility)
    eventCaravanRuntime.destroy()
    app.destroy(true, { children: true })
    for (const pack of reviewedActorTexturePacks.values()) destroyReviewedActorTexturePack(pack)
    reviewedActorTexturePacks.clear()
    host.replaceChildren()
  }
}
