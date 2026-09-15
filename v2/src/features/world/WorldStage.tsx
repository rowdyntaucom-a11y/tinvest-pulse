import { useEffect, useRef, useState } from 'react'
import type { Application as PixiApplication } from 'pixi.js'
import type { WorldState } from '../dna/worldState'
import { emptyWorldEventCursor, resolveWorldEventQueue, type WorldEventCursorDocument } from '../dna/worldEventQueue'
import { buildWorldRenderSnapshot, type WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
import {
  WORLD_AMBIENT_ACTOR_SLOTS,
  buildWorldAmbientActivityPresentation,
  type WorldAmbientActorRole,
  type WorldAmbientActorRoute,
} from './worldAmbientActivityPresentation'
import { buildWorldAtmospherePresentation } from './worldAtmospherePresentation'
import { WORLD_ASSET_LOADER_VERSION, loadWorldAssetEntries } from './worldAssetLoader'
import { WORLD_ASSET_SLOTS, WORLD_ASSET_SLOT_VERSION } from './worldAssetSlots'
import { REVIEWED_WORLD_ASSET_MANIFEST } from './worldReviewedAssets'
import { buildWorldPresentationMetadata } from './worldPresentationMetadata'
import { WORLD_SCENE_LAYER_ORDER, WORLD_SCENE_LAYER_VERSION, type WorldSceneLayer } from './worldSceneLayers'
import { worldRuntimeRegistry } from './worldRuntimeOwnership'

type Props = {
  state: WorldState
  cursor?: WorldEventCursorDocument
}

type PixiProps = {
  snapshot: WorldRenderSnapshot
}

type AssetRuntimeState = {
  configured: number
  loaded: number
  failed: number
}

type AmbientRoute = {
  from: readonly [number, number]
  to: readonly [number, number]
}

const WORLD_WIDTH = 1600
const WORLD_HEIGHT = 900
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
let worldStageSequence = 0

const STAR_POINTS = [
  [92, 104, 1.4], [156, 174, 1.1], [232, 86, 1.7], [318, 151, 1.2], [392, 70, 1.1],
  [474, 202, 1.5], [548, 121, 1.1], [636, 73, 1.6], [705, 164, 1.2], [782, 96, 1.1],
  [864, 184, 1.5], [936, 65, 1.1], [1012, 136, 1.7], [1094, 91, 1.2], [1172, 154, 1.1],
  [1352, 111, 1.6], [1438, 184, 1.1], [1510, 76, 1.4], [128, 272, 1.1], [356, 252, 1.3],
  [612, 286, 1.1], [842, 246, 1.2], [1075, 262, 1.1], [1450, 286, 1.3],
] as const

const CLOUD_CLUSTERS = [
  [170, 205, 72], [260, 192, 58], [620, 158, 82], [720, 177, 66], [1010, 220, 92], [1120, 198, 70], [1390, 150, 82],
] as const

const RAIN_COLUMNS = [
  [90, 110], [145, 220], [205, 150], [270, 310], [335, 185], [405, 255], [480, 125], [550, 330],
  [625, 205], [700, 115], [780, 280], [855, 175], [930, 345], [1010, 235], [1085, 145], [1160, 300],
  [1240, 195], [1320, 115], [1395, 265], [1470, 170], [1540, 315],
] as const

const AMBIENT_ROUTES: Record<WorldAmbientActorRoute, AmbientRoute> = {
  'mine-loop': { from: [125, 662], to: [356, 646] },
  'haul-loop': { from: [330, 677], to: [1115, 668] },
  'build-loop': { from: [720, 650], to: [1040, 620] },
  'yard-loop': { from: [500, 660], to: [770, 642] },
  'resident-loop': { from: [1080, 654], to: [1450, 628] },
}

const ACTOR_ROLE_COLORS: Record<WorldAmbientActorRole, number> = {
  miner: 0xd7bd73,
  hauler: 0x9db6bd,
  builder: 0xc98d66,
  keeper: 0x7ca58f,
  resident: 0x9b8db5,
}

function loopTravel(progress: number) {
  const wrapped = ((progress % 1) + 1) % 1
  const forward = wrapped < 0.5
  const t = forward ? wrapped * 2 : (1 - wrapped) * 2
  return { t, direction: forward ? 1 : -1 }
}

function ambientRoutePoint(routeName: WorldAmbientActorRoute, progress: number) {
  const route = AMBIENT_ROUTES[routeName]
  const travel = loopTravel(progress)
  return {
    x: route.from[0] + (route.to[0] - route.from[0]) * travel.t,
    y: route.from[1] + (route.to[1] - route.from[1]) * travel.t,
    direction: travel.direction,
  }
}

function preloadBrowserImage(assetPath: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Living World asset preload failed'))
    image.src = assetPath
  })
}

export function WorldStage({ state, cursor }: Props) {
  const queue = resolveWorldEventQueue(state, cursor ?? emptyWorldEventCursor())
  const snapshot = buildWorldRenderSnapshot(state, queue)
  return <WorldPixiStage snapshot={snapshot} />
}

function WorldPixiStage({ snapshot }: PixiProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const ownerIdRef = useRef<string | null>(null)
  const [renderer, setRenderer] = useState('initializing')
  const [assetRuntime, setAssetRuntime] = useState<AssetRuntimeState>({
    configured: REVIEWED_WORLD_ASSET_MANIFEST.entries.size,
    loaded: 0,
    failed: 0,
  })
  const snapshotRef = useRef(snapshot)
  const presentation = buildWorldPresentationMetadata(snapshot)
  const ambientPresentation = buildWorldAmbientActivityPresentation(snapshot)

  if (!ownerIdRef.current) {
    worldStageSequence += 1
    ownerIdRef.current = `world-stage-${worldStageSequence}`
  }

  useEffect(() => { snapshotRef.current = snapshot }, [snapshot])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const lease = worldRuntimeRegistry.acquire(ownerIdRef.current ?? 'world-stage')
    if (!lease.acquired) {
      setRenderer('blocked')
      return
    }

    let disposed = false
    let app: PixiApplication | null = null
    let leaseReleased = false
    const releaseLease = () => {
      if (leaseReleased) return
      leaseReleased = true
      lease.release()
    }

    const boot = async () => {
      const { Application, Container, Graphics } = await import('pixi.js')
      if (disposed) return

      const resolution = clamp(window.devicePixelRatio || 1, 1, window.innerWidth < 900 ? 1.35 : 1.75)
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      const next = new Application()
      await next.init({
        resizeTo: host,
        antialias: true,
        autoDensity: true,
        resolution,
        background: '#071613',
        preference: 'webgl',
        powerPreference: 'high-performance',
      })

      if (disposed) {
        next.destroy(true)
        return
      }

      app = next
      host.appendChild(next.canvas)
      setRenderer(next.renderer.type === 1 ? 'webgl' : 'gpu')

      const world = new Container()
      world.label = 'world:root'
      next.stage.addChild(world)

      const layerContainers = new Map<WorldSceneLayer, InstanceType<typeof Container>>()
      for (const layerName of WORLD_SCENE_LAYER_ORDER) {
        const layer = new Container()
        layer.label = `world:${layerName}`
        layerContainers.set(layerName, layer)
        world.addChild(layer)
      }

      const layer = (name: WorldSceneLayer) => {
        const resolved = layerContainers.get(name)
        if (!resolved) throw new Error(`Missing Living World scene layer: ${name}`)
        return resolved
      }

      const sky = new Graphics()
      sky.label = 'asset-slot:background.sky'
      layer('background').addChild(sky)

      const stars = new Graphics()
      stars.label = 'world:stars'
      layer('background').addChild(stars)

      const celestialHalo = new Graphics()
      celestialHalo.label = 'world:celestial-halo'
      layer('background').addChild(celestialHalo)

      const celestial = new Graphics()
      celestial.label = 'world:celestial'
      layer('background').addChild(celestial)

      const mountainsFar = new Graphics()
      mountainsFar.label = 'asset-slot:background.mountains'
      layer('background').addChild(mountainsFar)

      const mountainsNear = new Graphics()
      mountainsNear.label = 'world:mountains-near'
      layer('background').addChild(mountainsNear)

      const forest = new Graphics()
      forest.label = 'asset-slot:background.forest'
      layer('background').addChild(forest)

      const haze = new Graphics()
      haze.label = 'asset-slot:atmosphere.depth'
      layer('atmosphere').addChild(haze)

      const clouds = new Graphics()
      clouds.label = 'world:weather-clouds'
      layer('atmosphere').addChild(clouds)

      const rain = new Graphics()
      rain.label = 'world:weather-rain'
      layer('atmosphere').addChild(rain)

      const stormFlash = new Graphics()
      stormFlash.label = 'world:weather-storm-flash'
      layer('atmosphere').addChild(stormFlash)

      const ground = new Graphics()
      ground.label = 'asset-slot:terrain.ground'
      layer('terrain').addChild(ground)

      const development = new Graphics()
      development.label = 'asset-slot:structures.construction'
      layer('structures').addChild(development)

      const actorViews = new Map<string, InstanceType<typeof Container>>()
      for (const plan of WORLD_AMBIENT_ACTOR_SLOTS) {
        const actor = new Container()
        actor.label = `world:fallback-actor:${plan.id}`
        actor.visible = false

        const silhouette = new Graphics()
        const tone = ACTOR_ROLE_COLORS[plan.role]
        silhouette.circle(0, -19, 5.5).fill({ color: tone, alpha: 0.96 })
        silhouette.rect(-5.5, -13, 11, 16).fill({ color: tone, alpha: 0.9 })
        silhouette.rect(-5.5, 3, 3.6, 10).fill({ color: tone, alpha: 0.82 })
        silhouette.rect(1.9, 3, 3.6, 10).fill({ color: tone, alpha: 0.82 })
        actor.addChild(silhouette)
        layer('actors').addChild(actor)
        actorViews.set(plan.id, actor)
      }

      const rails = new Graphics()
      rails.label = 'asset-slot:logistics.rails'
      layer('logistics').addChild(rails)

      const cartViews = [0, 1].map(index => {
        const cart = new Container()
        cart.label = `world:fallback-cart:${index + 1}`
        cart.visible = false
        const cartShape = new Graphics()
        cartShape.poly([-18, -10, 18, -10, 13, 7, -13, 7]).fill({ color: 0x62736f, alpha: 0.94 })
        cartShape.circle(-10, 11, 4).fill({ color: 0x1f2b28, alpha: 1 })
        cartShape.circle(10, 11, 4).fill({ color: 0x1f2b28, alpha: 1 })
        cart.addChild(cartShape)
        layer('logistics').addChild(cart)
        return cart
      })

      const lampGlow = new Graphics().circle(0, 0, 34).fill({ color: 0x66ffe2, alpha: 0.08 })
      lampGlow.label = 'world:work-light-glow'
      lampGlow.position.set(400, 560)
      layer('effects').addChild(lampGlow)

      const lamp = new Graphics().circle(0, 0, 11).fill({ color: 0x66ffe2, alpha: 0.9 })
      lamp.label = 'asset-slot:effects.work-lights'
      lamp.position.set(400, 560)
      layer('effects').addChild(lamp)

      // Reviewed art is preloaded independently from renderer boot. Browser-native
      // image loading preserves the deferred Pixi bundle budget. A missing/broken
      // asset never removes the existing procedural fallback and never aborts the world.
      void loadWorldAssetEntries(REVIEWED_WORLD_ASSET_MANIFEST.entries.values(), preloadBrowserImage)
        .then(result => {
          if (disposed) return
          setAssetRuntime({
            configured: REVIEWED_WORLD_ASSET_MANIFEST.entries.size,
            loaded: result.loaded.size,
            failed: result.failures.length,
          })
        })

      let atmosphereSignature = ''
      let activeAtmosphere = buildWorldAtmospherePresentation(snapshotRef.current)

      const renderAtmosphere = (current: WorldRenderSnapshot) => {
        const signature = `${current.timePhase}:${current.weather}`
        if (signature === atmosphereSignature) return
        atmosphereSignature = signature
        activeAtmosphere = buildWorldAtmospherePresentation(current)
        const atmosphere = activeAtmosphere

        sky.clear()
        sky.rect(0, 0, WORLD_WIDTH, 330).fill({ color: atmosphere.skyTop })
        sky.rect(0, 330, WORLD_WIDTH, 270).fill({ color: atmosphere.skyHorizon })

        stars.clear()
        if (atmosphere.starAlpha > 0) {
          for (const [x, y, radius] of STAR_POINTS) {
            stars.circle(x, y, radius).fill({ color: 0xe9fff9, alpha: atmosphere.starAlpha })
          }
        }

        celestialHalo.clear()
        celestialHalo
          .circle(atmosphere.celestialX, atmosphere.celestialY, 76)
          .fill({ color: atmosphere.celestial, alpha: atmosphere.celestialAlpha * 0.08 })
        celestial.clear()
        celestial
          .circle(atmosphere.celestialX, atmosphere.celestialY, current.timePhase === 'night' ? 28 : 34)
          .fill({ color: atmosphere.celestial, alpha: atmosphere.celestialAlpha })

        mountainsFar.clear()
        mountainsFar
          .poly([0, 535, 120, 420, 240, 492, 370, 360, 520, 480, 690, 338, 850, 470, 1030, 350, 1220, 500, 1390, 390, 1600, 520, 1600, 650, 0, 650])
          .fill({ color: atmosphere.mountainFar })

        mountainsNear.clear()
        mountainsNear
          .poly([0, 590, 185, 455, 330, 550, 505, 430, 675, 555, 880, 418, 1090, 560, 1275, 448, 1450, 545, 1600, 475, 1600, 690, 0, 690])
          .fill({ color: atmosphere.mountainNear })

        forest.clear()
        for (let i = 0; i < 30; i += 1) {
          const x = 18 + i * 55
          const height = 38 + (i % 5) * 7
          const baseY = 606 + (i % 3) * 5
          forest
            .poly([x, baseY, x + 18, baseY - height, x + 36, baseY])
            .fill({ color: atmosphere.terrain, alpha: 0.82 })
        }

        haze.clear()
        haze.rect(0, 430, WORLD_WIDTH, 190).fill({ color: atmosphere.skyHorizon, alpha: atmosphere.hazeAlpha })
        haze.rect(0, 535, WORLD_WIDTH, 90).fill({ color: atmosphere.celestial, alpha: atmosphere.hazeAlpha * 0.16 })

        clouds.clear()
        if (atmosphere.cloudAlpha > 0) {
          for (const [x, y, radius] of CLOUD_CLUSTERS) {
            clouds.circle(x, y, radius).fill({ color: 0xcbd8d5, alpha: atmosphere.cloudAlpha * 0.42 })
            clouds.circle(x + radius * 0.58, y + 8, radius * 0.76).fill({ color: 0xcbd8d5, alpha: atmosphere.cloudAlpha * 0.34 })
            clouds.circle(x - radius * 0.48, y + 12, radius * 0.62).fill({ color: 0xcbd8d5, alpha: atmosphere.cloudAlpha * 0.28 })
          }
        }

        rain.clear()
        if (atmosphere.rainAlpha > 0) {
          for (let row = 0; row < 3; row += 1) {
            for (const [x, y] of RAIN_COLUMNS) {
              rain.rect(x + row * 17, y + row * 205, 2, 24).fill({ color: 0x9bc9d2, alpha: atmosphere.rainAlpha })
            }
          }
        }

        stormFlash.clear()
        stormFlash.rect(0, 0, WORLD_WIDTH, 600).fill({ color: 0xdff8ff, alpha: 1 })
        stormFlash.alpha = 0

        ground.clear()
        ground.rect(0, 585, WORLD_WIDTH, 315).fill({ color: atmosphere.terrain })
        ground.rect(0, 615, WORLD_WIDTH, 285).fill({ color: 0x06100d, alpha: 0.42 })

        rails.clear()
        rails.rect(240, 710, 1180, 5).fill({ color: 0x4b625c, alpha: 0.52 })
        rails.rect(240, 747, 1180, 5).fill({ color: 0x4b625c, alpha: 0.4 })
        for (let x = 255; x < 1415; x += 52) {
          rails.rect(x, 704, 7, 54).fill({ color: 0x513d2b, alpha: 0.46 })
        }

        lamp.clear().circle(0, 0, 11).fill({ color: atmosphere.lamp, alpha: 0.92 })
        lampGlow.clear().circle(0, 0, 34).fill({ color: atmosphere.lamp, alpha: 0.1 })
      }

      let developmentSignature = ''
      const renderDevelopment = (current: WorldRenderSnapshot) => {
        const signature = `${current.level}:${current.timePhase}:${current.weather}`
        if (signature === developmentSignature) return
        developmentSignature = signature
        const atmosphere = buildWorldAtmospherePresentation(current)
        development.clear()

        const building = (x: number, y: number, width: number, height: number, roofHeight: number) => {
          development.rect(x, y, width, height).fill({ color: atmosphere.structureBase })
          development
            .poly([x - 8, y, x + width / 2, y - roofHeight, x + width + 8, y])
            .fill({ color: atmosphere.structureAccent })
          development.rect(x + width * 0.18, y + height * 0.35, 18, 18).fill({ color: atmosphere.lamp, alpha: 0.42 })
        }

        building(80, 500, 210, 85, 40)
        if (current.level >= 2) building(360, 515, 150, 70, 32)
        if (current.level >= 3) building(540, 485, 180, 100, 38)
        if (current.level >= 4) building(750, 450, 210, 135, 44)
        if (current.level >= 5) building(1010, 410, 230, 175, 50)
        if (current.level >= 7) building(1280, 345, 210, 240, 56)
        if (current.level >= 9) {
          development.rect(930, 270, 42, 180).fill({ color: atmosphere.structureBase })
          development.rect(936, 252, 30, 22).fill({ color: atmosphere.structureAccent })
        }
        if (current.level >= 11) {
          development.circle(1360, 250, 95).fill({ color: atmosphere.lamp, alpha: 0.09 })
          development.circle(1360, 250, 62).fill({ color: atmosphere.lamp, alpha: 0.06 })
        }
      }

      let activitySignature = ''
      let activeActivity = buildWorldAmbientActivityPresentation(snapshotRef.current)
      const renderActivityState = (current: WorldRenderSnapshot) => {
        const signature = `${current.level}:${current.timePhase}:${current.weather}`
        if (signature === activitySignature) return
        activitySignature = signature
        activeActivity = buildWorldAmbientActivityPresentation(current)
        const activeIds = new Set(activeActivity.actors.map(actor => actor.id))
        for (const slot of WORLD_AMBIENT_ACTOR_SLOTS) {
          const view = actorViews.get(slot.id)
          if (view) view.visible = activeIds.has(slot.id)
        }
        cartViews.forEach((view, index) => { view.visible = index < activeActivity.cartCount })
      }

      next.ticker.maxFPS = reduceMotion ? 30 : window.innerWidth < 900 ? 45 : 60
      next.ticker.minFPS = 20
      next.ticker.add(() => {
        const current = snapshotRef.current
        renderAtmosphere(current)
        renderDevelopment(current)
        renderActivityState(current)

        const now = performance.now()
        if (reduceMotion) {
          lamp.alpha = 0.88
          lampGlow.alpha = 0.75
          clouds.position.x = 0
          rain.position.y = 0
          stormFlash.alpha = 0

          for (const plan of activeActivity.actors) {
            const view = actorViews.get(plan.id)
            if (!view) continue
            const point = ambientRoutePoint(plan.route, plan.phaseOffset)
            view.position.set(point.x, point.y)
            view.scale.set(plan.scale, plan.scale)
            view.alpha = 0.9
          }
          cartViews.forEach((view, index) => {
            if (!view.visible) return
            view.position.set(460 + index * 620, 696)
            view.scale.set(1, 1)
          })
          return
        }

        lamp.alpha = 0.76 + Math.sin(now / 550) * 0.14
        lampGlow.alpha = 0.65 + Math.sin(now / 720) * 0.18
        clouds.position.x = Math.sin(now / 9000) * 9
        rain.position.y = activeAtmosphere.rainAlpha > 0 ? (now / 22) % 24 : 0

        for (const plan of activeActivity.actors) {
          const view = actorViews.get(plan.id)
          if (!view) continue
          const progress = plan.phaseOffset + (now / 12000) * plan.pace * activeActivity.activityScale
          const point = ambientRoutePoint(plan.route, progress)
          const bob = Math.sin(now / 260 + plan.phaseOffset * Math.PI * 2) * 1.8
          view.position.set(point.x, point.y + bob)
          view.scale.set(plan.scale * point.direction, plan.scale)
          view.alpha = 0.82 + Math.sin(now / 900 + plan.phaseOffset * 5) * 0.08
        }

        cartViews.forEach((view, index) => {
          if (!view.visible) return
          const travel = loopTravel(index * 0.5 + (now / 18500) * (0.7 + activeActivity.activityScale * 0.45))
          view.position.set(280 + 1120 * travel.t, 696)
          view.scale.set(travel.direction, 1)
        })

        if (activeAtmosphere.stormFlashAlpha > 0) {
          const flashCycle = now % 7600
          const pulse = flashCycle > 7140 ? Math.sin(((flashCycle - 7140) / 460) * Math.PI) : 0
          stormFlash.alpha = Math.max(0, pulse) * activeAtmosphere.stormFlashAlpha
        } else {
          stormFlash.alpha = 0
        }
      })

      const fit = () => {
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        const scale = Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT)
        world.scale.set(scale)
        world.position.set((w - WORLD_WIDTH * scale) / 2, (h - WORLD_HEIGHT * scale) / 2)
      }
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(host)
      ;(next as PixiApplication & { __pulseResizeObserver?: ResizeObserver }).__pulseResizeObserver = ro

      const onVisibility = () => {
        if (!app) return
        if (document.hidden) app.stop()
        else app.start()
      }
      document.addEventListener('visibilitychange', onVisibility)
      ;(next as PixiApplication & { __pulseVisibility?: () => void }).__pulseVisibility = onVisibility
    }

    void boot().catch(error => {
      if (!disposed) {
        console.error('QVANIX DNA renderer boot failed', error)
        setRenderer('error')
      }
      releaseLease()
    })

    return () => {
      disposed = true
      if (app) {
        const typed = app as PixiApplication & { __pulseResizeObserver?: ResizeObserver, __pulseVisibility?: () => void }
        typed.__pulseResizeObserver?.disconnect()
        if (typed.__pulseVisibility) document.removeEventListener('visibilitychange', typed.__pulseVisibility)
        app.destroy(true, { children: true })
      }
      releaseLease()
      host.replaceChildren()
    }
  }, [])

  return (
    <div
      className="world-stage"
      ref={hostRef}
      data-world-time={presentation.timePhase}
      data-world-weather={presentation.weather}
      data-world-events={presentation.pendingEventCount}
      data-world-primary-event={presentation.primaryEventChannel ?? 'none'}
      data-world-layer-version={WORLD_SCENE_LAYER_VERSION}
      data-world-layer-count={WORLD_SCENE_LAYER_ORDER.length}
      data-world-asset-version={WORLD_ASSET_SLOT_VERSION}
      data-world-asset-slots={WORLD_ASSET_SLOTS.length}
      data-world-asset-loader-version={WORLD_ASSET_LOADER_VERSION}
      data-world-assets-configured={assetRuntime.configured}
      data-world-assets-loaded={assetRuntime.loaded}
      data-world-assets-failed={assetRuntime.failed}
      data-world-activity-version={ambientPresentation.version}
      data-world-actors={ambientPresentation.actors.length}
      data-world-carts={ambientPresentation.cartCount}
    >
      <div className="world-stage__diagnostic">DNA ENGINE · {renderer.toUpperCase()} · {presentation.timeLabel}</div>
    </div>
  )
}
