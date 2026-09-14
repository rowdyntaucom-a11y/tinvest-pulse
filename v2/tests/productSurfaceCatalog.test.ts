import assert from 'node:assert/strict'
import { getAccessPolicy, type ProductCapability } from '../src/lib/accessPolicy.ts'
import { PRODUCT_SURFACES, getMinimumPlan, getPlanSurfaces, getProductSurface } from '../src/lib/productSurfaceCatalog.ts'

const allCapabilities = new Set<ProductCapability>([
  ...getAccessPolicy('PRO').capabilities,
])

assert.equal(PRODUCT_SURFACES.length, allCapabilities.size, 'every accepted capability must have exactly one canonical product surface')
assert.equal(new Set(PRODUCT_SURFACES.map(surface => surface.capability)).size, PRODUCT_SURFACES.length, 'capabilities must not be duplicated across canonical surfaces')

for (const capability of allCapabilities) {
  const surface = getProductSurface(capability)
  assert.ok(surface, `missing canonical surface for ${capability}`)
  assert.ok(surface!.title.trim().length > 0)
  assert.ok(surface!.summary.trim().length > 0)
}

const baseCapabilities = getAccessPolicy('BASE').capabilities
const baseSurfaces = getPlanSurfaces('BASE')
const proSurfaces = getPlanSurfaces('PRO')

assert.equal(baseSurfaces.length, baseCapabilities.size)
assert.equal(proSurfaces.length, allCapabilities.size)

for (const surface of PRODUCT_SURFACES) {
  assert.equal(getMinimumPlan(surface.capability), baseCapabilities.has(surface.capability) ? 'BASE' : 'PRO')
}

assert.equal(getProductSurface('analytics.bondsAdvanced')?.workspace, 'portfolio')
assert.equal(getProductSurface('income.taxTools')?.workspace, 'income')
assert.equal(getProductSurface('terminal.screeners')?.workspace, 'terminal')

console.log('product surface catalog regression: ok')
