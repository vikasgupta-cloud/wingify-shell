export type IconLibraryId =
  | "lucide"
  | "phosphor"
  | "material"
  | "fontawesome"
  | "tabler"
  | "custom";

export type IconLibraryVariant = {
  id: string;
  label: string;
};

export type IconLibraryDef = {
  id: IconLibraryId;
  label: string;
  variants: IconLibraryVariant[];
};

export const ICON_LIBRARIES: IconLibraryDef[] = [
  {
    id: "lucide",
    label: "Lucide",
    variants: [
      { id: "thin", label: "Thin" },
      { id: "light", label: "Light" },
      { id: "regular", label: "Regular" },
      { id: "bold", label: "Bold" },
    ],
  },
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
    id: "custom",
    label: "Custom (Figma)",
    variants: [{ id: "default", label: "Default" }],
  },
];

export const DEFAULT_ICON_LIBRARY_ID: IconLibraryId = "lucide";
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
  const fallback = lib?.variants[0]?.id ?? DEFAULT_ICON_VARIANT;
  const id = typeof value === "string" ? value : fallback;
  return lib?.variants.some((v) => v.id === id) ? id : fallback;
}

export function defaultVariantForLibrary(libraryId: IconLibraryId): string {
  const lib = ICON_LIBRARIES.find((l) => l.id === libraryId);
  if (!lib) return DEFAULT_ICON_VARIANT;
  if (libraryId === "lucide") return "regular";
  if (libraryId === "custom") return "default";
  if (libraryId === "material") return "outlined";
  if (libraryId === "fontawesome") return "solid";
  if (libraryId === "tabler") return "outline";
  return lib.variants[0]?.id ?? DEFAULT_ICON_VARIANT;
}
