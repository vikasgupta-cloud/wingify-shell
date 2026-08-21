import tokens from "./tokens.json";
import { applyBrand } from "./applyBrand";
import {
  resolveFormElementSchemeId,
  type FormElementSchemeId,
} from "./formElementSchemes";
import {
  resolveSurfaceSchemeId,
  type SurfaceSchemeId,
} from "./surfaceTokens";
import type { ColorMode, ThemeId } from "./themes";
import type { FontId, FontRole } from "./fonts";
import { FONTS } from "./fonts";

/**
 * App role CSS variables snapshotted as resolved hex for each color mode.
 * Includes theme, form-element, and surface roles so Appearance changes land
 * in the download.
 */
const ROLE_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--primary-hover",
  "--primary-active",
  "--primary-subtle",
  "--primary-border",
  "--cta-secondary-fg",
  "--control",
  "--control-foreground",
  "--control-border",
  "--control-selected-bg",
  "--control-selected-fg",
  "--control-selected-border",
  "--secondary",
  "--secondary-foreground",
  "--secondary-hover",
  "--muted",
  "--muted-foreground",
  "--canvas",
  "--surface",
  "--surface-border",
  "--accent",
  "--accent-foreground",
  "--selected-bg",
  "--selected-fg",
  "--link",
  "--link-hover",
  "--brand-deep",
  "--border",
  "--input",
  "--ring",
  "--destructive",
  "--destructive-foreground",
  "--rail",
  "--rail-foreground",
  "--rail-active",
  "--rail-active-foreground",
  "--panel",
  "--panel-foreground",
  "--panel-border",
  "--success-fg",
  "--success-bg",
  "--danger-fg",
  "--danger-bg",
  "--warning-fg",
  "--warning-bg",
  "--info-fg",
  "--info-bg",
  "--report-brand",
  "--report-brand-fg",
  "--report-brand-tint",
  "--report-link",
] as const;

function channelToHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

/** Convert `rgb()` / `rgba()` from getComputedStyle to #RRGGBB. */
function rgbToHex(rgb: string): string {
  const match = rgb.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/
  );
  if (!match) return rgb;
  return `#${channelToHex(+match[1])}${channelToHex(+match[2])}${channelToHex(+match[3])}`.toUpperCase();
}

function resolveRoleColor(varName: string): string {
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;left:-9999px;top:0;pointer-events:none;visibility:hidden";
  probe.style.color = `var(${varName})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return rgbToHex(resolved);
}

export function snapshotRoles(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of ROLE_VARS) {
    out[name] = resolveRoleColor(name);
  }
  const root = getComputedStyle(document.documentElement);
  out["--radius"] = root.getPropertyValue("--radius").trim() || "0.625rem";
  return out;
}

function snapshotFonts(
  assignments: Record<FontRole, FontId>
): Record<string, { id: FontId; stack: string }> {
  const out: Record<string, { id: FontId; stack: string }> = {};
  for (const [role, id] of Object.entries(assignments) as [
    FontRole,
    FontId,
  ][]) {
    const font = FONTS.find((f) => f.id === id);
    out[role] = { id, stack: font?.stack ?? id };
  }
  return out;
}

export type DesignTokenExport = {
  exportedAt: string;
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  headerTokenId: string | null;
  /** Yellow form-element sub-theme (controls / primary-border). */
  formElementSchemeId: FormElementSchemeId;
  /** Chrome / body / card surface preset; null = theme defaults. */
  surfaceSchemeId: SurfaceSchemeId | null;
  fonts: Record<string, { id: FontId; stack: string }>;
  scales: (typeof tokens)["scales"];
  semantic: (typeof tokens)["semantic"];
  roles: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

type ExportOptions = {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId?: string | null;
  headerTokenId?: string | null;
  formElementSchemeId?: FormElementSchemeId | null;
  surfaceSchemeId?: SurfaceSchemeId | null;
  fontAssignments: Record<FontRole, FontId>;
};

function exportBasename(payload: DesignTokenExport): string {
  const parts = ["wingify-design-tokens", payload.themeId];
  if (payload.themeId === "yellow") {
    parts.push(payload.formElementSchemeId);
  }
  if (payload.surfaceSchemeId) {
    parts.push(payload.surfaceSchemeId);
  }
  parts.push(payload.exportedAt.slice(0, 10));
  return parts.join("-");
}

/**
 * Build a downloadable token pack: source scales/semantic plus resolved
 * app-role colors for the current Appearance selection in light and dark.
 */
export function buildDesignTokenExport(
  options: ExportOptions
): DesignTokenExport {
  const {
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId = null,
    headerTokenId = null,
    formElementSchemeId = null,
    surfaceSchemeId = null,
    fontAssignments,
  } = options;
  const root = document.documentElement;
  const scheme = resolveFormElementSchemeId(formElementSchemeId);
  const surface = resolveSurfaceSchemeId(surfaceSchemeId);

  const snapMode = (mode: ColorMode) => {
    applyBrand(
      themeId,
      mode,
      ctaTokenId,
      backgroundTokenId,
      headerTokenId,
      scheme,
      surface
    );
    // Force style recalc before reading computed colors.
    void root.offsetHeight;
    return snapshotRoles();
  };

  const light = snapMode("light");
  const dark = snapMode("dark");

  // Restore the user's active mode + schemes.
  applyBrand(
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    scheme,
    surface
  );

  return {
    exportedAt: new Date().toISOString(),
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    formElementSchemeId: scheme,
    surfaceSchemeId: surface,
    fonts: snapshotFonts(fontAssignments),
    scales: tokens.scales,
    semantic: tokens.semantic,
    roles: { light, dark },
  };
}

function triggerDownload(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Download JSON with scales, semantic, fonts, schemes, and light+dark roles. */
export function downloadDesignTokensJson(options: ExportOptions) {
  const payload = buildDesignTokenExport(options);
  triggerDownload(
    `${exportBasename(payload)}.json`,
    `${JSON.stringify(payload, null, 2)}\n`,
    "application/json"
  );
}

/** Download CSS custom properties for light and dark from the same snapshot. */
export function downloadDesignTokensCss(options: ExportOptions) {
  const payload = buildDesignTokenExport(options);
  const lines: string[] = [
    `/* Wingify design tokens */`,
    `/* theme: ${payload.themeId} */`,
    `/* form-elements: ${payload.formElementSchemeId} */`,
    `/* surface: ${payload.surfaceSchemeId ?? "default"} */`,
    `/* cta: ${payload.ctaTokenId ?? "theme"} */`,
    `/* background: ${payload.backgroundTokenId ?? "theme"} */`,
    `/* header: ${payload.headerTokenId ?? "theme"} */`,
    `/* Exported ${payload.exportedAt} */`,
    "",
    ":root,",
    '[data-mode="light"] {',
  ];
  for (const [key, value] of Object.entries(payload.roles.light)) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push("}", "", '[data-mode="dark"] {');
  for (const [key, value] of Object.entries(payload.roles.dark)) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push("}", "");

  triggerDownload(
    `${exportBasename(payload)}.css`,
    lines.join("\n"),
    "text/css"
  );
}
