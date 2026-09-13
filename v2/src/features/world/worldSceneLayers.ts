export const WORLD_SCENE_LAYER_ORDER = [
  'background',
  'atmosphere',
  'terrain',
  'structures',
  'actors',
  'logistics',
  'effects',
] as const

export type WorldSceneLayer = (typeof WORLD_SCENE_LAYER_ORDER)[number]

export const WORLD_SCENE_LAYER_VERSION = '0.1' as const

export const WORLD_SCENE_LAYER_LABEL_RU: Record<WorldSceneLayer, string> = {
  background: 'ФОН',
  atmosphere: 'АТМОСФЕРА',
  terrain: 'РЕЛЬЕФ',
  structures: 'ПОСТРОЙКИ',
  actors: 'ПЕРСОНАЖИ',
  logistics: 'ЛОГИСТИКА',
  effects: 'ЭФФЕКТЫ',
}

/**
 * Stable renderer layer contract for Living World assets.
 * The order describes z-order only. It deliberately contains no colors, sprites,
 * animation names, financial rules, XP weights or semantic-event routing.
 */
export function worldSceneLayerIndex(layer: WorldSceneLayer) {
  return WORLD_SCENE_LAYER_ORDER.indexOf(layer)
}
