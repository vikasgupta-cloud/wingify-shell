import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  adaptChannelsForMode,
  componentCssVar,
  paletteColourForValue,
  resolveComponentColour,
  type ComponentColourReference,
  type ComponentAppearanceId,
} from "../config/componentAppearance";
import type { ColorMode } from "../config/themes";
import { useThemeStore } from "./theme";

/** A named palette shade or fixed custom colour, plus its authored mode. */
export type ComponentOverride = {
  colour: ComponentColourReference;
  mode: ColorMode;
};

type ComponentAppearanceState = {
  overrides: Record<string, ComponentOverride>;
  setOverride: (
    component: ComponentAppearanceId,
    field: string,
    colour: ComponentColourReference | null
  ) => void;
  /** Replace every override (used when loading a saved theme). */
  replaceOverrides: (overrides: Record<string, ComponentOverride>) => void;
  applyForMode: (mode: ColorMode) => void;
  resetComponentAppearance: () => void;
};

const APP_CANVAS_VAR = "--appearance-app-background-canvas";
const APP_CHROME_VAR = "--appearance-app-background-chrome";

/**
 * Status chip appearance vars → semantic tokens used by StatusBadge,
 * banners, and success/warning/danger/info chips across the app.
 */
const STATUS_CHIP_TOKEN_MIRRORS: Record<string, string> = {
  "--appearance-status-chips-success-background": "--success-bg",
  "--appearance-status-chips-success-text": "--success-fg",
  "--appearance-status-chips-warning-background": "--warning-bg",
  "--appearance-status-chips-warning-text": "--warning-fg",
  "--appearance-status-chips-error-background": "--danger-bg",
  "--appearance-status-chips-error-text": "--danger-fg",
  "--appearance-status-chips-info-background": "--info-bg",
  "--appearance-status-chips-info-text": "--info-fg",
  "--appearance-status-chips-draft-background": "--status-draft-bg",
  "--appearance-status-chips-draft-text": "--status-draft-fg",
  "--appearance-status-chips-qa-background": "--status-qa-bg",
  "--appearance-status-chips-qa-text": "--status-qa-fg",
  "--appearance-status-chips-ready-background": "--status-ready-bg",
  "--appearance-status-chips-ready-text": "--status-ready-fg",
  "--appearance-status-chips-running-background": "--status-running-bg",
  "--appearance-status-chips-running-text": "--status-running-fg",
  "--appearance-status-chips-analysis-background": "--status-analysis-bg",
  "--appearance-status-chips-analysis-text": "--status-analysis-fg",
  "--appearance-status-chips-paused-background": "--status-paused-bg",
  "--appearance-status-chips-paused-text": "--status-paused-fg",
  "--appearance-status-chips-ended-background": "--status-ended-bg",
  "--appearance-status-chips-ended-text": "--status-ended-fg",
};

function applyOverrides(
  overrides: Record<string, ComponentOverride>,
  mode: ColorMode,
  paletteId = useThemeStore.getState().paletteId
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const name of Array.from(root.style)) {
    if (name.startsWith("--appearance-")) root.style.removeProperty(name);
  }
  // Drop previous status mirrors so clearing a pick restores theme defaults.
  for (const token of Object.values(STATUS_CHIP_TOKEN_MIRRORS)) {
    root.style.removeProperty(token);
  }

  for (const [name, override] of Object.entries(overrides)) {
    root.style.setProperty(
      name,
      adaptChannelsForMode(
        resolveComponentColour(override.colour, paletteId),
        override.mode,
        mode
      )
    );
  }

  // Pages use Tailwind `bg-canvas` / `bg-background` (the --canvas / --background
  // tokens), so mirror app-background picks onto those tokens or they never show.
  const canvas = overrides[APP_CANVAS_VAR];
  if (canvas) {
    const value = adaptChannelsForMode(
      resolveComponentColour(canvas.colour, paletteId),
      canvas.mode,
      mode
    );
    root.style.setProperty("--canvas", value);
    root.style.setProperty("--surface", value);
  }

  const chrome = overrides[APP_CHROME_VAR];
  if (chrome) {
    root.style.setProperty(
      "--background",
      adaptChannelsForMode(
        resolveComponentColour(chrome.colour, paletteId),
        chrome.mode,
        mode
      )
    );
  }

  for (const [appearanceVar, token] of Object.entries(STATUS_CHIP_TOKEN_MIRRORS)) {
    const override = overrides[appearanceVar];
    if (!override) continue;
    root.style.setProperty(
      token,
      adaptChannelsForMode(
        resolveComponentColour(override.colour, paletteId),
        override.mode,
        mode
      )
    );
  }
}

function currentMode(): ColorMode {
  return useThemeStore.getState().colorMode;
}

/**
 * Persisted, component-scoped colour overrides. A pick made in one mode is
 * auto-adapted for the other so light/dark both stay readable.
 */
export const useComponentAppearanceStore = create<ComponentAppearanceState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setOverride: (component, field, colour) => {
        const mode = currentMode();
        const key = componentCssVar(component, field);
        const next = { ...get().overrides };
        if (colour) next[key] = { colour, mode };
        else delete next[key];
        applyOverrides(next, mode);
        set({ overrides: next });
      },
      replaceOverrides: (overrides) => {
        const next = structuredClone(overrides);
        applyOverrides(next, currentMode());
        set({ overrides: next });
      },
      applyForMode: (mode) => {
        applyOverrides(get().overrides, mode);
      },
      resetComponentAppearance: () => {
        applyOverrides({}, currentMode());
        set({ overrides: {} });
      },
    }),
    {
      name: "wingify-component-appearance",
      version: 3,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          overrides?: Record<string, unknown>;
        };
        const overrides: Record<string, ComponentOverride> = {};
        const paletteId = useThemeStore.getState().paletteId;
        for (const [key, raw] of Object.entries(state.overrides ?? {})) {
          if (typeof raw === "string") {
            overrides[key] = {
              colour: paletteColourForValue(raw, paletteId) ?? {
                kind: "custom",
                value: raw,
              },
              mode: "light",
            };
          } else if (raw && typeof raw === "object") {
            const legacy = raw as { value?: unknown; mode?: unknown; colour?: unknown };
            if (legacy.colour) {
              overrides[key] = legacy as ComponentOverride;
            } else if (typeof legacy.value === "string") {
              overrides[key] = {
                colour: paletteColourForValue(legacy.value, paletteId) ?? {
                  kind: "custom",
                  value: legacy.value,
                },
                mode: legacy.mode === "dark" ? "dark" : "light",
              };
            }
          }
        }
        return { overrides } as ComponentAppearanceState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) applyOverrides(state.overrides, currentMode());
      },
    }
  )
);
