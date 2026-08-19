/**
 * Component-level appearance overrides for the design controller.
 * Every interactive state exposes Background / Text / Border (plus Focus ring)
 * wherever that state exists for the component.
 */
import {
  getPaletteScales,
  PALETTE_IDS,
  type PaletteId,
  DEFAULT_PALETTE_ID,
} from "./palettes";

/** Shared surface triple used across states. */
const SURFACE = ["background", "text", "border"] as const;
const HOVER = ["hoverBackground", "hoverText", "hoverBorder"] as const;
const FOCUS = [
  "focusBackground",
  "focusText",
  "focusBorder",
  "focusRing",
] as const;
const DISABLED = [
  "disabledBackground",
  "disabledText",
  "disabledBorder",
] as const;
const SELECTED = [
  "selectedBackground",
  "selectedText",
  "selectedBorder",
] as const;
const READ_ONLY = [
  "readOnlyBackground",
  "readOnlyText",
  "readOnlyBorder",
] as const;

export const COMPONENT_COLOR_FIELDS = {
  "main-nav": [
    ...SURFACE,
    ...HOVER,
    "activeBackground",
    "activeText",
    "activeBorder",
  ],
  "app-background": ["canvas", "chrome"],
  "cta-primary": [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  "cta-secondary": [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  "cta-tertiary": [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  "cta-ghost": [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  "cta-link": [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  radio: [
    "defaultBackground",
    "defaultText",
    "defaultBorder",
    "hoverBackground",
    "hoverText",
    "hoverBorder",
    // Dot = the filled indicator inside the selected radio (not "text").
    "selectedBackground",
    "dot",
    "selectedBorder",
    ...FOCUS,
    ...DISABLED,
  ],
  checkbox: [
    "defaultBackground",
    "defaultText",
    "defaultBorder",
    "hoverBackground",
    "hoverText",
    "hoverBorder",
    ...SELECTED,
    ...FOCUS,
    ...DISABLED,
  ],
  toggle: [
    "offBackground",
    "offText",
    "offBorder",
    "onBackground",
    "onText",
    "onBorder",
    "thumb",
    "hoverBackground",
    "hoverText",
    "hoverBorder",
    ...FOCUS,
    "disabledBackground",
    "disabledText",
    "disabledBorder",
    "disabledThumb",
  ],
  tabs: [
    "listBackground",
    "listText",
    "listBorder",
    "inactiveText",
    ...HOVER,
    "activeBackground",
    "activeText",
    "activeBorder",
    ...FOCUS,
    ...DISABLED,
  ],
  badges: [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  dropdown: [
    ...SURFACE,
    ...HOVER,
    "activeBackground",
    "activeText",
    "activeBorder",
    ...FOCUS,
    ...DISABLED,
  ],
  inputs: [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED, ...READ_ONLY],
  sliders: [
    "track",
    "value",
    "thumb",
    "thumbBorder",
    "hoverBackground",
    "hoverText",
    "hoverBorder",
    "hoverThumbBorder",
    ...FOCUS,
    "disabledBackground",
    "disabledText",
    "disabledBorder",
    "disabledThumb",
  ],
  progress: ["track", "value"],
  cards: [...SURFACE, ...HOVER, ...FOCUS, ...DISABLED],
  "status-chips": [
    "successBackground",
    "successText",
    "warningBackground",
    "warningText",
    "errorBackground",
    "errorText",
    "infoBackground",
    "infoText",
    "draftBackground",
    "draftText",
    "qaBackground",
    "qaText",
    "readyBackground",
    "readyText",
    "runningBackground",
    "runningText",
    "analysisBackground",
    "analysisText",
    "pausedBackground",
    "pausedText",
    "endedBackground",
    "endedText",
  ],
} as const;

export type ComponentAppearanceId = keyof typeof COMPONENT_COLOR_FIELDS;
export type ComponentColorField =
  (typeof COMPONENT_COLOR_FIELDS)[ComponentAppearanceId][number];

export const COMPONENT_APPEARANCE_LABELS: Record<ComponentAppearanceId, string> = {
  "main-nav": "Main nav",
  "app-background": "Background",
  "cta-primary": "Primary CTA",
  "cta-secondary": "Secondary CTA",
  "cta-tertiary": "Tertiary CTA",
  "cta-ghost": "Ghost CTA",
  "cta-link": "Link CTA",
  radio: "Radio",
  checkbox: "Checkbox",
  toggle: "Toggle",
  tabs: "Tabs",
  badges: "Badges",
  dropdown: "Dropdown",
  inputs: "Inputs",
  sliders: "Sliders",
  progress: "Progress bars",
  cards: "Cards",
  "status-chips": "Status chips",
};

/** State sections shown in the picker. */
export type AppearanceFieldGroup = {
  id: string;
  label: string;
  fields: readonly string[];
};

const CTA_GROUPS: AppearanceFieldGroup[] = [
  { id: "default", label: "Default", fields: [...SURFACE] },
  { id: "hover", label: "Hover", fields: [...HOVER] },
  { id: "focus", label: "Focus", fields: [...FOCUS] },
  { id: "disabled", label: "Disabled", fields: [...DISABLED] },
];

export const COMPONENT_FIELD_GROUPS: Record<
  ComponentAppearanceId,
  AppearanceFieldGroup[]
> = {
  "main-nav": [
    { id: "default", label: "Default", fields: [...SURFACE] },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    {
      id: "selected",
      label: "Selected",
      fields: ["activeBackground", "activeText", "activeBorder"],
    },
  ],
  "app-background": [
    { id: "default", label: "Default", fields: ["canvas", "chrome"] },
  ],
  "cta-primary": CTA_GROUPS,
  "cta-secondary": CTA_GROUPS,
  "cta-tertiary": CTA_GROUPS,
  "cta-ghost": CTA_GROUPS,
  "cta-link": CTA_GROUPS,
  radio: [
    {
      id: "default",
      label: "Default",
      fields: ["defaultBackground", "defaultText", "defaultBorder"],
    },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    {
      id: "selected",
      label: "Selected",
      fields: ["selectedBackground", "dot", "selectedBorder"],
    },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    { id: "disabled", label: "Disabled", fields: [...DISABLED] },
  ],
  checkbox: [
    {
      id: "default",
      label: "Default",
      fields: ["defaultBackground", "defaultText", "defaultBorder"],
    },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    { id: "selected", label: "Selected", fields: [...SELECTED] },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    { id: "disabled", label: "Disabled", fields: [...DISABLED] },
  ],
  toggle: [
    {
      id: "default",
      label: "Default",
      fields: [
        "offBackground",
        "offText",
        "offBorder",
        "onBackground",
        "onText",
        "onBorder",
        "thumb",
      ],
    },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    {
      id: "disabled",
      label: "Disabled",
      fields: [
        "disabledBackground",
        "disabledText",
        "disabledBorder",
        "disabledThumb",
      ],
    },
  ],
  tabs: [
    {
      id: "default",
      label: "Default",
      fields: ["listBackground", "listText", "listBorder", "inactiveText"],
    },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    {
      id: "selected",
      // "Border" here is also the underline for the text/underline tab style.
      label: "Selected (active tab / underline)",
      fields: ["activeBackground", "activeText", "activeBorder"],
    },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    { id: "disabled", label: "Disabled", fields: [...DISABLED] },
  ],
  badges: CTA_GROUPS,
  dropdown: [
    { id: "default", label: "Default", fields: [...SURFACE] },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    {
      id: "selected",
      label: "Selected / item highlight",
      fields: ["activeBackground", "activeText", "activeBorder"],
    },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    { id: "disabled", label: "Disabled", fields: [...DISABLED] },
  ],
  inputs: [
    { id: "default", label: "Default", fields: [...SURFACE] },
    { id: "hover", label: "Hover", fields: [...HOVER] },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    { id: "disabled", label: "Disabled", fields: [...DISABLED] },
    { id: "readonly", label: "Read-only", fields: [...READ_ONLY] },
  ],
  sliders: [
    {
      id: "default",
      label: "Default",
      fields: ["track", "value", "thumb", "thumbBorder"],
    },
    {
      id: "hover",
      label: "Hover",
      fields: [
        "hoverBackground",
        "hoverText",
        "hoverBorder",
        "hoverThumbBorder",
      ],
    },
    { id: "focus", label: "Focus", fields: [...FOCUS] },
    {
      id: "disabled",
      label: "Disabled",
      fields: [
        "disabledBackground",
        "disabledText",
        "disabledBorder",
        "disabledThumb",
      ],
    },
  ],
  progress: [
    { id: "default", label: "Default", fields: ["track", "value"] },
  ],
  cards: CTA_GROUPS,
  "status-chips": [
    {
      id: "success",
      label: "Success",
      fields: ["successBackground", "successText"],
    },
    {
      id: "warning",
      label: "Warning",
      fields: ["warningBackground", "warningText"],
    },
    {
      id: "error",
      label: "Error",
      fields: ["errorBackground", "errorText"],
    },
    {
      id: "info",
      label: "Information",
      fields: ["infoBackground", "infoText"],
    },
    {
      id: "draft",
      label: "Draft",
      fields: ["draftBackground", "draftText"],
    },
    {
      id: "qa",
      label: "In QA",
      fields: ["qaBackground", "qaText"],
    },
    {
      id: "ready",
      label: "Ready to launch",
      fields: ["readyBackground", "readyText"],
    },
    {
      id: "running",
      label: "Running",
      fields: ["runningBackground", "runningText"],
    },
    {
      id: "analysis",
      label: "In Analysis",
      fields: ["analysisBackground", "analysisText"],
    },
    {
      id: "paused",
      label: "Paused",
      fields: ["pausedBackground", "pausedText"],
    },
    {
      id: "ended",
      label: "Ended",
      fields: ["endedBackground", "endedText"],
    },
  ],
};

export const COLOR_FIELD_LABELS: Record<string, string> = {
  background: "Background",
  text: "Text",
  border: "Border",
  canvas: "Page canvas",
  chrome: "Shell chrome",
  defaultBackground: "Background",
  defaultText: "Text",
  defaultBorder: "Border",
  selectedBackground: "Background",
  selectedText: "Text",
  selectedBorder: "Border",
  /** Radio only — the filled centre of the selected option. */
  dot: "Active dot",
  offBackground: "Off background",
  offText: "Off text",
  offBorder: "Off border",
  onBackground: "On background",
  onText: "On text",
  onBorder: "On border",
  thumb: "Thumb",
  thumbBorder: "Thumb border",
  listBackground: "List background",
  listText: "List text",
  listBorder: "List border",
  activeBackground: "Background",
  activeText: "Text",
  activeBorder: "Border",
  inactiveText: "Inactive text",
  focusBackground: "Background",
  focusText: "Text",
  focusBorder: "Border",
  focusRing: "Focus ring",
  track: "Track",
  value: "Fill / value",
  hoverBackground: "Background",
  hoverText: "Text",
  hoverBorder: "Border",
  hoverThumbBorder: "Thumb border",
  disabledBackground: "Background",
  disabledText: "Text",
  disabledBorder: "Border",
  disabledThumb: "Thumb",
  readOnlyBackground: "Background",
  readOnlyText: "Text",
  readOnlyBorder: "Border",
  successBackground: "Background",
  successText: "Text",
  warningBackground: "Background",
  warningText: "Text",
  errorBackground: "Background",
  errorText: "Text",
  infoBackground: "Background",
  infoText: "Text",
  draftBackground: "Background",
  draftText: "Text",
  qaBackground: "Background",
  qaText: "Text",
  readyBackground: "Background",
  readyText: "Text",
  runningBackground: "Background",
  runningText: "Text",
  analysisBackground: "Background",
  analysisText: "Text",
  pausedBackground: "Background",
  pausedText: "Text",
  endedBackground: "Background",
  endedText: "Text",
};

export type PaletteShade = {
  step: string;
  label: string;
  hex: string;
  value: string;
};

export type PaletteFamily = {
  id: string;
  label: string;
  shades: PaletteShade[];
};

/** A palette selection is stored by name so it can resolve in either palette pack. */
export type PaletteColourReference = {
  kind: "palette";
  family: string;
  step: string;
};

/** A custom picker selection remains a fixed colour across palette changes. */
export type CustomColourReference = {
  kind: "custom";
  value: string;
};

/** Explicitly transparent — not the same as clearing back to the theme default. */
export type NoneColourReference = {
  kind: "none";
};

export type ComponentColourReference =
  | PaletteColourReference
  | CustomColourReference
  | NoneColourReference;

/** Transparent HSL channels (matches --transparent in index.css). */
export const NONE_COLOUR_CHANNELS = "0 0% 0% / 0";

export const NONE_COLOUR: NoneColourReference = { kind: "none" };

const FAMILY_ORDER = [
  "yellow",
  "maroon",
  "cherry",
  "amber",
  "green",
  "ocean",
  "berry",
  "neutral",
  "midnight",
] as const;

export function hexToHslChannels(hex: string): string | null {
  const value = hex.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(value)) return null;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
  }
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta ? delta / (1 - Math.abs(2 * l - 1)) : 0;
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function buildPaletteFamilies(paletteId: PaletteId = DEFAULT_PALETTE_ID): PaletteFamily[] {
  const scales = getPaletteScales(paletteId);
  return FAMILY_ORDER.map((id) => {
    const scale = scales[id] as Record<string, string>;
    const shades = Object.entries(scale).map(([step, hex]) => {
      const value = hexToHslChannels(hex) ?? "0 0% 0%";
      return {
        step,
        label: `${id} ${step}`,
        hex,
        value,
      };
    });
    return {
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      shades,
    };
  });
}

export function getColorPaletteFamilies(
  paletteId: PaletteId = DEFAULT_PALETTE_ID
): PaletteFamily[] {
  return buildPaletteFamilies(paletteId);
}

export function resolveComponentColour(
  colour: ComponentColourReference,
  paletteId: PaletteId = DEFAULT_PALETTE_ID
): string {
  if (colour.kind === "none") return NONE_COLOUR_CHANNELS;
  if (colour.kind === "custom") return colour.value;
  return (
    getColorPaletteFamilies(paletteId)
      .find((family) => family.id === colour.family)
      ?.shades.find((shade) => shade.step === colour.step)?.value ??
    "0 0% 0%"
  );
}

/** Match a legacy stored HSL value to a named shade in the active palette. */
export function paletteColourForValue(
  value: string,
  paletteId: PaletteId = DEFAULT_PALETTE_ID
): PaletteColourReference | null {
  // Check the active pack first, then the other pack so saved New-palette
  // selections also become token-linked when the app opens in Current.
  const paletteIds = [paletteId, ...PALETTE_IDS.filter((id) => id !== paletteId)];
  for (const id of paletteIds) {
    for (const family of getColorPaletteFamilies(id)) {
      const shade = family.shades.find((candidate) => candidate.value === value);
      if (shade) return { kind: "palette", family: family.id, step: shade.step };
    }
  }
  return null;
}

export const COLOR_PALETTE_FAMILIES: PaletteFamily[] = buildPaletteFamilies();

export const COLOR_PALETTE = COLOR_PALETTE_FAMILIES.flatMap((family) =>
  family.shades.map((shade) => ({
    label: shade.label,
    value: shade.value,
  }))
);

export function componentCssVar(
  component: ComponentAppearanceId,
  field: string
) {
  return `--appearance-${component}-${field.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;
}

export function adaptChannelsForMode(
  channels: string,
  authoredMode: "light" | "dark",
  targetMode: "light" | "dark"
): string {
  // Transparent / none stays transparent in both modes.
  if (channels.includes("/") && /\/\s*0\s*$/.test(channels)) return channels;
  if (authoredMode === targetMode) return channels;
  const [h, s, l] = channels.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  const mirrored = Math.min(94, Math.max(10, 100 - l));
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(mirrored)}%`;
}

export function hslChannelsToHex(channels: string): string {
  const [h, s, l] = channels.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  const saturation = s / 100;
  const lightness = l / 100;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const toHex = (channel: number) =>
    Math.round((channel + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
