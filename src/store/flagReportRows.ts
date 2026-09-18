/** Flag report row name overrides (rollout / testing / personalize / multivariate). */

import { create } from "zustand";
import type { FlagReportKind } from "../config/flagReports";

type FlagReportRowsState = {
  nameOverrides: Partial<Record<FlagReportKind, Record<string, string>>>;
  rename: (kind: FlagReportKind, id: string, name: string) => void;
};

export const useFlagReportRowsStore = create<FlagReportRowsState>((set) => ({
  nameOverrides: {},
  rename: (kind, id, name) =>
    set((s) => ({
      nameOverrides: {
        ...s.nameOverrides,
        [kind]: { ...s.nameOverrides[kind], [id]: name },
      },
    })),
}));
