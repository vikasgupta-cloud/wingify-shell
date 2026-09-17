/** Active workspace — drives playground banner visibility app-wide. */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspaceId =
  | "delhi"
  | "bangalore"
  | "demo"
  | "cancellation-revoke"
  | "trial-over"
  | "get-started"
  | "old-navigation"
  | "new-rebranding";

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
  /** Lock app to Get Started until email verified + product selected. */
  getStartedGate?: boolean;
  /** Session playground: old-nav label swap in JD menu (chrome unchanged). */
  oldNavigation?: boolean;
  /** Opens the rebranding intro modal whenever this workspace is selected. */
  rebrandingIntro?: boolean;
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
  {
    id: "get-started",
    label: "Get Started",
    triggerLabel: "Get Started",
    getStartedGate: true,
  },
  {
    id: "old-navigation",
    label: "Old navigation",
    triggerLabel: "Old navigation",
    oldNavigation: true,
  },
  {
    id: "new-rebranding",
    label: "New Rebranding",
    triggerLabel: "New Rebranding",
    rebrandingIntro: true,
  },
];

export const PLAYGROUND_WEBSITE_URL = "https://www.wingify.com";

export type GetStartedProgress = {
  emailVerified: boolean;
  selectedProductPath: string | null;
};

const DEFAULT_GET_STARTED_PROGRESS: GetStartedProgress = {
  emailVerified: false,
  selectedProductPath: null,
};

const LEGACY_ONBOARDING_KEY = "wingify-get-started-onboarding";
const LEGACY_WORKSPACE_KEY = "wingify-workspace-v1";

function readLegacyGetStartedProgress(): GetStartedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_ONBOARDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: Partial<GetStartedProgress>;
    };
    if (!parsed.state) return null;
    return {
      emailVerified: parsed.state.emailVerified === true,
      selectedProductPath: parsed.state.selectedProductPath ?? null,
    };
  } catch {
    return null;
  }
}

function readLegacyWorkspaceId(): WorkspaceId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { workspaceId?: WorkspaceId } };
    return parsed.state?.workspaceId ?? null;
  } catch {
    return null;
  }
}

type WorkspaceState = {
  workspaceId: WorkspaceId;
  /** Workspace to restore when leaving Old navigation via JD menu. */
  oldNavReturnWorkspaceId: WorkspaceId | null;
  rebrandingModalOpen: boolean;
  getStartedProgress: GetStartedProgress;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setWorkspaceId: (id: WorkspaceId) => void;
  /** Confirm JD “switch to old nav” — remembers current workspace, then enters old-navigation. */
  enterOldNavigation: () => void;
  /** JD “switch to new nav” — returns to the workspace that led into old-navigation. */
  leaveOldNavigation: () => void;
  setRebrandingModalOpen: (open: boolean) => void;
  verifyGetStartedEmail: () => void;
  selectGetStartedProduct: (productPath: string) => void;
  resetGetStartedProgress: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaceId: "delhi",
      oldNavReturnWorkspaceId: null,
      rebrandingModalOpen: false,
      getStartedProgress: DEFAULT_GET_STARTED_PROGRESS,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setWorkspaceId: (workspaceId) =>
        set((s) => {
          const enteringGetStarted =
            workspaceId === "get-started" && s.workspaceId !== "get-started";
          const enteringOldNav =
            workspaceId === "old-navigation" &&
            s.workspaceId !== "old-navigation";

          return {
            workspaceId,
            rebrandingModalOpen: workspaceId === "new-rebranding",
            ...(enteringOldNav
              ? { oldNavReturnWorkspaceId: s.workspaceId }
              : null),
            ...(enteringGetStarted
              ? { getStartedProgress: DEFAULT_GET_STARTED_PROGRESS }
              : null),
          };
        }),
      enterOldNavigation: () => {
        const { workspaceId } = get();
        if (workspaceId === "old-navigation") return;
        set({
          oldNavReturnWorkspaceId: workspaceId,
          workspaceId: "old-navigation",
          rebrandingModalOpen: false,
        });
      },
      leaveOldNavigation: () => {
        const { oldNavReturnWorkspaceId } = get();
        const target =
          oldNavReturnWorkspaceId &&
          oldNavReturnWorkspaceId !== "old-navigation"
            ? oldNavReturnWorkspaceId
            : "delhi";
        set({
          workspaceId: target,
          oldNavReturnWorkspaceId: null,
          rebrandingModalOpen: target === "new-rebranding",
        });
      },
      setRebrandingModalOpen: (open) => set({ rebrandingModalOpen: open }),
      verifyGetStartedEmail: () =>
        set((s) => ({
          getStartedProgress: {
            ...s.getStartedProgress,
            emailVerified: true,
          },
        })),
      selectGetStartedProduct: (selectedProductPath) =>
        set((s) => ({
          getStartedProgress: {
            ...s.getStartedProgress,
            selectedProductPath,
          },
        })),
      resetGetStartedProgress: () =>
        set({ getStartedProgress: DEFAULT_GET_STARTED_PROGRESS }),
    }),
    {
      name: "wingify-workspace-v2",
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        oldNavReturnWorkspaceId: state.oldNavReturnWorkspaceId,
        getStartedProgress: state.getStartedProgress,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<WorkspaceState>;
        const legacyWorkspaceId = readLegacyWorkspaceId();
        let getStartedProgress: GetStartedProgress = {
          ...DEFAULT_GET_STARTED_PROGRESS,
          ...saved.getStartedProgress,
        };

        const hasV2Store =
          typeof window !== "undefined" &&
          localStorage.getItem("wingify-workspace-v2") != null;

        if (!hasV2Store) {
          const legacy = readLegacyGetStartedProgress();
          if (legacy) {
            getStartedProgress = { ...getStartedProgress, ...legacy };
          }
        }

        const workspaceId =
          saved.workspaceId ?? legacyWorkspaceId ?? current.workspaceId;

        return {
          ...current,
          ...saved,
          workspaceId,
          oldNavReturnWorkspaceId: saved.oldNavReturnWorkspaceId ?? null,
          // Re-open intro whenever persisted workspace is New Rebranding.
          rebrandingModalOpen: workspaceId === "new-rebranding",
          getStartedProgress,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.setHasHydrated(true);
      },
    }
  )
);

useWorkspaceStore.persist.onFinishHydration(() => {
  useWorkspaceStore.getState().setHasHydrated(true);
});

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

export function useIsGetStartedWorkspace(): boolean {
  return useActiveWorkspace().getStartedGate === true;
}

export function useIsOldNavigationWorkspace(): boolean {
  return useActiveWorkspace().oldNavigation === true;
}

export function useGetStartedGateReady(): boolean {
  return useWorkspaceStore((s) => s._hasHydrated);
}
