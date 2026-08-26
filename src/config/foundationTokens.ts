/**
 * Wingify foundation tokens — spacing, radius, type, shadows, overlays.
 * CSS primitives live in src/styles/foundations.css; Figma component radius/space
 * from src/config/tokens/figma/ are generated into src/styles/tokens.generated.css
 * and override the aliases below at runtime.
 */

export const SPACE_PRIMITIVES = [
  { id: 0, px: 0 },
  { id: 1, px: 4 },
  { id: 2, px: 8 },
  { id: 3, px: 12 },
  { id: 4, px: 16 },
  { id: 5, px: 20 },
  { id: 6, px: 24 },
  { id: 7, px: 32 },
  { id: 8, px: 40 },
  { id: 9, px: 48 },
  { id: 10, px: 56 },
  { id: 11, px: 64 },
  { id: 12, px: 80 },
  { id: 13, px: 96 },
  { id: 14, px: 112 },
  { id: 15, px: 128 },
] as const;

export const SPACE_ALIASES = [
  { name: "button-x", token: "--space-button-x", ref: "space/4", px: 16 },
  { name: "button-y", token: "--space-button-y", ref: "space/2", px: 8 },
  { name: "input-x", token: "--space-input-x", ref: "space/3", px: 12 },
  { name: "input-y", token: "--space-input-y", ref: "space/2", px: 8 },
  { name: "card", token: "--space-card", ref: "space/5", px: 20 },
  { name: "section", token: "--space-section", ref: "space/8", px: 40 },
  { name: "stack-tight", token: "--space-stack-tight", ref: "space/2", px: 8 },
  { name: "stack", token: "--space-stack", ref: "space/3", px: 12 },
  { name: "stack-loose", token: "--space-stack-loose", ref: "space/4", px: 16 },
  { name: "row-item", token: "--space-row-item", ref: "space/3", px: 12 },
  { name: "row-section", token: "--space-row-section", ref: "space/5", px: 20 },
] as const;

export const RADIUS_PRIMITIVES = [
  { name: "none", token: "--radius-none", px: 0 },
  { name: "xs", token: "--radius-xs", px: 2 },
  { name: "sm", token: "--radius-sm", px: 4 },
  { name: "md", token: "--radius-md", px: 8 },
  { name: "lg", token: "--radius-lg", px: 12 },
  { name: "full", token: "--radius-full", px: 9999 },
] as const;

export const RADIUS_ALIASES = [
  { name: "button", token: "--radius-button", ref: "sm" },
  { name: "input", token: "--radius-input", ref: "sm" },
  { name: "dropdown", token: "--radius-dropdown", ref: "sm" },
  { name: "tab", token: "--radius-tab", ref: "sm" },
  { name: "tooltip", token: "--radius-tooltip", ref: "sm" },
  { name: "card", token: "--radius-card", ref: "md" },
  { name: "modal", token: "--radius-modal", ref: "md" },
  { name: "popover", token: "--radius-popover", ref: "md" },
  { name: "toast", token: "--radius-toast", ref: "md" },
  { name: "checkbox", token: "--radius-checkbox", ref: "sm" },
  { name: "chip", token: "--radius-chip", ref: "sm" },
  { name: "bar", token: "--radius-bar", ref: "sm" },
  { name: "badge", token: "--radius-badge", ref: "lg" },
  { name: "avatar", token: "--radius-avatar", ref: "full" },
] as const;

export type TypeRole = "display" | "heading" | "body" | "label" | "numeric";

export const TYPE_SCALE = [
  {
    id: "display-2xl",
    group: "display" as TypeRole,
    label: "Display 2XL",
    size: 60,
    lh: 68,
    tracking: "-0.022em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "display-xl",
    group: "display" as TypeRole,
    label: "Display XL",
    size: 48,
    lh: 56,
    tracking: "-0.020em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "display-lg",
    group: "display" as TypeRole,
    label: "Display Large",
    size: 36,
    lh: 44,
    tracking: "-0.018em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "heading-xl",
    group: "heading" as TypeRole,
    label: "Heading Extra Large",
    size: 30,
    lh: 40,
    tracking: "-0.014em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "heading-lg",
    group: "heading" as TypeRole,
    label: "Heading Large",
    size: 24,
    lh: 32,
    tracking: "-0.011em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "heading-md",
    group: "heading" as TypeRole,
    label: "Heading Medium",
    size: 20,
    lh: 28,
    tracking: "-0.008em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "heading-sm",
    group: "heading" as TypeRole,
    label: "Heading Small",
    size: 18,
    lh: 28,
    tracking: "-0.005em",
    weight: 600,
    family: "title" as const,
  },
  {
    id: "body-lg",
    group: "body" as TypeRole,
    label: "Body Large",
    size: 16,
    lh: 24,
    tracking: "0em",
    weight: 400,
    family: "body" as const,
  },
  {
    id: "body-md",
    group: "body" as TypeRole,
    label: "Body",
    size: 14,
    lh: 20,
    tracking: "0em",
    weight: 400,
    family: "body" as const,
  },
  {
    id: "body-sm",
    group: "body" as TypeRole,
    label: "Caption",
    size: 12,
    lh: 16,
    tracking: "0.004em",
    weight: 400,
    family: "body" as const,
  },
  {
    id: "label",
    group: "label" as TypeRole,
    label: "Label",
    size: 12,
    lh: 16,
    tracking: "0.04em",
    weight: 500,
    family: "body" as const,
    uppercase: true,
  },
  {
    id: "label-md",
    group: "label" as TypeRole,
    label: "Label Medium",
    size: 11,
    lh: 16,
    tracking: "0.04em",
    weight: 500,
    family: "body" as const,
    uppercase: true,
  },
  {
    id: "numeric-lg",
    group: "numeric" as TypeRole,
    label: "Numeric Large",
    size: 20,
    lh: 28,
    tracking: "0em",
    weight: 500,
    family: "numeric" as const,
    sample: "1,234,567.00",
  },
  {
    id: "numeric-md",
    group: "numeric" as TypeRole,
    label: "Numeric",
    size: 16,
    lh: 24,
    tracking: "0em",
    weight: 500,
    family: "numeric" as const,
    sample: "1,234,567.00",
  },
  {
    id: "numeric-sm",
    group: "numeric" as TypeRole,
    label: "Numeric Small",
    size: 14,
    lh: 20,
    tracking: "0em",
    weight: 500,
    family: "numeric" as const,
    sample: "1,234,567.00",
  },
] as const;

export const SHADOW_LEVELS = ["sm", "md", "lg"] as const;

export const OVERLAY_CORE = [
  {
    name: "stroke-core",
    token: "--overlay-stroke-core",
    note: "Primary stroke for selection outlines",
    swatch: "var(--vwo-neutral-950)",
  },
  {
    name: "stroke-halo",
    token: "--overlay-stroke-halo",
    note: "White halo behind selection strokes",
    swatch: "var(--vwo-neutral-0)",
  },
  {
    name: "label-bg",
    token: "--overlay-label-bg",
    note: "Background for floating labels",
    swatch: "var(--vwo-yellow-50)",
  },
  {
    name: "label-fg",
    token: "--overlay-label-fg",
    note: "Text color on floating labels",
    swatch: "var(--vwo-neutral-950)",
  },
  {
    name: "handle",
    token: "--overlay-handle",
    note: "Drag handles and resize grips",
    swatch: "var(--vwo-yellow-50)",
  },
] as const;

export const THERMAL_STEPS = [1, 2, 3, 4, 5, 6] as const;

export const PRIMITIVE_PALETTES = [
  {
    name: "Neutral",
    steps: [
      "0",
      "25",
      "50",
      "75",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
      "950",
    ],
  },
  {
    name: "Cherry",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "Amber",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "Yellow",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "Green",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "Ocean",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "Berry",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
  {
    name: "Maroon",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
  },
] as const;

export const SEMANTIC_COLOR_GROUPS = [
  {
    title: "Surfaces",
    tokens: [
      { name: "Background", swatch: "bg-background", token: "background" },
      { name: "Canvas", swatch: "bg-canvas", token: "canvas" },
      { name: "Card", swatch: "bg-card", token: "card" },
      { name: "Popover", swatch: "bg-popover", token: "popover" },
      { name: "Panel", swatch: "bg-panel", token: "panel" },
      { name: "Muted", swatch: "bg-muted", token: "muted" },
    ],
  },
  {
    title: "Text & chrome",
    tokens: [
      { name: "Foreground", swatch: "bg-foreground", token: "foreground" },
      { name: "Muted text", swatch: "bg-muted-foreground", token: "muted-foreground" },
      { name: "Border", swatch: "bg-border", token: "border" },
      { name: "Primary", swatch: "bg-primary", token: "primary" },
      { name: "Primary text", swatch: "bg-primary-foreground", token: "primary-foreground" },
      { name: "Secondary", swatch: "bg-secondary", token: "secondary" },
      { name: "Accent", swatch: "bg-accent", token: "accent" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { name: "Success", swatch: "bg-success-solid", token: "success-solid" },
      { name: "Warning", swatch: "bg-warning-solid", token: "warning-solid" },
      { name: "Info", swatch: "bg-info-bg", token: "info-bg" },
      { name: "Danger", swatch: "bg-danger-bg", token: "danger-bg" },
    ],
  },
] as const;

export const SEMANTIC_BORDER_TOKENS = [
  { name: "subtle", token: "semantic-border-subtle" },
  { name: "default", token: "semantic-border-default" },
  { name: "hover", token: "semantic-border-hover" },
  { name: "strong", token: "semantic-border-strong" },
  { name: "focus", token: "semantic-border-focus" },
  { name: "tooltip", token: "semantic-border-tooltip" },
  { name: "disabled", token: "semantic-border-disabled" },
  { name: "error", token: "semantic-border-error" },
] as const;
