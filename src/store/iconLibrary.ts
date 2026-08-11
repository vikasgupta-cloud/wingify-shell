import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ICON_LIBRARY_ID,
  DEFAULT_ICON_VARIANT,
  defaultVariantForLibrary,
  resolveIconLibraryId,
  resolveIconVariant,
  type IconLibraryId,
} from "../config/iconLibraries";

type IconLibraryState = {
  libraryId: IconLibraryId;
  variant: string;
  setLibrary: (libraryId: IconLibraryId) => void;
  setVariant: (variant: string) => void;
  resetIconLibrary: () => void;
};

export const useIconLibraryStore = create<IconLibraryState>()(
  persist(
    (set, get) => ({
      libraryId: DEFAULT_ICON_LIBRARY_ID,
      variant: DEFAULT_ICON_VARIANT,
      setLibrary: (libraryId) => {
        const nextVariant = defaultVariantForLibrary(libraryId);
        set({ libraryId, variant: nextVariant });
      },
      setVariant: (variant) => {
        const { libraryId } = get();
        set({ variant: resolveIconVariant(libraryId, variant) });
      },
      resetIconLibrary: () => {
        set({
          libraryId: DEFAULT_ICON_LIBRARY_ID,
          variant: DEFAULT_ICON_VARIANT,
        });
      },
    }),
    {
      name: "wingify-icon-library",
      partialize: (s) => ({
        libraryId: s.libraryId,
        variant: s.variant,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<IconLibraryState>;
        const libraryId = resolveIconLibraryId(
          p.libraryId ?? current.libraryId
        );
        return {
          ...current,
          libraryId,
          variant: resolveIconVariant(libraryId, p.variant ?? current.variant),
        };
      },
    }
  )
);
