/** Session name overrides for dummy entity lists (e.g. Tech Debt). */

import { create } from "zustand";

type EntityNameOverridesState = {
  /** Keyed as `${basePath}::${id}` */
  nameOverrides: Record<string, string>;
  rename: (basePath: string, id: string, name: string) => void;
};

export function entityNameKey(basePath: string, id: string) {
  return `${basePath}::${id}`;
}

export const useEntityNameOverridesStore = create<EntityNameOverridesState>(
  (set) => ({
    nameOverrides: {},
    rename: (basePath, id, name) =>
      set((s) => ({
        nameOverrides: {
          ...s.nameOverrides,
          [entityNameKey(basePath, id)]: name,
        },
      })),
  })
);
