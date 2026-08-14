import tokens from "./tokens.json";
import { applyBrand } from "./applyBrand";
import {
  resolveFormElementSchemeId,
  type FormElementSchemeId,
} from "./formElementSchemes";
import type { ColorMode, ThemeId } from "./themes";
import type { FontId, FontRole } from "./fonts";
import { FONTS } from "./fonts";

/** App role CSS variables snapshotted as resolved hex for each color mode. */
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
  "--control",
  "--control-foreground",
  "--control-border",
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
  probe.style.color = `hsl(var(${varName}))`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return rgbToHex(resolved);
}

function snapshotRoles(): Record<string, string> {
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
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  headerTokenId: string | null;
  fonts: Record<string, { id: FontId; stack: string }>;
  scales: (typeof tokens)["scales"];
  semantic: (typeof tokens)["semantic"];
  roles: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

/**
 * Build a downloadable token pack: source scales/semantic plus resolved
 * app-role colors for the current accent in both light and dark modes.
 */
export function buildDesignTokenExport(options: {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId?: string | null;
  headerTokenId?: string | null;
  formElementSchemeId?: FormElementSchemeId | null;
  fontAssignments: Record<FontRole, FontId>;
}): DesignTokenExport {
  const {
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId = null,
    headerTokenId = null,
    formElementSchemeId = null,
    fontAssignments,
  } = options;
  const root = document.documentElement;
  const scheme = resolveFormElementSchemeId(formElementSchemeId);

  const snapMode = (mode: ColorMode) => {
    applyBrand(
      themeId,
      mode,
      ctaTokenId,
      backgroundTokenId,
      headerTokenId,
      scheme
    );
    // Force style recalc before reading computed colors.
    void root.offsetHeight;
    return snapshotRoles();
  };

  const light = snapMode("light");
  const dark = snapMode("dark");

  // Restore the user's active mode.
  applyBrand(
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    scheme
  );

  return {
    exportedAt: new Date().toISOString(),
    themeId,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
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

/** Download JSON with scales, semantic, fonts, and light+dark resolved roles. */
export function downloadDesignTokensJson(options: {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId?: string | null;
  headerTokenId?: string | null;
  formElementSchemeId?: FormElementSchemeId | null;
  fontAssignments: Record<FontRole, FontId>;
}) {
  const payload = buildDesignTokenExport(options);
  const stamp = payload.exportedAt.slice(0, 10);
  triggerDownload(
    `wingify-design-tokens-${payload.themeId}-${stamp}.json`,
    `${JSON.stringify(payload, null, 2)}\n`,
    "application/json"
  );
}

/** Download CSS custom properties for light and dark from the same snapshot. */
export function downloadDesignTokensCss(options: {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId?: string | null;
  headerTokenId?: string | null;
  formElementSchemeId?: FormElementSchemeId | null;
  fontAssignments: Record<FontRole, FontId>;
}) {
  const payload = buildDesignTokenExport(options);
  const lines: string[] = [
    `/* Wingify design tokens — theme: ${payload.themeId} */`,
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

  const stamp = payload.exportedAt.slice(0, 10);
  triggerDownload(
    `wingify-design-tokens-${payload.themeId}-${stamp}.css`,
    lines.join("\n"),
    "text/css"
  );
}
