import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8')
const index = readFileSync(resolve(root, 'index.html'), 'utf8')
const skeleton = readFileSync(resolve(root, 'src/features/board/BoardLoadingSkeleton.tsx'), 'utf8')
const skeletonCss = readFileSync(resolve(root, 'src/features/board/boardLoadingSkeleton.css'), 'utf8')
const trustCss = readFileSync(resolve(root, 'src/features/shared/dataTrustIndicator.css'), 'utf8')

assert.match(app, /BoardLoadingSkeleton/)
assert.match(app, /tab === "board" \? <BoardLoadingSkeleton/)
assert.match(skeleton, /className="qv-board qv-board--loading"/)
assert.match(skeleton, /qv-board__hero/)
assert.match(skeleton, /qv-board__rail/)
assert.match(skeleton, /qv-board__module-grid/)

assert.match(index, /qvanix\.ui\.preferences\.v1/)
assert.match(index, /root\.dataset\.qvTheme/)
assert.match(index, /root\.dataset\.qvDensity/)
assert.match(index, /root\.dataset\.qvMotion/)
assert.match(index, /root\.dataset\.qvDetail/)

assert.match(skeletonCss, /qv-board-loading-pulse/)
assert.match(skeletonCss, /prefers-reduced-motion/)
assert.match(trustCss, /\.topbar \.data-trust\{[\s\S]*min-height:30px/)
assert.match(trustCss, /white-space:nowrap/)

console.log('cold-start layout stability regression checks passed')
