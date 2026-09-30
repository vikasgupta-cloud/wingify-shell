import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DetailPreferences = {
  configuration: Record<string, Record<string, string>>;
  holdout: Record<string, boolean>;
  analysis: Record<string, boolean>;
  saveConfiguration: (flagId: string, values: Record<string, string>) => void;
  setHoldout: (key: string, value: boolean) => void;
  setAnalysis: (key: string, value: boolean) => void;
};
export const useFlagDetailPreferences = create<DetailPreferences>()(persist(set => ({
  configuration: {}, holdout: {}, analysis: {},
  saveConfiguration: (flagId, values) => set(state => ({ configuration: { ...state.configuration, [flagId]: values } })),
  setHoldout: (key, value) => set(state => ({ holdout: { ...state.holdout, [key]: value } })),
  setAnalysis: (key, value) => set(state => ({ analysis: { ...state.analysis, [key]: value } })),
}), { name: 'wingify-flag-detail-preferences-v1' }));
