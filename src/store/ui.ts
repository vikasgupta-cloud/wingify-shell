import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PINNABLE_PATHS } from "../config/navigation";

type UIState = {
  /** docked = persistent embedded sub-nav panel; undocked = hover flyout */
  isDocked: boolean;
  /** Only pinnable paths may ever appear here. */
  pinnedPaths: string[];
  toggleDock: () => void;
  unpin: (path: string) => void;
  pin: (path: string) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDocked: false,
      pinnedPaths: [...PINNABLE_PATHS],
      toggleDock: () => set((s) => ({ isDocked: !s.isDocked })),
      unpin: (path) =>
        set((s) =>
          PINNABLE_PATHS.includes(path)
            ? { pinnedPaths: s.pinnedPaths.filter((p) => p !== path) }
            : s
        ),
      pin: (path) =>
        set((s) =>
          !PINNABLE_PATHS.includes(path) || s.pinnedPaths.includes(path)
            ? s
            : // keep NAV order regardless of pin order
              {
                pinnedPaths: PINNABLE_PATHS.filter(
                  (p) => s.pinnedPaths.includes(p) || p === path
                ),
              }
        ),
    }),
    // Key bumped to -v2 so stale persisted state from the old nav model is discarded.
    { name: "wingify-ui-v2" }
  )
);
