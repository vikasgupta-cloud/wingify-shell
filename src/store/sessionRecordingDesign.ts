import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionRecordingDesignState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Canvas gap between stage, side panel, and control dock. */
  panelSeparator: boolean;
  setPanelSeparator: (on: boolean) => void;
  reset: () => void;
};

const DEFAULTS = {
  open: false,
  panelSeparator: true,
} as const;

/** Design playground prefs for the session recording player only. */
export const useSessionRecordingDesignStore =
  create<SessionRecordingDesignState>()(
    persist(
      (set) => ({
        ...DEFAULTS,
        setOpen: (open) => set({ open }),
        setPanelSeparator: (panelSeparator) => set({ panelSeparator }),
        reset: () => set({ ...DEFAULTS }),
      }),
      {
        name: "wingify-session-recording-design",
        partialize: (state) => ({
          panelSeparator: state.panelSeparator,
        }),
      }
    )
  );
