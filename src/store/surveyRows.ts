import { create } from "zustand";
import { SURVEYS, type Survey, type SurveyStatus } from "../data/surveys";

type SurveyRowsState = {
  deletedIds: string[];
  statusOverrides: Record<string, SurveyStatus>;
  remove: (ids: string[]) => void;
  setStatus: (id: string, status: SurveyStatus) => void;
};

export const useSurveyRowsStore = create<SurveyRowsState>((set) => ({
  deletedIds: [],
  statusOverrides: {},
  remove: (ids) =>
    set((s) => ({
      deletedIds: [...new Set([...s.deletedIds, ...ids])],
    })),
  setStatus: (id, status) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [id]: status },
    })),
}));

export function useVisibleSurveys(): Survey[] {
  const deletedIds = useSurveyRowsStore((s) => s.deletedIds);
  const statusOverrides = useSurveyRowsStore((s) => s.statusOverrides);
  const deleted = new Set(deletedIds);
  return SURVEYS.filter((s) => !deleted.has(s.id)).map((s) => ({
    ...s,
    status: statusOverrides[s.id] ?? s.status,
  }));
}
