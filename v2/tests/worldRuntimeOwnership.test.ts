import assert from 'node:assert/strict'
import { createWorldRuntimeRegistry } from '../src/features/world/worldRuntimeOwnership.ts'

const registry = createWorldRuntimeRegistry()
assert.equal(registry.activeOwner(), null)

const first = registry.acquire('stage-a')
assert.equal(first.acquired, true)
assert.equal(first.blockedBy, null)
assert.equal(registry.activeOwner(), 'stage-a')

const duplicate = registry.acquire('stage-b')
assert.equal(duplicate.acquired, false)
assert.equal(duplicate.blockedBy, 'stage-a')
assert.equal(registry.activeOwner(), 'stage-a')

duplicate.release()
assert.equal(registry.activeOwner(), 'stage-a')

first.release()
assert.equal(registry.activeOwner(), null)

const second = registry.acquire('stage-b')
assert.equal(second.acquired, true)
assert.equal(registry.activeOwner(), 'stage-b')

// A stale/idempotent release from the old owner must never release the new owner.
first.release()
assert.equal(registry.activeOwner(), 'stage-b')

second.release()
second.release()
assert.equal(registry.activeOwner(), null)

const normalized = registry.acquire('   ')
assert.equal(normalized.acquired, true)
assert.equal(normalized.ownerId, 'world-stage')
assert.equal(registry.activeOwner(), 'world-stage')
normalized.release()
assert.equal(registry.activeOwner(), null)

console.log('worldRuntimeOwnership tests passed')
