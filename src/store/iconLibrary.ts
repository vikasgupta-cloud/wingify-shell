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
  /** Remembers last style pick per library so Thin/Sharp survive library switches. */
  lastVariantByLibrary: Partial<Record<IconLibraryId, string>>;
  setLibrary: (libraryId: IconLibraryId) => void;
  setVariant: (variant: string) => void;
  resetIconLibrary: () => void;
};

export const useIconLibraryStore = create<IconLibraryState>()(
  persist(
    (set, get) => ({
      libraryId: DEFAULT_ICON_LIBRARY_ID,
      variant: DEFAULT_ICON_VARIANT,
      lastVariantByLibrary: {
        [DEFAULT_ICON_LIBRARY_ID]: DEFAULT_ICON_VARIANT,
      },
      setLibrary: (libraryId) => {
        const { lastVariantByLibrary } = get();
        const remembered = lastVariantByLibrary[libraryId];
        const nextVariant = resolveIconVariant(
          libraryId,
          remembered ?? defaultVariantForLibrary(libraryId)
        );
        set({
          libraryId,
          variant: nextVariant,
          lastVariantByLibrary: {
            ...lastVariantByLibrary,
            [libraryId]: nextVariant,
          },
        });
      },
      setVariant: (variant) => {
        const { libraryId, lastVariantByLibrary } = get();
        const next = resolveIconVariant(libraryId, variant);
        set({
          variant: next,
          lastVariantByLibrary: {
            ...lastVariantByLibrary,
            [libraryId]: next,
          },
        });
      },
      resetIconLibrary: () => {
        set({
          libraryId: DEFAULT_ICON_LIBRARY_ID,
          variant: DEFAULT_ICON_VARIANT,
          lastVariantByLibrary: {
            [DEFAULT_ICON_LIBRARY_ID]: DEFAULT_ICON_VARIANT,
          },
        });
      },
    }),
    {
      name: "wingify-icon-library",
      partialize: (s) => ({
        libraryId: s.libraryId,
        variant: s.variant,
        lastVariantByLibrary: s.lastVariantByLibrary,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<IconLibraryState>;
        const libraryId = resolveIconLibraryId(
          p.libraryId ?? current.libraryId
        );
        const lastVariantByLibrary = {
          ...current.lastVariantByLibrary,
          ...(p.lastVariantByLibrary ?? {}),
        };
        const variant = resolveIconVariant(
          libraryId,
          p.variant ??
            lastVariantByLibrary[libraryId] ??
            current.variant
        );
        return {
          ...current,
          ...p,
          libraryId,
          variant,
          lastVariantByLibrary: {
            ...lastVariantByLibrary,
            [libraryId]: variant,
          },
        };
      },
    }
  )
);
