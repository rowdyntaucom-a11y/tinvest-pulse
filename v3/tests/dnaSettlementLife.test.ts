import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/dna/V3WorldStage.tsx', import.meta.url), 'utf8')

assert.match(source, /world:settlement-life'/)
assert.match(source, /world:settlement-life-glow'/)
assert.match(source, /settlementLifeGlow\.alpha = \.82/)
assert.match(source, /settlementLifeGlow\.alpha = \.72 \+ Math\.sin/)
assert.equal((source.match(/next\.ticker\.add\(/g) ?? []).length, 1)
assert.doesNotMatch(source, /new Application\(/)

console.log('dnaSettlementLife regression passed')
