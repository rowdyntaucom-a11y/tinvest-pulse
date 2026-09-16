import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/features/navigation/navigation.css', import.meta.url), 'utf8')
const nav = readFileSync(new URL('../src/features/navigation/navigationModel.ts', import.meta.url), 'utf8')

assert.match(nav, /id:\s*["']dna["']/, 'DNA must remain a primary navigation destination')
assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/, 'portrait rail must preserve five readable ordinary destinations')
assert.match(css, /\.mobile-primary-nav button:last-child\{position:absolute;z-index:112;/, 'DNA must own an explicit portrait hit layer')
assert.match(css, /min-width:72px;min-height:48px/, 'DNA touch target must remain at least 44px in both dimensions')
assert.match(css, /pointer-events:auto;touch-action:manipulation/, 'DNA must remain explicitly touchable')
assert.match(css, /\.qv-personalize\{right:auto;left:10px;/, 'portrait personalization control must stay away from DNA on the right')
assert.match(css, /grid-template-rows:repeat\(6,1fr\)/, 'landscape must retain all six destinations')

console.log('dna mobile navigation regression: ok')
