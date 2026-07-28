import { create } from "zustand";
import { useWandzStore } from "./wandz";
import { useQuickViewStore } from "./quickView";

export type DetailPanelId = "suggestions" | "comments" | "activity";

export const DETAIL_PANEL_META: Record<
  DetailPanelId,
  { label: string; title: string; disabled?: boolean }
> = {
  comments: { label: "Chat", title: "Activity Timeline" },
  activity: { label: "Activity", title: "Activity Timeline" },
  suggestions: { label: "Wandz AI Insights", title: "Wandz AI Insights" },
};

/** Rail order under Wandz: Chat → Activity → Insights. */
export const DETAIL_PANEL_RAIL_ORDER: DetailPanelId[] = [
  "comments",
  "activity",
  "suggestions",
];

type DetailPanelsState = {
  openId: DetailPanelId | null;
  open: (id: DetailPanelId) => void;
  toggle: (id: DetailPanelId) => void;
  close: () => void;
};

/**
 * Side panels opened from the detail utility rail (Chat / Activity /
 * Insights). Mutually exclusive with Wandz and Quick View. Session-only.
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
