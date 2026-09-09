import { create } from "zustand";

export type DetailPanelId = "activity";

export const DETAIL_PANEL_META: Record<
  DetailPanelId,
  { label: string; title: string; disabled?: boolean }
> = {
  activity: { label: "Activity", title: "Activity Timeline" },
};

/** Rail order under Wingz. Insights live inside Wingz as a tab. */
export const DETAIL_PANEL_RAIL_ORDER: DetailPanelId[] = ["activity"];

type DetailPanelsState = {
  openId: DetailPanelId | null;
  open: (id: DetailPanelId) => void;
  toggle: (id: DetailPanelId) => void;
  close: () => void;
};

/**
 * Side panels opened from the detail utility rail (Activity).
 * Session-only. Panel width is shared via `useSidePanelWidthStore` when docked.
 * The Activity overview popover is an overlay and does not dismiss Wingz / Quick View.
 */
export const useDetailPanelsStore = create<DetailPanelsState>((set, get) => ({
  openId: null,

  open: (id) => {
    if (DETAIL_PANEL_META[id].disabled) return;
    set({ openId: id });
  },

  toggle: (id) => {
    if (DETAIL_PANEL_META[id].disabled) return;
    if (get().openId === id) set({ openId: null });
    else get().open(id);
  },

  close: () => set({ openId: null }),
}));
