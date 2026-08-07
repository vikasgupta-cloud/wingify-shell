// Session-only Personalize row overrides (archive / delete / status). Separate from Web Exp.

import { create } from "zustand";
import {
  PERSONALIZATIONS,
  type Personalization,
} from "../data/personalizations";
import type { CampaignStatus } from "../data/campaigns";

type PersonalizeRowsState = {
  archivedIds: string[];
  deletedIds: string[];
  statusOverrides: Record<string, CampaignStatus>;
  archive: (ids: string[]) => void;
  remove: (ids: string[]) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
};

export const usePersonalizeRowsStore = create<PersonalizeRowsState>((set) => ({
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

export function useVisiblePersonalizations(): Personalization[] {
  const archivedIds = usePersonalizeRowsStore((s) => s.archivedIds);
  const deletedIds = usePersonalizeRowsStore((s) => s.deletedIds);
  const statusOverrides = usePersonalizeRowsStore((s) => s.statusOverrides);
  const hidden = new Set([...archivedIds, ...deletedIds]);
  return PERSONALIZATIONS.filter((c) => !hidden.has(c.id)).map((c) =>
    statusOverrides[c.id] ? { ...c, status: statusOverrides[c.id] } : c
  );
}
