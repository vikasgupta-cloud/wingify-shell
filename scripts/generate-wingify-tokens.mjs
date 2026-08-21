#!/usr/bin/env node
/**
 * Builds CSS custom properties from Figma DTCG token JSON in
 * src/config/tokens/figma/. Run: node scripts/generate-wingify-tokens.mjs
 *
 * Output:
 *   src/styles/tokens.generated.css  — primitives, overlays, semantic light/dark,
 *                                       component radius/space/size, app role bridge
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const figmaDir = path.join(root, "src/config/tokens/figma");
const outFile = path.join(root, "src/styles/tokens.generated.css");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(figmaDir, name), "utf8"));
}

function normalizeHex(hex, alpha = 1) {
  let h = String(hex).replace("#", "").trim().toUpperCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 8) return `#${h}`;
  if (alpha != null && alpha < 1) {
    const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
    return `#${h.slice(0, 6)}${a}`;
  }
  return `#${h.slice(0, 6)}`;
}

function colorValue(token) {
  const v = token.$value;
  if (typeof v === "string" && v.startsWith("{")) {
    // {semantic.text.primary} → var(--semantic-text-primary)
    const name = v
      .replace(/^\{|\}$/g, "")
      .replace(/\./g, "-")
      .replace(/\//g, "-");
    return `var(--${name})`;
  }
  if (v && typeof v === "object" && (v.hex || v.components)) {
    const hex =
      v.hex ||
      `#${v.components
        .slice(0, 3)
        .map((c) =>
          Math.round(c * 255)
            .toString(16)
            .padStart(2, "0")
        )
        .join("")}`;
    return normalizeHex(hex, v.alpha ?? 1);
  }
  return null;
}

function dimValue(token, resolveRef) {
  const v = token.$value;
  if (typeof v === "number") return `${v}px`;
  if (typeof v === "string" && v.startsWith("{")) {
    return resolveRef(v);
  }
  if (typeof v === "string" && v.endsWith("px")) return v;
  if (typeof v === "string" && !Number.isNaN(Number(v))) return `${v}px`;
  return null;
}

function webName(token, fallbackPath) {
  const web = token.$extensions?.["com.figma.codeSyntax"]?.WEB;
  if (web) return web.replace(/^var\(|\)$/g, "");
  return `--${fallbackPath.replace(/\//g, "-")}`;
}

function walk(obj, pathParts = [], visit) {
  if (!obj || typeof obj !== "object") return;
  if ("$value" in obj) {
    visit(pathParts.join("/"), obj);
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    walk(v, [...pathParts, k], visit);
  }
}

function collectColors(data) {
  const out = [];
  walk(data, [], (p, token) => {
    if (token.$type && token.$type !== "color") return;
    const css = colorValue(token);
    if (!css) return;
    out.push([webName(token, p), css, token.$value?.hex]);
  });
  return out;
}

function collectDims(data) {
  const raw = new Map(); // path → token
  walk(data, [], (p, token) => {
    raw.set(p, token);
  });

  function resolveRef(ref) {
    const key = ref.replace(/^\{|\}$/g, "").replace(/\./g, "/");
    // try size/border-thick style paths
    const candidates = [key, key.replace(/^size\./, "size/"), key.replace(/\./g, "/")];
    for (const c of candidates) {
      const t = raw.get(c);
      if (!t) continue;
      const name = webName(t, c);
      return `var(${name})`;
    }
    // fallback: {size.border-thick} → var(--size-border-thick)
    return `var(--${key.replace(/\//g, "-").replace(/\./g, "-")})`;
  }

  const out = [];
  for (const [p, token] of raw) {
    if (token.$type === "color") continue;
    const css = dimValue(token, resolveRef);
    if (css == null) continue;
    out.push([webName(token, p), css]);
  }
  return out;
}

function block(selector, entries, comment) {
  const lines = entries
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `/* ${comment} */\n${selector} {\n${lines}\n}\n`;
}

const primitives = readJson("primitives.json");
const overlays = readJson("overlays.json");
const component = readJson("component.json");
const semanticLight = readJson("semantic.light.json");
const semanticDark = readJson("semantic.dark.json");
const onCanvas = readJson("on-canvas.light.json");
const onSurface = readJson("on-surface.light.json");

const primitiveColors = collectColors(primitives);
const overlayColors = collectColors(overlays);
const primitiveDims = collectDims(primitives).filter(([n]) =>
  /--(radius|space|size)-/.test(n)
);
const componentDims = collectDims(component);

const lightSemantic = collectColors(semanticLight);
const darkSemantic = collectColors(semanticDark);

// Context packs (light) — emit under scoped names used by Figma WEB vars on
// On_canvas / On_surface exports (level-1 etc.) plus keep semantic context from packs.
const onCanvasColors = collectColors(onCanvas).map(([n, v, h]) => [
  n.startsWith("--") && !n.includes("on-canvas")
    ? n.replace("--", "--on-canvas-")
    : n,
  v,
  h,
]);
const onSurfaceColors = collectColors(onSurface).map(([n, v, h]) => [
  n.startsWith("--") && !n.includes("on-surface")
    ? n.replace("--", "--on-surface-")
    : n,
  v,
  h,
]);

// Compatibility: --vwo-neutral-* → --neutral-*
const vwoNeutralAliases = primitiveColors
  .filter(([n]) => n.startsWith("--neutral-"))
  .map(([n, v]) => [n.replace("--neutral-", "--vwo-neutral-"), `var(${n})`]);

// Color family aliases cherry/amber/... already emitted as --cherry-500 etc.
const vwoFamilyAliases = primitiveColors
  .filter(([n]) =>
    /^--(cherry|amber|yellow|green|ocean|berry|maroon|thermal)-/.test(n)
  )
  .map(([n]) => [n.replace("--", "--vwo-"), `var(${n})`]);

/**
 * Map a semantic web name → absolute channel value from a collected pack.
 */
function semanticLookup(pack, webName) {
  const hit = pack.find(([n]) => n === webName);
  if (hit) return hit[1];
  const prim = primitiveColors.find(([n]) => n === webName);
  return prim ? prim[1] : null;
}

function buildLegacyAbsolute(prefix, pack) {
  const map = {
    "bg-canvas": "--semantic-bg-canvas",
    "bg-surface": "--semantic-bg-surface",
    "bg-surface-raised": "--semantic-bg-surface-raised",
    "bg-surface-sunken": "--semantic-context-on-surface-sunken",
    "bg-hover": "--semantic-context-on-surface-hover",
    "bg-active": "--semantic-context-on-surface-active",
    "bg-selected": "--semantic-bg-selected",
    "bg-disabled": "--semantic-bg-disabled",
    "text-primary": "--semantic-text-primary",
    "text-secondary": "--semantic-text-secondary",
    "text-tertiary": "--semantic-text-disabled",
    "text-placeholder": "--semantic-text-disabled",
    "text-disabled": "--semantic-text-disabled",
    "text-link": "--semantic-text-link",
    "text-link-hover": "--semantic-text-link-hover",
    "border-subtle": "--semantic-border-subtle",
    "border-default": "--semantic-border-subtle",
    "border-control": "--semantic-border-strong",
    "border-strong": "--semantic-border-strong",
    "border-focus": "--semantic-border-focus",
    "action-primary-bg": "--semantic-action-primary-bg",
    "action-primary-bg-hover": "--semantic-action-primary-bg-hover",
    "action-primary-bg-active": "--semantic-action-primary-bg-active",
    "action-primary-text": "--semantic-action-primary-text",
    "action-secondary-bg": "--semantic-bg-surface",
    "action-secondary-bg-hover": "--semantic-context-on-surface-hover",
    "action-secondary-border": "--semantic-action-secondary-border",
    "action-secondary-text": "--semantic-action-secondary-text",
    "action-subtle-bg-hover": "--semantic-context-on-surface-hover",
    "action-subtle-text": "--semantic-action-ghost-text",
    "action-destructive-bg": "--semantic-action-destructive-bg",
    "action-destructive-bg-hover": "--semantic-action-destructive-bg-hover",
    "action-destructive-text": "--semantic-action-destructive-text",
    "status-error-bg": "--semantic-status-error-soft-bg",
    "status-error-border": "--semantic-status-error-soft-border",
    "status-error-text": "--semantic-status-error-soft-text",
    "status-error-solid": "--semantic-status-error-strong-bg",
    "status-error-solid-text": "--semantic-status-strong-text",
    "status-warning-bg": "--semantic-status-warning-soft-bg",
    "status-warning-border": "--semantic-status-warning-soft-border",
    "status-warning-text": "--semantic-status-warning-soft-text",
    "status-warning-solid": "--semantic-status-warning-strong-bg",
    "status-warning-solid-text": "--semantic-status-strong-text",
    "status-success-bg": "--semantic-status-success-soft-bg",
    "status-success-border": "--semantic-status-success-soft-border",
    "status-success-text": "--semantic-status-success-soft-text",
    "status-success-solid": "--semantic-status-success-strong-bg",
    "status-success-solid-text": "--semantic-status-strong-text",
    "status-info-bg": "--semantic-status-info-soft-bg",
    "status-info-border": "--semantic-status-info-soft-border",
    "status-info-text": "--semantic-status-info-soft-text",
    "status-info-solid": "--semantic-status-info-strong-bg",
    "status-info-solid-text": "--semantic-status-strong-text",
    "status-neutral-bg": "--semantic-status-neutral-soft-bg",
    "status-neutral-border": "--semantic-status-neutral-soft-border",
    "status-neutral-text": "--semantic-status-neutral-soft-text",
    "status-neutral-solid": "--semantic-status-neutral-strong-bg",
    "status-neutral-solid-text": "--semantic-status-neutral-strong-text",
    "status-ai-bg": "--semantic-status-ai-soft-bg",
    "status-ai-border": "--semantic-status-ai-soft-border",
    "status-ai-text": "--semantic-status-ai-soft-text",
    "status-ai-solid": "--semantic-status-ai-strong-bg",
    "status-ai-solid-text": "--semantic-status-strong-text",
    "accent-indicator": "--semantic-accent-indicator",
    "accent-emphasis": "--semantic-text-primary",
  };
  const out = [];
  for (const [suffix, semanticName] of Object.entries(map)) {
    const val = semanticName.startsWith("--")
      ? semanticLookup(pack, semanticName)
      : semanticName;
    if (!val) continue;
    out.push([`${prefix}${suffix}`, val]);
  }
  // inverse text — light uses white, dark uses ink
  if (prefix.includes("light")) {
    out.push([`${prefix}text-inverse`, semanticLookup(primitiveColors, "--neutral-0") || "0 0% 100%"]);
  } else {
    out.push([
      `${prefix}text-inverse`,
      semanticLookup(primitiveColors, "--neutral-950") || "45 17.4% 9%",
    ]);
  }
  return out;
}

const LIGHT_LEGACY_ABS = buildLegacyAbsolute("--vwo-light-", lightSemantic);
const DARK_LEGACY_ABS = buildLegacyAbsolute("--vwo-dark-", darkSemantic);

/**
 * App / shadcn roles — every value is a semantic (or primitive) token from the pack.
 * Mode switching redefines --semantic-* under [data-mode], so these stay stable.
 */
const APP_ROLE_BRIDGE = {
  "--background": "var(--semantic-bg-surface)",
  "--foreground": "var(--semantic-text-primary)",
  "--card": "var(--semantic-bg-surface-raised)",
  "--card-foreground": "var(--semantic-text-primary)",
  "--popover": "var(--semantic-bg-surface-raised)",
  "--popover-foreground": "var(--semantic-text-primary)",

  "--primary": "var(--semantic-accent-selected-bg)",
  "--primary-foreground": "var(--semantic-accent-selected-text)",
  "--primary-hover": "var(--semantic-accent-selected-hover)",
  "--primary-active": "var(--semantic-accent-selected-hover)",
  "--primary-subtle": "var(--semantic-accent-field-hover)",
  "--primary-border": "var(--semantic-accent-selected-edge)",

  "--control": "var(--semantic-accent-selected-bg)",
  "--control-foreground": "var(--semantic-accent-selected-text)",
  "--control-border": "var(--semantic-accent-selected-edge)",
  "--control-selected-bg": "var(--semantic-accent-selected-bg)",
  "--control-selected-fg": "var(--semantic-accent-selected-text)",
  "--control-selected-border": "var(--semantic-accent-selected-edge)",

  "--secondary": "var(--semantic-context-on-surface-hover)",
  "--secondary-foreground": "var(--semantic-text-primary)",
  "--secondary-hover": "var(--semantic-context-on-surface-active)",

  "--muted": "var(--semantic-bg-canvas)",
  "--muted-foreground": "var(--semantic-text-secondary)",
  "--canvas": "var(--semantic-bg-canvas)",
  "--surface": "var(--semantic-bg-canvas)",

  "--accent": "var(--semantic-bg-selected)",
  "--accent-foreground": "var(--semantic-text-primary)",
  "--selected-bg": "var(--semantic-bg-selected)",
  "--selected-fg": "var(--semantic-text-primary)",

  "--link": "var(--semantic-text-link)",
  "--link-hover": "var(--semantic-text-link-hover)",
  "--brand-deep": "var(--semantic-text-primary)",

  /* Borders — pack semantics only */
  "--border": "var(--semantic-border-subtle)",
  "--input": "var(--semantic-border-strong)",
  "--ring": "var(--semantic-border-focus)",
  "--surface-border": "var(--semantic-border-subtle)",
  "--panel-border": "var(--semantic-border-subtle)",

  "--destructive": "var(--semantic-action-destructive-bg)",
  "--destructive-foreground": "var(--semantic-action-destructive-text)",

  "--rail": "var(--semantic-bg-surface)",
  "--rail-foreground": "var(--semantic-text-primary)",
  "--rail-active": "var(--semantic-action-primary-bg)",
  "--rail-active-foreground": "var(--semantic-action-primary-text)",
  "--panel": "var(--semantic-bg-surface)",
  "--panel-foreground": "var(--semantic-text-primary)",

  "--success-fg": "var(--semantic-status-success-soft-text)",
  "--success-bg": "var(--semantic-status-success-soft-bg)",
  "--success-solid": "var(--semantic-status-success-strong-bg)",
  "--danger-fg": "var(--semantic-status-error-soft-text)",
  "--danger-bg": "var(--semantic-status-error-soft-bg)",
  "--warning-fg": "var(--semantic-status-warning-soft-text)",
  "--warning-bg": "var(--semantic-status-warning-soft-bg)",
  "--warning-solid": "var(--semantic-status-warning-strong-bg)",
  "--info-fg": "var(--semantic-status-info-soft-text)",
  "--info-bg": "var(--semantic-status-info-soft-bg)",
  "--highlight-fg": "var(--semantic-status-ai-soft-text)",
  "--highlight-bg": "var(--semantic-status-ai-soft-bg)",

  "--cta-tertiary-bg": "var(--semantic-action-tertiary-bg)",
  "--cta-tertiary-fg": "var(--semantic-text-primary)",
  "--cta-tertiary-border": "var(--semantic-border-subtle)",
  "--cta-tertiary-hover": "var(--semantic-action-tertiary-bg-hover)",
  "--cta-ai-bg": "var(--semantic-action-ai-bg)",
  "--cta-ai-fg": "var(--semantic-action-ai-text)",
  "--cta-ai-hover": "var(--semantic-action-ai-bg-hover)",
  "--cta-disabled-bg": "var(--semantic-bg-disabled)",
  "--cta-disabled-fg": "var(--semantic-text-disabled)",
  "--cta-secondary-fg": "var(--semantic-action-secondary-text)",

  "--chart-1": "var(--semantic-chart-1)",
  "--chart-2": "var(--semantic-chart-2)",
  "--chart-3": "var(--semantic-chart-3)",
  "--chart-4": "var(--semantic-chart-4)",
  "--chart-5": "var(--semantic-chart-5)",
  "--chart-6": "var(--semantic-chart-6)",
  "--chart-7": "var(--semantic-chart-7)",
  "--chart-8": "var(--semantic-chart-8)",
};

const parts = [];
parts.push(`/*
 * AUTO-GENERATED — do not edit by hand.
 * Source: src/config/tokens/figma/
 * Regenerate: node scripts/generate-wingify-tokens.mjs
 *
 * Color values are hex (#RRGGBB / #RRGGBBAA). Use as var(--token).
 * App roles resolve only through --semantic-* (and primitive) tokens.
 */\n`);

parts.push(
  block(
    ":root",
    [...primitiveColors, ...overlayColors, ...primitiveDims, ...componentDims],
    "1 · Primitives + overlays + component dimensions"
  )
);

parts.push(
  block(
    ':root,\n[data-mode="light"]',
    [...lightSemantic, ...onCanvasColors, ...onSurfaceColors],
    "2 · Semantic Light (+ on-canvas / on-surface context packs)"
  )
);

parts.push(
  block('[data-mode="dark"]', darkSemantic, "2 · Semantic Dark")
);

parts.push(
  block(
    ":root",
    [...vwoNeutralAliases, ...vwoFamilyAliases, ...LIGHT_LEGACY_ABS, ...DARK_LEGACY_ABS],
    "Legacy --vwo-* = absolute copies from light/dark semantic packs"
  )
);

parts.push(
  block(
    ':root,\n[data-mode="light"],\n[data-mode="dark"]',
    Object.entries(APP_ROLE_BRIDGE),
    "App / shadcn roles ← semantic tokens only"
  )
);

const COMPAT_SHADES = [
  ["--vwo-yellow-50", "var(--yellow-accent)"],
  ["--vwo-yellow-100", "var(--yellow-accent-hover)"],
  ["--vwo-yellow-200", "var(--yellow-accent-hover)"],
  ["--vwo-yellow-300", "var(--yellow-deep)"],
  ["--vwo-yellow-400", "var(--yellow-deep)"],
  ["--vwo-yellow-500", "var(--yellow-deep)"],
  ["--vwo-yellow-700", "var(--yellow-field-shade)"],
  ["--vwo-cherry-50", "var(--cherry-100)"],
  ["--vwo-cherry-400", "var(--cherry-500)"],
  ["--vwo-cherry-800", "var(--cherry-900)"],
  ["--vwo-amber-50", "var(--amber-100)"],
  ["--vwo-amber-200", "var(--amber-100)"],
  ["--vwo-amber-400", "var(--amber-300)"],
  ["--vwo-amber-600", "var(--amber-500)"],
  ["--vwo-green-50", "var(--green-100)"],
  ["--vwo-green-400", "var(--green-300)"],
  ["--vwo-green-600", "var(--green-500)"],
  ["--vwo-green-800", "var(--green-700)"],
  ["--vwo-ocean-50", "var(--ocean-100)"],
  ["--vwo-ocean-400", "var(--ocean-500)"],
  ["--vwo-berry-50", "var(--berry-100)"],
  ["--vwo-berry-400", "var(--berry-500)"],
  ["--vwo-maroon-50", "var(--maroon-200)"],
  ["--vwo-maroon-300", "var(--maroon-200)"],
  ["--vwo-maroon-400", "var(--maroon-500)"],
  ["--vwo-maroon-600", "var(--maroon-500)"],
  ["--vwo-midnight-base", "#1E2124"],
];

parts.push(
  block(":root", COMPAT_SHADES, "Compat aliases for thinned primitive ramps")
);

fs.writeFileSync(outFile, parts.join("\n"));
console.log(
  `Wrote ${outFile}\n` +
    `  primitives: ${primitiveColors.length} colors, ${primitiveDims.length} dims\n` +
    `  overlays: ${overlayColors.length}\n` +
    `  component dims: ${componentDims.length}\n` +
    `  semantic light/dark: ${lightSemantic.length}/${darkSemantic.length}`
);
