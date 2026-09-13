export type WorldRuntimeLease = {
  acquired: boolean
  ownerId: string
  blockedBy: string | null
  release: () => void
}

export type WorldRuntimeRegistry = {
  acquire: (ownerId: string) => WorldRuntimeLease
  activeOwner: () => string | null
}

export function createWorldRuntimeRegistry(): WorldRuntimeRegistry {
  let active: { ownerId: string; token: symbol } | null = null

  return {
    acquire(ownerId: string) {
      const normalizedOwner = String(ownerId || '').trim() || 'world-stage'
      if (active) {
        return {
          acquired: false,
          ownerId: normalizedOwner,
          blockedBy: active.ownerId,
          release: () => {},
        }
      }

      const token = Symbol(normalizedOwner)
      active = { ownerId: normalizedOwner, token }
      let released = false

      return {
        acquired: true,
        ownerId: normalizedOwner,
        blockedBy: null,
        release: () => {
          if (released) return
          released = true
          if (active?.token === token) active = null
        },
      }
    },
    activeOwner() {
      return active?.ownerId ?? null
    },
  }
}

/**
 * Process-local ownership boundary for the DNA renderer.
 *
 * Exactly one mounted WorldStage may own a Pixi Application at a time. A second
 * mount fails closed instead of creating another ticker/canvas that can fight
 * the active scene. Rendering technology stays outside this registry.
 */
export const worldRuntimeRegistry = createWorldRuntimeRegistry()
