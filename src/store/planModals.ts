import { create } from "zustand";

type PlanModalState = {
  observationId: string | null;
  hypothesisId: string | null;
  createObservation: boolean;
  createHypothesis: boolean;
  openObservation: (id: string) => void;
  openHypothesis: (id: string) => void;
  openCreateObservation: () => void;
  openCreateHypothesis: () => void;
  closeObservation: () => void;
  closeHypothesis: () => void;
  closeCreateObservation: () => void;
  closeCreateHypothesis: () => void;
};

export const usePlanModalsStore = create<PlanModalState>((set) => ({
  observationId: null,
  hypothesisId: null,
  createObservation: false,
  createHypothesis: false,
  openObservation: (id) =>
    set({
      observationId: id,
      createObservation: false,
      hypothesisId: null,
      createHypothesis: false,
    }),
  openHypothesis: (id) =>
    set({
      hypothesisId: id,
      createHypothesis: false,
      observationId: null,
      createObservation: false,
    }),
  openCreateObservation: () =>
    set({
      createObservation: true,
      observationId: null,
      hypothesisId: null,
      createHypothesis: false,
    }),
  openCreateHypothesis: () =>
    set({
      createHypothesis: true,
      hypothesisId: null,
      observationId: null,
      createObservation: false,
    }),
  closeObservation: () => set({ observationId: null }),
  closeHypothesis: () => set({ hypothesisId: null }),
  closeCreateObservation: () => set({ createObservation: false }),
  closeCreateHypothesis: () => set({ createHypothesis: false }),
}));
