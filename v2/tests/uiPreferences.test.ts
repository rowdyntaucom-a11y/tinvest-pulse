import assert from 'node:assert/strict'
import {
  clearUiPreferences,
  DEFAULT_UI_PREFERENCES,
  loadUiPreferences,
  normalizeUiPreferences,
  saveUiPreferences,
  UI_PREFERENCES_STORAGE_KEY,
  UI_PREFERENCES_VERSION,
  type UiPreferenceStorage,
} from '../src/lib/uiPreferences.ts'

function memoryStorage(initial: Record<string, string> = {}): UiPreferenceStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem(key) { return data.get(key) ?? null },
    setItem(key, value) { data.set(key, value) },
    removeItem(key) { data.delete(key) },
  }
}

const defaults = normalizeUiPreferences(null)
assert.equal(defaults.version, UI_PREFERENCES_VERSION)
assert.equal(defaults.version, '1.2')
assert.equal(defaults.theme, 'core')
assert.equal(defaults.density, 'balanced')
assert.equal(defaults.motion, 'full')
assert.equal(defaults.detailMode, 'detailed')
assert.equal(defaults.defaultWorkspace, 'board')
assert.deepEqual(defaults.pinnedModules, DEFAULT_UI_PREFERENCES.pinnedModules)
assert.notEqual(defaults.pinnedModules, DEFAULT_UI_PREFERENCES.pinnedModules)

const normalized = normalizeUiPreferences({
  version: '1.0', theme: 'horizon', density: 'compact', motion: 'reduced', detailMode: 'simple', defaultWorkspace: 'analytics',
  pinnedModules: ['analytics.risk','analytics.risk','income.fact','unknown.module','portfolio.value','macro.keyRate','analytics.twr','income.next','portfolio.pnl'],
})
assert.equal(normalized.version, '1.2')
assert.equal(normalized.theme, 'horizon')
assert.equal(normalized.density, 'compact')
assert.equal(normalized.motion, 'reduced')
assert.equal(normalized.detailMode, 'simple')
assert.equal(normalized.defaultWorkspace, 'analytics')
assert.deepEqual(normalized.pinnedModules, ['analytics.risk','income.fact','portfolio.value','macro.keyRate','analytics.twr','income.next'])

const board = normalizeUiPreferences({ defaultWorkspace: 'board', pinnedModules: ['portfolio.value'] })
assert.equal(board.defaultWorkspace, 'board')
assert.deepEqual(board.pinnedModules, ['portfolio.value'])

const invalid = normalizeUiPreferences({ theme: 'neon-random', density: 'ultra', motion: 'warp', detailMode: 'noisy', defaultWorkspace: 'terminal', pinnedModules: ['wrong'] })
assert.equal(invalid.theme, DEFAULT_UI_PREFERENCES.theme)
assert.equal(invalid.density, DEFAULT_UI_PREFERENCES.density)
assert.equal(invalid.motion, DEFAULT_UI_PREFERENCES.motion)
assert.equal(invalid.detailMode, DEFAULT_UI_PREFERENCES.detailMode)
assert.equal(invalid.defaultWorkspace, DEFAULT_UI_PREFERENCES.defaultWorkspace)
assert.deepEqual(invalid.pinnedModules, DEFAULT_UI_PREFERENCES.pinnedModules)

const storage = memoryStorage()
const saved = saveUiPreferences({ version: UI_PREFERENCES_VERSION, theme: 'carbon', density: 'focus', motion: 'off', detailMode: 'simple', defaultWorkspace: 'income', pinnedModules: ['income.fact', 'income.next'] }, storage)
assert.equal(saved.theme, 'carbon')
assert.equal(saved.detailMode, 'simple')
assert.ok(storage.data.has(UI_PREFERENCES_STORAGE_KEY))
assert.deepEqual(loadUiPreferences(storage), saved)

const amoled = saveUiPreferences({ ...saved, theme: 'amoled' }, storage)
assert.equal(amoled.theme, 'amoled')
assert.equal(loadUiPreferences(storage).theme, 'amoled')

storage.data.set(UI_PREFERENCES_STORAGE_KEY, '{not-json')
assert.deepEqual(loadUiPreferences(storage), defaults)
storage.data.set(UI_PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: 'aurora', density: 'balanced', motion: 'full', defaultWorkspace: 'dna', pinnedModules: ['portfolio.value'] }))
assert.equal(loadUiPreferences(storage).theme, 'aurora')
assert.equal(loadUiPreferences(storage).defaultWorkspace, 'dna')

clearUiPreferences(storage)
assert.equal(storage.data.has(UI_PREFERENCES_STORAGE_KEY), false)
const throwingStorage: UiPreferenceStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }
assert.deepEqual(loadUiPreferences(throwingStorage), defaults)
assert.equal(saveUiPreferences(defaults, throwingStorage).theme, 'core')
clearUiPreferences(throwingStorage)
console.log('ui preferences regression: ok')
