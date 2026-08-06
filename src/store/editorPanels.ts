import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clampFloatSize,
  defaultFloatPos,
  defaultFloatSize,
  defaultPanelChrome,
  type EditorPanelChrome,
} from "@/components/editor/EditorFloatablePanel";
import {
  EDITOR_SIDE_PANEL_ORDER,
  type EditorSidePanelId,
} from "@/components/editor/EditorUtilityRail";
import type {
  EditionTabId,
  EditorLeftTool,
  EditorPreviewWidthMode,
} from "@/config/editorScenarios";

export type EditorPanelState = {
  open: boolean;
  chrome: EditorPanelChrome;
};

export type EditorPanelsMap = Record<EditorSidePanelId, EditorPanelState>;

const LEFT_TOOLS: EditorLeftTool[] = ["add", "metrics", "variations"];
const CHROME_MODES: EditorPanelChrome["mode"][] = [
  "docked",
  "floating",
  "minimized",
];
const PREVIEW_WIDTH_MODES: EditorPreviewWidthMode[] = ["fit", "fixed"];
const EDITION_TABS: EditionTabId[] = ["styles", "attributes", "tracking"];

export function defaultEditorPanels(): EditorPanelsMap {
  return {
    layers: { open: false, chrome: defaultPanelChrome() },
    copilot: { open: true, chrome: defaultPanelChrome() },
    edition: { open: false, chrome: defaultPanelChrome() },
    translate: { open: false, chrome: defaultPanelChrome() },
    changes: { open: false, chrome: defaultPanelChrome() },
    history: { open: false, chrome: defaultPanelChrome() },
  };
}

function isSidePanelId(value: unknown): value is EditorSidePanelId {
  return (
    typeof value === "string" &&
    (EDITOR_SIDE_PANEL_ORDER as string[]).includes(value)
  );
}

function parseChrome(raw: unknown): EditorPanelChrome {
  const fallback = defaultPanelChrome();
  if (!raw || typeof raw !== "object") return fallback;
  const chrome = raw as Partial<EditorPanelChrome>;
  const mode = CHROME_MODES.includes(chrome.mode as EditorPanelChrome["mode"])
    ? (chrome.mode as EditorPanelChrome["mode"])
    : fallback.mode;
  const x =
    chrome.pos && typeof chrome.pos.x === "number" && Number.isFinite(chrome.pos.x)
      ? chrome.pos.x
      : fallback.pos.x;
  const y =
    chrome.pos && typeof chrome.pos.y === "number" && Number.isFinite(chrome.pos.y)
      ? chrome.pos.y
      : fallback.pos.y;
  return { mode, pos: { x, y } };
}

function parsePanels(raw: unknown): EditorPanelsMap {
  const next = defaultEditorPanels();
  if (!raw || typeof raw !== "object") return next;
  const rec = raw as Record<string, unknown>;
  for (const id of EDITOR_SIDE_PANEL_ORDER) {
    const item = rec[id];
    if (!item || typeof item !== "object") continue;
    const panel = item as { open?: unknown; chrome?: unknown };
    next[id] = {
      open: panel.open === true,
      chrome: parseChrome(panel.chrome),
    };
  }
  return next;
}

function parsePos(raw: unknown): { x: number; y: number } {
  const fallback = defaultFloatPos();
  if (!raw || typeof raw !== "object") return fallback;
  const pos = raw as { x?: unknown; y?: unknown };
  return {
    x: typeof pos.x === "number" && Number.isFinite(pos.x) ? pos.x : fallback.x,
    y: typeof pos.y === "number" && Number.isFinite(pos.y) ? pos.y : fallback.y,
  };
}

function parseOverlayWidths(raw: unknown): Partial<Record<EditorLeftTool, number>> {
  if (!raw || typeof raw !== "object") return {};
  const rec = raw as Record<string, unknown>;
  const next: Partial<Record<EditorLeftTool, number>> = {};
  for (const id of LEFT_TOOLS) {
    const value = rec[id];
    if (typeof value === "number" && Number.isFinite(value)) next[id] = value;
  }
  return next;
}

type EditorPanelsStore = {
  panels: EditorPanelsMap;
  leftTool: EditorLeftTool | null;
  floatPos: { x: number; y: number };
  floatSize: { width: number; height: number };
  activeTab: EditorSidePanelId;
  shellMinimized: boolean;
  previewWidthMode: EditorPreviewWidthMode;
  editionTab: EditionTabId;
  overlayWidths: Partial<Record<EditorLeftTool, number>>;
  bottomSheetHeight: number;
  setPanels: (
    update: EditorPanelsMap | ((prev: EditorPanelsMap) => EditorPanelsMap)
  ) => void;
  setLeftTool: (
    update:
      | EditorLeftTool
      | null
      | ((prev: EditorLeftTool | null) => EditorLeftTool | null)
  ) => void;
  setFloatPos: (pos: { x: number; y: number }) => void;
  setFloatSize: (size: { width: number; height: number }) => void;
  setActiveTab: (id: EditorSidePanelId) => void;
  setShellMinimized: (value: boolean) => void;
  setPreviewWidthMode: (mode: EditorPreviewWidthMode) => void;
  setEditionTab: (tab: EditionTabId) => void;
  setOverlayWidth: (tool: EditorLeftTool, width: number) => void;
  setBottomSheetHeight: (height: number) => void;
  hydrateFromScenario: (input: {
    leftTool: EditorLeftTool | null;
    editionTab: EditionTabId;
    rightOpen: EditorSidePanelId[];
  }) => void;
};

export const useEditorPanelsStore = create<EditorPanelsStore>()(
  persist(
    (set) => ({
      panels: defaultEditorPanels(),
      leftTool: null,
      floatPos: defaultFloatPos(),
      floatSize: defaultFloatSize(),
      activeTab: "copilot",
      shellMinimized: false,
      previewWidthMode: "fit",
      editionTab: "styles",
      overlayWidths: {},
      bottomSheetHeight: 420,
      setPanels: (update) =>
        set((state) => ({
          panels: typeof update === "function" ? update(state.panels) : update,
        })),
      setLeftTool: (update) =>
        set((state) => ({
          leftTool:
            typeof update === "function" ? update(state.leftTool) : update,
        })),
      setFloatPos: (floatPos) => set({ floatPos }),
      setFloatSize: (floatSize) => set({ floatSize: clampFloatSize(floatSize) }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setShellMinimized: (shellMinimized) => set({ shellMinimized }),
      setPreviewWidthMode: (previewWidthMode) => set({ previewWidthMode }),
      setEditionTab: (editionTab) => set({ editionTab }),
      setOverlayWidth: (tool, width) =>
        set((state) => ({
          overlayWidths: { ...state.overlayWidths, [tool]: width },
        })),
      setBottomSheetHeight: (bottomSheetHeight) => set({ bottomSheetHeight }),
      hydrateFromScenario: ({ leftTool, editionTab, rightOpen }) => {
        const panels = defaultEditorPanels();
        for (const id of EDITOR_SIDE_PANEL_ORDER) {
          panels[id] = {
            open: rightOpen.includes(id),
            chrome: defaultPanelChrome(),
          };
        }
        // Only one docked panel at a time from scenarios.
        if (rightOpen.length > 1) {
          for (const id of EDITOR_SIDE_PANEL_ORDER) {
            if (id !== rightOpen[0]) panels[id].open = false;
          }
          panels[rightOpen[0]!].open = true;
        }
        set({
          leftTool:
            leftTool === "add" ||
            leftTool === "metrics" ||
            leftTool === "variations"
              ? leftTool
              : null,
          editionTab,
          panels,
          activeTab: rightOpen[0] ?? "copilot",
          shellMinimized: false,
          floatPos: defaultFloatPos(),
        });
      },
    }),
    {
      name: "wingify-editor-panels-v5",
      partialize: (state) => ({
        panels: state.panels,
        leftTool: state.leftTool,
        floatPos: state.floatPos,
        floatSize: state.floatSize,
        activeTab: state.activeTab,
        shellMinimized: state.shellMinimized,
        previewWidthMode: state.previewWidthMode,
        editionTab: state.editionTab,
        overlayWidths: state.overlayWidths,
        bottomSheetHeight: state.bottomSheetHeight,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<EditorPanelsStore>;
        const leftTool =
          saved.leftTool === null ||
          (typeof saved.leftTool === "string" &&
            LEFT_TOOLS.includes(saved.leftTool as EditorLeftTool))
            ? (saved.leftTool as EditorLeftTool | null)
            : current.leftTool;
        const bottomSheetHeight =
          typeof saved.bottomSheetHeight === "number" &&
          Number.isFinite(saved.bottomSheetHeight)
            ? Math.min(640, Math.max(280, Math.round(saved.bottomSheetHeight)))
            : current.bottomSheetHeight;
        const rawSize =
          saved.floatSize && typeof saved.floatSize === "object"
            ? (saved.floatSize as { width?: unknown; height?: unknown })
            : null;
        const floatSize = clampFloatSize({
          width:
            typeof rawSize?.width === "number" && Number.isFinite(rawSize.width)
              ? rawSize.width
              : current.floatSize.width,
          height:
            typeof rawSize?.height === "number" &&
            Number.isFinite(rawSize.height)
              ? rawSize.height
              : current.floatSize.height,
        });
        return {
          ...current,
          panels: parsePanels(saved.panels),
          leftTool,
          floatPos: parsePos(saved.floatPos),
          floatSize,
          activeTab: isSidePanelId(saved.activeTab)
            ? saved.activeTab
            : current.activeTab,
          shellMinimized: saved.shellMinimized === true,
          previewWidthMode: PREVIEW_WIDTH_MODES.includes(
            saved.previewWidthMode as EditorPreviewWidthMode
          )
            ? (saved.previewWidthMode as EditorPreviewWidthMode)
            : current.previewWidthMode,
          editionTab: EDITION_TABS.includes(saved.editionTab as EditionTabId)
            ? (saved.editionTab as EditionTabId)
            : current.editionTab,
          overlayWidths: parseOverlayWidths(saved.overlayWidths),
          bottomSheetHeight,
        };
      },
    }
  )
);
