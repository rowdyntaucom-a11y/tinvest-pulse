import assert from 'node:assert/strict'
import fs from 'node:fs'

const stage=fs.readFileSync(new URL('../src/dna/V3WorldStage.tsx',import.meta.url),'utf8')
const exploration=fs.readFileSync(new URL('../src/dna/worldExploration.ts',import.meta.url),'utf8')

assert.match(stage,/world:hero-wanderer/)
assert.match(stage,/world:hero-presence/)
assert.match(stage,/world:hero-cloak/)
assert.match(stage,/hero\.scale\.set\(1\.16\)/)
assert.match(stage,/heroCloak\.rotation = 0/)
assert.match(stage,/heroCloak\.rotation = -0\.018 \+ Math\.sin/)
assert.match(stage,/heroPresence\.alpha = \.72/)
assert.equal((stage.match(/next\.ticker\.add\(/g)||[]).length,1,'wanderer must stay on the single canonical ticker')
assert.equal((stage.match(/new Application\(/g)||[]).length,0,'stage must not create another Pixi Application')
assert.match(exploration,/x:870,y:652/)

console.log('dna wanderer presence regression: ok')
