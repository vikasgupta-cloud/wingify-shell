/**
 * Named design themes saved from the appearance panel.
 * Snapshots palette, theme, component colours, fonts, and icon library so they
 * can be reloaded later in this browser.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FontId, FontRole } from "../config/fonts";
import type { IconLibraryId } from "../config/iconLibraries";
import type { PaletteId } from "../config/palettes";
import type { ColorMode, ThemeId } from "../config/themes";
import {
  useComponentAppearanceStore,
  type ComponentOverride,
} from "./componentAppearance";
import { useFontStore } from "./fonts";
import { useIconLibraryStore } from "./iconLibrary";
import { useThemeStore } from "./theme";

export type SavedTheme = {
  id: string;
  name: string;
  createdAt: number;
  theme: {
    themeId: ThemeId;
    colorMode: ColorMode;
    paletteId: PaletteId;
    ctaTokenId: string | null;
    backgroundTokenId: string | null;
    headerTokenId: string | null;
  };
  componentOverrides: Record<string, ComponentOverride>;
  fonts: Record<FontRole, FontId>;
  icons: {
    libraryId: IconLibraryId;
    variant: string;
  };
};

type SavedThemesState = {
  themes: SavedTheme[];
  activeThemeId: string | null;
  saveCurrent: (name: string) => SavedTheme | null;
  applyTheme: (id: string) => boolean;
  renameTheme: (id: string, name: string) => void;
  deleteTheme: (id: string) => void;
};

function newId() {
  return `theme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function captureCurrent(name: string): SavedTheme {
  const theme = useThemeStore.getState();
  const fonts = useFontStore.getState();
  const icons = useIconLibraryStore.getState();
  const appearance = useComponentAppearanceStore.getState();
  return {
    id: newId(),
    name: name.trim(),
    createdAt: Date.now(),
    theme: {
      themeId: theme.themeId,
      colorMode: theme.colorMode,
      paletteId: theme.paletteId,
      ctaTokenId: theme.ctaTokenId,
      backgroundTokenId: theme.backgroundTokenId,
      headerTokenId: theme.headerTokenId,
    },
    componentOverrides: structuredClone(appearance.overrides),
    fonts: { ...fonts.assignments },
    icons: {
      libraryId: icons.libraryId,
      variant: icons.variant,
    },
  };
}

export const useSavedThemesStore = create<SavedThemesState>()(
  persist(
    (set, get) => ({
      themes: [],
      activeThemeId: null,
      saveCurrent: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const existing = get().themes.find(
          (theme) => theme.name.toLowerCase() === trimmed.toLowerCase()
        );
        const nextTheme = captureCurrent(trimmed);
        if (existing) {
          // Overwrite same-named theme so users can update a saved look.
          nextTheme.id = existing.id;
          nextTheme.createdAt = existing.createdAt;
          set({
            themes: get().themes.map((theme) =>
              theme.id === existing.id ? nextTheme : theme
            ),
            activeThemeId: nextTheme.id,
          });
        } else {
          set({
            themes: [nextTheme, ...get().themes],
            activeThemeId: nextTheme.id,
          });
        }
        return nextTheme;
      },
      applyTheme: (id) => {
        const saved = get().themes.find((theme) => theme.id === id);
        if (!saved) return false;
        useThemeStore.getState().applySnapshot(saved.theme);
        useComponentAppearanceStore
          .getState()
          .replaceOverrides(structuredClone(saved.componentOverrides));
        useFontStore.getState().setAssignments(saved.fonts);
        const icons = useIconLibraryStore.getState();
        icons.setLibrary(saved.icons.libraryId);
        icons.setVariant(saved.icons.variant);
        set({ activeThemeId: id });
        return true;
      },
      renameTheme: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set({
          themes: get().themes.map((theme) =>
            theme.id === id ? { ...theme, name: trimmed } : theme
          ),
        });
      },
      deleteTheme: (id) => {
        set({
          themes: get().themes.filter((theme) => theme.id !== id),
          activeThemeId:
            get().activeThemeId === id ? null : get().activeThemeId,
        });
      },
    }),
    {
      name: "wingify-saved-themes",
      partialize: (s) => ({
        themes: s.themes,
        activeThemeId: s.activeThemeId,
      }),
    }
  )
);
