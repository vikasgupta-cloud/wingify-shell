import { create } from "zustand";
import { useWandzStore } from "./wandz";
import { useQuickViewStore } from "./quickView";

export type DetailPanelId = "activity";

export const DETAIL_PANEL_META: Record<
  DetailPanelId,
  { label: string; title: string; disabled?: boolean }
> = {
  activity: { label: "Activity", title: "Activity Timeline" },
};

/** Rail order under Wandz. Insights live inside Wandz as a tab. */
export const DETAIL_PANEL_RAIL_ORDER: DetailPanelId[] = ["activity"];

type DetailPanelsState = {
  openId: DetailPanelId | null;
  open: (id: DetailPanelId) => void;
  toggle: (id: DetailPanelId) => void;
  close: () => void;
};

/**
 * Side panels opened from the detail utility rail (Activity).
 * Mutually exclusive with Wandz and Quick View. Session-only.
 * Panel width is shared via `useSidePanelWidthStore`.
 */
export const useDetailPanelsStore = create<DetailPanelsState>((set, get) => ({
  openId: null,

  open: (id) => {
    if (DETAIL_PANEL_META[id].disabled) return;
    useWandzStore.getState().closeWandz();
    useQuickViewStore.getState().close();
    set({ openId: id });
  },

  toggle: (id) => {
    if (DETAIL_PANEL_META[id].disabled) return;
    if (get().openId === id) set({ openId: null });
    else get().open(id);
  },

  close: () => set({ openId: null }),
}));
