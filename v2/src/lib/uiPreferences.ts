export const UI_PREFERENCES_VERSION = '1.2' as const
export const UI_PREFERENCES_STORAGE_KEY = 'qvanix.ui.preferences.v1' as const

export type UiTheme = 'core' | 'horizon' | 'carbon' | 'aurora' | 'minimal' | 'amoled'
export type UiDensity = 'compact' | 'balanced' | 'focus'
export type UiMotion = 'full' | 'reduced' | 'off'
export type UiDetail = 'simple' | 'detailed'
export type UiWorkspace = 'board' | 'portfolio' | 'analytics' | 'income' | 'goals' | 'dna'

export type UiModuleId =
  | 'portfolio.value'
  | 'portfolio.pnl'
  | 'analytics.twr'
  | 'analytics.xirr'
  | 'analytics.health'
  | 'analytics.risk'
  | 'income.fact'
  | 'income.next'
  | 'macro.keyRate'

export type UiPreferences = {
  version: typeof UI_PREFERENCES_VERSION
  theme: UiTheme
  density: UiDensity
  motion: UiMotion
  detail: UiDetail
  defaultWorkspace: UiWorkspace
  pinnedModules: UiModuleId[]
}

export type UiPreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const THEMES = new Set<UiTheme>(['core', 'horizon', 'carbon', 'aurora', 'minimal', 'amoled'])
const DENSITIES = new Set<UiDensity>(['compact', 'balanced', 'focus'])
const MOTION = new Set<UiMotion>(['full', 'reduced', 'off'])
const DETAILS = new Set<UiDetail>(['simple', 'detailed'])
const WORKSPACES = new Set<UiWorkspace>(['board', 'portfolio', 'analytics', 'income', 'goals', 'dna'])
const MODULES = new Set<UiModuleId>([
  'portfolio.value', 'portfolio.pnl', 'analytics.twr', 'analytics.xirr', 'analytics.health', 'analytics.risk', 'income.fact', 'income.next', 'macro.keyRate',
])

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  version: UI_PREFERENCES_VERSION,
  theme: 'core',
  density: 'balanced',
  motion: 'full',
  detail: 'detailed',
  defaultWorkspace: 'board',
  pinnedModules: ['portfolio.value', 'portfolio.pnl', 'analytics.twr', 'analytics.health', 'income.fact', 'macro.keyRate'],
}

function enumValue<T extends string>(value: unknown, allowed: Set<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? value as T : fallback
}

function normalizeModules(value: unknown): UiModuleId[] {
  if (!Array.isArray(value)) return [...DEFAULT_UI_PREFERENCES.pinnedModules]
  const result: UiModuleId[] = []
  for (const item of value) {
    if (typeof item !== 'string' || !MODULES.has(item as UiModuleId)) continue
    const module = item as UiModuleId
    if (!result.includes(module)) result.push(module)
    if (result.length >= 6) break
  }
  return result.length ? result : [...DEFAULT_UI_PREFERENCES.pinnedModules]
}

export function normalizeUiPreferences(value: unknown): UiPreferences {
  if (!value || typeof value !== 'object') return { ...DEFAULT_UI_PREFERENCES, pinnedModules: [...DEFAULT_UI_PREFERENCES.pinnedModules] }
  const row = value as Record<string, unknown>
  return {
    version: UI_PREFERENCES_VERSION,
    theme: enumValue(row.theme, THEMES, DEFAULT_UI_PREFERENCES.theme),
    density: enumValue(row.density, DENSITIES, DEFAULT_UI_PREFERENCES.density),
    motion: enumValue(row.motion, MOTION, DEFAULT_UI_PREFERENCES.motion),
    detail: enumValue(row.detail, DETAILS, DEFAULT_UI_PREFERENCES.detail),
    defaultWorkspace: enumValue(row.defaultWorkspace, WORKSPACES, DEFAULT_UI_PREFERENCES.defaultWorkspace),
    pinnedModules: normalizeModules(row.pinnedModules),
  }
}

export function loadUiPreferences(storage?: UiPreferenceStorage | null): UiPreferences {
  if (!storage) return normalizeUiPreferences(null)
  try { const raw = storage.getItem(UI_PREFERENCES_STORAGE_KEY); if (!raw) return normalizeUiPreferences(null); return normalizeUiPreferences(JSON.parse(raw)) } catch { return normalizeUiPreferences(null) }
}

export function saveUiPreferences(preferences: UiPreferences, storage?: UiPreferenceStorage | null): UiPreferences {
  const normalized = normalizeUiPreferences(preferences)
  if (!storage) return normalized
  try { storage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized)) } catch { /* UI preference persistence is best-effort. */ }
  return normalized
}

export function clearUiPreferences(storage?: UiPreferenceStorage | null) {
  if (!storage) return
  try { storage.removeItem(UI_PREFERENCES_STORAGE_KEY) } catch { /* Non-essential presentation state. */ }
}
