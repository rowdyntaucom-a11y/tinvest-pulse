import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const worldSourceDir = new URL('../src/features/world/', import.meta.url)
const sourceFiles = readdirSync(worldSourceDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && ['.ts', '.tsx'].includes(extname(entry.name)))
  .map((entry) => entry.name)

assert.ok(sourceFiles.length > 0, 'Living World source scan must include TypeScript files')

for (const filename of sourceFiles) {
  const source = readFileSync(join(worldSourceDir.pathname, filename), 'utf8')
  assert.equal(
    /\bAssets\s*\.\s*load\s*\(/.test(source),
    false,
    `${filename} must not use Pixi Assets.load(); use browser-native loadWorldAssetEntries(...) and caller-owned Sprite.from(...) instead`,
  )
}

console.log('world Pixi loader boundary regression passed')
