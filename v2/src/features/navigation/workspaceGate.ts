import type { DataTrustStatus } from "../../lib/dataTrust";
import type { UiWorkspace } from "../../lib/uiPreferences";

export type WorkspaceGate = "WORKSPACE" | "LOADING" | "UNAVAILABLE";

export function resolveWorkspaceGate(workspace: UiWorkspace, portfolioStatus: DataTrustStatus): WorkspaceGate {
  if (workspace === "dna") return "WORKSPACE";
  if (portfolioStatus === "LOADING") return "LOADING";
  if (portfolioStatus === "FALLBACK" || portfolioStatus === "ERROR") return "UNAVAILABLE";
  return "WORKSPACE";
}
