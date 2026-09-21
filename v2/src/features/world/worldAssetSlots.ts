import type { WorldSceneLayer } from './worldSceneLayers'

export const WORLD_ASSET_SLOT_VERSION = '0.1' as const

export type WorldAssetSlot = {
  id: string
  layer: WorldSceneLayer
  labelRu: string
}

/**
 * Stable integration slots for the already-approved Living World composition.
 * These ids describe where reviewed assets belong; they do not select files,
 * colors, animation names, weather reactions or XP-driven intensity.
 */
export const WORLD_ASSET_SLOTS = [
  { id: 'background.sky', layer: 'background', labelRu: 'НЕБО' },
  { id: 'background.mountains', layer: 'background', labelRu: 'ГОРЫ' },
  { id: 'background.forest', layer: 'background', labelRu: 'ЛЕС' },
  { id: 'background.distant-settlement', layer: 'background', labelRu: 'ДАЛЬНЕЕ ПОСЕЛЕНИЕ' },
  { id: 'atmosphere.depth', layer: 'atmosphere', labelRu: 'АТМОСФЕРНАЯ ГЛУБИНА' },
  { id: 'terrain.ground', layer: 'terrain', labelRu: 'РЕЛЬЕФ' },
  { id: 'terrain.mine-entrance', layer: 'terrain', labelRu: 'ВХОД В ШАХТУ' },
  { id: 'structures.workshop', layer: 'structures', labelRu: 'МАСТЕРСКАЯ' },
  { id: 'structures.storage', layer: 'structures', labelRu: 'СКЛАД' },
  { id: 'structures.construction', layer: 'structures', labelRu: 'СТРОЙКА' },
  { id: 'actors.hero-wanderer', layer: 'actors', labelRu: 'СТРАННИК' },
  { id: 'actors.workers', layer: 'actors', labelRu: 'РАБОЧИЕ' },
  { id: 'actors.residents', layer: 'actors', labelRu: 'ЖИТЕЛИ' },
  { id: 'logistics.rails', layer: 'logistics', labelRu: 'РЕЛЬСЫ' },
  { id: 'logistics.carts', layer: 'logistics', labelRu: 'ВАГОНЕТКИ' },
  { id: 'logistics.materials', layer: 'logistics', labelRu: 'МАТЕРИАЛЫ' },
  { id: 'effects.work-lights', layer: 'effects', labelRu: 'РАБОЧИЙ СВЕТ' },
  { id: 'effects.smoke-steam', layer: 'effects', labelRu: 'ДЫМ И ПАР' },
  { id: 'effects.crystals', layer: 'effects', labelRu: 'КРИСТАЛЛЫ' },
] as const satisfies readonly WorldAssetSlot[]

export type WorldAssetSlotId = (typeof WORLD_ASSET_SLOTS)[number]['id']

export function worldAssetSlot(id: WorldAssetSlotId) {
  return WORLD_ASSET_SLOTS.find(slot => slot.id === id) ?? null
}

export function worldAssetSlotsForLayer(layer: WorldSceneLayer) {
  return WORLD_ASSET_SLOTS.filter(slot => slot.layer === layer)
}
