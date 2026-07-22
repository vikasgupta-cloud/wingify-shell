import { create } from "zustand";
import { useWandzStore } from "./wandz";

// Which campaign's Quick view panel is open. In-memory only — NOT persisted, so a
// reload starts with the panel closed. WebExperimentation wires close() into layout
// and filter/search/group changes so the panel never lingers on stale content.
type QuickViewState = {
  openId: string | null;
  open: (id: string) => void;
  toggle: (id: string) => void;
  close: () => void;
  setId: (id: string) => void;
};

export const useQuickViewStore = create<QuickViewState>((set, get) => ({
  openId: null,
  // Mutual exclusion with the Wandz panel — opening one closes the other. Called
  // via getState() at runtime (not a top-level use) to keep the import cycle safe.
  open: (id) => {
    useWandzStore.getState().closeWandz();
    set({ openId: id });
  },
  // Clicking the same campaign's Quick view icon again closes the panel.
  toggle: (id) => {
    if (get().openId === id) set({ openId: null });
    else get().open(id);
  },
  close: () => set({ openId: null }),
  setId: (id) => set({ openId: id }),
}));
