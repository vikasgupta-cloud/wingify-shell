/** Get Started workspace — email verification + product selection gate. */

import { getGetStartedLockTooltip } from "@/lib/getStartedGate";
import {
  useActiveWorkspace,
  useGetStartedGateReady,
  useWorkspaceStore,
} from "./workspace";

export function useIsGetStartedUnlocked(): boolean {
  const progress = useWorkspaceStore((s) => s.getStartedProgress);
  return progress.emailVerified && progress.selectedProductPath != null;
}

/** True on Get Started workspace until email is verified and a product is chosen. */
export function useIsGetStartedLocked(): boolean {
  const hydrated = useGetStartedGateReady();
  const gated = useActiveWorkspace().getStartedGate === true;
  const progress = useWorkspaceStore((s) => s.getStartedProgress);
  const unlocked =
    progress.emailVerified && progress.selectedProductPath != null;

  if (!gated) return false;
  if (!hydrated) return true;
  return !unlocked;
}

/** Tooltip for disabled main nav while the Get Started gate is active. */
export function useGetStartedNavLockTooltip(): string | null {
  const navLocked = useIsGetStartedLocked();
  const progress = useWorkspaceStore((s) => s.getStartedProgress);
  if (!navLocked) return null;
  return getGetStartedLockTooltip(progress);
}

export { useGetStartedGateReady, useWorkspaceStore } from "./workspace";
export { useIsGetStartedWorkspace } from "./workspace";
