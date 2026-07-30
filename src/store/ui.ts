import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PINNABLE_PATHS } from "../config/navigation";

/** At least this many pinnable products must stay on the main rail (outside More). */
export const MIN_PINNED_PRODUCTS = 2;

export function canUnpinPath(pinnedPaths: string[], path: string): boolean {
  if (!PINNABLE_PATHS.includes(path) || !pinnedPaths.includes(path)) {
    return false;
  }
  return pinnedPaths.length > MIN_PINNED_PRODUCTS;
}

function clampPinned(paths: string[]): string[] {
  const ordered = PINNABLE_PATHS.filter((p) => paths.includes(p));
  if (ordered.length >= MIN_PINNED_PRODUCTS) return ordered;
  const extras = PINNABLE_PATHS.filter((p) => !ordered.includes(p));
  return [...ordered, ...extras].slice(0, MIN_PINNED_PRODUCTS);
}

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
        set((s) => {
          if (!canUnpinPath(s.pinnedPaths, path)) return s;
          return {
            pinnedPaths: s.pinnedPaths.filter((p) => p !== path),
          };
        }),
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
    {
      // Key bumped so stale pin sets below the new floor are re-normalized.
      name: "wingify-ui-v3",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UIState>;
        return {
          ...current,
          ...p,
          pinnedPaths: clampPinned(
            Array.isArray(p.pinnedPaths) ? p.pinnedPaths : current.pinnedPaths
          ),
        };
      },
    }
  )
);
