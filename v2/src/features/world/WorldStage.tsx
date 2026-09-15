import { useEffect, useRef, useState } from 'react'
import type { WorldState } from '../dna/worldState'
import { emptyWorldEventCursor, resolveWorldEventQueue, type WorldEventCursorDocument } from '../dna/worldEventQueue'
import { buildWorldRenderSnapshot, type WorldRenderSnapshot } from '../dna/worldRenderSnapshot'
import { WORLD_ASSET_LOADER_VERSION } from './worldAssetLoader'
import { WORLD_ASSET_SLOTS, WORLD_ASSET_SLOT_VERSION } from './worldAssetSlots'
import { buildWorldPresentationMetadata } from './worldPresentationMetadata'
import { WORLD_SCENE_LAYER_ORDER, WORLD_SCENE_LAYER_VERSION } from './worldSceneLayers'
import { worldRuntimeRegistry } from './worldRuntimeOwnership'
import type { WorldAssetRuntimeState } from './worldPixiRuntime'

type Props = {
  state: WorldState
  cursor?: WorldEventCursorDocument
}

type PixiProps = {
  snapshot: WorldRenderSnapshot
}

let worldStageSequence = 0

export function WorldStage({ state, cursor }: Props) {
  const queue = resolveWorldEventQueue(state, cursor ?? emptyWorldEventCursor())
  const snapshot = buildWorldRenderSnapshot(state, queue)
  return <WorldPixiStage snapshot={snapshot} />
}

function WorldPixiStage({ snapshot }: PixiProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const ownerIdRef = useRef<string | null>(null)
  const snapshotRef = useRef(snapshot)
  const [renderer, setRenderer] = useState('initializing')
  const [assetRuntime, setAssetRuntime] = useState<WorldAssetRuntimeState>({
    configured: 0,
    loaded: 0,
    failed: 0,
    actorConfigured: 0,
    actorLoaded: 0,
    actorFailed: 0,
  })
  const presentation = buildWorldPresentationMetadata(snapshot)

  if (!ownerIdRef.current) {
    worldStageSequence += 1
    ownerIdRef.current = `world-stage-${worldStageSequence}`
  }

  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const lease = worldRuntimeRegistry.acquire(ownerIdRef.current ?? 'world-stage')
    if (!lease.acquired) {
      setRenderer('blocked')
      return
    }

    const controller = new AbortController()
    let disposed = false
    let cleanupRuntime: (() => void) | null = null
    let leaseReleased = false
    const releaseLease = () => {
      if (leaseReleased) return
      leaseReleased = true
      lease.release()
    }

    const boot = async () => {
      const { mountWorldPixiRuntime } = await import('./worldPixiRuntime')
      if (disposed) return
      cleanupRuntime = await mountWorldPixiRuntime({
        host,
        getSnapshot: () => snapshotRef.current,
        onRenderer: setRenderer,
        onAssetRuntime: setAssetRuntime,
        signal: controller.signal,
      })
      if (disposed) {
        cleanupRuntime()
        cleanupRuntime = null
      }
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
      controller.abort()
      cleanupRuntime?.()
      cleanupRuntime = null
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
      data-world-actor-atlases-configured={assetRuntime.actorConfigured}
      data-world-actor-atlases-loaded={assetRuntime.actorLoaded}
      data-world-actor-atlases-failed={assetRuntime.actorFailed}
    >
      <div className="world-stage__diagnostic">DNA ENGINE · {renderer.toUpperCase()} · {presentation.timeLabel}</div>
    </div>
  )
}
