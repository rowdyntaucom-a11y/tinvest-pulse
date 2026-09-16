import type { UiWorkspace } from '../../lib/uiPreferences'
import type { DataTrustStatus } from '../../lib/dataTrust'

export type WorkspacePresentation = 'DNA' | 'LOADING' | 'UNAVAILABLE' | 'DATA'

export function resolveWorkspacePresentation(
  workspace: UiWorkspace,
  portfolioStatus: DataTrustStatus,
): WorkspacePresentation {
  if (workspace === 'dna') return 'DNA'
  if (portfolioStatus === 'LOADING') return 'LOADING'
  if (portfolioStatus === 'FALLBACK' || portfolioStatus === 'ERROR') return 'UNAVAILABLE'
  return 'DATA'
}
