import { useEffect, useRef, useState } from 'react'
import type { Application as PixiApplication } from 'pixi.js'
import type { WorldState } from '../dna/worldState'
import { emptyWorldEventCursor, resolveWorldEventQueue, type WorldEventCursorDocument } from '../dna/worldEventQueue'
import { buildWorldRenderSnapshot, type WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
let worldStageSequence = 0

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

      const sky = new Graphics().rect(0, 0, 1600, 900).fill({ color: 0x081d2a })
      sky.label = 'asset-slot:background.sky'
      layer('background').addChild(sky)

      const horizon = new Graphics()
        .poly([0, 520, 180, 390, 330, 470, 520, 330, 740, 470, 940, 350, 1180, 500, 1380, 380, 1600, 510, 1600, 900, 0, 900])
        .fill({ color: 0x0c3034 })
      horizon.label = 'asset-slot:background.mountains'
      layer('background').addChild(horizon)

      const ground = new Graphics().rect(0, 585, 1600, 315).fill({ color: 0x07130f })
      ground.label = 'asset-slot:terrain.ground'
      layer('terrain').addChild(ground)

      const development = new Graphics()
      development.label = 'asset-slot:structures.construction'
      layer('structures').addChild(development)

      const lamp = new Graphics().circle(0, 0, 13).fill({ color: 0x66ffe2, alpha: 0.9 })
      lamp.label = 'asset-slot:effects.work-lights'
      lamp.position.set(400, 560)
      layer('effects').addChild(lamp)

      // Reviewed art is preloaded independently from renderer boot. Browser-native
      // image loading preserves the deferred Pixi bundle budget. A missing/broken
      // asset never removes the existing placeholder and never aborts the world.
      void loadWorldAssetEntries(REVIEWED_WORLD_ASSET_MANIFEST.entries.values(), preloadBrowserImage)
        .then(result => {
          if (disposed) return
          setAssetRuntime({
            configured: REVIEWED_WORLD_ASSET_MANIFEST.entries.size,
            loaded: result.loaded.size,
            failed: result.failures.length,
          })
        })

      let lastLevel = -1
      const renderLevel = (current: number) => {
        if (current === lastLevel) return
        lastLevel = current
        development.clear()
        development.rect(80, 500, 210, 85).fill({ color: 0x3b2b20 })
        development.rect(105, 455, 160, 45).fill({ color: 0x8f5d38 })
        if (current >= 2) development.rect(360, 515, 150, 70).fill({ color: 0x4b3225 })
        if (current >= 3) development.rect(540, 485, 180, 100).fill({ color: 0x62402b })
        if (current >= 4) development.rect(750, 450, 210, 135).fill({ color: 0x2b3834 })
        if (current >= 5) development.rect(1010, 410, 230, 175).fill({ color: 0x36433a })
        if (current >= 7) development.rect(1280, 345, 210, 240).fill({ color: 0x4d382a })
        if (current >= 9) development.rect(930, 270, 42, 180).fill({ color: 0x605244 })
        if (current >= 11) development.circle(1360, 250, 95).fill({ color: 0x26b9ac, alpha: 0.18 })
      }

      next.ticker.maxFPS = window.innerWidth < 900 ? 45 : 60
      next.ticker.minFPS = 20
      next.ticker.add(() => {
        renderLevel(snapshotRef.current.level)
        lamp.alpha = 0.72 + Math.sin(performance.now() / 550) * 0.16
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
    >
      <div className="world-stage__diagnostic">DNA ENGINE · {renderer.toUpperCase()} · {presentation.timeLabel}</div>
    </div>
  )
}
