import { useMemo } from "react";
import { create } from "zustand";
import {
  RECOMMENDATIONS,
  makeRecommendation,
  type Recommendation,
  type RecommendationStatus,
} from "../data/recommendations";

type RecommendationRowsState = {
  extras: Recommendation[];
  overrides: Record<string, Partial<Recommendation>>;
  archivedIds: string[];
  deletedIds: string[];
  create: (partial?: Partial<Recommendation>) => string;
  update: (id: string, patch: Partial<Recommendation>) => void;
  archive: (ids: string[]) => void;
  remove: (ids: string[]) => void;
  setStatus: (id: string, status: RecommendationStatus) => void;
  removeTag: (id: string, tag: string) => void;
};

function listRecommendations(
  s: Pick<
    RecommendationRowsState,
    "extras" | "overrides" | "archivedIds" | "deletedIds"
  >
): Recommendation[] {
  const hidden = new Set([...s.archivedIds, ...s.deletedIds]);
  const byId = new Map<string, Recommendation>();

  for (const row of RECOMMENDATIONS) {
    if (hidden.has(row.id)) continue;
    byId.set(row.id, { ...row, ...s.overrides[row.id] });
  }
  for (const row of s.extras) {
    if (hidden.has(row.id)) continue;
    byId.set(row.id, { ...row, ...s.overrides[row.id] });
  }

  return [...byId.values()];
}

export const useRecommendationRowsStore = create<RecommendationRowsState>(
  (set, get) => ({
    extras: [],
    overrides: {},
    archivedIds: [],
    deletedIds: [],

    create: (partial) => {
      const row = makeRecommendation(partial);
      set((s) => ({ extras: [row, ...s.extras] }));
      return row.id;
    },

    update: (id, patch) =>
      set((s) => ({
        overrides: {
          ...s.overrides,
          [id]: {
            ...s.overrides[id],
            ...patch,
            lastEdit: new Date().toISOString(),
          },
        },
      })),

    archive: (ids) =>
      set((s) => ({
        archivedIds: [...new Set([...s.archivedIds, ...ids])],
      })),

    remove: (ids) =>
      set((s) => ({
        deletedIds: [...new Set([...s.deletedIds, ...ids])],
        extras: s.extras.filter((r) => !ids.includes(r.id)),
      })),

    setStatus: (id, status) => get().update(id, { status }),

    removeTag: (id, tag) => {
      const row = listRecommendations(get()).find((r) => r.id === id);
      if (!row) return;
      get().update(id, { tags: row.tags.filter((t) => t !== tag) });
    },
  })
);

export function useVisibleRecommendations(): Recommendation[] {
  const extras = useRecommendationRowsStore((s) => s.extras);
  const overrides = useRecommendationRowsStore((s) => s.overrides);
  const archivedIds = useRecommendationRowsStore((s) => s.archivedIds);
  const deletedIds = useRecommendationRowsStore((s) => s.deletedIds);
  return useMemo(
    () => listRecommendations({ extras, overrides, archivedIds, deletedIds }),
    [extras, overrides, archivedIds, deletedIds]
  );
}
