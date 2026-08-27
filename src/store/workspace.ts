/** Active workspace — drives playground banner visibility app-wide. */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspaceId =
  | "delhi"
  | "bangalore"
  | "demo"
  | "cancellation-revoke"
  | "trial-over";

export type Workspace = {
  id: WorkspaceId;
  label: string;
  /** Short label shown in the switcher trigger. */
  triggerLabel: string;
  playground?: boolean;
  /** Show TopBar cancellation notice + Revoke CTA. */
  cancellationRevoke?: boolean;
  /** Show TopBar trial expired notice + Upgrade CTA. */
  trialOver?: boolean;
};

export const WORKSPACES: Workspace[] = [
  {
    id: "delhi",
    label: "Wingify Delhi",
    triggerLabel: "Wingify Delhi #4532345",
  },
  {
    id: "bangalore",
    label: "VWO Bangalore team",
    triggerLabel: "VWO Bangalore team",
  },
  {
    id: "demo",
    label: "Demo Workspace",
    triggerLabel: "Demo Workspace",
    playground: true,
  },
  {
    id: "cancellation-revoke",
    label: "Cancellation Revoke",
    triggerLabel: "Cancellation Revoke",
    cancellationRevoke: true,
  },
  {
    id: "trial-over",
    label: "Trial Over",
    triggerLabel: "Trial Over",
    trialOver: true,
  },
];

export const PLAYGROUND_WEBSITE_URL = "https://www.wingify.com";

type WorkspaceState = {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaceId: "delhi",
      setWorkspaceId: (workspaceId) => set({ workspaceId }),
    }),
    { name: "wingify-workspace-v1" }
  )
);

export function useActiveWorkspace(): Workspace {
  const id = useWorkspaceStore((s) => s.workspaceId);
  return WORKSPACES.find((w) => w.id === id) ?? WORKSPACES[0];
}

export function useIsPlaygroundWorkspace(): boolean {
  return useActiveWorkspace().playground === true;
}

export function useIsCancellationRevokeWorkspace(): boolean {
  return useActiveWorkspace().cancellationRevoke === true;
}

export function useIsTrialOverWorkspace(): boolean {
  return useActiveWorkspace().trialOver === true;
}
