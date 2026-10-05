import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SHELL_ONBOARDING_VERSION } from "@/config/shellOnboarding";

type ShellOnboardingState = {
  seenVersion: number | null;
  markSeen: () => void;
};

export const useShellOnboardingStore = create<ShellOnboardingState>()(
  persist(
    (set) => ({
      seenVersion: null,
      markSeen: () => set({ seenVersion: SHELL_ONBOARDING_VERSION }),
    }),
    { name: "wingify-shell-onboarding" }
  )
);

export function shouldShowShellOnboarding(seenVersion: number | null): boolean {
  return seenVersion !== SHELL_ONBOARDING_VERSION;
}
