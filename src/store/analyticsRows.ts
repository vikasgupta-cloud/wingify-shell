import { create } from "zustand";

/** Session-only board/report name overrides (dummy data has no backend). */
type AnalyticsRowsState = {
  nameOverrides: Record<string, string>;
  rename: (id: string, name: string) => void;
};

export const useAnalyticsRowsStore = create<AnalyticsRowsState>((set) => ({
  nameOverrides: {},
  rename: (id, name) =>
    set((s) => ({
      nameOverrides: { ...s.nameOverrides, [id]: name },
    })),
}));
