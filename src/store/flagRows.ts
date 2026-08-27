import { useMemo } from "react";
import { create } from "zustand";
import { FEATURE_FLAGS, type FeatureFlag } from "../data/featureFlags";

type FlagRowsState = {
  deletedIds: string[];
  remove: (ids: string[]) => void;
};

export const useFlagRowsStore = create<FlagRowsState>((set) => ({
  deletedIds: [],
  remove: (ids) =>
    set((s) => ({
      deletedIds: [...new Set([...s.deletedIds, ...ids])],
    })),
}));

/** Stable list reference unless deletions change — avoids table selection loops. */
export function useVisibleFeatureFlags(): FeatureFlag[] {
  const deletedIds = useFlagRowsStore((s) => s.deletedIds);
  return useMemo(() => {
    const deleted = new Set(deletedIds);
    return FEATURE_FLAGS.filter((f) => !deleted.has(f.id));
  }, [deletedIds]);
}
