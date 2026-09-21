/** Opens the Integrations “Request new integration” dialog from DrillInShell header. */

import { create } from "zustand";

type IntegrationRequestState = {
  open: boolean;
  openRequest: () => void;
  setOpen: (open: boolean) => void;
};

export const useIntegrationRequestStore = create<IntegrationRequestState>(
  (set) => ({
    open: false,
    openRequest: () => set({ open: true }),
    setOpen: (open) => set({ open }),
  })
);
