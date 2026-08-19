import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyFonts,
  DEFAULT_FONT_ASSIGNMENTS,
  resolveFontAssignments,
  type FontId,
  type FontRole,
} from "../config/fonts";

type FontState = {
  assignments: Record<FontRole, FontId>;
  setRoleFont: (role: FontRole, fontId: FontId) => void;
  setAssignments: (assignments: Record<FontRole, FontId>) => void;
  resetFonts: () => void;
};

function syncDom(assignments: Record<FontRole, FontId>) {
  applyFonts(assignments);
}

export const useFontStore = create<FontState>()(
  persist(
    (set, get) => ({
      assignments: { ...DEFAULT_FONT_ASSIGNMENTS },
      setRoleFont: (role, fontId) => {
        const assignments = { ...get().assignments, [role]: fontId };
        syncDom(assignments);
        set({ assignments });
      },
      setAssignments: (next) => {
        const assignments = resolveFontAssignments(next);
        syncDom(assignments);
        set({ assignments });
      },
      resetFonts: () => {
        const assignments = { ...DEFAULT_FONT_ASSIGNMENTS };
        syncDom(assignments);
        set({ assignments });
      },
    }),
    {
      name: "wingify-fonts",
      partialize: (s) => ({ assignments: s.assignments }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FontState>;
        return {
          ...current,
          ...p,
          assignments: resolveFontAssignments(
            p.assignments ?? current.assignments
          ),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        syncDom(resolveFontAssignments(state.assignments));
      },
    }
  )
);
