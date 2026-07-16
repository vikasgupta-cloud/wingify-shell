import { create } from "zustand";
import { CAMPAIGNS, type Campaign, type CampaignStatus } from "../data/campaigns";

// NOTE: In-memory row overrides. This stands in for a real backend — archive,
// delete, and status changes are session-only, so a reload restores all 40 rows.
type RowsState = {
  archivedIds: string[];
  deletedIds: string[];
  statusOverrides: Record<string, CampaignStatus>;
  archive: (ids: string[]) => void;
  remove: (ids: string[]) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
};

export const useRowsStore = create<RowsState>((set) => ({
  archivedIds: [],
  deletedIds: [],
  statusOverrides: {},
  archive: (ids) =>
    set((s) => ({
      archivedIds: [...new Set([...s.archivedIds, ...ids])],
    })),
  remove: (ids) =>
    set((s) => ({
      deletedIds: [...new Set([...s.deletedIds, ...ids])],
    })),
  setStatus: (id, status) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [id]: status },
    })),
}));

export function useVisibleCampaigns(): Campaign[] {
  const archivedIds = useRowsStore((s) => s.archivedIds);
  const deletedIds = useRowsStore((s) => s.deletedIds);
  const statusOverrides = useRowsStore((s) => s.statusOverrides);
  const hidden = new Set([...archivedIds, ...deletedIds]);
  return CAMPAIGNS.filter((c) => !hidden.has(c.id)).map((c) =>
    statusOverrides[c.id] ? { ...c, status: statusOverrides[c.id] } : c
  );
}
