import type { EditorSidePanelId } from "@/components/editor/EditorUtilityRail";

export type EditorLayoutMode = "default" | "multipage" | "mvt";
export type EditorDevice = "desktop" | "tablet" | "mobile";
export type EditorLeftTool =
  | "layers"
  | "add"
  | "metrics"
  | "translate"
  | "changes";
export type EditionTabId = "styles" | "attributes" | "tracking";

export type EditorSelection = {
  tag: string;
  label: string;
  selector: string;
};

export const DEMO_SELECTION: EditorSelection = {
  tag: "H3",
  label: "heading_h3",
  selector: "#hero-heading",
};

export type EditorScenarioId =
  | "default-copilot"
  | "edition-empty"
  | "panels-closed"
  | "multipage"
  | "mvt"
  | "mvt-subtest-popover"
  | "tablet"
  | "mobile"
  | "selection-copilot"
  | "selection-edition"
  | "edition-attributes"
  | "layers"
  | "add"
  | "metrics"
  | "changes";

export type EditorScenarioPreset = {
  id: EditorScenarioId;
  label: string;
  layoutMode: EditorLayoutMode;
  device: EditorDevice;
  leftTool: EditorLeftTool | null;
  selection: EditorSelection | null;
  rightOpen: EditorSidePanelId[];
  editionTab: EditionTabId;
  showSubtestPopover: boolean;
  showDimensionsBar: boolean;
};

export const EDITOR_SCENARIOS: EditorScenarioPreset[] = [
  {
    id: "default-copilot",
    label: "Default · Copilot",
    layoutMode: "default",
    device: "desktop",
    leftTool: null,
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "edition-empty",
    label: "Edition · Empty",
    layoutMode: "default",
    device: "desktop",
    leftTool: null,
    selection: null,
    rightOpen: ["edition"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "panels-closed",
    label: "Panels closed",
    layoutMode: "default",
    device: "desktop",
    leftTool: null,
    selection: null,
    rightOpen: [],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "multipage",
    label: "Multipage",
    layoutMode: "multipage",
    device: "desktop",
    leftTool: null,
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "mvt",
    label: "Multivariate",
    layoutMode: "mvt",
    device: "desktop",
    leftTool: null,
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "mvt-subtest-popover",
    label: "MVT · Subtest popover",
    layoutMode: "mvt",
    device: "desktop",
    leftTool: null,
    selection: DEMO_SELECTION,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: true,
    showDimensionsBar: false,
  },
  {
    id: "tablet",
    label: "Tablet",
    layoutMode: "default",
    device: "tablet",
    leftTool: null,
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: true,
  },
  {
    id: "mobile",
    label: "Mobile",
    layoutMode: "default",
    device: "mobile",
    leftTool: null,
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: true,
  },
  {
    id: "selection-copilot",
    label: "Selection · Copilot",
    layoutMode: "default",
    device: "desktop",
    leftTool: null,
    selection: DEMO_SELECTION,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "selection-edition",
    label: "Selection · Edition",
    layoutMode: "default",
    device: "desktop",
    leftTool: null,
    selection: DEMO_SELECTION,
    rightOpen: ["edition"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "edition-attributes",
    label: "Edition · Attributes",
    layoutMode: "default",
    device: "desktop",
    leftTool: null,
    selection: DEMO_SELECTION,
    rightOpen: ["edition"],
    editionTab: "attributes",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "layers",
    label: "Layers",
    layoutMode: "default",
    device: "desktop",
    leftTool: "layers",
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "add",
    label: "Add",
    layoutMode: "default",
    device: "desktop",
    leftTool: "add",
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "metrics",
    label: "Metrics",
    layoutMode: "default",
    device: "desktop",
    leftTool: "metrics",
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
  {
    id: "changes",
    label: "Changes",
    layoutMode: "default",
    device: "desktop",
    leftTool: "changes",
    selection: null,
    rightOpen: ["copilot"],
    editionTab: "styles",
    showSubtestPopover: false,
    showDimensionsBar: false,
  },
];

export const DEFAULT_SCENARIO =
  EDITOR_SCENARIOS.find((s) => s.id === "default-copilot")!;
