// @ts-nocheck
// Spatial-depth pass validated against the 2026-09-21 Samsung capture.
import { useEffect, useRef, useState } from 'react'
import type { Application as PixiApplication } from 'pixi.js'
import type { WorldState } from '../../../v2/src/features/dna/worldState'
import { emptyWorldEventCursor, resolveWorldEventQueue, type WorldEventCursorDocument } from '../../../v2/src/features/dna/worldEventQueue'
import { buildWorldRenderSnapshot, type WorldRenderSnapshot } from '../../../v2/src/features/dna/worldRenderSnapshot'
import {
  WORLD_AMBIENT_ACTOR_SLOTS,
  buildWorldAmbientActivityPresentation,
  type WorldAmbientActorRole,
  type WorldAmbientActorRoute,
} from '../../../v2/src/features/world/worldAmbientActivityPresentation'
import { buildWorldAtmospherePresentation } from '../../../v2/src/features/world/worldAtmospherePresentation'
import { WORLD_ASSET_LOADER_VERSION, loadWorldAssetEntries } from '../../../v2/src/features/world/worldAssetLoader'
import { resolveWorldAssetReadiness } from '../../../v2/src/features/world/worldAssetReadiness'
import { WORLD_ASSET_SLOTS, WORLD_ASSET_SLOT_VERSION } from '../../../v2/src/features/world/worldAssetSlots'
import {
  WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION,
  buildWorldEventArrivalPresentation,
} from '../../../v2/src/features/world/worldEventArrivalPresentation'
import {
  WORLD_EVENT_ARRIVAL_MOTION_VERSION,
  resolveWorldEventArrivalMotion,
} from '../../../v2/src/features/world/worldEventArrivalMotion'
import {
  WORLD_EVENT_CARAVAN_LIMIT,
  WORLD_EVENT_CARAVAN_VERSION,
  buildWorldEventCaravanPresentation,
  resolveWorldEventCaravanJourney,
  type WorldEventCaravanDestination,
  type WorldEventCaravanPlan,
} from '../../../v2/src/features/world/worldEventCaravanPresentation'
import { buildWorldEventPresentation } from '../../../v2/src/features/world/worldEventPresentation'
import { REVIEWED_WORLD_ASSET_MANIFEST } from '../../../v2/src/features/world/worldReviewedAssets'
import {
  WORLD_REVIEWED_SPRITE_BINDING_VERSION,
  bindReviewedAssetSprite,
} from '../../../v2/src/features/world/worldReviewedSpriteBinding'
import { buildWorldPresentationMetadata } from '../../../v2/src/features/world/worldPresentationMetadata'
import { WORLD_SCENE_LAYER_ORDER, WORLD_SCENE_LAYER_VERSION, type WorldSceneLayer } from '../../../v2/src/features/world/worldSceneLayers'
import { dnaWorldRuntimeRegistry } from './runtime/runtimeOwnership'
import { createDnaWorldLayers, requireDnaWorldLayer } from './runtime/sceneLayers'
import { createDnaWorldRoot } from './runtime/worldRoot'

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

const EVENT_CARAVAN_DESTINATIONS: Record<WorldEventCaravanDestination, readonly [number, number]> = {
  'mine-yard': [280, 632],
  workshop: [610, 618],
  'construction-yard': [905, 598],
  storehouse: [1175, 606],
  'settlement-gate': [1470, 632],
  'town-square': [1090, 566],
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

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * clamp(progress, 0, 1)
}

function caravanRoutePoint(plan: WorldEventCaravanPlan, phaseInput: number, reducedMotion: boolean) {
  const journey = resolveWorldEventCaravanJourney(phaseInput, reducedMotion)
  const destination = EVENT_CARAVAN_DESTINATIONS[plan.destination]
  const start: readonly [number, number] = plan.direction === 'eastbound' ? [-70, 690] : [1670, 690]
  const exit: readonly [number, number] = plan.direction === 'eastbound' ? [1670, 690] : [-70, 690]

  if (journey.segment === 'approach') {
    return {
      x: lerp(start[0], destination[0], journey.progress),
      y: lerp(start[1], destination[1], journey.progress),
      arrived: false,
    }
  }
  if (journey.segment === 'depart') {
    return {
      x: lerp(destination[0], exit[0], journey.progress),
      y: lerp(destination[1], exit[1], journey.progress),
      arrived: false,
    }
  }
  return { x: destination[0], y: destination[1], arrived: true }
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
  const [reviewedSettlementMounted, setReviewedSettlementMounted] = useState(false)
  const [reviewedTerrainMounted, setReviewedTerrainMounted] = useState(false)
  const [reviewedWorkshopMounted, setReviewedWorkshopMounted] = useState(false)
  const [reviewedMineMounted, setReviewedMineMounted] = useState(false)
  const [reviewedHeroMounted, setReviewedHeroMounted] = useState(false)
  const [reviewedMountainsMounted, setReviewedMountainsMounted] = useState(false)
  const [reviewedForestMounted, setReviewedForestMounted] = useState(false)
  const snapshotRef = useRef(snapshot)
  const presentation = buildWorldPresentationMetadata(snapshot)
  const ambientPresentation = buildWorldAmbientActivityPresentation(snapshot)
  const caravanPresentation = buildWorldEventCaravanPresentation(buildWorldEventPresentation(snapshot.pendingEvents))

  if (!ownerIdRef.current) {
    worldStageSequence += 1
    ownerIdRef.current = `world-stage-${worldStageSequence}`
  }

  useEffect(() => { snapshotRef.current = snapshot }, [snapshot])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const lease = dnaWorldRuntimeRegistry.acquire(ownerIdRef.current ?? 'world-stage')
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
      const {app:next,pixi}=await createDnaWorldRoot(host)
      const {Container,Graphics,Sprite}=pixi
      if (disposed){next.destroy(true);return}
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

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

      const layerContainers = createDnaWorldLayers(Container,world)
      const layer = (name: Parameters<typeof requireDnaWorldLayer>[1]) => requireDnaWorldLayer(layerContainers,name)

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

      const reviewedMountainsLayer = new Container()
      reviewedMountainsLayer.label = 'asset-slot:background.mountains:reviewed'
      layer('background').addChild(reviewedMountainsLayer)

      const mountainsNear = new Graphics()
      mountainsNear.label = 'world:mountains-near'
      layer('background').addChild(mountainsNear)

      const reviewedSettlementLayer = new Container()
      reviewedSettlementLayer.label = 'asset-slot:background.distant-settlement'
      layer('background').addChild(reviewedSettlementLayer)

      const reviewedForestLayer = new Container()
      reviewedForestLayer.label = 'asset-slot:background.forest:reviewed'
      layer('background').addChild(reviewedForestLayer)

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

      const reviewedTerrainLayer = new Container()
      reviewedTerrainLayer.label = 'asset-slot:terrain.ground:reviewed'
      layer('terrain').addChild(reviewedTerrainLayer)

      const ground = new Graphics()
      ground.label = 'asset-slot:terrain.ground'
      layer('terrain').addChild(ground)

      const development = new Graphics()
      development.label = 'asset-slot:structures.construction'
      layer('structures').addChild(development)

      const reviewedWorkshopLayer = new Container()
      reviewedWorkshopLayer.label = 'asset-slot:structures.workshop:reviewed'
      layer('structures').addChild(reviewedWorkshopLayer)

      const reviewedMineLayer = new Container()
      reviewedMineLayer.label = 'asset-slot:terrain.mine-entrance:reviewed'
      layer('structures').addChild(reviewedMineLayer)

      const starterSettlement = new Graphics()
      starterSettlement.label = 'world:starter-settlement:fallback'
      layer('structures').addChild(starterSettlement)

      const starterResidence = new Graphics()
      starterResidence.label = 'world:starter-residence'
      layer('structures').addChild(starterResidence)

      const hero = new Container()
      hero.label = 'world:hero-wanderer'
      const heroShadow = new Graphics().ellipse(0, 4, 31, 9).fill({ color: 0x020706, alpha: 0.36 })
      const heroBody = new Graphics()
      heroBody.circle(0, -52, 10).fill({ color: 0xd4b68b, alpha: 1 })
      heroBody.arc(0,-53,10,Math.PI,Math.PI*2).stroke({color:0x111a17,width:4,alpha:.9})
      heroBody.poly([-15,-43,13,-43,22,-5,8,7,-11,7,-23,-5]).fill({ color: 0x263630, alpha: 1 })
      heroBody.poly([-18,-42,0,-65,18,-42]).fill({ color: 0x18231f, alpha: 1 })
      heroBody.rect(-18,-24,36,5).fill({ color: 0x9b7049, alpha: .88 })
      heroBody.poly([-15,-42,-5,-34,-12,-7,-23,-5]).fill({color:0x33463e,alpha:.96})
      heroBody.poly([13,-42,5,-34,10,-7,22,-5]).fill({color:0x1d2c27,alpha:.96})
      heroBody.circle(-4,-53,1.2).fill({color:0x0b100f,alpha:.9})
      heroBody.circle(4,-53,1.2).fill({color:0x0b100f,alpha:.9})
      heroBody.moveTo(16,-38).lineTo(31,1).stroke({ color: 0x9b7049, width: 3, alpha: .9 })
      heroBody.moveTo(29,-1).lineTo(37,-9).stroke({ color: 0xcbd7ce, width: 2, alpha: .78 })
      hero.addChild(heroShadow,heroBody)
      hero.position.set(870, 676)

      const reviewedHeroLayer = new Container()
      reviewedHeroLayer.label = 'asset-slot:actors.hero-wanderer:reviewed'
      hero.addChild(reviewedHeroLayer)
      layer('actors').addChild(hero)

      const foreground = new Graphics()
      foreground.label = 'world:foreground-depth'
      layer('effects').addChild(foreground)

      const foregroundVegetation = new Graphics()
      foregroundVegetation.label = 'world:foreground-vegetation'
      layer('effects').addChild(foregroundVegetation)

      const pathDepth = new Graphics()
      pathDepth.label = 'world:path-depth'
      layer('effects').addChild(pathDepth)

      const structureGrounding = new Graphics()
      structureGrounding.label = 'world:structure-grounding'
      layer('effects').addChild(structureGrounding)

      const settlementPath = new Graphics()
      settlementPath.label = 'world:settlement-path'
      layer('terrain').addChild(settlementPath)

      const settlementLight = new Graphics()
      settlementLight.label = 'world:settlement-light'
      layer('effects').addChild(settlementLight)

      const emberField = new Graphics()
      emberField.label = 'world:forge-embers'
      layer('effects').addChild(emberField)

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

      const caravanViews = Array.from({ length: WORLD_EVENT_CARAVAN_LIMIT }, (_, index) => {
        const caravan = new Container()
        caravan.label = `world:event-caravan:${index + 1}`
        caravan.visible = false
        const shape = new Graphics()
        caravan.addChild(shape)
        layer('logistics').addChild(caravan)

        const glow = new Graphics()
        glow.label = `world:event-arrival:${index + 1}`
        glow.visible = false
        layer('effects').addChild(glow)

        const arrivalScene = new Container()
        arrivalScene.label = `world:event-arrival-scene:${index + 1}`
        arrivalScene.visible = false
        const responder = new Graphics()
        const arrivalCue = new Graphics()
        arrivalScene.addChild(arrivalCue, responder)
        layer('effects').addChild(arrivalScene)

        return { caravan, shape, glow, arrivalScene, arrivalCue, responder, arrivalEmphasis: 0 }
      })

      const lampGlow = new Graphics().circle(0, 0, 34).fill({ color: 0x66ffe2, alpha: 0.08 })
      lampGlow.label = 'world:work-light-glow'
      lampGlow.position.set(400, 560)
      layer('effects').addChild(lampGlow)

      const lamp = new Graphics().circle(0, 0, 11).fill({ color: 0x66ffe2, alpha: 0.9 })
      lamp.label = 'asset-slot:effects.work-lights'
      lamp.position.set(400, 560)
      layer('effects').addChild(lamp)

      const reviewedSettlementReadiness = resolveWorldAssetReadiness(
        REVIEWED_WORLD_ASSET_MANIFEST,
        ['background.mountains', 'background.forest', 'background.distant-settlement', 'terrain.ground', 'structures.workshop', 'terrain.mine-entrance', 'actors.hero-wanderer'],
      )

      // Browser-native loading keeps the deferred Pixi chunk below its strict budget.
      // The reviewed binding consumes the same fail-closed load result and creates a
      // Sprite only after canonical readiness + mount policy approve the exact slot.
      void loadWorldAssetEntries(REVIEWED_WORLD_ASSET_MANIFEST.entries.values(), preloadBrowserImage)
        .then(result => {
          if (disposed) return
          setAssetRuntime({
            configured: REVIEWED_WORLD_ASSET_MANIFEST.entries.size,
            loaded: result.loaded.size,
            failed: result.failures.length,
          })

          const bind = (slotId: Parameters<typeof bindReviewedAssetSprite>[4]) =>
            bindReviewedAssetSprite(
              { createSprite: source => Sprite.from(source as Parameters<typeof Sprite.from>[0]) },
              REVIEWED_WORLD_ASSET_MANIFEST,
              reviewedSettlementReadiness,
              result,
              slotId,
            )

          const mountainsBinding = bind('background.mountains')
          if (mountainsBinding.mode === 'reviewed-asset' && mountainsBinding.sprite) {
            const sprite = mountainsBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.position.set(0, 72); sprite.width = WORLD_WIDTH; sprite.height = 760
            reviewedMountainsLayer.addChild(sprite); mountainsFar.visible = false; mountainsNear.visible = false; setReviewedMountainsMounted(true)
          } else { mountainsFar.visible = true; mountainsNear.visible = true; setReviewedMountainsMounted(false) }

          const forestBinding = bind('background.forest')
          if (forestBinding.mode === 'reviewed-asset' && forestBinding.sprite) {
            const sprite = forestBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.position.set(0, 58); sprite.width = WORLD_WIDTH; sprite.height = 790; sprite.alpha = 0.88
            reviewedForestLayer.addChild(sprite); forest.visible = false; setReviewedForestMounted(true)
          } else { forest.visible = true; setReviewedForestMounted(false) }

          const settlementBinding = bind('background.distant-settlement')
          if (settlementBinding.mode === 'reviewed-asset' && settlementBinding.sprite) {
            const sprite = settlementBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.position.set(0, 0); sprite.width = WORLD_WIDTH; sprite.height = WORLD_HEIGHT; sprite.alpha = 0.92
            reviewedSettlementLayer.addChild(sprite)
            setReviewedSettlementMounted(true)
          } else setReviewedSettlementMounted(false)

          const terrainBinding = bind('terrain.ground')
          if (terrainBinding.mode === 'reviewed-asset' && terrainBinding.sprite) {
            const sprite = terrainBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.position.set(0, 0); sprite.width = WORLD_WIDTH; sprite.height = WORLD_HEIGHT; sprite.alpha = 0.98
            reviewedTerrainLayer.addChild(sprite); ground.visible = false; setReviewedTerrainMounted(true)
          } else setReviewedTerrainMounted(false)

          const workshopBinding = bind('structures.workshop')
          if (workshopBinding.mode === 'reviewed-asset' && workshopBinding.sprite) {
            const sprite = workshopBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.position.set(650, 455); sprite.width = 205; sprite.height = 154
            reviewedWorkshopLayer.addChild(sprite); setReviewedWorkshopMounted(true)
          } else setReviewedWorkshopMounted(false)

          const heroBinding = bind('actors.hero-wanderer')
          if (heroBinding.mode === 'reviewed-asset' && heroBinding.sprite) {
            const sprite = heroBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.anchor.set(.5, 1); sprite.position.set(0, 8); sprite.width = 92; sprite.height = 133
            reviewedHeroLayer.addChild(sprite); heroBody.visible = false; setReviewedHeroMounted(true)
          } else { heroBody.visible = true; setReviewedHeroMounted(false) }

          const mineBinding = bind('terrain.mine-entrance')
          const workshopReady = workshopBinding.mode === 'reviewed-asset' && Boolean(workshopBinding.sprite)
          const mineReady = mineBinding.mode === 'reviewed-asset' && Boolean(mineBinding.sprite)
          if (mineBinding.mode === 'reviewed-asset' && mineBinding.sprite) {
            const sprite = mineBinding.sprite as ReturnType<typeof Sprite.from>
            sprite.position.set(930, 452); sprite.width = 205; sprite.height = 171
            reviewedMineLayer.addChild(sprite); setReviewedMineMounted(true)
          } else setReviewedMineMounted(false)
          // Only retire the combined procedural workshop/mine fallback when both
          // reviewed structures are present. Partial loading stays truthful and legible.
          starterSettlement.visible = !(workshopReady && mineReady)
        })
        .catch(() => {
          if (!disposed) { starterSettlement.visible = true; mountainsFar.visible = true; mountainsNear.visible = true; forest.visible = true; setReviewedMountainsMounted(false); setReviewedForestMounted(false); setReviewedSettlementMounted(false); setReviewedTerrainMounted(false); setReviewedWorkshopMounted(false); setReviewedMineMounted(false); heroBody.visible = true; setReviewedHeroMounted(false) }
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

        pathDepth.clear()
        pathDepth.poly([650,900,785,655,835,655,1010,900]).fill({color:0x13241f,alpha:.38})
        pathDepth.poly([0,850,260,705,315,705,170,900,0,900]).fill({color:0x10201b,alpha:.24})

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
        settlementPath.clear()
        settlementPath.poly([770,900,815,700,825,630,850,630,895,700,1015,900]).fill({color:0x243f35,alpha:.3})
        settlementPath.poly([815,900,842,710,844,650,858,650,875,710,945,900]).fill({color:0x667866,alpha:.08})

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
        starterSettlement.clear()
        starterResidence.clear()
        foreground.clear()
        structureGrounding.clear()
        structureGrounding.ellipse(557,625,82,15).fill({color:0x030a08,alpha:.34})
        structureGrounding.ellipse(752,625,128,18).fill({color:0x030a08,alpha:.4})
        structureGrounding.ellipse(1032,630,126,18).fill({color:0x030a08,alpha:.42})
        structureGrounding.ellipse(870,696,52,11).fill({color:0x020706,alpha:.3})
        foregroundVegetation.clear()
        const shrubs=[[28,770,58],[112,790,42],[218,760,50],[1280,782,54],[1390,752,46],[1515,785,62]] as const
        for(const [x,y,size] of shrubs){foregroundVegetation.poly([x-size*.55,y,x,y-size,x+size*.55,y]).fill({color:0x07130f,alpha:.74}).poly([x-size*.72,y+16,x,y-size*.52,x+size*.72,y+16]).fill({color:0x0a1b15,alpha:.82})}
        foregroundVegetation.rect(0,842,WORLD_WIDTH,58).fill({color:0x06110d,alpha:.56})
        foregroundVegetation.circle(72,850,46).fill({color:0x091813,alpha:.72}).circle(1540,848,58).fill({color:0x091813,alpha:.76})

        // The residence remains a small procedural anchor while reviewed workshop/mine
        // assets own the central authored composition. It is deliberately separated so
        // reviewed structures can replace their fallbacks without double-rendering.
        starterResidence
          .poly([500,620,536,565,575,565,615,620]).fill({color:0x17231f,alpha:.98})
          .rect(520,558,74,62).fill({color:atmosphere.structureBase,alpha:.98})
          .poly([510,560,557,524,604,560]).fill({color:atmosphere.structureAccent,alpha:.98})
          .rect(536,585,17,35).fill({color:0x111a17,alpha:.9})
          .rect(570,579,14,14).fill({color:atmosphere.lamp,alpha:.58})
          .rect(520,606,74,14).fill({color:0x0c1512,alpha:.72})

        // Starter settlement is world identity, not progression. It exists at level 1
        // so the first truthful state still reads as a place rather than an empty chart.
        starterSettlement
          .poly([560,620,610,552,666,548,712,612]).fill({color:0x17231f,alpha:.98})
          .rect(595,548,82,70).fill({color:atmosphere.structureBase,alpha:.98})
          .poly([585,550,636,510,687,550]).fill({color:atmosphere.structureAccent,alpha:.98})
          .rect(616,578,18,40).fill({color:0x111a17,alpha:.9})
          .rect(650,570,15,15).fill({color:atmosphere.lamp,alpha:.58})
          .rect(746,548,88,70).fill({color:0x17211e,alpha:.98})
          .poly([735,550,790,512,846,550]).fill({color:0x594332,alpha:.96})
          .rect(770,574,42,8).fill({color:0x8a6747,alpha:.9})
          .moveTo(791,548).lineTo(791,506).stroke({color:0x71563d,width:5,alpha:.9})
          .circle(791,500,10).stroke({color:atmosphere.lamp,width:3,alpha:.72})
          .poly([858,618,888,562,918,618]).fill({color:0x101815,alpha:.96})
          .rect(884,574,8,44).fill({color:0x74573d,alpha:.92})
          .moveTo(888,562).lineTo(930,530).stroke({color:0x8a6747,width:6,alpha:.9})
          .moveTo(930,530).lineTo(961,618).stroke({color:0x5f4836,width:5,alpha:.86})
          .rect(926,526,11,92).fill({color:0x171f1c,alpha:.72})
        for(let x=582;x<1000;x+=48){starterSettlement.circle(x,625+(x%3)*3,5).fill({color:0x6c806f,alpha:.5})}
        // Material pass: timber framing, stone bases, roof courses, mine bracing and
        // a forge yard make the starter settlement read as authored infrastructure.
        starterSettlement
          .rect(595,604,82,14).fill({color:0x0c1512,alpha:.72})
          .rect(602,556,5,48).fill({color:0x79583d,alpha:.82})
          .rect(665,556,5,48).fill({color:0x79583d,alpha:.82})
          .moveTo(598,568).lineTo(673,568).stroke({color:0x9b7049,width:3,alpha:.7})
          .moveTo(598,589).lineTo(673,589).stroke({color:0x9b7049,width:3,alpha:.62})
          .poly([590,548,636,516,682,548,676,553,636,525,596,553]).fill({color:0x9c724b,alpha:.66})
          .rect(746,604,88,14).fill({color:0x0b1411,alpha:.76})
          .rect(753,553,5,51).fill({color:0x6f523a,alpha:.82})
          .rect(825,553,5,51).fill({color:0x6f523a,alpha:.82})
          .moveTo(750,566).lineTo(830,566).stroke({color:0x8f6948,width:3,alpha:.68})
          .moveTo(750,589).lineTo(830,589).stroke({color:0x8f6948,width:3,alpha:.58})
          .circle(807,583,7).fill({color:0xe0a55f,alpha:.78})
          .circle(807,583,15).fill({color:0xf0b86b,alpha:.09})
          .moveTo(858,618).lineTo(888,562).lineTo(918,618).stroke({color:0xa57a50,width:8,alpha:.92})
          .moveTo(868,592).lineTo(908,592).stroke({color:0x76563c,width:6,alpha:.9})
          .moveTo(877,575).lineTo(899,575).stroke({color:0x76563c,width:5,alpha:.82})
          .rect(915,606,48,12).fill({color:0x111a16,alpha:.86})
          .circle(931,607,7).fill({color:0x2a3932,alpha:.9})
          .circle(952,607,7).fill({color:0x2a3932,alpha:.9})
        for(let x=575;x<980;x+=34){
          starterSettlement.circle(x,619+(x%4)*2,7).fill({color:0x35443b,alpha:.72})
          starterSettlement.circle(x+9,622+(x%3),5).fill({color:0x25342d,alpha:.74})
        }
        settlementLight.clear()
          .circle(807,583,74).fill({color:atmosphere.lamp,alpha:.035})
          .circle(807,583,42).fill({color:atmosphere.lamp,alpha:.045})
          .circle(650,577,36).fill({color:atmosphere.lamp,alpha:.03})
        emberField.clear()
        for(let i=0;i<9;i+=1){
          emberField.circle(797+(i%3)*8,596-Math.floor(i/3)*7,1.6).fill({color:0xf0b86b,alpha:.58})
        }
        foreground
          .poly([0,790,120,744,245,778,382,726,520,782,680,740,835,794,1000,746,1170,786,1340,736,1600,782,1600,900,0,900]).fill({color:0x020b08,alpha:.78})
        for(let x=25;x<1600;x+=96){const h=28+(x%5)*5;foreground.poly([x,815,x+15,815-h,x+30,815]).fill({color:0x06120e,alpha:.94})}

        const building = (x: number, y: number, width: number, height: number, roofHeight: number) => {
          development.rect(x, y, width, height).fill({ color: atmosphere.structureBase })
          development
            .poly([x - 8, y, x + width / 2, y - roofHeight, x + width + 8, y])
            .fill({ color: atmosphere.structureAccent })
          development.rect(x + width * 0.18, y + height * 0.35, 18, 18).fill({ color: atmosphere.lamp, alpha: 0.42 })
        }

        if (current.level >= 2) building(1010, 515, 150, 70, 32)
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

      const drawArrivalScene = (
        view: (typeof caravanViews)[number],
        plan: WorldEventCaravanPlan,
      ) => {
        const arrival = buildWorldEventArrivalPresentation(plan)
        const destination = EVENT_CARAVAN_DESTINATIONS[plan.destination]
        view.arrivalEmphasis = arrival.emphasis
        view.arrivalScene.position.set(destination[0], destination[1] - 12)
        view.arrivalScene.visible = false
        view.arrivalCue.clear()
        view.responder.clear()

        view.responder.circle(44, -13, 5.5).fill({ color: 0xd0a27d, alpha: 0.96 })
        view.responder.rect(39, -7, 10, 18).fill({ color: arrival.accentColor, alpha: 0.82 })

        switch (arrival.activity) {
          case 'stockpile-drop':
            view.arrivalCue.rect(10, 1, 14, 11).fill({ color: 0x8f7657, alpha: 0.94 })
            view.arrivalCue.rect(27, -4, 14, 16).fill({ color: arrival.accentColor, alpha: 0.82 })
            break
          case 'repair-bench':
            view.arrivalCue.rect(10, 5, 32, 5).fill({ color: 0x8f7657, alpha: 0.92 })
            view.arrivalCue.circle(26, -4, 8).stroke({ color: arrival.accentColor, width: 3, alpha: 0.92 })
            view.arrivalCue.moveTo(26, -12).lineTo(26, 4).stroke({ color: 0xdff5eb, width: 2, alpha: 0.82 })
            break
          case 'construction-drop':
            view.arrivalCue.rect(9, 4, 36, 5).fill({ color: 0xa9825c, alpha: 0.96 })
            view.arrivalCue.rect(15, -5, 30, 5).fill({ color: arrival.accentColor, alpha: 0.82 })
            view.arrivalCue.rect(20, -14, 25, 5).fill({ color: 0xa9825c, alpha: 0.9 })
            break
          case 'treasury-unload':
            view.arrivalCue.circle(17, 4, 6).fill({ color: 0xf0cf72, alpha: 0.96 })
            view.arrivalCue.circle(28, 0, 6).fill({ color: arrival.accentColor, alpha: 0.92 })
            view.arrivalCue.circle(39, 4, 6).fill({ color: 0xf0cf72, alpha: 0.92 })
            break
          case 'message-handoff':
            view.arrivalCue.poly([12, -8, 31, -8, 35, 4, 16, 4]).fill({ color: arrival.accentColor, alpha: 0.9 })
            view.arrivalCue.moveTo(12, -8).lineTo(24, 1).lineTo(31, -8).stroke({ color: 0xdff5eb, width: 1.5, alpha: 0.76 })
            break
          case 'celebration-gathering':
            view.arrivalCue.moveTo(27, 8).lineTo(27, -26).stroke({ color: 0xc9b07c, width: 2, alpha: 0.92 })
            view.arrivalCue.poly([28, -26, 45, -20, 28, -13]).fill({ color: arrival.accentColor, alpha: 0.92 })
            view.arrivalCue.circle(13, -6, 3.5).fill({ color: arrival.accentColor, alpha: 0.94 })
            view.arrivalCue.circle(22, -14, 3).fill({ color: 0xf0cf72, alpha: 0.94 })
            view.arrivalCue.circle(39, -3, 3.5).fill({ color: 0xdff5eb, alpha: 0.88 })
            break
        }
      }

      let caravanSignature = ''
      let activeCaravans: WorldEventCaravanPlan[] = []
      const renderCaravanState = (current: WorldRenderSnapshot) => {
        const signature = current.pendingEvents.map(event => `${event.id}:${event.kind}`).join('|')
        if (signature === caravanSignature) return
        caravanSignature = signature
        activeCaravans = buildWorldEventCaravanPresentation(buildWorldEventPresentation(current.pendingEvents))

        caravanViews.forEach((view, index) => {
          const plan = activeCaravans[index]
          if (!plan) {
            view.caravan.visible = false
            view.glow.visible = false
            view.arrivalScene.visible = false
            return
          }

          view.caravan.visible = true
          view.shape.clear()
          view.shape.poly([-22, -13, 18, -13, 14, 8, -17, 8]).fill({ color: plan.accentColor, alpha: 0.94 })
          view.shape.circle(-11, 12, 4.5).fill({ color: 0x182521, alpha: 1 })
          view.shape.circle(9, 12, 4.5).fill({ color: 0x182521, alpha: 1 })
          view.shape.rect(-2, -31, 3, 18).fill({ color: 0xb9cec8, alpha: 0.72 })
          view.shape.poly([1, -31, 14, -26, 1, -21]).fill({ color: plan.accentColor, alpha: 0.86 })

          const destination = EVENT_CARAVAN_DESTINATIONS[plan.destination]
          view.glow.clear().circle(0, 0, 34).fill({ color: plan.accentColor, alpha: 0.16 })
          view.glow.position.set(destination[0], destination[1])
          view.glow.visible = false
          view.glow.alpha = 0
          drawArrivalScene(view, plan)
        })
      }

      const applyArrivalMotion = (
        view: (typeof caravanViews)[number],
        plan: WorldEventCaravanPlan,
        arrived: boolean,
        reduced: boolean,
        motionSeconds: number,
        index: number,
      ) => {
        const motion = resolveWorldEventArrivalMotion({
          arrived,
          reducedMotion: reduced,
          motionSeconds,
          index,
          emphasis: view.arrivalEmphasis,
        })
        const destination = EVENT_CARAVAN_DESTINATIONS[plan.destination]
        view.glow.visible = motion.visible
        view.glow.alpha = motion.glowAlpha
        view.arrivalScene.visible = motion.visible
        view.arrivalScene.alpha = motion.sceneAlpha
        view.arrivalScene.position.set(destination[0], destination[1] - 12 + motion.offsetY)
        view.arrivalScene.scale.set(motion.scale)
        view.arrivalScene.rotation = motion.rotation
      }

      next.ticker.maxFPS = reduceMotion ? 30 : window.innerWidth < 900 ? 45 : 60
      next.ticker.minFPS = 20
      next.ticker.add(() => {
        const current = snapshotRef.current
        renderAtmosphere(current)
        renderDevelopment(current)
        renderActivityState(current)
        renderCaravanState(current)

        const now = performance.now()
        if (reduceMotion) {
          hero.position.y = 676
          hero.rotation = 0
          settlementLight.alpha = .9
          emberField.alpha = .72
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
          activeCaravans.forEach((plan, index) => {
            const view = caravanViews[index]
            if (!view) return
            const point = caravanRoutePoint(plan, plan.phaseOffset, true)
            view.caravan.position.set(point.x, point.y)
            view.caravan.scale.set(plan.direction === 'eastbound' ? 1 : -1, 1)
            view.caravan.alpha = 0.94
            applyArrivalMotion(view, plan, point.arrived, true, 0, index)
          })
          return
        }

        hero.position.y = 676 + Math.sin(now / 780) * 2.2
        settlementLight.alpha = .82 + Math.sin(now / 640) * .12
        emberField.alpha = .62 + Math.sin(now / 180) * .22
        hero.rotation = Math.sin(now / 2100) * 0.008
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

        activeCaravans.forEach((plan, index) => {
          const view = caravanViews[index]
          if (!view) return
          const phase = plan.phaseOffset + (now / 26000) * plan.pace
          const point = caravanRoutePoint(plan, phase, false)
          const bob = Math.sin(now / 420 + plan.phaseOffset * 8) * 1.3
          view.caravan.position.set(point.x, point.y + bob)
          view.caravan.scale.set(plan.direction === 'eastbound' ? 1 : -1, 1)
          view.caravan.alpha = 0.9
          applyArrivalMotion(view, plan, point.arrived, false, now / 1000, index)
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
        const immersivePortrait = h > w * 1.15
        const scale = immersivePortrait ? Math.max(w / WORLD_WIDTH, h / WORLD_HEIGHT) : Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT)
        world.scale.set(scale)
        const focusX = immersivePortrait ? 800 : WORLD_WIDTH / 2
        world.position.set(w / 2 - focusX * scale, (h - WORLD_HEIGHT * scale) / 2)
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
      data-world-reviewed-sprite-binding-version={WORLD_REVIEWED_SPRITE_BINDING_VERSION}
      data-world-assets-configured={assetRuntime.configured}
      data-world-assets-loaded={assetRuntime.loaded}
      data-world-assets-failed={assetRuntime.failed}
      data-world-reviewed-settlement-mounted={reviewedSettlementMounted ? 'true' : 'false'}
      data-world-reviewed-terrain-mounted={reviewedTerrainMounted ? 'true' : 'false'}
      data-world-reviewed-workshop-mounted={reviewedWorkshopMounted ? 'true' : 'false'}
      data-world-reviewed-mine-mounted={reviewedMineMounted ? 'true' : 'false'}
      data-world-reviewed-hero-mounted={reviewedHeroMounted ? 'true' : 'false'}
      data-world-reviewed-mountains-mounted={reviewedMountainsMounted ? 'true' : 'false'}
      data-world-reviewed-forest-mounted={reviewedForestMounted ? 'true' : 'false'}
      data-world-activity-version={ambientPresentation.version}
      data-world-actors={ambientPresentation.actors.length}
      data-world-carts={ambientPresentation.cartCount}
      data-world-event-caravan-version={WORLD_EVENT_CARAVAN_VERSION}
      data-world-event-caravans={caravanPresentation.length}
      data-world-event-arrival-version={WORLD_EVENT_ARRIVAL_PRESENTATION_VERSION}
      data-world-event-arrival-motion-version={WORLD_EVENT_ARRIVAL_MOTION_VERSION}
    >
      <div className="world-stage__diagnostic">DNA ENGINE · {renderer.toUpperCase()} · {presentation.timeLabel}</div>
    </div>
  )
}
