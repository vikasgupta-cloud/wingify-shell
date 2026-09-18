import { create } from "zustand";
import {
  CONCEPT_TESTS,
  type ConceptTest,
  type ConceptTestStatus,
} from "../data/conceptTests";

type ConceptTestRowsState = {
  deletedIds: string[];
  statusOverrides: Record<string, ConceptTestStatus>;
  nameOverrides: Record<string, string>;
  remove: (ids: string[]) => void;
  setStatus: (id: string, status: ConceptTestStatus) => void;
  rename: (id: string, name: string) => void;
};

export const useConceptTestRowsStore = create<ConceptTestRowsState>((set) => ({
  deletedIds: [],
  statusOverrides: {},
  nameOverrides: {},
  remove: (ids) =>
    set((s) => ({
      deletedIds: [...new Set([...s.deletedIds, ...ids])],
    })),
  setStatus: (id, status) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [id]: status },
    })),
  rename: (id, name) =>
    set((s) => ({
      nameOverrides: { ...s.nameOverrides, [id]: name },
    })),
}));

export function useVisibleConceptTests(): ConceptTest[] {
  const deletedIds = useConceptTestRowsStore((s) => s.deletedIds);
  const statusOverrides = useConceptTestRowsStore((s) => s.statusOverrides);
  const nameOverrides = useConceptTestRowsStore((s) => s.nameOverrides);
  const deleted = new Set(deletedIds);
  return CONCEPT_TESTS.filter((s) => !deleted.has(s.id)).map((s) => ({
    ...s,
    status: statusOverrides[s.id] ?? s.status,
    name: nameOverrides[s.id] ?? s.name,
  }));
}
