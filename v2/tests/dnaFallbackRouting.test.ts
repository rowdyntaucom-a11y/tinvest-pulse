import assert from 'node:assert/strict'
import { resolveWorkspacePresentation } from '../src/features/navigation/workspacePresentation.ts'

for (const status of ['LOADING', 'FALLBACK', 'ERROR', 'LIVE'] as const) {
  assert.equal(
    resolveWorkspacePresentation('dna', status),
    'DNA',
    `DNA must remain reachable while portfolio status is ${status}`,
  )
}

assert.equal(resolveWorkspacePresentation('board', 'LOADING'), 'LOADING')
assert.equal(resolveWorkspacePresentation('portfolio', 'FALLBACK'), 'UNAVAILABLE')
assert.equal(resolveWorkspacePresentation('analytics', 'ERROR'), 'UNAVAILABLE')
assert.equal(resolveWorkspacePresentation('income', 'LIVE'), 'DATA')

console.log('DNA fallback routing policy regression: ok')
