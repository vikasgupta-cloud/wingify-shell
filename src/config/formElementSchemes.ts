import tokens from "./tokens.json";
import type { ColorMode } from "./themes";

/**
 * Yellow button-color sub-themes — primary (CTA) stays lemon yellow; secondary
 * drives form controls (checkbox, radio, switch, slider) and related chrome.
 * Only applied while the Yellow button theme is active.
 */

export const FORM_ELEMENT_SCHEME_IDS = [
  "yellow-yellow",
  "yellow-yellow-500",
  "yellow-yellow-border",
  "yellow-black",
  "yellow-graphite",
  "yellow-blue",
  "yellow-forest",
  "yellow-berry",
  "yellow-maroon",
  "yellow-cherry",
] as const;

export type FormElementSchemeId = (typeof FORM_ELEMENT_SCHEME_IDS)[number];

export const DEFAULT_FORM_ELEMENT_SCHEME_ID: FormElementSchemeId =
  "yellow-yellow";

/** Legacy ids from earlier Appearance builds. */
const LEGACY_FORM_ELEMENT_SCHEME_IDS: Record<string, FormElementSchemeId> = {
  match: "yellow-yellow",
  "yellow-b": "yellow-maroon",
};

/** Preview chips: card, input rail, selection tint, control fill, CTA pill. */
export type FormElementSwatch = {
  surface: string;
  field: string;
  tint: string;
  control: string;
  cta: string;
};

export type FormElementSchemeOption = {
  id: FormElementSchemeId;
  label: string;
  description: string;
  swatch: { light: FormElementSwatch; dark: FormElementSwatch };
};

const { scales, semantic } = tokens;

type ControlFamily =
  | "yellow"
  | "yellow-500"
  | "yellow-border"
  | "black"
  | "neutral"
  | "ocean"
  | "green"
  | "berry"
  | "maroon"
  | "cherry";

/** Families that take the shared tinted recipe below. */
type TintedFamily = Exclude<
  ControlFamily,
  "yellow" | "yellow-500" | "yellow-border" | "black"
>;

/**
 * Per-family steps for the filled control and its focus ring. Steps differ by
 * family so every control clears 4.5:1 against its own label colour — deep
 * enough for white text in light mode, bright enough for ink in dark.
 */
const FAMILY_STEPS: Record<
  TintedFamily,
  { light: { control: string; ring: string }; dark: { control: string; ring: string } }
> = {
  neutral: { light: { control: "700", ring: "500" }, dark: { control: "300", ring: "200" } },
  ocean: { light: { control: "600", ring: "500" }, dark: { control: "400", ring: "300" } },
  green: { light: { control: "600", ring: "400" }, dark: { control: "300", ring: "200" } },
  berry: { light: { control: "600", ring: "500" }, dark: { control: "400", ring: "300" } },
  maroon: { light: { control: "700", ring: "500" }, dark: { control: "400", ring: "300" } },
  cherry: { light: { control: "600", ring: "500" }, dark: { control: "400", ring: "300" } },
};

const SCHEME_CONTROL_FAMILY: Record<FormElementSchemeId, ControlFamily> = {
  "yellow-yellow": "yellow",
  "yellow-yellow-500": "yellow-500",
  "yellow-yellow-border": "yellow-border",
  "yellow-black": "black",
  "yellow-graphite": "neutral",
  "yellow-blue": "ocean",
  "yellow-forest": "green",
  "yellow-berry": "berry",
  "yellow-maroon": "maroon",
  "yellow-cherry": "cherry",
};

const SCHEME_LABEL: Record<FormElementSchemeId, string> = {
  "yellow-yellow": "Yellow",
  "yellow-yellow-500": "Yellow 500",
  "yellow-yellow-border": "Yellow border",
  "yellow-black": "Black",
  "yellow-graphite": "Graphite",
  "yellow-blue": "Blue",
  "yellow-forest": "Forest",
  "yellow-berry": "Berry",
  "yellow-maroon": "Maroon",
  "yellow-cherry": "Cherry",
};

function v(family: string, step: string): string {
  return `var(--vwo-${family}-${step})`;
}

/** Inverted chrome — controls go ink-on-paper against the yellow CTA. */
function blackChrome(mode: ColorMode): Record<string, string> {
  if (mode === "dark") {
    return {
      "--control": "var(--vwo-neutral-0)",
      "--control-foreground": "var(--vwo-neutral-950)",
      "--control-border": "var(--vwo-neutral-0)",
      "--ring": "var(--vwo-neutral-300)",
      "--accent": "var(--vwo-dark-bg-hover)",
      "--accent-foreground": "var(--vwo-neutral-0)",
      "--selected-bg": "var(--vwo-dark-bg-hover)",
      "--selected-fg": "var(--vwo-neutral-0)",
      "--brand-deep": "var(--vwo-neutral-0)",
      "--report-brand": "var(--vwo-neutral-0)",
      "--report-brand-fg": "var(--vwo-neutral-300)",
      "--report-brand-tint": "var(--vwo-dark-bg-hover)",
    };
  }
  return {
    "--control": "var(--vwo-neutral-950)",
    "--control-foreground": "var(--vwo-neutral-0)",
    "--control-border": "var(--vwo-neutral-950)",
    "--ring": "var(--vwo-neutral-800)",
    "--accent": v("neutral", "100"),
    "--accent-foreground": "var(--vwo-neutral-950)",
    "--selected-bg": v("neutral", "100"),
    "--selected-fg": "var(--vwo-neutral-950)",
    "--brand-deep": "var(--vwo-neutral-950)",
    "--report-brand": "var(--vwo-neutral-950)",
    "--report-brand-fg": v("neutral", "800"),
    "--report-brand-tint": v("neutral", "100"),
  };
}

/**
 * Lemon secondary fills with yellow-500 strokes on controls and primary CTAs.
 */
function yellowBorderChrome(mode: ColorMode): Record<string, string> {
  if (mode === "dark") {
    return {
      "--control": v("yellow", "50"),
      "--control-foreground": "var(--vwo-neutral-950)",
      "--control-border": v("yellow", "300"),
      "--primary-border": v("yellow", "300"),
      "--cta-secondary-fg": v("yellow", "200"),
      "--ring": v("yellow", "200"),
      "--accent": v("yellow", "900"),
      "--accent-foreground": v("yellow", "100"),
      "--selected-bg": v("yellow", "900"),
      "--selected-fg": v("yellow", "200"),
      "--brand-deep": v("yellow", "900"),
      "--report-brand": v("yellow", "900"),
      "--report-brand-fg": v("yellow", "300"),
      "--report-brand-tint": v("yellow", "900"),
    };
  }

  return {
    "--control": v("yellow", "50"),
    "--control-foreground": "var(--vwo-neutral-950)",
    "--control-border": v("yellow", "500"),
    "--primary-border": v("yellow", "500"),
    "--primary-foreground": v("yellow", "800"),
    "--cta-secondary-fg": v("yellow", "700"),
    "--ring": v("yellow", "400"),
    "--accent": v("yellow", "100"),
    "--accent-foreground": v("yellow", "800"),
    "--selected-bg": v("yellow", "100"),
    "--selected-fg": v("yellow", "800"),
    "--brand-deep": v("yellow", "900"),
    "--report-brand": v("yellow", "900"),
    "--report-brand-fg": v("yellow", "800"),
    "--report-brand-tint": v("yellow", "50"),
  };
}

/**
 * Yellow-500 secondary controls and primary borders. Slider range uses the
 * same control fill with no stroke chrome.
 */
function yellow500Chrome(mode: ColorMode): Record<string, string> {
  if (mode === "dark") {
    return {
      "--control": v("yellow", "300"),
      "--control-foreground": "var(--vwo-neutral-950)",
      "--control-border": v("yellow", "300"),
      "--primary-border": v("yellow", "300"),
      "--cta-secondary-fg": v("yellow", "200"),
      "--ring": v("yellow", "200"),
      "--accent": v("yellow", "900"),
      "--accent-foreground": v("yellow", "100"),
      "--selected-bg": v("yellow", "900"),
      "--selected-fg": v("yellow", "200"),
      "--brand-deep": v("yellow", "900"),
      "--report-brand": v("yellow", "900"),
      "--report-brand-fg": v("yellow", "300"),
      "--report-brand-tint": v("yellow", "900"),
    };
  }

  return {
    "--control": v("yellow", "500"),
    "--control-foreground": "var(--vwo-neutral-0)",
    "--control-border": v("yellow", "500"),
    "--primary-border": v("yellow", "500"),
    "--primary-foreground": v("yellow", "800"),
    "--cta-secondary-fg": v("yellow", "700"),
    "--ring": v("yellow", "400"),
    "--accent": v("yellow", "100"),
    "--accent-foreground": v("yellow", "800"),
    "--selected-bg": v("yellow", "100"),
    "--selected-fg": v("yellow", "800"),
    "--brand-deep": v("yellow", "900"),
    "--report-brand": v("yellow", "900"),
    "--report-brand-fg": v("yellow", "800"),
    "--report-brand-tint": v("yellow", "50"),
  };
}

/**
 * Shared recipe for every tinted family: saturated fill, one step brighter
 * ring, and a single soft tint (100 / 900) carrying hover, selection, and
 * report surfaces so nothing in the chrome fights the yellow CTA.
 * Links stay semantic blue (--link / --report-link) for every sub-theme.
 */
function tintedChrome(
  family: TintedFamily,
  mode: ColorMode
): Record<string, string> {
  const steps = FAMILY_STEPS[family][mode];

  if (mode === "dark") {
    return {
      "--control": v(family, steps.control),
      "--control-foreground": "var(--vwo-neutral-950)",
      "--control-border": v(family, steps.control),
      "--ring": v(family, steps.ring),
      "--accent": v(family, "900"),
      "--accent-foreground": v(family, "100"),
      "--selected-bg": v(family, "900"),
      "--selected-fg": v(family, "200"),
      "--brand-deep": v(family, "900"),
      "--report-brand": v(family, "900"),
      "--report-brand-fg": v(family, "300"),
      "--report-brand-tint": v(family, "900"),
    };
  }

  return {
    "--control": v(family, steps.control),
    "--control-foreground": "var(--vwo-neutral-0)",
    "--control-border": v(family, steps.control),
    "--ring": v(family, steps.ring),
    "--accent": v(family, "100"),
    "--accent-foreground": v(family, "800"),
    "--selected-bg": v(family, "100"),
    "--selected-fg": v(family, "800"),
    "--brand-deep": v(family, "900"),
    "--report-brand": v(family, "900"),
    "--report-brand-fg": v(family, "800"),
    "--report-brand-tint": v(family, "50"),
  };
}

function controlChrome(
  family: ControlFamily,
  mode: ColorMode
): Record<string, string> {
  if (family === "yellow") return {};
  if (family === "yellow-500") return yellow500Chrome(mode);
  if (family === "yellow-border") return yellowBorderChrome(mode);
  if (family === "black") return blackChrome(mode);
  return tintedChrome(family, mode);
}

/** Preview colours mirror the recipe above so swatches cannot drift. */
function swatchFor(
  family: ControlFamily,
  mode: ColorMode
): FormElementSwatch {
  const light = mode === "light";
  const surface = light ? scales.neutral["0"] : semantic.dark["bg.surface"];
  const field = light ? scales.neutral["200"] : scales.neutral["600"];
  const cta = scales.yellow["50"];

  if (family === "yellow") {
    return {
      surface,
      field,
      tint: light ? scales.neutral["100"] : scales.neutral["800"],
      control: scales.yellow["50"],
      cta,
    };
  }

  if (family === "yellow-500") {
    return {
      surface,
      field,
      // Secondary CTA label (--cta-secondary-fg).
      tint: light ? scales.yellow["700"] : scales.yellow["200"],
      control: light ? scales.yellow["500"] : scales.yellow["300"],
      cta,
    };
  }

  if (family === "yellow-border") {
    return {
      surface,
      field,
      // Secondary CTA label (--cta-secondary-fg).
      tint: light ? scales.yellow["700"] : scales.yellow["200"],
      control: scales.yellow["50"],
      cta,
    };
  }

  if (family === "black") {
    return {
      surface,
      field,
      tint: light ? scales.neutral["100"] : scales.neutral["800"],
      control: light ? scales.neutral["950"] : scales.neutral["0"],
      cta,
    };
  }

  const step = FAMILY_STEPS[family][mode].control;
  const scale = scales[family] as Record<string, string>;
  return {
    surface,
    field,
    tint: light ? scale["100"] : scale["800"],
    control: scale[step],
    cta,
  };
}

export const FORM_ELEMENT_SCHEMES: FormElementSchemeOption[] =
  FORM_ELEMENT_SCHEME_IDS.map((id) => {
    const family = SCHEME_CONTROL_FAMILY[id];
    const label = SCHEME_LABEL[id];
    return {
      id,
      label,
      description:
        id === "yellow-yellow-500"
          ? "Yellow-500 controls and borders; primary text 800, secondary text 700"
          : id === "yellow-yellow-border"
            ? "Lemon controls, yellow-500 borders; primary text 800, secondary text 700"
            : `Yellow buttons, ${label.toLowerCase()} form controls`,
      swatch: {
        light: swatchFor(family, "light"),
        dark: swatchFor(family, "dark"),
      },
    };
  });

export function isFormElementSchemeId(
  value: unknown
): value is FormElementSchemeId {
  return (
    typeof value === "string" &&
    (FORM_ELEMENT_SCHEME_IDS as readonly string[]).includes(value)
  );
}

export function resolveFormElementSchemeId(
  value: unknown
): FormElementSchemeId {
  if (isFormElementSchemeId(value)) return value;
  if (typeof value === "string" && value in LEGACY_FORM_ELEMENT_SCHEME_IDS) {
    return LEGACY_FORM_ELEMENT_SCHEME_IDS[value];
  }
  return DEFAULT_FORM_ELEMENT_SCHEME_ID;
}

/** True when the scheme remaps secondary chrome away from the button color. */
export function formElementSchemeOverridesTheme(
  schemeId: FormElementSchemeId
): boolean {
  return SCHEME_CONTROL_FAMILY[schemeId] !== "yellow";
}

/** Control / secondary chrome vars for a yellow sub-theme. Empty = inherit. */
export function computeFormElementVars(
  schemeId: FormElementSchemeId,
  mode: ColorMode
): Record<string, string> {
  return controlChrome(SCHEME_CONTROL_FAMILY[schemeId], mode);
}

export const FORM_ELEMENT_VARS: readonly string[] = Array.from(
  new Set(
    FORM_ELEMENT_SCHEME_IDS.flatMap((id) => [
      ...Object.keys(computeFormElementVars(id, "light")),
      ...Object.keys(computeFormElementVars(id, "dark")),
    ])
  )
);
