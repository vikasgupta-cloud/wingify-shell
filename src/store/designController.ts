import { create } from "zustand";

type DesignControllerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openController: () => void;
  closeController: () => void;
};

/** Shared open state for the fonts + CTA design playground. */
export const useDesignControllerStore = create<DesignControllerState>(
  (set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    openController: () => set({ open: true }),
    closeController: () => set({ open: false }),
  })
);
