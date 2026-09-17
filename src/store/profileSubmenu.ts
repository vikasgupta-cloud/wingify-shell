/** Tracks Language / Notifications popovers so the JD flyout stays open. */
import { create } from "zustand";

type ProfileSubmenuState = {
  openCount: number;
  open: () => void;
  close: () => void;
};

export const useProfileSubmenuStore = create<ProfileSubmenuState>((set) => ({
  openCount: 0,
  open: () => set((s) => ({ openCount: s.openCount + 1 })),
  close: () => set((s) => ({ openCount: Math.max(0, s.openCount - 1) })),
}));

export const PROFILE_SUBMENU_ATTR = "data-profile-submenu";
