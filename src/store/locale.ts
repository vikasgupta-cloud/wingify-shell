/** Persisted UI language preference for the JD profile menu (client-side only). */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLanguage = {
  id: string;
  label: string;
};

export const APP_LANGUAGES: AppLanguage[] = [
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "ko", label: "한국어" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
  { id: "de", label: "Deutsch" },
  { id: "pt", label: "Português" },
  { id: "it", label: "Italiano" },
  { id: "zh-CN", label: "简体中文" },
  { id: "zh-TW", label: "繁體中文" },
];

type LocaleState = {
  languageId: string;
  setLanguageId: (id: string) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      languageId: "en",
      setLanguageId: (languageId) => set({ languageId }),
    }),
    { name: "wingify-locale" }
  )
);
