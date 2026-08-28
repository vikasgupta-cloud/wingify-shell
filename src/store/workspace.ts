/** Active workspace — drives playground banner visibility app-wide. */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspaceId =
  | "delhi"
  | "bangalore"
  | "demo"
  | "cancellation-revoke"
  | "trial-over"
  | "get-started";

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
  getStartedProgress: GetStartedProgress;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setWorkspaceId: (id: WorkspaceId) => void;
  verifyGetStartedEmail: () => void;
  selectGetStartedProduct: (productPath: string) => void;
  resetGetStartedProgress: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaceId: "delhi",
      getStartedProgress: DEFAULT_GET_STARTED_PROGRESS,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setWorkspaceId: (workspaceId) =>
        set((s) => {
          const enteringGetStarted =
            workspaceId === "get-started" && s.workspaceId !== "get-started";
          return {
            workspaceId,
            ...(enteringGetStarted
              ? { getStartedProgress: DEFAULT_GET_STARTED_PROGRESS }
              : null),
          };
        }),
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

        return {
          ...current,
          ...saved,
          workspaceId:
            saved.workspaceId ?? legacyWorkspaceId ?? current.workspaceId,
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

export function useGetStartedGateReady(): boolean {
  return useWorkspaceStore((s) => s._hasHydrated);
}
