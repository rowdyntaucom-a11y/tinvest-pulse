import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css=readFileSync(new URL('../src/boardMobileReadingFloor.css',import.meta.url),'utf8')
const main=readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
assert.match(css,/@media \(max-width: 620px\)/)
assert.match(css,/\.qv-board__lens-tabs button\s*\{[^}]*min-height:\s*44px[^}]*font-size:\s*10px/s)
assert.match(css,/\.qv-board__lens-open\s*\{[^}]*min-height:\s*44px[^}]*font-size:\s*10px/s)
assert.match(css,/\.qv-board-card > span,\s*\.qv-board-card > small\s*\{[^}]*font-size:\s*10px/s)
assert.match(css,/\.qv-board__rail span,\s*\.qv-board__rail small\s*\{[^}]*font-size:\s*10px/s)
assert.match(css,/@media \(max-width: 380px\)[\s\S]*?\.qv-board__rail article:nth-child\(3\)\s*\{\s*display:\s*block/s)
assert.ok(main.lastIndexOf("import './boardMobileReadingFloor.css'") > main.lastIndexOf("import './mobileControlLayer.css'"),'Board reading floor must load after legacy mobile layers')
console.log('Board mobile reading floor regression: ok')
