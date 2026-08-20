export type IconLibraryId =
  | "lucide"
  | "phosphor"
  | "material"
  | "fontawesome"
  | "tabler"
  | "heroicons"
  | "remix"
  | "bootstrap"
  | "iconoir"
  | "radix"
  | "fluent"
  | "solar"
  | "custom";

export type IconLibraryVariant = {
  id: string;
  label: string;
};

export type IconLibraryDef = {
  id: IconLibraryId;
  label: string;
  variants: IconLibraryVariant[];
  /** Short note shown under Style chips. */
  styleNote?: string;
};

export const ICON_LIBRARIES: IconLibraryDef[] = [
  {
    id: "phosphor",
    label: "Phosphor",
    variants: [
      { id: "thin", label: "Thin" },
      { id: "light", label: "Light" },
      { id: "regular", label: "Regular" },
      { id: "bold", label: "Bold" },
      { id: "fill", label: "Fill" },
      { id: "duotone", label: "Duotone" },
    ],
    styleNote: "Thin / Duotone apply only while Phosphor is selected.",
  },
  {
    id: "lucide",
    label: "Lucide",
    variants: [
      { id: "thin", label: "Thin" },
      { id: "light", label: "Light" },
      { id: "regular", label: "Regular" },
      { id: "bold", label: "Bold" },
    ],
    styleNote: "Stroke weight for Lucide glyphs.",
  },
  {
    id: "material",
    label: "Material",
    variants: [
      { id: "outlined", label: "Outlined" },
      { id: "filled", label: "Filled" },
      { id: "rounded", label: "Rounded" },
      { id: "sharp", label: "Sharp" },
      { id: "twotone", label: "Two-tone" },
    ],
    styleNote: "Sharp / Rounded / Two-tone are Material-only corner styles.",
  },
  {
    id: "fontawesome",
    label: "Font Awesome",
    variants: [
      { id: "solid", label: "Solid" },
      { id: "regular", label: "Regular" },
    ],
  },
  {
    id: "tabler",
    label: "Tabler",
    variants: [
      { id: "outline", label: "Outline" },
      { id: "filled", label: "Filled" },
    ],
  },
  {
    id: "heroicons",
    label: "Heroicons",
    variants: [
      { id: "outline", label: "Outline" },
      { id: "solid", label: "Solid" },
      { id: "mini", label: "Mini" },
    ],
  },
  {
    id: "remix",
    label: "Remix",
    variants: [
      { id: "line", label: "Line" },
      { id: "fill", label: "Fill" },
    ],
  },
  {
    id: "bootstrap",
    label: "Bootstrap",
    variants: [
      { id: "outline", label: "Outline" },
      { id: "fill", label: "Fill" },
    ],
  },
  {
    id: "iconoir",
    label: "Iconoir",
    variants: [
      { id: "regular", label: "Regular" },
      { id: "solid", label: "Solid" },
    ],
  },
  {
    id: "radix",
    label: "Radix",
    variants: [{ id: "default", label: "Default" }],
  },
  {
    id: "fluent",
    label: "Fluent",
    variants: [
      { id: "regular", label: "Regular" },
      { id: "filled", label: "Filled" },
      { id: "light", label: "Light" },
    ],
    styleNote: "Microsoft Fluent — Light is the thin stroke style (no Sharp set).",
  },
  {
    id: "solar",
    label: "Solar",
    variants: [
      { id: "linear", label: "Linear" },
      { id: "outline", label: "Outline" },
      { id: "bold", label: "Bold" },
      { id: "broken", label: "Broken" },
      { id: "lineduotone", label: "Line Duotone" },
      { id: "boldduotone", label: "Bold Duotone" },
    ],
    styleNote: "Solar has the richest style set after Material (no Sharp corners).",
  },
  {
    id: "custom",
    label: "Custom (Figma)",
    variants: [{ id: "default", label: "Default" }],
  },
];

export const DEFAULT_ICON_LIBRARY_ID: IconLibraryId = "phosphor";
export const DEFAULT_ICON_VARIANT = "regular";

export function resolveIconLibraryId(value: unknown): IconLibraryId {
  const id = typeof value === "string" ? value : DEFAULT_ICON_LIBRARY_ID;
  return ICON_LIBRARIES.some((l) => l.id === id)
    ? (id as IconLibraryId)
    : DEFAULT_ICON_LIBRARY_ID;
}

export function resolveIconVariant(
  libraryId: IconLibraryId,
  value: unknown
): string {
  const lib = ICON_LIBRARIES.find((l) => l.id === libraryId);
  const fallback = defaultVariantForLibrary(libraryId);
  const id = typeof value === "string" ? value : fallback;
  return lib?.variants.some((v) => v.id === id) ? id : fallback;
}

export function defaultVariantForLibrary(libraryId: IconLibraryId): string {
  switch (libraryId) {
    case "lucide":
    case "phosphor":
    case "fluent":
    case "iconoir":
      return "regular";
    case "material":
      return "outlined";
    case "fontawesome":
      return "solid";
    case "tabler":
    case "heroicons":
    case "bootstrap":
      return "outline";
    case "remix":
      return "line";
    case "solar":
      return "linear";
    case "radix":
    case "custom":
      return "default";
    default:
      return DEFAULT_ICON_VARIANT;
  }
}
