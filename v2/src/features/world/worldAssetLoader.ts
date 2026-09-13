export const WORLD_ASSET_LOADER_VERSION = '0.1' as const

export type LoadableWorldAssetEntry = {
  slotId: string
  assetPath: string
}

export type WorldAssetLoadFailure = {
  slotId: string
  assetPath: string
  reason: 'LOAD_FAILED' | 'EMPTY_ASSET'
}

export type WorldAssetLoadResult<T> = {
  version: typeof WORLD_ASSET_LOADER_VERSION
  loaded: ReadonlyMap<string, T>
  failures: readonly WorldAssetLoadFailure[]
}

/**
 * Loads already-resolved reviewed assets without allowing one broken file to
 * abort the Living World renderer. Validation/provenance stays owned by the
 * asset manifest; this boundary only performs deterministic per-slot loading.
 */
export async function loadWorldAssetEntries<T>(
  entries: Iterable<LoadableWorldAssetEntry>,
  load: (assetPath: string) => Promise<T | null | undefined>,
): Promise<WorldAssetLoadResult<T>> {
  const ordered = [...entries].sort((a, b) => a.slotId.localeCompare(b.slotId))
  const loaded = new Map<string, T>()
  const failures: WorldAssetLoadFailure[] = []

  for (const entry of ordered) {
    try {
      const asset = await load(entry.assetPath)
      if (asset == null) {
        failures.push({ slotId: entry.slotId, assetPath: entry.assetPath, reason: 'EMPTY_ASSET' })
        continue
      }
      loaded.set(entry.slotId, asset)
    } catch {
      failures.push({ slotId: entry.slotId, assetPath: entry.assetPath, reason: 'LOAD_FAILED' })
    }
  }

  return {
    version: WORLD_ASSET_LOADER_VERSION,
    loaded,
    failures,
  }
}
