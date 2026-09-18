/** Feature flag rows — deletions + session name overrides. */

import { useMemo } from "react";
import { create } from "zustand";
import { FEATURE_FLAGS, type FeatureFlag } from "../data/featureFlags";

type FlagRowsState = {
  deletedIds: string[];
  nameOverrides: Record<string, string>;
  remove: (ids: string[]) => void;
  rename: (id: string, name: string) => void;
};

export const useFlagRowsStore = create<FlagRowsState>((set) => ({
  deletedIds: [],
  nameOverrides: {},
  remove: (ids) =>
    set((s) => ({
      deletedIds: [...new Set([...s.deletedIds, ...ids])],
    })),
  rename: (id, name) =>
    set((s) => ({
      nameOverrides: { ...s.nameOverrides, [id]: name },
    })),
}));

/** Stable list reference unless deletions/overrides change. */
export function useVisibleFeatureFlags(): FeatureFlag[] {
  const deletedIds = useFlagRowsStore((s) => s.deletedIds);
  const nameOverrides = useFlagRowsStore((s) => s.nameOverrides);
  return useMemo(() => {
    const deleted = new Set(deletedIds);
    return FEATURE_FLAGS.filter((f) => !deleted.has(f.id)).map((f) =>
      nameOverrides[f.id] ? { ...f, name: nameOverrides[f.id] } : f
    );
  }, [deletedIds, nameOverrides]);
}
