import { create } from "zustand";
import type { CustomSegmentDef } from "../config/segments";

// Custom segments the user has explicitly SAVED to their library (surfaced in
// the "My Segments" list across every campaign). Session-only, like the rest
// of the config data — a reload clears it.
type CustomSegmentsState = {
  saved: CustomSegmentDef[];
  saveSegment: (def: CustomSegmentDef) => void;
};

export const useCustomSegmentsStore = create<CustomSegmentsState>((set, get) => ({
  saved: [],
  saveSegment: (def) => {
    if (get().saved.some((s) => s.id === def.id)) return;
    set((s) => ({ saved: [...s.saved, def] }));
  },
}));
